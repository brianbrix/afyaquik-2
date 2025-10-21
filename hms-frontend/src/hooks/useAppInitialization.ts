import { useEffect } from 'react';
import { syncManagerService } from '../services/syncManager';
import { useAuth } from './useAuth';

export function useAppInitialization() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only initialize sync manager after user is authenticated
    const initializeApp = async () => {
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, skipping sync initialization');
        return;
      }

      try {
        console.log('Initializing app with sync manager for authenticated user...');
        
        // Perform initial sync if device is registered
        if (syncManagerService.isDeviceRegistered()) {
          console.log('Device is registered, performing initial sync...');
          await syncManagerService.performInitialSync();
        } else {
          console.log('Device not registered, will register on first sync');
        }
        
        console.log('App initialization completed');
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();
  }, [isAuthenticated, user]);
}
