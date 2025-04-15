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
    res.set('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'auth.js'), (err) => {
        if (err) {
            console.error('Error serving auth.js:', err);
            res.status(500).send('Error serving auth.js');
        }
    });
});

app.get('/styles.css', (req, res) => {
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

router.post('/enrollWebAuthn', function(req, res) {
  console.log("Starting WebAuthn enrollment");
  
  // Get userId from request body
  const userId = req.body.userId;
  if (!userId) {
    console.error('No userId provided');
    return res.status(400).json({ error: 'No userId provided' });
  }

  console.log('Enrolling WebAuthn for user:', userId);

  var options = {
    'method': 'POST',
    'url': `${process.env.OKTA_DOMAIN}/api/v1/users/${userId}/factors`,
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

  request(options, function(error, response) {
    if (error) {
      console.error('Error enrolling WebAuthn:', error);
      return res.status(500).json({ error: error.message });
    }
    console.log('WebAuthn enrollment response received');
    res.send(response.body);
  });
});

router.post('/activateWebAuthn', function(req, res) {
    try {
        console.log('Activating WebAuthn...');
        console.log('Request body:', req.body);
        
        const { clientData, attestation, activationLink } = req.body;
        
        if (!clientData || !attestation || !activationLink) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        var options = {
            'method': 'POST',
            'url': activationLink,
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
            },
            body: JSON.stringify({
                attestation: attestation,
                clientData: clientData
            })
        };

        request(options, function(error, response) {
            if (error) {
                console.error('Error in activateWebAuthn:', error);
                return res.status(500).json({ error: error.message });
            }
            
            console.log('Activation response:', response.body);
            res.send(response.body);
        });
    } catch (error) {
        console.error('Error in activateWebAuthn:', error);
        res.status(500).json({ error: error.message });
    }
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

// Add this route to check WebAuthn status
router.post('/checkWebAuthnStatus', function(req, res) {
    console.log("Checking WebAuthn status");
    
    const userId = req.body.userId;
    if (!userId) {
        return res.status(400).json({ error: 'No userId provided' });
    }

    var options = {
        'method': 'GET',
        'url': `${process.env.OKTA_DOMAIN}/api/v1/users/${userId}/factors`,
        'headers': {
            'Accept': 'application/json',
            'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
        }
    };

    request(options, function(error, response) {
        if (error) {
            console.error('Error checking WebAuthn status:', error);
            return res.status(500).json({ error: error.message });
        }

        try {
            const factors = JSON.parse(response.body);
            const hasWebAuthn = factors.some(factor => 
                factor.factorType === 'webauthn' && 
                factor.status === 'ACTIVE'
            );
            res.json({ hasWebAuthn });
        } catch (e) {
            console.error('Error parsing factors response:', e);
            res.status(500).json({ error: 'Error parsing factors response' });
        }
    });
});

// Add this route to remove WebAuthn
router.post('/removeWebAuthn', function(req, res) {
    console.log("Removing WebAuthn");
    
    const userId = req.body.userId;
    if (!userId) {
        return res.status(400).json({ error: 'No userId provided' });
    }

    // First get the factors to find the WebAuthn factor ID
    var getOptions = {
        'method': 'GET',
        'url': `${process.env.OKTA_DOMAIN}/api/v1/users/${userId}/factors`,
        'headers': {
            'Accept': 'application/json',
            'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
        }
    };

    request(getOptions, function(error, response) {
        if (error) {
            console.error('Error getting factors:', error);
            return res.status(500).json({ error: error.message });
        }

        try {
            const factors = JSON.parse(response.body);
            const webAuthnFactor = factors.find(factor => 
                factor.factorType === 'webauthn' && 
                factor.status === 'ACTIVE'
            );

            if (!webAuthnFactor) {
                return res.status(404).json({ error: 'No active WebAuthn factor found' });
            }

            // Now delete the factor
            var deleteOptions = {
                'method': 'DELETE',
                'url': `${process.env.OKTA_DOMAIN}/api/v1/users/${userId}/factors/${webAuthnFactor.id}`,
                'headers': {
                    'Accept': 'application/json',
                    'Authorization': `SSWS ${process.env.OKTA_API_TOKEN}`
                }
            };

            request(deleteOptions, function(deleteError, deleteResponse) {
                if (deleteError) {
                    console.error('Error deleting WebAuthn factor:', deleteError);
                    return res.status(500).json({ error: deleteError.message });
                }

                if (deleteResponse.statusCode === 204) {
                    res.json({ success: true });
                } else {
                    res.status(deleteResponse.statusCode).json({ 
                        error: 'Failed to delete WebAuthn factor' 
                    });
                }
            });
        } catch (e) {
            console.error('Error parsing factors response:', e);
            res.status(500).json({ error: 'Error parsing factors response' });
        }
    });
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

