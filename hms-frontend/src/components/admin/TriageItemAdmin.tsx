import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Table, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Dropdown, 
  Alert,
  Spinner,
  Tabs,
  Tab
} from 'react-bootstrap';
import { triageItemApi, TriageItem, TriageItemRequest } from '../../services/triageItemApi';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCog, FaCalculator, FaExclamationTriangle } from 'react-icons/fa';

export const TriageItemAdmin: React.FC = () => {
  const [triageItems, setTriageItems] = useState<TriageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TriageItem | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [dataTypes] = useState<string[]>(['NUMERIC', 'TEXT', 'BOOLEAN', 'SELECT']);
  const [activeTab, setActiveTab] = useState('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  // Common formulas for selection
  const commonFormulas = [
    { value: '', label: 'No Formula' },
    
    // Pain Scale Calculations
    { value: '$\\{current_numeric\\} >= 0 && $\\{current_numeric\\} <= 3 ? "Mild Pain" : $\\{current_numeric\\} >= 4 && $\\{current_numeric\\} <= 6 ? "Moderate Pain" : $\\{current_numeric\\} >= 7 && $\\{current_numeric\\} <= 10 ? "Severe Pain" : "Invalid Score"', label: 'Pain Scale Assessment (0-10)' },
    { value: '$\\{current_numeric\\} >= 7 ? "URGENT - Severe Pain" : $\\{current_numeric\\} >= 4 ? "Moderate Pain - Monitor" : "Mild Pain - Routine"', label: 'Pain Scale Priority' },
    { value: '$\\{current_numeric\\} >= 8 ? "CRITICAL - Immediate Intervention" : $\\{current_numeric\\} >= 6 ? "HIGH - Pain Management" : $\\{current_numeric\\} >= 4 ? "MODERATE - Assess" : "LOW - Routine Care"', label: 'Pain Scale Triage Level' },
    
    // Vital Signs Calculations
    { value: '$\\{current_numeric\\} * 1.8 + 32', label: 'Celsius to Fahrenheit' },
    { value: '($\\{current_numeric\\} - 32) / 1.8', label: 'Fahrenheit to Celsius' },
    { value: '$\\{current_numeric\\} >= 38 ? "FEVER" : $\\{current_numeric\\} < 35 ? "HYPOTHERMIA" : "Normal"', label: 'Temperature Assessment (°C)' },
    { value: '$\\{current_numeric\\} > 100 ? "TACHYCARDIA" : $\\{current_numeric\\} < 60 ? "BRADYCARDIA" : "Normal"', label: 'Heart Rate Assessment (bpm)' },
    { value: '$\\{current_numeric\\} > 140 ? "HYPERTENSION" : $\\{current_numeric\\} < 90 ? "HYPOTENSION" : "Normal"', label: 'Systolic BP Assessment (mmHg)' },
    
    // Weight/Height Calculations
    { value: '$\\{current_numeric\\} * 0.453592', label: 'Pounds to Kilograms' },
    { value: '$\\{current_numeric\\} / 0.453592', label: 'Kilograms to Pounds' },
    { value: '$\\{current_numeric\\} * 0.3048', label: 'Feet to Meters' },
    { value: '$\\{current_numeric\\} / 0.3048', label: 'Meters to Feet' },
    { value: '$\\{current_numeric\\} * 2.54', label: 'Inches to Centimeters' },
    { value: '$\\{current_numeric\\} / 2.54', label: 'Centimeters to Inches' },
    
    // BMI Calculation (requires weight in kg and height in meters)
    { value: '$\\{current_numeric\\} / ($\\{height_meters\\} * $\\{height_meters\\})', label: 'BMI Calculation (kg/m²)' },
    { value: '$\\{current_numeric\\} >= 30 ? "OBESE" : $\\{current_numeric\\} >= 25 ? "OVERWEIGHT" : $\\{current_numeric\\} >= 18.5 ? "NORMAL" : "UNDERWEIGHT"', label: 'BMI Assessment' },
    
    // Cross-field Calculations
    { value: '$\\{current_numeric\\} * $\\{weight_kg\\}', label: 'Dose by Weight (mg/kg)' },
    { value: '$\\{current_numeric\\} * $\\{age_years\\}', label: 'Age-adjusted Calculation' },
    { value: '$\\{current_numeric\\} + $\\{temperature_celsius\\}', label: 'Temperature-adjusted Value' },
    { value: '$\\{current_numeric\\} * (220 - $\\{age_years\\}) / 100', label: 'Maximum Heart Rate %' },
    { value: '$\\{current_numeric\\} / $\\{height_meters\\}', label: 'Height-adjusted Value' },
    
    // Medication/Volume Calculations
    { value: '$\\{current_numeric\\} * 0.001', label: 'Milligrams to Grams' },
    { value: '$\\{current_numeric\\} * 1000', label: 'Grams to Milligrams' },
    { value: '$\\{current_numeric\\} * 0.001', label: 'Milliliters to Liters' },
    { value: '$\\{current_numeric\\} * 1000', label: 'Liters to Milliliters' },
    { value: '$\\{current_numeric\\} * 0.033814', label: 'Milliliters to Fluid Ounces' },
    { value: '$\\{current_numeric\\} / 0.033814', label: 'Fluid Ounces to Milliliters' }
  ];

  // Form state
  const [formData, setFormData] = useState<TriageItemRequest>({
    name: '',
    description: '',
    category: '',
    unit: '',
    dataType: 'NUMERIC',
    required: false,
    displayOrder: 0,
    active: true,
    normalMinValue: undefined,
    normalMaxValue: undefined,
    normalTextValues: [],
    abnormalMinValue: undefined,
    abnormalMaxValue: undefined,
    calculationFormula: '',
    calculationNotes: '',
    inputConfig: '',
    inputPlaceholder: '',
    inputValidation: '',
    selectOptions: [],
    displayFormat: '',
    helpText: '',
    warningThreshold: undefined,
    criticalThreshold: undefined,
    warningThresholdMin: undefined,
    warningThresholdMax: undefined,
    criticalThresholdMin: undefined,
    criticalThresholdMax: undefined
  });

  // Variable mapping for formulas
  const [variableMappings, setVariableMappings] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadTriageItems();
    loadCategories();
  }, []);

  const loadTriageItems = async () => {
    try {
      setLoading(true);
      const items = await triageItemApi.getAllTriageItems();
      setTriageItems(items);
      setError(null);
    } catch (err) {
      setError('Failed to load triage items');
      console.error('Error loading triage items:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await triageItemApi.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      dataType: 'NUMERIC',
      required: false,
      displayOrder: 0,
      active: true,
      normalMinValue: undefined,
      normalMaxValue: undefined,
      normalTextValues: [],
      abnormalMinValue: undefined,
      abnormalMaxValue: undefined,
      calculationFormula: '',
      calculationNotes: '',
      inputPlaceholder: '',
      inputValidation: '',
      selectOptions: [],
      displayFormat: '',
      helpText: '',
      warningThreshold: undefined,
      criticalThreshold: undefined
    });
    setShowModal(true);
  };

  const handleEdit = (item: TriageItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      unit: item.unit,
      dataType: item.dataType,
      required: item.required,
      displayOrder: item.displayOrder,
      active: item.active,
      normalMinValue: item.normalMinValue ?? undefined,
      normalMaxValue: item.normalMaxValue ?? undefined,
      normalTextValues: item.normalTextValues || [],
      abnormalMinValue: item.abnormalMinValue ?? undefined,
      abnormalMaxValue: item.abnormalMaxValue ?? undefined,
      calculationFormula: item.calculationFormula || '',
      calculationNotes: item.calculationNotes || '',
      inputConfig: item.inputConfig || '',
      inputPlaceholder: item.inputPlaceholder || '',
      inputValidation: item.inputValidation || '',
      selectOptions: item.selectOptions || [],
      displayFormat: item.displayFormat || '',
      helpText: item.helpText || '',
      warningThreshold: item.warningThreshold ?? undefined,
      criticalThreshold: item.criticalThreshold ?? undefined,
      warningThresholdMin: item.warningThresholdMin ?? undefined,
      warningThresholdMax: item.warningThresholdMax ?? undefined,
      criticalThresholdMin: item.criticalThresholdMin ?? undefined,
      criticalThresholdMax: item.criticalThresholdMax ?? undefined
    });
    
    // Load variable mappings if they exist
    if (item.variableMappings) {
      try {
        const mappings = JSON.parse(item.variableMappings);
        setVariableMappings(mappings);
      } catch (e) {
        console.error('Error parsing variable mappings:', e);
        setVariableMappings({});
      }
    } else {
      setVariableMappings({});
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this triage item?')) {
      try {
        await triageItemApi.deleteTriageItem(id);
        await loadTriageItems();
      } catch (err) {
        setError('Failed to delete triage item');
        console.error('Error deleting triage item:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      dataType: 'NUMERIC',
      required: false,
      displayOrder: 0,
      active: true,
      normalMinValue: undefined,
      normalMaxValue: undefined,
      normalTextValues: [],
      abnormalMinValue: undefined,
      abnormalMaxValue: undefined,
      calculationFormula: '',
      calculationNotes: '',
      inputConfig: '',
      inputPlaceholder: '',
      inputValidation: '',
      selectOptions: [],
      displayFormat: '',
      helpText: '',
      warningThreshold: undefined,
      criticalThreshold: undefined,
      warningThresholdMin: undefined,
      warningThresholdMax: undefined,
      criticalThresholdMin: undefined,
      criticalThresholdMax: undefined
    });
    setVariableMappings({});
    setEditingItem(null);
    setError('');
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      // Add category to local state for immediate use
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setShowCategoryModal(false);
      // Refresh categories from backend
      loadCategories();
    }
  };

  const handleRemoveCategory = (category: string) => {
    if (window.confirm(`Are you sure you want to remove the category "${category}"?`)) {
      setCategories(categories.filter(c => c !== category));
    }
  };

  // Extract variables from formula (e.g., ${weight_kg}, ${height_meters})
  const extractVariablesFromFormula = (formula: string): string[] => {
    if (!formula) return [];
    
    // Handle both escaped and unescaped formats
    const variableRegex = /\$\\?\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(formula)) !== null) {
      const variable = match[1];
      // Skip current_* variables as they don't need mapping
      if (!variable.startsWith('current_')) {
        variables.push(variable);
      }
    }
    
    // Remove duplicates
    return [...new Set(variables)];
  };

  const handleSubmit = async () => {
    try {
      // Convert variable mappings to JSON string
      const formDataWithMappings = {
        ...formData,
        variableMappings: Object.keys(variableMappings).length > 0 ? JSON.stringify(variableMappings) : undefined
      };

      if (editingItem) {
        await triageItemApi.updateTriageItem(editingItem.id, formDataWithMappings);
      } else {
        await triageItemApi.createTriageItem(formDataWithMappings);
      }
      setShowModal(false);
      resetForm();
      await loadTriageItems();
    } catch (err) {
      setError('Failed to save triage item');
      console.error('Error saving triage item:', err);
    }
  };

  const getStatusBadge = (item: TriageItem) => {
    if (!item.active) {
      return <Badge bg="secondary">Inactive</Badge>;
    }
    if (item.required) {
      return <Badge bg="danger">Required</Badge>;
    }
    return <Badge bg="success">Active</Badge>;
  };

  const getDataTypeBadge = (dataType: string) => {
    const colors = {
      NUMERIC: 'primary',
      TEXT: 'info',
      BOOLEAN: 'warning',
      SELECT: 'secondary'
    };
    return <Badge bg={colors[dataType as keyof typeof colors] || 'secondary'}>{dataType}</Badge>;
  };

  const filteredItems = triageItems.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return item.active;
    if (activeTab === 'required') return item.required;
    if (activeTab === 'calculations') return item.calculationFormula;
    return item.category === activeTab;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Triage Items Management</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => setShowCategoryModal(true)}>
            <FaCog className="me-2" />
            Manage Categories
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <FaPlus className="me-2" />
            Add Triage Item
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'all')} className="mb-3">
            <Tab eventKey="all" title="All Items">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Data Type</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th>Calculations</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <strong>{item.name}</strong>
                          {item.description && (
                            <div className="text-muted small">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td>{getDataTypeBadge(item.dataType)}</td>
                      <td>{item.unit || '-'}</td>
                      <td>{getStatusBadge(item)}</td>
                      <td>
                        {item.calculationFormula ? (
                          <Badge bg="info">
                            <FaCalculator className="me-1" />
                            Formula
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleEdit(item)}>
                              <FaEdit className="me-2" />
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(item.id)}>
                              <FaTrash className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="active" title="Active Items">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Data Type</th>
                    <th>Required</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{getDataTypeBadge(item.dataType)}</td>
                      <td>{item.required ? <Badge bg="danger">Required</Badge> : '-'}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(item)}>
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="calculations" title="With Calculations">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Formula</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <code className="small">{item.calculationFormula}</code>
                      </td>
                      <td>{item.calculationNotes || '-'}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(item)}>
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Edit Triage Item' : 'Create Triage Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter triage item name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setShowCategoryModal(true)}
                      title="Manage Categories"
                    >
                      <FaCog />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Type *</Form.Label>
                  <Form.Select
                    value={formData.dataType}
                    onChange={(e) => setFormData({ ...formData, dataType: e.target.value as any })}
                  >
                    {dataTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., °C, bpm, mmHg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Display Order</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Required"
                    checked={formData.required}
                    onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Normal Range */}
            <h5>Normal Range</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.normalMinValue ?? ''}
                    onChange={(e) => setFormData({ ...formData, normalMinValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.normalMaxValue ?? ''}
                    onChange={(e) => setFormData({ ...formData, normalMaxValue: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Warning Range */}
            <h5>Warning Range</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warning Min Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.warningThresholdMin ?? ''}
                    onChange={(e) => setFormData({ ...formData, warningThresholdMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Warning threshold min"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Warning Max Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.warningThresholdMax ?? ''}
                    onChange={(e) => setFormData({ ...formData, warningThresholdMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Warning threshold max"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Critical Range */}
            <h5>Critical Range</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Critical Min Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.criticalThresholdMin ?? ''}
                    onChange={(e) => setFormData({ ...formData, criticalThresholdMin: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Critical threshold min"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Critical Max Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.criticalThresholdMax ?? ''}
                    onChange={(e) => setFormData({ ...formData, criticalThresholdMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Critical threshold max"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Input Configuration */}
            <h5>Input Configuration</h5>
            <Form.Group className="mb-3">
              <Form.Label>Input Configuration (JSON)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.inputConfig || ''}
                onChange={(e) => setFormData({ ...formData, inputConfig: e.target.value })}
                placeholder='{"min": 70, "max": 250, "step": 1}'
              />
              <Form.Text className="text-muted">
                JSON configuration for input validation (e.g., min, max, step values)
              </Form.Text>
            </Form.Group>

            {/* Select Options for SELECT data type */}
            {formData.dataType === 'SELECT' && (
              <>
                <h5>Select Options</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Available Options</Form.Label>
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {formData.selectOptions && formData.selectOptions.length > 0 ? (
                      formData.selectOptions.map((option, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center py-1">
                          <span>{option}</span>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              const newOptions = [...(formData.selectOptions || [])];
                              newOptions.splice(index, 1);
                              setFormData({ ...formData, selectOptions: newOptions });
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted">No options added yet</div>
                    )}
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <Form.Control
                      type="text"
                      placeholder="Add new option"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newOption = e.currentTarget.value.trim();
                          if (newOption && !formData.selectOptions?.includes(newOption)) {
                            setFormData({ 
                              ...formData, 
                              selectOptions: [...(formData.selectOptions || []), newOption] 
                            });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add new option"]') as HTMLInputElement;
                        if (input) {
                          const newOption = input.value.trim();
                          if (newOption && !formData.selectOptions?.includes(newOption)) {
                            setFormData({ 
                              ...formData, 
                              selectOptions: [...(formData.selectOptions || []), newOption] 
                            });
                            input.value = '';
                          }
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </Form.Group>
              </>
            )}

            {/* Calculation */}
            <h5>Calculation</h5>
            <Form.Group className="mb-3">
              <Form.Label>Formula</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  value={formData.calculationFormula}
                  onChange={(e) => setFormData({ ...formData, calculationFormula: e.target.value })}
                  className="flex-grow-1"
                >
                  {commonFormulas.map((formula, index) => (
                    <option key={`formula-${index}-${formula.label}`} value={formula.value.replace(/\\/g, '')}>{formula.label}</option>
                  ))}
                </Form.Select>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setFormData({ ...formData, calculationFormula: '' })}
                  title="Clear Formula"
                >
                  Clear
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.calculationFormula}
                onChange={(e) => setFormData({ ...formData, calculationFormula: e.target.value })}
                placeholder="e.g., $&#123;current_numeric&#125; * 2 + 10"
                className="mt-2"
              />
              <Form.Text className="text-muted">
                <strong>Available Variables:</strong><br/>
                • $&#123;current_numeric&#125; - Current numeric input value<br/>
                • $&#123;current_text&#125; - Current text input value<br/>
                • $&#123;current_boolean&#125; - Current boolean input value<br/>
                • $&#123;height_meters&#125; - Height in meters (from other triage items)<br/>
                • $&#123;weight_kg&#125; - Weight in kilograms (from other triage items)<br/>
                • $&#123;age_years&#125; - Patient age in years<br/>
                • $&#123;temperature_celsius&#125; - Temperature in Celsius<br/>
                • $&#123;heart_rate_bpm&#125; - Heart rate in BPM<br/>
                • $&#123;systolic_bp&#125; - Systolic blood pressure<br/>
                • $&#123;diastolic_bp&#125; - Diastolic blood pressure
              </Form.Text>
            </Form.Group>

            {/* Variable Mapping Section */}
            {formData.calculationFormula && (formData.calculationFormula.includes('$') || formData.calculationFormula.includes('\\{')) && (
              <Form.Group className="mb-3">
                <Form.Label>Map Formula Variables to Triage Items</Form.Label>
                <Alert variant="info" className="mb-3">
                  <strong>How it works:</strong> Map the variables in your formula to actual triage items. 
                  For example, if your formula uses <code>$&#123;weight_kg&#125;</code>, 
                  select which triage item contains the patient's weight.
                </Alert>
                
                {extractVariablesFromFormula(formData.calculationFormula).map(variable => (
                  <div key={variable} className="mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="secondary">${variable}</Badge>
                      <span>→</span>
                      <Form.Select
                        value={variableMappings[variable] || ''}
                        onChange={(e) => setVariableMappings({
                          ...variableMappings,
                          [variable]: e.target.value ? parseInt(e.target.value) : 0
                        })}
                        style={{ minWidth: '200px' }}
                      >
                        <option value="">Select triage item...</option>
                        {triageItems
                          .filter(item => item.dataType === 'NUMERIC' && item.id !== editingItem?.id)
                          .map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </option>
                          ))}
                      </Form.Select>
                    </div>
                  </div>
                ))}
                
                {extractVariablesFromFormula(formData.calculationFormula).length === 0 && (
                  <div className="text-muted">
                    No variables found in formula. Variables should be in the format $&#123;variable_name&#125;
                  </div>
                )}
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Calculation Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.calculationNotes}
                onChange={(e) => setFormData({ ...formData, calculationNotes: e.target.value })}
                placeholder="Notes about the calculation"
              />
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Category Management Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Categories</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Form.Label>Add New Category</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button variant="primary" onClick={handleAddCategory}>
                Add
              </Button>
            </div>
          </div>
          
          <div>
            <Form.Label>Existing Categories</Form.Label>
            <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {categories.length === 0 ? (
                <div className="text-muted">No categories yet</div>
              ) : (
                categories.map(category => (
                  <div key={category} className="d-flex justify-content-between align-items-center py-1">
                    <span>{category}</span>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveCategory(category)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
