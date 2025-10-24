import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { syncManagerService } from '../../services/syncManager';
import { uploadService, UploadStatus } from '../../services/uploadService';
import { serviceWorkerService } from '../../services/serviceWorkerService';
import { offlinePermissionService } from '../../services/offlinePermissionService';
import Swal from 'sweetalert2';

export const OfflineToggle: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isManualOffline, setIsManualOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(uploadService.getStatus());
  const [swStatus, setSwStatus] = useState(serviceWorkerService.getStatus());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for upload status changes
    const unsubscribeUpload = uploadService.onStatusUpdate(setUploadStatus);
    
    // Listen for service worker status changes
    const unsubscribeSW = serviceWorkerService.onStatusUpdate(setSwStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeUpload();
      unsubscribeSW();
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

  const handleUploadChanges = async () => {
    try {
      // Validate permissions before starting upload
      const dataTypes = ['patients', 'appointments', 'queue', 'staff', 'medications', 'inventory'];
      const permissionErrors: string[] = [];
      
      for (const dataType of dataTypes) {
        const validation = offlinePermissionService.validateUploadPermissions(dataType);
        if (!validation.valid) {
          permissionErrors.push(validation.error || `No permission for ${dataType}`);
        }
      }
      
      if (permissionErrors.length > 0) {
        // Show permission error toast
        Swal.fire({
          icon: 'error',
          title: 'Upload Permission Denied',
          html: `
            <div style="text-align: left;">
              <p><strong>Insufficient permissions to upload data:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${permissionErrors.map(error => `<li>${error}</li>`).join('')}
              </ul>
              <p style="margin-top: 15px; font-size: 14px; color: #666;">
                Please contact your administrator to grant the necessary upload permissions.
              </p>
            </div>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc3545'
        });
        return;
      }
      
      // Show permission success toast
      Swal.fire({
        icon: 'success',
        title: 'Upload Permissions Verified',
        text: 'You have the necessary permissions to upload offline data.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      // Start the upload
      await uploadService.uploadAllChanges();
      
      // Show upload success toast
      Swal.fire({
        icon: 'success',
        title: 'Upload Completed',
        text: 'All offline changes have been successfully uploaded to the server.',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Show upload error toast
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error instanceof Error ? error.message : 'An unexpected error occurred during upload.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  const handleCancelUpload = () => {
    uploadService.cancelUpload();
  };

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

      <Dropdown.Menu className="dropdown-menu-constrained">
        <Dropdown.Header>Connection Status</Dropdown.Header>
        <Dropdown.Item 
          onClick={handleToggleOffline}
          disabled={syncStatus === 'syncing' || uploadStatus.isUploading}
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

        {/* Upload Section */}
        <Dropdown.Divider />
        <Dropdown.Header>Data Upload</Dropdown.Header>
        
        {uploadStatus.isUploading ? (
          <>
            <Dropdown.ItemText>
              <div className="d-flex align-items-center">
                <Spinner size="sm" className="me-2" />
                <span>Uploading...</span>
              </div>
              <ProgressBar 
                now={uploadStatus.progress} 
                className="mt-1"
                style={{ height: '4px' }}
              />
              <small className="text-muted d-block mt-1">
                {uploadStatus.currentOperation}
              </small>
            </Dropdown.ItemText>
            <Dropdown.Item onClick={handleCancelUpload}>
              <i className="bi bi-x-circle me-2"></i>
              Cancel Upload
            </Dropdown.Item>
          </>
        ) : (
          <Dropdown.Item onClick={handleUploadChanges}>
            <i className="bi bi-cloud-upload me-2"></i>
            Upload Changes
          </Dropdown.Item>
        )}

        {/* Service Worker Status */}
        <Dropdown.Divider />
        <Dropdown.ItemText>
          <small className="text-muted">
            <div>Internet: {isOnline ? 'Connected' : 'Disconnected'}</div>
            <div>Service Worker: {swStatus.isActive ? 'Active' : 'Inactive'}</div>
            {uploadStatus.results.length > 0 && (
              <div className="mt-1">
                Last Upload: {uploadStatus.results[uploadStatus.results.length - 1].uploadedCount} items
              </div>
            )}
          </small>
        </Dropdown.ItemText>
      </Dropdown.Menu>
    </Dropdown>
  );
};
