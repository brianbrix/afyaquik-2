import React, { useState } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner, Row, Col, Form, Modal } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi, SuperAdminUser, CreateSuperAdminUserRequest, UpdateSuperAdminUserRequest } from '../../../services/superAdminApi';
import { PageHeader } from '../../../components/shared/PageHeader';
import Swal from 'sweetalert2';

export function SuperAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuperAdminUser | null>(null);
  const [formData, setFormData] = useState<CreateSuperAdminUserRequest>({
    username: '',
    displayName: '',
    email: '',
    password: ''
  });

  const queryClient = useQueryClient();

  // Fetch super admin users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['superAdminUsers'],
    queryFn: superAdminApi.getAllUsers
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: superAdminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminUsers'] });
      setShowCreateModal(false);
      setFormData({ username: '', displayName: '', email: '', password: '' });
      Swal.fire({ icon: 'success', title: 'Super Admin user created successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create super admin user' });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSuperAdminUserRequest }) => 
      superAdminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminUsers'] });
      setShowEditModal(false);
      setSelectedUser(null);
      Swal.fire({ icon: 'success', title: 'Super Admin user updated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to update super admin user' });
    }
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: superAdminApi.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminUsers'] });
      Swal.fire({ icon: 'success', title: 'Super Admin user deactivated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to deactivate super admin user' });
    }
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleEditUser = (user: SuperAdminUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleDeactivateUser = (id: number, username: string) => {
    Swal.fire({
      title: 'Deactivate Super Admin?',
      text: `Are you sure you want to deactivate ${username}? This will revoke their super admin access.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deactivateUserMutation.mutate(id);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showCreateModal) {
      createUserMutation.mutate(formData);
    } else if (showEditModal && selectedUser) {
      updateUserMutation.mutate({ 
        id: selectedUser.id, 
        data: {
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password,
          isActive: selectedUser.isActive
        }
      });
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
        Failed to load super admin users. Please try again.
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Super Admin Management" 
        subtitle="Manage system administrators with elevated privileges"
      />

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Super Admin Users</h5>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            disabled={createUserMutation.isPending}
          >
            <i className="bi bi-person-plus me-2"></i>
            Add Super Admin
          </Button>
        </Card.Header>
        <Card.Body>
          {users.length === 0 ? (
            <Alert variant="info">
              No super admin users found. Create the first super admin user to get started.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Display Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Failed Attempts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.username}</strong>
                      </td>
                      <td>{user.displayName}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.isActive ? 'success' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                          <Badge bg="danger" className="ms-1">Locked</Badge>
                        )}
                      </td>
                      <td>
                        {user.lastLoginAt ? (
                          <div>
                            <div>{new Date(user.lastLoginAt).toLocaleDateString()}</div>
                            <small className="text-muted">{user.lastLoginIp}</small>
                          </div>
                        ) : (
                          <span className="text-muted">Never</span>
                        )}
                      </td>
                      <td>
                        {user.failedLoginAttempts > 0 ? (
                          <Badge bg="warning" text="dark">
                            {user.failedLoginAttempts}
                          </Badge>
                        ) : (
                          <span className="text-muted">0</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="me-2"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        {user.isActive && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeactivateUser(user.id, user.username)}
                            disabled={deactivateUserMutation.isPending}
                          >
                            <i className="bi bi-person-x"></i>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Super Admin User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUser}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder="Enter username"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Display Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    placeholder="Enter display name"
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Enter password"
                    minLength={8}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Super Admin User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.username}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">Username cannot be changed</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Display Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    placeholder="Enter display name"
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    minLength={8}
                  />
                  <Form.Text className="text-muted">Leave blank to keep current password</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
