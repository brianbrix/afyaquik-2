import React from 'react';
import { Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { type Supplier, supplierApi } from '../../../services/inventoryApi';
import Swal from 'sweetalert2';

interface SuppliersListProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onRefresh: () => void;
}

const SuppliersList: React.FC<SuppliersListProps> = ({
  suppliers,
  loading,
  onEdit,
  onRefresh
}) => {
  const handleDelete = async (supplier: Supplier) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${supplier.supplierName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await supplierApi.delete(supplier.id);
        Swal.fire('Deleted!', 'Supplier has been deleted.', 'success');
        onRefresh();
      } catch (error) {
        console.error('Failed to delete supplier:', error);
        Swal.fire('Error!', 'Failed to delete supplier.', 'error');
      }
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
      {suppliers.length === 0 ? (
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          No suppliers found.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <strong>{supplier.supplierName}</strong>
                    {supplier.notes && (
                      <div className="text-muted small">{supplier.notes}</div>
                    )}
                  </td>
                  <td>{supplier.contactPerson || '—'}</td>
                  <td>{supplier.email || '—'}</td>
                  <td>{supplier.phone || '—'}</td>
                  <td>{supplier.city || '—'}</td>
                  <td>
                    <Badge bg={supplier.isActive ? 'success' : 'secondary'}>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(supplier)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(supplier)}
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
          Showing {suppliers.length} suppliers
        </small>
      </div>
    </div>
  );
};

export default SuppliersList;

