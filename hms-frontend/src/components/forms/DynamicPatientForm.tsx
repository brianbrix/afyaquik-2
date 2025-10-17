import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { formConfigApi, FormFieldConfig } from '../../services/formConfigApi';

interface DynamicPatientFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DynamicPatientForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false 
}: DynamicPatientFormProps) {
  const [formConfig, setFormConfig] = useState<FormFieldConfig[]>([]);
  const [formData, setFormData] = useState(initialData);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFormConfiguration();
  }, []);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const loadFormConfiguration = async () => {
    try {
      setConfigLoading(true);
      setError(null);
      const config = await formConfigApi.getEnabledFields('PATIENT');
      setFormConfig(config);
    } catch (err) {
      setError('Failed to load form configuration');
      console.error('Error loading form config:', err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleInputChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getFieldsBySection = (section: string) => {
    return formConfig
      .filter(config => config.section === section)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const renderField = (field: FormFieldConfig) => {
    const commonProps = {
      id: field.fieldKey,
      name: field.fieldKey,
      value: formData[field.fieldKey] || '',
      onChange: (e: any) => handleInputChange(field.fieldKey, e.target.value),
      required: field.isRequired,
      disabled: loading
    };

    switch (field.fieldType) {
      case 'text':
        return <Form.Control type="text" {...commonProps} />;
      
      case 'email':
        return <Form.Control type="email" {...commonProps} />;
      
      case 'tel':
        return <Form.Control type="tel" {...commonProps} />;
      
      case 'date':
        return <Form.Control type="date" {...commonProps} />;
      
      case 'textarea':
        return <Form.Control as="textarea" rows={3} {...commonProps} />;
      
      case 'select':
        try {
          const options = field.fieldOptions ? JSON.parse(field.fieldOptions) : { options: [] };
          return (
            <Form.Select {...commonProps}>
              <option value="">Select {field.fieldLabel}</option>
              {options.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          );
        } catch (err) {
          console.error('Error parsing field options:', err);
          return <Form.Control type="text" {...commonProps} />;
        }
      
      default:
        return <Form.Control type="text" {...commonProps} />;
    }
  };

  const sections = [
    { key: 'personal_info', label: 'Personal Information', color: 'primary' },
    { key: 'contact_info', label: 'Contact Information', color: 'info' },
    { key: 'medical_info', label: 'Medical Information', color: 'warning' }
  ];

  if (configLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
        <p className="mt-3">Loading form configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      {sections.map(section => {
        const sectionFields = getFieldsBySection(section.key);
        
        if (sectionFields.length === 0) return null;

        return (
          <Card key={section.key} className="mb-4">
            <Card.Header>
              <h5 className="mb-0 text-{section.color}">
                {section.label}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {sectionFields.map(field => (
                  <Col key={field.fieldKey} md={6} lg={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>
                        {field.fieldLabel}
                        {field.isRequired && <span className="text-danger ms-1">*</span>}
                      </Form.Label>
                      {renderField(field)}
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        );
      })}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            'Save Patient'
          )}
        </button>
      </div>
    </Form>
  );
}
