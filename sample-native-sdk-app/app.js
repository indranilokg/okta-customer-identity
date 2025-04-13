const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const request = require('request');
require('dotenv').config();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

// Update middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/styles.css', (req, res) => {
    res.type('text/css');
    res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});
app.use('/auth.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'auth.js'));
});

// Add authentication middleware
const requireAuth = async (req, res, next) => {
    // For now, we'll just redirect to login if no session
    // In a real app, you'd want to verify the session/tokens
    res.redirect('/login');
};

// Add the dashboard route
app.get('/dashboard', function(req, res) {
    res.render('dashboard.html');
});

// Update the root route to check auth status
router.get('/', function(req, res) {
    res.render('index.html');
});

// Update the login route to handle already authenticated users
app.get('/login', function(req, res) {
    res.render('login.html');
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

// Update port configuration
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Running at Port ${port}`);
    });
}

// Export the Express API
module.exports = app;

