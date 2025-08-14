import axios from 'axios';
import { deviceAuthEndpoints, oktaConfig } from '../config/okta';

class DeviceAuthService {
  constructor() {
    this.pollingInterval = null;
    this.deviceCode = null;
    this.userCode = null;
    this.verificationUri = null;
    this.verificationUriComplete = null;
    this.expiresIn = null;
    this.interval = null;
  }

  // Step 1: Request device authorization
  async requestDeviceAuthorization() {
    try {
      const params = new URLSearchParams({
        client_id: oktaConfig.clientId,
        scope: oktaConfig.scopes.join(' ')
      });

      console.log('Requesting device authorization with params:', {
        client_id: oktaConfig.clientId,
        scope: oktaConfig.scopes.join(' ')
      });

      const response = await axios.post(deviceAuthEndpoints.authorize, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      const data = response.data;
      console.log('Device authorization response:', data);
      
      // Store the response data
      this.deviceCode = data.device_code;
      this.userCode = data.user_code;
      this.verificationUri = data.verification_uri;
      this.verificationUriComplete = data.verification_uri_complete;
      this.expiresIn = data.expires_in;
      this.interval = data.interval || 5; // Default to 5 seconds if not provided

      // Fix the verification URI if it's relative
      if (this.verificationUri && !this.verificationUri.startsWith('http')) {
        this.verificationUri = `https://ijtestcustom.oktapreview.com${this.verificationUri}`;
      }

      // Construct verification_uri_complete properly
      if (this.verificationUriComplete && !this.verificationUriComplete.startsWith('http')) {
        this.verificationUriComplete = `https://ijtestcustom.oktapreview.com${this.verificationUriComplete}`;
      } else if (!this.verificationUriComplete && this.verificationUri && this.userCode) {
        // Construct it ourselves if not provided
        const baseUrl = this.verificationUri.includes('?') 
          ? this.verificationUri 
          : `${this.verificationUri}?user_code=${this.userCode}`;
        this.verificationUriComplete = baseUrl.includes('user_code=') 
          ? baseUrl 
          : `${baseUrl}&user_code=${this.userCode}`;
      }

      console.log('Processed URLs:', {
        verificationUri: this.verificationUri,
        verificationUriComplete: this.verificationUriComplete,
        userCode: this.userCode
      });

      return {
        deviceCode: this.deviceCode,
        userCode: this.userCode,
        verificationUri: this.verificationUri,
        verificationUriComplete: this.verificationUriComplete,
        expiresIn: this.expiresIn,
        interval: this.interval
      };
    } catch (error) {
      console.error('Device authorization request failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(`Device authorization failed: ${error.response.data?.error_description || error.response.statusText}`);
      }
      throw new Error('Failed to request device authorization: Network error');
    }
  }

  // Step 2: Poll for tokens
  async pollForTokens(onProgress, onSuccess, onError) {
    if (!this.deviceCode) {
      throw new Error('No device code available. Please request authorization first.');
    }

    console.log('Starting token polling with device code:', this.deviceCode);

    const pollToken = async () => {
      try {
        const params = new URLSearchParams({
          client_id: oktaConfig.clientId,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: this.deviceCode
        });

        console.log('Polling for tokens with params:', {
          client_id: oktaConfig.clientId,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: this.deviceCode
        });

        const response = await axios.post(deviceAuthEndpoints.token, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        });

        // Success - tokens received
        const tokens = response.data;
        console.log('Tokens received successfully:', tokens);
        this.clearPolling();
        onSuccess(tokens);
        return tokens;

      } catch (error) {
        console.log('Token polling error:', error.response?.data || error.message);
        
        if (error.response?.data?.error === 'authorization_pending') {
          // Still pending, continue polling
          console.log('Authorization still pending, continuing to poll...');
          onProgress && onProgress('Waiting for user authorization...');
          return null;
        } else if (error.response?.data?.error === 'slow_down') {
          // Rate limited, increase interval
          this.interval = Math.min(this.interval * 2, 60);
          console.log('Rate limited, increasing polling interval to:', this.interval);
          onProgress && onProgress('Rate limited, slowing down...');
          return null;
        } else if (error.response?.data?.error === 'expired_token') {
          // Token expired
          console.error('Device authorization expired');
          this.clearPolling();
          onError && onError('Authorization expired. Please try again.');
          return null;
        } else if (error.response?.data?.error === 'access_denied') {
          // User denied authorization
          console.error('User denied authorization');
          this.clearPolling();
          onError && onError('Authorization was denied by the user.');
          return null;
        } else {
          // Other error
          console.error('Token polling failed with error:', error.response?.data || error.message);
          this.clearPolling();
          const errorMessage = error.response?.data?.error_description || 
                              error.response?.data?.error || 
                              'Authorization failed. Please try again.';
          onError && onError(errorMessage);
          return null;
        }
      }
    };

    // Start polling
    const poll = async () => {
      const result = await pollToken();
      if (result) return; // Success, stop polling

      // Continue polling
      this.pollingInterval = setTimeout(poll, this.interval * 1000);
    };

    // Initial poll
    poll();
  }

  // Step 3: Get user info
  async getUserInfo(accessToken) {
    try {
      console.log('Getting user info with access token');
      const response = await axios.get(deviceAuthEndpoints.userinfo, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      console.log('User info received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      if (error.response) {
        console.error('User info error response:', error.response.data);
        throw new Error(`Failed to get user information: ${error.response.data?.error_description || error.response.statusText}`);
      }
      throw new Error('Failed to get user information: Network error');
    }
  }

  // Step 4: Revoke tokens
  async revokeToken(token, tokenTypeHint = 'refresh_token') {
    try {
      console.log('Revoking token:', tokenTypeHint);
      const params = new URLSearchParams({
        token: token,
        token_type_hint: tokenTypeHint,
        client_id: oktaConfig.clientId
      });

      await axios.post(deviceAuthEndpoints.revoke, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      console.log('Token revoked successfully');
      return true;
    } catch (error) {
      console.error('Failed to revoke token:', error);
      if (error.response) {
        console.error('Revoke token error response:', error.response.data);
        throw new Error(`Failed to revoke token: ${error.response.data?.error_description || error.response.statusText}`);
      }
      throw new Error('Failed to revoke token: Network error');
    }
  }

  // Clear polling interval
  clearPolling() {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Polling cleared');
    }
  }

  // Reset service state
  reset() {
    this.clearPolling();
    this.deviceCode = null;
    this.userCode = null;
    this.verificationUri = null;
    this.verificationUriComplete = null;
    this.expiresIn = null;
    this.interval = null;
    console.log('Device auth service reset');
  }
}

// Create and export instance
const deviceAuthService = new DeviceAuthService();
export default deviceAuthService; 