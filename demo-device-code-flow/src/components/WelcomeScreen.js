import React from 'react';
import styled from 'styled-components';
import { Shield, Smartphone, QrCode, ArrowRight } from 'lucide-react';

const WelcomeContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
  font-size: 32px;
`;

const Title = styled.h1`
  color: #1a1a1a;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 32px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: left;
`;

const FeatureIcon = styled.div`
  color: #007bff;
  margin-right: 16px;
  display: flex;
  align-items: center;
`;

const FeatureContent = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const FeatureDescription = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DemoNote = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  color: #1565c0;
  font-size: 14px;
  line-height: 1.4;
`;

const WelcomeScreen = ({ onStartAuthentication }) => {
  return (
    <WelcomeContainer>
      <Logo>
        <Shield size={40} />
      </Logo>
      
      <Title>Device Code Flow Demo</Title>
      <Subtitle>
        Experience secure authentication for shared devices using Okta's OAuth 2.0 Device Authorization Grant
      </Subtitle>

      <Features>
        <Feature>
          <FeatureIcon>
            <QrCode size={24} />
          </FeatureIcon>
          <FeatureContent>
            <FeatureTitle>QR Code Authentication</FeatureTitle>
            <FeatureDescription>
              Scan a QR code with your mobile device to authenticate securely without entering credentials on the shared device
            </FeatureDescription>
          </FeatureContent>
        </Feature>

        <Feature>
          <FeatureIcon>
            <Smartphone size={24} />
          </FeatureIcon>
          <FeatureContent>
            <FeatureTitle>Mobile-First Security</FeatureTitle>
            <FeatureDescription>
              Complete the authentication flow on your personal device with biometrics, passkeys, or other secure factors
            </FeatureDescription>
          </FeatureContent>
        </Feature>

        <Feature>
          <FeatureIcon>
            <Shield size={24} />
          </FeatureIcon>
          <FeatureContent>
            <FeatureTitle>Zero Credential Exposure</FeatureTitle>
            <FeatureDescription>
              Your credentials are never entered on the shared device, eliminating the risk of keyloggers or shoulder surfing
            </FeatureDescription>
          </FeatureContent>
        </Feature>
      </Features>

      <StartButton onClick={onStartAuthentication}>
        Start Authentication
        <ArrowRight size={20} />
      </StartButton>

      <DemoNote>
        <strong>Demo Note:</strong> This application demonstrates the OAuth 2.0 Device Authorization Grant flow. 
        Use your mobile device to scan the QR code and complete the authentication process securely.
      </DemoNote>
    </WelcomeContainer>
  );
};

export default WelcomeScreen; 