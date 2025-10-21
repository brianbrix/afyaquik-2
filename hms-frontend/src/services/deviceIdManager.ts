/**
 * Device ID Manager
 * Handles device identification, persistence, and uniqueness
 */

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  operatingSystem: string;
  fingerprint: string;
  isPersistent: boolean;
  createdAt: number;
  lastSeen: number;
}

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  screenResolution: string;
  timezone: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  colorDepth: number;
  pixelRatio: number;
}

class DeviceIdManager {
  private static readonly STORAGE_KEY = 'hms_device_info';
  private static readonly FINGERPRINT_KEY = 'hms_device_fingerprint';
  private static readonly SESSION_KEY = 'hms_session_id';
  
  private deviceInfo: DeviceInfo | null = null;

  constructor() {
    this.loadDeviceInfo();
  }

  /**
   * Get or create device information
   */
  getDeviceInfo(): DeviceInfo {
    if (this.deviceInfo) {
      this.updateLastSeen();
      return this.deviceInfo;
    }

    this.deviceInfo = this.createDeviceInfo();
    this.saveDeviceInfo();
    return this.deviceInfo;
  }

  /**
   * Get device ID only
   */
  getDeviceId(): string {
    return this.getDeviceInfo().deviceId;
  }

  /**
   * Check if device is persistent (survives browser restarts)
   */
  isDevicePersistent(): boolean {
    return this.getDeviceInfo().isPersistent;
  }

  /**
   * Regenerate device ID (useful for privacy or troubleshooting)
   */
  regenerateDeviceId(): DeviceInfo {
    this.clearDeviceInfo();
    this.deviceInfo = this.createDeviceInfo();
    this.saveDeviceInfo();
    return this.deviceInfo;
  }

  /**
   * Validate device ID format and uniqueness
   */
  validateDeviceId(deviceId: string): boolean {
    // Check format: should start with 'device_' and be alphanumeric with underscores
    const formatRegex = /^device_[a-z0-9_]+$/;
    return formatRegex.test(deviceId) && deviceId.length >= 10 && deviceId.length <= 50;
  }

  /**
   * Get device fingerprint for uniqueness checking
   */
  getDeviceFingerprint(): DeviceFingerprint {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  /**
   * Create device information from scratch
   */
  private createDeviceInfo(): DeviceInfo {
    const deviceId = this.generateDeviceId();
    const fingerprint = this.generateFingerprintHash();
    const deviceName = this.generateDeviceName();
    const deviceType = this.detectDeviceType();
    const browser = this.detectBrowser();
    const operatingSystem = this.detectOperatingSystem();
    const now = Date.now();

    return {
      deviceId,
      deviceName,
      deviceType,
      browser,
      operatingSystem,
      fingerprint,
      isPersistent: this.canUsePersistentStorage(),
      createdAt: now,
      lastSeen: now
    };
  }

  /**
   * Generate a unique device ID
   */
  private generateDeviceId(): string {
    // Try to get existing ID first
    const existing = localStorage.getItem(DeviceIdManager.STORAGE_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.deviceId && this.validateDeviceId(parsed.deviceId)) {
          return parsed.deviceId;
        }
      } catch (e) {
        console.warn('Failed to parse existing device info:', e);
      }
    }

    // Generate new ID based on fingerprint
    const fingerprint = this.generateFingerprintHash();
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    
    return `device_${fingerprint}_${timestamp}_${random}`;
  }

  /**
   * Generate fingerprint hash
   */
  private generateFingerprintHash(): string {
    const fingerprint = this.getDeviceFingerprint();
    const fingerprintString = Object.values(fingerprint).join('|');
    return this.simpleHash(fingerprintString);
  }

  /**
   * Simple hash function
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
   * Generate descriptive device name
   */
  private generateDeviceName(): string {
    const isMobile = this.isMobileDevice();
    const isTablet = this.isTabletDevice();
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
  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (this.isTabletDevice()) return 'tablet';
    if (this.isMobileDevice()) return 'mobile';
    return 'desktop';
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(): boolean {
    return /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if device is tablet
   */
  private isTabletDevice(): boolean {
    return /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent) || 
           (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
  }

  /**
   * Detect browser
   */
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
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
    
    if (/Windows NT 10/i.test(userAgent)) return 'Windows 10';
    if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7';
    if (/Windows NT 6.0/i.test(userAgent)) return 'Windows Vista';
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac OS X/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    
    return navigator.platform || 'Unknown';
  }

  /**
   * Check if persistent storage is available
   */
  private canUsePersistentStorage(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load device info from storage
   */
  private loadDeviceInfo(): void {
    try {
      const stored = localStorage.getItem(DeviceIdManager.STORAGE_KEY);
      if (stored) {
        this.deviceInfo = JSON.parse(stored);
        this.updateLastSeen();
      }
    } catch (e) {
      console.warn('Failed to load device info:', e);
      this.deviceInfo = null;
    }
  }

  /**
   * Save device info to storage
   */
  private saveDeviceInfo(): void {
    if (this.deviceInfo) {
      try {
        localStorage.setItem(DeviceIdManager.STORAGE_KEY, JSON.stringify(this.deviceInfo));
      } catch (e) {
        console.warn('Failed to save device info:', e);
      }
    }
  }

  /**
   * Update last seen timestamp
   */
  private updateLastSeen(): void {
    if (this.deviceInfo) {
      this.deviceInfo.lastSeen = Date.now();
      this.saveDeviceInfo();
    }
  }

  /**
   * Clear device info
   */
  private clearDeviceInfo(): void {
    localStorage.removeItem(DeviceIdManager.STORAGE_KEY);
    localStorage.removeItem(DeviceIdManager.FINGERPRINT_KEY);
    this.deviceInfo = null;
  }

  /**
   * Get device statistics
   */
  getDeviceStatistics(): {
    deviceId: string;
    isPersistent: boolean;
    age: number;
    lastSeen: number;
    fingerprint: string;
  } {
    const info = this.getDeviceInfo();
    return {
      deviceId: info.deviceId,
      isPersistent: info.isPersistent,
      age: Date.now() - info.createdAt,
      lastSeen: info.lastSeen,
      fingerprint: info.fingerprint
    };
  }
}

export const deviceIdManager = new DeviceIdManager();
