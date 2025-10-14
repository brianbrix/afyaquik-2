import React, { useState } from 'react';
import { Form, Row, Col, Button, Card, Image } from 'react-bootstrap';
import { UserProfile } from '../../../services/profileApi';

interface PersonalInfoSectionProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  isUpdating: boolean;
}

export function PersonalInfoSection({ profile, onUpdate, isUpdating }: PersonalInfoSectionProps) {
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    middleName: profile.middleName || '',
    dateOfBirth: profile.dateOfBirth || '',
    gender: profile.gender || '',
    bio: profile.bio || '',
    profileImageUrl: profile.profileImageUrl || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-person-circle me-2"></i>
          Personal Information
        </h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-4">
            <Col md={3} className="text-center">
              <div className="mb-3">
                {formData.profileImageUrl ? (
                  <Image
                    src={formData.profileImageUrl}
                    roundedCircle
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    alt="Profile"
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px', margin: '0 auto' }}
                  >
                    <i className="bi bi-person text-white" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
              </div>
              <Form.Group>
                <Form.Label>Profile Image URL</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.profileImageUrl}
                  onChange={(e) => handleChange('profileImageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </Form.Group>
            </Col>
            <Col md={9}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Middle Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => handleChange('middleName', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Update Personal Information
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
