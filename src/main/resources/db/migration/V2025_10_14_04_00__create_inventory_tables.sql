-- Create inventory tables
-- Item Categories
CREATE TABLE item_categories (
    id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Suppliers
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    postal_code VARCHAR(255),
    country VARCHAR(255),
    tax_id VARCHAR(255),
    payment_terms VARCHAR(255),
    credit_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Note: Departments table already exists in the system

-- Inventory Items
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    item_code VARCHAR(255) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL REFERENCES item_categories(id),
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    department_id BIGINT NOT NULL REFERENCES departments(id),
    unit_of_measure VARCHAR(100),
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock_level INTEGER NOT NULL DEFAULT 0,
    maximum_stock_level INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    barcode VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_controlled_substance BOOLEAN DEFAULT false,
    requires_prescription BOOLEAN DEFAULT false,
    storage_location VARCHAR(255),
    expiry_date DATE,
    batch_number VARCHAR(255),
    notes TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    approved_by VARCHAR(255),
    approved_at DATE,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id),
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2),
    notes TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Goods Receipts
CREATE TABLE goods_receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_number VARCHAR(255) NOT NULL UNIQUE,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id),
    receipt_date DATE NOT NULL,
    received_by VARCHAR(255),
    delivery_note_number VARCHAR(255),
    carrier VARCHAR(255),
    tracking_number VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Goods Receipt Items
CREATE TABLE goods_receipt_items (
    id BIGSERIAL PRIMARY KEY,
    goods_receipt_id BIGINT NOT NULL REFERENCES goods_receipts(id),
    purchase_order_item_id BIGINT NOT NULL REFERENCES purchase_order_items(id),
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    quantity_received INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    batch_number VARCHAR(255),
    expiry_date DATE,
    condition_notes TEXT,
    quality_status VARCHAR(100),
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Stock Movements
CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    movement_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_number VARCHAR(255),
    reference_type VARCHAR(100),
    movement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    performed_by VARCHAR(255),
    notes TEXT,
    batch_number VARCHAR(255),
    expiry_date DATE,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Requisitions
CREATE TABLE requisitions (
    id BIGSERIAL PRIMARY KEY,
    requisition_number VARCHAR(255) NOT NULL UNIQUE,
    department_id BIGINT NOT NULL REFERENCES departments(id),
    request_date DATE NOT NULL,
    required_date DATE,
    requested_by VARCHAR(255),
    approved_by VARCHAR(255),
    approved_at DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(50),
    notes TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Requisition Items
CREATE TABLE requisition_items (
    id BIGSERIAL PRIMARY KEY,
    requisition_id BIGINT NOT NULL REFERENCES requisitions(id),
    inventory_item_id BIGINT NOT NULL REFERENCES inventory_items(id),
    quantity_requested INTEGER NOT NULL,
    quantity_fulfilled INTEGER DEFAULT 0,
    unit_of_measure VARCHAR(100),
    notes TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX idx_item_categories_tenant_id ON item_categories(tenant_id);
CREATE INDEX idx_item_categories_deleted ON item_categories(deleted);

CREATE INDEX idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX idx_suppliers_deleted ON suppliers(deleted);

CREATE INDEX idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX idx_departments_deleted ON departments(deleted);

CREATE INDEX idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX idx_inventory_items_deleted ON inventory_items(deleted);
CREATE INDEX idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_supplier_id ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_department_id ON inventory_items(department_id);
CREATE INDEX idx_inventory_items_barcode ON inventory_items(barcode);

CREATE INDEX idx_purchase_orders_tenant_id ON purchase_orders(tenant_id);
CREATE INDEX idx_purchase_orders_deleted ON purchase_orders(deleted);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);

CREATE INDEX idx_purchase_order_items_tenant_id ON purchase_order_items(tenant_id);
CREATE INDEX idx_purchase_order_items_deleted ON purchase_order_items(deleted);
CREATE INDEX idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_inventory_item_id ON purchase_order_items(inventory_item_id);

CREATE INDEX idx_goods_receipts_tenant_id ON goods_receipts(tenant_id);
CREATE INDEX idx_goods_receipts_deleted ON goods_receipts(deleted);
CREATE INDEX idx_goods_receipts_purchase_order_id ON goods_receipts(purchase_order_id);

CREATE INDEX idx_goods_receipt_items_tenant_id ON goods_receipt_items(tenant_id);
CREATE INDEX idx_goods_receipt_items_deleted ON goods_receipt_items(deleted);
CREATE INDEX idx_goods_receipt_items_goods_receipt_id ON goods_receipt_items(goods_receipt_id);
CREATE INDEX idx_goods_receipt_items_purchase_order_item_id ON goods_receipt_items(purchase_order_item_id);
CREATE INDEX idx_goods_receipt_items_inventory_item_id ON goods_receipt_items(inventory_item_id);

CREATE INDEX idx_stock_movements_tenant_id ON stock_movements(tenant_id);
CREATE INDEX idx_stock_movements_deleted ON stock_movements(deleted);
CREATE INDEX idx_stock_movements_inventory_item_id ON stock_movements(inventory_item_id);
CREATE INDEX idx_stock_movements_movement_type ON stock_movements(movement_type);

CREATE INDEX idx_requisitions_tenant_id ON requisitions(tenant_id);
CREATE INDEX idx_requisitions_deleted ON requisitions(deleted);
CREATE INDEX idx_requisitions_department_id ON requisitions(department_id);

CREATE INDEX idx_requisition_items_tenant_id ON requisition_items(tenant_id);
CREATE INDEX idx_requisition_items_deleted ON requisition_items(deleted);
CREATE INDEX idx_requisition_items_requisition_id ON requisition_items(requisition_id);
CREATE INDEX idx_requisition_items_inventory_item_id ON requisition_items(inventory_item_id);
