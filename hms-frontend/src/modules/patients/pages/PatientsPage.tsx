import { useState, useMemo } from "react";
import { Button, Card, Table, Form, Alert, Spinner } from "react-bootstrap";
import { FormModal } from "../../../components/shared/FormModal";
import { FilterBar } from "../../../components/shared/FilterBar";
import { DynamicForm, type DynamicField } from "../../../components/forms/DynamicForm";
import { useCreatePatient, usePatients } from "../../../services/patientApi";
import Swal from 'sweetalert2';
import { generateRandomMrn } from '../../../utils/mrn';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';
import { createQueueForPatient, fetchPatientQueue } from '../../../services/patientQueueApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueuePriority } from '../../../types/queue';
import { useEditPatient } from '../../../services/useEditPatient';

const patientFields: DynamicField[] = [
  { name: "medicalRecordNumber", label: "MRN", type: "text", required: false, placeholder: "Leave blank to auto-generate" },
  { name: "firstName", label: "First name", type: "text", required: true },
  { name: "lastName", label: "Last name", type: "text", required: true },
  { name: "phone", label: "Phone", type: "text", placeholder: "+254..." },
  { name: "email", label: "Email", type: "text" },
  { name: "dateOfBirth", label: "Date of birth", type: "date" },
  { name: "nationalId", label: "National ID", type: "text" },
  { name: "gender", label: "Gender", type: "select", options: [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "other", label: "Other" }
  ]},
  { name: "visitReason", label: "Visit reason", type: "textarea" },
  { name: "priority", label: "Priority", type: "select", options: [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ]}
];


export function PatientsPage() {
  // ...existing code...

  const { permissions, loading: permLoading } = useResolvedPermissions();
  const CAN_VIEW = hasPermission(permissions, 'VIEW_PATIENTS') || hasPermission(permissions, 'VIEW_PATIENT');
  const CAN_EDIT = hasPermission(permissions, 'EDIT_PATIENT');
  const CAN_ADD_QUEUE = hasPermission(permissions, 'CREATE_QUEUE');
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueForm, setQueueForm] = useState<{ visitReason: string; priority: string }>({ visitReason: '', priority: 'LOW' });
  const [queuePatientId, setQueuePatientId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const patientsQuery = usePatients(search);
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
  const patients = patientsQuery.data ?? [];
  const filtered = useMemo(() => {
    if (!search) return patients;
    const lower = search.toLowerCase();
    return patients.filter(p => [p.medicalRecordNumber, p.firstName + " " + p.lastName, p.phone, p.email]
      .filter(Boolean)
      .some(v => v!.toLowerCase().includes(lower)));
  }, [patients, search]);

  if (permLoading) return <div>Loading permissions...</div>;
  if (!CAN_VIEW) {
    return <div className="alert alert-danger mt-4">You do not have permission to view patients.</div>;
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: any = {};
    patientFields.forEach(f => {
      const raw = formData.get(f.name);
      if (raw && raw.toString().trim()) payload[f.name] = raw.toString().trim();
    });

    // If MRN missing, confirm auto-generation
    if (!payload.medicalRecordNumber) {
      const result = await Swal.fire({
        title: 'Generate MRN?',
        text: 'No MRN was entered. A random Medical Record Number will be assigned to this patient.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, generate',
        cancelButtonText: 'Cancel',
        focusCancel: true
      });
      if (!result.isConfirmed) return; // abort submission
      payload.medicalRecordNumber = generateRandomMrn('MRN');
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        setShowModal(false);
        Swal.fire({
          title: 'Patient created',
            text: `MRN: ${payload.medicalRecordNumber}`,
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
        });
      }
    });
  };

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
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">No patients found.</td>
                  </tr>
                ) : filtered.map(p => (
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
          const patient = patients.find(pt => pt.id === activePatientId);
          if (!patient) return <p className="text-muted mb-0">No patient selected.</p>;
          return (
            <div className="d-flex flex-column gap-3">
              <div><strong>{patient.firstName} {patient.lastName}</strong></div>
              <div className="row g-3">
                <div className="col-md-4"><small className="text-muted d-block">MRN</small>{patient.medicalRecordNumber}</div>
                <div className="col-md-4"><small className="text-muted d-block">Phone</small>{patient.phone || '—'}</div>
                <div className="col-md-4"><small className="text-muted d-block">Email</small>{patient.email || '—'}</div>
                <div className="col-md-4"><small className="text-muted d-block">DOB</small>{patient.dateOfBirth || '—'}</div>
              </div>
            </div>
          );
        })()}
      </FormModal>

      {/* Edit patient modal */}
      <FormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        title="Edit patient"
        onSubmit={async (e) => {
          e.preventDefault();
          setEditError(null);
          if (!editForm?.id) {
            setEditError('No patient selected');
            return;
          }
          editMutation.mutate(editForm, {
            onSuccess: () => {
              setShowEditModal(false);
              Swal.fire({ icon: 'success', title: 'Patient updated', timer: 1800, showConfirmButton: false });
            },
            onError: (err: any) => {
              setEditError(err?.message || 'Failed to update patient');
            }
          });
        }}
        size="lg"
        isSubmitting={editMutation.isPending}
        submitLabel="Save"
        cancelLabel="Cancel"
        disableSubmit={editMutation.isPending || !editForm?.firstName || !editForm?.lastName}
      >
        {editError && <Alert variant="danger">{editError}</Alert>}
        {editForm && (
          <>
            <Form.Group className="mb-2">
              <Form.Label>First name</Form.Label>
              <Form.Control value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last name</Form.Label>
              <Form.Control value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Date of birth</Form.Label>
              <Form.Control type="date" value={editForm.dateOfBirth || ''} onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>National ID</Form.Label>
              <Form.Control value={editForm.nationalId || ''} onChange={e => setEditForm({ ...editForm, nationalId: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Gender</Form.Label>
              <Form.Select value={editForm.gender || ''} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </>
        )}
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
            const patient = patientsQuery.data.find((p: any) => p.id === queuePatientId);
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

      {/* Existing new patient modal */}
      <FormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Register new patient"
        onSubmit={handleCreate}
        size="lg"
        isSubmitting={createMutation.isPending}
  submitLabel={createMutation.isPending ? "Creating..." : "Create"}
        cancelLabel="Cancel"
        disableSubmit={createMutation.isPending}
      >
        {createMutation.isError && (
          <Alert variant="danger" className="mb-0">
            {(createMutation.error as any)?.message ?? "Failed to create patient"}
          </Alert>
        )}
        <DynamicForm fields={patientFields} disabled={createMutation.isPending} />
      </FormModal>
    </div>
  );
}
