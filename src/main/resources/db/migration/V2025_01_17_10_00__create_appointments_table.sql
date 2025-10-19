-- Create appointments table
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    patient_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    appointment_date_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
    appointment_type VARCHAR(64),
    reason VARCHAR(500) NOT NULL,
    notes VARCHAR(1000),
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    cancellation_reason VARCHAR(500),
    cancelled_at TIMESTAMP,
    completed_at TIMESTAMP,
    no_show_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(64),
    updated_by VARCHAR(64)
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_department_id ON appointments(department_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_tenant_provider_date ON appointments(tenant_id, provider_id, appointment_date_time);
CREATE INDEX idx_appointments_tenant_patient_date ON appointments(tenant_id, patient_id, appointment_date_time);

-- Add foreign key constraints
ALTER TABLE appointments 
    ADD CONSTRAINT fk_appointments_patient 
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

ALTER TABLE appointments 
    ADD CONSTRAINT fk_appointments_provider 
    FOREIGN KEY (provider_id) REFERENCES staff_users(id) ON DELETE CASCADE;

ALTER TABLE appointments 
    ADD CONSTRAINT fk_appointments_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE;

-- Add check constraints
ALTER TABLE appointments 
    ADD CONSTRAINT chk_appointments_duration_positive 
    CHECK (duration_minutes > 0);

ALTER TABLE appointments 
    ADD CONSTRAINT chk_appointments_status_valid 
    CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'));

-- Add unique constraint to prevent overlapping appointments for same provider
-- Note: This is a simplified constraint. In practice, you might need a more complex
-- constraint or application-level validation to handle edge cases
CREATE UNIQUE INDEX idx_appointments_provider_time_unique 
ON appointments(tenant_id, provider_id, appointment_date_time) 
WHERE status NOT IN ('CANCELLED', 'NO_SHOW', 'COMPLETED');

