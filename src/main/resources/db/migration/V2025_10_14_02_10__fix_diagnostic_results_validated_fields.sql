-- Fix diagnostic_results table to make validated_by and validated_by_name nullable
-- This resolves the NOT NULL constraint violation when creating diagnostic results

ALTER TABLE diagnostic_results 
ALTER COLUMN validated_by DROP NOT NULL;

ALTER TABLE diagnostic_results 
ALTER COLUMN validated_by_name DROP NOT NULL;
