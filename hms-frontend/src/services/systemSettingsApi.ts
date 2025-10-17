import { apiClient } from './apiClient';

export interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string | null;
  defaultValue: string;
  description: string;
  settingType: string;
  isEditable: boolean;
  effectiveValue: string;
}

export interface UpdateSystemSettingRequest {
  settingKey: string;
  settingValue: string;
}

export const systemSettingsApi = {
  // Get all system settings (admin only)
  getAllSettings: (): Promise<SystemSetting[]> => {
    return apiClient.get('/settings').then(res => res.data.data);
  },

  // Get a specific setting by key (admin only)
  getSetting: (key: string): Promise<SystemSetting> => {
    return apiClient.get(`/settings/${key}`).then(res => res.data.data);
  },

  // Update a system setting (admin only)
  updateSetting: (key: string, request: UpdateSystemSettingRequest): Promise<SystemSetting> => {
    return apiClient.put(`/settings/${key}`, request).then(res => res.data.data);
  },

  // Initialize default settings (admin only)
  initializeDefaultSettings: (): Promise<string> => {
    return apiClient.post('/settings/init-defaults').then(res => res.data.data);
  },

  // Get available timezones (admin only)
  getAvailableTimezones: (): Promise<string[]> => {
    return apiClient.get('/settings/timezones').then(res => res.data.data);
  },

  // Get current timezone (public)
  getCurrentTimezone: (): Promise<string> => {
    return apiClient.get('/settings/timezone').then(res => res.data.data);
  }
};
