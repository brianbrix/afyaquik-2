import { useState, useMemo, useRef } from "react";
import { Button, Card, Table, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { Pagination as Pager } from "../../../components/shared/Pagination";
import { FormModal } from "../../../components/shared/FormModal";
import { FilterBar } from "../../../components/shared/FilterBar";
import { DynamicForm, type DynamicField } from "../../../components/forms/DynamicForm";
import { PatientRegistrationForm } from "../../../components/forms/PatientRegistrationForm";
import { useCreatePatient, usePatients, type PageResponse, type PatientSummary } from "../../../services/patientApi";
import Swal from 'sweetalert2';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';
import { createQueueForPatient, fetchPatientQueue } from '../../../services/patientQueueApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueuePriority } from '../../../types/queue';
import { useEditPatient } from '../../../services/useEditPatient';

const patientFields: DynamicField[] = [
  // Basic Information
  { name: "medicalRecordNumber", label: "Medical Record Number (MRN)", type: "text", required: false, placeholder: "Leave blank to auto-generate", helpText: "Unique identifier for the patient" },
  { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter patient's first name" },
  { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Enter patient's last name" },
  { name: "middleName", label: "Middle Name", type: "text", placeholder: "Enter middle name (optional)" },
  
  // Contact Information
  { name: "phone", label: "Primary Phone", type: "text", required: true, placeholder: "+254 700 000 000" },
  { name: "alternatePhone", label: "Alternate Phone", type: "text", placeholder: "+254 700 000 000" },
  { name: "email", label: "Email Address", type: "text", placeholder: "patient@example.com" },
  
  // Personal Details
  { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
  { name: "nationalId", label: "National ID/Passport", type: "text", placeholder: "Enter national ID or passport number" },
  { name: "gender", label: "Gender", type: "select", required: true, options: [
    { value: "FEMALE", label: "Female" },
    { value: "MALE", label: "Male" },
    { value: "OTHER", label: "Other" },
    { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" }
  ]},
  
  // Address Information
  { name: "address", label: "Address", type: "textarea", placeholder: "Enter full address" },
  { name: "city", label: "City", type: "text", placeholder: "Enter city" },
  { name: "state", label: "State/Province", type: "text", placeholder: "Enter state or province" },
  { name: "postalCode", label: "Postal Code", type: "text", placeholder: "Enter postal code" },
  { name: "country", label: "Country", type: "text", placeholder: "Enter country" },
  
  // Emergency Contact
  { name: "emergencyContactName", label: "Emergency Contact Name", type: "text", placeholder: "Full name of emergency contact" },
  { name: "emergencyContactPhone", label: "Emergency Contact Phone", type: "text", placeholder: "+254 700 000 000" },
  { name: "emergencyContactRelationship", label: "Relationship", type: "select", options: [
    { value: "SPOUSE", label: "Spouse" },
    { value: "PARENT", label: "Parent" },
    { value: "CHILD", label: "Child" },
    { value: "SIBLING", label: "Sibling" },
    { value: "FRIEND", label: "Friend" },
    { value: "OTHER", label: "Other" }
  ]},
  
  // Visit Information
  { name: "visitReason", label: "Reason for Visit", type: "textarea", required: true, placeholder: "Describe the reason for this visit" },
  { name: "priority", label: "Priority Level", type: "select", required: true, options: [
    { value: "LOW", label: "Low - Routine visit" },
    { value: "MEDIUM", label: "Medium - Standard priority" },
    { value: "HIGH", label: "High - Urgent attention needed" },
    { value: "CRITICAL", label: "Critical - Emergency situation" }
  ]},
  
  // Additional Information
  { name: "allergies", label: "Known Allergies", type: "textarea", placeholder: "List any known allergies or adverse reactions" },
  { name: "medications", label: "Current Medications", type: "textarea", placeholder: "List current medications and dosages" },
  { name: "medicalHistory", label: "Medical History", type: "textarea", placeholder: "Relevant medical history and conditions" },
  { name: "notes", label: "Additional Notes", type: "textarea", placeholder: "Any additional information about the patient" }
];


export function PatientsPage() {
  // ...existing code...

  const { permissions, loading: permLoading } = useResolvedPermissions();
  const CAN_VIEW = hasPermission(permissions, 'VIEW_PATIENTS') || hasPermission(permissions, 'VIEW_PATIENT');
  const CAN_EDIT = hasPermission(permissions, 'EDIT_PATIENT');
  const CAN_ADD_QUEUE = hasPermission(permissions, 'CREATE_QUEUE');
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const patientFormRef = useRef<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);
  const editPatientFormRef = useRef<any>(null);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueForm, setQueueForm] = useState<{ visitReason: string; priority: string }>({ visitReason: '', priority: 'LOW' });
  const [queuePatientId, setQueuePatientId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const patientsQuery = usePatients(search, currentPage, pageSize);
  const createMutation = useCreatePatient(search);
  // ...existing code...
  const qc = useQueryClient();
  
  // ...existing code...
  const queueMutation = useMutation({
    mutationFn: async (payload: { patientId: number, visitReason: string, priority: QueuePriority }) => {
      return createQueueForPatient(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients', search] });
    }
  });
  const editMutation = useEditPatient(search);
  const pageData: PageResponse<PatientSummary> | undefined = patientsQuery.data as any;
  const paginatedPatients = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  if (permLoading) return <div>Loading permissions...</div>;
  if (!CAN_VIEW) {
    return <div className="alert alert-danger mt-4">You do not have permission to view patients.</div>;
  }


  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h4 mb-0">Patients</h1>
          <span className="text-muted">Search, filter, and manage patient records.</span>
        </div>
        {CAN_EDIT && <Button variant="primary" onClick={() => setShowModal(true)}>New patient</Button>}
      </div>
      <Card className="shadow-sm">
        <Card.Body className="d-flex flex-column gap-3">
          <FilterBar placeholder="Search patients" value={search} onChange={setSearch} />
          {patientsQuery.isError && (
            <Alert variant="danger" className="mb-0">Failed to load patients.</Alert>
          )}
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>DOB</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientsQuery.isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4"><Spinner animation="border" /></td>
                  </tr>
                ) : paginatedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">No patients found.</td>
                  </tr>
                ) : paginatedPatients.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => { setActivePatientId(p.id); setShowDetail(true); }}>
                    <td className="fw-semibold">{p.medicalRecordNumber}</td>
                    <td>{p.firstName} {p.lastName}</td>
                    <td>{p.phone ?? "—"}</td>
                    <td>{p.email ?? "—"}</td>
                    <td>{p.dateOfBirth ?? "—"}</td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); setActivePatientId(p.id); setShowDetail(true); }}>View</Button>
                      {CAN_EDIT && (
                        <Button size="sm" variant="outline-warning" className="ms-2" onClick={e => {
                          e.stopPropagation();
                          setActivePatientId(p.id);
                          setEditForm({ ...p });
                          setShowEditModal(true);
                        }}>Edit</Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline-success"
                        className="ms-2"
                        style={{ display: CAN_ADD_QUEUE ? undefined : 'none' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setQueuePatientId(p.id);
                          setQueueForm({ visitReason: '', priority: 'LOW' });
                          setQueueError(null);
                          setShowQueueModal(true);
                        }}
                      >
                        New Queue
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination and Info */}
          <Row className="align-items-center mt-3">
            <Col md={6}>
              <div className="text-muted small">
                {(() => {
                  const total = pageData?.totalElements ?? 0;
                  const start = total === 0 ? 0 : currentPage * pageSize + 1;
                  const end = Math.min((currentPage + 1) * pageSize, total);
                  return `Showing ${start} to ${end} of ${total} patients`;
                })()}
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0 small">Show:</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto' }}
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(0); // Reset to first page when changing page size
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="small text-muted">entries</span>
                </div>
                <Pager
                  page={currentPage}
                  size={pageSize}
                  totalElements={pageData?.totalElements ?? 0}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(0); }}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Detail modal */}
      <FormModal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        title="Patient Details"
        submitLabel={undefined}
        cancelLabel="Close"
        onSubmit={e => { e.preventDefault(); setShowDetail(false); }}
        size="lg"
        disableSubmit={false}
      >
        {(() => {
          const patient = (pageData?.content ?? []).find((pt: any) => pt.id === activePatientId);
          if (!patient) return <p className="text-muted mb-0">No patient selected.</p>;
          return (
            <div className="d-flex flex-column gap-4">
              {/* Basic Information */}
              <div className="border rounded p-3">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-person me-2"></i>Basic Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <small className="text-muted d-block">First Name</small>
                    <div className="fw-medium">{patient.firstName}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Last Name</small>
                    <div className="fw-medium">{patient.lastName}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Middle Name</small>
                    <div className="fw-medium">{patient.middleName || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Medical Record Number</small>
                    <div className="fw-medium">{patient.medicalRecordNumber}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Date of Birth</small>
                    <div className="fw-medium">{patient.dateOfBirth || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Gender</small>
                    <div className="fw-medium">{patient.gender || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">National ID</small>
                    <div className="fw-medium">{patient.nationalId || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border rounded p-3">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-telephone me-2"></i>Contact Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <small className="text-muted d-block">Primary Phone</small>
                    <div className="fw-medium">{patient.phone || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Alternate Phone</small>
                    <div className="fw-medium">{patient.alternatePhone || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Email</small>
                    <div className="fw-medium">{patient.email || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border rounded p-3">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-geo-alt me-2"></i>Address Information
                </h6>
                <div className="row g-3">
                  <div className="col-12">
                    <small className="text-muted d-block">Address</small>
                    <div className="fw-medium">{patient.address || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">City</small>
                    <div className="fw-medium">{patient.city || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">State</small>
                    <div className="fw-medium">{patient.state || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Postal Code</small>
                    <div className="fw-medium">{patient.postalCode || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Country</small>
                    <div className="fw-medium">{patient.country || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border rounded p-3">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-person-heart me-2"></i>Emergency Contact
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <small className="text-muted d-block">Name</small>
                    <div className="fw-medium">{patient.emergencyContactName || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Phone</small>
                    <div className="fw-medium">{patient.emergencyContactPhone || '—'}</div>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted d-block">Relationship</small>
                    <div className="fw-medium">{patient.emergencyContactRelationship || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="border rounded p-3">
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-heart-pulse me-2"></i>Medical Information
                </h6>
                <div className="row g-3">
                  <div className="col-12">
                    <small className="text-muted d-block">Allergies</small>
                    <div className="fw-medium">{patient.allergies || '—'}</div>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Current Medications</small>
                    <div className="fw-medium">{patient.medications || '—'}</div>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Medical History</small>
                    <div className="fw-medium">{patient.medicalHistory || '—'}</div>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Additional Notes</small>
                    <div className="fw-medium">{patient.notes || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </FormModal>

      {/* Improved patient edit modal */}
      <FormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="Edit Patient"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!editForm?.id) {
            setEditError('No patient selected');
            return;
          }
          
          // Get form data from the PatientRegistrationForm using ref
          if (!editPatientFormRef.current) {
            Swal.fire({
              title: 'Error',
              text: 'Form reference not available',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return;
          }

          const data = editPatientFormRef.current.getFormData();
          
          // Validate form using the form's validation method
          const validation = editPatientFormRef.current.validateForm();
          
          if (!validation.isValid) {
            Swal.fire({
              title: 'Validation Error',
              html: validation.errors.join('<br>'),
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return;
          }

          setEditError(null);
          editMutation.mutate({ ...data, id: editForm.id }, {
            onSuccess: () => {
              setShowEditModal(false);
              Swal.fire({ icon: 'success', title: 'Patient updated', timer: 1800, showConfirmButton: false });
            },
            onError: (err: any) => {
              // Handle backend validation errors
              const errorMessages = err?.response?.data?.errors || [];
              if (errorMessages.length > 0) {
                const uniqueErrors = [...new Set(errorMessages.map((error: any) => error.message))];
                setEditError(uniqueErrors.join('<br>'));
              } else {
                setEditError(err?.message || 'Failed to update patient');
              }
            }
          });
        }}
        size="xl"
        submitLabel="Update Patient"
        cancelLabel="Cancel"
        isSubmitting={editMutation.isPending}
        error={editError}
      >
        <PatientRegistrationForm
          ref={editPatientFormRef}
          onCancel={() => setShowEditModal(false)}
          loading={editMutation.isPending}
          error={editError}
          initialData={editForm}
          isModal={true}
        />
      </FormModal>

      {/* New queue record modal */}
      <FormModal
        show={showQueueModal}
        onHide={() => setShowQueueModal(false)}
        title="New Queue Record"
        onSubmit={async (e) => {
          e.preventDefault();
          setQueueError(null);
          if (!queueForm.visitReason.trim()) {
            setQueueError('Visit reason is required');
            return;
          }
          if (!queuePatientId) {
            setQueueError('No patient selected');
            return;
          }
          queueMutation.mutate({
            patientId: queuePatientId,
            visitReason: queueForm.visitReason,
            priority: queueForm.priority as QueuePriority
          }, {
            onSuccess: () => {
              setShowQueueModal(false);
              Swal.fire({ icon: 'success', title: 'Queue record created', timer: 1800, showConfirmButton: false });
            },
            onError: (err: any) => {
              setQueueError(err?.message || 'Failed to create queue record');
            }
          });
        }}
        size="sm"
        isSubmitting={queueMutation.isPending}
        submitLabel="Create"
        cancelLabel="Cancel"
        disableSubmit={queueMutation.isPending || !queueForm.visitReason.trim()}
      >
        {/* Show patient name if available */}
        {queuePatientId && patientsQuery.data && (
          (() => {
            const patient = (pageData?.content ?? []).find((p: any) => p.id === queuePatientId);
            if (!patient) return null;
            return (
              <div className="bg-light rounded p-2 mb-2">
                <div className="fw-semibold">{patient.firstName} {patient.lastName}</div>
                <div className="text-muted small">MRN: {patient.medicalRecordNumber}</div>
              </div>
            );
          })()
        )}
        {queueError && <Alert variant="danger">{queueError}</Alert>}
        <Form.Group className="mb-2">
          <Form.Label>Visit Reason</Form.Label>
          <Form.Control as="textarea" rows={3} value={queueForm.visitReason} onChange={e => setQueueForm({ ...queueForm, visitReason: e.target.value })} required autoFocus />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Priority</Form.Label>
          <Form.Select value={queueForm.priority} onChange={e => setQueueForm({ ...queueForm, priority: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Form.Select>
        </Form.Group>
      </FormModal>

      {/* Improved patient registration modal */}
      <FormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Register New Patient"
        onSubmit={async (e) => {
          e.preventDefault();
          
          // Get form data from the PatientRegistrationForm using ref
          if (!patientFormRef.current) {
            Swal.fire({
              title: 'Error',
              text: 'Form reference not available',
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return;
          }

          // Get form data with MRN auto-generation confirmation
          let payload;
          try {
            payload = await patientFormRef.current.getFormData();
          } catch (error) {
            // User cancelled MRN generation
            return;
          }
          
          // Validate form using the form's validation method
          const validation = patientFormRef.current.validateForm();
          
          if (!validation.isValid) {
            Swal.fire({
              title: 'Validation Error',
              html: validation.errors.join('<br>'),
              icon: 'error',
              confirmButtonText: 'OK'
            });
            return;
          }

          createMutation.mutate(payload, {
            onSuccess: () => {
              setShowModal(false);
              Swal.fire({
                title: 'Patient created',
                text: `MRN: ${payload.medicalRecordNumber}`,
                icon: 'success',
                timer: 2500,
                showConfirmButton: false
              });
            },
            onError: (error: any) => {
              // Handle backend validation errors
              const errorMessages = error?.response?.data?.errors || [];
              if (errorMessages.length > 0) {
                const uniqueErrors = [...new Set(errorMessages.map((err: any) => err.message))];
                Swal.fire({
                  title: 'Validation Error',
                  html: uniqueErrors.join('<br>'),
                  icon: 'error',
                  confirmButtonText: 'OK'
                });
              } else {
                Swal.fire({
                  title: 'Error',
                  text: error?.message || 'Failed to create patient',
                  icon: 'error',
                  confirmButtonText: 'OK'
                });
              }
            }
          });
        }}
        size="xl"
        submitLabel="Create Patient"
        cancelLabel="Cancel"
        isSubmitting={createMutation.isPending}
        error={createMutation.isError ? (createMutation.error as any)?.message ?? "Failed to create patient" : null}
      >
        <PatientRegistrationForm
          ref={patientFormRef}
          onCancel={() => setShowModal(false)}
          loading={createMutation.isPending}
          error={createMutation.isError ? (createMutation.error as any)?.message ?? "Failed to create patient" : null}
          isModal={true}
        />
      </FormModal>
    </div>
  );
}
