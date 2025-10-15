-- Fix result_templates_field_type_check constraint to include all FieldType enum values
-- Drop the existing constraint
ALTER TABLE result_templates DROP CONSTRAINT IF EXISTS result_templates_field_type_check;

-- Add the updated constraint with all FieldType enum values
ALTER TABLE result_templates ADD CONSTRAINT result_templates_field_type_check 
CHECK (field_type IN (
    'TEXT',
    'NUMBER', 
    'DECIMAL',
    'BOOLEAN',
    'DATE',
    'TIME',
    'DATETIME',
    'DROPDOWN',
    'MULTI_SELECT',
    'TEXTAREA',
    'RICH_TEXT',
    'FILE',
    'IMAGE'
));

