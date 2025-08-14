# Quick Deployment Fix

## Common Vercel Deployment Issues & Solutions

### 1. **Build Command Issues**
If you see "Build failed" or "Command not found":

**Solution**: Ensure your `package.json` has the correct build script:
```json
{
  "scripts": {
    "build": "react-scripts build"
  }
}
```

### 2. **API Route Issues**
If you see "Function not found" or API errors:

**File Structure Should Be**:
```
project-root/
├── api/
│   └── proxy.js
├── src/
├── public/
├── package.json
└── vercel.json
```

### 3. **Environment Variables**
After deployment, add these in Vercel dashboard:
```
REACT_APP_OKTA_ISSUER=https://ijtestcustom.oktapreview.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=0oap5k91umQIFrHgT1d7
```

### 4. **Quick Test Local Build**
Test if your build works locally:
```bash
npm run build
```

If this fails, fix the errors before deploying.

### 5. **Alternative: Deploy without API proxy**
If API proxy is causing issues, temporarily use direct Okta URLs:

Edit `src/config/okta.js`:
```javascript
export const deviceAuthEndpoints = {
  authorize: `${oktaConfig.issuer}/v1/device/authorize`,
  token: `${oktaConfig.issuer}/v1/token`,
  revoke: `${oktaConfig.issuer}/v1/revoke`,
  userinfo: `${oktaConfig.issuer}/v1/userinfo`
};
```

**Note**: You'll need to handle CORS in browser (Chrome with --disable-web-security)

### 6. **Deployment Steps**
1. **Push to Git**: `git add . && git commit -m "fix" && git push`
2. **Import to Vercel**: Connect your repo at vercel.com
3. **Set Environment Variables**: In project settings
4. **Deploy**: Should auto-deploy after setup

### 7. **If Still Failing**
Share the exact error message from Vercel deployment logs. 