-- Update payments table to use enum values for payment_method
-- First, let's check if the column exists and update it

-- Update existing payment_method values to use enum format
UPDATE payments 
SET payment_method = CASE 
    WHEN payment_method = 'Cash' THEN 'CASH'
    WHEN payment_method = 'Credit Card' THEN 'CREDIT_CARD'
    WHEN payment_method = 'Debit Card' THEN 'DEBIT_CARD'
    WHEN payment_method = 'Mobile Money' THEN 'MOBILE_MONEY'
    WHEN payment_method = 'Bank Transfer' THEN 'BANK_TRANSFER'
    WHEN payment_method = 'Insurance' THEN 'INSURANCE'
    WHEN payment_method = 'Cheque' THEN 'CHEQUE'
    ELSE 'OTHER'
END
WHERE payment_method IS NOT NULL;

-- Ensure the column length is sufficient for enum values
ALTER TABLE payments ALTER COLUMN payment_method TYPE VARCHAR(32);
