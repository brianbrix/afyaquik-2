/**
 * Device Management Component
 * Manages device authentication and device list
 */

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { deviceAuthService, DeviceCredentials } from '../../services/deviceAuthService';

interface Device {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  isVerified: boolean;
  isActive: boolean;
  lastSeen: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
}

export const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDevice, setCurrentDevice] = useState<DeviceCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [challengeResponse, setChallengeResponse] = useState('');

  useEffect(() => {
    loadDevices();
    loadCurrentDevice();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const userDevices = await deviceAuthService.getUserDevices();
      setDevices(userDevices);
    } catch (error) {
      setError('Failed to load devices');
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentDevice = () => {
    const credentials = deviceAuthService.getCredentials();
    setCurrentDevice(credentials);
  };

  const handleAuthenticateDevice = async () => {
    try {
      setLoading(true);
      const result = await deviceAuthService.authenticateDevice();
      
      if (result.success) {
        loadCurrentDevice();
        loadDevices();
        setError(null);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Device authentication failed');
      console.error('Device authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDevice = async () => {
    try {
      setLoading(true);
      const result = await deviceAuthService.verifyDevice(challengeResponse, verificationCode);
      
      if (result.success) {
        setShowVerificationModal(false);
        loadCurrentDevice();
        loadDevices();
        setError(null);
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (error) {
      setError('Device verification failed');
      console.error('Device verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateDevice = async (deviceId: string) => {
    if (window.confirm('Are you sure you want to deactivate this device?')) {
      try {
        setLoading(true);
        const success = await deviceAuthService.deactivateDevice();
        
        if (success) {
          loadDevices();
          setError(null);
        } else {
          setError('Failed to deactivate device');
        }
      } catch (error) {
        setError('Device deactivation failed');
        console.error('Device deactivation failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDeviceStatusBadge = (device: Device) => {
    if (!device.isActive) {
      return <Badge bg="danger">Inactive</Badge>;
    }
    if (!device.isVerified) {
      return <Badge bg="warning">Unverified</Badge>;
    }
    return <Badge bg="success">Active</Badge>;
  };

  const getDeviceTypeBadge = (deviceType: string) => {
    const colors: Record<string, string> = {
      'desktop': 'primary',
      'mobile': 'info',
      'tablet': 'secondary',
      'unknown': 'light'
    };
    return <Badge bg={colors[deviceType] || 'light'}>{deviceType}</Badge>;
  };

  return (
    <div className="p-3">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Device Management</h5>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleAuthenticateDevice}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Authenticate Device'}
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={loadDevices}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {/* Current Device Status */}
          {currentDevice && (
            <Alert variant={currentDevice.isAuthenticated ? 'success' : 'warning'} className="mb-3">
              <Alert.Heading>Current Device</Alert.Heading>
              <p>
                <strong>Device ID:</strong> {currentDevice.deviceId}<br/>
                <strong>Status:</strong> {currentDevice.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}<br/>
                <strong>Expires:</strong> {new Date(currentDevice.expiresAt).toLocaleString()}
              </p>
              {!currentDevice.isAuthenticated && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => setShowVerificationModal(true)}
                >
                  Verify Device
                </Button>
              )}
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {/* Devices Table */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <Table striped bordered hover size="sm">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <tr>
                  <th>Device Name</th>
                  <th>Device ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                  <th>IP Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td>
                      <div>
                        <strong>{device.deviceName}</strong>
                        <br />
                        <small className="text-muted">{device.userAgent}</small>
                      </div>
                    </td>
                    <td>
                      <code>{device.deviceId}</code>
                    </td>
                    <td>
                      {getDeviceTypeBadge(device.deviceType)}
                    </td>
                    <td>
                      {getDeviceStatusBadge(device)}
                    </td>
                    <td>
                      {formatTimestamp(device.lastSeen)}
                    </td>
                    <td>
                      <code>{device.ipAddress}</code>
                    </td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeactivateDevice(device.deviceId)}
                        disabled={loading}
                      >
                        Deactivate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {devices.length === 0 && !loading && (
            <Alert variant="info" className="text-center">
              No devices found. Authenticate your device to get started.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Verification Modal */}
      <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Verification Code (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Challenge Response</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter challenge response"
                value={challengeResponse}
                onChange={(e) => setChallengeResponse(e.target.value)}
              />
              <Form.Text className="text-muted">
                This is typically generated by your device's cryptographic functions.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerificationModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVerifyDevice} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Device'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
