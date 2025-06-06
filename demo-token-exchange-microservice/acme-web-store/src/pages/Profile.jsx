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

import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Header, Icon, Table, Segment, Button } from 'semantic-ui-react';

const Profile = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!authState || !authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      setUserInfo(authState.idToken.claims);
    }
  }, [authState, oktaAuth]); // Update if authState changes

  if (!userInfo) {
    return (
      <div>
        <p>Fetching user profile...</p>
      </div>
    );
  }

  const idToken = authState.idToken.idToken;
  const accessToken = authState.accessToken.accessToken;

  return (
    <div>
      <div>
        <Header as="h1">
          <Icon name="drivers license" />
          {' '}
          My User Profile (ID Token Claims)
          {' '}
        </Header>
        <p>
          Below is the information from your ID token which was obtained during the &nbsp;
          <a href="https://developer.okta.com/docs/guides/implement-auth-code-pkce">PKCE Flow</a>
          {' '}
          and is now stored in local storage.
        </p>
        <Table>
          <thead>
            <tr>
              <th>Claim</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(userInfo).map((claimEntry) => {
              const claimName = claimEntry[0];
              const claimValue = claimEntry[1];
              const claimId = `claim-${claimName}`;
              return (
                <tr key={claimName}>
                  <td>{claimName}</td>
                  <td id={claimId}>{claimValue.toString()}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <Header as="h2" style={{ marginTop: '2em' }}>
          <Icon name="key" />
          {' '}
          JWT Tokens
        </Header>
        <p>
          Below are your ID Token and Access Token in JWT format. Click the buttons to view them in jwt.io.
        </p>

        <Segment>
          <Header as="h3">ID Token</Header>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '1em', 
            borderRadius: '4px',
            overflow: 'auto',
            wordBreak: 'break-all'
          }}>
            {idToken}
          </pre>
          <Button 
            primary 
            as="a" 
            href={`https://jwt.io/#debugger-io?token=${idToken}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in jwt.io
          </Button>
        </Segment>

        <Segment>
          <Header as="h3">Access Token</Header>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '1em', 
            borderRadius: '4px',
            overflow: 'auto',
            wordBreak: 'break-all'
          }}>
            {accessToken}
          </pre>
          <Button 
            primary 
            as="a" 
            href={`https://jwt.io/#debugger-io?token=${accessToken}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in jwt.io
          </Button>
        </Segment>
      </div>
    </div>
  );
};

export default Profile;
