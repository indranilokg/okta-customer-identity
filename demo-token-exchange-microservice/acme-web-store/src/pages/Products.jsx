import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, Image, Button, Header, Loader, Message } from 'semantic-ui-react';
import { useOktaAuth } from '@okta/okta-react';
import { useCart } from '../context/CartContext';
import { storeApiService } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();
  const { authState } = useOktaAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await storeApiService.getProducts();
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    if (authState?.isAuthenticated) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [authState]);

  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <Container style={{ marginTop: '2em' }}>
        <Loader active size="large">Loading products...</Loader>
      </Container>
    );
  }

  if (!authState?.isAuthenticated) {
    return (
      <Container style={{ marginTop: '2em' }}>
        <Message info>
          <Message.Header>Welcome to Acme Store!</Message.Header>
          <p>Please sign in to browse our products and start shopping.</p>
          <Button primary onClick={() => authState?.signInWithRedirect()}>
            Sign In
          </Button>
        </Message>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ marginTop: '2em' }}>
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '2em' }}>
      <Header as="h1">Products</Header>
      <Grid columns={3} stackable>
        {products.map((product) => (
          <Grid.Column key={product.id}>
            <Card>
              <Image src={product.image} wrapped ui={false} />
              <Card.Content>
                <Card.Header>{product.name}</Card.Header>
                <Card.Meta>${product.price.toFixed(2)}</Card.Meta>
                <Card.Description>{product.description}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button
                  fluid
                  primary
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </Card.Content>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
    </Container>
  );
};

export default Products; 