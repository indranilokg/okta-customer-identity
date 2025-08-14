import React from 'react';
import styled from 'styled-components';
import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';

const StatusContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const StatusIcon = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
`;

const StatusTitle = styled.h2`
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const StatusMessage = styled.p`
  color: #666;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin: 20px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const Spinner = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  animation: spin 1s linear infinite;
  color: #007bff;
`;

const ActionButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 16px;

  &:hover {
    background: #c82333;
  }
`;

const SuccessButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 16px;

  &:hover {
    background: #218838;
  }
`;

const AuthenticationStatus = ({ 
  status, 
  message, 
  progress = 0, 
  onCancel, 
  onContinue,
  onLogout 
}) => {
  const renderStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <StatusIcon>
            <Clock size={48} color="#ffc107" />
          </StatusIcon>
        );
      case 'polling':
        return (
          <StatusIcon>
            <Spinner>
              <Loader size={48} />
            </Spinner>
          </StatusIcon>
        );
      case 'success':
        return (
          <StatusIcon>
            <CheckCircle size={48} color="#28a745" />
          </StatusIcon>
        );
      case 'error':
        return (
          <StatusIcon>
            <AlertCircle size={48} color="#dc3545" />
          </StatusIcon>
        );
      default:
        return null;
    }
  };

  const renderStatusTitle = () => {
    switch (status) {
      case 'pending':
        return 'Waiting for Authentication';
      case 'polling':
        return 'Checking Authentication Status';
      case 'success':
        return 'Authentication Successful!';
      case 'error':
        return 'Authentication Failed';
      default:
        return 'Authentication Status';
    }
  };

  const renderActionButton = () => {
    switch (status) {
      case 'pending':
      case 'polling':
        return (
          <ActionButton onClick={onCancel}>
            Cancel Authentication
          </ActionButton>
        );
      case 'success':
        return (
          <div>
            <SuccessButton onClick={onContinue}>
              Continue to Application
            </SuccessButton>
            <ActionButton onClick={onLogout} style={{ marginLeft: '12px' }}>
              Sign Out
            </ActionButton>
          </div>
        );
      case 'error':
        return (
          <ActionButton onClick={onCancel}>
            Try Again
          </ActionButton>
        );
      default:
        return null;
    }
  };

  return (
    <StatusContainer>
      {renderStatusIcon()}
      
      <StatusTitle>{renderStatusTitle()}</StatusTitle>
      
      <StatusMessage>{message}</StatusMessage>
      
      {(status === 'polling' || status === 'pending') && (
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
      )}
      
      {renderActionButton()}
    </StatusContainer>
  );
};

export default AuthenticationStatus; 