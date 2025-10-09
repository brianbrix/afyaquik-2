// Centralized feature flag keys
export const FEATURE_FLAGS = {
  ADMIN_UI: 'admin-ui',
  DEPARTMENTS_ADMIN: 'departments-admin'
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];
