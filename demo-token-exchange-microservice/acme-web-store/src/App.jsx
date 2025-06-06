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
import { useNavigate } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';
import { Container } from 'semantic-ui-react';
import Navbar from './Navbar';
import Routes from './components/Routes';
import { CartProvider } from './context/CartContext';

const oktaConfig = {
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  issuer: `https://${import.meta.env.VITE_OKTA_DOMAIN}/oauth2/${import.meta.env.VITE_OKTA_AUTH_SERVER_ID}`,
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'store:view', 'store:purchase'],
  pkce: true,
  tokenManager: {
    storage: 'localStorage'
  }
};

// Debug environment variables
console.log('Environment Variables:', {
  domain: import.meta.env.VITE_OKTA_DOMAIN,
  authServerId: import.meta.env.VITE_OKTA_AUTH_SERVER_ID,
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  issuer: oktaConfig.issuer
});

const oktaAuth = new OktaAuth(oktaConfig);

const App = () => {
  const navigate = useNavigate();
  const restoreOriginalUri = (_oktaAuth, originalUri) => {
    navigate(toRelativeUrl(originalUri || '/', window.location.origin));
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
      <CartProvider>
        <div className="App">
          <Navbar />
          <Container style={{ marginTop: '7em', marginBottom: '2em' }}>
            <Routes />
          </Container>
        </div>
      </CartProvider>
    </Security>
  );
};

export default App;
