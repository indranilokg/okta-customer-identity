import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, Grid, Header, Icon, Message, Segment } from 'semantic-ui-react';
import { storeApiService } from '../services/api';
import { useCart } from '../context/CartContext';
import TokenExchangeDebug from '../components/TokenExchangeDebug';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugError, setDebugError] = useState(null);
  const [tokenFlow, setTokenFlow] = useState({
    frontendToken: null,
    exchangedToken: null,
    paymentToken: null
  });

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setDebugError(null);

      // Get frontend token
      const frontendToken = localStorage.getItem('okta-token-storage');
      let parsedFrontendToken = null;
      try {
        parsedFrontendToken = JSON.parse(frontendToken);
      } catch (e) {
        console.error('Error parsing frontend token:', e);
      }

      // Create order
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Make API call and capture response headers
      const response = await storeApiService.createOrder(orderData);
      
      // Update token flow
      setTokenFlow({
        frontendToken: parsedFrontendToken?.accessToken?.accessToken,
        exchangedToken: response.headers['x-exchanged-token'],
        paymentToken: response.headers['x-payment-token']
      });

      // Clear cart and redirect to orders page
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.message || 'Failed to process order');
      setDebugError(error.response?.data?.message || 'Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <Container text style={{ marginTop: '2em' }}>
        <Message info>
          <Message.Header>Your cart is empty</Message.Header>
          <p>Add some products to your cart to continue shopping.</p>
        </Message>
        <Button primary onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '2em' }}>
      <Header as="h1">Shopping Cart</Header>
      
      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      <Grid>
        <Grid.Row>
          <Grid.Column width={12}>
            {items.map(item => (
              <Card key={item.id} fluid style={{ marginBottom: '1em' }}>
                <Card.Content>
                  <Card.Header>{item.name}</Card.Header>
                  <Card.Meta>${item.price.toFixed(2)}</Card.Meta>
                  <Card.Description>
                    <Button.Group size="small">
                      <Button 
                        icon 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Icon name="minus" />
                      </Button>
                      <Button.Or text={item.quantity} />
                      <Button 
                        icon 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Icon name="plus" />
                      </Button>
                    </Button.Group>
                    <Button 
                      color="red" 
                      size="small" 
                      floated="right"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </Card.Description>
                </Card.Content>
              </Card>
            ))}
          </Grid.Column>
          
          <Grid.Column width={4}>
            <Segment>
              <Header as="h3">Order Summary</Header>
              <p><strong>Total Items:</strong> {items.length}</p>
              <p><strong>Total Amount:</strong> ${total.toFixed(2)}</p>
              <Button 
                primary 
                fluid 
                onClick={handleCheckout}
                loading={isProcessing}
                disabled={isProcessing}
              >
                Proceed to Checkout
              </Button>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={16}>
            <TokenExchangeDebug 
              isDebugMode={isDebugMode}
              onToggleDebug={() => setIsDebugMode(!isDebugMode)}
              tokenFlow={tokenFlow}
            />
            {debugError && (
              <Message negative>
                <Message.Header>Debug Error</Message.Header>
                <p>{typeof debugError === 'string' ? debugError : debugError.message}</p>
                {debugError.details && <p>{debugError.details}</p>}
              </Message>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default Cart; 