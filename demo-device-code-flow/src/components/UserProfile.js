import React from 'react';
import styled from 'styled-components';
import { User, Mail, Calendar, Shield, LogOut } from 'lucide-react';

const ProfileContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const WelcomeTitle = styled.h2`
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 32px;
  font-weight: 600;
`;

const ProfileInfo = styled.div`
  margin-bottom: 32px;
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const InfoIcon = styled.div`
  color: #007bff;
  margin-right: 16px;
  display: flex;
  align-items: center;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  color: #666;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 500;
`;

const TokenInfo = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const TokenTitle = styled.h3`
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

const TokenLabel = styled.span`
  color: #666;
  font-size: 14px;
`;

const TokenValue = styled.span`
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  &:hover {
    background: #c82333;
  }
`;

const RefreshButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  &:hover {
    background: #0056b3;
  }
`;

const UserProfile = ({ userInfo, tokens, onLogout, onRefreshToken }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatExpiry = (expiresIn) => {
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    return expiryDate.toLocaleString();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProfileContainer>
      <Header>
        <Avatar>
          {getInitials(userInfo.name || userInfo.email)}
        </Avatar>
        <WelcomeTitle>Welcome, {userInfo.name || userInfo.email}!</WelcomeTitle>
        <Subtitle>You have successfully authenticated using device code flow</Subtitle>
      </Header>

      <ProfileInfo>
        <InfoSection>
          <InfoIcon>
            <User size={20} />
          </InfoIcon>
          <InfoContent>
            <InfoLabel>Full Name</InfoLabel>
            <InfoValue>{userInfo.name || 'Not provided'}</InfoValue>
          </InfoContent>
        </InfoSection>

        <InfoSection>
          <InfoIcon>
            <Mail size={20} />
          </InfoIcon>
          <InfoContent>
            <InfoLabel>Email Address</InfoLabel>
            <InfoValue>{userInfo.email || 'Not provided'}</InfoValue>
          </InfoContent>
        </InfoSection>

        {userInfo.updated_at && (
          <InfoSection>
            <InfoIcon>
              <Calendar size={20} />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Profile Updated</InfoLabel>
              <InfoValue>{formatDate(userInfo.updated_at)}</InfoValue>
            </InfoContent>
          </InfoSection>
        )}
      </ProfileInfo>

      <TokenInfo>
        <TokenTitle>
          <Shield size={20} />
          Token Information
        </TokenTitle>
        
        <TokenItem>
          <TokenLabel>Token Type:</TokenLabel>
          <TokenValue>{tokens.token_type}</TokenValue>
        </TokenItem>
        
        <TokenItem>
          <TokenLabel>Expires In:</TokenLabel>
          <TokenValue>{tokens.expires_in} seconds</TokenValue>
        </TokenItem>
        
        <TokenItem>
          <TokenLabel>Expires At:</TokenLabel>
          <TokenValue>{formatExpiry(tokens.expires_in)}</TokenValue>
        </TokenItem>
        
        <TokenItem>
          <TokenLabel>Scope:</TokenLabel>
          <TokenValue>{tokens.scope}</TokenValue>
        </TokenItem>
        
        {tokens.refresh_token && (
          <TokenItem>
            <TokenLabel>Refresh Token:</TokenLabel>
            <TokenValue>Available</TokenValue>
          </TokenItem>
        )}
      </TokenInfo>

      <ActionButtons>
        <RefreshButton onClick={onRefreshToken}>
          <Shield size={16} />
          Refresh Token
        </RefreshButton>
        <LogoutButton onClick={onLogout}>
          <LogOut size={16} />
          Sign Out
        </LogoutButton>
      </ActionButtons>
    </ProfileContainer>
  );
};

export default UserProfile; 