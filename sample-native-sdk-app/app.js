const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const request = require('request');
require('dotenv').config();

// Update view engine setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname)); // Ensure absolute path

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving with explicit paths
app.use('/public', express.static(path.join(__dirname, 'public')));

// Explicit routes for static files
app.get('/auth.js', (req, res) => {
    console.log('Serving auth.js from:', path.join(__dirname, 'auth.js')); // Add logging
    res.set('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'auth.js'), (err) => {
        if (err) {
            console.error('Error serving auth.js:', err);
            res.status(500).send('Error serving auth.js');
        }
    });
});

app.get('/styles.css', (req, res) => {
    console.log('Serving styles.css from:', path.join(__dirname, 'public', 'styles.css')); // Add logging
    res.set('Content-Type', 'text/css');
    res.sendFile(path.join(__dirname, 'public', 'styles.css'), (err) => {
        if (err) {
            console.error('Error serving styles.css:', err);
            res.status(500).send('Error serving styles.css');
        }
    });
});

// HTML routes with error handling
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error serving index.html');
        }
    });
});

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', function(req, res) {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

router.post('/enrollWebAuthn', function(req,res){
  console.log("here");
  var options = {
    'method': 'POST',
    'url': `${process.env.OKTA_DOMAIN}/api/v1/users/00ulh2kj225GEecol1d7/factors`,
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
    },
    body: JSON.stringify({
      "factorType": "webauthn",
      "provider": "FIDO"
    })
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.send(response.body);
  });
});

router.post('/activateWebAuthn',function(req,res){
  console.log(req.body);
  const clientData = req.body.clientData;
  const attestation  = req.body.attestation;
  const activationLink  = req.body.activationLink;
  console.log(clientData);
  console.log(attestation);
  console.log(activationLink);
  

  var options = {
    'method': 'POST',
    'url': activationLink,
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
    },
    body: JSON.stringify({
      "attestation": attestation,
      "clientData": clientData
    })
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.send(response.body);
  });
  
});

// Add this route before your other routes
app.get('/config', (req, res) => {
  const clientConfig = {
    issuer: process.env.OKTA_ISSUER,
    clientId: process.env.OKTA_CLIENT_ID,
    redirectUri: process.env.REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    useInteractionCodeFlow: true,
    tokenManager: {
      storage: 'localStorage',
      autoRenew: true,
      expireEarlySeconds: 30,
      storageKey: 'okta-token-storage'
    }
  };

  const enrollmentConfig = {
    issuer: process.env.OKTA_ISSUER,
    clientId: process.env.OKTA_ENROLLMENT_CLIENT_ID,
    redirectUri: process.env.REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    useInteractionCodeFlow: true
  };

  res.json({ clientConfig, enrollmentConfig });
});

//add the router
app.use('/', router);

// Add this near your other routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Update port configuration
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Running at Port ${port}`);
    });
}

// Add error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Something broke!');
});

// Export the Express API
module.exports = app;

