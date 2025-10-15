-- Add used_in_prescriptions field to inventory table
ALTER TABLE inventory ADD COLUMN used_in_prescriptions BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing records to mark them as not used (since they haven't been used in prescriptions yet)
UPDATE inventory SET used_in_prescriptions = FALSE WHERE used_in_prescriptions IS NULL;
