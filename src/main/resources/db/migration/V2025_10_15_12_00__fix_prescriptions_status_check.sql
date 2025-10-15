-- Fix prescriptions_status_check constraint to include all valid status values
-- Drop the existing constraint if it exists
ALTER TABLE prescriptions DROP CONSTRAINT IF EXISTS prescriptions_status_check;

-- Add the updated constraint with all valid status values
ALTER TABLE prescriptions ADD CONSTRAINT prescriptions_status_check 
CHECK (status IN (
    'DRAFT',
    'PENDING', 
    'PARTIALLY_DISPENSED',
    'DISPENSED',
    'CANCELLED',
    'EXPIRED',
    'REPLACED',
    'REVERSED'
));
