import React from 'react';
import { Badge, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useSyncManager } from '../../hooks/useSyncManager';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ className, showDetails = false }) => {
  const { status, progress, sync, isOnline, isSyncing, lastSyncTime, lastBackgroundSyncTime, isManualOffline, error } = useSyncManager();

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = Date.now();
    const diff = now - lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const formatLastBackgroundSyncTime = () => {
    if (!lastBackgroundSyncTime) return 'Never';
    
    const now = Date.now();
    const diff = now - lastBackgroundSyncTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getStatusVariant = () => {
    if (error) return 'danger';
    if (isSyncing) return 'warning';
    if (isOnline) return 'success';
    return 'secondary';
  };

  const getStatusText = () => {
    if (error) return 'Sync Error';
    if (isSyncing) return 'Syncing...';
    if (isManualOffline) return 'Offline Mode';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const getStatusIcon = () => {
    if (error) return 'bi-exclamation-triangle';
    if (isSyncing) return 'bi-arrow-clockwise';
    if (isOnline) return 'bi-wifi';
    return 'bi-wifi-off';
  };

  return (
    <div className={className}>
      <div className="d-flex align-items-center gap-2">
        <Badge bg={getStatusVariant()} className="d-flex align-items-center gap-1">
          <i className={`bi ${getStatusIcon()}`}></i>
          {getStatusText()}
        </Badge>
        
        {isOnline && !isSyncing && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={sync}
            disabled={isSyncing}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Sync
          </Button>
        )}
      </div>

      {showDetails && (
        <div className="mt-2">
          <div className="small text-muted">
            Last sync: {formatLastSyncTime()}
          </div>
          {isManualOffline && lastBackgroundSyncTime && (
            <div className="small text-muted">
              Background sync: {formatLastBackgroundSyncTime()}
            </div>
          )}
          
          {progress && (
            <div className="mt-2">
              <ProgressBar
                now={progress.current}
                max={progress.total}
                label={`${Math.round((progress.current / progress.total) * 100)}%`}
                variant="primary"
                className="mb-1"
              />
              <div className="small text-muted">{progress.message}</div>
            </div>
          )}
          
          {error && (
            <Alert variant="danger" className="mt-2 mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
