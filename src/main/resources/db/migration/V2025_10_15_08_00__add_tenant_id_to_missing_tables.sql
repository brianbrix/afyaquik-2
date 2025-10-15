-- Migration: Add tenant_id column to tables that don't have it
-- This migration ensures all tables have the tenant_id column for multi-tenancy support

-- Add tenant_id column to tables that don't have it
-- Note: Some tables may already have tenant_id from previous migrations

-- Configuration tables
ALTER TABLE form_definitions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE tenant_themes ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Auth tables
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE staff_roles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE departments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE active_roles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Patient tables
ALTER TABLE patients ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE patient_insurance_details ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Profile tables
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Queue tables
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE queue_timeline_entries ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Consultation tables
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE consultation_title ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Pharmacy tables
ALTER TABLE medications ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE prescription_audit ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Diagnostics tables
ALTER TABLE test_catalog ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE result_attachments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE samples ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Inventory tables
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Billing tables
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Scheduling tables
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE shift_types ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Notification tables
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Permission tables
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Queue status role matrix
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'default';

-- Create indexes for tenant_id columns to improve query performance
-- Note: These indexes are crucial for multi-tenant performance

-- Configuration indexes
CREATE INDEX IF NOT EXISTS idx_form_definitions_tenant_id ON form_definitions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_themes_tenant_id ON tenant_themes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant_id ON feature_flags (tenant_id);

-- Auth indexes
CREATE INDEX IF NOT EXISTS idx_staff_users_tenant_id ON staff_users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_tenant_id ON staff_roles (tenant_id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_active_roles_tenant_id ON active_roles (tenant_id);

-- Patient indexes
CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON patients (tenant_id);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_details_tenant_id ON patient_insurance_details (tenant_id);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles (tenant_id);

-- Queue indexes
CREATE INDEX IF NOT EXISTS idx_visit_queue_items_tenant_id ON visit_queue_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_queue_timeline_entries_tenant_id ON queue_timeline_entries (tenant_id);
CREATE INDEX IF NOT EXISTS idx_triage_entries_tenant_id ON triage_entries (tenant_id);
CREATE INDEX IF NOT EXISTS idx_triage_titles_tenant_id ON triage_titles (tenant_id);

-- Consultation indexes
CREATE INDEX IF NOT EXISTS idx_consultation_entries_tenant_id ON consultation_entries (tenant_id);
CREATE INDEX IF NOT EXISTS idx_consultation_title_tenant_id ON consultation_title (tenant_id);

-- Pharmacy indexes
CREATE INDEX IF NOT EXISTS idx_medications_tenant_id ON medications (tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant_id ON prescriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_tenant_id ON prescription_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescription_audit_tenant_id ON prescription_audit (tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tenant_id ON inventory (tenant_id);

-- Diagnostics indexes
CREATE INDEX IF NOT EXISTS idx_test_catalog_tenant_id ON test_catalog (tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_categories_tenant_id ON test_categories (tenant_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_tenant_id ON diagnostic_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_tenant_id ON diagnostic_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_tenant_id ON diagnostic_results (tenant_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_tenant_id ON diagnostic_notes (tenant_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_file_attachments_tenant_id ON diagnostic_file_attachments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_result_templates_tenant_id ON result_templates (tenant_id);
CREATE INDEX IF NOT EXISTS idx_result_attachments_tenant_id ON result_attachments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_samples_tenant_id ON samples (tenant_id);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_item_categories_tenant_id ON item_categories (tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON suppliers (tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_tenant_id ON purchase_order_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_tenant_id ON goods_receipts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_tenant_id ON goods_receipt_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON stock_movements (tenant_id);
CREATE INDEX IF NOT EXISTS idx_requisitions_tenant_id ON requisitions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_requisition_items_tenant_id ON requisition_items (tenant_id);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_bills_tenant_id ON bills (tenant_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_tenant_id ON bill_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant_id ON payment_methods (tenant_id);
CREATE INDEX IF NOT EXISTS idx_discounts_tenant_id ON discounts (tenant_id);

-- Scheduling indexes
CREATE INDEX IF NOT EXISTS idx_staff_shifts_tenant_id ON staff_shifts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_shift_types_tenant_id ON shift_types (tenant_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_tenant_id ON time_off_requests (tenant_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications (tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_tenant_id ON notification_templates (tenant_id);

-- Permission indexes
CREATE INDEX IF NOT EXISTS idx_permissions_tenant_id ON permissions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_permission_assignments_tenant_id ON permission_assignments (tenant_id);

-- Queue status role matrix index
CREATE INDEX IF NOT EXISTS idx_queue_status_role_visibility_tenant_id ON queue_status_role_visibility (tenant_id);

-- Add comments to document the tenant_id column purpose
COMMENT ON COLUMN form_definitions.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN tenant_themes.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN feature_flags.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN staff_users.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN staff_roles.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN departments.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN active_roles.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN patients.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN patient_insurance_details.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN user_profiles.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN visit_queue_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN queue_timeline_entries.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN triage_entries.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN triage_titles.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN consultation_entries.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN consultation_title.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN medications.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN prescriptions.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN prescription_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN prescription_audit.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN inventory.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN test_catalog.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN test_categories.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN diagnostic_orders.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN diagnostic_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN diagnostic_results.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN diagnostic_notes.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN diagnostic_file_attachments.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN result_templates.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN result_attachments.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN samples.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN inventory_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN item_categories.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN suppliers.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN purchase_orders.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN purchase_order_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN goods_receipts.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN goods_receipt_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN stock_movements.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN requisitions.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN requisition_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN bills.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN bill_items.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN payments.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN payment_methods.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN discounts.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN staff_shifts.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN shift_types.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN time_off_requests.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN notifications.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN notification_templates.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN permissions.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN permission_assignments.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN queue_status_role_visibility.tenant_id IS 'Tenant identifier for multi-tenancy support';
