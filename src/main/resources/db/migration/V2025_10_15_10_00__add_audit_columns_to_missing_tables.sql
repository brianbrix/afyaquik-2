-- Migration: Add audit columns (created_at, updated_at, created_by, updated_by) to tables that don't have them
-- This migration ensures all tables have the standard audit columns for tracking changes

-- Add created_at column to tables that don't have it
ALTER TABLE form_definitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tenant_themes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to tables that don't have it
ALTER TABLE form_definitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tenant_themes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to tables that don't have it
ALTER TABLE form_definitions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE tenant_themes ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to tables that don't have it
ALTER TABLE form_definitions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE tenant_themes ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to auth tables that don't have it
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE staff_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE active_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to auth tables that don't have it
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE staff_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE active_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to auth tables that don't have it
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE staff_roles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE active_roles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to auth tables that don't have it
ALTER TABLE staff_users ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE staff_roles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE active_roles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to patient tables that don't have it
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE patient_insurance_details ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to patient tables that don't have it
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE patient_insurance_details ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to patient tables that don't have it
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE patient_insurance_details ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to patient tables that don't have it
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE patient_insurance_details ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to profile tables that don't have it
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to profile tables that don't have it
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to profile tables that don't have it
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to profile tables that don't have it
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to queue tables that don't have it
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE queue_timeline_entries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to queue tables that don't have it
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE queue_timeline_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to queue tables that don't have it
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE queue_timeline_entries ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to queue tables that don't have it
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE queue_timeline_entries ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to consultation tables that don't have it
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE consultation_title ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to consultation tables that don't have it
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE consultation_title ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to consultation tables that don't have it
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE consultation_title ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to consultation tables that don't have it
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE consultation_title ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to pharmacy tables that don't have it
ALTER TABLE medications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE prescription_audit ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to pharmacy tables that don't have it
ALTER TABLE medications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE prescription_audit ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to pharmacy tables that don't have it
ALTER TABLE medications ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE prescription_audit ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to pharmacy tables that don't have it
ALTER TABLE medications ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE prescription_audit ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to diagnostics tables that don't have it
ALTER TABLE test_catalog ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE result_attachments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to diagnostics tables that don't have it
ALTER TABLE test_catalog ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE result_attachments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to diagnostics tables that don't have it
ALTER TABLE test_catalog ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE result_attachments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE samples ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to diagnostics tables that don't have it
ALTER TABLE test_catalog ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE result_attachments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE samples ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to inventory tables that don't have it
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to inventory tables that don't have it
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to inventory tables that don't have it
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to inventory tables that don't have it
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE item_categories ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE goods_receipt_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE requisitions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE requisition_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to billing tables that don't have it
ALTER TABLE bills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to billing tables that don't have it
ALTER TABLE bills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to billing tables that don't have it
ALTER TABLE bills ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to billing tables that don't have it
ALTER TABLE bills ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to scheduling tables that don't have it
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE shift_types ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to scheduling tables that don't have it
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE shift_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to scheduling tables that don't have it
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE shift_types ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to scheduling tables that don't have it
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE shift_types ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to notification tables that don't have it
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to notification tables that don't have it
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to notification tables that don't have it
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to notification tables that don't have it
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to permission tables that don't have it
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to permission tables that don't have it
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to permission tables that don't have it
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to permission tables that don't have it
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add created_at column to queue status role matrix table that doesn't have it
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column to queue status role matrix table that doesn't have it
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column to queue status role matrix table that doesn't have it
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Add updated_by column to queue status role matrix table that doesn't have it
ALTER TABLE queue_status_role_visibility ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Create indexes for audit columns to improve query performance
-- Note: These indexes are crucial for audit trail queries

-- Configuration indexes
CREATE INDEX IF NOT EXISTS idx_form_definitions_created_at ON form_definitions (created_at);
CREATE INDEX IF NOT EXISTS idx_form_definitions_updated_at ON form_definitions (updated_at);
CREATE INDEX IF NOT EXISTS idx_tenant_themes_created_at ON tenant_themes (created_at);
CREATE INDEX IF NOT EXISTS idx_tenant_themes_updated_at ON tenant_themes (updated_at);
CREATE INDEX IF NOT EXISTS idx_feature_flags_created_at ON feature_flags (created_at);
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated_at ON feature_flags (updated_at);

-- Auth indexes
CREATE INDEX IF NOT EXISTS idx_staff_users_created_at ON staff_users (created_at);
CREATE INDEX IF NOT EXISTS idx_staff_users_updated_at ON staff_users (updated_at);
CREATE INDEX IF NOT EXISTS idx_staff_roles_created_at ON staff_roles (created_at);
CREATE INDEX IF NOT EXISTS idx_staff_roles_updated_at ON staff_roles (updated_at);
CREATE INDEX IF NOT EXISTS idx_departments_created_at ON departments (created_at);
CREATE INDEX IF NOT EXISTS idx_departments_updated_at ON departments (updated_at);
CREATE INDEX IF NOT EXISTS idx_active_roles_created_at ON active_roles (created_at);
CREATE INDEX IF NOT EXISTS idx_active_roles_updated_at ON active_roles (updated_at);

-- Patient indexes
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients (created_at);
CREATE INDEX IF NOT EXISTS idx_patients_updated_at ON patients (updated_at);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_details_created_at ON patient_insurance_details (created_at);
CREATE INDEX IF NOT EXISTS idx_patient_insurance_details_updated_at ON patient_insurance_details (updated_at);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles (created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles (updated_at);

-- Queue indexes
CREATE INDEX IF NOT EXISTS idx_visit_queue_items_created_at ON visit_queue_items (created_at);
CREATE INDEX IF NOT EXISTS idx_visit_queue_items_updated_at ON visit_queue_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_queue_timeline_entries_created_at ON queue_timeline_entries (created_at);
CREATE INDEX IF NOT EXISTS idx_queue_timeline_entries_updated_at ON queue_timeline_entries (updated_at);
CREATE INDEX IF NOT EXISTS idx_triage_entries_created_at ON triage_entries (created_at);
CREATE INDEX IF NOT EXISTS idx_triage_entries_updated_at ON triage_entries (updated_at);
CREATE INDEX IF NOT EXISTS idx_triage_titles_created_at ON triage_titles (created_at);
CREATE INDEX IF NOT EXISTS idx_triage_titles_updated_at ON triage_titles (updated_at);

-- Consultation indexes
CREATE INDEX IF NOT EXISTS idx_consultation_entries_created_at ON consultation_entries (created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_entries_updated_at ON consultation_entries (updated_at);
CREATE INDEX IF NOT EXISTS idx_consultation_title_created_at ON consultation_title (created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_title_updated_at ON consultation_title (updated_at);

-- Pharmacy indexes
CREATE INDEX IF NOT EXISTS idx_medications_created_at ON medications (created_at);
CREATE INDEX IF NOT EXISTS idx_medications_updated_at ON medications (updated_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions (created_at);
CREATE INDEX IF NOT EXISTS idx_prescriptions_updated_at ON prescriptions (updated_at);
CREATE INDEX IF NOT EXISTS idx_prescription_items_created_at ON prescription_items (created_at);
CREATE INDEX IF NOT EXISTS idx_prescription_items_updated_at ON prescription_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_prescription_audit_created_at ON prescription_audit (created_at);
CREATE INDEX IF NOT EXISTS idx_prescription_audit_updated_at ON prescription_audit (updated_at);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory (created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at ON inventory (updated_at);

-- Diagnostics indexes
CREATE INDEX IF NOT EXISTS idx_test_catalog_created_at ON test_catalog (created_at);
CREATE INDEX IF NOT EXISTS idx_test_catalog_updated_at ON test_catalog (updated_at);
CREATE INDEX IF NOT EXISTS idx_test_categories_created_at ON test_categories (created_at);
CREATE INDEX IF NOT EXISTS idx_test_categories_updated_at ON test_categories (updated_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_created_at ON diagnostic_orders (created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_updated_at ON diagnostic_orders (updated_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_created_at ON diagnostic_items (created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_items_updated_at ON diagnostic_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_created_at ON diagnostic_results (created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_updated_at ON diagnostic_results (updated_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_created_at ON diagnostic_notes (created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_notes_updated_at ON diagnostic_notes (updated_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_file_attachments_created_at ON diagnostic_file_attachments (created_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_file_attachments_updated_at ON diagnostic_file_attachments (updated_at);
CREATE INDEX IF NOT EXISTS idx_result_templates_created_at ON result_templates (created_at);
CREATE INDEX IF NOT EXISTS idx_result_templates_updated_at ON result_templates (updated_at);
CREATE INDEX IF NOT EXISTS idx_result_attachments_created_at ON result_attachments (created_at);
CREATE INDEX IF NOT EXISTS idx_result_attachments_updated_at ON result_attachments (updated_at);
CREATE INDEX IF NOT EXISTS idx_samples_created_at ON samples (created_at);
CREATE INDEX IF NOT EXISTS idx_samples_updated_at ON samples (updated_at);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_created_at ON inventory_items (created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_items_updated_at ON inventory_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_item_categories_created_at ON item_categories (created_at);
CREATE INDEX IF NOT EXISTS idx_item_categories_updated_at ON item_categories (updated_at);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers (created_at);
CREATE INDEX IF NOT EXISTS idx_suppliers_updated_at ON suppliers (updated_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders (created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_updated_at ON purchase_orders (updated_at);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_created_at ON purchase_order_items (created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_updated_at ON purchase_order_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_created_at ON goods_receipts (created_at);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_updated_at ON goods_receipts (updated_at);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_created_at ON goods_receipt_items (created_at);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_updated_at ON goods_receipt_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements (created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_updated_at ON stock_movements (updated_at);
CREATE INDEX IF NOT EXISTS idx_requisitions_created_at ON requisitions (created_at);
CREATE INDEX IF NOT EXISTS idx_requisitions_updated_at ON requisitions (updated_at);
CREATE INDEX IF NOT EXISTS idx_requisition_items_created_at ON requisition_items (created_at);
CREATE INDEX IF NOT EXISTS idx_requisition_items_updated_at ON requisition_items (updated_at);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills (created_at);
CREATE INDEX IF NOT EXISTS idx_bills_updated_at ON bills (updated_at);
CREATE INDEX IF NOT EXISTS idx_bill_items_created_at ON bill_items (created_at);
CREATE INDEX IF NOT EXISTS idx_bill_items_updated_at ON bill_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at);
CREATE INDEX IF NOT EXISTS idx_payments_updated_at ON payments (updated_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_created_at ON payment_methods (created_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_updated_at ON payment_methods (updated_at);
CREATE INDEX IF NOT EXISTS idx_discounts_created_at ON discounts (created_at);
CREATE INDEX IF NOT EXISTS idx_discounts_updated_at ON discounts (updated_at);

-- Scheduling indexes
CREATE INDEX IF NOT EXISTS idx_staff_shifts_created_at ON staff_shifts (created_at);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_updated_at ON staff_shifts (updated_at);
CREATE INDEX IF NOT EXISTS idx_shift_types_created_at ON shift_types (created_at);
CREATE INDEX IF NOT EXISTS idx_shift_types_updated_at ON shift_types (updated_at);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_created_at ON time_off_requests (created_at);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_updated_at ON time_off_requests (updated_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_updated_at ON notifications (updated_at);
CREATE INDEX IF NOT EXISTS idx_notification_templates_created_at ON notification_templates (created_at);
CREATE INDEX IF NOT EXISTS idx_notification_templates_updated_at ON notification_templates (updated_at);

-- Permission indexes
CREATE INDEX IF NOT EXISTS idx_permissions_created_at ON permissions (created_at);
CREATE INDEX IF NOT EXISTS idx_permissions_updated_at ON permissions (updated_at);
CREATE INDEX IF NOT EXISTS idx_permission_assignments_created_at ON permission_assignments (created_at);
CREATE INDEX IF NOT EXISTS idx_permission_assignments_updated_at ON permission_assignments (updated_at);

-- Queue status role matrix index
CREATE INDEX IF NOT EXISTS idx_queue_status_role_visibility_created_at ON queue_status_role_visibility (created_at);
CREATE INDEX IF NOT EXISTS idx_queue_status_role_visibility_updated_at ON queue_status_role_visibility (updated_at);

-- Add comments to document the audit columns purpose
COMMENT ON COLUMN form_definitions.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN form_definitions.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN form_definitions.created_by IS 'User who created the record';
COMMENT ON COLUMN form_definitions.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN tenant_themes.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN tenant_themes.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN tenant_themes.created_by IS 'User who created the record';
COMMENT ON COLUMN tenant_themes.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN feature_flags.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN feature_flags.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN feature_flags.created_by IS 'User who created the record';
COMMENT ON COLUMN feature_flags.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN staff_users.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN staff_users.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN staff_users.created_by IS 'User who created the record';
COMMENT ON COLUMN staff_users.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN staff_roles.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN staff_roles.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN staff_roles.created_by IS 'User who created the record';
COMMENT ON COLUMN staff_roles.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN departments.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN departments.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN departments.created_by IS 'User who created the record';
COMMENT ON COLUMN departments.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN active_roles.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN active_roles.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN active_roles.created_by IS 'User who created the record';
COMMENT ON COLUMN active_roles.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN patients.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN patients.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN patients.created_by IS 'User who created the record';
COMMENT ON COLUMN patients.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN patient_insurance_details.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN patient_insurance_details.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN patient_insurance_details.created_by IS 'User who created the record';
COMMENT ON COLUMN patient_insurance_details.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN user_profiles.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN user_profiles.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN user_profiles.created_by IS 'User who created the record';
COMMENT ON COLUMN user_profiles.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN visit_queue_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN visit_queue_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN visit_queue_items.created_by IS 'User who created the record';
COMMENT ON COLUMN visit_queue_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN queue_timeline_entries.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN queue_timeline_entries.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN queue_timeline_entries.created_by IS 'User who created the record';
COMMENT ON COLUMN queue_timeline_entries.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN triage_entries.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN triage_entries.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN triage_entries.created_by IS 'User who created the record';
COMMENT ON COLUMN triage_entries.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN triage_titles.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN triage_titles.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN triage_titles.created_by IS 'User who created the record';
COMMENT ON COLUMN triage_titles.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN consultation_entries.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN consultation_entries.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN consultation_entries.created_by IS 'User who created the record';
COMMENT ON COLUMN consultation_entries.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN consultation_title.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN consultation_title.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN consultation_title.created_by IS 'User who created the record';
COMMENT ON COLUMN consultation_title.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN medications.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN medications.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN medications.created_by IS 'User who created the record';
COMMENT ON COLUMN medications.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN prescriptions.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN prescriptions.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN prescriptions.created_by IS 'User who created the record';
COMMENT ON COLUMN prescriptions.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN prescription_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN prescription_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN prescription_items.created_by IS 'User who created the record';
COMMENT ON COLUMN prescription_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN prescription_audit.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN prescription_audit.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN prescription_audit.created_by IS 'User who created the record';
COMMENT ON COLUMN prescription_audit.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN inventory.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN inventory.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN inventory.created_by IS 'User who created the record';
COMMENT ON COLUMN inventory.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN test_catalog.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN test_catalog.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN test_catalog.created_by IS 'User who created the record';
COMMENT ON COLUMN test_catalog.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN test_categories.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN test_categories.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN test_categories.created_by IS 'User who created the record';
COMMENT ON COLUMN test_categories.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN diagnostic_orders.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN diagnostic_orders.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN diagnostic_orders.created_by IS 'User who created the record';
COMMENT ON COLUMN diagnostic_orders.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN diagnostic_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN diagnostic_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN diagnostic_items.created_by IS 'User who created the record';
COMMENT ON COLUMN diagnostic_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN diagnostic_results.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN diagnostic_results.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN diagnostic_results.created_by IS 'User who created the record';
COMMENT ON COLUMN diagnostic_results.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN diagnostic_notes.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN diagnostic_notes.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN diagnostic_notes.created_by IS 'User who created the record';
COMMENT ON COLUMN diagnostic_notes.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN diagnostic_file_attachments.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN diagnostic_file_attachments.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN diagnostic_file_attachments.created_by IS 'User who created the record';
COMMENT ON COLUMN diagnostic_file_attachments.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN result_templates.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN result_templates.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN result_templates.created_by IS 'User who created the record';
COMMENT ON COLUMN result_templates.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN result_attachments.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN result_attachments.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN result_attachments.created_by IS 'User who created the record';
COMMENT ON COLUMN result_attachments.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN samples.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN samples.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN samples.created_by IS 'User who created the record';
COMMENT ON COLUMN samples.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN inventory_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN inventory_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN inventory_items.created_by IS 'User who created the record';
COMMENT ON COLUMN inventory_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN item_categories.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN item_categories.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN item_categories.created_by IS 'User who created the record';
COMMENT ON COLUMN item_categories.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN suppliers.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN suppliers.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN suppliers.created_by IS 'User who created the record';
COMMENT ON COLUMN suppliers.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN purchase_orders.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN purchase_orders.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN purchase_orders.created_by IS 'User who created the record';
COMMENT ON COLUMN purchase_orders.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN purchase_order_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN purchase_order_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN purchase_order_items.created_by IS 'User who created the record';
COMMENT ON COLUMN purchase_order_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN goods_receipts.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN goods_receipts.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN goods_receipts.created_by IS 'User who created the record';
COMMENT ON COLUMN goods_receipts.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN goods_receipt_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN goods_receipt_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN goods_receipt_items.created_by IS 'User who created the record';
COMMENT ON COLUMN goods_receipt_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN stock_movements.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN stock_movements.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN stock_movements.created_by IS 'User who created the record';
COMMENT ON COLUMN stock_movements.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN requisitions.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN requisitions.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN requisitions.created_by IS 'User who created the record';
COMMENT ON COLUMN requisitions.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN requisition_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN requisition_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN requisition_items.created_by IS 'User who created the record';
COMMENT ON COLUMN requisition_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN bills.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN bills.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN bills.created_by IS 'User who created the record';
COMMENT ON COLUMN bills.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN bill_items.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN bill_items.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN bill_items.created_by IS 'User who created the record';
COMMENT ON COLUMN bill_items.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN payments.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN payments.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN payments.created_by IS 'User who created the record';
COMMENT ON COLUMN payments.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN payment_methods.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN payment_methods.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN payment_methods.created_by IS 'User who created the record';
COMMENT ON COLUMN payment_methods.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN discounts.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN discounts.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN discounts.created_by IS 'User who created the record';
COMMENT ON COLUMN discounts.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN staff_shifts.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN staff_shifts.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN staff_shifts.created_by IS 'User who created the record';
COMMENT ON COLUMN staff_shifts.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN shift_types.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN shift_types.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN shift_types.created_by IS 'User who created the record';
COMMENT ON COLUMN shift_types.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN time_off_requests.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN time_off_requests.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN time_off_requests.created_by IS 'User who created the record';
COMMENT ON COLUMN time_off_requests.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN notifications.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN notifications.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN notifications.created_by IS 'User who created the record';
COMMENT ON COLUMN notifications.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN notification_templates.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN notification_templates.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN notification_templates.created_by IS 'User who created the record';
COMMENT ON COLUMN notification_templates.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN permissions.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN permissions.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN permissions.created_by IS 'User who created the record';
COMMENT ON COLUMN permissions.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN permission_assignments.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN permission_assignments.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN permission_assignments.created_by IS 'User who created the record';
COMMENT ON COLUMN permission_assignments.updated_by IS 'User who last updated the record';
COMMENT ON COLUMN queue_status_role_visibility.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN queue_status_role_visibility.updated_at IS 'Timestamp when the record was last updated';
COMMENT ON COLUMN queue_status_role_visibility.created_by IS 'User who created the record';
COMMENT ON COLUMN queue_status_role_visibility.updated_by IS 'User who last updated the record';
