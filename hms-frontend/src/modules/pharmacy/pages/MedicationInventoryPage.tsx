import React, { useState, useMemo } from 'react';
import { Button, Card, Col, Form, InputGroup, Row, Table, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, medicationApi, Inventory, InventoryRequest, Medication } from '../../../services/pharmacyApi';
import Swal from 'sweetalert2';
import { MedicationInventoryForm } from '../components/MedicationInventoryForm';

export function MedicationInventoryPage() {
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

  // Fetch medication inventory
  const { data: inventory = [], isLoading, error } = useQuery({
    queryKey: ['pharmacy-inventory', filter],
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
        console.error('Error fetching medication inventory:', error);
        return [];
      }
    }
  });

  // Fetch available medications for creating new inventory
  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => medicationApi.getAll()
  });

  // Search functionality
  const { data: searchResults = [] } = useQuery({
    queryKey: ['pharmacy-inventory', 'search', searchTerm],
    queryFn: async () => {
      try {
        return await inventoryApi.search(searchTerm);
      } catch (error) {
        console.error('Error searching medication inventory:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 2
  });

  // Create new medication inventory
  const createMutation = useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: number; data: InventoryRequest }) => 
      inventoryApi.create(medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] });
      setShowForm(false);
      Swal.fire('Success', 'Medication inventory created successfully', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', error?.response?.data?.message || 'Failed to create inventory', 'error');
    }
  });

  // Update medication inventory
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryRequest }) => 
      inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] });
      setShowForm(false);
      setEditingInventory(null);
      Swal.fire('Success', 'Medication inventory updated successfully', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', error?.response?.data?.message || 'Failed to update inventory', 'error');
    }
  });

  // Adjust stock
  const adjustStockMutation = useMutation({
    mutationFn: ({ id, quantity, notes }: { id: number; quantity: number; notes?: string }) => 
      inventoryApi.adjustStock(id, quantity, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] });
      setShowAdjustModal(false);
      setInventoryToAdjust(null);
      setAdjustQuantity(0);
      setAdjustNotes('');
      Swal.fire('Success', 'Stock adjusted successfully', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', error?.response?.data?.message || 'Failed to adjust stock', 'error');
    }
  });

  // Delete inventory
  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] });
      setShowDeleteModal(false);
      setInventoryToDelete(null);
      Swal.fire('Success', 'Inventory deleted successfully', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', error?.response?.data?.message || 'Failed to delete inventory', 'error');
    }
  });

  // Filter and search logic
  const filteredInventory = useMemo(() => {
    let items = searchTerm.length > 2 ? searchResults : inventory;
    
    if (!searchTerm) return items;
    
    const lower = searchTerm.toLowerCase();
    return items.filter((item: Inventory) =>
      [item.medicationName, item.medicationCode, item.batchNumber, item.supplier, item.location]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(lower))
    );
  }, [inventory, searchResults, searchTerm]);

  const handleCreateNew = () => {
    setEditingInventory(null);
    setShowForm(true);
  };

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
    setAdjustQuantity(0);
    setAdjustNotes('');
    setShowAdjustModal(true);
  };

  const handleSubmit = (data: InventoryRequest & { medicationId?: number }) => {
    if (editingInventory) {
      updateMutation.mutate({ id: editingInventory.id, data });
    } else if (data.medicationId) {
      createMutation.mutate({ medicationId: data.medicationId, data });
    }
  };

  const handleAdjustSubmit = () => {
    if (inventoryToAdjust) {
      adjustStockMutation.mutate({ 
        id: inventoryToAdjust.id, 
        quantity: adjustQuantity, 
        notes: adjustNotes 
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (inventoryToDelete) {
      deleteMutation.mutate(inventoryToDelete.id);
    }
  };

  const getStatusBadge = (item: Inventory) => {
    if (item.expired) return <Badge bg="danger">Expired</Badge>;
    if (item.expiringSoon) return <Badge bg="warning">Expiring Soon</Badge>;
    if (item.lowStock) return <Badge bg="warning">Low Stock</Badge>;
    if (item.needsReorder) return <Badge bg="info">Needs Reorder</Badge>;
    return <Badge bg="success">In Stock</Badge>;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Medication Inventory Management</h2>
          <p className="text-muted mb-0">Manage medication stock levels, expiry dates, and inventory tracking</p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Medication Inventory
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error loading medication inventory. Please try again.
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search medications, batch numbers, suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2">
                <Form.Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Items</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="needsReorder">Needs Reorder</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Medication</th>
                  <th>Batch Number</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Supplier</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      {searchTerm ? 'No medications found matching your search.' : 'No medication inventory found.'}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item: Inventory) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{item.medicationName}</div>
                          <small className="text-muted">{item.medicationCode}</small>
                        </div>
                      </td>
                      <td>{item.batchNumber || '—'}</td>
                      <td>
                        <div>
                          <span className="fw-semibold">{item.quantityInStock}</span>
                          <div className="text-muted small">
                            Min: {item.minimumStockLevel} | Max: {item.maximumStockLevel || '—'}
                          </div>
                        </div>
                      </td>
                      <td>
                        {item.expiryDate ? (
                          <div>
                            {new Date(item.expiryDate).toLocaleDateString()}
                            {item.expired && <div className="text-danger small">Expired</div>}
                          </div>
                        ) : '—'}
                      </td>
                      <td>{item.supplier || '—'}</td>
                      <td>{item.location || '—'}</td>
                      <td>{getStatusBadge(item)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(item)}
                            title="Edit inventory"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleAdjustStock(item)}
                            title="Adjust stock"
                          >
                            <i className="bi bi-arrow-up-down"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(item)}
                            title="Delete inventory"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Inventory Form Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingInventory ? 'Edit Medication Inventory' : 'Add Medication Inventory'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MedicationInventoryForm
            inventory={editingInventory}
            medications={medications}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </Modal.Body>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal show={showAdjustModal} onHide={() => setShowAdjustModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Stock - {inventoryToAdjust?.medicationName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Stock: {inventoryToAdjust?.quantityInStock}</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adjustment Quantity</Form.Label>
              <Form.Control
                type="number"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                placeholder="Enter positive or negative number"
              />
              <Form.Text className="text-muted">
                Use positive numbers to add stock, negative to remove stock
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                placeholder="Reason for stock adjustment..."
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
            {adjustStockMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Adjust Stock'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the inventory for <strong>{inventoryToDelete?.medicationName}</strong>?</p>
          <p className="text-muted">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
