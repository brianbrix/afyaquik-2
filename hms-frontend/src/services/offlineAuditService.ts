/**
 * Offline Audit Service
 * Handles audit trail storage and synchronization for offline operations
 */

export interface OfflineAuditEntry {
  id: string;
  userId: number;
  username: string;
  tenantId: string;
  action: string;
  resourceType?: string;
  resourceId?: number;
  resourceName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: string;
  offline: boolean;
  deviceId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface AuditSyncStatus {
  totalEntries: number;
  syncedEntries: number;
  failedEntries: number;
  lastSyncTime?: string;
  errors: string[];
}

class OfflineAuditService {
  private auditEntries: OfflineAuditEntry[] = [];
  private readonly STORAGE_KEY = 'afyaquik.hms.audit.offline';
  private readonly MAX_ENTRIES = 5000; // Maximum entries to keep locally (reduced for memory)
  private readonly CLEANUP_THRESHOLD = 4000; // Start cleanup earlier
  private readonly MAX_ENTRY_SIZE = 1024; // Max size per entry in bytes
  private readonly SYNC_BATCH_SIZE = 100; // Batch size for sync operations

  constructor() {
    this.loadAuditEntries();
  }

  /**
   * Load audit entries from localStorage
   */
  private loadAuditEntries(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.auditEntries = JSON.parse(stored);
        console.log(`Loaded ${this.auditEntries.length} offline audit entries`);
      }
    } catch (error) {
      console.error('Failed to load offline audit entries:', error);
      this.auditEntries = [];
    }
  }

  /**
   * Save audit entries to localStorage
   */
  private saveAuditEntries(): void {
    try {
      // Keep only the most recent entries to prevent storage bloat
      if (this.auditEntries.length > this.MAX_ENTRIES) {
        this.auditEntries = this.auditEntries.slice(-this.MAX_ENTRIES);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.auditEntries));
    } catch (error) {
      console.error('Failed to save offline audit entries:', error);
    }
  }

  /**
   * Create a new audit entry
   */
  logAction(
    action: string,
    resourceType?: string,
    resourceId?: number,
    resourceName?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): string {
    // Check entry size and truncate if necessary
    const entry = this.createAuditEntry(action, resourceType, resourceId, resourceName, oldValues, newValues, success, errorMessage, metadata || {});
    const entrySize = JSON.stringify(entry).length;
    
    if (entrySize > this.MAX_ENTRY_SIZE) {
      console.warn('Large audit entry detected, truncating metadata');
      entry.metadata = this.truncateMetadata(entry.metadata || {});
    }

    this.auditEntries.push(entry);
    
    // Proactive cleanup to prevent memory bloat
    if (this.auditEntries.length > this.CLEANUP_THRESHOLD) {
      this.performMemoryCleanup();
    }

    this.saveAuditEntries();
    return entry.id;
  }

  /**
   * Create audit entry
   */
  private createAuditEntry(
    action: string,
    resourceType?: string,
    resourceId?: number,
    resourceName?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string,
    metadata: Record<string, any> = {}
  ): OfflineAuditEntry {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No session found for audit logging');
    }

    return {
      id: this.generateId(),
      userId: session.userId,
      username: session.username,
      tenantId: session.tenantId,
      action,
      resourceType,
      resourceId,
      resourceName,
      oldValues,
      newValues,
      timestamp: new Date().toISOString(),
      offline: !navigator.onLine,
      deviceId: this.getDeviceId(),
      sessionId: this.getSessionId(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      success,
      errorMessage,
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Perform memory cleanup to prevent memory bloat
   */
  private performMemoryCleanup(): void {
    // Remove old entries, keep only recent ones
    if (this.auditEntries.length > this.MAX_ENTRIES) {
      this.auditEntries = this.auditEntries.slice(-this.MAX_ENTRIES);
    }
    
    // Compress metadata for older entries
    this.auditEntries.forEach((entry, index) => {
      if (index < this.auditEntries.length - 1000) {
        entry.metadata = this.compressMetadata(entry.metadata || {});
      }
    });
  }

  /**
   * Truncate metadata to prevent large entries
   */
  private truncateMetadata(metadata: Record<string, any>): Record<string, any> {
    const truncated = { ...metadata };
    Object.keys(truncated).forEach(key => {
      if (typeof truncated[key] === 'string' && truncated[key].length > 200) {
        truncated[key] = truncated[key].substring(0, 200) + '...';
      }
    });
    return truncated;
  }

  /**
   * Compress metadata for older entries
   */
  private compressMetadata(metadata: Record<string, any>): Record<string, any> {
    const compressed: Record<string, any> = {};
    Object.keys(metadata).forEach(key => {
      const value = metadata[key];
      if (typeof value === 'string' && value.length > 100) {
        compressed[key] = value.substring(0, 100) + '...';
      } else {
        compressed[key] = value;
      }
    });
    return compressed;
  }

  /**
   * Log user login
   */
  logLogin(success: boolean, errorMessage?: string): string {
    return this.logAction(
      'USER_LOGIN',
      'User',
      undefined,
      'User Login',
      undefined,
      undefined,
      success,
      errorMessage,
      { loginMethod: 'password' }
    );
  }

  /**
   * Log user logout
   */
  logLogout(): string {
    return this.logAction(
      'USER_LOGOUT',
      'User',
      undefined,
      'User Logout',
      undefined,
      undefined,
      true
    );
  }

  /**
   * Log data access
   */
  logDataAccess(
    resourceType: string,
    resourceId: number,
    resourceName: string,
    action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE'
  ): string {
    return this.logAction(
      `${action}_${resourceType.toUpperCase()}`,
      resourceType,
      resourceId,
      resourceName,
      undefined,
      undefined,
      true
    );
  }

  /**
   * Log data modification
   */
  logDataModification(
    resourceType: string,
    resourceId: number,
    resourceName: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): string {
    return this.logAction(
      `${action}_${resourceType.toUpperCase()}`,
      resourceType,
      resourceId,
      resourceName,
      oldValues,
      newValues,
      true
    );
  }

  /**
   * Log permission check
   */
  logPermissionCheck(
    permission: string,
    success: boolean,
    errorMessage?: string
  ): string {
    return this.logAction(
      'PERMISSION_CHECK',
      'Permission',
      undefined,
      permission,
      undefined,
      undefined,
      success,
      errorMessage,
      { permission }
    );
  }

  /**
   * Log upload operation
   */
  logUpload(
    dataType: string,
    itemCount: number,
    success: boolean,
    errorMessage?: string
  ): string {
    return this.logAction(
      'DATA_UPLOAD',
      dataType,
      undefined,
      `${dataType} Upload`,
      undefined,
      { itemCount },
      success,
      errorMessage,
      { dataType, itemCount }
    );
  }

  /**
   * Log sync operation
   */
  logSync(
    syncType: 'INITIAL' | 'INCREMENTAL' | 'UPLOAD',
    success: boolean,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): string {
    return this.logAction(
      'DATA_SYNC',
      'Sync',
      undefined,
      `${syncType} Sync`,
      undefined,
      undefined,
      success,
      errorMessage,
      { syncType, ...metadata }
    );
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    eventType: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    description: string,
    metadata?: Record<string, any>
  ): string {
    return this.logAction(
      'SECURITY_EVENT',
      'Security',
      undefined,
      eventType,
      undefined,
      undefined,
      true,
      undefined,
      { eventType, severity, description, ...metadata }
    );
  }

  /**
   * Get all audit entries
   */
  getAllEntries(): OfflineAuditEntry[] {
    return [...this.auditEntries];
  }

  /**
   * Get audit entries by user
   */
  getEntriesByUser(userId: number): OfflineAuditEntry[] {
    return this.auditEntries.filter(entry => entry.userId === userId);
  }

  /**
   * Get audit entries by action
   */
  getEntriesByAction(action: string): OfflineAuditEntry[] {
    return this.auditEntries.filter(entry => entry.action === action);
  }

  /**
   * Get audit entries by date range
   */
  getEntriesByDateRange(startDate: Date, endDate: Date): OfflineAuditEntry[] {
    return this.auditEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Get unsynced entries
   */
  getUnsyncedEntries(): OfflineAuditEntry[] {
    return this.auditEntries.filter(entry => !entry.metadata?.synced);
  }

  /**
   * Mark entries as synced
   */
  markAsSynced(entryIds: string[]): void {
    this.auditEntries.forEach(entry => {
      if (entryIds.includes(entry.id)) {
        entry.metadata = { ...entry.metadata, synced: true, syncedAt: new Date().toISOString() };
      }
    });
    this.saveAuditEntries();
  }

  /**
   * Sync audit entries to server
   */
  async syncToServer(): Promise<AuditSyncStatus> {
    const unsyncedEntries = this.getUnsyncedEntries();
    const status: AuditSyncStatus = {
      totalEntries: unsyncedEntries.length,
      syncedEntries: 0,
      failedEntries: 0,
      errors: []
    };

    if (unsyncedEntries.length === 0) {
      return status;
    }

    try {
      // Process in batches
      for (let i = 0; i < unsyncedEntries.length; i += this.SYNC_BATCH_SIZE) {
        const batch = unsyncedEntries.slice(i, i + this.SYNC_BATCH_SIZE);
        
        try {
          const response = await fetch('/api/v1/audit/offline', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...this.getAuthHeaders()
            },
            body: JSON.stringify({ entries: batch })
          });

          if (response.ok) {
            const syncedIds = batch.map(entry => entry.id);
            this.markAsSynced(syncedIds);
            status.syncedEntries += batch.length;
          } else {
            status.failedEntries += batch.length;
            status.errors.push(`Batch ${i / this.SYNC_BATCH_SIZE + 1}: ${response.statusText}`);
          }
        } catch (error) {
          status.failedEntries += batch.length;
          status.errors.push(`Batch ${i / this.SYNC_BATCH_SIZE + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      status.lastSyncTime = new Date().toISOString();
      return status;

    } catch (error) {
      status.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return status;
    }
  }

  /**
   * Clear old audit entries
   */
  clearOldEntries(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.auditEntries = this.auditEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate > cutoffDate;
    });

    this.saveAuditEntries();
    console.log(`Cleared audit entries older than ${daysToKeep} days`);
  }

  /**
   * Export audit entries
   */
  exportEntries(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    return JSON.stringify(this.auditEntries, null, 2);
  }

  /**
   * Export to CSV format
   */
  private exportToCSV(): string {
    if (this.auditEntries.length === 0) {
      return '';
    }

    const headers = [
      'ID', 'User ID', 'Username', 'Tenant ID', 'Action', 'Resource Type', 'Resource ID',
      'Resource Name', 'Timestamp', 'Offline', 'Success', 'Error Message'
    ];

    const rows = this.auditEntries.map(entry => [
      entry.id,
      entry.userId,
      entry.username,
      entry.tenantId,
      entry.action,
      entry.resourceType || '',
      entry.resourceId || '',
      entry.resourceName || '',
      entry.timestamp,
      entry.offline,
      entry.success,
      entry.errorMessage || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Get audit statistics
   */
  getStatistics(): {
    totalEntries: number;
    offlineEntries: number;
    onlineEntries: number;
    successRate: number;
    errorRate: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: number; username: string; count: number }>;
  } {
    const totalEntries = this.auditEntries.length;
    const offlineEntries = this.auditEntries.filter(entry => entry.offline).length;
    const onlineEntries = totalEntries - offlineEntries;
    const successfulEntries = this.auditEntries.filter(entry => entry.success).length;
    const errorEntries = totalEntries - successfulEntries;

    // Top actions
    const actionCounts = this.auditEntries.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top users
    const userCounts = this.auditEntries.reduce((acc, entry) => {
      const key = `${entry.userId}:${entry.username}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userCounts)
      .map(([key, count]) => {
        const [userId, username] = key.split(':');
        return { userId: parseInt(userId), username, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEntries,
      offlineEntries,
      onlineEntries,
      successRate: totalEntries > 0 ? (successfulEntries / totalEntries) * 100 : 0,
      errorRate: totalEntries > 0 ? (errorEntries / totalEntries) * 100 : 0,
      topActions,
      topUsers
    };
  }

  /**
   * Get current session information
   */
  private getCurrentSession(): { userId: number; username: string; tenantId: string } | null {
    try {
      const sessionData = localStorage.getItem('afyaquik.hms.session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return {
          userId: session.user.id,
          username: session.user.username,
          tenantId: session.tenantId
        };
      }
    } catch (error) {
      console.error('Failed to get current session:', error);
    }
    return null;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    try {
      const sessionData = localStorage.getItem('afyaquik.hms.session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-Tenant-ID': session.tenantId
        };
      }
    } catch (error) {
      console.error('Failed to get auth headers:', error);
    }
    return {};
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get device ID
   */
  private getDeviceId(): string {
    try {
      return localStorage.getItem('afyaquik.hms.deviceId') || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    try {
      const sessionData = localStorage.getItem('afyaquik.hms.session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.accessToken.substring(0, 20) + '...';
      }
    } catch {
      // Ignore errors
    }
    return 'unknown';
  }

  /**
   * Get client IP (approximation)
   */
  private getClientIP(): string {
    // This is a placeholder - in a real implementation, you might get this from a service
    return 'offline';
  }
}

export const offlineAuditService = new OfflineAuditService();
