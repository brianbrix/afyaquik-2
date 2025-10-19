-- Add is_tenant_super_admin field to staff_users table
ALTER TABLE staff_users ADD COLUMN is_tenant_super_admin BOOLEAN NOT NULL DEFAULT FALSE;
