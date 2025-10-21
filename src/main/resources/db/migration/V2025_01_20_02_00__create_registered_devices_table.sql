-- Create registered_devices table
CREATE TABLE registered_devices (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL UNIQUE,
    tenant_id VARCHAR(50) NOT NULL,
    device_name VARCHAR(100),
    device_type VARCHAR(50),
    description VARCHAR(500),
    device_token VARCHAR(64) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP,
    deactivated_at TIMESTAMP,
    max_snapshots INTEGER DEFAULT 10,
    snapshot_retention_days INTEGER DEFAULT 30,
    device_info TEXT,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX idx_registered_devices_tenant ON registered_devices(tenant_id);
CREATE INDEX idx_registered_devices_device_token ON registered_devices(device_token);
CREATE INDEX idx_registered_devices_active ON registered_devices(tenant_id, is_active);
CREATE INDEX idx_registered_devices_last_seen ON registered_devices(last_seen_at);
CREATE INDEX idx_registered_devices_type ON registered_devices(tenant_id, device_type);
CREATE INDEX idx_registered_devices_registered_at ON registered_devices(registered_at);

-- Create unique constraint for device-tenant combination
CREATE UNIQUE INDEX idx_registered_devices_device_tenant ON registered_devices(device_id, tenant_id);

-- Add comments
COMMENT ON TABLE registered_devices IS 'Stores registered devices for snapshot service';
COMMENT ON COLUMN registered_devices.device_id IS 'Unique identifier for the device';
COMMENT ON COLUMN registered_devices.tenant_id IS 'Tenant identifier for multi-tenancy';
COMMENT ON COLUMN registered_devices.device_name IS 'Human-readable name for the device';
COMMENT ON COLUMN registered_devices.device_type IS 'Type of device (mobile, desktop, tablet, etc.)';
COMMENT ON COLUMN registered_devices.device_token IS 'Authentication token for the device';
COMMENT ON COLUMN registered_devices.is_active IS 'Whether the device is currently active';
COMMENT ON COLUMN registered_devices.registered_at IS 'When the device was registered';
COMMENT ON COLUMN registered_devices.last_seen_at IS 'When the device was last seen online';
COMMENT ON COLUMN registered_devices.max_snapshots IS 'Maximum number of snapshots to keep for this device';
COMMENT ON COLUMN registered_devices.snapshot_retention_days IS 'Number of days to retain snapshots';
COMMENT ON COLUMN registered_devices.device_info IS 'JSON string with device capabilities and info';
