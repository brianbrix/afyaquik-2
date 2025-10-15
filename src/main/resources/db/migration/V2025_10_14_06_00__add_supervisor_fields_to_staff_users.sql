-- Add supervisor fields to staff_users table
ALTER TABLE staff_users ADD COLUMN supervisor_id BIGINT;
ALTER TABLE staff_users ADD COLUMN supervisor_display_name VARCHAR(128);

-- Create index for supervisor lookups
CREATE INDEX idx_staff_users_tenant_supervisor ON staff_users (tenant_id, supervisor_id);
