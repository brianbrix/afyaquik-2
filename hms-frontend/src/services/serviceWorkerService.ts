/**
 * Service Worker Registration Service
 * Handles service worker registration and offline functionality
 */

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  registration: ServiceWorkerRegistration | null;
}

class ServiceWorkerService {
  private status: ServiceWorkerStatus = {
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isActive: false,
    registration: null
  };

  private listeners: ((status: ServiceWorkerStatus) => void)[] = [];

  /**
   * Subscribe to service worker status updates
   */
  onStatusUpdate(callback: (status: ServiceWorkerStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(updates: Partial<ServiceWorkerStatus>): void {
    this.status = { ...this.status, ...updates };
    this.listeners.forEach(listener => listener(this.status));
  }

  /**
   * Get current service worker status
   */
  getStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }

  /**
   * Register service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.status.isSupported) {
      console.warn('Service Worker not supported in this browser');
      return null;
    }

    try {
      console.log('Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.updateStatus({
        isRegistered: true,
        registration
      });

      console.log('Service Worker registered successfully');

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker installed, update available');
              this.updateStatus({ isActive: true });
            }
          });
        }
      });

      // Check if service worker is already active
      if (registration.active) {
        this.updateStatus({ isActive: true });
      }

      // Listen for service worker state changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        this.updateStatus({ isActive: true });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

      return registration;

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.updateStatus({
        isRegistered: false,
        isActive: false,
        registration: null
      });
      return null;
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.status.isRegistered) {
      return true;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const result = await registration.unregister();
        this.updateStatus({
          isRegistered: false,
          isActive: false,
          registration: null
        });
        console.log('Service Worker unregistered');
        return result;
      }
      return true;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (!this.status.registration) {
      throw new Error('No service worker registration found');
    }

    try {
      await this.status.registration.update();
      console.log('Service Worker update triggered');
    } catch (error) {
      console.error('Service Worker update failed:', error);
      throw error;
    }
  }

  /**
   * Skip waiting for service worker update
   */
  async skipWaiting(): Promise<void> {
    if (!this.status.registration) {
      throw new Error('No service worker registration found');
    }

    try {
      const worker = this.status.registration.waiting;
      if (worker) {
        worker.postMessage({ type: 'SKIP_WAITING' });
        console.log('Service Worker skip waiting message sent');
      }
    } catch (error) {
      console.error('Service Worker skip waiting failed:', error);
      throw error;
    }
  }

  /**
   * Cache API response
   */
  async cacheApiResponse(request: Request, response: Response): Promise<void> {
    if (!this.status.isActive) {
      return;
    }

    try {
      navigator.serviceWorker.controller?.postMessage({
        type: 'CACHE_API_RESPONSE',
        request: request.clone(),
        response: response.clone()
      });
    } catch (error) {
      console.warn('Failed to cache API response:', error);
    }
  }

  /**
   * Request background sync for offline data upload
   */
  async requestBackgroundSync(): Promise<void> {
    if (!this.status.registration) {
      throw new Error('No service worker registration found');
    }

    try {
      await this.status.registration.sync.register('upload-offline-data');
      console.log('Background sync registered for offline data upload');
    } catch (error) {
      console.error('Background sync registration failed:', error);
      throw error;
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    if (data.type === 'UPLOAD_OFFLINE_DATA') {
      console.log('Service Worker requested offline data upload');
      // Trigger upload in the main thread
      this.triggerOfflineDataUpload();
    }
  }

  /**
   * Trigger offline data upload
   */
  private triggerOfflineDataUpload(): void {
    // Dispatch custom event for upload service to handle
    window.dispatchEvent(new CustomEvent('upload-offline-data', {
      detail: { source: 'service-worker' }
    }));
  }

  /**
   * Check if app is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Listen for online/offline events
   */
  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Get cache storage info
   */
  async getCacheInfo(): Promise<{ name: string; size: number }[]> {
    if (!this.status.isSupported) {
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            size: keys.length
          };
        })
      );
      
      return cacheInfo;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return [];
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    if (!this.status.isSupported) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
      throw error;
    }
  }
}

export const serviceWorkerService = new ServiceWorkerService();
