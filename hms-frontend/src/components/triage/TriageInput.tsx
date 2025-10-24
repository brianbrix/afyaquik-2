import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Badge, Spinner, Accordion } from 'react-bootstrap';
import { triageItemApi, triageEntryApi, TriageItem, TriageEntryRequest, TriageEntry } from '../../services/triageItemApi';
import { FaSave, FaCalculator, FaExclamationTriangle, FaThermometerHalf, FaHeartbeat, FaTint, FaLungs, FaBrain, FaEye, FaStethoscope } from 'react-icons/fa';

interface TriageInputProps {
  patientId: number;
  staffId: number;
  queueItemId?: number;
  onEntryCreated?: (entry: any) => void;
  onError?: (error: string) => void;
}

export const TriageInput: React.FC<TriageInputProps> = ({
  patientId,
  staffId,
  queueItemId,
  onEntryCreated,
  onError
}) => {
  const [triageItems, setTriageItems] = useState<TriageItem[]>([]);
  const [existingEntries, setExistingEntries] = useState<TriageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<number, any>>({});

  useEffect(() => {
    loadTriageData();
  }, [patientId]);

  const loadTriageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load triage items and existing entries in parallel
      const [items, entries] = await Promise.all([
        triageItemApi.getActiveTriageItems(),
        triageEntryApi.getTriageEntriesForPatient(patientId)
      ]);
      
      setTriageItems(items);
      setExistingEntries(entries);
      
      // Populate form with existing entries
      const initialFormData: Record<number, any> = {};
      entries.forEach(entry => {
        const value = entry.numericValue ?? entry.textValue ?? entry.booleanValue ?? entry.selectValue;
        if (value !== undefined && value !== null) {
          initialFormData[entry.triageItemId] = value;
        }
      });
      setFormData(initialFormData);
      
    } catch (err) {
      setError('Failed to load triage data');
      console.error('Error loading triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (itemId: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      const entries = [];
      for (const [itemId, value] of Object.entries(formData)) {
        if (value !== undefined && value !== null && value !== '') {
          const triageItem = triageItems.find(item => item.id === parseInt(itemId));
          if (!triageItem) continue;

          const existingEntry = existingEntries.find(e => e.triageItemId === parseInt(itemId));
          
          const request: TriageEntryRequest = {
            patientId,
            triageItemId: parseInt(itemId),
            staffId,
            queueItemId
          };

          // Set value based on data type
          switch (triageItem.dataType) {
            case 'NUMERIC':
              request.numericValue = parseFloat(value);
              break;
            case 'TEXT':
              request.textValue = value;
              break;
            case 'BOOLEAN':
              request.booleanValue = value === 'true' || value === true;
              break;
            case 'SELECT':
              request.selectValue = value;
              break;
          }

          let entry;
          if (existingEntry) {
            // Update existing entry
            entry = await triageEntryApi.updateTriageEntry(existingEntry.id, request);
          } else {
            // Create new entry
            entry = await triageEntryApi.createTriageEntry(request);
          }
          entries.push(entry);
        }
      }

      if (entries.length === 0) {
        setError('Please enter at least one triage value');
        return;
      }

      // Reload data to get updated entries
      await loadTriageData();
      
      if (onEntryCreated) {
        onEntryCreated(entries);
      }

    } catch (err) {
      const errorMsg = 'Failed to save triage entries';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
      console.error('Error saving triage entries:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (item: TriageItem) => {
    const value = formData[item.id] || '';

    switch (item.dataType) {
      case 'NUMERIC':
        return (
          <Form.Control
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => handleInputChange(item.id, e.target.value)}
            placeholder={item.inputPlaceholder || `Enter ${item.name.toLowerCase()}`}
            required={item.required}
          />
        );

      case 'TEXT':
        return (
          <Form.Control
            as="textarea"
            rows={2}
            value={value}
            onChange={(e) => handleInputChange(item.id, e.target.value)}
            placeholder={item.inputPlaceholder || `Enter ${item.name.toLowerCase()}`}
            required={item.required}
          />
        );

      case 'BOOLEAN':
        return (
          <Form.Select
            value={value}
            onChange={(e) => handleInputChange(item.id, e.target.value)}
            required={item.required}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Form.Select>
        );

      case 'SELECT':
        return (
          <Form.Select
            value={value}
            onChange={(e) => handleInputChange(item.id, e.target.value)}
            required={item.required}
          >
            <option value="">Select...</option>
            {item.selectOptions?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Form.Select>
        );

      default:
        return null;
    }
  };

  const getRequiredItems = () => {
    return triageItems.filter(item => item.required);
  };

  const getOptionalItems = () => {
    return triageItems.filter(item => !item.required);
  };

  const getItemsWithCalculations = () => {
    return triageItems.filter(item => item.calculationFormula);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vital signs':
        return <FaHeartbeat className="me-2" />;
      case 'pain assessment':
        return <FaThermometerHalf className="me-2" />;
      case 'mental status':
        return <FaBrain className="me-2" />;
      case 'physical assessment':
        return <FaStethoscope className="me-2" />;
      case 'symptoms':
        return <FaExclamationTriangle className="me-2" />;
      case 'calculations':
        return <FaCalculator className="me-2" />;
      default:
        return <FaEye className="me-2" />;
    }
  };

  const groupItemsByCategory = () => {
    const grouped: Record<string, TriageItem[]> = {};
    triageItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  };

  const getEntryStatus = (itemId: number) => {
    const entry = existingEntries.find(e => e.triageItemId === itemId);
    if (!entry) return null;
    
    if (entry.isCritical) return { status: 'critical', text: 'Critical', variant: 'danger' };
    if (entry.isWarning) return { status: 'warning', text: 'Warning', variant: 'warning' };
    if (entry.isAbnormal) return { status: 'abnormal', text: 'Abnormal', variant: 'warning' };
    return { status: 'normal', text: 'Normal', variant: 'success' };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="triage-input">
      <Card>
        <Card.Header>
          <h5 className="mb-0">Triage Assessment</h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Grouped by Category */}
          <Accordion defaultActiveKey="0" className="mb-4">
            {Object.entries(groupItemsByCategory()).map(([category, items], categoryIndex) => (
              <Accordion.Item eventKey={categoryIndex.toString()} key={category}>
                <Accordion.Header>
                  <div className="d-flex align-items-center">
                    {getCategoryIcon(category)}
                    <span className="fw-semibold">{category}</span>
                    <Badge bg="secondary" className="ms-2">
                      {items.length} items
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    {items.map(item => {
                      const entryStatus = getEntryStatus(item.id);
                      const hasValue = formData[item.id] !== undefined && formData[item.id] !== '';
                      
                      return (
                        <Col md={6} key={item.id} className="mb-3">
                          <Form.Group>
                            <Form.Label className="d-flex align-items-center justify-content-between">
                              <span>
                                {item.name} {item.unit && `(${item.unit})`}
                                {item.required && (
                                  <Badge bg="danger" className="ms-2">Required</Badge>
                                )}
                                {item.calculationFormula && (
                                  <Badge bg="info" className="ms-2">
                                    <FaCalculator className="me-1" />
                                    Calculated
                                  </Badge>
                                )}
                              </span>
                              {entryStatus && (
                                <Badge bg={entryStatus.variant} className="ms-2">
                                  {entryStatus.text}
                                </Badge>
                              )}
                            </Form.Label>
                            
                            {renderInput(item)}
                            
                            {hasValue && (
                              <div className="mt-1">
                                <small className="text-success">
                                  ✓ Value saved
                                </small>
                              </div>
                            )}
                            
                            {item.helpText && (
                              <Form.Text className="text-muted">
                                {item.helpText}
                              </Form.Text>
                            )}
                          </Form.Group>
                        </Col>
                      );
                    })}
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          {/* Calculation Info */}
          {getItemsWithCalculations().length > 0 && (
            <Alert variant="info" className="mb-4">
              <Alert.Heading>
                <FaCalculator className="me-2" />
                Automatic Calculations
              </Alert.Heading>
              <p>The following items will be automatically calculated:</p>
              <ul className="mb-0">
                {getItemsWithCalculations().map(item => (
                  <li key={item.id}>
                    <strong>{item.name}</strong>
                    {item.calculationNotes && (
                      <span className="text-muted"> - {item.calculationNotes}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Save Triage Assessment
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
