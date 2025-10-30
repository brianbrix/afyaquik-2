import React, { useState, useEffect } from 'react';
import { Badge, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { websocketService, ConnectionStatus } from '../../services/websocketService';

const WebSocketStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(websocketService.getConnectionStatus());

  useEffect(() => {
    const handleStatusChange = (newStatus: ConnectionStatus) => {
      setStatus(newStatus);
    };

    websocketService.addConnectionListener(handleStatusChange);

    return () => {
      websocketService.removeConnectionListener(handleStatusChange);
    };
  }, []);

  const getStatusBadge = () => {
    if (status.connected) {
      return <Badge bg="success">Connected</Badge>;
    } else if (status.connecting) {
      return <Badge bg="warning">Connecting...</Badge>;
    } else if (status.error) {
      return <Badge bg="danger">Error</Badge>;
    } else {
      return <Badge bg="secondary">Disconnected</Badge>;
    }
  };

  const getStatusTooltip = () => {
    if (status.connected) {
      const lastConnected = status.lastConnected 
        ? new Date(status.lastConnected).toLocaleString()
        : 'Unknown';
      return `Connected since: ${lastConnected}`;
    } else if (status.connecting) {
      return 'Attempting to connect to real-time sync...';
    } else if (status.error) {
      return `Connection error: ${status.error}`;
    } else {
      return 'Not connected to real-time sync';
    }
  };

  const handleReconnect = () => {
    websocketService.reconnect();
  };

  const renderReconnectButton = () => {
    if (!status.connected && !status.connecting) {
      return (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleReconnect}
          className="ms-2"
        >
          Reconnect
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="d-flex align-items-center">
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>{getStatusTooltip()}</Tooltip>}
      >
        <div className="d-flex align-items-center">
          <span className="me-2">Sync:</span>
          {getStatusBadge()}
        </div>
      </OverlayTrigger>
      {renderReconnectButton()}
    </div>
  );
};

export default WebSocketStatus;


