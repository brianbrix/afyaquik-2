/**
 * Device Authentication API Service
 * Handles device authentication and management using apiClient
 */

import { apiClient } from './apiClient';

export interface DeviceAuthRequest {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  publicKey: string;
  timestamp: number;
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface DeviceAuthResponse {
  success: boolean;
  deviceToken?: string;
  expiresAt?: string;
  serverPublicKey?: string;
  challenge?: string;
  error?: string;
  requiresVerification?: boolean;
  verificationMethod?: string;
}

export interface DeviceVerificationRequest {
  deviceId: string;
  deviceToken: string;
  challengeResponse?: string;
  verificationCode?: string;
  biometricData?: string;
  timestamp: number;
}

export interface Device {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  isVerified: boolean;
  isActive: boolean;
  lastSeen: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface DeviceValidationResponse {
  valid: boolean;
  success: boolean;
  message?: string;
  error?: string;
}

export interface DeviceDeactivationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UserDevicesResponse {
  success: boolean;
  devices: Device[];
  count: number;
  error?: string;
}

export interface DeviceInfoResponse {
  success: boolean;
  device?: Device;
  error?: string;
}

export interface DeviceCleanupResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiEnvelope<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Array<{ message: string }>;
  meta?: any;
}

export const deviceAuthApi = {
  /**
   * Authenticate device with server
   */
  authenticateDevice: (request: DeviceAuthRequest): Promise<DeviceAuthResponse> =>
    apiClient.post<ApiEnvelope<DeviceAuthResponse>>('/auth/device/authenticate', request)
      .then(res => res.data.data),

  /**
   * Verify device with server
   */
  verifyDevice: (request: DeviceVerificationRequest): Promise<DeviceAuthResponse> =>
    apiClient.post<ApiEnvelope<DeviceAuthResponse>>('/auth/device/verify', request)
      .then(res => res.data.data),

  /**
   * Validate device token
   */
  validateDeviceToken: (deviceId: string, deviceToken: string): Promise<DeviceValidationResponse> =>
    apiClient.post<ApiEnvelope<DeviceValidationResponse>>('/auth/device/validate', null, {
      params: { deviceId, deviceToken }
    }).then(res => res.data.data),

  /**
   * Deactivate device
   */
  deactivateDevice: (deviceId: string): Promise<DeviceDeactivationResponse> =>
    apiClient.post<ApiEnvelope<DeviceDeactivationResponse>>('/auth/device/deactivate', null, {
      params: { deviceId }
    }).then(res => res.data.data),

  /**
   * Get user devices
   */
  getUserDevices: (): Promise<UserDevicesResponse> =>
    apiClient.get<ApiEnvelope<UserDevicesResponse>>('/auth/device/user-devices')
      .then(res => res.data.data),

  /**
   * Get device information
   */
  getDeviceInfo: (deviceId: string): Promise<DeviceInfoResponse> =>
    apiClient.get<ApiEnvelope<DeviceInfoResponse>>('/auth/device/info', {
      params: { deviceId }
    }).then(res => res.data.data),

  /**
   * Cleanup expired devices (admin)
   */
  cleanupExpiredDevices: (): Promise<DeviceCleanupResponse> =>
    apiClient.post<ApiEnvelope<DeviceCleanupResponse>>('/auth/device/cleanup')
      .then(res => res.data.data),
};
