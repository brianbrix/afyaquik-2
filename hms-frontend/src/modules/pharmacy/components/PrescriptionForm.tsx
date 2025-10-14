import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Alert, Table, Badge } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { Prescription, PrescriptionRequest, PrescriptionItemRequest, medicationApi, Medication } from '../../../services/pharmacyApi';
// Icons are used via CSS classes: bi-plus, bi-trash

interface PrescriptionFormProps {
  prescription?: Prescription | null;
  onSubmit: (data: PrescriptionRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PrescriptionForm({ prescription, onSubmit, onCancel, isLoading }: PrescriptionFormProps) {
  const [formData, setFormData] = useState<PrescriptionRequest>({
    prescriptionNumber: '',
    patientId: 0,
    prescribedById: 0,
    prescriptionDate: new Date().toISOString(),
    notes: '',
    items: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: medications = [] } = useQuery({
    queryKey: ['medications', 'active'],
    queryFn: () => medicationApi.getAll({ active: true })
  });

  useEffect(() => {
    if (prescription) {
      setFormData({
        prescriptionNumber: prescription.prescriptionNumber,
        patientId: prescription.patientId,
        prescribedById: prescription.prescribedById,
        prescriptionDate: prescription.prescriptionDate,
        notes: prescription.notes || '',
        items: prescription.items.map(item => ({
          medicationId: item.medicationId,
          quantityPrescribed: item.quantityPrescribed,
          dosageInstructions: item.dosageInstructions || '',
          frequency: item.frequency || '',
          durationDays: item.durationDays,
          unitPrice: item.unitPrice,
          notes: item.notes || ''
        }))
      });
    }
  }, [prescription]);

  const handleChange = (field: keyof PrescriptionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItemRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        medicationId: 0,
        quantityPrescribed: 1,
        dosageInstructions: '',
        frequency: '',
        durationDays: undefined,
        unitPrice: undefined,
        notes: ''
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.prescriptionNumber.trim()) {
      newErrors.prescriptionNumber = 'Prescription number is required';
    }

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }

    if (!formData.prescribedById) {
      newErrors.prescribedById = 'Prescribing doctor is required';
    }

    if (!formData.prescriptionDate) {
      newErrors.prescriptionDate = 'Prescription date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one medication item is required';
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.medicationId) {
        newErrors[`item_${index}_medicationId`] = 'Medication is required';
      }
      if (!item.quantityPrescribed || item.quantityPrescribed <= 0) {
        newErrors[`item_${index}_quantityPrescribed`] = 'Quantity must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getMedicationName = (medicationId: number) => {
    const medication = medications.find(m => m.id === medicationId);
    return medication ? medication.name : 'Select medication';
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const medication = medications.find(m => m.id === item.medicationId);
      const unitPrice = item.unitPrice || medication?.unitPrice || 0;
      return total + (unitPrice * item.quantityPrescribed);
    }, 0);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Prescription Number *</Form.Label>
            <Form.Control
              type="text"
              value={formData.prescriptionNumber}
              onChange={(e) => handleChange('prescriptionNumber', e.target.value)}
              isInvalid={!!errors.prescriptionNumber}
              placeholder="e.g., RX2024001"
            />
            <Form.Control.Feedback type="invalid">
              {errors.prescriptionNumber}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Prescription Date *</Form.Label>
            <Form.Control
              type="datetime-local"
              value={formData.prescriptionDate}
              onChange={(e) => handleChange('prescriptionDate', e.target.value)}
              isInvalid={!!errors.prescriptionDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.prescriptionDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Patient ID *</Form.Label>
            <Form.Control
              type="number"
              value={formData.patientId}
              onChange={(e) => handleChange('patientId', parseInt(e.target.value) || 0)}
              isInvalid={!!errors.patientId}
              placeholder="Enter patient ID"
            />
            <Form.Control.Feedback type="invalid">
              {errors.patientId}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Prescribed By (Doctor ID) *</Form.Label>
            <Form.Control
              type="number"
              value={formData.prescribedById}
              onChange={(e) => handleChange('prescribedById', parseInt(e.target.value) || 0)}
              isInvalid={!!errors.prescribedById}
              placeholder="Enter doctor ID"
            />
            <Form.Control.Feedback type="invalid">
              {errors.prescribedById}
            </Form.Control.Feedback>
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
              placeholder="Additional notes for this prescription"
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Medication Items</h5>
        <Button variant="outline-primary" size="sm" onClick={addItem}>
          <i className="bi bi-plus me-1"></i>
          Add Medication
        </Button>
      </div>

      {errors.items && (
        <Alert variant="danger" className="mb-3">
          {errors.items}
        </Alert>
      )}

      {formData.items.length > 0 && (
        <Table responsive striped className="mb-3">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Quantity</th>
              <th>Dosage Instructions</th>
              <th>Frequency</th>
              <th>Duration (Days)</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <Form.Select
                    value={item.medicationId}
                    onChange={(e) => handleItemChange(index, 'medicationId', parseInt(e.target.value) || 0)}
                    isInvalid={!!errors[`item_${index}_medicationId`]}
                  >
                    <option value={0}>Select medication</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} {med.strength && `(${med.strength})`}
                      </option>
                    ))}
                  </Form.Select>
                  {errors[`item_${index}_medicationId`] && (
                    <div className="text-danger small">{errors[`item_${index}_medicationId`]}</div>
                  )}
                </td>
                <td>
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.quantityPrescribed}
                    onChange={(e) => handleItemChange(index, 'quantityPrescribed', parseInt(e.target.value) || 1)}
                    isInvalid={!!errors[`item_${index}_quantityPrescribed`]}
                  />
                  {errors[`item_${index}_quantityPrescribed`] && (
                    <div className="text-danger small">{errors[`item_${index}_quantityPrescribed`]}</div>
                  )}
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={item.dosageInstructions}
                    onChange={(e) => handleItemChange(index, 'dosageInstructions', e.target.value)}
                    placeholder="e.g., Take with food"
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    value={item.frequency}
                    onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                    placeholder="e.g., Twice daily"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    min="1"
                    value={item.durationDays || ''}
                    onChange={(e) => handleItemChange(index, 'durationDays', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 7"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Auto"
                  />
                </td>
                <td>
                  {(() => {
                    const medication = medications.find(m => m.id === item.medicationId);
                    const unitPrice = item.unitPrice || medication?.unitPrice || 0;
                    return `$${(unitPrice * item.quantityPrescribed).toFixed(2)}`;
                  })()}
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {formData.items.length > 0 && (
        <div className="text-end mb-3">
          <h5>Total Amount: ${calculateTotal().toFixed(2)}</h5>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (prescription ? 'Update' : 'Create')}
        </Button>
      </div>
    </Form>
  );
}
