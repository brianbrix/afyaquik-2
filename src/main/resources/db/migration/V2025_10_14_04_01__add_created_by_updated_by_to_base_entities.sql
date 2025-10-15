-- Add created_by and updated_by columns to all tables that extend BaseEntity
-- This migration adds the columns to all existing tables that have the BaseEntity structure

-- Add columns to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to bill_items table
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to payment_methods table
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to discounts table
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to diagnostic_orders table
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_orders ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to diagnostic_items table
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to diagnostic_results table
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_results ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to diagnostic_notes table
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_notes ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to diagnostic_file_attachments table
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE diagnostic_file_attachments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to test_catalogs table
ALTER TABLE test_catalogs ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE test_catalogs ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to test_categories table
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE test_categories ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to result_templates table
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE result_templates ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to samples table
ALTER TABLE samples ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE samples ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to staff_shifts table
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to time_off_requests table
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE time_off_requests ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to visit_queue_items table
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE visit_queue_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to consultation_entries table
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE consultation_entries ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to consultation_titles table
ALTER TABLE consultation_titles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE consultation_titles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to triage_entries table
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE triage_entries ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to triage_titles table
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE triage_titles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to medications table
ALTER TABLE medications ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to inventory table
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to prescription_items table
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to notification_templates table
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE notification_templates ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Add columns to queue_status_role_matrix table
ALTER TABLE queue_status_role_matrix ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE queue_status_role_matrix ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

