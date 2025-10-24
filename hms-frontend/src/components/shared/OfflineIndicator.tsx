import React from 'react';
import { Alert } from 'react-bootstrap';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <Alert variant="warning" className="mb-0 rounded-0 text-center">
      <i className="bi bi-wifi-off me-2"></i>
      You are currently offline. Some features may be limited.
    </Alert>
  );
};

