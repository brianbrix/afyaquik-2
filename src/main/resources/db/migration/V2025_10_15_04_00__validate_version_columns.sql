-- Migration: Validate that all tables have version columns
-- This migration validates that the version column has been added to all tables
-- and provides a comprehensive report of the versioning status

-- Create a temporary function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name = $2
        AND table_schema = 'public'
    );
END;
$$ LANGUAGE plpgsql;

-- Create a view to show version column status for all tables
CREATE OR REPLACE VIEW version_column_status AS
SELECT 
    t.table_name,
    CASE 
        WHEN column_exists(t.table_name, 'version') THEN 'YES'
        ELSE 'NO'
    END as has_version_column,
    CASE 
        WHEN column_exists(t.table_name, 'version') THEN 
            (SELECT data_type FROM information_schema.columns 
             WHERE table_name = t.table_name AND column_name = 'version' AND table_schema = 'public')
        ELSE 'N/A'
    END as version_column_type,
    CASE 
        WHEN column_exists(t.table_name, 'version') THEN 
            (SELECT is_nullable FROM information_schema.columns 
             WHERE table_name = t.table_name AND column_name = 'version' AND table_schema = 'public')
        ELSE 'N/A'
    END as version_nullable,
    CASE 
        WHEN column_exists(t.table_name, 'version') THEN 
            (SELECT column_default FROM information_schema.columns 
             WHERE table_name = t.table_name AND column_name = 'version' AND table_schema = 'public')
        ELSE 'N/A'
    END as version_default
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND t.table_name NOT LIKE 'flyway%'
ORDER BY t.table_name;

-- Display the version column status
SELECT 
    table_name,
    has_version_column,
    version_column_type,
    version_nullable,
    version_default
FROM version_column_status
ORDER BY table_name;

-- Count tables with and without version columns
SELECT 
    'Tables with version column' as status,
    COUNT(*) as count
FROM version_column_status 
WHERE has_version_column = 'YES'

UNION ALL

SELECT 
    'Tables without version column' as status,
    COUNT(*) as count
FROM version_column_status 
WHERE has_version_column = 'NO';

-- Check for any tables that should have version columns but don't
-- (This is a safety check to ensure all BaseEntity tables have version columns)
SELECT 
    'MISSING VERSION COLUMN' as issue,
    table_name
FROM version_column_status 
WHERE has_version_column = 'NO'
AND table_name IN (
    'form_definitions',
    'tenant_themes', 
    'feature_flags',
    'staff_users',
    'staff_roles',
    'departments',
    'active_roles',
    'patients',
    'patient_insurance_details',
    'user_profiles',
    'visit_queue_items',
    'queue_timeline_entries',
    'triage_entries',
    'triage_titles',
    'consultation_entries',
    'consultation_titles',
    'medications',
    'prescriptions',
    'prescription_items',
    'prescription_audit',
    'inventory',
    'test_catalogs',
    'test_categories',
    'diagnostic_orders',
    'diagnostic_items',
    'diagnostic_results',
    'diagnostic_notes',
    'diagnostic_file_attachments',
    'result_templates',
    'result_attachments',
    'samples',
    'inventory_items',
    'item_categories',
    'suppliers',
    'purchase_orders',
    'purchase_order_items',
    'goods_receipts',
    'goods_receipt_items',
    'stock_movements',
    'requisitions',
    'requisition_items',
    'bills',
    'bill_items',
    'payments',
    'payment_methods',
    'discounts',
    'staff_shifts',
    'shift_types',
    'time_off_requests',
    'notifications',
    'notification_templates',
    'permissions',
    'permission_assignments',
    'queue_status_role_matrix'
);

-- Clean up the temporary function
DROP FUNCTION IF EXISTS column_exists(TEXT, TEXT);

-- Clean up the temporary view
DROP VIEW IF EXISTS version_column_status;
