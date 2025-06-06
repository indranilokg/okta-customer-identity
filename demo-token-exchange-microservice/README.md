# Token Exchange Demo Application

This repository demonstrates the implementation of [RFC 8693](https://datatracker.ietf.org/doc/html/rfc8693) Token Exchange using [Okta as the authorization server](https://developer.okta.com/docs/guides/set-up-token-exchange/main/). The application consists of a frontend e-commerce store, a store service for order management, and a payment service for processing payments.

## Prerequisites

* Node.js (v16 or later)
* npm (v8 or later)
* Okta Developer Account
* Okta CLI (optional, for quick setup)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/token-exchange.git
cd token-exchange
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd acme-web-store
npm install

# Install store service dependencies
cd ../acme-store-service
npm install

# Install payment service dependencies
cd ../acme-payment-service
npm install
```

## Okta Configuration

### 1. Create Okta Application

1. Log in to your Okta Developer Console
2. Navigate to Applications > Applications
3. Click "Add Application"
4. Select "Single Page Application"
5. Configure the application:
   * Name: `acme-web-store`
   * Base URIs: `http://localhost:3000`
   * Login redirect URIs: `http://localhost:3000/login/callback`
   * Logout redirect URIs: `http://localhost:3000`

### 2. Configure Service Applications

1. Create Store Service Application:
   * Type: Service
   * Name: `acme-store-service`
   * Grant Types: `token-exchange`, `client_credentials`

2. Create Payment Service Application:
   * Type: Service
   * Name: `acme-payment-service`
   * Grant Types: `client_credentials`

### 3. Configure Authorization Servers

1. Create Store Service Authorization Server:
   * Name: `store-auth-server`
   * Audience: `com.api.store.acme`
   * Scopes: 
     * `store:view`
     * `store:purchase`
   * Access Policy: "Access Store API"
     * Assigned to: `acme-web-store` application
     * Restricted to scopes: `openid`, `store:view`, `store:purchase`
     * Grant Type: Authorization Code only

2. Create Payment Service Authorization Server:
   * Name: `payment-auth-server`
   * Audience: `com.api.payment.acme`
   * Scopes:
     * `payments:view`
     * `payments:manage`
   * Trusted Service: `store-auth-server`
   * Access Policy: "Access payments API"
     * Assigned to: `acme-store-service` service app
     * Restricted to scopes: `payments:view`, `payments:manage`
     * Grant Type: Token Exchange only

## Environment Configuration

### 1. Frontend (.env)
```env
VITE_OKTA_DOMAIN=your-okta-domain
VITE_OKTA_AUTH_SERVER_ID=default
VITE_OKTA_CLIENT_ID=your-client-id
VITE_STORE_SERVICE_URL=http://localhost:3001
VITE_PAYMENT_SERVICE_URL=http://localhost:3002
```

### 2. Store Service (.env)
```env
PORT=3001
OKTA_DOMAIN=your-okta-domain
OKTA_AUTH_SERVER_ID=store-auth-server-id
OKTA_AUDIENCE=com.api.store.acme
STORE_CLIENT_ID=your-client-id
STORE_CLIENT_SECRET=your-client-secret
PAYMENT_SERVICE_URL=http://localhost:3002
PAYMENT_AUTH_SERVER_ID=payment-auth-server-id
PAYMENT_AUDIENCE=com.api.payment.acme
```

### 3. Payment Service (.env)
```env
PORT=3002
OKTA_DOMAIN=your-okta-domain
OKTA_AUDIENCE=com.api.payment.acme
PAYMENT_AUTH_SERVER_ID=your-auth-server-id
PAYMENT_CLIENT_ID=your-client-id
```

## Running the Application

### 1. Start Frontend
```bash
cd acme-web-store
npm start
```

### 2. Start Store Service
```bash
cd acme-store-service
npm start
```

### 3. Start Payment Service
```bash
cd acme-payment-service
npm start
```

## Running Services Locally

### 1. Start All Services
You can start all services in separate terminal windows:

Terminal 1 (Frontend):
```bash
cd acme-web-store
npm start
```

Terminal 2 (Store Service):
```bash
cd acme-store-service
npm start
```

Terminal 3 (Payment Service):
```bash
cd acme-payment-service
npm start
```

### 2. Verify Services
Once all services are running, you can verify they're working correctly:

1. Frontend should be accessible at: `http://localhost:3000`
2. Store Service API should be accessible at: `http://localhost:3001`
3. Payment Service API should be accessible at: `http://localhost:3002`

### 3. Testing the Flow
1. Open `http://localhost:3000` in your browser
2. Log in using your Okta credentials
3. Browse products and add items to cart
4. Complete a purchase to test the token exchange flow between services