-- Add version column to all tables that extend BaseEntity
ALTER TABLE prescriptions ADD COLUMN version BIGINT DEFAULT 1;
ALTER TABLE prescription_items ADD COLUMN version BIGINT DEFAULT 1;
ALTER TABLE bills ADD COLUMN version BIGINT DEFAULT 1;
ALTER TABLE bill_items ADD COLUMN version BIGINT DEFAULT 1;
ALTER TABLE payments ADD COLUMN version BIGINT DEFAULT 1;
ALTER TABLE discounts ADD COLUMN version BIGINT DEFAULT 1;
ALTER TABLE medications ADD COLUMN version BIGINT DEFAULT 1;
ALTER TABLE inventory ADD COLUMN version BIGINT DEFAULT 1;

-- Create prescription_audit table
CREATE TABLE prescription_audit (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    prescription_id BIGINT NOT NULL,
    action_type VARCHAR(32) NOT NULL,
    previous_status VARCHAR(32),
    new_status VARCHAR(32),
    action_by VARCHAR(255),
    action_at TIMESTAMP NOT NULL,
    reason TEXT,
    changes_summary TEXT,
    prescription_data TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 1
);

-- Add indexes for prescription_audit
CREATE INDEX idx_prescription_audit_prescription ON prescription_audit(tenant_id, prescription_id);
CREATE INDEX idx_prescription_audit_tenant ON prescription_audit(tenant_id);
CREATE INDEX idx_prescription_audit_action ON prescription_audit(action_type);
CREATE INDEX idx_prescription_audit_action_by ON prescription_audit(action_by);
CREATE INDEX idx_prescription_audit_action_at ON prescription_audit(action_at);

-- Add foreign key constraint for prescription_audit
ALTER TABLE prescription_audit ADD CONSTRAINT fk_prescription_audit_prescription 
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id);

-- Add indexes for version columns
CREATE INDEX idx_prescriptions_version ON prescriptions(tenant_id, version);
CREATE INDEX idx_prescription_items_version ON prescription_items(tenant_id, version);
CREATE INDEX idx_bills_version ON bills(tenant_id, version);
CREATE INDEX idx_bill_items_version ON bill_items(tenant_id, version);
CREATE INDEX idx_payments_version ON payments(tenant_id, version);
CREATE INDEX idx_discounts_version ON discounts(tenant_id, version);
CREATE INDEX idx_medications_version ON medications(tenant_id, version);
CREATE INDEX idx_inventory_version ON inventory(tenant_id, version);
