const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
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

// Initialize JWT verifier
const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `https://${OKTA_DOMAIN}/oauth2/${process.env.PAYMENT_AUTH_SERVER_ID}`,
  clientId: process.env.PAYMENT_CLIENT_ID,
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

// In-memory payment storage
const payments = [];

// Routes
app.post('/api/payments', checkJwt, validateScopes(['payments:manage']), (req, res) => {
  const { orderId, amount, currency, paymentMethod } = req.body;
  
  const payment = {
    id: Date.now(),
    orderId,
    amount,
    currency,
    paymentMethod,
    status: 'pending',
    createdAt: new Date(),
    userId: req.auth.sub
  };

  payments.push(payment);
  res.status(201).json(payment);
});

app.get('/api/payments/:id', checkJwt, validateScopes(['payments:view']), (req, res) => {
  const payment = payments.find(p => p.id === parseInt(req.params.id));
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  if (payment.userId !== req.auth.sub) {
    return res.status(403).json({ message: 'Not authorized to view this payment' });
  }
  res.json(payment);
});

app.post('/api/payments/:id/process', checkJwt, validateScopes(['payments:manage']), (req, res) => {
  const payment = payments.find(p => p.id === parseInt(req.params.id));
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  if (payment.userId !== req.auth.sub) {
    return res.status(403).json({ message: 'Not authorized to process this payment' });
  }

  // Simulate payment processing
  payment.status = 'completed';
  payment.processedAt = new Date();
  payment.transaction = {
    id: `tx_${Date.now()}`,
    status: 'success'
  };

  res.json(payment);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
}); 