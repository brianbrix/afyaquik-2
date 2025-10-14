import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Badge, Tab, Tabs, Image } from 'react-bootstrap';
import { useAuth } from '../../../hooks/useAuth';
import { PageHeader } from '../../../components/shared/PageHeader';

export function UserProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || '',
    employeeId: user?.employeeId || '',
    hireDate: user?.hireDate || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    console.log('Profile update:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      role: user?.role || '',
      employeeId: user?.employeeId || '',
      hireDate: user?.hireDate || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="container-fluid">
      <PageHeader 
        title="User Profile" 
        subtitle="Manage your personal information and account settings"
      />
      
      <Row>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <Image 
                  src="/api/placeholder/150/150" 
                  roundedCircle 
                  width={150} 
                  height={150}
                  className="border"
                />
              </div>
              <h4>{user?.firstName} {user?.lastName}</h4>
              <p className="text-muted">{user?.role}</p>
              <Badge bg="success" className="mb-2">Active</Badge>
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Shifts:</span>
                <strong>156</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Hours Worked:</span>
                <strong>1,248</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Patients Served:</span>
                <strong>892</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Performance:</span>
                <Badge bg="success">Excellent</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Header>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'profile')}
                className="mb-0"
              >
                <Tab eventKey="profile" title="Personal Info" />
                <Tab eventKey="work" title="Work Details" />
                <Tab eventKey="security" title="Security" />
                <Tab eventKey="preferences" title="Preferences" />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {activeTab === 'profile' && (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Emergency Contact</Form.Label>
                        <Form.Control
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Emergency Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {isEditing && (
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="primary">
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline-secondary" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </Form>
              )}

              {activeTab === 'work' && (
                <div>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Employee ID</Form.Label>
                        <Form.Control
                          type="text"
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Hire Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="hireDate"
                          value={formData.hireDate}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                          type="text"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <Alert variant="info">
                    <strong>Security Settings</strong><br />
                    Change your password and manage two-factor authentication.
                  </Alert>
                  
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control type="password" placeholder="Enter current password" />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control type="password" placeholder="Enter new password" />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control type="password" placeholder="Confirm new password" />
                    </Form.Group>
                    
                    <Button variant="primary">Change Password</Button>
                  </Form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Language</Form.Label>
                      <Form.Select>
                        <option value="en">English</option>
                        <option value="sw">Swahili</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Timezone</Form.Label>
                      <Form.Select>
                        <option value="Africa/Nairobi">Africa/Nairobi</option>
                        <option value="UTC">UTC</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Email notifications"
                        defaultChecked
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="SMS notifications"
                        defaultChecked
                      />
                    </Form.Group>
                    
                    <Button variant="primary">Save Preferences</Button>
                  </Form>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
