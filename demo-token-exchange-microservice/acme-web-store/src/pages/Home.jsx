/*
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Container, Header, Button, Grid, Icon, Segment, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { authState, oktaAuth } = useOktaAuth();

  const handleLogin = () => {
    oktaAuth.signInWithRedirect();
  };

  const features = [
    {
      title: 'Browse Products',
      description: 'Explore our wide range of products and find what you need.',
      icon: 'shopping bag',
      link: '/products'
    },
    {
      title: 'Secure Checkout',
      description: 'Enjoy a safe and secure shopping experience with our payment system.',
      icon: 'credit card',
      link: '/cart'
    },
    {
      title: 'Order History',
      description: 'Track your orders and view your purchase history.',
      icon: 'history',
      link: '/orders'
    }
  ];

  return (
    <Container style={{ marginTop: '2em' }}>
      <Segment basic textAlign="center">
        <Header as="h1" size="huge" style={{ marginBottom: '1em' }}>
          Welcome to Acme Web Store
        </Header>
        <Header as="h3" style={{ fontWeight: 'normal', color: '#666' }}>
          Your one-stop shop for all your needs. Browse our products, add them to your cart,
          and enjoy a seamless shopping experience.
        </Header>
        {!authState?.isAuthenticated && (
          <Button
            primary
            size="huge"
            onClick={handleLogin}
            style={{ marginTop: '1em' }}
          >
            Get Started
          </Button>
        )}
      </Segment>

      <Grid columns={3} stackable>
        {features.map((feature, index) => (
          <Grid.Column key={index}>
            <Segment raised padded="very" textAlign="center">
              <Icon name={feature.icon} size="huge" color="blue" style={{ marginBottom: '1em' }} />
              <Header as="h3">{feature.title}</Header>
              <p style={{ color: '#666', marginBottom: '1em' }}>{feature.description}</p>
              <Button as={Link} to={feature.link} primary>
                Learn More
              </Button>
            </Segment>
          </Grid.Column>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
