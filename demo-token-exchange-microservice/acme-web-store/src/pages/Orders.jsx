import React, { useEffect, useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Container, Header, Table, Label, Message, Loader } from 'semantic-ui-react';
import { storeApiService } from '../services/api';

const Orders = () => {
  const { authState } = useOktaAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await storeApiService.getOrders();
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authState?.isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [authState]);

  if (loading) {
    return (
      <Container text>
        <Loader active size="large">Loading orders...</Loader>
      </Container>
    );
  }

  if (error) {
    return (
      <Container text>
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      </Container>
    );
  }

  if (!authState?.isAuthenticated) {
    return (
      <Container text>
        <Message warning>
          <Message.Header>Authentication Required</Message.Header>
          <p>Please log in to view your orders.</p>
        </Message>
      </Container>
    );
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <Container text>
        <Message info>
          <Message.Header>No orders found</Message.Header>
          <p>You haven't placed any orders yet.</p>
        </Message>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'grey';
    }
  };

  return (
    <Container>
      <Header as="h1">Your Orders</Header>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Order ID</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Items</Table.HeaderCell>
            <Table.HeaderCell>Total</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {orders.map((order) => (
            <Table.Row key={order.id}>
              <Table.Cell>{order.id}</Table.Cell>
              <Table.Cell>{new Date(order.createdAt).toLocaleDateString()}</Table.Cell>
              <Table.Cell>
                {Array.isArray(order.items) && order.items.map((item) => (
                  <div key={item.id}>
                    {item.name} x {item.quantity}
                  </div>
                ))}
              </Table.Cell>
              <Table.Cell>${order.total.toFixed(2)}</Table.Cell>
              <Table.Cell>
                <Label color={getStatusColor(order.status)}>
                  {order.status}
                </Label>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

export default Orders; 