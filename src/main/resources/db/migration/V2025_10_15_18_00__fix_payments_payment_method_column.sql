-- Fix payments table payment_method column issue
-- The error shows 'payment_method' column is null, but entity expects 'payment_method_id'

-- First, check the current table structure and fix any issues
DO $$
BEGIN
    -- Drop any existing constraints that might be causing issues
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'payments' 
        AND constraint_name LIKE '%payment_method%'
    ) THEN
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_payment_method;
    END IF;
    
    -- Check if payment_method_id column exists, if not create it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'payment_method_id'
    ) THEN
        -- Add the payment_method_id column
        ALTER TABLE payments ADD COLUMN payment_method_id BIGINT;
    END IF;
    
    -- If the old payment_method column exists, drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE payments DROP COLUMN payment_method;
    END IF;
    
    -- Add the foreign key constraint
    ALTER TABLE payments 
    ADD CONSTRAINT fk_payments_payment_method 
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);
    
    -- Make it not null
    ALTER TABLE payments ALTER COLUMN payment_method_id SET NOT NULL;
END $$;
