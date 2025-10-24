/**
 * Offline Debug Info Component
 * Shows debug information for offline functionality
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Badge } from 'react-bootstrap';
import { offlinePermissionService } from '../../services/offlinePermissionService';

export const OfflineDebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo(offlinePermissionService.getDebugInfo());
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    updateDebugInfo();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshDebugInfo = () => {
    offlinePermissionService.refreshSession();
    setDebugInfo(offlinePermissionService.getDebugInfo());
  };

  const clearAuditLog = () => {
    offlinePermissionService.clearAuditLog();
    setDebugInfo(offlinePermissionService.getDebugInfo());
  };

  if (!debugInfo) {
    return (
      <Card className="m-3">
        <Card.Body>
          <Alert variant="warning">Loading debug information...</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="m-3">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Offline Debug Information</h5>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={refreshDebugInfo}>
              Refresh
            </Button>
            <Button variant="outline-danger" size="sm" onClick={clearAuditLog}>
              Clear Log
            </Button>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Connection Status */}
        <Alert variant={isOnline ? 'success' : 'warning'} className="mb-3">
          <strong>Connection:</strong> {isOnline ? 'Online' : 'Offline'}
        </Alert>

        {/* Session Information */}
        <div className="mb-3">
          <h6>Session Information</h6>
          {debugInfo.session ? (
            <div className="bg-light p-3 rounded">
              <div className="row">
                <div className="col-md-6">
                  <strong>User ID:</strong> {debugInfo.session.userId}<br/>
                  <strong>Username:</strong> {debugInfo.session.username}<br/>
                  <strong>Tenant ID:</strong> {debugInfo.session.tenantId}<br/>
                  <strong>Roles:</strong> {debugInfo.session.roles?.join(', ') || 'None'}
                </div>
                <div className="col-md-6">
                  <strong>Token Expires:</strong> {debugInfo.session.tokenExpiresAt}<br/>
                  <strong>Refresh Expires:</strong> {debugInfo.session.refreshTokenExpiresAt}<br/>
                  <strong>Token Valid:</strong> <Badge bg={debugInfo.tokenValid ? 'success' : 'danger'}>
                    {debugInfo.tokenValid ? 'Yes' : 'No'}
                  </Badge><br/>
                  <strong>Refresh Valid:</strong> <Badge bg={debugInfo.refreshTokenValid ? 'success' : 'danger'}>
                    {debugInfo.refreshTokenValid ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="danger">No session found</Alert>
          )}
        </div>

        {/* Permission Information */}
        <div className="mb-3">
          <h6>Permission Information</h6>
          <div className="bg-light p-3 rounded">
            <strong>Active Role:</strong> {debugInfo.activeRole || 'None'}<br/>
            <strong>Session Valid:</strong> <Badge bg={debugInfo.sessionValid ? 'success' : 'danger'}>
              {debugInfo.sessionValid ? 'Yes' : 'No'}
            </Badge><br/>
            <strong>Cached Permissions:</strong> {Object.keys(debugInfo.permissions || {}).length} permissions
          </div>
          
          {Object.keys(debugInfo.permissions || {}).length > 0 && (
            <div className="mt-2">
              <h6>Permission Details:</h6>
              <div className="row">
                {Object.entries(debugInfo.permissions || {}).map(([permission, status]) => (
                  <div key={permission} className="col-md-4 mb-1">
                    <Badge bg={
                      status === 'ALLOWED' ? 'success' : 
                      status === 'NOT_ALLOWED' ? 'danger' : 
                      'warning'
                    }>
                      {permission}: {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit Log */}
        <div className="mb-3">
          <h6>Audit Log ({debugInfo.auditLogCount} entries)</h6>
          {debugInfo.auditLogCount > 0 ? (
            <div className="bg-light p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {offlinePermissionService.getAuditLog().slice(-10).map((entry, index) => (
                <div key={index} className="mb-2 p-2 border rounded">
                  <div className="d-flex justify-content-between">
                    <strong>{entry.action}</strong>
                    <Badge bg={entry.success ? 'success' : 'danger'}>
                      {entry.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <small className="text-muted">
                    {entry.timestamp} | User: {entry.userId} | Offline: {entry.offline ? 'Yes' : 'No'}
                  </small>
                  {entry.error && (
                    <div className="text-danger mt-1">
                      <small>Error: {entry.error}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="info">No audit log entries</Alert>
          )}
        </div>

        {/* Raw Session Data */}
        <div className="mb-3">
          <h6>Raw Session Data</h6>
          <pre className="bg-light p-3 rounded" style={{ fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
            {JSON.stringify(debugInfo.session, null, 2)}
          </pre>
        </div>

        {/* Local Storage Check */}
        <div className="mb-3">
          <h6>Local Storage Check</h6>
          <div className="bg-light p-3 rounded">
            <strong>Session Key:</strong> afyaquik.hms.session<br/>
            <strong>Active Role Key:</strong> activeRole<br/>
            <strong>Session Exists:</strong> <Badge bg={localStorage.getItem('afyaquik.hms.session') ? 'success' : 'danger'}>
              {localStorage.getItem('afyaquik.hms.session') ? 'Yes' : 'No'}
            </Badge><br/>
            <strong>Active Role Exists:</strong> <Badge bg={localStorage.getItem('activeRole') ? 'success' : 'danger'}>
              {localStorage.getItem('activeRole') ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
