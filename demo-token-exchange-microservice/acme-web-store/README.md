# Okta React + Okta Hosted Login Example

This example shows how to use the [Okta React Library][] and [React Router](https://github.com/ReactTraining/react-router) to login a user to a React application.  The login is achieved through the [PKCE Flow][], where the user is redirected to the Okta-Hosted login page.  After the user authenticates they are redirected back to the application with an ID token and access token.

## Create an Okta Integration for your app

1. Sign in to your [Okta organization](https://developer.okta.com/login/) with your administrator account
2. Click **Admin** in the upper-right corner
3. Open the Applications page by selecting **Applications** > **Applications**
4. Click **Create App Integration**
5. Select a **Sign-in method** of **OIDC - OpenID Connect**
6. Select an **Application type** of **Single-Page Application**, then click **Next**
7. Enter an **App integration name**
8. Select **Authorization Code** and **Refresh Token** as the **Grant type**
9. Enter the following URIs:
   * **Redirect URI**: `http://localhost:3000/login/callback`
   * **Post Logout Redirect URI**: `http://localhost:3000`
10. Select the type of **Controlled access** for your app in the **Assignments** section
11. Click **Save**

### Enable Refresh Tokens

1. On the **General** tab, scroll to **General Settings** and click **Edit**
2. Verify that the **Refresh Token** is selected as a **Grant type**
3. In the **Refresh Token** section, refresh token rotation is automatically set as the default refresh token behavior
4. Click **Save**

### Enable Trusted Origins

1. Go to **Security** > **API**
2. Select the **Trusted Origins** tab
3. Add the following as trusted origins:
   * `http://localhost:3000`

## Get the Code

1. Clone the repository:

   ```bash
   git clone https://github.com/indranilokg/okta-customer-identity.git
   ```

2. Navigate to the React app directory:

   ```bash
   cd okta-customer-identity/bolierplates/base-redirect-react-app
   ```

3. Remove the rest of the repository

## Configure Environment Variables

1. Copy the `.okta.env.template` file to create `.okta.env`:

   ```bash
   cp .okta.env.template .okta.env
   ```

2. Update the `.okta.env` file with your Okta configuration:

   ```
   ISSUER=https://your-org.okta.com/oauth2/default
   CLIENT_ID=your-client-id
   ```

   Replace:
   - `your-org.okta.com` with your Okta domain
   - `your-client-id` with the Client ID from your Okta application

## Run the Example

To run this application, install its dependencies:

```bash
npm ci
```

With variables set, start your app:

```bash
npm start
```

Navigate to http://localhost:3000 in your browser.

If you see a home page that prompts you to login, then things are working!  Clicking the **Log in** button will redirect you to the Okta hosted sign-in page.

You can sign in with the same account that you created when signing up for your Developer Org, or you can use a known username and password from your Okta Directory.

> **Note:** If you are currently using your Developer Console, you already have a Single Sign-On (SSO) session for your Org.  You will be automatically logged into your application as the same user that is using the Developer Console.  You may want to use an incognito tab to test the flow from a blank slate.

[Okta React Library]: https://github.com/okta/okta-react
[PKCE Flow]: https://developer.okta.com/docs/guides/implement-auth-code-pkce
