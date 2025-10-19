-- Fix super_admin_users table to match SuperAdminBaseEntity structure
-- Remove tenant_id column (super-admin users don't belong to tenants)
ALTER TABLE super_admin_users DROP COLUMN IF EXISTS tenant_id;

-- Add missing columns from SuperAdminBaseEntity
ALTER TABLE super_admin_users ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE super_admin_users ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE super_admin_users ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE super_admin_users ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Update existing records to have proper audit fields
UPDATE super_admin_users SET 
    deleted = FALSE,
    created_by = 'system',
    updated_by = 'system',
    version = 1
WHERE created_by IS NULL;
