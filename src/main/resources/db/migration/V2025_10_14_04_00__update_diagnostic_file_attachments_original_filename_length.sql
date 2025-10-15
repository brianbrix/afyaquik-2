-- Update original_filename column length to accommodate longer filenames
ALTER TABLE diagnostic_file_attachments 
ALTER COLUMN original_filename TYPE VARCHAR(500);

