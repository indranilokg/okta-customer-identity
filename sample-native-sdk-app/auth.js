let authClient = null;
let enrollmentClient = null;

// Initialize auth with config from server
async function initializeAuth() {
    if (authClient && authClient.tokenManager) {
        return true; // Already initialized
    }

    try {
        const response = await fetch('/config');
        if (!response.ok) {
            throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        
        if (!data.clientConfig || !data.enrollmentConfig) {
            throw new Error('Invalid config data received');
        }

        // Initialize the auth clients
        authClient = new OktaAuth(data.clientConfig);
        await authClient.start();  // Ensure auth client is fully started
        
        enrollmentClient = new OktaAuth(data.enrollmentConfig);
        await enrollmentClient.start();  // Ensure enrollment client is fully started

        return true;
    } catch (error) {
        console.error('Failed to initialize auth:', error);
        authClient = null;
        enrollmentClient = null;
        return false;
    }
}

// Ensure auth client is initialized
async function ensureAuth() {
    if (!authClient || !authClient.tokenManager) {
        return await initializeAuth();
    }
    return true;
}

// Global variables
let verifyEmailForEnrollment = false;
let cachedPassword = null;
let authenticatorEnrollmentsJSON = null;
let activationData = null;

function showFullLoginPage() {
    document.getElementById('signInModal').style.display = "none";
    window.location.href = '/login';
}

// Check auth state
async function checkAuthState() {
    if (!authClient || !authClient.tokenManager) {
        const initialized = await initializeAuth();
        if (!initialized) {
            return false;
        }
    }

    try {
        const existingTokens = await authClient.tokenManager.getTokens();
        if (existingTokens && existingTokens.idToken && existingTokens.accessToken) {
            const isValid = await authClient.isAuthenticated();
            return isValid;
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
    }
    return false;
}

// Render function
const render = async function() {
    const isInitialized = await ensureAuth();
    if (!isInitialized) {
        console.error('Failed to initialize auth client');
        return;
    }

    try {
        if (window.location.pathname === '/dashboard') {
            try {
                const tokens = await authClient.tokenManager.getTokens();
                
                if (!tokens) {
                    window.location.href = '/login';
                    return;
                }

                // Update user email in header
                if (tokens.idToken && tokens.idToken.claims) {
                    document.getElementById('userEmail').textContent = tokens.idToken.claims.email || 'Unknown';
                }

                // Update profile content
                if (document.getElementById('profileContent')) {
                    document.getElementById('profileContent').innerHTML = `
                        <div class="profile-info">
                            <div class="info-item">
                                <label>Email</label>
                                <p>${tokens.idToken?.claims?.email || 'Not available'}</p>
                            </div>
                            <div class="info-item">
                                <label>Name</label>
                                <p>${tokens.idToken?.claims?.name || 'Not provided'}</p>
                            </div>
                        </div>
                    `;
                }

                // Update token displays with null checks
                if (tokens.idToken) {
                    const idTokenElement = document.getElementById('idToken');
                    const idTokenLink = document.getElementById('idTokenLink');
                    if (idTokenElement && idTokenLink) {
                        idTokenElement.innerHTML = `
                            <pre class="token-data">${JSON.stringify(tokens.idToken.claims || {}, null, 2)}</pre>
                        `;
                        
                        // Get raw token string
                        const rawIdToken = tokens.idToken.value || tokens.idToken.idToken;
                        idTokenLink.style.display = 'block';
                        idTokenLink.style.position = 'relative';
                        idTokenLink.style.zIndex = '1001';
                        idTokenLink.style.pointerEvents = 'auto';
                        idTokenLink.href = rawIdToken ? `https://jwt.io/#debugger-io?token=${rawIdToken}` : '#';
                    }
                }

                if (tokens.accessToken) {
                    const accessTokenElement = document.getElementById('accessToken');
                    const accessTokenLink = document.getElementById('accessTokenLink');
                    if (accessTokenElement && accessTokenLink) {
                        try {
                            accessTokenElement.innerHTML = `
                                <pre class="token-data">${JSON.stringify(tokens.accessToken.claims || {}, null, 2)}</pre>
                            `;
                            
                            // Get raw token string
                            const rawAccessToken = tokens.accessToken.value || tokens.accessToken.accessToken;
                            accessTokenLink.style.display = 'block';
                            accessTokenLink.style.position = 'relative';
                            accessTokenLink.style.zIndex = '1001';
                            accessTokenLink.style.pointerEvents = 'auto';
                            accessTokenLink.href = rawAccessToken ? `https://jwt.io/#debugger-io?token=${rawAccessToken}` : '#';
                        } catch (e) {
                            // Handle error silently
                        }
                    }
                }

            } catch (error) {
                window.location.href = '/login';
            }
        }
    } catch (error) {
        // Handle error silently
    }
};

// Add toggle function
function toggleSection(sectionId, event) {
    // Prevent any parent handlers from triggering
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const content = document.getElementById(sectionId);
    const header = content.previousElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    // Ensure we have valid elements
    if (!content || !header || !icon) {
        console.error('Missing required elements for toggle');
        return;
    }

    try {
        const isCurrentlyHidden = content.style.display === 'none' || !content.style.display;
        content.style.display = isCurrentlyHidden ? 'block' : 'none';
        icon.textContent = isCurrentlyHidden ? '▲' : '▼';
    } catch (error) {
        console.error('Error during toggle:', error);
    }
}

// Helper function to format token data to show only claims
const formatTokenData = (token) => {
    // For ID token, show only the claims
    if (token.claims) {
        return `<pre class="token-preview">${JSON.stringify(token.claims, null, 2)}</pre>`;
    }
    // For access token, extract claims from the token string
    try {
        const tokenPayload = JSON.parse(atob(token.value.split('.')[1]));
        return `<pre class="token-preview">${JSON.stringify(tokenPayload, null, 2)}</pre>`;
    } catch (error) {
        console.error('Error parsing token:', error);
        return `<pre class="token-preview">${JSON.stringify(token, null, 2)}</pre>`;
    }
};

// Helper function to create jwt.io URL
const createJwtIoUrl = (token) => {
    if (!token) return '#';
    return `https://jwt.io/#debugger-io?token=${token}`;
};

// Login function with token check
const login = async function() {
    try {
        // First check for existing valid tokens
        const existingTokens = await authClient.tokenManager.getTokens();
        
        // If we have valid tokens, redirect to dashboard immediately
        if (existingTokens && existingTokens.idToken && existingTokens.accessToken) {
            // Verify token validity
            const isValid = await authClient.isAuthenticated();
            if (isValid) {
                window.location.href = '/dashboard';
                return;
            }
        }
        
        // If no valid tokens, proceed with login
        const transaction = await authClient.idx.authenticate({ 
            username: username.value,
            password: password.value
        });

        if (transaction.status === "SUCCESS" && transaction.tokens) {
            await authClient.tokenManager.setTokens(transaction.tokens);
            
            const storedTokens = await authClient.tokenManager.getTokens();
            
            if (storedTokens && storedTokens.idToken && storedTokens.accessToken) {
                window.location.href = '/dashboard';
            } else {
                console.error('Token storage failed');
            }   
        } else {
            console.error('Login failed:', transaction.status);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
};

// Initiate webauthn enrollment
const enrollWebauthn = async function() {
  var transaction = await enrollmentClient.idx.startTransaction({ flow: 'authenticate' });
  console.log(transaction);
  transaction = await enrollmentClient.idx.proceed({ methodType: 'email' });
  console.log(transaction);
  verifyEmailForEnrollment = true;
  render();
};

// Initiate webauthn enrollment - server side
const enrollWebauthnFromServer = async function() {
    try {
        var enrollmentData;
        
        await fetch('http://localhost:3000/enrollWebAuthn', {
            method: 'POST',
        })
        .then((response) => response.json())
        .then((data) => {
            enrollmentData = data;
        })
        .catch((err) => {
            console.error(err.message);
        });

        const options = OktaAuth.webauthn.buildCredentialCreationOptions(enrollmentData._embedded.activation, enrollmentData._embedded.activation.excludeCredentials);
        const credential = await navigator.credentials.create(options);

        const res = OktaAuth.webauthn.getAttestation(credential);

        const clientData = res.clientData;
        const attestation = res.attestation;

        const payload = JSON.stringify({
            clientData: clientData,
            attestation: attestation,
            activationLink: enrollmentData._links.activate.href
        });

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
        };

        await fetch('http://localhost:3000/activateWebAuthn', requestOptions)
            .then((response) => response.json())
            .then((data) => {
                console.log('Biometric enrollment successful');
            })
            .catch((err) => {
                console.error(err.message);
            });

        render();
    } catch (error) {
        console.error('Error in enrollWebauthnFromServer:', error);
    }
};

const finishEnrollment = async function() {
    try {
        var transaction = await enrollmentClient.idx.authenticate({ verificationCode: enrollemailotp.value });
        verifyEmailForEnrollment = false;
        transaction = await enrollmentClient.idx.authenticate({ password: cachedPassword });
        transaction = await enrollmentClient.idx.proceed({ authenticator: 'webauthn' });
        const options = OktaAuth.webauthn.buildCredentialCreationOptions(transaction.nextStep.authenticator.contextualData.activationData, transaction.nextStep.authenticatorEnrollments);
        const credential = await navigator.credentials.create(options);
        const res = OktaAuth.webauthn.getAttestation(credential);
        const clientData = res.clientData;
        const attestation = res.attestation;
        transaction = await enrollmentClient.idx.proceed({clientData, attestation});
        transaction = await enrollmentClient.idx.proceed({skip: true});
        console.log("Biometric enrollment successful");
        
        render();
    } catch (error) {
        console.error('Error in finishEnrollment:', error);
    }
};

// Similarly update loginWithWebauthn
const loginWithWebauthn = async function() {
    try {
        var transaction = await authClient.idx.authenticate({ 
            username: username.value,
            authenticators: ['webauthn']
        });

        const options = OktaAuth.webauthn.buildCredentialRequestOptions(
            transaction.nextStep.authenticator.contextualData.challengeData, 
            transaction.nextStep.authenticatorEnrollments
        );
        const credential = await navigator.credentials.get(options);
        const res = OktaAuth.webauthn.getAssertion(credential);

        const clientData = res.clientData;
        const authenticatorData = res.authenticatorData;
        const signatureData = res.signatureData;

        transaction = await authClient.idx.proceed({clientData, authenticatorData, signatureData});
        if (transaction.status == "SUCCESS") {
            await authClient.tokenManager.setTokens(transaction.tokens);
            window.location.href = '/dashboard';
        } else {
            console.error("Authentication failed");
        }
    } catch (error) {
        console.error("Login error:", error);
    }
};

// Update logout
const logout = async function() {
    try {
        await authClient.tokenManager.clear();
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// isAuthenticated function
const isAuthenticated = async function() {
    try {
        const tokens = await authClient.tokenManager.getTokens();
        console.log('Current tokens in manager:', tokens);
        
        // Check localStorage directly
        const rawStorage = localStorage.getItem('okta-token-storage');
        console.log('Raw storage during auth check:', rawStorage);

        return !!(tokens && tokens.idToken && tokens.accessToken);
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await render();
});


// End of file 
