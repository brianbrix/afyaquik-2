import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Inventory, InventoryRequest } from '../../../services/pharmacyApi';

interface InventoryFormProps {
  inventory?: Inventory | null;
  onSubmit: (data: InventoryRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InventoryForm({ inventory, onSubmit, onCancel, isLoading }: InventoryFormProps) {
  const [formData, setFormData] = useState<InventoryRequest>({
    quantityInStock: 0,
    minimumStockLevel: 0,
    maximumStockLevel: undefined,
    reorderPoint: undefined,
    reorderQuantity: undefined,
    unitCost: undefined,
    expiryDate: undefined,
    batchNumber: '',
    supplier: '',
    location: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (inventory) {
      setFormData({
        quantityInStock: inventory.quantityInStock,
        minimumStockLevel: inventory.minimumStockLevel,
        maximumStockLevel: inventory.maximumStockLevel,
        reorderPoint: inventory.reorderPoint,
        reorderQuantity: inventory.reorderQuantity,
        unitCost: inventory.unitCost,
        expiryDate: inventory.expiryDate,
        batchNumber: inventory.batchNumber || '',
        supplier: inventory.supplier || '',
        location: inventory.location || '',
        notes: inventory.notes || ''
      });
    }
  }, [inventory]);

  const handleChange = (field: keyof InventoryRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.quantityInStock < 0) {
      newErrors.quantityInStock = 'Quantity in stock cannot be negative';
    }

    if (formData.minimumStockLevel < 0) {
      newErrors.minimumStockLevel = 'Minimum stock level cannot be negative';
    }

    if (formData.maximumStockLevel && formData.maximumStockLevel < formData.minimumStockLevel) {
      newErrors.maximumStockLevel = 'Maximum stock level must be greater than minimum stock level';
    }

    if (formData.reorderPoint && formData.reorderPoint < 0) {
      newErrors.reorderPoint = 'Reorder point cannot be negative';
    }

    if (formData.reorderQuantity && formData.reorderQuantity < 0) {
      newErrors.reorderQuantity = 'Reorder quantity cannot be negative';
    }

    if (formData.unitCost && formData.unitCost < 0) {
      newErrors.unitCost = 'Unit cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Quantity in Stock *</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.quantityInStock}
              onChange={(e) => handleChange('quantityInStock', parseInt(e.target.value) || 0)}
              isInvalid={!!errors.quantityInStock}
            />
            <Form.Control.Feedback type="invalid">
              {errors.quantityInStock}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Minimum Stock Level *</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.minimumStockLevel}
              onChange={(e) => handleChange('minimumStockLevel', parseInt(e.target.value) || 0)}
              isInvalid={!!errors.minimumStockLevel}
            />
            <Form.Control.Feedback type="invalid">
              {errors.minimumStockLevel}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Maximum Stock Level</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.maximumStockLevel || ''}
              onChange={(e) => handleChange('maximumStockLevel', e.target.value ? parseInt(e.target.value) : undefined)}
              isInvalid={!!errors.maximumStockLevel}
            />
            <Form.Control.Feedback type="invalid">
              {errors.maximumStockLevel}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Reorder Point</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.reorderPoint || ''}
              onChange={(e) => handleChange('reorderPoint', e.target.value ? parseInt(e.target.value) : undefined)}
              isInvalid={!!errors.reorderPoint}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reorderPoint}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Reorder Quantity</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.reorderQuantity || ''}
              onChange={(e) => handleChange('reorderQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
              isInvalid={!!errors.reorderQuantity}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reorderQuantity}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Unit Cost</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              value={formData.unitCost || ''}
              onChange={(e) => handleChange('unitCost', e.target.value ? parseFloat(e.target.value) : undefined)}
              isInvalid={!!errors.unitCost}
            />
            <Form.Control.Feedback type="invalid">
              {errors.unitCost}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Expiry Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.expiryDate || ''}
              onChange={(e) => handleChange('expiryDate', e.target.value || undefined)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Batch Number</Form.Label>
            <Form.Control
              type="text"
              value={formData.batchNumber}
              onChange={(e) => handleChange('batchNumber', e.target.value)}
              placeholder="e.g., BATCH001"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Supplier</Form.Label>
            <Form.Control
              type="text"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              placeholder="e.g., ABC Pharmaceuticals"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Shelf A1, Room 101"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this inventory item"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Update'}
        </Button>
      </div>
    </Form>
  );
}