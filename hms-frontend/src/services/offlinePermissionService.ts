/**
 * Offline Permission Service
 * Handles authorization when working offline
 */

import { offlineAuditService } from './offlineAuditService';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  tenantId: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    roles: string[];
    permissions?: Record<string, 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED'>;
  };
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface AuditLogEntry {
  userId: number;
  action: string;
  resourceId?: number;
  resourceType?: string;
  timestamp: string;
  offline: boolean;
  permissions: string[];
  success: boolean;
  error?: string;
}

class OfflinePermissionService {
  private session: StoredSession | null = null;
  private auditLog: AuditLogEntry[] = [];

  constructor() {
    this.loadSession();
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): void {
    try {
      const sessionData = localStorage.getItem('afyaquik.hms.session');
      if (sessionData) {
        this.session = JSON.parse(sessionData);
        console.log('OfflinePermissionService: Loaded session with permissions:', this.session?.user?.permissions ? Object.keys(this.session.user.permissions).length : 0);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.session = null;
    }
  }

  /**
   * Update session with permissions (called when permissions are fetched online)
   */
  updateSessionPermissions(permissions: Record<string, 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED'>): void {
    if (!this.session) {
      console.warn('OfflinePermissionService: Cannot update permissions - no session found');
      return;
    }

    // Update the session with permissions
    this.session.user.permissions = permissions;
    
    // Save updated session to localStorage
    try {
      localStorage.setItem('afyaquik.hms.session', JSON.stringify(this.session));
      console.log('OfflinePermissionService: Updated session with permissions:', Object.keys(permissions).length);
    } catch (error) {
      console.error('Failed to save session with permissions:', error);
    }
  }

  /**
   * Check if user has a specific permission offline
   */
  hasPermission(permission: string): boolean {
    console.log('OfflinePermissionService: Checking permission:', permission);
    console.log('OfflinePermissionService: Session:', this.session);
    if (!this.session) {
      this.logAudit('PERMISSION_CHECK', permission, false, 'No session found');
      return false;
    }

    if (!this.session.user?.permissions) {
      this.logAudit('PERMISSION_CHECK', permission, false, 'No permissions cached');
      return false;
    }

    const permissionState = this.session.user.permissions[permission];
    const hasAccess = permissionState === 'ALLOWED';
    
    this.logAudit('PERMISSION_CHECK', permission, hasAccess, 
      hasAccess ? 'Permission granted' : `Permission denied: ${permissionState}`);
    
    return hasAccess;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get the user's active role
   */
  getActiveRole(): string | null {
    try {
      return localStorage.getItem('activeRole');
    } catch (error) {
      console.error('Failed to get active role:', error);
      return null;
    }
  }

  /**
   * Check if the access token is still valid
   */
  isTokenValid(): boolean {
    if (!this.session) {
      return false;
    }
    
    const isValid = this.session.accessTokenExpiresAt > Date.now();
    
    if (!isValid) {
      this.logAudit('TOKEN_VALIDATION', 'access_token', false, 'Token expired');
    }
    
    return isValid;
  }

  /**
   * Check if the refresh token is still valid
   */
  isRefreshTokenValid(): boolean {
    if (!this.session) {
      return false;
    }
    
    const isValid = this.session.refreshTokenExpiresAt > Date.now();
    
    if (!isValid) {
      this.logAudit('TOKEN_VALIDATION', 'refresh_token', false, 'Refresh token expired');
    }
    
    return isValid;
  }

  /**
   * Check if the user session is valid for offline operations
   */
  isSessionValid(): boolean {
    return this.isRefreshTokenValid() && !!this.session;
  }

  /**
   * Get the user's tenant ID
   */
  getTenantId(): string | null {
    return this.session?.tenantId || null;
  }

  /**
   * Get the user's ID
   */
  getUserId(): number | null {
    return this.session?.user?.id || null;
  }

  /**
   * Get the user's username
   */
  getUsername(): string | null {
    return this.session?.user?.username || null;
  }

  /**
   * Get all cached permissions
   */
  getCachedPermissions(): Record<string, 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED'> {
    if (!this.session?.user?.permissions) {
      console.log('OfflinePermissionService: No cached permissions available');
      return {};
    }
    console.log('OfflinePermissionService: Returning cached permissions:', Object.keys(this.session.user.permissions).length);
    return this.session.user.permissions;
  }

  /**
   * Check if user can perform a specific action on a resource
   */
  canPerformAction(action: string, resourceType: string, resourceId?: number): boolean {
    const permission = `${action}_${resourceType.toUpperCase()}`;
    const hasAccess = this.hasPermission(permission);
    
    this.logAudit('ACTION_CHECK', `${action}_${resourceType}`, hasAccess, 
      hasAccess ? 'Action allowed' : 'Action denied', resourceId, resourceType);
    
    return hasAccess;
  }

  /**
   * Validate permissions for data upload
   */
  validateUploadPermissions(dataType: string): { valid: boolean; error?: string } {
    if (!this.isSessionValid()) {
      return { 
        valid: false, 
        error: 'Session expired. Please go online to refresh your session.' 
      };
    }

    if (!this.isTokenValid()) {
      return { 
        valid: false, 
        error: 'Access token expired. Please go online to refresh.' 
      };
    }

    const uploadPermission = `UPLOAD_${dataType.toUpperCase()}`;
    const editPermission = `EDIT_${dataType.toUpperCase()}`;
    
    if (!this.hasAnyPermission([uploadPermission, editPermission])) {
      return { 
        valid: false, 
        error: `Insufficient permissions to upload ${dataType} data. Required: ${uploadPermission} or ${editPermission}` 
      };
    }

    return { valid: true };
  }

  /**
   * Get authentication headers for API calls
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.session) {
      throw new Error('No authentication session found');
    }

    if (!this.isTokenValid()) {
      throw new Error('Access token expired. Please go online to refresh.');
    }

    return {
      'Authorization': `Bearer ${this.session.accessToken}`,
      'X-Tenant-ID': this.session.tenantId
    };
  }

  /**
   * Log audit entries for security tracking
   */
  private logAudit(
    action: string, 
    resource: string, 
    success: boolean, 
    message: string, 
    resourceId?: number, 
    resourceType?: string
  ): void {
    // Log to offline audit service
    offlineAuditService.logPermissionCheck(resource, success, success ? undefined : message);

    // Keep local audit log for immediate access
    const auditEntry: AuditLogEntry = {
      userId: this.getUserId() || 0,
      action,
      resourceId,
      resourceType,
      timestamp: new Date().toISOString(),
      offline: true,
      permissions: Object.keys(this.getCachedPermissions()),
      success,
      error: success ? undefined : message
    };

    this.auditLog.push(auditEntry);
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Offline Permission Audit:', auditEntry);
    }
  }

  /**
   * Get audit log entries
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Get debug information
   */
  getDebugInfo(): any {
    return {
      session: this.session ? {
        userId: this.session.user.id,
        username: this.session.user.username,
        tenantId: this.session.tenantId,
        roles: this.session.user.roles,
        tokenExpiresAt: new Date(this.session.accessTokenExpiresAt).toISOString(),
        refreshTokenExpiresAt: new Date(this.session.refreshTokenExpiresAt).toISOString()
      } : null,
      activeRole: this.getActiveRole(),
      permissions: this.getCachedPermissions(),
      tokenValid: this.isTokenValid(),
      refreshTokenValid: this.isRefreshTokenValid(),
      sessionValid: this.isSessionValid(),
      auditLogCount: this.auditLog.length
    };
  }

  /**
   * Refresh session data (called when going back online)
   */
  refreshSession(): void {
    this.loadSession();
  }

  /**
   * Check if user can access a specific route offline
   */
  canAccessRoute(route: string): boolean {
    const routePermissions: Record<string, string[]> = {
      '/patients': ['VIEW_PATIENTS'],
      '/patients/new': ['CREATE_PATIENTS'],
      '/patients/edit': ['EDIT_PATIENTS'],
      '/staff': ['VIEW_STAFF'],
      '/staff/new': ['CREATE_STAFF'],
      '/staff/edit': ['EDIT_STAFF'],
      '/appointments': ['VIEW_APPOINTMENTS'],
      '/appointments/new': ['CREATE_APPOINTMENTS'],
      '/appointments/edit': ['EDIT_APPOINTMENTS'],
      '/medications': ['VIEW_MEDICATIONS'],
      '/medications/new': ['CREATE_MEDICATIONS'],
      '/medications/edit': ['EDIT_MEDICATIONS'],
      '/queue': ['VIEW_QUEUE'],
      '/queue/edit': ['EDIT_QUEUE'],
      '/admin': ['ADMIN_ACCESS'],
      '/reports': ['VIEW_REPORTS'],
      '/billing': ['VIEW_BILLING']
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) {
      // If route not in list, allow access (conservative approach)
      return true;
    }

    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Get permission status for UI display
   */
  getPermissionStatus(permission: string): {
    status: 'ALLOWED' | 'NOT_ALLOWED' | 'UNSET' | 'UNKNOWN';
    cached: boolean;
  } {
    if (!this.session) {
      return { status: 'UNKNOWN', cached: false };
    }

    if (!this.session.user?.permissions) {
      return { status: 'UNKNOWN', cached: false };
    }

    const permissionState = this.session.user.permissions[permission];
    return {
      status: permissionState || 'UNSET',
      cached: true
    };
  }
}

export const offlinePermissionService = new OfflinePermissionService();
