import React from 'react';
import { Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { type ItemCategory, itemCategoryApi } from '../../../services/inventoryApi';
import Swal from 'sweetalert2';

interface ItemCategoriesListProps {
  categories: ItemCategory[];
  loading: boolean;
  onEdit: (category: ItemCategory) => void;
  onRefresh: () => void;
}

const ItemCategoriesList: React.FC<ItemCategoriesListProps> = ({
  categories,
  loading,
  onEdit,
  onRefresh
}) => {
  const handleDelete = async (category: ItemCategory) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${category.categoryName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await itemCategoryApi.delete(category.id);
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        onRefresh();
      } catch (error) {
        console.error('Failed to delete category:', error);
        Swal.fire('Error!', 'Failed to delete category.', 'error');
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
      {categories.length === 0 ? (
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          No categories found.
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.categoryName}</strong>
                  </td>
                  <td>
                    {category.description || (
                      <span className="text-muted">No description</span>
                    )}
                  </td>
                  <td>
                    <Badge bg={category.isActive ? 'success' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(category)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(category)}
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
          Showing {categories.length} categories
        </small>
      </div>
    </div>
  );
};

export default ItemCategoriesList;

