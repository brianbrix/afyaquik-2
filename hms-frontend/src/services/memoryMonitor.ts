/**
 * Memory Monitor Service
 * Monitors and manages memory usage for offline functionality
 */

export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  localStorageSize: number;
  cacheSize: number;
  databaseSize: number;
  timestamp: number;
}

export interface MemoryAlert {
  type: 'warning' | 'critical';
  message: string;
  currentUsage: number;
  threshold: number;
  timestamp: number;
}

class MemoryMonitor {
  private readonly MEMORY_THRESHOLD_WARNING = 50 * 1024 * 1024; // 50MB
  private readonly MEMORY_THRESHOLD_CRITICAL = 100 * 1024 * 1024; // 100MB
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private readonly STORAGE_AGE_LIMIT = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly CACHE_AGE_LIMIT = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  private intervalId: number | null = null;
  private alertListeners: ((alert: MemoryAlert) => void)[] = [];
  private statsListeners: ((stats: MemoryStats) => void)[] = [];

  /**
   * Start memory monitoring
   */
  startMonitoring(): void {
    if (this.intervalId) {
      return; // Already monitoring
    }

    this.intervalId = window.setInterval(() => {
      this.checkMemoryUsage();
    }, this.CHECK_INTERVAL);

    console.log('Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Memory monitoring stopped');
    }
  }

  /**
   * Get current memory statistics
   */
  async getMemoryStats(): Promise<MemoryStats> {
    const memory = (performance as any).memory;
    const usedMB = memory?.usedJSHeapSize || 0;
    const totalMB = memory?.totalJSHeapSize || 0;
    const limitMB = memory?.jsHeapSizeLimit || 0;

    return {
      usedJSHeapSize: usedMB,
      totalJSHeapSize: totalMB,
      jsHeapSizeLimit: limitMB,
      localStorageSize: await this.getLocalStorageSize(),
      cacheSize: await this.getCacheSize(),
      databaseSize: await this.getDatabaseSize(),
      timestamp: Date.now()
    };
  }

  /**
   * Check memory usage and trigger alerts if needed
   */
  private async checkMemoryUsage(): Promise<void> {
    const stats = await this.getMemoryStats();
    const usedMB = stats.usedJSHeapSize / 1024 / 1024;

    // Notify stats listeners
    this.statsListeners.forEach(listener => listener(stats));

    // Check thresholds
    if (usedMB > this.MEMORY_THRESHOLD_CRITICAL / 1024 / 1024) {
      this.triggerAlert({
        type: 'critical',
        message: `Critical memory usage: ${usedMB.toFixed(2)}MB`,
        currentUsage: stats.usedJSHeapSize,
        threshold: this.MEMORY_THRESHOLD_CRITICAL,
        timestamp: Date.now()
      });
      
      // Trigger immediate cleanup
      await this.performMemoryCleanup();
    } else if (usedMB > this.MEMORY_THRESHOLD_WARNING / 1024 / 1024) {
      this.triggerAlert({
        type: 'warning',
        message: `High memory usage: ${usedMB.toFixed(2)}MB`,
        currentUsage: stats.usedJSHeapSize,
        threshold: this.MEMORY_THRESHOLD_WARNING,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Trigger memory alert
   */
  private triggerAlert(alert: MemoryAlert): void {
    console.warn(`Memory Alert [${alert.type.toUpperCase()}]: ${alert.message}`);
    this.alertListeners.forEach(listener => listener(alert));
  }

  /**
   * Perform memory cleanup
   */
  private async performMemoryCleanup(): Promise<void> {
    console.log('Performing memory cleanup...');
    
    try {
      // Clear unused caches
      await this.clearUnusedCaches();
      
      // Compact local storage
      this.compactLocalStorage();
      
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      // Trigger cleanup in other services
      this.notifyCleanupListeners();
      
      console.log('Memory cleanup completed');
    } catch (error) {
      console.error('Memory cleanup failed:', error);
    }
  }

  /**
   * Get localStorage size in bytes
   */
  private async getLocalStorageSize(): Promise<number> {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    return totalSize;
  }

  /**
   * Get cache size in bytes
   */
  private async getCacheSize(): Promise<number> {
    try {
      const caches = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of caches) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Get database size in bytes
   */
  private async getDatabaseSize(): Promise<number> {
    try {
      // This would need to be implemented based on your database service
      // For now, return 0 as a placeholder
      return 0;
    } catch (error) {
      console.error('Failed to get database size:', error);
      return 0;
    }
  }

  /**
   * Clear unused caches
   */
  private async clearUnusedCaches(): Promise<void> {
    try {
      const caches = await caches.keys();
      const now = Date.now();
      
      for (const cacheName of caches) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          const date = response?.headers.get('date');
          
          if (date && now - new Date(date).getTime() > this.CACHE_AGE_LIMIT) {
            await cache.delete(request);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clear unused caches:', error);
    }
  }

  /**
   * Compact local storage
   */
  private compactLocalStorage(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('afyaquik.hms.')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && now - parsed.timestamp > this.STORAGE_AGE_LIMIT) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Notify cleanup listeners
   */
  private notifyCleanupListeners(): void {
    // This would notify other services to perform their own cleanup
    // For example, audit service, database service, etc.
    window.dispatchEvent(new CustomEvent('memory-cleanup-requested'));
  }

  /**
   * Add memory alert listener
   */
  addAlertListener(listener: (alert: MemoryAlert) => void): void {
    this.alertListeners.push(listener);
  }

  /**
   * Remove memory alert listener
   */
  removeAlertListener(listener: (alert: MemoryAlert) => void): void {
    const index = this.alertListeners.indexOf(listener);
    if (index > -1) {
      this.alertListeners.splice(index, 1);
    }
  }

  /**
   * Add memory stats listener
   */
  addStatsListener(listener: (stats: MemoryStats) => void): void {
    this.statsListeners.push(listener);
  }

  /**
   * Remove memory stats listener
   */
  removeStatsListener(listener: (stats: MemoryStats) => void): void {
    const index = this.statsListeners.indexOf(listener);
    if (index > -1) {
      this.statsListeners.splice(index, 1);
    }
  }

  /**
   * Force immediate memory cleanup
   */
  async forceCleanup(): Promise<void> {
    await this.performMemoryCleanup();
  }

  /**
   * Get memory usage as human-readable string
   */
  formatMemorySize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// Export singleton instance
export const memoryMonitor = new MemoryMonitor();

