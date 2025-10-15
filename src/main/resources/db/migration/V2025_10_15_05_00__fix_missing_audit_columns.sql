-- Migration: Fix missing audit columns in existing tables
-- This migration adds missing audit columns to tables that may not have them
-- due to Hibernate ddl-auto=update limitations

-- Add missing audit columns to permissions table
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Add missing audit columns to permission_assignments table
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Add missing audit columns to queue_status_role_visibility table
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Update existing records to have proper timestamps
UPDATE permissions SET 
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP,
    created_by = 'system',
    updated_by = 'system'
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE permission_assignments SET 
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP,
    created_by = 'system',
    updated_by = 'system'
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE queue_status_role_visibility SET 
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP,
    created_by = 'system',
    updated_by = 'system'
WHERE created_at IS NULL OR updated_at IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_permissions_created_at ON permissions (created_at);
CREATE INDEX IF NOT EXISTS idx_permissions_updated_at ON permissions (updated_at);
CREATE INDEX IF NOT EXISTS idx_permissions_version ON permissions (tenant_id, version);

CREATE INDEX IF NOT EXISTS idx_permission_assignments_created_at ON permission_assignments (created_at);
CREATE INDEX IF NOT EXISTS idx_permission_assignments_updated_at ON permission_assignments (updated_at);
CREATE INDEX IF NOT EXISTS idx_permission_assignments_version ON permission_assignments (tenant_id, version);

CREATE INDEX IF NOT EXISTS idx_queue_status_role_visibility_created_at ON queue_status_role_visibility (created_at);
CREATE INDEX IF NOT EXISTS idx_queue_status_role_visibility_updated_at ON queue_status_role_visibility (updated_at);
CREATE INDEX IF NOT EXISTS idx_queue_status_role_visibility_version ON queue_status_role_visibility (tenant_id, version);

-- Add comments to document the audit columns
COMMENT ON COLUMN permissions.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN permissions.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN permissions.created_by IS 'User who created the record';
COMMENT ON COLUMN permissions.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN permissions.version IS 'Version number for optimistic locking and audit trail';

COMMENT ON COLUMN permission_assignments.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN permission_assignments.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN permission_assignments.created_by IS 'User who created the record';
COMMENT ON COLUMN permission_assignments.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN permission_assignments.version IS 'Version number for optimistic locking and audit trail';

COMMENT ON COLUMN queue_status_role_visibility.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN queue_status_role_visibility.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN queue_status_role_visibility.created_by IS 'User who created the record';
COMMENT ON COLUMN queue_status_role_visibility.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN queue_status_role_visibility.version IS 'Version number for optimistic locking and audit trail';
