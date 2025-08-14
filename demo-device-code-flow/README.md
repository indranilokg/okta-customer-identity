# Okta Device Code Flow Demo

A professional demonstration of Okta's OAuth 2.0 Device Authorization Grant flow with QR code support for secure authentication on shared devices.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/okta-device-code-flow-demo)

## 🚀 Features

- **QR Code Authentication**: Scan QR codes with mobile devices for secure authentication
- **Zero Credential Exposure**: No credentials entered on shared devices
- **Mobile-First Security**: Complete authentication on personal devices with biometrics/passkeys
- **Professional UI**: Modern, responsive design with smooth animations
- **Real-time Status Updates**: Live polling and progress indicators
- **Token Management**: Complete token lifecycle management
- **User Profile Display**: Show authenticated user information
- **Production Ready**: Deployable to Vercel with CORS handling

## 🌐 Live Demo

**Production URL**: `https://your-app-name.vercel.app`

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Okta Developer Account
- Okta application configured for Device Authorization Grant

## 🛠️ Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd okta-device-code-flow-demo
npm install
```

### 2. Configure Okta Application

1. **Create Native OIDC Application**:
   - Go to your Okta Admin Console
   - Navigate to **Applications** > **Applications**
   - Click **Create App Integration**
   - Select **OIDC - OpenID Connect** and **Native Application**
   - Configure the application with:
     - **Grant Types**: Device Authorization, Refresh Token
     - **Scopes**: openid, profile, offline_access

2. **Enable Device Authorization in Policy**:
   - Go to **Security** > **API** > **Authorization Servers**
   - Select your authorization server (default or custom)
   - Go to **Access Policies** tab
   - Edit the policy rule and enable **Device Authorization**

### 3. Update Configuration

Edit `src/config/okta.js` with your Okta configuration:

```javascript
export const oktaConfig = {
  issuer: 'https://your-org.okta.com/oauth2/default',
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  scopes: ['openid', 'profile', 'offline_access'],
  pkce: true,
  disableHttpsCheck: false
};
```

### 4. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🚀 Production Deployment

### Vercel (Recommended)

1. **Quick Deploy**: Click the "Deploy with Vercel" button above
2. **Manual Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

### Environment Variables for Production

```bash
REACT_APP_OKTA_ISSUER=https://your-org.okta.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=your-client-id
```

### Update Okta Redirect URIs

After deployment, add your production URL to Okta:
```
https://your-app-name.vercel.app/callback
https://your-app-name.vercel.app
```

## 🔄 How It Works

### 1. Device Authorization Request
The application requests a device authorization code from Okta's `/device/authorize` endpoint.

### 2. QR Code Display
A QR code is generated containing the verification URL and user code for easy mobile access.

### 3. Mobile Authentication
Users scan the QR code or manually enter the verification code on their mobile device to complete authentication.

### 4. Token Polling
The application polls the `/token` endpoint until the user completes authentication.

### 5. User Profile
Upon successful authentication, user information is displayed with token details.

## 📱 Demo Flow

1. **Welcome Screen**: Introduction to the device code flow
2. **QR Code Display**: Professional QR code with verification code
3. **Authentication Status**: Real-time polling with progress indicators
4. **User Profile**: Complete user information and token details
5. **Logout**: Secure token revocation

## 🎯 Use Cases

- **Kiosk Authentication**: Retail POS systems, information kiosks
- **Shared Devices**: Library computers, hotel business centers
- **IoT Devices**: Smart TVs, digital signage, printers
- **Command Line Tools**: CLI applications requiring authentication
- **Input-Constrained Devices**: Devices without keyboards or browsers

## 🔒 Security Benefits

- **No Credential Exposure**: Credentials never entered on shared devices
- **Phishing Resistance**: Authentication completed on trusted personal devices
- **Session Isolation**: No persistent sessions on shared devices
- **Biometric Support**: Leverage device biometrics and passkeys
- **Token Expiration**: Short-lived tokens with automatic expiration

## 🛡️ Security Considerations

- **Token Storage**: Tokens are stored in memory only, not persisted
- **Session Management**: Sessions are cleared immediately after use
- **Rate Limiting**: Built-in polling intervals to prevent abuse
- **Token Revocation**: Proper token cleanup on logout
- **HTTPS Required**: All communications use secure protocols

## 📚 Technical Implementation

### Architecture
- **Frontend**: React with styled-components
- **Authentication**: Okta OAuth 2.0 Device Authorization Grant
- **QR Codes**: qrcode.react library
- **HTTP Client**: Axios for API calls
- **State Management**: React hooks
- **Deployment**: Vercel with serverless functions
- **CORS Handling**: Custom proxy for production

### Key Components
- `DeviceAuthService`: Handles all OAuth 2.0 device flow operations
- `QRCodeDisplay`: Professional QR code presentation
- `AuthenticationStatus`: Real-time status updates
- `UserProfile`: User information display
- `WelcomeScreen`: Application introduction

### API Endpoints
- `/device/authorize`: Request device authorization
- `/token`: Exchange device code for tokens
- `/userinfo`: Get user profile information
- `/revoke`: Revoke tokens

### Production Features
- **Serverless Functions**: Handle CORS and proxy requests
- **Environment Variables**: Secure configuration management
- **Auto-scaling**: Handles traffic spikes automatically
- **Global CDN**: Fast loading worldwide

## 🔧 Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| **CORS** | Browser-dependent | Handled by serverless function |
| **URLs** | Direct Okta endpoints | Proxied through `/api/okta/*` |
| **HTTPS** | Optional | Required |
| **Environment** | Local config | Environment variables |

## 🐛 Troubleshooting

### Common Issues

- **QR Code not working**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **CORS errors**: Use proxy server or deploy to production
- **Authentication failures**: Check Okta configuration
- **Deployment issues**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 Additional Resources

- [Okta Device Authorization Grant Documentation](https://developer.okta.com/docs/guides/device-authorization-grant/main/)
- [OAuth 2.0 Device Authorization Grant RFC](https://tools.ietf.org/html/rfc8628)
- [QR Code Authentication Best Practices](https://iam.twisec.com/Kiosk-Authentication/)
- [Vercel Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review the [Deployment Guide](./DEPLOYMENT.md)
- Visit the [Okta Developer Forum](https://devforum.okta.com/)
- Check the [OAuth 2.0 Device Authorization Grant RFC](https://tools.ietf.org/html/rfc8628)

---

**Note**: This is a demonstration application. For production use, ensure proper security measures, error handling, and compliance with your organization's security policies. 