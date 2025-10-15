import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Inventory, InventoryRequest, Medication, inventoryApi } from '../../../services/pharmacyApi';
import Swal from 'sweetalert2';

interface MedicationInventoryFormProps {
  inventory?: Inventory | null;
  medications: Medication[];
  onSubmit: (data: InventoryRequest & { medicationId?: number }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MedicationInventoryForm({
  inventory,
  medications,
  onSubmit,
  onCancel,
  isSubmitting = false
}: MedicationInventoryFormProps) {
  const [formData, setFormData] = useState<InventoryRequest & { medicationId?: number }>({
    quantityInStock: 0,
    minimumStockLevel: 0,
    maximumStockLevel: undefined,
    reorderPoint: undefined,
    reorderQuantity: undefined,
    unitCost: undefined,
    expiryDate: '',
    batchNumber: '',
    supplier: '',
    location: '',
    notes: '',
    medicationId: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [batchNumberGenerated, setBatchNumberGenerated] = useState(false);

  // Generate batch number using backend API
  const generateBatchNumber = async () => {
    if (!formData.medicationId) {
       Swal.fire('Please select a medication first', 'warning');
      return; 
    }
    
    try {
      const batchNumber = await inventoryApi.generateBatchNumber(formData.medicationId);
      setFormData(prev => ({ ...prev, batchNumber }));
      setBatchNumberGenerated(true);
    } catch (error) {
      console.error('Failed to generate batch number:', error);
      Swal.fire({title: 'Failed to generate batch number. Please try again.', icon: 'error', confirmButtonText: 'OK'});
    }
  };

  useEffect(() => {
    if (inventory) {
      setFormData({
        quantityInStock: inventory.quantityInStock,
        minimumStockLevel: inventory.minimumStockLevel,
        maximumStockLevel: inventory.maximumStockLevel,
        reorderPoint: inventory.reorderPoint,
        reorderQuantity: inventory.reorderQuantity,
        unitCost: inventory.unitCost,
        expiryDate: inventory.expiryDate || '',
        batchNumber: inventory.batchNumber || '',
        supplier: inventory.supplier || '',
        location: inventory.location || '',
        notes: inventory.notes || '',
        medicationId: inventory.medicationId
      });
    }
  }, [inventory]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!inventory && !formData.medicationId) {
      newErrors.medicationId = 'Please select a medication';
    }

    if (formData.quantityInStock < 0) {
      newErrors.quantityInStock = 'Quantity cannot be negative';
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

    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        newErrors.expiryDate = 'Expiry date cannot be in the past';
      }
    }

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    } else {
    
        // Check uniqueness with backend
        try {
          const isValid = await inventoryApi.validateBatchNumber(formData.batchNumber, inventory?.id);
          if (!isValid) {
            newErrors.batchNumber = 'Batch number already exists. Please use a different one.';
          }
        } catch (error) {
          console.error('Failed to validate batch number:', error);
          // Don't block form submission if validation fails
        }
      
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (await validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {Object.keys(errors).length > 0 && (
        <Alert variant="danger">
          <strong>Please fix the following errors:</strong>
          <ul className="mb-0 mt-2">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Medication *</Form.Label>
            <Form.Select
              value={formData.medicationId || ''}
              onChange={(e) => handleChange('medicationId', e.target.value ? Number(e.target.value) : undefined)}
              isInvalid={!!errors.medicationId}
              disabled={!!inventory} // Can't change medication when editing
            >
              <option value="">Select a medication</option>
              {medications.map(med => (
                <option key={med.id} value={med.id}>
                  {med.name} ({med.code})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.medicationId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Current Stock *</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.quantityInStock}
              onChange={(e) => handleChange('quantityInStock', Number(e.target.value))}
              isInvalid={!!errors.quantityInStock}
              placeholder="0"
            />
            <Form.Control.Feedback type="invalid">
              {errors.quantityInStock}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Minimum Stock Level *</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.minimumStockLevel}
              onChange={(e) => handleChange('minimumStockLevel', Number(e.target.value))}
              isInvalid={!!errors.minimumStockLevel}
              placeholder="0"
            />
            <Form.Control.Feedback type="invalid">
              {errors.minimumStockLevel}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Maximum Stock Level</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.maximumStockLevel || ''}
              onChange={(e) => handleChange('maximumStockLevel', e.target.value ? Number(e.target.value) : undefined)}
              isInvalid={!!errors.maximumStockLevel}
              placeholder="Optional"
            />
            <Form.Control.Feedback type="invalid">
              {errors.maximumStockLevel}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Reorder Point</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.reorderPoint || ''}
              onChange={(e) => handleChange('reorderPoint', e.target.value ? Number(e.target.value) : undefined)}
              isInvalid={!!errors.reorderPoint}
              placeholder="Optional"
            />
            <Form.Control.Feedback type="invalid">
              {errors.reorderPoint}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Reorder Quantity</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={formData.reorderQuantity || ''}
              onChange={(e) => handleChange('reorderQuantity', e.target.value ? Number(e.target.value) : undefined)}
              isInvalid={!!errors.reorderQuantity}
              placeholder="Optional"
            />
            <Form.Control.Feedback type="invalid">
              {errors.reorderQuantity}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Unit Cost</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={formData.unitCost || ''}
              onChange={(e) => handleChange('unitCost', e.target.value ? Number(e.target.value) : undefined)}
              isInvalid={!!errors.unitCost}
              placeholder="0.00"
            />
            <Form.Control.Feedback type="invalid">
              {errors.unitCost}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Expiry Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              isInvalid={!!errors.expiryDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.expiryDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Batch Number *</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={formData.batchNumber}
                onChange={(e) => {
                  handleChange('batchNumber', e.target.value);
                  setBatchNumberGenerated(false);
                }}
                placeholder="e.g., B20241201001"
                isInvalid={!!errors.batchNumber}
              />
              <Button 
                variant="outline-secondary" 
                onClick={generateBatchNumber}
                disabled={isSubmitting || !formData.medicationId}
                title="Generate batch number"
                size="sm"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Generate
              </Button>
            </div>
            {batchNumberGenerated && (
              <Form.Text className="text-success">
                <i className="bi bi-check-circle me-1"></i>
                Batch number auto-generated
              </Form.Text>
            )}
            <Form.Control.Feedback type="invalid">
              {errors.batchNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Supplier</Form.Label>
            <Form.Control
              type="text"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              placeholder="Enter supplier name"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Enter storage location"
            />
          </Form.Group>
        </Col>
      </Row>


      <Form.Group className="mb-3">
        <Form.Label>Notes</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes about this inventory item..."
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (inventory ? 'Update Inventory' : 'Create Inventory')}
        </Button>
      </div>
    </Form>
  );
}
