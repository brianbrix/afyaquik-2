-- Create discounts table
CREATE TABLE discounts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    
    bill_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(19, 2) NOT NULL,
    discount_amount NUMERIC(19, 2) NOT NULL,
    applied_by VARCHAR(100) NOT NULL,
    applied_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_discounts_bill_id FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- Create indexes
CREATE INDEX idx_discounts_tenant_id ON discounts (tenant_id);
CREATE INDEX idx_discounts_bill_id ON discounts (bill_id);
CREATE INDEX idx_discounts_applied_at ON discounts (applied_at);

-- Add comment
COMMENT ON TABLE discounts IS 'Stores discounts applied to bills';
COMMENT ON COLUMN discounts.type IS 'PERCENTAGE or FIXED';
COMMENT ON COLUMN discounts.discount_value IS 'The percentage or fixed amount value';
COMMENT ON COLUMN discounts.discount_amount IS 'The calculated discount amount in currency';
