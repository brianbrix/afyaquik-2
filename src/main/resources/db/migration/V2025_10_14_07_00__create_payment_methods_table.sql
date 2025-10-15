-- Create payment methods table
CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_authorization BOOLEAN NOT NULL DEFAULT false,
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_payment_methods_tenant_id ON payment_methods (tenant_id);
CREATE INDEX idx_payment_methods_code ON payment_methods (tenant_id, code);
CREATE INDEX idx_payment_methods_active ON payment_methods (tenant_id, is_active);
CREATE INDEX idx_payment_methods_sort_order ON payment_methods (tenant_id, sort_order);

-- Create unique constraint for code per tenant
CREATE UNIQUE INDEX idx_payment_methods_code_unique ON payment_methods (tenant_id, code) WHERE deleted = false;

-- Insert default payment methods
INSERT INTO payment_methods (tenant_id, name, code, description, is_active, sort_order) VALUES
('clinic-a', 'Cash', 'CASH', 'Cash payment', true, 1),
('clinic-a', 'Credit Card', 'CREDIT_CARD', 'Credit card payment', true, 2),
('clinic-a', 'Debit Card', 'DEBIT_CARD', 'Debit card payment', true, 3),
('clinic-a', 'Mobile Money', 'MOBILE_MONEY', 'Mobile money payment (M-Pesa, Airtel Money, etc.)', true, 4),
('clinic-a', 'Bank Transfer', 'BANK_TRANSFER', 'Bank transfer payment', true, 5),
('clinic-a', 'Insurance', 'INSURANCE', 'Insurance payment', true, 6),
('clinic-a', 'Cheque', 'CHEQUE', 'Cheque payment', true, 7);
