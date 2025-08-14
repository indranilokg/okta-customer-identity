import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import WelcomeScreen from './components/WelcomeScreen';
import QRCodeDisplay from './components/QRCodeDisplay';
import AuthenticationStatus from './components/AuthenticationStatus';
import UserProfile from './components/UserProfile';
import deviceAuthService from './services/deviceAuthService';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const App = () => {
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, qr, polling, success, error
  const [deviceAuthData, setDeviceAuthData] = useState(null);
  const [pollingMessage, setPollingMessage] = useState('');
  const [pollingProgress, setPollingProgress] = useState(0);
  const [tokens, setTokens] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [copyNotification, setCopyNotification] = useState('');

  // Progress animation for polling
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      if (currentStep === 'polling') {
        progress = (progress + 1) % 100;
        setPollingProgress(progress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep]);

  // Copy notification timeout
  useEffect(() => {
    if (copyNotification) {
      const timer = setTimeout(() => setCopyNotification(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyNotification]);

  const startAuthentication = async () => {
    try {
      setError(null);
      
      // Request device authorization
      console.log('Requesting device authorization...');
      const authData = await deviceAuthService.requestDeviceAuthorization();
      console.log('Device authorization response:', authData);
      
      setDeviceAuthData(authData);
      setCurrentStep('qr'); // Show QR code first
      
    } catch (error) {
      console.error('Authentication failed:', error);
      setError(error.message);
      setCurrentStep('error');
    }
  };

  const startPolling = () => {
    // Start polling for tokens after user sees QR code
    setCurrentStep('polling');
    setPollingMessage('Waiting for user authorization...');
    
    deviceAuthService.pollForTokens(
      // onProgress
      (message) => {
        console.log('Polling progress:', message);
        setPollingMessage(message);
      },
      // onSuccess
      async (tokenData) => {
        console.log('Tokens received:', tokenData);
        setTokens(tokenData);
        setCurrentStep('success');
        
        try {
          // Get user information
          const userData = await deviceAuthService.getUserInfo(tokenData.access_token);
          console.log('User info:', userData);
          setUserInfo(userData);
        } catch (userError) {
          console.error('Failed to get user info:', userError);
          // Continue without user info
        }
      },
      // onError
      (errorMessage) => {
        console.error('Polling error:', errorMessage);
        setError(errorMessage);
        setCurrentStep('error');
      }
    );
  };

  const cancelAuthentication = () => {
    deviceAuthService.clearPolling();
    deviceAuthService.reset();
    setCurrentStep('welcome');
    setDeviceAuthData(null);
    setTokens(null);
    setUserInfo(null);
    setError(null);
    setPollingMessage('');
    setPollingProgress(0);
  };

  const handleLogout = async () => {
    try {
      if (tokens?.refresh_token) {
        await deviceAuthService.revokeToken(tokens.refresh_token, 'refresh_token');
      }
    } catch (error) {
      console.error('Failed to revoke token:', error);
    }
    
    cancelAuthentication();
  };

  const handleRefreshToken = async () => {
    // This would typically use the refresh token to get a new access token
    // For demo purposes, we'll just show a message
    alert('Refresh token functionality would be implemented here in a real application.');
  };

  const handleCopyCode = () => {
    setCopyNotification('Verification code copied to clipboard!');
  };

  const handleCopyLink = () => {
    setCopyNotification('Authentication link copied to clipboard!');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen onStartAuthentication={startAuthentication} />;
      
      case 'qr':
        return deviceAuthData ? (
          <QRCodeDisplay
            userCode={deviceAuthData.userCode}
            verificationUri={deviceAuthData.verificationUri}
            verificationUriComplete={deviceAuthData.verificationUriComplete}
            expiresIn={deviceAuthData.expiresIn}
            onCopyCode={handleCopyCode}
            onCopyLink={handleCopyLink}
            onStartPolling={startPolling}
          />
        ) : null;
      
      case 'polling':
        return (
          <AuthenticationStatus
            status="polling"
            message={pollingMessage}
            progress={pollingProgress}
            onCancel={cancelAuthentication}
          />
        );
      
      case 'success':
        return userInfo ? (
          <UserProfile
            userInfo={userInfo}
            tokens={tokens}
            onLogout={handleLogout}
            onRefreshToken={handleRefreshToken}
          />
        ) : (
          <AuthenticationStatus
            status="success"
            message="Authentication successful! Loading user profile..."
            onContinue={() => setCurrentStep('welcome')}
            onLogout={handleLogout}
          />
        );
      
      case 'error':
        return (
          <AuthenticationStatus
            status="error"
            message={error || 'Authentication failed. Please try again.'}
            onCancel={cancelAuthentication}
          />
        );
      
      default:
        return <WelcomeScreen onStartAuthentication={startAuthentication} />;
    }
  };

  return (
    <AppContainer>
      {renderCurrentStep()}
      
      {/* Copy notification */}
      {copyNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#28a745',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          {copyNotification}
        </div>
      )}
    </AppContainer>
  );
};

export default App; 