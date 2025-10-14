import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { Medication, MedicationRequest, DOSAGE_FORM_OPTIONS } from '../../../services/pharmacyApi';

interface MedicationFormProps {
  medication?: Medication | null;
  onSubmit: (data: MedicationRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MedicationForm({ medication, onSubmit, onCancel, isLoading }: MedicationFormProps) {
  const [formData, setFormData] = useState<MedicationRequest>({
    medicationCode: '',
    name: '',
    genericName: '',
    manufacturer: '',
    dosageForm: undefined,
    strength: '',
    unitOfMeasure: '',
    description: '',
    unitPrice: 0,
    controlledSubstance: false,
    requiresPrescription: true,
    active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (medication) {
      setFormData({
        medicationCode: medication.medicationCode,
        name: medication.name,
        genericName: medication.genericName || '',
        manufacturer: medication.manufacturer || '',
        dosageForm: medication.dosageForm,
        strength: medication.strength || '',
        unitOfMeasure: medication.unitOfMeasure || '',
        description: medication.description || '',
        unitPrice: medication.unitPrice || 0,
        controlledSubstance: medication.controlledSubstance,
        requiresPrescription: medication.requiresPrescription,
        active: medication.active
      });
    }
  }, [medication]);

  const handleChange = (field: keyof MedicationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.medicationCode.trim()) {
      newErrors.medicationCode = 'Medication code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.unitPrice && formData.unitPrice < 0) {
      newErrors.unitPrice = 'Unit price must be positive';
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
            <Form.Label>Medication Code *</Form.Label>
            <Form.Control
              type="text"
              value={formData.medicationCode}
              onChange={(e) => handleChange('medicationCode', e.target.value)}
              isInvalid={!!errors.medicationCode}
              placeholder="e.g., PAR001"
            />
            <Form.Control.Feedback type="invalid">
              {errors.medicationCode}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              isInvalid={!!errors.name}
              placeholder="e.g., Paracetamol"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Generic Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.genericName}
              onChange={(e) => handleChange('genericName', e.target.value)}
              placeholder="e.g., Acetaminophen"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Manufacturer</Form.Label>
            <Form.Control
              type="text"
              value={formData.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              placeholder="e.g., ABC Pharmaceuticals"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Dosage Form</Form.Label>
            <Form.Select
              value={formData.dosageForm || ''}
              onChange={(e) => handleChange('dosageForm', e.target.value || undefined)}
            >
              <option value="">Select form</option>
              {DOSAGE_FORM_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Strength</Form.Label>
            <Form.Control
              type="text"
              value={formData.strength}
              onChange={(e) => handleChange('strength', e.target.value)}
              placeholder="e.g., 500mg"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Unit of Measure</Form.Label>
            <Form.Select
              value={formData.unitOfMeasure}
              onChange={(e) => handleChange('unitOfMeasure', e.target.value)}
            >
              <option value="">Select unit</option>
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="units">units</option>
              <option value="tablets">tablets</option>
              <option value="capsules">capsules</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Unit Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
              isInvalid={!!errors.unitPrice}
              placeholder="0.00"
            />
            <Form.Control.Feedback type="invalid">
              {errors.unitPrice}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional information about the medication"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Controlled Substance"
              checked={formData.controlledSubstance}
              onChange={(e) => handleChange('controlledSubstance', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Requires Prescription"
              checked={formData.requiresPrescription}
              onChange={(e) => handleChange('requiresPrescription', e.target.checked)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Active"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (medication ? 'Update' : 'Create')}
        </Button>
      </div>
    </Form>
  );
}
