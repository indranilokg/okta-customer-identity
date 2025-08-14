# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Device not activated" Error

**Symptoms:**
- QR code displays correctly
- User completes authentication on mobile device
- Application shows "Device not activated" error

**Possible Causes & Solutions:**

#### A. CORS Issues
The browser is blocking requests to Okta due to CORS policy.

**Solution 1 - Use Chrome with CORS disabled (Development Only):**
```bash
# Close all Chrome instances first
# Then start Chrome with CORS disabled
open -n -a "Google Chrome" --args --user-data-dir=/tmp/chrome_dev_test --disable-web-security --disable-features=VizDisplayCompositor
```

**Solution 2 - Use Firefox (Development):**
Firefox is generally more permissive with CORS for localhost development.

**Solution 3 - Use the Proxy Server:**
```bash
# Terminal 1: Start React app
npm start

# Terminal 2: Start proxy server
node server.js
```
Then update `src/config/okta.js` to use proxy endpoints.

#### B. Application Assignment Issues
The user might not be assigned to the Okta application.

**Check Assignment:**
1. Go to Okta Admin Console
2. Navigate to Applications > Applications
3. Click on "demo-device-code-flow"
4. Go to Assignments tab
5. Ensure "Everyone" group is assigned or add specific users

#### C. Authorization Server Policy Issues
Device authorization might not be enabled in the authorization server policy.

**Check Policy:**
1. Go to Security > API > Authorization Servers
2. Select "default" authorization server
3. Go to Access Policies tab
4. Edit the policy rule
5. Ensure "Device Authorization" grant type is selected

### 2. QR Code Not Working

**Symptoms:**
- QR code appears but scanning doesn't work
- Mobile device can't read the code

**Solutions:**

#### A. Check QR Code URL
The QR code should contain a complete URL like:
```
https://ijtestcustom.oktapreview.com/activate?user_code=ABCD1234
```

#### B. Manual URL Entry
If QR code doesn't work, manually enter the verification URL and code:
1. Go to `https://ijtestcustom.oktapreview.com/activate`
2. Enter the user code displayed in the app

### 3. Polling Timeout

**Symptoms:**
- Authentication appears to complete on mobile
- Desktop app continues polling indefinitely
- Eventually times out

**Solutions:**

#### A. Check Network Console
1. Open browser developer tools (F12)
2. Go to Network tab
3. Look for failed requests to `/token` endpoint
4. Check error responses

#### B. Verify Application Configuration
Ensure the Okta application has:
- Grant Types: `authorization_code`, `refresh_token`, `urn:ietf:params:oauth:grant-type:device_code`
- Response Types: `code`
- Application Type: `native`
- Token Endpoint Auth Method: `none`
- PKCE Required: `true`

### 4. Invalid Client Error

**Symptoms:**
- Error: "invalid_client"
- Authentication fails immediately

**Solutions:**

#### A. Check Client ID
Verify the client ID in `src/config/okta.js` matches the Okta application:
```javascript
clientId: '0oap5k91umQIFrHgT1d7' // Should match your app
```

#### B. Check Application Status
Ensure the Okta application is ACTIVE, not INACTIVE.

### 5. Scope Issues

**Symptoms:**
- Authentication succeeds but user info fails
- Limited token permissions

**Solutions:**

#### A. Check Scopes
Ensure the following scopes are requested:
```javascript
scopes: ['openid', 'profile', 'offline_access']
```

#### B. Verify Scope Permissions
Check that the authorization server allows these scopes for the application.

## Development Setup Issues

### Node.js Version
Ensure you're using Node.js v14 or higher:
```bash
node --version
```

### Port Conflicts
If port 3000 is in use:
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

### Dependencies
Reinstall dependencies if needed:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Browser-Specific Issues

### Chrome
- Use incognito mode to avoid extension conflicts
- Disable CORS for development (not recommended for production)

### Safari
- Enable developer tools
- Check for private browsing restrictions

### Firefox
- Generally works well for localhost development
- Check for strict content security policies

## Mobile Device Issues

### QR Code Scanning
- Ensure good lighting
- Hold device steady
- Try different QR code apps if default camera doesn't work

### Network Issues
- Ensure mobile device is on same network (for localhost testing)
- Check if corporate firewalls block Okta domains

## Production Considerations

### HTTPS Requirement
Device code flow requires HTTPS in production:
- Use valid SSL certificates
- Update redirect URIs to use HTTPS

### Rate Limiting
Be aware of Okta rate limits:
- Don't poll too frequently
- Implement exponential backoff

### Error Handling
Implement proper error handling for:
- Network timeouts
- Token expiration
- User cancellation

## Getting Help

If you continue to experience issues:

1. Check browser console for detailed error messages
2. Review Okta system logs in Admin Console
3. Verify all configuration matches this guide
4. Test with a different browser or device
5. Contact Okta support with specific error details

## Useful Commands

```bash
# Start development environment
npm run dev

# Build for production
npm run build

# Start production server
npm run prod

# Check application logs
npm start 2>&1 | tee app.log
``` 