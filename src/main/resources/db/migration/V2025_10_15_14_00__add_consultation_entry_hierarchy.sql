-- Add hierarchy columns to consultation_entries table
ALTER TABLE consultation_entries 
ADD COLUMN IF NOT EXISTS consultation_title_id BIGINT,
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add foreign key constraint for consultation_title_id
ALTER TABLE consultation_entries 
ADD CONSTRAINT fk_consultation_entries_consultation_title 
FOREIGN KEY (consultation_title_id) REFERENCES consultation_title(id);

-- Create index for consultation_title_id for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_entries_consultation_title_id ON consultation_entries(consultation_title_id);

-- Create index for sort_order
CREATE INDEX IF NOT EXISTS idx_consultation_entries_sort_order ON consultation_entries(sort_order);

-- Update existing consultation entries to have is_custom = true (since they were created before hierarchy)
UPDATE consultation_entries SET is_custom = TRUE WHERE consultation_title_id IS NULL;
