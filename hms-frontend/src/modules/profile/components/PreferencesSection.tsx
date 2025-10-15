import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { UserProfile } from '../../../types/profile';

interface PreferencesSectionProps {
  userProfile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export function PreferencesSection({ userProfile, onSave }: PreferencesSectionProps) {
  const [preferredLanguage, setPreferredLanguage] = useState(userProfile.preferredLanguage || '');
  const [timezone, setTimezone] = useState(userProfile.timezone || '');
  const [emailNotifications, setEmailNotifications] = useState(userProfile.emailNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(userProfile.smsNotifications ?? false);
  const [pushNotifications, setPushNotifications] = useState(userProfile.pushNotifications ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreferredLanguage(userProfile.preferredLanguage || '');
    setTimezone(userProfile.timezone || '');
    setEmailNotifications(userProfile.emailNotifications ?? true);
    setSmsNotifications(userProfile.smsNotifications ?? false);
    setPushNotifications(userProfile.pushNotifications ?? false);
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        preferredLanguage,
        timezone,
        emailNotifications,
        smsNotifications,
        pushNotifications,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title className="mb-3">Preferences</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="preferredLanguage">
                <Form.Label>Preferred Language</Form.Label>
                <Form.Select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  disabled={!isEditing || isSaving}
                >
                  <option value="">Select language</option>
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="timezone">
                <Form.Label>Timezone</Form.Label>
                <Form.Select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!isEditing || isSaving}
                >
                  <option value="">Select timezone</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (EAT)</option>
                  <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
                  <option value="UTC">UTC</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Card className="mb-3">
            <Card.Header>
              <h6 className="mb-0">Notification Preferences</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="emailNotifications">
                    <Form.Check
                      type="checkbox"
                      label="Email Notifications"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      disabled={!isEditing || isSaving}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="smsNotifications">
                    <Form.Check
                      type="checkbox"
                      label="SMS Notifications"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                      disabled={!isEditing || isSaving}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="pushNotifications">
                    <Form.Check
                      type="checkbox"
                      label="Push Notifications"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      disabled={!isEditing || isSaving}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end">
            {!isEditing ? (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Preferences
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)} className="me-2" disabled={isSaving}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}