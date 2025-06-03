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

import { useOktaAuth } from '@okta/okta-react';
import React, { useState, useEffect } from 'react';
import { Button, Header } from 'semantic-ui-react';

const Home = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!authState || !authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      });
    }
  }, [authState, oktaAuth]); // Update if authState changes

  const login = async () => {
    await oktaAuth.signInWithRedirect();
  };

  if (!authState) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div>
      <div>
        <Header as="h1">PKCE Flow w/ Okta Hosted Login Page</Header>

        { authState.isAuthenticated && !userInfo
        && <div>Loading user information...</div>}

        {authState.isAuthenticated && userInfo
        && (
        <div>
          <p>
            Welcome back,&nbsp;
            {userInfo.name}
            !
          </p>
          <p>
            You have successfully authenticated against your Okta org, and have been redirected back to this application.  You now have an ID token and access token in local storage.
            Visit the
            {' '}
            <a href="/profile">My Profile</a>
            {' '}
            page to take a look inside the ID token.
          </p>
        </div>
        )}

        {!authState.isAuthenticated
        && (
          <div>
            <p>Please log in to access your profile.</p>
            <Button id="login-button" primary onClick={login}>Log in</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
