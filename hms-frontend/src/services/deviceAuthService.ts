/**
 * Device Authentication Service
 * Handles device authentication and secure communication
 */

import { deviceIdManager } from './deviceIdManager';
import { encryptionService } from './encryptionService';
import { deviceAuthApi, DeviceAuthRequest, DeviceVerificationRequest } from './deviceAuthApi';

export interface DeviceCredentials {
  deviceId: string;
  deviceToken: string;
  publicKey: string;
  privateKey: string;
  isAuthenticated: boolean;
  expiresAt: number;
}

export interface AuthenticationResult {
  success: boolean;
  token?: string;
  expiresAt?: number;
  error?: string;
}

class DeviceAuthService {
  private credentials: DeviceCredentials | null = null;
  private authListeners: ((authenticated: boolean) => void)[] = [];

  constructor() {
    this.loadStoredCredentials();
  }

  /**
   * Authenticate device with server
   */
  async authenticateDevice(): Promise<AuthenticationResult> {
    try {
      const deviceInfo = deviceIdManager.getDeviceInfo();
      
      // Generate device credentials if not exists
      if (!this.credentials) {
        await this.generateDeviceCredentials();
      }

      // Generate device fingerprint
      const deviceFingerprint = await this.generateDeviceFingerprint();

      // Send authentication request to server
      const authRequest: DeviceAuthRequest = {
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        publicKey: this.credentials!.publicKey,
        timestamp: Date.now(),
        deviceFingerprint: deviceFingerprint,
        userAgent: navigator.userAgent,
        ipAddress: 'offline' // Will be set by server
      };

      const result = await deviceAuthApi.authenticateDevice(authRequest);

      if (result.success) {
        this.credentials!.isAuthenticated = true;
        this.credentials!.expiresAt = result.expiresAt ? new Date(result.expiresAt).getTime() : Date.now() + (24 * 60 * 60 * 1000);
        this.credentials!.deviceToken = result.deviceToken || '';
        this.saveCredentials();
        this.notifyAuthListeners(true);

        return {
          success: true,
          token: result.deviceToken,
          expiresAt: result.expiresAt ? new Date(result.expiresAt).getTime() : Date.now() + (24 * 60 * 60 * 1000)
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Device authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Generate device credentials
   */
  private async generateDeviceCredentials(): Promise<void> {
    const deviceInfo = deviceIdManager.getDeviceInfo();
    
    // Generate encryption key pair
    const keyPair = await this.generateKeyPair();
    
    // Generate device token
    const deviceToken = this.generateDeviceToken();
    
    this.credentials = {
      deviceId: deviceInfo.deviceId,
      deviceToken,
      publicKey: await this.exportPublicKey(keyPair.publicKey),
      privateKey: await this.exportPrivateKey(keyPair.privateKey),
      isAuthenticated: false,
      expiresAt: 0
    };

    this.saveCredentials();
  }

  /**
   * Generate RSA key pair for device authentication
   */
  private async generateKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export public key to string
   */
  private async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('spki', publicKey);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Export private key to string
   */
  private async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Generate device token
   */
  private generateDeviceToken(): string {
    const deviceInfo = deviceIdManager.getDeviceInfo();
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `device_${deviceInfo.deviceId}_${timestamp}_${random}`;
  }

  /**
   * Generate mock token for development
   */
  private generateMockToken(): string {
    const deviceInfo = deviceIdManager.getDeviceInfo();
    const timestamp = Date.now().toString();
    return `mock_token_${deviceInfo.deviceId}_${timestamp}`;
  }

  /**
   * Sign data with device private key
   */
  async signData(data: string): Promise<string> {
    if (!this.credentials || !this.credentials.isAuthenticated) {
      throw new Error('Device not authenticated');
    }

    try {
      const privateKey = await this.importPrivateKey(this.credentials.privateKey);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const signature = await crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32
        },
        privateKey,
        dataBuffer
      );

      return this.arrayBufferToBase64(signature);
    } catch (error) {
      console.error('Data signing failed:', error);
      throw new Error('Data signing failed');
    }
  }

  /**
   * Verify data signature
   */
  async verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
    try {
      const key = await this.importPublicKey(publicKey);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const signatureBuffer = this.base64ToArrayBuffer(signature);
      
      return await crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32
        },
        key,
        signatureBuffer,
        dataBuffer
      );
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Encrypt data for secure transmission
   */
  async encryptForTransmission(data: string, recipientPublicKey: string): Promise<string> {
    try {
      const key = await this.importPublicKey(recipientPublicKey);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        key,
        dataBuffer
      );

      return this.arrayBufferToBase64(encrypted);
    } catch (error) {
      console.error('Data encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt received data
   */
  async decryptReceivedData(encryptedData: string): Promise<string> {
    if (!this.credentials || !this.credentials.isAuthenticated) {
      throw new Error('Device not authenticated');
    }

    try {
      const privateKey = await this.importPrivateKey(this.credentials.privateKey);
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP'
        },
        privateKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Data decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Get device credentials
   */
  getCredentials(): DeviceCredentials | null {
    return this.credentials;
  }

  /**
   * Check if device is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.credentials) {
      return false;
    }

    // Check if token is expired
    if (this.credentials.expiresAt && Date.now() > this.credentials.expiresAt) {
      this.credentials.isAuthenticated = false;
      this.saveCredentials();
      return false;
    }

    return this.credentials.isAuthenticated;
  }

  /**
   * Logout device
   */
  logout(): void {
    this.credentials = null;
    this.clearStoredCredentials();
    this.notifyAuthListeners(false);
  }

  /**
   * Add authentication listener
   */
  addAuthListener(listener: (authenticated: boolean) => void): void {
    this.authListeners.push(listener);
  }

  /**
   * Remove authentication listener
   */
  removeAuthListener(listener: (authenticated: boolean) => void): void {
    this.authListeners = this.authListeners.filter(l => l !== listener);
  }

  /**
   * Load stored credentials
   */
  private loadStoredCredentials(): void {
    try {
      const stored = localStorage.getItem('hms_device_credentials');
      if (stored) {
        this.credentials = JSON.parse(stored);
        
        // Check if credentials are expired
        if (this.credentials!.expiresAt && Date.now() > this.credentials!.expiresAt) {
          this.credentials!.isAuthenticated = false;
          this.saveCredentials();
        }
      }
    } catch (error) {
      console.error('Failed to load stored credentials:', error);
      this.clearStoredCredentials();
    }
  }

  /**
   * Save credentials to storage
   */
  private saveCredentials(): void {
    if (this.credentials) {
      localStorage.setItem('hms_device_credentials', JSON.stringify(this.credentials));
    }
  }

  /**
   * Clear stored credentials
   */
  private clearStoredCredentials(): void {
    localStorage.removeItem('hms_device_credentials');
  }

  /**
   * Notify authentication listeners
   */
  private notifyAuthListeners(authenticated: boolean): void {
    this.authListeners.forEach(listener => listener(authenticated));
  }

  /**
   * Import public key from string
   */
  private async importPublicKey(publicKeyString: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(publicKeyString);
    return await crypto.subtle.importKey(
      'spki',
      keyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['encrypt']
    );
  }

  /**
   * Import private key from string
   */
  private async importPrivateKey(privateKeyString: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(privateKeyString);
    return await crypto.subtle.importKey(
      'pkcs8',
      keyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      false,
      ['decrypt', 'sign']
    );
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate device fingerprint with enhanced uniqueness
   */
  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    // WebGL fingerprint
    let webglFingerprint = '';
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (gl) {
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        const version = gl.getParameter(gl.VERSION);
        const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        webglFingerprint = `${renderer}|${vendor}|${version}|${shadingLanguageVersion}`;
      }
    } catch (e) {
      webglFingerprint = 'webgl-unavailable';
    }
    
    // Audio context fingerprint
    let audioFingerprint = '';
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioFingerprint = audioContext.sampleRate.toString();
      audioContext.close();
    } catch (e) {
      audioFingerprint = 'audio-unavailable';
    }
    
    // Font detection
    const testFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Tahoma', 'Geneva'
    ];
    const availableFonts = this.detectAvailableFonts(testFonts);
    
    // Hardware information
    const hardwareInfo = [
      navigator.hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown',
      navigator.maxTouchPoints || 'unknown',
      screen.colorDepth,
      screen.pixelDepth,
      window.devicePixelRatio || 'unknown'
    ].join('|');
    
    // Timezone and locale information
    const timezoneInfo = [
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      Intl.DateTimeFormat().resolvedOptions().locale,
      Intl.NumberFormat().resolvedOptions().locale
    ].join('|');
    
    // Media capabilities
    let mediaCapabilities = '';
    try {
      if ('mediaCapabilities' in navigator) {
        const mediaCap = (navigator as any).mediaCapabilities;
        mediaCapabilities = JSON.stringify(mediaCap);
      } else {
        mediaCapabilities = 'media-capabilities-unavailable';
      }
    } catch (e) {
      mediaCapabilities = 'media-capabilities-error';
    }
    
    // Battery information (if available)
    let batteryInfo = '';
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        batteryInfo = `${battery.level}|${battery.charging}`;
      } else {
        batteryInfo = 'battery-unavailable';
      }
    } catch (e) {
      batteryInfo = 'battery-error';
    }
    
    // Connection information
    let connectionInfo = '';
    try {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        connectionInfo = `${conn.effectiveType}|${conn.downlink}|${conn.rtt}`;
      } else {
        connectionInfo = 'connection-unavailable';
      }
    } catch (e) {
      connectionInfo = 'connection-error';
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL(),
      webglFingerprint,
      audioFingerprint,
      availableFonts,
      hardwareInfo,
      timezoneInfo,
      mediaCapabilities,
      batteryInfo,
      connectionInfo
    ].join('|');
    
    return await this.hashString(fingerprint);
  }

  /**
   * Detect available fonts on the system
   */
  private detectAvailableFonts(testFonts: string[]): string {
    const availableFonts: string[] = [];
    
    // Create a test element
    const testElement = document.createElement('span');
    testElement.style.fontSize = '12px';
    testElement.style.fontFamily = 'monospace';
    testElement.textContent = 'Test';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.top = '-9999px';
    document.body.appendChild(testElement);
    
    // Get baseline width with monospace font
    const baselineWidth = testElement.offsetWidth;
    
    // Test each font
    for (const font of testFonts) {
      testElement.style.fontFamily = `"${font}", monospace`;
      const width = testElement.offsetWidth;
      
      // If width is different from baseline, font is available
      if (width !== baselineWidth) {
        availableFonts.push(font);
      }
    }
    
    // Clean up
    document.body.removeChild(testElement);
    
    return availableFonts.join(',');
  }

  /**
   * Hash string using SHA-256
   */
  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  }


  /**
   * Verify device with server
   */
  async verifyDevice(challengeResponse: string, verificationCode?: string): Promise<AuthenticationResult> {
    try {
      if (!this.credentials) {
        throw new Error('Device not authenticated');
      }

      const verifyRequest: DeviceVerificationRequest = {
        deviceId: this.credentials.deviceId,
        deviceToken: this.credentials.deviceToken,
        challengeResponse: challengeResponse,
        verificationCode: verificationCode,
        timestamp: Date.now()
      };

      const result = await deviceAuthApi.verifyDevice(verifyRequest);

      if (result.success) {
        this.credentials.isAuthenticated = true;
        this.credentials.expiresAt = result.expiresAt ? new Date(result.expiresAt).getTime() : Date.now() + (24 * 60 * 60 * 1000);
        this.saveCredentials();
        this.notifyAuthListeners(true);

        return {
          success: true,
          token: result.deviceToken,
          expiresAt: result.expiresAt ? new Date(result.expiresAt).getTime() : Date.now() + (24 * 60 * 60 * 1000)
        };
      } else {
        return {
          success: false,
          error: result.error || 'Verification failed'
        };
      }
    } catch (error) {
      console.error('Device verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Validate device token with server
   */
  async validateDeviceToken(): Promise<boolean> {
    try {
      if (!this.credentials) {
        return false;
      }

      const result = await deviceAuthApi.validateDeviceToken(this.credentials.deviceId, this.credentials.deviceToken);
      return result.valid === true;
    } catch (error) {
      console.error('Device token validation failed:', error);
      return false;
    }
  }

  /**
   * Deactivate device
   */
  async deactivateDevice(): Promise<boolean> {
    try {
      if (!this.credentials) {
        return false;
      }

      const result = await deviceAuthApi.deactivateDevice(this.credentials.deviceId);
      
      if (result.success) {
        this.logout();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Device deactivation failed:', error);
      return false;
    }
  }

  /**
   * Get user devices
   */
  async getUserDevices(): Promise<any[]> {
    try {
      const result = await deviceAuthApi.getUserDevices();
      return result.devices || [];
    } catch (error) {
      console.error('Failed to get user devices:', error);
      return [];
    }
  }
}

export const deviceAuthService = new DeviceAuthService();

