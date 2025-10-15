import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Tab } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { inventoryItemApi, itemCategoryApi, supplierApi } from '../../../services/inventoryApi';
import { departmentApi } from '../../../services/departmentApi';
import InventoryItemsList from '../components/InventoryItemsList';
import ItemCategoriesList from '../components/ItemCategoriesList';
import SuppliersList from '../components/SuppliersList';
import InventoryItemModal from '../components/InventoryItemModal';
import ItemCategoryModal from '../components/ItemCategoryModal';
import SupplierModal from '../components/SupplierModal';

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  // Fetch data for all tabs
  const { data: items = [], isLoading: itemsLoading, refetch: refetchItems } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => inventoryItemApi.getAll(),
  });

  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['item-categories'],
    queryFn: () => itemCategoryApi.getAll(),
  });

  const { data: suppliers = [], isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierApi.getAll(),
  });

  // Note: Departments are managed in the admin section

  const handleCreateItem = () => {
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setShowSupplierModal(true);
  };

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setShowSupplierModal(true);
  };

  // Note: Department management is handled in the admin section

  const handleItemSaved = () => {
    setShowItemModal(false);
    setEditingItem(null);
    refetchItems();
  };

  const handleCategorySaved = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    refetchCategories();
  };

  const handleSupplierSaved = () => {
    setShowSupplierModal(false);
    setEditingSupplier(null);
    refetchSuppliers();
  };

  // Note: Department management is handled in the admin section

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-boxes me-2"></i>
              Inventory Management
            </h2>
          </div>

          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'items')}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="items">
                  <i className="bi bi-box me-2"></i>
                  Inventory Items
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="categories">
                  <i className="bi bi-tags me-2"></i>
                  Categories
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="suppliers">
                  <i className="bi bi-truck me-2"></i>
                  Suppliers
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="items">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Inventory Items</h5>
                    <Button variant="primary" onClick={handleCreateItem}>
                      <i className="bi bi-plus me-2"></i>
                      Add Item
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <InventoryItemsList
                      items={items}
                      loading={itemsLoading}
                      onEdit={handleEditItem}
                      onRefresh={refetchItems}
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="categories">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Item Categories</h5>
                    <Button variant="primary" onClick={handleCreateCategory}>
                      <i className="bi bi-plus me-2"></i>
                      Add Category
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <ItemCategoriesList
                      categories={categories}
                      loading={categoriesLoading}
                      onEdit={handleEditCategory}
                      onRefresh={refetchCategories}
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="suppliers">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Suppliers</h5>
                    <Button variant="primary" onClick={handleCreateSupplier}>
                      <i className="bi bi-plus me-2"></i>
                      Add Supplier
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <SuppliersList
                      suppliers={suppliers}
                      loading={suppliersLoading}
                      onEdit={handleEditSupplier}
                      onRefresh={refetchSuppliers}
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>

            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>

      {/* Modals */}
      <InventoryItemModal
        show={showItemModal}
        onHide={() => setShowItemModal(false)}
        onSaved={handleItemSaved}
        item={editingItem}
        categories={categories}
        suppliers={suppliers}
      />

      <ItemCategoryModal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        onSaved={handleCategorySaved}
        category={editingCategory}
      />

      <SupplierModal
        show={showSupplierModal}
        onHide={() => setShowSupplierModal(false)}
        onSaved={handleSupplierSaved}
        supplier={editingSupplier}
      />

    </Container>
  );
};

export default InventoryPage;
