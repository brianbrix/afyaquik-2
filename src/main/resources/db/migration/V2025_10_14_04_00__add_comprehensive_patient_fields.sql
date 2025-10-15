-- Add comprehensive patient fields to support detailed patient information
ALTER TABLE patients ADD COLUMN middle_name VARCHAR(64);
ALTER TABLE patients ADD COLUMN alternate_phone VARCHAR(32);
ALTER TABLE patients ADD COLUMN address VARCHAR(512);
ALTER TABLE patients ADD COLUMN city VARCHAR(64);
ALTER TABLE patients ADD COLUMN state VARCHAR(64);
ALTER TABLE patients ADD COLUMN postal_code VARCHAR(16);
ALTER TABLE patients ADD COLUMN country VARCHAR(64);
ALTER TABLE patients ADD COLUMN emergency_contact_name VARCHAR(128);
ALTER TABLE patients ADD COLUMN emergency_contact_phone VARCHAR(32);
ALTER TABLE patients ADD COLUMN emergency_contact_relationship VARCHAR(32);
ALTER TABLE patients ADD COLUMN allergies TEXT;
ALTER TABLE patients ADD COLUMN medications TEXT;
ALTER TABLE patients ADD COLUMN medical_history TEXT;
ALTER TABLE patients ADD COLUMN notes TEXT;

-- Add indexes for commonly searched fields
CREATE INDEX idx_patients_tenant_city ON patients (tenant_id, city);
CREATE INDEX idx_patients_tenant_country ON patients (tenant_id, country);
CREATE INDEX idx_patients_emergency_contact ON patients (tenant_id, emergency_contact_name);
