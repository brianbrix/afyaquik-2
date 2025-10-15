import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import { itemCategoryApi, type ItemCategory, type ItemCategoryRequest } from '../../../services/inventoryApi';
import Swal from 'sweetalert2';

interface ItemCategoryModalProps {
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
  category?: ItemCategory | null;
}

const ItemCategoryModal: React.FC<ItemCategoryModalProps> = ({
  show,
  onHide,
  onSaved,
  category
}) => {
  const [formData, setFormData] = useState<ItemCategoryRequest>({
    categoryName: '',
    description: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName,
        description: category.description || '',
        isActive: category.isActive
      });
    } else {
      setFormData({
        categoryName: '',
        description: '',
        isActive: true
      });
    }
    setErrors({});
  }, [category, show]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (category) {
        await itemCategoryApi.update(category.id, formData);
        Swal.fire('Success', 'Category updated successfully', 'success');
      } else {
        await itemCategoryApi.create(formData);
        Swal.fire('Success', 'Category created successfully', 'success');
      }
      
      onSaved();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {category ? 'Edit Category' : 'Add New Category'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name *</Form.Label>
            <Form.Control
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleInputChange}
              isInvalid={!!errors.categoryName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.categoryName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              label="Active"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              category ? 'Update Category' : 'Create Category'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ItemCategoryModal;

