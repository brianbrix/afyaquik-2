import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Button } from 'react-bootstrap';
import { AppointmentCalendar } from '../components/AppointmentCalendar';
import { AppointmentList } from '../components/AppointmentList';
import { AppointmentForm } from '../components/AppointmentForm';
import { useAuth } from '../../../hooks/useAuth';

export function AppointmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAppointmentClick = (appointment: any) => {
    console.log('Appointment clicked:', appointment);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    console.log('Date clicked:', date);
  };

  const handleFormSuccess = (appointment: any) => {
    console.log('Appointment created/updated:', appointment);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Appointments</h2>
              <p className="text-muted">Manage patient appointments and scheduling</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowForm(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              New Appointment
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'calendar')}
                className="border-bottom"
              >
                <Tab eventKey="calendar" title="Calendar View">
                  <div className="p-3">
                    <AppointmentCalendar
                      onAppointmentClick={handleAppointmentClick}
                      onDateClick={handleDateClick}
                    />
                  </div>
                </Tab>
                
                <Tab eventKey="list" title="List View">
                  <div className="p-3">
                    <AppointmentList
                      showFilters={true}
                      showActions={true}
                    />
                  </div>
                </Tab>
                
                <Tab eventKey="my-appointments" title="My Appointments">
                  <div className="p-3">
                    <AppointmentList
                      providerId={user?.id}
                      showFilters={true}
                      showActions={true}
                    />
                  </div>
                </Tab>
                
                <Tab eventKey="today" title="Today's Appointments">
                  <div className="p-3">
                    <AppointmentList
                      showFilters={false}
                      showActions={true}
                      // Add today filter
                    />
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Appointment Form Modal */}
      <AppointmentForm
        show={showForm}
        onHide={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        initialData={selectedDate ? {
          appointmentDateTime: selectedDate.toISOString().slice(0, 16)
        } : undefined}
      />
    </Container>
  );
}
