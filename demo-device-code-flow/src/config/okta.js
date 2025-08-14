// Okta Configuration
// Replace these values with your actual Okta configuration
export const oktaConfig = {
  issuer: process.env.REACT_APP_OKTA_ISSUER || 'https://ijtestcustom.oktapreview.com/oauth2/default',
  clientId: process.env.REACT_APP_OKTA_CLIENT_ID || '0oap5k91umQIFrHgT1d7', // demo-device-code-flow app
  redirectUri: process.env.REACT_APP_REDIRECT_URI || `${window.location.origin}/callback`,
  scopes: ['openid', 'profile', 'offline_access'],
  pkce: true,
  disableHttpsCheck: false
};

// Determine if we're in production (deployed on Vercel)
const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost';

// Device authorization endpoints
export const deviceAuthEndpoints = {
  authorize: isProduction 
    ? '/api/okta/v1/device/authorize'
    : `${oktaConfig.issuer}/v1/device/authorize`,
  token: isProduction 
    ? '/api/okta/v1/token'
    : `${oktaConfig.issuer}/v1/token`,
  revoke: isProduction 
    ? '/api/okta/v1/revoke'
    : `${oktaConfig.issuer}/v1/revoke`,
  userinfo: isProduction 
    ? '/api/okta/v1/userinfo'
    : `${oktaConfig.issuer}/v1/userinfo`
}; 