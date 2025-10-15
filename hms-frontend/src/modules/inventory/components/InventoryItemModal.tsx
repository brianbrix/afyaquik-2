import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { inventoryItemApi, type InventoryItem, type InventoryItemRequest, type ItemCategory, type Supplier } from '../../../services/inventoryApi';
import { departmentApi, type Department } from '../../../services/departmentApi';
import Swal from 'sweetalert2';

interface InventoryItemModalProps {
  show: boolean;
  onHide: () => void;
  onSaved: () => void;
  item?: InventoryItem | null;
  categories: ItemCategory[];
  suppliers: Supplier[];
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  show,
  onHide,
  onSaved,
  item,
  categories,
  suppliers
}) => {
  const [formData, setFormData] = useState<InventoryItemRequest>({
    itemCode: '',
    itemName: '',
    description: '',
    categoryId: 0,
    supplierId: 0,
    departmentId: '',
    unitOfMeasure: '',
    currentStock: 0,
    minimumStockLevel: 0,
    maximumStockLevel: 0,
    unitCost: 0,
    unitPrice: 0,
    barcode: '',
    isActive: true,
    isControlledSubstance: false,
    requiresPrescription: false,
    storageLocation: '',
    expiryDate: '',
    batchNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.getAll(),
    enabled: show
  });

  useEffect(() => {
    if (item) {
      setFormData({
        itemCode: item.itemCode,
        itemName: item.itemName,
        description: item.description || '',
        categoryId: item.categoryId,
        supplierId: item.supplierId,
        departmentId: item.departmentId,
        unitOfMeasure: item.unitOfMeasure || '',
        currentStock: item.currentStock,
        minimumStockLevel: item.minimumStockLevel,
        maximumStockLevel: item.maximumStockLevel,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        barcode: item.barcode || '',
        isActive: item.isActive,
        isControlledSubstance: item.isControlledSubstance,
        requiresPrescription: item.requiresPrescription,
        storageLocation: item.storageLocation || '',
        expiryDate: item.expiryDate || '',
        batchNumber: item.batchNumber || '',
        notes: item.notes || ''
      });
    } else {
      setFormData({
        itemCode: '',
        itemName: '',
        description: '',
        categoryId: 0,
        supplierId: 0,
        departmentId: '',
        unitOfMeasure: '',
        currentStock: 0,
        minimumStockLevel: 0,
        maximumStockLevel: 0,
        unitCost: 0,
        unitPrice: 0,
        barcode: '',
        isActive: true,
        isControlledSubstance: false,
        requiresPrescription: false,
        storageLocation: '',
        expiryDate: '',
        batchNumber: '',
        notes: ''
      });
    }
    setErrors({});
  }, [item, show]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    if (type === 'number') {
      newValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
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
    
    if (!formData.itemCode.trim()) {
      newErrors.itemCode = 'Item code is required';
    }
    
    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (!formData.supplierId) {
      newErrors.supplierId = 'Supplier is required';
    }
    
    if (!formData.departmentId || formData.departmentId.trim() === '') {
      newErrors.departmentId = 'Department is required';
    }
    
    if (formData.currentStock < 0) {
      newErrors.currentStock = 'Current stock cannot be negative';
    }
    
    if (formData.minimumStockLevel < 0) {
      newErrors.minimumStockLevel = 'Minimum stock level cannot be negative';
    }
    
    if (formData.maximumStockLevel < 0) {
      newErrors.maximumStockLevel = 'Maximum stock level cannot be negative';
    }
    
    if (formData.minimumStockLevel > formData.maximumStockLevel) {
      newErrors.maximumStockLevel = 'Maximum stock level must be greater than minimum stock level';
    }
    
    if (formData.unitCost < 0) {
      newErrors.unitCost = 'Unit cost cannot be negative';
    }
    
    if (formData.unitPrice < 0) {
      newErrors.unitPrice = 'Unit price cannot be negative';
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
      if (item) {
        await inventoryItemApi.update(item.id, formData);
        Swal.fire('Success', 'Item updated successfully', 'success');
      } else {
        await inventoryItemApi.create(formData);
        Swal.fire('Success', 'Item created successfully', 'success');
      }
      
      onSaved();
    } catch (error: any) {
      console.error('Failed to save item:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Item Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  isInvalid={!!errors.itemCode}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.itemCode}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Item Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  isInvalid={!!errors.itemName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.itemName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  isInvalid={!!errors.categoryId}
                >
                  <option value={0}>Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.categoryId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Supplier *</Form.Label>
                <Form.Select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  isInvalid={!!errors.supplierId}
                >
                  <option value={0}>Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.supplierId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Department *</Form.Label>
                <Form.Select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  isInvalid={!!errors.departmentId}
                >
                  <option value="">Select Department</option>
                  {departments.map(department => (
                    <option key={department.id} value={department.departmentId}>
                      {department.displayName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departmentId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unit of Measure</Form.Label>
                <Form.Control
                  type="text"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleInputChange}
                  placeholder="e.g., pieces, kg, ml"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Current Stock *</Form.Label>
                <Form.Control
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  isInvalid={!!errors.currentStock}
                  min="0"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.currentStock}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Minimum Stock Level *</Form.Label>
                <Form.Control
                  type="number"
                  name="minimumStockLevel"
                  value={formData.minimumStockLevel}
                  onChange={handleInputChange}
                  isInvalid={!!errors.minimumStockLevel}
                  min="0"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.minimumStockLevel}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Maximum Stock Level *</Form.Label>
                <Form.Control
                  type="number"
                  name="maximumStockLevel"
                  value={formData.maximumStockLevel}
                  onChange={handleInputChange}
                  isInvalid={!!errors.maximumStockLevel}
                  min="0"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maximumStockLevel}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unit Cost *</Form.Label>
                <Form.Control
                  type="number"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleInputChange}
                  isInvalid={!!errors.unitCost}
                  min="0"
                  step="0.01"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.unitCost}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Unit Price *</Form.Label>
                <Form.Control
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  isInvalid={!!errors.unitPrice}
                  min="0"
                  step="0.01"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.unitPrice}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Storage Location</Form.Label>
                <Form.Control
                  type="text"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Batch Number</Form.Label>
                <Form.Control
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
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
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <div className="d-flex gap-3">
                <Form.Check
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  label="Active"
                />
                <Form.Check
                  type="checkbox"
                  id="isControlledSubstance"
                  name="isControlledSubstance"
                  checked={formData.isControlledSubstance}
                  onChange={handleInputChange}
                  label="Controlled Substance"
                />
                <Form.Check
                  type="checkbox"
                  id="requiresPrescription"
                  name="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={handleInputChange}
                  label="Requires Prescription"
                />
              </div>
            </Col>
          </Row>
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
              item ? 'Update Item' : 'Create Item'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default InventoryItemModal;
