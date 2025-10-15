import React, { useState } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form, Modal } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { currencyApi, Currency, CurrencyRequest } from '../../../services/currencyApi';
import { PageHeader } from '../../../components/shared/PageHeader';
import Swal from 'sweetalert2';

export function CurrencyManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState<CurrencyRequest>({
    code: '',
    name: '',
    symbol: '',
    isDefault: false,
    decimalPlaces: 2,
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch currencies
  const { data: currencies = [], isLoading, error } = useQuery({
    queryKey: ['currencies'],
    queryFn: currencyApi.getAllCurrencies
  });

  // Create currency mutation
  const createCurrencyMutation = useMutation({
    mutationFn: currencyApi.createCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setShowCreateModal(false);
      setFormData({
        code: '',
        name: '',
        symbol: '',
        isDefault: false,
        decimalPlaces: 2,
        isActive: true
      });
      Swal.fire({ icon: 'success', title: 'Currency created successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create currency' });
    }
  });

  // Update currency mutation
  const updateCurrencyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CurrencyRequest }) => 
      currencyApi.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setShowEditModal(false);
      setSelectedCurrency(null);
      Swal.fire({ icon: 'success', title: 'Currency updated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to update currency' });
    }
  });

  // Delete currency mutation
  const deleteCurrencyMutation = useMutation({
    mutationFn: currencyApi.deleteCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      Swal.fire({ icon: 'success', title: 'Currency deleted successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to delete currency' });
    }
  });

  // Set default currency mutation
  const setDefaultCurrencyMutation = useMutation({
    mutationFn: currencyApi.setDefaultCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      Swal.fire({ icon: 'success', title: 'Default currency updated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to set default currency' });
    }
  });

  const handleCreateCurrency = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      isDefault: false,
      decimalPlaces: 2,
      isActive: true
    });
    setShowCreateModal(true);
  };

  const handleEditCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isDefault: currency.isDefault,
      decimalPlaces: currency.decimalPlaces,
      isActive: currency.isActive
    });
    setShowEditModal(true);
  };

  const handleDeleteCurrency = (id: number, code: string) => {
    Swal.fire({
      title: 'Delete Currency?',
      text: `Are you sure you want to delete ${code}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCurrencyMutation.mutate(id);
      }
    });
  };

  const handleSetDefault = (id: number) => {
    Swal.fire({
      title: 'Set as Default?',
      text: 'This will make this currency the default for all transactions.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, set as default',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setDefaultCurrencyMutation.mutate(id);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showCreateModal) {
      createCurrencyMutation.mutate(formData);
    } else if (showEditModal && selectedCurrency) {
      updateCurrencyMutation.mutate({ id: selectedCurrency.id!, data: formData });
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Currencies</Alert.Heading>
        <p>Failed to load currencies. Please try again later.</p>
      </Alert>
    );
  }

  return (
    <div className="container-fluid">
      <PageHeader 
        title="Currency Management" 
        subtitle="Manage system currencies and default settings"
      />
      
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Currencies</h5>
          <Button variant="primary" onClick={handleCreateCurrency}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Currency
          </Button>
        </Card.Header>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Symbol</th>
                <th>Decimal Places</th>
                <th>Status</th>
                <th>Default</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map(currency => (
                <tr key={currency.id}>
                  <td>
                    <Badge bg="secondary">{currency.code}</Badge>
                  </td>
                  <td>{currency.name}</td>
                  <td>{currency.symbol}</td>
                  <td>{currency.decimalPlaces}</td>
                  <td>
                    <Badge bg={currency.isActive ? 'success' : 'danger'}>
                      {currency.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    {currency.isDefault ? (
                      <Badge bg="primary">Default</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => handleSetDefault(currency.id!)}
                        disabled={setDefaultCurrencyMutation.isPending}
                      >
                        Set Default
                      </Button>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => handleEditCurrency(currency)}
                        disabled={updateCurrencyMutation.isPending}
                        title="Edit currency"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      {!currency.isDefault && (
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleDeleteCurrency(currency.id!, currency.code)}
                          disabled={deleteCurrencyMutation.isPending}
                          title="Delete currency"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create Currency Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Currency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., USD, EUR, KES"
                    maxLength={3}
                    required
                  />
                  <Form.Text className="text-muted">
                    3-letter ISO currency code
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., US Dollar, Euro"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Symbol *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g., $, €, KSh"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Decimal Places *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="4"
                    value={formData.decimalPlaces}
                    onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 2 })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Set as default currency"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={createCurrencyMutation.isPending || !formData.code || !formData.name || !formData.symbol}
          >
            {createCurrencyMutation.isPending ? (
              <>
                <Spinner size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Currency'
            )}
          </Button>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Currency Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Currency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., USD, EUR, KES"
                    maxLength={3}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., US Dollar, Euro"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Symbol *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g., $, €, KSh"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Decimal Places *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="4"
                    value={formData.decimalPlaces}
                    onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 2 })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Set as default currency"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={updateCurrencyMutation.isPending || !formData.code || !formData.name || !formData.symbol}
          >
            {updateCurrencyMutation.isPending ? (
              <>
                <Spinner size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Currency'
            )}
          </Button>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
