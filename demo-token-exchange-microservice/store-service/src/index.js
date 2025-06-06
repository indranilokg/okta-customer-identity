const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const axios = require('axios');
const OktaJwtVerifier = require('@okta/jwt-verifier');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Okta configuration
const OKTA_DOMAIN = process.env.OKTA_DOMAIN || 'https://dev-123456.okta.com';
const OKTA_AUDIENCE = process.env.OKTA_AUDIENCE || 'api://default';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002';
const PAYMENT_AUDIENCE = process.env.PAYMENT_AUDIENCE || 'api://payment-service';

// Initialize JWT verifier
const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `https://${OKTA_DOMAIN}/oauth2/${process.env.OKTA_AUTH_SERVER_ID}`,
  clientId: process.env.CLIENT_ID,
  assertClaims: {
    aud: OKTA_AUDIENCE
  }
});

// JWT verification middleware
const checkJwt = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = await oktaJwtVerifier.verifyAccessToken(token, OKTA_AUDIENCE);
    req.auth = jwt.claims;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Scope validation middleware
const validateScopes = (requiredScopes) => {
  return (req, res, next) => {
    try {
      const tokenScopes = req.auth.scp || req.auth.scope || [];
      const scopes = Array.isArray(tokenScopes) ? tokenScopes : tokenScopes.split(' ');
      
      const hasRequiredScopes = requiredScopes.every(scope => 
        scopes.includes(scope)
      );

      if (!hasRequiredScopes) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: requiredScopes,
          provided: scopes
        });
      }
      next();
    } catch (error) {
      console.error('Scope validation error:', error);
      return res.status(500).json({ message: 'Error validating scopes' });
    }
  };
};

// Protected routes - require valid JWT
app.use('/api', checkJwt);

// Sample product data
const products = [
  {
    id: 1,
    name: "Acme Widget",
    price: 29.99,
    description: "A fantastic widget for all your needs",
    category: "Widgets"
  },
  {
    id: 2,
    name: "Super Gadget",
    price: 49.99,
    description: "The latest and greatest gadget",
    category: "Gadgets"
  }
];

// In-memory order storage
const orders = [];

// Token exchange function
async function exchangeToken(subjectToken) {
  try {
    const tokenUrl = `https://${OKTA_DOMAIN}/oauth2/${process.env.PAYMENT_AUTH_SERVER_ID}/v1/token`;
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token: subjectToken,
      audience: PAYMENT_AUDIENCE,
      scope: 'payments:manage payments:view'
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${process.env.STORE_CLIENT_ID}:${process.env.STORE_CLIENT_SECRET}`).toString('base64')}`
    };

    console.log('\n🔑 Initiating token exchange for Payment API...');
    console.log('\nSource Token:');
    console.log('-------------');
    console.log(subjectToken);
    console.log('\nSource Token Claims:');
    console.log('-------------------');
    console.log(JSON.parse(Buffer.from(subjectToken.split('.')[1], 'base64').toString()));

    const response = await axios.post(tokenUrl, params, { headers });
    
    console.log('\n✅ Token exchange successful!');
    console.log('\nTarget Token:');
    console.log('-------------');
    console.log(response.data.access_token);
    console.log('\nTarget Token Claims:');
    console.log('-------------------');
    console.log(JSON.parse(Buffer.from(response.data.access_token.split('.')[1], 'base64').toString()));
    
    return response.data.access_token;
  } catch (error) {
    console.error('\n❌ Token exchange failed:', error.response?.data || error.message);
    throw new Error('Failed to exchange token');
  }
}

// Routes
app.get('/api/products', validateScopes(['store:view']), (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', validateScopes(['store:view']), (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Get all orders
app.get('/api/orders', validateScopes(['store:view']), (req, res) => {
  const userOrders = orders.filter(order => order.userId === req.auth.sub);
  res.json(userOrders);
});

// Get specific order
app.get('/api/orders/:id', validateScopes(['store:view']), (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (order.userId !== req.auth.sub) {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  res.json(order);
});

// Create new order and process payment
app.post('/api/orders', validateScopes(['store:purchase']), async (req, res) => {
  let order = null;
  try {
    const { items } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    // Create order object
    order = {
      id: Date.now(),
      items,
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      createdAt: new Date(),
      userId: req.auth.sub
    };

    // Store the order
    orders.push(order);

    // Exchange token for payment service
    const subjectToken = authHeader.split(' ')[1];
    const paymentToken = await exchangeToken(subjectToken);

    // Process payment
    const paymentResponse = await axios.post(
      `${PAYMENT_SERVICE_URL}/api/payments`,
      {
        orderId: order.id,
        amount: order.total,
        currency: 'USD',
        paymentMethod: 'credit_card'
      },
      {
        headers: {
          'Authorization': `Bearer ${paymentToken}`
        }
      }
    );

    // Update order status
    order.status = 'completed';
    order.paymentId = paymentResponse.data.id;

    res.status(201).json(order);
  } catch (error) {
    console.error('Error processing order:', error);
    // If payment fails, update order status
    if (order) {
      order.status = 'failed';
      order.error = error.response?.data?.message || 'Payment processing failed';
    }
    res.status(500).json({ 
      message: 'Error processing order',
      error: error.response?.data?.message || error.message
    });
  }
});

// Update order status
app.patch('/api/orders/:id', validateScopes(['store:purchase']), (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.userId !== req.auth.sub) {
    return res.status(403).json({ message: 'Not authorized to update this order' });
  }

  order.status = status;
  res.json(order);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Store service running on port ${PORT}`);
  console.log(`Payment service URL: ${PAYMENT_SERVICE_URL}`);
}); 