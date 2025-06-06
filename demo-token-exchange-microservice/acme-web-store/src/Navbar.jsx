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
import { Link, useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { Menu, Container, Button, Icon, Image } from 'semantic-ui-react';
import { useCart } from './context/CartContext';
import logo from './assets/logo.svg';

const Navbar = () => {
  const navigate = useNavigate();
  const { authState, oktaAuth } = useOktaAuth();
  const { items } = useCart();

  const handleLogin = () => {
    oktaAuth.signInWithRedirect();
  };

  const handleLogout = () => {
    oktaAuth.signOut();
  };

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Menu fixed="top" inverted>
      <Container>
        <Menu.Item as={Link} to="/" header>
          <Image src={logo} size="mini" style={{ marginRight: '1em' }} />
          Acme Store
        </Menu.Item>

        <Menu.Item as={Link} to="/products">
          <Icon name="shopping bag" />
          Products
        </Menu.Item>

        {authState?.isAuthenticated && (
          <>
            <Menu.Item as={Link} to="/orders">
              <Icon name="history" />
              Orders
            </Menu.Item>
            <Menu.Item as={Link} to="/profile">
              <Icon name="user" />
              Profile
            </Menu.Item>
          </>
        )}

        <Menu.Menu position="right">
          <Menu.Item as={Link} to="/cart">
            <Icon name="shopping cart" />
            Cart
            {cartItemsCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  transform: 'translate(50%, -50%)'
                }}
              >
                {cartItemsCount}
              </div>
            )}
          </Menu.Item>

          {authState?.isAuthenticated ? (
            <Menu.Item onClick={handleLogout}>
              <Icon name="sign out" />
              Logout
            </Menu.Item>
          ) : (
            <Menu.Item onClick={handleLogin}>
              <Icon name="sign in" />
              Login
            </Menu.Item>
          )}
        </Menu.Menu>
      </Container>
    </Menu>
  );
};

export default Navbar;
