-- Migration: Simple audit columns check without functions
-- This migration identifies tables that are missing BaseEntity audit columns

-- Check all tables for missing audit columns
WITH table_audit_status AS (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') as has_created_at,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') as has_updated_at,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'version' AND c.table_schema = 'public') as has_version,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'deleted' AND c.table_schema = 'public') as has_deleted,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'deleted_at' AND c.table_schema = 'public') as has_deleted_at
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
    CASE 
        WHEN has_created_at AND has_updated_at AND has_created_by AND has_updated_by AND has_version AND has_deleted AND has_deleted_at 
        THEN 'COMPLETE'
        ELSE 'INCOMPLETE'
    END as audit_status,
    CASE WHEN NOT has_created_at THEN 'MISSING created_at' ELSE '' END ||
    CASE WHEN NOT has_updated_at THEN 'MISSING updated_at' ELSE '' END ||
    CASE WHEN NOT has_created_by THEN 'MISSING created_by' ELSE '' END ||
    CASE WHEN NOT has_updated_by THEN 'MISSING updated_by' ELSE '' END ||
    CASE WHEN NOT has_version THEN 'MISSING version' ELSE '' END ||
    CASE WHEN NOT has_deleted THEN 'MISSING deleted' ELSE '' END ||
    CASE WHEN NOT has_deleted_at THEN 'MISSING deleted_at' ELSE '' END as missing_columns
FROM table_audit_status
ORDER BY audit_status DESC, table_name;

-- Count tables with and without complete audit columns
SELECT 
    'Tables with complete audit columns' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') as has_created_at,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') as has_updated_at,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'version' AND c.table_schema = 'public') as has_version,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'deleted' AND c.table_schema = 'public') as has_deleted,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'deleted_at' AND c.table_schema = 'public') as has_deleted_at
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
) audit_check
WHERE has_created_at AND has_updated_at AND has_created_by AND has_updated_by AND has_version AND has_deleted AND has_deleted_at

UNION ALL

SELECT 
    'Tables missing audit columns' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') as has_created_at,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') as has_updated_at,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'version' AND c.table_schema = 'public') as has_version,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'deleted' AND c.table_schema = 'public') as has_deleted,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'deleted_at' AND c.table_schema = 'public') as has_deleted_at
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
) audit_check
WHERE NOT (has_created_at AND has_updated_at AND has_created_by AND has_updated_by AND has_version AND has_deleted AND has_deleted_at);
