-- Migration: Add version column to all tables extending BaseEntity
-- This migration adds the version column to all tables that extend BaseEntity
-- The version column is used for optimistic locking and audit trail purposes

-- Add version column to all tables extending BaseEntity
-- Note: Some tables may already have version columns from previous migrations

-- Configuration tables
ALTER TABLE form_definitions ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE tenant_themes ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Auth tables
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE staff_roles ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE active_roles ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Patient tables
ALTER TABLE patients ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE patient_insurance_details ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Profile tables
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Queue tables
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE queue_timeline_entries ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Consultation tables
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE consultation_title ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Pharmacy tables
ALTER TABLE medications ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE prescription_audit ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Diagnostics tables
ALTER TABLE test_catalog ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE result_attachments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Inventory tables
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Billing tables
ALTER TABLE bills ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Scheduling tables
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE shift_types ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Notification tables
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Permission tables
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Queue status role matrix
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1;

-- Create indexes for version columns to improve query performance
-- Note: These indexes are optional but recommended for better performance

-- Configuration indexes
CREATE INDEX IF NOT EXISTS idx_form_definitions_version ON form_definitions (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_tenant_themes_version ON tenant_themes (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_feature_flags_version ON feature_flags (tenant_id, version);

-- Auth indexes
CREATE INDEX IF NOT EXISTS idx_staff_users_version ON staff_users (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_staff_roles_version ON staff_roles (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_departments_version ON departments (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_active_roles_version ON active_roles (tenant_id, version);

-- Patient indexes
CREATE INDEX IF NOT EXISTS idx_patients_version ON patients (tenant_id, version);
-- CREATE INDEX IF NOT EXISTS idx_patient_insurance_details_version ON patient_insurance_details (tenant_id, version);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_version ON user_profiles (tenant_id, version);

-- Queue indexes
CREATE INDEX IF NOT EXISTS idx_visit_queue_items_version ON visit_queue_items (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_queue_timeline_entries_version ON queue_timeline_entries (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_triage_entries_version ON triage_entries (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_triage_titles_version ON triage_titles (tenant_id, version);

-- Consultation indexes
CREATE INDEX IF NOT EXISTS idx_consultation_entries_version ON consultation_entries (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_consultation_titles_version ON consultation_title (tenant_id, version);

-- Pharmacy indexes
CREATE INDEX IF NOT EXISTS idx_medications_version ON medications (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_prescriptions_version ON prescriptions (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_prescription_items_version ON prescription_items (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_prescription_audit_version ON prescription_audit (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_inventory_version ON inventory (tenant_id, version);

-- Diagnostics indexes
CREATE INDEX IF NOT EXISTS idx_test_catalogs_version ON test_catalog (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_test_categories_version ON test_categories (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_version ON diagnostic_orders (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_version ON diagnostic_items (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_version ON diagnostic_results (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_version ON diagnostic_notes (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_diagnostic_file_attachments_version ON diagnostic_file_attachments (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_result_templates_version ON result_templates (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_result_attachments_version ON result_attachments (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_samples_version ON samples (tenant_id, version);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_version ON inventory_items (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_item_categories_version ON item_categories (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_suppliers_version ON suppliers (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_version ON purchase_orders (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_version ON purchase_order_items (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_version ON goods_receipts (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_version ON goods_receipt_items (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_stock_movements_version ON stock_movements (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_requisitions_version ON requisitions (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_requisition_items_version ON requisition_items (tenant_id, version);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_bills_version ON bills (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_bill_items_version ON bill_items (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_payments_version ON payments (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_payment_methods_version ON payment_methods (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_discounts_version ON discounts (tenant_id, version);

-- Scheduling indexes
CREATE INDEX IF NOT EXISTS idx_staff_shifts_version ON staff_shifts (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_shift_types_version ON shift_types (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_version ON time_off_requests (tenant_id, version);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_version ON notifications (tenant_id, version);
CREATE INDEX IF NOT EXISTS idx_notification_templates_version ON notification_templates (tenant_id, version);

-- Permission indexes
-- CREATE INDEX IF NOT EXISTS idx_permissions_version ON permissions (tenant_id, version);
-- CREATE INDEX IF NOT EXISTS idx_permission_assignments_version ON permission_assignments (tenant_id, version);

-- Queue status role matrix index
-- CREATE INDEX IF NOT EXISTS idx_queue_status_role_matrix_version ON queue_status_role_visibility (tenant_id, version);

-- Add comments to document the version column purpose
COMMENT ON COLUMN form_definitions.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN tenant_themes.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN feature_flags.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN staff_users.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN staff_roles.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN departments.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN active_roles.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN patients.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN patient_insurance_details.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN user_profiles.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN visit_queue_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN queue_timeline_entries.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN triage_entries.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN triage_titles.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN consultation_entries.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN consultation_title.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN medications.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN prescriptions.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN prescription_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN prescription_audit.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN inventory.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN test_catalog.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN test_categories.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN diagnostic_orders.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN diagnostic_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN diagnostic_results.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN diagnostic_notes.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN diagnostic_file_attachments.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN result_templates.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN result_attachments.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN samples.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN inventory_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN item_categories.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN suppliers.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN purchase_orders.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN purchase_order_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN goods_receipts.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN goods_receipt_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN stock_movements.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN requisitions.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN requisition_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN bills.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN bill_items.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN payments.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN payment_methods.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN discounts.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN staff_shifts.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN shift_types.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN time_off_requests.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN notifications.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN notification_templates.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN permissions.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN permission_assignments.version IS 'Version number for optimistic locking and audit trail';
COMMENT ON COLUMN queue_status_role_visibility.version IS 'Version number for optimistic locking and audit trail';
