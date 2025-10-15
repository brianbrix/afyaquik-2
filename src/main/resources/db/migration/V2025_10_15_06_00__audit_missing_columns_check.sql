-- Migration: Check for missing audit columns in all tables
-- This migration identifies tables that are missing BaseEntity audit columns

-- Create a function to check if audit columns exist
CREATE OR REPLACE FUNCTION has_audit_columns(target_table_name TEXT)
RETURNS TABLE(
    has_created_at BOOLEAN,
    has_updated_at BOOLEAN,
    has_created_by BOOLEAN,
    has_updated_by BOOLEAN,
    has_version BOOLEAN,
    has_deleted BOOLEAN,
    has_deleted_at BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = target_table_name AND information_schema.columns.column_name = 'created_at' AND information_schema.columns.table_schema = 'public') as has_created_at,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = target_table_name AND information_schema.columns.column_name = 'updated_at' AND information_schema.columns.table_schema = 'public') as has_updated_at,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = target_table_name AND information_schema.columns.column_name = 'created_by' AND information_schema.columns.table_schema = 'public') as has_created_by,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = target_table_name AND information_schema.columns.column_name = 'updated_by' AND information_schema.columns.table_schema = 'public') as has_updated_by,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = target_table_name AND information_schema.columns.column_name = 'version' AND information_schema.columns.table_schema = 'public') as has_version,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = target_table_name AND information_schema.columns.column_name = 'deleted' AND information_schema.columns.table_schema = 'public') as has_deleted,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = target_table_name AND information_schema.columns.column_name = 'deleted_at' AND information_schema.columns.table_schema = 'public') as has_deleted_at;
END;
$$ LANGUAGE plpgsql;

-- Check all tables for missing audit columns
WITH table_audit_status AS (
    SELECT 
        t.table_name,
        h.has_created_at,
        h.has_updated_at,
        h.has_created_by,
        h.has_updated_by,
        h.has_version,
        h.has_deleted,
        h.has_deleted_at,
        CASE 
            WHEN h.has_created_at AND h.has_updated_at AND h.has_created_by AND h.has_updated_by AND h.has_version AND h.has_deleted AND h.has_deleted_at 
            THEN 'COMPLETE'
            ELSE 'INCOMPLETE'
        END as audit_status
    FROM information_schema.tables t
    CROSS JOIN LATERAL has_audit_columns(t.table_name) h
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE 'flyway%'
    AND t.table_name IN (
        'form_definitions', 'tenant_themes', 'feature_flags',
        'staff_users', 'staff_roles', 'departments', 'active_roles',
        'patients', 'patient_insurance_details', 'user_profiles',
        'visit_queue_items', 'queue_timeline_entries', 'triage_entries', 'triage_titles',
        'consultation_entries', 'consultation_title',
        'medications', 'prescriptions', 'prescription_items', 'prescription_audit', 'inventory',
        'test_catalog', 'test_categories', 'diagnostic_orders', 'diagnostic_items',
        'diagnostic_results', 'diagnostic_notes', 'diagnostic_file_attachments',
        'result_templates', 'result_attachments', 'samples',
        'inventory_items', 'item_categories', 'suppliers', 'purchase_orders',
        'purchase_order_items', 'goods_receipts', 'goods_receipt_items',
        'stock_movements', 'requisitions', 'requisition_items',
        'bills', 'bill_items', 'payments', 'payment_methods', 'discounts',
        'staff_shifts', 'shift_types', 'time_off_requests',
        'notifications', 'notification_templates',
        'permissions', 'permission_assignments', 'queue_status_role_visibility'
    )
)
SELECT 
    table_name,
    audit_status,
    CASE WHEN NOT has_created_at THEN 'MISSING created_at' ELSE '' END ||
    CASE WHEN NOT has_updated_at THEN 'MISSING updated_at' ELSE '' END ||
    CASE WHEN NOT has_created_by THEN 'MISSING created_by' ELSE '' END ||
    CASE WHEN NOT has_updated_by THEN 'MISSING updated_by' ELSE '' END ||
    CASE WHEN NOT has_version THEN 'MISSING version' ELSE '' END ||
    CASE WHEN NOT has_deleted THEN 'MISSING deleted' ELSE '' END ||
    CASE WHEN NOT has_deleted_at THEN 'MISSING deleted_at' ELSE '' END as missing_columns
FROM table_audit_status
WHERE audit_status = 'INCOMPLETE'
ORDER BY table_name;

-- Generate ALTER TABLE statements for tables missing audit columns
WITH missing_audit_tables AS (
    SELECT 
        t.table_name,
        h.has_created_at,
        h.has_updated_at,
        h.has_created_by,
        h.has_updated_by,
        h.has_version,
        h.has_deleted,
        h.has_deleted_at
    FROM information_schema.tables t
    CROSS JOIN LATERAL has_audit_columns(t.table_name) h
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE 'flyway%'
    AND t.table_name IN (
        'permissions', 'permission_assignments', 'queue_status_role_visibility'
    )
)
SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;' as sql_statement
FROM missing_audit_tables
WHERE NOT has_created_at

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;' as sql_statement
FROM missing_audit_tables
WHERE NOT has_updated_at

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);' as sql_statement
FROM missing_audit_tables
WHERE NOT has_created_by

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);' as sql_statement
FROM missing_audit_tables
WHERE NOT has_updated_by

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;' as sql_statement
FROM missing_audit_tables
WHERE NOT has_version

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;' as sql_statement
FROM missing_audit_tables
WHERE NOT has_deleted

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;' as sql_statement
FROM missing_audit_tables
WHERE NOT has_deleted_at

ORDER BY sql_statement;

-- Clean up the function
DROP FUNCTION IF EXISTS has_audit_columns(TEXT);
