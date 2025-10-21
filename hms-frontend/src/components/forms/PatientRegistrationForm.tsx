import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { DynamicForm, DynamicField } from './DynamicForm';
import { formConfigApi, FormFieldConfig } from '../../services/formConfigApi';
import { generateRandomMrn } from '../../utils/mrn';
import Swal from 'sweetalert2';

interface PatientRegistrationFormProps {
  onCancel: () => void;
  onSubmit?: (data: any) => void;
  loading?: boolean;
  error?: string | null;
  initialData?: any;
  isModal?: boolean; // New prop to indicate if used in modal
}

export const PatientRegistrationForm = forwardRef<any, PatientRegistrationFormProps>(({ onCancel, onSubmit, loading = false, error, initialData, isModal = false }, ref) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [activeSection, setActiveSection] = useState('basic');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formConfig, setFormConfig] = useState<FormFieldConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load form configuration
  useEffect(() => {
    loadFormConfiguration();
  }, []);

  // Update formData when initialData changes
  useEffect(() => {
    console.log('PatientRegistrationForm initialData changed:', initialData);
    if (initialData) {
      setFormData(initialData);
      console.log('Form data set to:', initialData);
    }
  }, [initialData]);

  const loadFormConfiguration = async () => {
    try {
      setConfigLoading(true);
      setConfigError(null);
      const config = await formConfigApi.getEnabledFields('PATIENT');
      setFormConfig(config);
    } catch (err) {
      console.error('Error loading form config:', err);
      setConfigError('Failed to load form configuration');
      // Fallback to default fields if config fails
      setFormConfig([]);
    } finally {
      setConfigLoading(false);
    }
  };

  // Convert FormFieldConfig to DynamicField
  const convertToDynamicField = (config: FormFieldConfig): DynamicField => {
    const baseField: DynamicField = {
      name: config.fieldKey,
      label: config.fieldLabel,
      type: config.fieldType as any,
      required: config.isRequired,
      placeholder: `Enter ${config.fieldLabel.toLowerCase()}`
    };

    if (config.fieldType === 'select' && config.fieldOptions) {
      try {
        const options = JSON.parse(config.fieldOptions);
        return {
          ...baseField,
          type: 'select',
          options: options.options || [],
          dependsOn: options.dependsOn // For cascading selects
        } as DynamicField;
      } catch (err) {
        console.error('Error parsing field options:', err);
        return baseField;
      }
    }

    // Handle auto-generation for MRN field
    if (config.fieldKey === 'medicalRecordNumber' && config.fieldOptions) {
      try {
        const options = JSON.parse(config.fieldOptions);
        if (options.autoGenerate) {
          return {
            ...baseField,
            placeholder: options.placeholder || 'Leave blank to auto-generate',
            helpText: 'Leave blank to auto-generate a Medical Record Number'
          };
        }
      } catch (err) {
        console.error('Error parsing MRN field options:', err);
      }
    }

    return baseField;
  };

  // Get fields by section
  const getFieldsBySection = (section: string) => {
    return formConfig
      .filter(config => config.section === section)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(convertToDynamicField);
  };

  // Smooth section transition function
  const handleSectionChange = (newSection: string) => {
    if (newSection === activeSection || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      setActiveSection(newSection);
      setIsTransitioning(false);
    }, 150);
  };

  // Handle form field changes
  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // Expose form data to parent component when used in modal
  useImperativeHandle(ref, () => ({
    getFormData: async () => {
      console.log('getFormData called, current formData:', formData);
      // Auto-generate MRN if not provided with confirmation
      const processedData = { ...formData };
      console.log('Processed data before MRN check:', processedData);
      if (!processedData.medicalRecordNumber || processedData.medicalRecordNumber.trim() === '') {
        const result = await Swal.fire({
          title: 'Generate MRN?',
          text: 'No MRN was entered. A random Medical Record Number will be assigned to this patient.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, generate',
          cancelButtonText: 'Cancel',
          focusCancel: true
        });
        
        if (!result.isConfirmed) {
          throw new Error('MRN generation cancelled by user');
        }
        
        processedData.medicalRecordNumber = generateRandomMrn('MRN');
      }
      return processedData;
    },
    validateForm: () => {
      const requiredFields = ['firstName', 'lastName'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      return {
        isValid: missingFields.length === 0,
        missingFields,
        errors: missingFields.map(field => {
          const fieldLabel = field === 'firstName' ? 'First name' : 
                           field === 'lastName' ? 'Last name' : field;
          return `${fieldLabel} is required`;
        })
      };
    }
  }), [formData]);

  // Show loading state while configuration is loading
  if (configLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
        <p className="mt-3">Loading form configuration...</p>
      </div>
    );
  }

  // Show error state if configuration failed
  if (configError) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Form Configuration Error</Alert.Heading>
        <p>{configError}</p>
        <Button variant="outline-primary" size="sm" onClick={loadFormConfiguration}>
          Retry
        </Button>
      </Alert>
    );
  }

  const sections = [
    { id: 'basic', title: 'Basic Information', icon: 'bi-person' },
    { id: 'contact', title: 'Contact Details', icon: 'bi-telephone' },
    { id: 'address', title: 'Address', icon: 'bi-geo-alt' },
    { id: 'emergency', title: 'Emergency Contact', icon: 'bi-exclamation-triangle' },
    { id: 'medical', title: 'Medical Information', icon: 'bi-heart-pulse' },
    { id: 'visit', title: 'Visit Details', icon: 'bi-clipboard-check' }
  ];

  // Get dynamic fields from configuration
  const basicFields = getFieldsBySection('personal_info');

  const contactFields = getFieldsBySection('contact_info');

  const addressFields = getFieldsBySection('contact_info'); // Address fields are part of contact info

  const emergencyFields: DynamicField[] = [
    { name: "emergencyContactName", label: "Emergency Contact Name", type: "text", placeholder: "Full name of emergency contact" },
    { name: "emergencyContactPhone", label: "Emergency Contact Phone", type: "text", placeholder: "+254 700 000 000" },
    { name: "emergencyContactRelationship", label: "Relationship", type: "select", options: [
      { value: "SPOUSE", label: "Spouse" },
      { value: "PARENT", label: "Parent" },
      { value: "CHILD", label: "Child" },
      { value: "SIBLING", label: "Sibling" },
      { value: "FRIEND", label: "Friend" },
      { value: "OTHER", label: "Other" }
    ]}
  ];

  const medicalFields = getFieldsBySection('medical_info');

  const visitFields: DynamicField[] = [
    { name: "visitReason", label: "Reason for Visit", type: "textarea", required: true, placeholder: "Describe the reason for this visit" },
    { name: "priority", label: "Priority Level", type: "select", required: true, options: [
      { value: "LOW", label: "Low - Routine visit" },
      { value: "MEDIUM", label: "Medium - Standard priority" },
      { value: "HIGH", label: "High - Urgent attention needed" },
      { value: "CRITICAL", label: "Critical - Emergency situation" }
    ]},
    { name: "notes", label: "Additional Notes", type: "textarea", placeholder: "Any additional information about the patient" }
  ];

  const getFieldsForSection = (section: string): DynamicField[] => {
    switch (section) {
      case 'basic': return basicFields;
      case 'contact': return contactFields;
      case 'address': return addressFields;
      case 'emergency': return emergencyFields;
      case 'medical': return medicalFields;
      case 'visit': return visitFields;
      default: return [];
    }
  };



  const FormWrapper = isModal ? 'div' : 'form';
  const formProps = isModal ? {} : { onSubmit: handleSubmit };

  return (
    <FormWrapper {...formProps} className="patient-registration-form">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .patient-registration-form .list-group-item {
          border: none !important;
          border-radius: 8px !important;
          margin: 2px 0;
        }
        
        .patient-registration-form .list-group-item:hover {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        
        .patient-registration-form .list-group-item.active {
          background-color: rgba(13, 110, 253, 0.1) !important;
          color: #0d6efd !important;
        }
        
        .patient-registration-form .card {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .patient-registration-form .btn {
          border-radius: 8px;
          font-weight: 500;
        }
      `}</style>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div>
        <Row>
          <Col md={3}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Header>
                <h6 className="mb-0">Registration Steps</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`list-group-item list-group-item-action d-flex align-items-center position-relative ${
                        activeSection === section.id ? 'active' : ''
                      } ${isTransitioning ? 'disabled' : ''}`}
                      onClick={() => handleSectionChange(section.id)}
                      disabled={isTransitioning}
                      style={{
                        transition: 'all 0.3s ease-in-out',
                        transform: activeSection === section.id ? 'translateX(4px)' : 'translateX(0)',
                        borderLeft: activeSection === section.id ? '4px solid #0d6efd' : '4px solid transparent',
                        backgroundColor: activeSection === section.id ? 'rgba(13, 110, 253, 0.1)' : 'transparent'
                      }}
                    >
                      <div className="d-flex align-items-center w-100">
                        <div className="me-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: '32px',
                              height: '32px',
                              backgroundColor: activeSection === section.id ? '#0d6efd' : '#6c757d',
                              color: 'white',
                              fontSize: '14px',
                              transition: 'all 0.3s ease-in-out'
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center">
                            <i className={`${section.icon} me-2`} style={{ 
                              color: activeSection === section.id ? '#0d6efd' : '#6c757d',
                              transition: 'color 0.3s ease-in-out'
                            }}></i>
                            <span style={{
                              fontWeight: activeSection === section.id ? '600' : '400',
                              color: activeSection === section.id ? '#0d6efd' : '#495057',
                              transition: 'all 0.3s ease-in-out'
                            }}>
                              {section.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Card 
              className="shadow-sm"
              style={{
                transition: 'all 0.3s ease-in-out',
                transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
                opacity: isTransitioning ? 0.7 : 1
              }}
            >
              <Card.Header 
                className="bg-primary text-white"
                style={{
                  transition: 'all 0.3s ease-in-out',
                  background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)'
                }}
              >
                <h5 className="mb-0 d-flex align-items-center">
                  <div 
                    className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    <i className={`${sections.find(s => s.id === activeSection)?.icon}`}></i>
                  </div>
                  <div>
                    <div className="fw-bold">
                      {sections.find(s => s.id === activeSection)?.title}
                    </div>
                    <small className="opacity-75">
                      Step {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
                    </small>
                  </div>
                </h5>
              </Card.Header>
              <Card.Body 
                style={{
                  transition: 'all 0.3s ease-in-out',
                  minHeight: '400px'
                }}
              >
                <div 
                  key={activeSection}
                  style={{
                    animation: isTransitioning ? 'none' : 'fadeInUp 0.4s ease-out'
                  }}
                >
                  <DynamicForm
                    fields={getFieldsForSection(activeSection)}
                    values={formData}
                    onChange={handleFieldChange}
                  />
                </div>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-between mt-4">
              <div>
                {activeSection !== 'basic' && (
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    disabled={isTransitioning}
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex > 0) {
                        handleSectionChange(sections[currentIndex - 1].id);
                      }
                    }}
                    style={{
                      transition: 'all 0.3s ease-in-out',
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous
                  </Button>
                )}
              </div>
              
              <div>
                {activeSection !== 'visit' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isTransitioning}
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex < sections.length - 1) {
                        handleSectionChange(sections[currentIndex + 1].id);
                      }
                    }}
                    style={{
                      transition: 'all 0.3s ease-in-out',
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(13, 110, 253, 0.3)',
                      background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(13, 110, 253, 0.3)';
                    }}
                  >
                    Next
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                ) : (
                  isModal ? (
                    // In modal mode, only show Cancel button
                    <Button 
                      variant="outline-secondary" 
                      size="lg"
                      onClick={onCancel}
                      style={{
                        transition: 'all 0.3s ease-in-out',
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      Cancel
                    </Button>
                  ) : (
                    // In standalone mode, show both Cancel and Register buttons
                    <div className="d-flex gap-3">
                      <Button 
                        variant="outline-secondary" 
                        size="lg"
                        onClick={onCancel}
                        style={{
                          transition: 'all 0.3s ease-in-out',
                          transform: 'translateY(0)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="success" 
                        size="lg"
                        type="submit"
                        disabled={loading}
                        style={{
                          transition: 'all 0.3s ease-in-out',
                          transform: 'translateY(0)',
                          boxShadow: '0 2px 4px rgba(25, 135, 84, 0.3)',
                          background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(25, 135, 84, 0.3)';
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registering...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Register Patient
                          </>
                        )}
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </FormWrapper>
  );
});
