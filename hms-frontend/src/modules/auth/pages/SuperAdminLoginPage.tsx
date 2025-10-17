import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { superAdminApi } from '../../../services/superAdminApi';
import Swal from 'sweetalert2';

export function SuperAdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await superAdminApi.login({
        username: formData.username,
        password: formData.password
      });

      // Store tokens in localStorage
      localStorage.setItem('superAdminAccessToken', response.accessToken);
      localStorage.setItem('superAdminRefreshToken', response.refreshToken);
      localStorage.setItem('superAdminUser', JSON.stringify(response.user));

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome, ${response.user.displayName}!`,
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/admin/super-admin');
      });

    } catch (error: any) {
      console.error('Super admin login error:', error);
      setError(error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow">
              <Card.Header className="text-center bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-shield-check me-2"></i>
                  Super Admin Login
                </h4>
                <small>System Administrator Access</small>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter super admin username"
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password"
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login as Super Admin
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Super Admin access provides system-wide privileges
                  </small>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center mt-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Regular Login
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
