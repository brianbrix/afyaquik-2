-- Migration: Validate tenant_id columns in all tables
-- This migration checks which tables have tenant_id columns and reports the status

-- Check all tables for tenant_id column
WITH table_tenant_status AS (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') as has_tenant_id,
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') 
            THEN 
                (SELECT data_type FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public')
            ELSE 'N/A'
        END as tenant_id_type,
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') 
            THEN 
                (SELECT is_nullable FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public')
            ELSE 'N/A'
        END as tenant_id_nullable,
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') 
            THEN 
                (SELECT column_default FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public')
            ELSE 'N/A'
        END as tenant_id_default
    FROM information_schema.tables t
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
    CASE WHEN has_tenant_id THEN 'YES' ELSE 'NO' END as has_tenant_id,
    tenant_id_type,
    tenant_id_nullable,
    tenant_id_default
FROM table_tenant_status
ORDER BY has_tenant_id DESC, table_name;

-- Count tables with and without tenant_id columns
SELECT 
    'Tables with tenant_id column' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') as has_tenant_id
    FROM information_schema.tables t
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
) tenant_check
WHERE has_tenant_id

UNION ALL

SELECT 
    'Tables without tenant_id column' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') as has_tenant_id
    FROM information_schema.tables t
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
) tenant_check
WHERE NOT has_tenant_id;

-- Check for any tables that should have tenant_id but don't
SELECT 
    'MISSING TENANT_ID COLUMN' as issue,
    table_name
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') as has_tenant_id
    FROM information_schema.tables t
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
) tenant_check
WHERE NOT has_tenant_id;

-- Generate ALTER TABLE statements for tables missing tenant_id
SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT ''default'';' as sql_statement
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'tenant_id' AND c.table_schema = 'public') as has_tenant_id
    FROM information_schema.tables t
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
) tenant_check
WHERE NOT has_tenant_id
ORDER BY table_name;
