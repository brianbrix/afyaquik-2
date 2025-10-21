import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Badge } from 'react-bootstrap';
import { syncManagerService } from '../../services/syncManager';

export const OfflineToggle: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isManualOffline, setIsManualOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleOffline = async () => {
    if (isManualOffline) {
      // Switching to online - perform sync
      setSyncStatus('syncing');
      try {
        syncManagerService.setManualOffline(false);
        await syncManagerService.performInitialSync();
        setSyncStatus('idle');
      } catch (error) {
        console.error('Failed to sync when switching online:', error);
        setSyncStatus('error');
      }
    } else {
      // Switching to offline
      syncManagerService.setManualOffline(true);
    }
  };

  const getStatusColor = () => {
    if (syncStatus === 'syncing') return 'warning';
    if (syncStatus === 'error') return 'danger';
    if (isManualOffline) return 'secondary';
    if (!isOnline) return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'error') return 'Sync Error';
    if (isManualOffline) return 'Manual Offline';
    if (!isOnline) return 'Offline';
    return 'Online';
  };

  const isActuallyOffline = !isOnline || isManualOffline;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="outline-light" 
        size="sm" 
        className="d-flex align-items-center"
        disabled={syncStatus === 'syncing'}
      >
        <i className={`bi ${isActuallyOffline ? 'bi-wifi-off' : 'bi-wifi'} me-1`}></i>
        <Badge bg={getStatusColor()} className="me-1">
          {getStatusText()}
        </Badge>
        <i className="bi bi-chevron-down"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>Connection Status</Dropdown.Header>
        <Dropdown.Item 
          onClick={handleToggleOffline}
          disabled={syncStatus === 'syncing'}
        >
          <i className={`bi ${isManualOffline ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
          {isManualOffline ? 'Switch to Online' : 'Switch to Offline'}
        </Dropdown.Item>
        
        {!isActuallyOffline && (
          <Dropdown.Item onClick={() => syncManagerService.performInitialSync()}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Force Sync Now
          </Dropdown.Item>
        )}
        
        <Dropdown.Divider />
        <Dropdown.ItemText>
          <small className="text-muted">
            {isOnline ? 'Internet: Connected' : 'Internet: Disconnected'}
          </small>
        </Dropdown.ItemText>
      </Dropdown.Menu>
    </Dropdown>
  );
};
