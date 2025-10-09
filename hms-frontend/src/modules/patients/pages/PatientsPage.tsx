import { useState, useMemo } from "react";
import { Button, Card, Modal, Table, Form, Alert, Spinner } from "react-bootstrap";
import { FilterBar } from "../../../components/shared/FilterBar";
import { DynamicForm, type DynamicField } from "../../../components/forms/DynamicForm";
import { useCreatePatient, usePatients } from "../../../services/patientApi";
import Swal from 'sweetalert2';
import { generateRandomMrn } from '../../../utils/mrn';

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
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activePatientId, setActivePatientId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const patientsQuery = usePatients(search);
  const createMutation = useCreatePatient(search);

  const patients = patientsQuery.data ?? [];
  const filtered = useMemo(() => {
    if (!search) return patients;
    const lower = search.toLowerCase();
    return patients.filter(p => [p.medicalRecordNumber, p.firstName + " " + p.lastName, p.phone, p.email]
      .filter(Boolean)
      .some(v => v!.toLowerCase().includes(lower)));
  }, [patients, search]);

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
        <Button variant="primary" onClick={() => setShowModal(true)}>New patient</Button>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Detail modal */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Patient Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                  {/* priority / visitReason not part of PatientSummary list shape; omit or fetch full detail later */}
                </div>
              </div>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetail(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Form onSubmit={handleCreate} noValidate>
          <Modal.Header closeButton>
            <Modal.Title>Register new patient</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-3">
            {createMutation.isError && (
              <Alert variant="danger" className="mb-0">
                {(createMutation.error as any)?.message ?? "Failed to create patient"}
              </Alert>
            )}
            <DynamicForm fields={patientFields} disabled={createMutation.isPending} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={createMutation.isPending}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Spinner size="sm" animation="border" /> : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
