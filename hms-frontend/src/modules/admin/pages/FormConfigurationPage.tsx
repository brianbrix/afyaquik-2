import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { formConfigApi, FormFieldConfig } from '../../../services/formConfigApi';
import { PageHeader } from '../../../components/shared/PageHeader';

export function FormConfigurationPage() {
  const [configurations, setConfigurations] = useState<FormFieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('patient');

  const sections = [
    { key: 'personal_info', label: 'Personal Information', color: 'primary' },
    { key: 'contact_info', label: 'Contact Information', color: 'info' },
    { key: 'emergency_info', label: 'Emergency Contact', color: 'danger' },
    { key: 'medical_info', label: 'Medical Information', color: 'warning' },
    { key: 'insurance_info', label: 'Insurance Information', color: 'success' }
  ];

  useEffect(() => {
    loadConfigurations();
  }, [activeTab]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      const configs = await formConfigApi.getAllFields(activeTab.toUpperCase());
      console.log('Loaded configurations:', configs);
      setConfigurations(configs || []);
    } catch (err) {
      setError('Failed to load form configurations');
      console.error('Error loading configurations:', err);
      setConfigurations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggle = (fieldKey: string, isEnabled: boolean) => {
    setConfigurations(prev => {
      if (!prev || !Array.isArray(prev)) return [];
      return prev.map(config => 
        config.fieldKey === fieldKey 
          ? { ...config, isEnabled }
          : config
      );
    });
  };

  const handleRequiredToggle = (fieldKey: string, isRequired: boolean) => {
    setConfigurations(prev => {
      if (!prev || !Array.isArray(prev)) return [];
      return prev.map(config => 
        config.fieldKey === fieldKey 
          ? { ...config, isRequired }
          : config
      );
    });
  };

  const handleOrderChange = (fieldKey: string, displayOrder: number) => {
    setConfigurations(prev => {
      if (!prev || !Array.isArray(prev)) return [];
      return prev.map(config => 
        config.fieldKey === fieldKey 
          ? { ...config, displayOrder }
          : config
      );
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await formConfigApi.updateFieldConfigurations(activeTab.toUpperCase(), configurations);
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

  const handleForceReinitialize = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await formConfigApi.forceReinitializeDefaultPatientForm();
      setSuccess('Form configuration force reinitialized with comprehensive fields');
      await loadConfigurations();
    } catch (err) {
      setError('Failed to force reinitialize configuration');
      console.error('Error force reinitializing:', err);
    } finally {
      setSaving(false);
    }
  };

  const getFieldsBySection = (section: string) => {
    if (!configurations || !Array.isArray(configurations)) {
      return [];
    }
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
    <div className="container-fluid">
      <PageHeader 
        title="Form Configuration" 
        subtitle="Configure which fields appear in patient forms"
      />

      <Card>
        <Card.Header>
          <Tabs
            id="form-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'patient')}
            className="mb-0"
          >
            <Tab eventKey="patient" title="Patient Form" />
            <Tab eventKey="billing" title="Billing Form" />
            <Tab eventKey="appointment" title="Appointment Form" />
          </Tabs>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>Form Field Configuration - {activeTab.toUpperCase()}</h5>
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
                variant="outline-warning" 
                onClick={handleForceReinitialize}
                disabled={saving}
                className="me-2"
              >
                Force Reinitialize (28 Fields)
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
                  <h6 className="mb-0">
                    <Badge bg={section.color} className="me-2">
                      {section.label}
                    </Badge>
                    {sectionFields.length} field{sectionFields.length !== 1 ? 's' : ''}
                  </h6>
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

          {(!configurations || configurations.length === 0) && (
            <Card>
              <Card.Body className="text-center py-5">
                <h5>No form configuration found</h5>
                <p className="text-muted">Click "Initialize Default" to create basic form fields, or "Force Reinitialize" for comprehensive 28-field configuration.</p>
                <div>
                  <Button variant="primary" onClick={handleInitializeDefault} className="me-2">
                    Initialize Default Configuration
                  </Button>
                  <Button variant="warning" onClick={handleForceReinitialize}>
                    Force Reinitialize (28 Fields)
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
