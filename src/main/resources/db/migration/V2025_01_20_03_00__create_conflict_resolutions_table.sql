-- Create conflict_resolutions table
CREATE TABLE conflict_resolutions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    conflict_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    local_data TEXT,
    server_data TEXT,
    conflict_reason TEXT,
    resolution TEXT,
    resolved_by_device_id VARCHAR(255),
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_conflict_resolutions_tenant_id ON conflict_resolutions(tenant_id);
CREATE INDEX idx_conflict_resolutions_device_id ON conflict_resolutions(device_id);
CREATE INDEX idx_conflict_resolutions_entity ON conflict_resolutions(entity_type, entity_id);
CREATE INDEX idx_conflict_resolutions_status ON conflict_resolutions(status);
CREATE INDEX idx_conflict_resolutions_created_at ON conflict_resolutions(created_at);

-- Add foreign key constraints if needed
-- Note: These would need to reference actual tables in your schema
-- ALTER TABLE conflict_resolutions ADD CONSTRAINT fk_conflict_resolutions_tenant 
--     FOREIGN KEY (tenant_id) REFERENCES tenants(id);


