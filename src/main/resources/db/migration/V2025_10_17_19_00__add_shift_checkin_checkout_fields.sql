-- Add checkedInAt and checkedOutAt fields to staff_shifts table
ALTER TABLE staff_shifts 
ADD COLUMN checked_in_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE staff_shifts 
ADD COLUMN checked_out_at TIMESTAMP WITHOUT TIME ZONE;
