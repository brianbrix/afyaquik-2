import React, { useMemo, useState } from 'react';
import { Card, Table, Button, Row, Col, Form, Spinner, Modal, Badge } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { searchPatients } from '../../../services/patientApi';
import { apiClient } from '../../../services/apiClient';

export const AdminPatientsPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: patientsPage, isLoading: patientsLoading } = useQuery({
    queryKey: ['admin-patients', q],
    queryFn: () => searchPatients(q || '', 0, 100).then(p => (p as any)?.content ?? [])
  });

  const { data: queueItems = [], isLoading: queueLoading } = useQuery({
    queryKey: ['admin-patient-queue-items'],
    queryFn: () => apiClient.get('/queue/items').then(res => {
      const data = res?.data?.data; if (!data) return [] as any[]; if (Array.isArray(data)) return data; if (Array.isArray(data.content)) return data.content; return [] as any[];
    })
  });

  const visitsByPatientId = useMemo(() => {
    const map = new Map<number, any[]>();
    (Array.isArray(queueItems) ? queueItems : []).forEach((qi: any) => {
      const list = map.get(qi.patientId) || [];
      list.push(qi);
      map.set(qi.patientId, list);
    });
    return map;
  }, [queueItems]);

  return (
    <div>
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={6}><h5 className="mb-0">Patients</h5></Col>
            <Col md={6} className="text-end">
              <Form.Control placeholder="Search patients..." value={q} onChange={e=>setQ(e.target.value)} />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {(patientsLoading || queueLoading) && (
            <div className="text-center py-4"><Spinner animation="border" size="sm"/></div>
          )}
          <div className="table-responsive">
            <Table hover size="sm">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>Phone</th>
                  <th>Visits</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(patientsPage) ? patientsPage : []).map((p: any) => {
                  const visits = visitsByPatientId.get(p.id) || [];
                  return (
                    <tr key={p.id}>
                      <td><code>{p.medicalRecordNumber}</code></td>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '-'}</td>
                      <td>{p.phone || '-'}</td>
                      <td><Badge bg={visits.length ? 'primary' : 'secondary'}>{visits.length}</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" onClick={() => { setSelectedPatient({ patient: p, visits }); setShowHistory(true); }}>View History</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showHistory} onHide={() => setShowHistory(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Patient Visit History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient ? (
            <>
              <div className="mb-3">
                <strong>{selectedPatient.patient.firstName} {selectedPatient.patient.lastName}</strong>
                <div className="text-muted small">MRN: {selectedPatient.patient.medicalRecordNumber}</div>
              </div>
              {selectedPatient.visits.length === 0 ? (
                <div className="text-muted">No visits found.</div>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Department</th>
                        <th>Doctor</th>
                        <th>Queue ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatient.visits
                        .slice()
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((v: any) => (
                        <tr key={v.id}>
                          <td>{new Date(v.createdAt).toLocaleString()}</td>
                          <td>{v.status}</td>
                          <td>{v.department || 'General'}</td>
                          <td>{v.assignedTo || 'Unassigned'}</td>
                          <td><code>{v.id}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <div className="text-muted">No patient selected.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPatientsPage;

