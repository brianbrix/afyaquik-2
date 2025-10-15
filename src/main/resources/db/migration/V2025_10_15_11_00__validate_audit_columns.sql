-- Migration: Validate audit columns (created_at, updated_at, created_by, updated_by) in all tables
-- This migration checks which tables have audit columns and reports the status

-- Check all tables for audit columns
WITH table_audit_status AS (
    SELECT 
        t.table_name,
        -- Check for created_at column
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') as has_created_at,
        -- Check for updated_at column
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') as has_updated_at,
        -- Check for created_by column
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by,
        -- Check for updated_by column
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by,
        -- Get created_at column type
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') 
            THEN 
                (SELECT data_type FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public')
            ELSE 'N/A'
        END as created_at_type,
        -- Get updated_at column type
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') 
            THEN 
                (SELECT data_type FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public')
            ELSE 'N/A'
        END as updated_at_type,
        -- Get created_by column type
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') 
            THEN 
                (SELECT data_type FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public')
            ELSE 'N/A'
        END as created_by_type,
        -- Get updated_by column type
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') 
            THEN 
                (SELECT data_type FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public')
            ELSE 'N/A'
        END as updated_by_type
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
    CASE WHEN has_created_at THEN 'YES' ELSE 'NO' END as has_created_at,
    CASE WHEN has_updated_at THEN 'YES' ELSE 'NO' END as has_updated_at,
    CASE WHEN has_created_by THEN 'YES' ELSE 'NO' END as has_created_by,
    CASE WHEN has_updated_by THEN 'YES' ELSE 'NO' END as has_updated_by,
    created_at_type,
    updated_at_type,
    created_by_type,
    updated_by_type
FROM table_audit_status
ORDER BY table_name;

-- Count tables with and without audit columns
SELECT 
    'Tables with created_at column' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') as has_created_at
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
WHERE has_created_at

UNION ALL

SELECT 
    'Tables with updated_at column' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') as has_updated_at
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
WHERE has_updated_at

UNION ALL

SELECT 
    'Tables with created_by column' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by
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
WHERE has_created_by

UNION ALL

SELECT 
    'Tables with updated_by column' as status,
    COUNT(*) as count
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by
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
WHERE has_updated_by;

-- Check for tables missing specific audit columns
SELECT 
    'MISSING CREATED_AT COLUMN' as issue,
    table_name
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') as has_created_at
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
WHERE NOT has_created_at

UNION ALL

SELECT 
    'MISSING UPDATED_AT COLUMN' as issue,
    table_name
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') as has_updated_at
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
WHERE NOT has_updated_at

UNION ALL

SELECT 
    'MISSING CREATED_BY COLUMN' as issue,
    table_name
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by
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
WHERE NOT has_created_by

UNION ALL

SELECT 
    'MISSING UPDATED_BY COLUMN' as issue,
    table_name
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by
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
WHERE NOT has_updated_by;

-- Generate ALTER TABLE statements for tables missing audit columns
SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;' as sql_statement
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_at' AND c.table_schema = 'public') as has_created_at
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
WHERE NOT has_created_at
ORDER BY table_name

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;' as sql_statement
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_at' AND c.table_schema = 'public') as has_updated_at
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
WHERE NOT has_updated_at
ORDER BY table_name

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);' as sql_statement
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'created_by' AND c.table_schema = 'public') as has_created_by
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
WHERE NOT has_created_by
ORDER BY table_name

UNION ALL

SELECT 
    'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);' as sql_statement
FROM (
    SELECT 
        t.table_name,
        EXISTS(SELECT 1 FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.column_name = 'updated_by' AND c.table_schema = 'public') as has_updated_by
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
WHERE NOT has_updated_by
ORDER BY table_name;
