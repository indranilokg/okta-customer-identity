const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Proxy middleware configuration
const proxyOptions = {
  target: 'https://ijtestcustom.oktapreview.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: {
    '^/api/okta': '', // Remove /api/okta prefix when forwarding to Okta
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log proxy requests for debugging
    console.log(`Proxying: ${req.method} ${req.path} -> ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
};

// Proxy all /api/okta requests to Okta
app.use('/api/okta', createProxyMiddleware(proxyOptions));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Device Code Flow Demo available at http://localhost:${PORT}`);
  console.log(`🔗 Okta proxy configured for https://ijtestcustom.oktapreview.com`);
}); 