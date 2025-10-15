-- Update payments table to use PaymentMethod entity instead of enum
-- First, add the new foreign key column
ALTER TABLE payments ADD COLUMN payment_method_id BIGINT;

-- Create foreign key constraint
ALTER TABLE payments ADD CONSTRAINT fk_payments_payment_method_id 
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);

-- Create index for performance
CREATE INDEX idx_payments_payment_method_id ON payments (payment_method_id);

-- Note: The old payment_method column will be dropped in a future migration
-- after ensuring all data is migrated to use the new foreign key relationship
