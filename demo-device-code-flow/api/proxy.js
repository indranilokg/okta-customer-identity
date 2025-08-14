// Vercel serverless function to proxy Okta API requests
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the path from the request
    const { query } = req;
    const path = Array.isArray(query.path) ? query.path.join('/') : query.path || '';
    
    // Construct the Okta URL
    const oktaBaseUrl = process.env.REACT_APP_OKTA_ISSUER || 'https://ijtestcustom.oktapreview.com/oauth2/default';
    const targetUrl = `${oktaBaseUrl}/${path}`;

    console.log(`Proxying ${req.method} request to: ${targetUrl}`);

    // Prepare headers for the Okta request
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'Okta-Device-Code-Demo/1.0'
    };

    // Add authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Prepare the request configuration
    const requestConfig = {
      method: req.method,
      headers,
    };

    // Add body for POST requests
    if (req.method === 'POST' && req.body) {
      if (typeof req.body === 'string') {
        requestConfig.body = req.body;
      } else {
        requestConfig.body = JSON.stringify(req.body);
      }
    }

    // Make the request to Okta
    const response = await fetch(targetUrl, requestConfig);
    
    // Get response data
    const data = await response.text();
    
    // Forward the response
    res.status(response.status);
    
    // Set content type based on response
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch {
      res.send(data);
    }

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 