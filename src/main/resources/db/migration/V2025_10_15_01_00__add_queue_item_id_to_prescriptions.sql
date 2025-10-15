-- Add queue_item_id column to prescriptions table
ALTER TABLE prescriptions ADD COLUMN queue_item_id BIGINT;

-- Add index for better query performance
CREATE INDEX idx_prescriptions_queue_item ON prescriptions(tenant_id, queue_item_id);

-- Add foreign key constraint (optional, can be added later if needed)
-- ALTER TABLE prescriptions ADD CONSTRAINT fk_prescriptions_queue_item 
--     FOREIGN KEY (queue_item_id) REFERENCES visit_queue_items(id);
