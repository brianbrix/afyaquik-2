-- Add hierarchy columns to consultation_title table
ALTER TABLE consultation_title 
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parent_id BIGINT;

-- Add foreign key constraint for parent_id
ALTER TABLE consultation_title 
ADD CONSTRAINT fk_consultation_title_parent 
FOREIGN KEY (parent_id) REFERENCES consultation_title(id);

-- Create index for parent_id for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_title_parent_id ON consultation_title(parent_id);

-- Create index for level and sort_order
CREATE INDEX IF NOT EXISTS idx_consultation_title_level_sort ON consultation_title(level, sort_order);

-- Update existing consultation titles to be level 1
UPDATE consultation_title SET level = 1 WHERE level IS NULL;

-- Add check constraint for level (1-3)
ALTER TABLE consultation_title 
ADD CONSTRAINT check_consultation_title_level CHECK (level >= 1 AND level <= 3);

-- Add check constraint to prevent self-reference
ALTER TABLE consultation_title 
ADD CONSTRAINT check_consultation_title_no_self_reference CHECK (id != parent_id);
