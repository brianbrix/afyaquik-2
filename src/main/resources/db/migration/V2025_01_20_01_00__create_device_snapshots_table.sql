-- Create device_snapshots table
CREATE TABLE device_snapshots (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    snapshot_type VARCHAR(20) NOT NULL CHECK (snapshot_type IN ('FULL', 'INCREMENTAL', 'EMERGENCY', 'VERIFICATION')),
    snapshot_data TEXT,
    version BIGINT NOT NULL,
    data_size INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_compressed BOOLEAN DEFAULT FALSE,
    checksum VARCHAR(64),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX idx_device_snapshots_device_tenant ON device_snapshots(device_id, tenant_id);
CREATE INDEX idx_device_snapshots_version ON device_snapshots(device_id, tenant_id, version DESC);
CREATE INDEX idx_device_snapshots_type ON device_snapshots(snapshot_type);
CREATE INDEX idx_device_snapshots_created_at ON device_snapshots(created_at);
CREATE INDEX idx_device_snapshots_expires_at ON device_snapshots(expires_at);
CREATE INDEX idx_device_snapshots_checksum ON device_snapshots(checksum);
CREATE INDEX idx_device_snapshots_tenant ON device_snapshots(tenant_id);

-- Create unique constraint for device-tenant-version combination
CREATE UNIQUE INDEX idx_device_snapshots_unique_version ON device_snapshots(device_id, tenant_id, version);

-- Add comments
COMMENT ON TABLE device_snapshots IS 'Stores database snapshots for devices to enable offline functionality';
COMMENT ON COLUMN device_snapshots.device_id IS 'Unique identifier for the device';
COMMENT ON COLUMN device_snapshots.tenant_id IS 'Tenant identifier for multi-tenancy';
COMMENT ON COLUMN device_snapshots.snapshot_type IS 'Type of snapshot: FULL, INCREMENTAL, EMERGENCY, or VERIFICATION';
COMMENT ON COLUMN device_snapshots.snapshot_data IS 'JSON data containing the snapshot content';
COMMENT ON COLUMN device_snapshots.version IS 'Version number for the snapshot';
COMMENT ON COLUMN device_snapshots.data_size IS 'Size of the snapshot data in bytes';
COMMENT ON COLUMN device_snapshots.is_compressed IS 'Whether the snapshot data is compressed';
COMMENT ON COLUMN device_snapshots.checksum IS 'Checksum for data integrity verification';
COMMENT ON COLUMN device_snapshots.expires_at IS 'When the snapshot expires and can be cleaned up';
