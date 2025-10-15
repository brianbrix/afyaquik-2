-- Create active_roles table for persistent storage of user active roles
CREATE TABLE active_roles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    role_key VARCHAR(255) NOT NULL,
    role_name VARCHAR(255),
    role_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tenant_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_active_roles_tenant_user ON active_roles(tenant_id, user_id);
CREATE INDEX idx_active_roles_tenant_user_deleted ON active_roles(tenant_id, user_id, deleted);

-- Add foreign key constraint to users table (if it exists)
-- ALTER TABLE active_roles ADD CONSTRAINT fk_active_roles_user_id FOREIGN KEY (user_id) REFERENCES staff_users(id);
