let authClient = null;
let enrollmentClient = null;

// Initialize auth with config from server
async function initializeAuth() {
    if (authClient && authClient.tokenManager) {
        return true;
    }

    try {
        const response = await fetch('/config');
        if (!response.ok) {
            throw new Error('Failed to fetch config');
        }
        const data = await response.json();
        
        if (!data.clientConfig) {
            throw new Error('Invalid config data received');
        }

        authClient = new OktaAuth(data.clientConfig);
        await authClient.start();

        return true;
    } catch (error) {
        console.error('Failed to initialize auth:', error);
        authClient = null;
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
            const tokens = await authClient.tokenManager.getTokens();
            
            if (!tokens) {
                window.location.href = '/login';
                return;
            }

            if (tokens.idToken && tokens.idToken.claims) {
                document.getElementById('userEmail').textContent = tokens.idToken.claims.email || 'Unknown';
            }

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

            if (tokens.idToken) {
                const idTokenElement = document.getElementById('idToken');
                if (idTokenElement) {
                    idTokenElement.innerHTML = `
                        <pre class="token-data">${JSON.stringify(tokens.idToken.claims || {}, null, 2)}</pre>
                    `;
                }
            }

            if (tokens.accessToken) {
                const accessTokenElement = document.getElementById('accessToken');
                if (accessTokenElement) {
                    accessTokenElement.innerHTML = `
                        <pre class="token-data">${JSON.stringify(tokens.accessToken.claims || {}, null, 2)}</pre>
                    `;
                }
            }

            // Add WebAuthn status check and button update
            const hasWebAuthn = await checkWebAuthnStatus();
            const securityButton = document.querySelector('.security-item .btn-outline');
            if (securityButton) {
                if (hasWebAuthn) {
                    securityButton.textContent = 'Remove Passkey';
                    securityButton.onclick = removeWebauthn;
                } else {
                    securityButton.textContent = 'Setup Passkey';
                    securityButton.onclick = enrollWebauthnFromServer;
                }
            }
        }
    } catch (error) {
        console.error('Error in render:', error);
        window.location.href = '/login';
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
        if (!username.value || !password.value) {
            alert('Both username and password are required');
            return;
        }
        
        const transaction = await authClient.idx.authenticate({ 
            username: username.value,
            password: password.value
        });

        if (transaction.status === "SUCCESS" && transaction.tokens) {
            await authClient.tokenManager.setTokens(transaction.tokens);
            window.location.href = '/dashboard';
        } else {
            console.error('Login failed:', transaction.status);
            alert('Login failed: Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login error: ' + error.message);
    }
};


// Initiate webauthn enrollment - server side
window.enrollWebauthnFromServer = async function() {
    if (window.location.pathname !== '/dashboard') {
        console.log('Not on dashboard, skipping WebAuthn enrollment');
        return;
    }

    console.log('Starting WebAuthn enrollment...');
    try {
        const button = document.querySelector('.security-item .btn-outline');
        if (!button) {
            console.log('Passkey button not found');
            return;
        }

        const originalText = button.textContent;
        button.textContent = 'Setting up...';
        button.disabled = true;

        const tokens = await authClient.tokenManager.getTokens();
        if (!tokens || !tokens.idToken) {
            window.location.href = '/';
            return;
        }

        const enrollResponse = await fetch('/enrollWebAuthn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                userId: tokens.idToken.claims.sub
            })
        });

        if (!enrollResponse.ok) {
            throw new Error(`HTTP error! status: ${enrollResponse.status}`);
        }

        const enrollmentData = await enrollResponse.json();
        console.log('Enrollment data received:', enrollmentData);

        if (!enrollmentData._embedded?.activation) {
            throw new Error('Invalid enrollment data received');
        }

        const options = OktaAuth.webauthn.buildCredentialCreationOptions(
            enrollmentData._embedded.activation,
            enrollmentData._embedded.activation.excludeCredentials
        );
        
        console.log('Requesting credential creation...');
        const credential = await navigator.credentials.create(options);
        
        if (!credential) {
            throw new Error('No credential received');
        }

        const res = OktaAuth.webauthn.getAttestation(credential);
        console.log('Attestation received');

        const activateResponse = await fetch('/activateWebAuthn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                clientData: res.clientData,
                attestation: res.attestation,
                activationLink: enrollmentData._links.activate.href
            })
        });

        if (!activateResponse.ok) {
            throw new Error(`HTTP error! status: ${activateResponse.status}`);
        }

        console.log('WebAuthn enrollment successful');
        button.textContent = 'Passkey Setup Complete';
        button.disabled = true;
        alert('Passkey setup successful!');

        await render();
    } catch (error) {
        console.error('Error in enrollWebauthnFromServer:', error);
        
        if (window.location.pathname === '/dashboard') {
            const button = document.querySelector('.security-item .btn-outline');
            if (button) {
                button.textContent = 'Setup Passkey';
                button.disabled = false;
            }

            if (error.name === 'NotAllowedError') {
                console.log('User cancelled the WebAuthn operation');
            } else if (!error.message.includes('Cannot read properties of null')) {
                alert(`Failed to setup Passkey: ${error.message}`);
            }
        }
    }
};


// Similarly update loginWithWebauthn
const loginWithWebauthn = async function() {
    try {
        console.log('Starting WebAuthn login...');
        
        var transaction = await authClient.idx.authenticate({ 
            authenticator: 'webauthn',
            authenticatorMethod: 'webauthn',
            username: username.value
        });

        console.log('Initial transaction:', transaction);

        if (!transaction.nextStep || 
            !transaction.nextStep.authenticator || 
            !transaction.nextStep.authenticator.contextualData || 
            !transaction.nextStep.authenticator.contextualData.challengeData) {
            throw new Error('WebAuthn authentication not available for this user');
        }

        const challengeData = transaction.nextStep.authenticator.contextualData.challengeData;
        const authenticatorEnrollments = transaction.nextStep.authenticatorEnrollments;

        console.log('Building credential request options...');
        const options = OktaAuth.webauthn.buildCredentialRequestOptions(
            challengeData,
            authenticatorEnrollments
        );

        console.log('Requesting credential...');
        const credential = await navigator.credentials.get(options);
        
        if (!credential) {
            throw new Error('No credential received');
        }

        console.log('Getting assertion...');
        const res = OktaAuth.webauthn.getAssertion(credential);

        console.log('Proceeding with WebAuthn assertion...');
        transaction = await authClient.idx.proceed({
            clientData: res.clientData,
            authenticatorData: res.authenticatorData,
            signatureData: res.signatureData
        });

        if (transaction.status === "SUCCESS") {
            await authClient.tokenManager.setTokens(transaction.tokens);
            window.location.href = '/dashboard';
        } else {
            throw new Error("Authentication failed: " + transaction.status);
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

// Update logout
const logout = async function() {
    try {
        console.log('Starting complete logout cleanup...');
        
        // Get tokens before clearing them (we might need them for revocation)
        const tokens = await authClient.tokenManager.getTokens();
        
        // Clear local tokens first
        await authClient.tokenManager.clear();
        
        // Revoke tokens if we have them
        if (tokens?.accessToken) {
            try {
                await authClient.revokeAccessToken(tokens.accessToken);
            } catch (e) {
                console.log('Error revoking access token:', e);
            }
        }

        // Clear Okta session using signOut
        await authClient.signOut({
            clearTokensBeforeRedirect: true,  // Clear tokens before redirect
            revokeAccessToken: true,          // Revoke access token
            revokeRefreshToken: true,         // Revoke refresh token if present
            postLogoutRedirectUri: window.location.origin // Redirect back to home
        });

        // Additional cleanup
        localStorage.removeItem('okta-token-storage');
        localStorage.removeItem('okta-cache-storage');
        sessionStorage.removeItem('okta-token-storage');
        sessionStorage.removeItem('okta-cache-storage');
        
        // Clear any Okta-related cookies
        document.cookie.split(";").forEach(function(c) {
            if (c.trim().startsWith('okta-')) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            }
        });
        
        console.log('Logout cleanup completed');
        
        // Force reload to clear any remaining state
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, try to redirect
        window.location.href = '/';
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
    try {
        await render();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

console.log('auth.js loaded');

// Add this function to check WebAuthn enrollment status
async function checkWebAuthnStatus() {
    try {
        const tokens = await authClient.tokenManager.getTokens();
        if (!tokens || !tokens.idToken) {
            return false;
        }

        const response = await fetch(`/checkWebAuthnStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: tokens.idToken.claims.sub
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.hasWebAuthn;
    } catch (error) {
        console.error('Error checking WebAuthn status:', error);
        return false;
    }
}

// Add this function to remove WebAuthn
async function removeWebauthn() {
    if (window.location.pathname !== '/dashboard') {
        return;
    }

    try {
        const button = document.querySelector('.security-item .btn-outline');
        if (!button) return;

        const originalText = button.textContent;
        button.textContent = 'Removing...';
        button.disabled = true;

        const tokens = await authClient.tokenManager.getTokens();
        if (!tokens || !tokens.idToken) {
            window.location.href = '/';
            return;
        }

        const response = await fetch('/removeWebAuthn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: tokens.idToken.claims.sub
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        button.textContent = 'Setup Passkey';
        button.disabled = false;
        button.onclick = enrollWebauthnFromServer;
        
        alert('Passkey removed successfully');
    } catch (error) {
        console.error('Error removing WebAuthn:', error);
        const button = document.querySelector('.security-item .btn-outline');
        if (button) {
            button.textContent = 'Remove Passkey';
            button.disabled = false;
        }
        alert('Failed to remove Passkey: ' + error.message);
    }
}

// End of file 
