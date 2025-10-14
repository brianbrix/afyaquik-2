import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Form, InputGroup, Row, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, Inventory, InventoryRequest } from '../../../services/pharmacyApi';
import { InventoryForm } from '../components/InventoryForm';
// Icons are used via CSS classes: bi-search, bi-plus, bi-pencil-square, bi-trash, bi-exclamation-triangle, bi-clock

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<Inventory | null>(null);
  const [filter, setFilter] = useState<'all' | 'lowStock' | 'needsReorder' | 'expiring' | 'expired'>('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [inventoryToAdjust, setInventoryToAdjust] = useState<Inventory | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading, error } = useQuery({
    queryKey: ['inventory', filter],
    queryFn: async () => {
      try {
        switch (filter) {
          case 'lowStock':
            return await inventoryApi.getAll({ lowStock: true });
          case 'needsReorder':
            return await inventoryApi.getAll({ needsReorder: true });
          case 'expiring':
            return await inventoryApi.getAll({ expiring: 30 });
          case 'expired':
            return await inventoryApi.getAll({ expired: true });
          default:
            return await inventoryApi.getAll();
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        return [];
      }
    }
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['inventory', 'search', searchTerm],
    queryFn: async () => {
      try {
        return await inventoryApi.search(searchTerm);
      } catch (error) {
        console.error('Error searching inventory:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 2
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryRequest }) => 
      inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowForm(false);
      setEditingInventory(null);
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, quantity, notes }: { id: number; quantity: number; notes?: string }) => 
      inventoryApi.adjustStock(id, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowAdjustModal(false);
      setInventoryToAdjust(null);
      setAdjustQuantity(0);
      setAdjustNotes('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowDeleteModal(false);
      setInventoryToDelete(null);
    }
  });

  const handleEdit = (inventory: Inventory) => {
    setEditingInventory(inventory);
    setShowForm(true);
  };

  const handleDelete = (inventory: Inventory) => {
    setInventoryToDelete(inventory);
    setShowDeleteModal(true);
  };

  const handleAdjustStock = (inventory: Inventory) => {
    setInventoryToAdjust(inventory);
    setShowAdjustModal(true);
  };

  const handleFormSubmit = (data: InventoryRequest) => {
    if (editingInventory) {
      updateMutation.mutate({ id: editingInventory.id, data });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInventory(null);
  };

  const handleAdjustSubmit = () => {
    if (inventoryToAdjust) {
      adjustStockMutation.mutate({
        id: inventoryToAdjust.id,
        quantity: adjustQuantity,
        notes: adjustNotes || undefined
      });
    }
  };

  const displayInventory = searchTerm.length > 2 ? (searchResults || []) : (inventory || []);

  if (error) {
    return (
      <Alert variant="danger">
        Error loading inventory: {error.message}
      </Alert>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2>Inventory Management</h2>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All Inventory</option>
                <option value="lowStock">Low Stock</option>
                <option value="needsReorder">Needs Reorder</option>
                <option value="expiring">Expiring Soon (30 days)</option>
                <option value="expired">Expired</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Code</th>
                  <th>Stock</th>
                  <th>Min Level</th>
                  <th>Expiry Date</th>
                  <th>Supplier</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayInventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.medicationName}</td>
                    <td>{item.medicationCode}</td>
                    <td>{item.quantityInStock}</td>
                    <td>{item.minimumStockLevel}</td>
                    <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
                    <td>{item.supplier || '-'}</td>
                    <td>{item.location || '-'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {item.lowStock && <Badge bg="warning">Low Stock</Badge>}
                        {item.needsReorder && <Badge bg="danger">Reorder</Badge>}
                        {item.expired && <Badge bg="danger">Expired</Badge>}
                        {item.expiringSoon && !item.expired && <Badge bg="warning">Expiring</Badge>}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleAdjustStock(item)}
                        >
                          Adjust
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showForm} onHide={handleFormClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InventoryForm
            inventory={editingInventory}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            isLoading={updateMutation.isPending}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showAdjustModal} onHide={() => setShowAdjustModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Medication</Form.Label>
              <Form.Control
                type="text"
                value={inventoryToAdjust?.medicationName || ''}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Current Stock</Form.Label>
              <Form.Control
                type="text"
                value={inventoryToAdjust?.quantityInStock || 0}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adjustment Quantity</Form.Label>
              <Form.Control
                type="number"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                placeholder="Enter positive or negative number"
              />
              <Form.Text className="text-muted">
                Use positive numbers to add stock, negative to remove
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                placeholder="Reason for adjustment..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAdjustSubmit}
            disabled={adjustStockMutation.isPending}
          >
            {adjustStockMutation.isPending ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the inventory record for "{inventoryToDelete?.medicationName}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => inventoryToDelete && deleteMutation.mutate(inventoryToDelete.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
