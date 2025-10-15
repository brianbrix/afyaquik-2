-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    decimal_places INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    version INTEGER NOT NULL DEFAULT 0
);

-- Create unique constraint for currency code per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_currencies_tenant_code ON currencies (tenant_id, code) WHERE deleted = FALSE;

-- Create index for default currency lookup
CREATE INDEX IF NOT EXISTS idx_currencies_tenant_default ON currencies (tenant_id, is_default) WHERE deleted = FALSE AND is_active = TRUE;

-- Create index for active currencies
CREATE INDEX IF NOT EXISTS idx_currencies_tenant_active ON currencies (tenant_id, is_active) WHERE deleted = FALSE;

-- Add check constraint for decimal places
ALTER TABLE currencies ADD CONSTRAINT check_decimal_places CHECK (decimal_places >= 0 AND decimal_places <= 4);

-- Add check constraint for currency code format
ALTER TABLE currencies ADD CONSTRAINT check_currency_code CHECK (LENGTH(code) = 3 AND code ~ '^[A-Z]{3}$');
