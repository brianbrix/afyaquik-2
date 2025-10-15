import React, { useState } from 'react';
import { Table, Button, Badge, Spinner, Alert, InputGroup, Form } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { inventoryItemApi, type InventoryItem } from '../../../services/inventoryApi';
import Swal from 'sweetalert2';

interface InventoryItemsListProps {
  items: InventoryItem[];
  loading: boolean;
  onEdit: (item: InventoryItem) => void;
  onRefresh: () => void;
}

const InventoryItemsList: React.FC<InventoryItemsListProps> = ({
  items,
  loading,
  onEdit,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter items based on search term and status
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'low-stock') {
      matchesStatus = item.currentStock <= item.minimumStockLevel;
    } else if (filterStatus === 'overstocked') {
      matchesStatus = item.currentStock >= item.maximumStockLevel;
    } else if (filterStatus === 'active') {
      matchesStatus = item.isActive;
    } else if (filterStatus === 'inactive') {
      matchesStatus = !item.isActive;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (item: InventoryItem) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${item.itemName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await inventoryItemApi.delete(item.id);
        Swal.fire('Deleted!', 'Item has been deleted.', 'success');
        onRefresh();
      } catch (error) {
        console.error('Failed to delete item:', error);
        Swal.fire('Error!', 'Failed to delete item.', 'error');
      }
    }
  };

  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.currentStock <= item.minimumStockLevel) {
      return <Badge bg="danger">Low Stock</Badge>;
    } else if (item.currentStock >= item.maximumStockLevel) {
      return <Badge bg="warning">Overstocked</Badge>;
    } else {
      return <Badge bg="success">Normal</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-6">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className="col-md-3">
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low-stock">Low Stock</option>
            <option value="overstocked">Overstocked</option>
          </Form.Select>
        </div>
        <div className="col-md-3">
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          No inventory items found.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Department</th>
                <th>Current Stock</th>
                <th>Min/Max</th>
                <th>Unit Cost</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <code>{item.itemCode}</code>
                  </td>
                  <td>
                    <div>
                      <strong>{item.itemName}</strong>
                      {item.description && (
                        <div className="text-muted small">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td>{item.categoryName}</td>
                  <td>{item.supplierName}</td>
                  <td>{item.departmentName}</td>
                  <td>
                    <strong>{item.currentStock}</strong>
                    {item.unitOfMeasure && (
                      <div className="text-muted small">{item.unitOfMeasure}</div>
                    )}
                  </td>
                  <td>
                    <div className="small">
                      Min: {item.minimumStockLevel}
                    </div>
                    <div className="small">
                      Max: {item.maximumStockLevel}
                    </div>
                  </td>
                  <td>${item.unitCost.toFixed(2)}</td>
                  <td>${item.unitPrice.toFixed(2)}</td>
                  <td>
                    <div className="d-flex flex-column gap-1">
                      {getStockStatusBadge(item)}
                      <Badge bg={item.isActive ? 'success' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {item.isControlledSubstance && (
                        <Badge bg="warning">Controlled</Badge>
                      )}
                      {item.requiresPrescription && (
                        <Badge bg="info">Rx Required</Badge>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <i className="bi bi-pencil"></i>
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
        </div>
      )}

      <div className="mt-3">
        <small className="text-muted">
          Showing {filteredItems.length} of {items.length} items
        </small>
      </div>
    </div>
  );
};

export default InventoryItemsList;

