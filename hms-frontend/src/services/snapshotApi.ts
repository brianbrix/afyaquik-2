import { apiClient } from './apiClient';
import { deviceIdManager, DeviceInfo } from './deviceIdManager';

export interface DeviceRegistrationRequest {
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  description?: string;
}

export interface DeviceRegistrationResponse {
  deviceId: string;
  tenantId: string;
  snapshotId?: number;
  version?: number;
  dataSize?: number;
  createdAt?: string;
  message: string;
}

export interface SnapshotResponse {
  id: number;
  deviceId: string;
  tenantId: string;
  snapshotType: string;
  version: number;
  dataSize: number;
  createdAt: string;
  snapshotData: string;
  isCompressed?: boolean;
  checksum?: string;
}

export interface SnapshotData {
  patients?: any[];
  staff?: any[];
  departments?: any[];
  staffShifts?: any[];
  appointments?: any[];
  medications?: any[];
  queueItems?: any[];
  systemData?: {
    snapshotTimestamp: number;
    tenantId: string;
    dataVersion: string;
    incremental?: boolean;
    since?: number;
  };
}

class SnapshotApiService {
  private deviceId: string | null = null;
  private deviceToken: string | null = null;

  /**
   * Register a new device for snapshot service
   */
  async registerDevice(request: DeviceRegistrationRequest): Promise<DeviceRegistrationResponse> {
    try {
      // Ensure authentication headers are set
      this.ensureAuthenticationHeaders();
      
      const response = await apiClient.post('/snapshots/devices/register', request);
      const data = response.data?.data ?? response.data;
      
      // Store device credentials
      this.deviceId = data.deviceId;
      this.deviceToken = data.deviceToken;
      
      // Store in localStorage for persistence
      localStorage.setItem('hms_device_id', data.deviceId);
      localStorage.setItem('hms_device_token', data.deviceToken || '');
      
      return data;
    } catch (error) {
      console.error('Failed to register device:', error);
      throw error;
    }
  }

  /**
   * Create a full snapshot for the current device
   */
  async createFullSnapshot(): Promise<SnapshotResponse> {
    if (!this.deviceId) {
      throw new Error('Device not registered');
    }

    try {
      // Ensure authentication headers are set
      this.ensureAuthenticationHeaders();
      
      const response = await apiClient.post(`/snapshots/devices/${this.deviceId}/full`);
      const data = response.data?.data ?? response.data;
      return data;
    } catch (error) {
      console.error('Failed to create full snapshot:', error);
      throw error;
    }
  }

  /**
   * Get the latest snapshot for the current device
   */
  async getLatestSnapshot(): Promise<SnapshotResponse> {
    if (!this.deviceId) {
      throw new Error('Device not registered');
    }

    try {
      // Ensure authentication headers are set
      this.ensureAuthenticationHeaders();
      
      const response = await apiClient.get(`/snapshots/devices/${this.deviceId}/latest`);
      const data = response.data?.data ?? response.data;
      return data;
    } catch (error) {
      console.error('Failed to get latest snapshot:', error);
      throw error;
    }
  }

  /**
   * Get incremental snapshot since a specific timestamp
   */
  async getIncrementalSnapshot(since?: string): Promise<SnapshotResponse> {
    if (!this.deviceId) {
      throw new Error('Device not registered');
    }

    try {
      // Ensure authentication headers are set
      this.ensureAuthenticationHeaders();
      
      const params = since ? { since } : {};
      const response = await apiClient.get(`/snapshots/devices/${this.deviceId}/incremental`, { params });
      const data = response.data?.data ?? response.data;
      return data;
    } catch (error) {
      console.error('Failed to get incremental snapshot:', error);
      throw error;
    }
  }

  /**
   * Get all snapshots for the current device
   */
  async getAllSnapshots(): Promise<SnapshotResponse[]> {
    if (!this.deviceId) {
      throw new Error('Device not registered');
    }

    try {
      // Ensure authentication headers are set
      this.ensureAuthenticationHeaders();
      
      const response = await apiClient.get(`/snapshots/devices/${this.deviceId}/all`);
      const data = response.data?.data ?? response.data;
      return data;
    } catch (error) {
      console.error('Failed to get all snapshots:', error);
      throw error;
    }
  }

  /**
   * Check if data has changed since a specific timestamp
   */
  async checkDataChanges(since: string): Promise<boolean> {
    if (!this.deviceId) {
      throw new Error('Device not registered');
    }

    try {
      // Ensure authentication headers are set
      this.ensureAuthenticationHeaders();
      
      const response = await apiClient.get(`/snapshots/devices/${this.deviceId}/check-changes`, {
        params: { since }
      });
      const data = response.data?.data ?? response.data;
      return data;
    } catch (error) {
      console.error('Failed to check data changes:', error);
      throw error;
    }
  }

  /**
   * Cleanup old snapshots for the current device
   */
  async cleanupOldSnapshots(): Promise<string> {
    if (!this.deviceId) {
      throw new Error('Device not registered');
    }

    try {
      // Ensure authentication headers are set
      this.ensureAuthenticationHeaders();
      
      const response = await apiClient.delete(`/snapshots/devices/${this.deviceId}/cleanup`);
      const data = response.data?.data ?? response.data;
      return data;
    } catch (error) {
      console.error('Failed to cleanup old snapshots:', error);
      throw error;
    }
  }

  /**
   * Parse snapshot data from JSON string
   */
  parseSnapshotData(snapshotData: string): SnapshotData {
    try {
      return JSON.parse(snapshotData);
    } catch (error) {
      console.error('Failed to parse snapshot data:', error);
      throw new Error('Invalid snapshot data format');
    }
  }

  /**
   * Get device credentials from localStorage
   */
  getDeviceCredentials(): { deviceId: string | null; deviceToken: string | null } {
    const deviceId = localStorage.getItem('hms_device_id');
    const deviceToken = localStorage.getItem('hms_device_token');
    
    this.deviceId = deviceId;
    this.deviceToken = deviceToken;
    
    return { deviceId, deviceToken };
  }

  /**
   * Check if device is registered
   */
  isDeviceRegistered(): boolean {
    const { deviceId, deviceToken } = this.getDeviceCredentials();
    return !!(deviceId && deviceToken);
  }

  /**
   * Clear device credentials
   */
  clearDeviceCredentials(): void {
    this.deviceId = null;
    this.deviceToken = null;
    localStorage.removeItem('hms_device_id');
    localStorage.removeItem('hms_device_token');
  }

  /**
   * Generate a unique device ID using multiple strategies
   */
  generateDeviceId(): string {
    // Strategy 1: Try to get existing device ID from localStorage
    const existingDeviceId = localStorage.getItem('hms_device_id');
    if (existingDeviceId) {
      return existingDeviceId;
    }

    // Strategy 2: Try to generate a persistent device ID based on browser fingerprint
    const fingerprint = this.generateBrowserFingerprint();
    const persistentId = `device_${fingerprint}`;
    
    // Store the generated ID for future use
    localStorage.setItem('hms_device_id', persistentId);
    return persistentId;
  }

  /**
   * Generate a browser fingerprint for device identification
   */
  private generateBrowserFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.platform,
      navigator.cookieEnabled.toString(),
      navigator.doNotTrack || 'unknown'
    ];

    // Create a hash-like string from browser characteristics
    const fingerprint = components.join('|');
    return this.simpleHash(fingerprint);
  }

  /**
   * Simple hash function for fingerprint generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate a fallback device ID if fingerprint fails
   */
  private generateFallbackDeviceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const sessionId = sessionStorage.getItem('hms_session_id') || this.generateSessionId();
    return `device_${timestamp}_${random}_${sessionId}`;
  }

  /**
   * Generate a session ID for additional uniqueness
   */
  private generateSessionId(): string {
    const sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('hms_session_id', sessionId);
    return sessionId;
  }

  /**
   * Get device information using the device ID manager
   */
  getDeviceInfo(): { deviceId: string; deviceName: string; deviceType: string } {
    const deviceInfo = deviceIdManager.getDeviceInfo();
    this.deviceId = deviceInfo.deviceId;
    
    return {
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType
    };
  }

  /**
   * Generate a descriptive device name
   */
  private generateDeviceName(): string {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
    const browser = this.detectBrowser();
    const os = this.detectOperatingSystem();
    
    if (isTablet) {
      return `${os} Tablet (${browser})`;
    } else if (isMobile) {
      return `${os} Mobile (${browser})`;
    } else {
      return `${os} Desktop (${browser})`;
    }
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): string {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  }

  /**
   * Detect browser name
   */
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    if (userAgent.includes('Internet Explorer')) return 'IE';
    
    return 'Unknown';
  }

  /**
   * Detect operating system
   */
  private detectOperatingSystem(): string {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    
    return platform || 'Unknown';
  }

  /**
   * Ensure authentication headers are set for snapshot requests
   */
  private ensureAuthenticationHeaders(): void {
    // Get authentication data from session storage
    const sessionData = localStorage.getItem('afyaquik.hms.session');
    let accessToken = null;
    let tenantId = null;
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        accessToken = session.accessToken;
        tenantId = session.tenantId;
      } catch (error) {
        console.error('Failed to parse session data:', error);
      }
    }
    
    if (accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    
    if (tenantId) {
      apiClient.defaults.headers.common['X-Tenant-Id'] = tenantId;
    }
    
    // Add device ID header if available
    if (this.deviceId) {
      apiClient.defaults.headers.common['X-Device-Id'] = this.deviceId;
    }
  }
}

export const snapshotApiService = new SnapshotApiService();
