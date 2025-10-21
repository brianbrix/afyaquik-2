import { useState, useEffect, useCallback } from 'react';
import { syncManagerService, SyncStatus, SyncProgress } from '../services/syncManager';

export interface UseSyncManagerReturn {
  status: SyncStatus;
  progress: SyncProgress | null;
  sync: () => Promise<void>;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastBackgroundSyncTime: number | null;
  isManualOffline: boolean;
  error: string | null;
}

export function useSyncManager(): UseSyncManagerReturn {
  const [status, setStatus] = useState<SyncStatus>(syncManagerService.getStatus());
  const [progress, setProgress] = useState<SyncProgress | null>(null);

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    const handleProgressChange = (newProgress: SyncProgress) => {
      setProgress(newProgress);
    };

    syncManagerService.addStatusListener(handleStatusChange);
    syncManagerService.addProgressListener(handleProgressChange);

    return () => {
      syncManagerService.removeStatusListener(handleStatusChange);
      syncManagerService.removeProgressListener(handleProgressChange);
    };
  }, []);

  const sync = useCallback(async () => {
    try {
      await syncManagerService.sync();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, []);

  return {
    status,
    progress,
    sync,
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    lastSyncTime: status.lastSyncTime,
    lastBackgroundSyncTime: status.lastBackgroundSyncTime,
    isManualOffline: status.isManualOffline,
    error: status.error
  };
}
