import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import { Copy, ExternalLink, Smartphone, Play, Info } from 'lucide-react';

const QRContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  line-height: 1.5;
`;

const QRWrapper = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  margin: 20px 0;
  display: inline-block;
`;

const CodeSection = styled.div`
  margin: 20px 0;
`;

const CodeLabel = styled.label`
  display: block;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  text-align: left;
`;

const CodeContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
`;

const CodeText = styled.span`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 2px;
  flex: 1;
  text-align: center;
`;

const CopyButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const LinkButton = styled.a`
  background: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  padding: 12px 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
  margin: 8px;

  &:hover {
    background: #218838;
  }
`;

const StartPollingButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px auto;

  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Instructions = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
`;

const InstructionStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  background: #007bff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
`;

const StepText = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
`;

const ExpiryWarning = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CountdownText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #dc3545;
  margin: 16px 0;
`;

const DebugInfo = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  text-align: left;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

const DebugTitle = styled.div`
  font-weight: 600;
  color: #1565c0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DebugUrl = styled.div`
  color: #1976d2;
  word-break: break-all;
  margin: 4px 0;
  padding: 4px;
  background: white;
  border-radius: 4px;
`;

const QRCodeDisplay = ({ 
  userCode, 
  verificationUri, 
  verificationUriComplete, 
  expiresIn,
  onCopyCode,
  onCopyLink,
  onStartPolling 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(expiresIn);
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'code') {
        onCopyCode && onCopyCode();
      } else if (type === 'link') {
        onCopyLink && onCopyLink();
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Validate URLs
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const qrCodeUrl = verificationUriComplete || verificationUri;
  const isQrUrlValid = isValidUrl(qrCodeUrl);

  return (
    <QRContainer>
      <Header>
        <Title>Secure Authentication</Title>
        <Subtitle>
          Scan the QR code or enter the code below on your mobile device to sign in securely
        </Subtitle>
      </Header>

      <QRWrapper>
        {isQrUrlValid ? (
          <QRCode 
            value={qrCodeUrl} 
            size={200}
            level="M"
            includeMargin={true}
          />
        ) : (
          <div style={{ 
            width: 200, 
            height: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f5f5f5',
            color: '#666',
            fontSize: '14px'
          }}>
            Invalid QR Code URL
          </div>
        )}
      </QRWrapper>

      {showDebug && (
        <DebugInfo>
          <DebugTitle>
            <Info size={14} />
            Debug Information
          </DebugTitle>
          <div>
            <strong>Verification URI:</strong>
            <DebugUrl>{verificationUri || 'Not provided'}</DebugUrl>
          </div>
          <div>
            <strong>Complete URI:</strong>
            <DebugUrl>{verificationUriComplete || 'Not provided'}</DebugUrl>
          </div>
          <div>
            <strong>QR Code URL:</strong>
            <DebugUrl style={{ color: isQrUrlValid ? '#1976d2' : '#d32f2f' }}>
              {qrCodeUrl} {isQrUrlValid ? '✓' : '✗'}
            </DebugUrl>
          </div>
          <div>
            <strong>User Code:</strong> {userCode}
          </div>
        </DebugInfo>
      )}

      <CodeSection>
        <CodeLabel>Verification Code</CodeLabel>
        <CodeContainer>
          <CodeText>{userCode}</CodeText>
          <CopyButton onClick={() => copyToClipboard(userCode, 'code')}>
            <Copy size={16} />
            Copy
          </CopyButton>
        </CodeContainer>
      </CodeSection>

      <div>
        <LinkButton 
          href={verificationUri} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => copyToClipboard(verificationUri, 'link')}
        >
          <ExternalLink size={18} />
          Open Authentication Page
        </LinkButton>
      </div>

      <CountdownText>
        Time remaining: {formatTime(timeRemaining)}
      </CountdownText>

      <StartPollingButton onClick={onStartPolling}>
        <Play size={18} />
        Start Checking for Authentication
      </StartPollingButton>

      <Instructions>
        <InstructionStep>
          <StepNumber>1</StepNumber>
          <StepText>Scan the QR code with your mobile device camera or copy the verification code</StepText>
        </InstructionStep>
        <InstructionStep>
          <StepNumber>2</StepNumber>
          <StepText>Complete the sign-in process on your mobile device</StepText>
        </InstructionStep>
        <InstructionStep>
          <StepNumber>3</StepNumber>
          <StepText>Enter the verification code when prompted</StepText>
        </InstructionStep>
        <InstructionStep>
          <StepNumber>4</StepNumber>
          <StepText>Click "Start Checking for Authentication" to begin monitoring</StepText>
        </InstructionStep>
      </Instructions>

      <ExpiryWarning>
        <Smartphone size={16} />
        This code will expire in {formatTime(timeRemaining)}. Please complete authentication before it expires.
      </ExpiryWarning>
    </QRContainer>
  );
};

export default QRCodeDisplay; 