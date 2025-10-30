import { useEffect } from 'react';
import { useAuth } from './useAuth';

export function useAppInitialization() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      if (!isAuthenticated || !user) {
        return;
      }
      // No offline/sync initialization required
    };

    initializeApp();
  }, [isAuthenticated, user]);
}
