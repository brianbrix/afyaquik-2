-- Fix timestamp columns to use TIMESTAMP WITHOUT TIME ZONE for LocalDateTime compatibility
-- This migration converts existing timestamp columns to work with Java LocalDateTime

-- Update appointment_date_time column
ALTER TABLE appointments 
ALTER COLUMN appointment_date_time TYPE TIMESTAMP WITHOUT TIME ZONE;

-- Update reminder_sent_at column
ALTER TABLE appointments 
ALTER COLUMN reminder_sent_at TYPE TIMESTAMP WITHOUT TIME ZONE;

-- Update cancelled_at column
ALTER TABLE appointments 
ALTER COLUMN cancelled_at TYPE TIMESTAMP WITHOUT TIME ZONE;

-- Update completed_at column
ALTER TABLE appointments 
ALTER COLUMN completed_at TYPE TIMESTAMP WITHOUT TIME ZONE;

-- Update no_show_at column
ALTER TABLE appointments 
ALTER COLUMN no_show_at TYPE TIMESTAMP WITHOUT TIME ZONE;

-- Update created_at column
ALTER TABLE appointments 
ALTER COLUMN created_at TYPE TIMESTAMP WITHOUT TIME ZONE;

-- Update updated_at column
ALTER TABLE appointments 
ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE;

