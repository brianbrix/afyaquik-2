-- Fix tenants table to match SuperAdminBaseEntity structure
-- Remove tenant_id column (tenants don't belong to tenants)
ALTER TABLE tenants DROP COLUMN IF EXISTS tenant_id;

-- Add missing columns from SuperAdminBaseEntity
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Update existing records to have proper audit fields
UPDATE tenants SET 
    deleted = FALSE,
    created_by = 'system',
    updated_by = 'system',
    version = 1
WHERE created_by IS NULL;
