import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Modal, Alert, Spinner } from 'react-bootstrap';
import { useMutation, useQuery } from '@tanstack/react-query';
import { appointmentApi, AppointmentRequest, AppointmentDto, AppointmentStatus } from '../../../services/appointmentApi';
import { searchPatients, Patient } from '../../../services/patientApi';
import { useStaffDirectory, StaffDirectoryEntry } from '../../../services/staffDirectoryApi';
import { departmentApi, Department } from '../../../services/departmentApi';
import Swal from 'sweetalert2';

interface AppointmentFormProps {
  show: boolean;
  onHide: () => void;
  onSuccess?: (appointment: AppointmentDto) => void;
  initialData?: Partial<AppointmentRequest>;
  appointmentId?: number;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  show,
  onHide,
  onSuccess,
  initialData,
  appointmentId
}) => {
  const [formData, setFormData] = useState<AppointmentRequest>({
    patientId: 0,
    providerId: 0,
    departmentId: 0,
    appointmentDateTime: '',
    durationMinutes: 30,
    status: AppointmentStatus.SCHEDULED,
    appointmentType: '',
    reason: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data for dropdowns
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => searchPatients()
  });

  const { data: staff } = useStaffDirectory(true);

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.getAll()
  });

  // Fetch existing appointment if editing
  const { data: existingAppointment } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentId ? appointmentApi.getById(appointmentId) : null,
    enabled: !!appointmentId && show
  });

  // Create/Update mutation
  const appointmentMutation = useMutation({
    mutationFn: (data: AppointmentRequest) => {
      if (appointmentId) {
        return appointmentApi.update(appointmentId, data);
      } else {
        return appointmentApi.create(data);
      }
    },
    onSuccess: (appointment) => {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Appointment ${appointmentId ? 'updated' : 'created'} successfully`,
        timer: 1500,
        showConfirmButton: false
      });
      onSuccess?.(appointment);
      onHide();
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || `Failed to ${appointmentId ? 'update' : 'create'} appointment`
      });
    }
  });

  // Initialize form data
  useEffect(() => {
    if (show) {
      if (existingAppointment) {
        setFormData({
          patientId: existingAppointment.patientId,
          providerId: existingAppointment.providerId,
          departmentId: existingAppointment.departmentId,
          appointmentDateTime: existingAppointment.appointmentDateTime,
          durationMinutes: existingAppointment.durationMinutes,
          status: existingAppointment.status,
          appointmentType: existingAppointment.appointmentType || '',
          reason: existingAppointment.reason,
          notes: existingAppointment.notes || ''
        });
      } else if (initialData) {
        setFormData({ ...formData, ...initialData });
      } else {
        // Set default values
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30); // 30 minutes from now
        setFormData({
          patientId: 0,
          providerId: 0,
          departmentId: 0,
          appointmentDateTime: now.toISOString().slice(0, 16), // Format for datetime-local input
          durationMinutes: 30,
          status: AppointmentStatus.SCHEDULED,
          appointmentType: '',
          reason: '',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [show, existingAppointment, initialData]);

  // Handle form field changes
  const handleChange = (field: keyof AppointmentRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }
    if (!formData.providerId) {
      newErrors.providerId = 'Provider is required';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }
    if (!formData.appointmentDateTime) {
      newErrors.appointmentDateTime = 'Appointment date and time is required';
    } else {
      const appointmentDate = new Date(formData.appointmentDateTime);
      const now = new Date();
      if (appointmentDate <= now) {
        newErrors.appointmentDateTime = 'Appointment date must be in the future';
      }
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }
    if (formData.durationMinutes && formData.durationMinutes < 15) {
      newErrors.durationMinutes = 'Duration must be at least 15 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    appointmentMutation.mutate(formData);
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({
      patientId: 0,
      providerId: 0,
      departmentId: 0,
      appointmentDateTime: '',
      durationMinutes: 30,
      status: AppointmentStatus.SCHEDULED,
      appointmentType: '',
      reason: '',
      notes: ''
    });
    setErrors({});
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {appointmentId ? 'Edit Appointment' : 'Create New Appointment'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Patient *</Form.Label>
                <Form.Select
                  value={formData.patientId}
                  onChange={(e) => handleChange('patientId', parseInt(e.target.value))}
                  isInvalid={!!errors.patientId}
                >
                  <option value={0}>Select Patient</option>
                  {patients?.map((patient: Patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.medicalRecordNumber})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.patientId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Provider *</Form.Label>
                <Form.Select
                  value={formData.providerId}
                  onChange={(e) => handleChange('providerId', parseInt(e.target.value))}
                  isInvalid={!!errors.providerId}
                >
                  <option value={0}>Select Provider</option>
                  {staff?.map((provider: StaffDirectoryEntry) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.displayName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.providerId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Department *</Form.Label>
                <Form.Select
                  value={formData.departmentId}
                  onChange={(e) => handleChange('departmentId', parseInt(e.target.value))}
                  isInvalid={!!errors.departmentId}
                >
                  <option value={0}>Select Department</option>
                  {departments?.map((department: Department) => (
                    <option key={department.id} value={department.id}>
                      {department.displayName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departmentId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Appointment Type</Form.Label>
                <Form.Select
                  value={formData.appointmentType}
                  onChange={(e) => handleChange('appointmentType', e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Check-up">Check-up</option>
                  <option value="Emergency">Emergency</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date & Time *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={formData.appointmentDateTime}
                  onChange={(e) => handleChange('appointmentDateTime', e.target.value)}
                  isInvalid={!!errors.appointmentDateTime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.appointmentDateTime}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Duration (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min="15"
                  max="480"
                  value={formData.durationMinutes}
                  onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value))}
                  isInvalid={!!errors.durationMinutes}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.durationMinutes}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as AppointmentStatus)}
                >
                  <option value={AppointmentStatus.SCHEDULED}>Scheduled</option>
                  <option value={AppointmentStatus.CONFIRMED}>Confirmed</option>
                  <option value={AppointmentStatus.ARRIVED}>Arrived</option>
                  <option value={AppointmentStatus.IN_PROGRESS}>In Progress</option>
                  <option value={AppointmentStatus.COMPLETED}>Completed</option>
                  <option value={AppointmentStatus.CANCELLED}>Cancelled</option>
                  <option value={AppointmentStatus.NO_SHOW}>No Show</option>
                  <option value={AppointmentStatus.RESCHEDULED}>Rescheduled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Enter the reason for the appointment"
              isInvalid={!!errors.reason}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reason}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={appointmentMutation.isPending}
          >
            {appointmentMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {appointmentId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              appointmentId ? 'Update Appointment' : 'Create Appointment'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
