-- Create time-off requests table
CREATE TABLE time_off_requests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    user_id BIGINT NOT NULL,
    user_display_name VARCHAR(128),
    supervisor_id BIGINT,
    supervisor_display_name VARCHAR(128),
    request_type VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP,
    reviewed_by BIGINT,
    reviewer_display_name VARCHAR(128),
    review_notes TEXT,
    emergency_contact VARCHAR(128),
    emergency_phone VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_time_off_tenant_user ON time_off_requests (tenant_id, user_id);
CREATE INDEX idx_time_off_tenant_status ON time_off_requests (tenant_id, status);
CREATE INDEX idx_time_off_tenant_dates ON time_off_requests (tenant_id, start_date, end_date);
CREATE INDEX idx_time_off_tenant_supervisor ON time_off_requests (tenant_id, supervisor_id);
CREATE INDEX idx_time_off_tenant_submitted ON time_off_requests (tenant_id, submitted_at);
