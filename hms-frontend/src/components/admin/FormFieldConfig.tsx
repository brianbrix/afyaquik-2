import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { formConfigApi, FormFieldConfig } from '../../services/formConfigApi';

interface FormFieldConfigProps {
  formType: string;
}

export function FormFieldConfigComponent({ formType }: FormFieldConfigProps) {
  const [configurations, setConfigurations] = useState<FormFieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sections = [
    { key: 'personal_info', label: 'Personal Information', color: 'primary' },
    { key: 'contact_info', label: 'Contact Information', color: 'info' },
    { key: 'medical_info', label: 'Medical Information', color: 'warning' }
  ];

  useEffect(() => {
    loadConfigurations();
  }, [formType]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const configs = await formConfigApi.getAllFields(formType);
      setConfigurations(configs);
    } catch (err) {
      setError('Failed to load form configurations');
      console.error('Error loading configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggle = (fieldKey: string, isEnabled: boolean) => {
    setConfigurations(prev => 
      prev.map(config => 
        config.fieldKey === fieldKey 
          ? { ...config, isEnabled }
          : config
      )
    );
  };

  const handleRequiredToggle = (fieldKey: string, isRequired: boolean) => {
    setConfigurations(prev => 
      prev.map(config => 
        config.fieldKey === fieldKey 
          ? { ...config, isRequired }
          : config
      )
    );
  };

  const handleOrderChange = (fieldKey: string, displayOrder: number) => {
    setConfigurations(prev => 
      prev.map(config => 
        config.fieldKey === fieldKey 
          ? { ...config, displayOrder }
          : config
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await formConfigApi.updateFieldConfigurations(formType, configurations);
      setSuccess('Form configuration updated successfully');
    } catch (err) {
      setError('Failed to save form configuration');
      console.error('Error saving configurations:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefault = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await formConfigApi.initializeDefaultPatientForm();
      setSuccess('Default form configuration initialized');
      await loadConfigurations();
    } catch (err) {
      setError('Failed to initialize default configuration');
      console.error('Error initializing default:', err);
    } finally {
      setSaving(false);
    }
  };

  const getFieldsBySection = (section: string) => {
    return configurations
      .filter(config => config.section === section)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
        <p className="mt-3">Loading form configuration...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Form Field Configuration - {formType}</h4>
        <div>
          <Button 
            variant="outline-secondary" 
            onClick={handleInitializeDefault}
            disabled={saving}
            className="me-2"
          >
            Initialize Default
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {sections.map(section => {
        const sectionFields = getFieldsBySection(section.key);
        
        if (sectionFields.length === 0) return null;

        return (
          <Card key={section.key} className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <Badge bg={section.color} className="me-2">
                  {section.label}
                </Badge>
                {sectionFields.length} field{sectionFields.length !== 1 ? 's' : ''}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {sectionFields.map(field => (
                  <Col key={field.fieldKey} md={6} lg={4} className="mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{field.fieldLabel}</h6>
                          <Badge bg={field.fieldType === 'text' ? 'secondary' : 
                                   field.fieldType === 'email' ? 'info' :
                                   field.fieldType === 'tel' ? 'primary' :
                                   field.fieldType === 'date' ? 'success' :
                                   field.fieldType === 'select' ? 'warning' : 'dark'}>
                            {field.fieldType}
                          </Badge>
                        </div>
                        
                        <Form.Group className="mb-2">
                          <Form.Check
                            type="checkbox"
                            id={`enabled-${field.fieldKey}`}
                            label="Enable Field"
                            checked={field.isEnabled}
                            onChange={(e) => handleFieldToggle(field.fieldKey, e.target.checked)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-2">
                          <Form.Check
                            type="checkbox"
                            id={`required-${field.fieldKey}`}
                            label="Required Field"
                            checked={field.isRequired}
                            onChange={(e) => handleRequiredToggle(field.fieldKey, e.target.checked)}
                            disabled={!field.isEnabled}
                          />
                        </Form.Group>

                        <Form.Group>
                          <Form.Label className="small">Display Order</Form.Label>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={field.displayOrder}
                            onChange={(e) => handleOrderChange(field.fieldKey, parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        );
      })}

      {configurations.length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No form configuration found</h5>
            <p className="text-muted">Click "Initialize Default" to create default form fields.</p>
            <Button variant="primary" onClick={handleInitializeDefault}>
              Initialize Default Configuration
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
