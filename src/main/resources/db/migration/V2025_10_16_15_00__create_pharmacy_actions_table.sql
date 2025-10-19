-- Create pharmacy_actions table
CREATE TABLE pharmacy_actions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    queue_item_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_by VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tenant_id VARCHAR(64) NOT NULL,
    
    FOREIGN KEY (queue_item_id) REFERENCES visit_queue_items(id) ON DELETE CASCADE,
    INDEX idx_pharmacy_actions_queue_item (queue_item_id),
    INDEX idx_pharmacy_actions_tenant (tenant_id),
    INDEX idx_pharmacy_actions_sort_order (sort_order)
);


