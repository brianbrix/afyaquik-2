-- Add per-user toggle to control auto-creation of next-day recurring shifts
ALTER TABLE staff_users
    ADD COLUMN IF NOT EXISTS auto_create_next_day_shift BOOLEAN NOT NULL DEFAULT TRUE;

-- Optional: backfill nulls to true if column pre-existed without default (safety)
UPDATE staff_users SET auto_create_next_day_shift = TRUE WHERE auto_create_next_day_shift IS NULL;


