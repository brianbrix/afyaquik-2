import React, { useState } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form, Modal, Tabs, Tab } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantManagementApi, Tenant, TenantStats, CreateTenantRequest, CreateAdminUserRequest, StaffUser } from '../../../services/tenantManagementApi';
import { PageHeader } from '../../../components/shared/PageHeader';
import Swal from 'sweetalert2';

export function TenantManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState('tenants');
  const [formData, setFormData] = useState<CreateTenantRequest>({
    tenantCode: '',
    tenantName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    subscriptionPlan: 'BASIC',
    maxUsers: 10,
    trialDays: 30
  });

  const [editFormData, setEditFormData] = useState({
    tenantName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    subscriptionPlan: 'BASIC',
    maxUsers: 10,
    trialDays: 30
  });

  const [userFormData, setUserFormData] = useState<CreateAdminUserRequest>({
    username: '',
    displayName: '',
    email: '',
    password: '',
    tenantCode: '',
    roleKey: 'ADMIN',
    department: '',
    phone: '',
    notes: '',
    isTenantSuperAdmin: false
  });

  const queryClient = useQueryClient();

  // Fetch tenants
  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantManagementApi.getAllTenants
  });

  // Fetch tenant stats for selected tenant
  const { data: tenantStats } = useQuery({
    queryKey: ['tenantStats', selectedTenant?.tenantCode],
    queryFn: () => tenantManagementApi.getTenantStats(selectedTenant!.tenantCode),
    enabled: !!selectedTenant
  });

  // Fetch users for selected tenant
  const { data: tenantUsers = [] } = useQuery({
    queryKey: ['tenantUsers', selectedTenant?.tenantCode],
    queryFn: () => tenantManagementApi.getTenantUsers(selectedTenant!.tenantCode),
    enabled: !!selectedTenant
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: tenantManagementApi.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setShowCreateModal(false);
      setFormData({
        tenantCode: '',
        tenantName: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        subscriptionPlan: 'BASIC',
        maxUsers: 10,
        trialDays: 30
      });
      Swal.fire({ icon: 'success', title: 'Tenant created successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create tenant' });
    }
  });

  // Create admin user mutation
  const createUserMutation = useMutation({
    mutationFn: ({ tenantCode, user }: { tenantCode: string; user: CreateAdminUserRequest }) =>
      tenantManagementApi.createAdminUser(tenantCode, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantUsers'] });
      setShowCreateUserModal(false);
      setUserFormData({
        username: '',
        displayName: '',
        email: '',
        password: '',
        tenantCode: '',
        roleKey: 'ADMIN',
        department: '',
        phone: '',
        notes: ''
      });
      Swal.fire({ icon: 'success', title: 'Admin user created successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create admin user' });
    }
  });

  // Activate tenant mutation
  const activateTenantMutation = useMutation({
    mutationFn: tenantManagementApi.activateTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      Swal.fire({ icon: 'success', title: 'Tenant activated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to activate tenant' });
    }
  });

  // Edit tenant mutation
  const editTenantMutation = useMutation({
    mutationFn: ({ tenantCode, data }: { tenantCode: string; data: any }) =>
      tenantManagementApi.updateTenant(tenantCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setShowEditModal(false);
      Swal.fire({ icon: 'success', title: 'Tenant updated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to update tenant' });
    }
  });

  // Deactivate tenant mutation
  const deactivateTenantMutation = useMutation({
    mutationFn: tenantManagementApi.deactivateTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      Swal.fire({ icon: 'success', title: 'Tenant deactivated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to deactivate tenant' });
    }
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    createTenantMutation.mutate(formData);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant) {
      const userData = { ...userFormData, tenantCode: selectedTenant.tenantCode };
      createUserMutation.mutate({ tenantCode: selectedTenant.tenantCode, user: userData });
    }
  };

  const handleActivateTenant = (tenantCode: string, tenantName: string) => {
    Swal.fire({
      title: 'Activate Tenant?',
      text: `Are you sure you want to activate ${tenantName}? This will enable access for this tenant.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, activate!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        activateTenantMutation.mutate(tenantCode);
      }
    });
  };

  const handleDeactivateTenant = (tenantCode: string, tenantName: string) => {
    Swal.fire({
      title: 'Deactivate Tenant?',
      text: `Are you sure you want to deactivate ${tenantName}? This will disable all access for this tenant.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deactivateTenantMutation.mutate(tenantCode);
      }
    });
  };

  const handleEditTenant = (tenant: any) => {
    setEditFormData({
      tenantName: tenant.tenantName,
      description: tenant.description || '',
      contactEmail: tenant.contactEmail || '',
      contactPhone: tenant.contactPhone || '',
      address: tenant.address || '',
      city: tenant.city || '',
      state: tenant.state || '',
      country: tenant.country || '',
      subscriptionPlan: tenant.subscriptionPlan || 'BASIC',
      maxUsers: tenant.maxUsers || 10,
      trialDays: tenant.trialDays || 30
    });
    setSelectedTenant(tenant);
    setShowEditModal(true);
  };

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTenant) {
      editTenantMutation.mutate({ tenantCode: selectedTenant.tenantCode, data: editFormData });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
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
        Failed to load tenants. Please try again.
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Tenant Management" 
        subtitle="Manage tenant organizations and admin users"
      />

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'tenants')} className="mb-4">
        <Tab eventKey="tenants" title="Tenants">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Tenant Organizations</h5>
              <Button 
                variant="primary" 
                onClick={() => setShowCreateModal(true)}
                disabled={createTenantMutation.isPending}
              >
                <i className="bi bi-building-add me-2"></i>
                Create Tenant
              </Button>
            </Card.Header>
            <Card.Body>
              {tenants.length === 0 ? (
                <Alert variant="info">
                  No tenants found. Create the first tenant organization to get started.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Tenant Code</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Subscription</th>
                        <th>Users</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant: any) => (
                        <tr key={tenant.id}>
                          <td>
                            <strong>{tenant.tenantCode}</strong>
                          </td>
                          <td>
                            <div>
                              <div>{tenant.tenantName}</div>
                              {tenant.description && (
                                <small className="text-muted">{tenant.description}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              {tenant.contactEmail && <div>{tenant.contactEmail}</div>}
                              {tenant.contactPhone && <div>{tenant.contactPhone}</div>}
                            </div>
                          </td>
                          <td>
                            <Badge bg={tenant.isActive ? 'success' : 'secondary'}>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date() && (
                              <Badge bg="info" className="ms-1">Trial</Badge>
                            )}
                          </td>
                          <td>
                            <Badge bg="outline-primary">
                              {tenant.subscriptionPlan || 'BASIC'}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setActiveTab('users');
                              }}
                            >
                              <i className="bi bi-people me-1"></i>
                              View Users
                            </Button>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditTenant(tenant)}
                                title="Edit Tenant"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              {tenant.isActive ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeactivateTenant(tenant.tenantCode, tenant.tenantName)}
                                  disabled={deactivateTenantMutation.isPending}
                                  title="Deactivate Tenant"
                                >
                                  <i className="bi bi-building-x"></i>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleActivateTenant(tenant.tenantCode, tenant.tenantName)}
                                  disabled={activateTenantMutation.isPending}
                                  title="Activate Tenant"
                                >
                                  <i className="bi bi-building-check"></i>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="users" title="Users">
          {selectedTenant ? (
            <div>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Users for {selectedTenant.tenantName}</h5>
                    <small className="text-muted">{selectedTenant.tenantCode}</small>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowCreateUserModal(true)}
                    disabled={createUserMutation.isPending}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Add Admin User
                  </Button>
                </Card.Header>
                <Card.Body>
                  {tenantStats && (
                    <Row className="mb-4">
                      <Col md={3}>
                        <Card className="text-center">
                          <Card.Body>
                            <h4 className="text-primary">{tenantStats.totalUsers}</h4>
                            <small>Total Users</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="text-center">
                          <Card.Body>
                            <h4 className="text-success">{tenantStats.activeUsers}</h4>
                            <small>Active Users</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="text-center">
                          <Card.Body>
                            <h4 className="text-info">{tenantStats.maxUsers || '∞'}</h4>
                            <small>Max Users</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3}>
                        <Card className="text-center">
                          <Card.Body>
                            <h4 className="text-warning">
                              {tenantStats.trialEndsAt ? 
                                Math.ceil((new Date(tenantStats.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                                'N/A'
                              }
                            </h4>
                            <small>Trial Days Left</small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}

                  {tenantUsers.length === 0 ? (
                    <Alert variant="info">
                      No users found for this tenant. Create the first admin user to get started.
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table hover>
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Display Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenantUsers.map((user: any) => (
                            <tr key={user.id}>
                              <td>
                                <strong>{user.username}</strong>
                                {user.isTenantSuperAdmin && (
                                  <Badge bg="danger" className="ms-2" title="Tenant Super Admin">
                                    <i className="bi bi-shield-fill-exclamation me-1"></i>
                                    Super Admin
                                  </Badge>
                                )}
                              </td>
                              <td>{user.displayName}</td>
                              <td>{user.email}</td>
                              <td>{user.department || '-'}</td>
                              <td>
                                {user.roles && user.roles.length > 0 ? (
                                  user.roles.map((role: any, index: any) => (
                                    <Badge key={index} bg="outline-primary" className="me-1">
                                      {role}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge bg="outline-secondary">No Role</Badge>
                                )}
                              </td>
                              <td>
                                <Badge bg={user.enabled ? 'success' : 'secondary'}>
                                  {user.enabled ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          ) : (
            <Alert variant="info">
              Select a tenant from the Tenants tab to view its users.
            </Alert>
          )}
        </Tab>
      </Tabs>

      {/* Create Tenant Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Tenant</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTenant}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tenant Code *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tenantCode}
                    onChange={(e) => setFormData({ ...formData, tenantCode: e.target.value })}
                    required
                    placeholder="e.g., clinic-a"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tenant Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    required
                    placeholder="e.g., City Medical Center"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@clinic.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Subscription Plan</Form.Label>
                  <Form.Select
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  >
                    <option value="BASIC">Basic</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Users</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Trial Days</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                    min="0"
                    max="365"
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
                placeholder="Brief description of the tenant organization"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createTenantMutation.isPending}>
              {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Create Admin User Modal */}
      <Modal show={showCreateUserModal} onHide={() => setShowCreateUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Admin User for {selectedTenant?.tenantName}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUser}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    required
                    placeholder="admin"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Display Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={userFormData.displayName}
                    onChange={(e) => setUserFormData({ ...userFormData, displayName: e.target.value })}
                    required
                    placeholder="Dr. John Smith"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    required
                    placeholder="admin@clinic.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    required
                    placeholder="Enter password"
                    minLength={8}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={userFormData.roleKey}
                    onChange={(e) => setUserFormData({ ...userFormData, roleKey: e.target.value })}
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="MANAGER">Manager</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={userFormData.department}
                    onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                    placeholder="Emergency Department"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isTenantSuperAdmin"
                    label="Tenant Super Admin (Protected from modification by tenant users)"
                    checked={userFormData.isTenantSuperAdmin}
                    onChange={(e) => setUserFormData({ ...userFormData, isTenantSuperAdmin: e.target.checked })}
                  />
                  <Form.Text className="text-muted">
                    Tenant Super Admins cannot be modified, disabled, or deleted by users within the tenant.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateUserModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Form onSubmit={handleUpdateTenant}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Tenant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tenant Code (Read-only)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedTenant?.tenantCode || ''}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Tenant code cannot be changed after creation
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tenant Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.tenantName}
                    onChange={(e) => setEditFormData({ ...editFormData, tenantName: e.target.value })}
                    placeholder="Enter tenant name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Subscription Plan</Form.Label>
                  <Form.Select
                    value={editFormData.subscriptionPlan}
                    onChange={(e) => setEditFormData({ ...editFormData, subscriptionPlan: e.target.value })}
                  >
                    <option value="BASIC">Basic</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Users</Form.Label>
                  <Form.Control
                    type="number"
                    value={editFormData.maxUsers}
                    onChange={(e) => setEditFormData({ ...editFormData, maxUsers: parseInt(e.target.value) })}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Trial Days</Form.Label>
                  <Form.Control
                    type="number"
                    value={editFormData.trialDays}
                    onChange={(e) => setEditFormData({ ...editFormData, trialDays: parseInt(e.target.value) })}
                    min="0"
                    max="365"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Brief description of the tenant organization"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={editFormData.contactEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={editFormData.contactPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="Street address"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    placeholder="City"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    placeholder="State"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    placeholder="Country"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={editTenantMutation.isPending}>
              {editTenantMutation.isPending ? 'Updating...' : 'Update Tenant'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
