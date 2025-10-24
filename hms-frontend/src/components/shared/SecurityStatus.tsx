import React, { useState, useEffect } from 'react';
import { Badge, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { deviceAuthService, DeviceCredentials } from '../../services/deviceAuthService';

const SecurityStatus: React.FC = () => {
  const [credentials, setCredentials] = useState<DeviceCredentials | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthChange = (authenticated: boolean) => {
      setIsAuthenticated(authenticated);
      setCredentials(deviceAuthService.getCredentials());
    };

    // Initial state
    handleAuthChange(deviceAuthService.isAuthenticated());

    // Listen for auth changes
    deviceAuthService.addAuthListener(handleAuthChange);

    return () => {
      deviceAuthService.removeAuthListener(handleAuthChange);
    };
  }, []);

  const getSecurityBadge = () => {
    if (isAuthenticated) {
      return <Badge bg="success">Secured</Badge>;
    } else if (credentials) {
      return <Badge bg="warning">Unsecured</Badge>;
    } else {
      return <Badge bg="danger">No Auth</Badge>;
    }
  };

  const getSecurityTooltip = () => {
    if (isAuthenticated) {
      const expiresAt = credentials?.expiresAt;
      const expiresText = expiresAt 
        ? new Date(expiresAt).toLocaleString()
        : 'Unknown';
      return `Device authenticated. Expires: ${expiresText}`;
    } else if (credentials) {
      return 'Device credentials available but not authenticated';
    } else {
      return 'No device authentication credentials';
    }
  };

  const handleAuthenticate = async () => {
    try {
      await deviceAuthService.authenticateDevice();
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleLogout = () => {
    deviceAuthService.logout();
  };

  const renderAuthButton = () => {
    if (isAuthenticated) {
      return (
        <Button
          variant="outline-danger"
          size="sm"
          onClick={handleLogout}
          className="ms-2"
        >
          Logout
        </Button>
      );
    } else {
      return (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleAuthenticate}
          className="ms-2"
        >
          Authenticate
        </Button>
      );
    }
  };

  return (
    <div className="d-flex align-items-center">
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>{getSecurityTooltip()}</Tooltip>}
      >
        <div className="d-flex align-items-center">
          <span className="me-2">Security:</span>
          {getSecurityBadge()}
        </div>
      </OverlayTrigger>
      {renderAuthButton()}
    </div>
  );
};

export default SecurityStatus;

