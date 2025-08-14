# Vercel Deployment Guide

This guide explains how to deploy the Okta Device Code Flow Demo to Vercel for production use.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/okta-device-code-flow-demo)

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Code pushed to GitHub, GitLab, or Bitbucket
3. **Okta Configuration**: Existing Okta org with device authorization enabled

## 🛠️ Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository with all the necessary files:
- `vercel.json` - Vercel configuration
- `api/proxy.js` - Serverless function for CORS handling
- `package.json` - Dependencies and build scripts

### 2. Connect to Vercel

1. **Log in to Vercel**: Visit [vercel.com](https://vercel.com)
2. **Import Project**: Click "New Project" and connect your Git repository
3. **Select Repository**: Choose your device code flow demo repository

### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

```bash
REACT_APP_OKTA_ISSUER=https://ijtestcustom.oktapreview.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=0oap5k91umQIFrHgT1d7
```

**Important**: Update these with your actual Okta domain and client ID.

### 4. Update Okta Application Settings

Once deployed, update your Okta application with the new Vercel URLs:

1. **Go to Okta Admin Console**
2. **Navigate to**: Applications > Applications > demo-device-code-flow
3. **Update Redirect URIs**: Add your Vercel domain
   ```
   https://your-app-name.vercel.app/callback
   ```
4. **Update Post Logout Redirect URIs**: Add your Vercel domain
   ```
   https://your-app-name.vercel.app
   ```

### 5. Deploy

1. **Deploy**: Click "Deploy" in Vercel
2. **Wait for Build**: The build process will take 2-3 minutes
3. **Get Domain**: Note your assigned Vercel domain (e.g., `your-app-name.vercel.app`)

## 🔧 Configuration Details

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_OKTA_ISSUER` | Your Okta authorization server URL | `https://dev-123.okta.com/oauth2/default` |
| `REACT_APP_OKTA_CLIENT_ID` | Your Okta application client ID | `0oa1234567890abcdef` |

### Vercel Configuration (`vercel.json`)

The deployment uses:
- **Static Build**: Builds the React app to static files
- **Serverless Functions**: Handles CORS and proxying to Okta
- **Custom Routes**: Routes API calls to the proxy function

### CORS Handling

The `api/proxy.js` function handles:
- **CORS Headers**: Enables cross-origin requests
- **Request Proxying**: Forwards requests to Okta
- **Error Handling**: Provides meaningful error messages

## 🌐 Custom Domain (Optional)

### 1. Add Custom Domain in Vercel

1. **Go to Project Settings** > **Domains**
2. **Add Domain**: Enter your custom domain
3. **Configure DNS**: Follow Vercel's DNS instructions

### 2. Update Okta Configuration

Update your Okta application redirect URIs to use your custom domain:
```
https://your-custom-domain.com/callback
https://your-custom-domain.com
```

## 🔒 Security Considerations

### Environment Variables

- **Never commit**: Don't commit `.env` files to Git
- **Use Vercel UI**: Set environment variables through Vercel dashboard
- **Separate Environments**: Use different variables for staging/production

### Okta Application Security

- **HTTPS Only**: Ensure all redirect URIs use HTTPS
- **Domain Validation**: Only add trusted domains to redirect URIs
- **Regular Rotation**: Rotate client secrets periodically (if using confidential clients)

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom**: `Access-Control-Allow-Origin` errors in browser console

**Solution**: 
- Verify `api/proxy.js` is deployed correctly
- Check Vercel function logs for errors

#### 2. Invalid Redirect URI
**Symptom**: Okta error "redirect_uri is not in the list"

**Solution**:
- Add your Vercel domain to Okta app redirect URIs
- Ensure URLs match exactly (including trailing slashes)

#### 3. Environment Variables Not Working
**Symptom**: App shows default localhost configuration

**Solution**:
- Verify environment variables are set in Vercel dashboard
- Redeploy after adding environment variables
- Check variable names match exactly

#### 4. Build Failures
**Symptom**: Deployment fails during build

**Solution**:
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version compatibility

### Debugging

#### Vercel Function Logs
1. **Go to Vercel Dashboard** > **Functions** tab
2. **View Logs**: Click on function to see execution logs
3. **Monitor Errors**: Look for proxy-related errors

#### Browser Console
1. **Open Developer Tools** (F12)
2. **Check Network Tab**: Look for failed API requests
3. **Check Console**: Look for JavaScript errors

## 📊 Performance Optimization

### Build Optimization

The app is optimized for production with:
- **Code Splitting**: Automatic React code splitting
- **Asset Optimization**: Minified CSS and JavaScript
- **Caching**: Static assets cached by Vercel CDN

### Function Performance

- **Cold Starts**: First request may be slower
- **Regional Deployment**: Vercel deploys globally
- **Timeout Handling**: 10-second timeout for API requests

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you:
1. **Push to Main Branch**: Production deployment
2. **Push to Other Branches**: Preview deployments
3. **Open Pull Requests**: Preview deployments

### Preview Deployments

Each deployment gets a unique URL for testing:
- **Branch Deployments**: `https://your-app-git-branch-name.vercel.app`
- **PR Deployments**: `https://your-app-git-pr-123.vercel.app`

## 📱 Mobile Testing

### QR Code Testing

After deployment:
1. **Test QR Codes**: Scan with different mobile devices
2. **Network Compatibility**: Test on different networks
3. **Device Compatibility**: Test Android and iOS devices

### HTTPS Requirements

Device code flow requires HTTPS in production:
- ✅ **Vercel**: Automatically provides HTTPS
- ✅ **Custom Domains**: Free SSL certificates
- ✅ **QR Codes**: Work properly with HTTPS

## 🎯 Demo Best Practices

### For Customer Demos

1. **Custom Domain**: Use a professional domain name
2. **Company Branding**: Customize the app colors/logo
3. **Demo Data**: Use demo users/accounts
4. **Mobile Devices**: Have Android devices ready for QR scanning

### Monitoring

- **Vercel Analytics**: Monitor performance and usage
- **Okta Logs**: Monitor authentication events
- **Error Tracking**: Set up error monitoring

## 🆘 Support

If you encounter issues:

1. **Check Vercel Status**: [status.vercel.com](https://status.vercel.com)
2. **Review Logs**: Check Vercel function logs
3. **Okta Documentation**: [developer.okta.com](https://developer.okta.com)
4. **Community Help**: [Vercel Discord](https://vercel.com/discord)

---

**🎉 Congratulations!** Your Okta Device Code Flow demo is now live and ready for customer demonstrations. 