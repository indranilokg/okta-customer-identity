import React, { useState } from 'react';
import { Segment, Header, Button, Icon, Message, Label, Divider } from 'semantic-ui-react';

const TokenExchangeDebug = ({ isDebugMode, onToggleDebug, tokenFlow }) => {
  const parseJwt = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return null;
    }
  };

  const renderTokenBox = (token, title, color, defaultAud, defaultScp) => {
    const parsedToken = token ? parseJwt(token) : null;
    const aud = parsedToken?.aud || defaultAud;
    const scp = parsedToken?.scp || defaultScp;

    return (
      <div style={{ 
        border: `2px solid ${color}`, 
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: `${color}10`,
        minHeight: '120px',
        width: '200px'
      }}>
        <Header as="h4" style={{ color, marginBottom: '15px' }}>{title}</Header>
        <div style={{ marginBottom: '10px' }}>
          <Label color="grey" size="tiny">audience</Label>
          <div style={{ marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8em' }}>{aud}</div>
        </div>
        <div>
          <Label color="grey" size="tiny">scopes</Label>
          <div style={{ marginTop: '5px' }}>
            {scp.map(scope => (
              <Label key={scope} size="tiny" style={{ margin: '2px' }}>{scope}</Label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderServiceBox = (title, color) => (
    <div style={{ 
      border: `2px solid ${color}`, 
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: `${color}10`,
      minHeight: '60px',
      width: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Header as="h5" style={{ color, margin: 0 }}>{title}</Header>
    </div>
  );

  const renderFlowRow = (items) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '20px',
      justifyContent: 'center'
    }}>
      {items}
    </div>
  );

  return (
    <Segment>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Header as="h3">
          <Icon name="exchange" />
          Token Exchange Illustration
        </Header>
        <div>
          <Button 
            primary 
            onClick={onToggleDebug}
            icon={isDebugMode ? 'eye slash' : 'eye'}
            content={isDebugMode ? 'Hide' : 'Show'}
          />
        </div>
      </div>

      {isDebugMode && (
        <>
          <Message info>
            <Message.Header>Token Exchange Flow</Message.Header>
            <p>This panel shows how tokens are exchanged between services.</p>
          </Message>

          <div style={{ padding: '20px 0' }}>
            {/* Row 1: Initial Token Flow */}
            {renderFlowRow([
              renderServiceBox("Okta", "#00b5ad"),
              <Icon key="arrow1" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderTokenBox(
                tokenFlow.frontendToken, 
                "Original Token", 
                "#2185d0",
                "com.api.store.acme",
                ["store:view", "store:purchase"]
              ),
              <Icon key="arrow2" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderServiceBox("Frontend", "#2185d0")
            ])}

            {/* Row 2: Frontend to Store Service */}
            {renderFlowRow([
              renderServiceBox("Frontend", "#2185d0"),
              <Icon key="arrow3" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderTokenBox(
                tokenFlow.frontendToken, 
                "Store Token", 
                "#2185d0",
                "com.api.store.acme",
                ["store:view", "store:purchase"]
              ),
              <Icon key="arrow4" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderServiceBox("Store Service", "#21ba45")
            ])}

            {/* Row 3: Token Exchange */}
            {renderFlowRow([
              renderServiceBox("Store Service", "#21ba45"),
              <Icon key="arrow5" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderTokenBox(
                tokenFlow.frontendToken, 
                "Source Token", 
                "#2185d0",
                "com.api.store.acme",
                ["store:view", "store:purchase"]
              ),
              <Icon key="arrow6" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderServiceBox("Okta", "#00b5ad"),
              <Icon key="arrow7" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderTokenBox(
                tokenFlow.exchangedToken, 
                "Target Token", 
                "#a333c8",
                "com.api.payment.acme",
                ["payments:manage", "payments:view"]
              ),
              <Icon key="arrow8" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderServiceBox("Store Service", "#21ba45")
            ])}

            {/* Row 4: Payment Flow */}
            {renderFlowRow([
              renderServiceBox("Store Service", "#21ba45"),
              <Icon key="arrow9" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderTokenBox(
                tokenFlow.exchangedToken, 
                "Payment Token", 
                "#a333c8",
                "com.api.payment.acme",
                ["payments:manage", "payments:view"]
              ),
              <Icon key="arrow10" name="arrow right" size="large" style={{ margin: '0 10px' }} />,
              renderServiceBox("Payment Service", "#a333c8")
            ])}
          </div>
        </>
      )}
    </Segment>
  );
};

export default TokenExchangeDebug; 