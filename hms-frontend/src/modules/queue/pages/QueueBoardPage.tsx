import React, { useMemo, useState, useEffect } from "react";
import { InsuranceDetailsForm, InsuranceFormData } from "../../../components/registration/InsuranceDetailsForm";
import Swal from "sweetalert2";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table
} from "react-bootstrap";
import { PageHeader } from "../../../components/shared/PageHeader";
import { FilterBar } from "../../../components/shared/FilterBar";
import { useAssignQueueItem, useQueueList, useQueueTimeline, useTransitionQueueItem, useQueueStream, useAdvanceAssignQueueItem } from "../hooks/useQueueBoardData";
import type {
  QueueAssignmentPayload,
  QueueStatus,
  QueueSummary,
  QueueTimelineEntry
} from "../../../types/queue";
import { useRoleContext } from "../../../hooks/useRoleContext";
import { useAuth } from "../../../hooks/useAuth";
import { useStaffDirectory } from '../../../services/staffDirectoryApi';
import { apiClient } from "../../../services/apiClient";
import { savePatientInsuranceDetails, fetchAllPatientInsuranceDetails, deletePatientInsuranceDetails } from "../../../services/insuranceApi";
import RichTextEditor from '../../../components/shared/RichTextEditor';
import { FormModal } from '../../../components/shared/FormModal';
import { updateQueueItem } from "../../../services/queueApi";
// --- Temporary static option sources (TODO: replace with backend directory endpoints) ---
interface StaffDirectoryEntry { id: number; username: string; displayName: string; roles: string[]; departments: string[] }
// NOTE: Directory now fetched from backend; fallback arrays removed.

const statusLabels: Record<QueueStatus, string> = {
  PENDING_CHECKIN: "Pre Check-In",
  IN_REGISTRATION: "Registration",
  WAITING_TRIAGE: "Waiting Triage",
  IN_TRIAGE: "In Triage",
  WAITING_PROVIDER: "Waiting Provider",
  IN_CONSULT: "In Consult",
  WAITING_DIAGNOSTICS: "Waiting Diagnostics",
  IN_DIAGNOSTICS: "In Diagnostics",
  WAITING_PHARMACY: "Waiting Pharmacy",
  IN_PHARMACY: "In Pharmacy",
  WAITING_BILLING: "Waiting Billing",
  IN_BILLING: "In Billing",
  BLOCKED: "Blocked",
  NO_SHOW: "No Show",
  CANCELLED: "Cancelled",
  CLOSED: "Closed"
};

const statusOptions: QueueStatus[] = [
  "PENDING_CHECKIN",
  "IN_REGISTRATION",
  "WAITING_TRIAGE",
  "IN_TRIAGE",
  "WAITING_PROVIDER",
  "IN_CONSULT",
  "WAITING_DIAGNOSTICS",
  "IN_DIAGNOSTICS",
  "WAITING_PHARMACY",
  "IN_PHARMACY",
  "WAITING_BILLING",
  "IN_BILLING",
  "BLOCKED",
  "NO_SHOW",
  "CANCELLED",
  "CLOSED"
];

const allowedTransitions: Partial<Record<QueueStatus, QueueStatus[]>> = {
  PENDING_CHECKIN: ["IN_REGISTRATION", "CANCELLED", "NO_SHOW"],
  IN_REGISTRATION: ["WAITING_TRIAGE", "BLOCKED"],
  WAITING_TRIAGE: ["IN_TRIAGE", "IN_REGISTRATION"],
  IN_TRIAGE: ["WAITING_PROVIDER", "BLOCKED"],
  WAITING_PROVIDER: ["IN_CONSULT", "IN_TRIAGE", "BLOCKED"],
  IN_CONSULT: [
    "WAITING_DIAGNOSTICS",
    "WAITING_PHARMACY",
    "WAITING_BILLING",
    "CLOSED",
    "BLOCKED"
  ],
  WAITING_DIAGNOSTICS: ["IN_DIAGNOSTICS", "WAITING_PROVIDER"],
  IN_DIAGNOSTICS: ["WAITING_PROVIDER", "BLOCKED"],
  WAITING_PHARMACY: ["IN_PHARMACY", "WAITING_PROVIDER"],
  IN_PHARMACY: ["WAITING_BILLING", "WAITING_PROVIDER"],
  WAITING_BILLING: ["IN_BILLING", "CLOSED", "BLOCKED"],
  IN_BILLING: ["CLOSED", "WAITING_PROVIDER"],
  BLOCKED: [
    "IN_REGISTRATION",
    "WAITING_TRIAGE",
    "WAITING_PROVIDER",
    "WAITING_BILLING"
  ],
  CLOSED: ["IN_BILLING", "IN_CONSULT"]
};

function formatDateTime(timestamp?: string | null) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function priorityVariant(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return "danger";
    case "HIGH":
      return "warning";
    case "LOW":
      return "secondary";
    default:
      return "info";
  }
}

function QueueStatusBadge({ status }: { status: QueueStatus }) {
  const variant =
    status === "BLOCKED"
      ? "dark"
      : status === "CLOSED"
        ? "success"
        : status.includes("WAITING")
          ? "warning"
          : "primary";
  return <Badge bg={variant}>{statusLabels[status] ?? status}</Badge>;
}

export function QueueBoardPage() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<QueueStatus>("PENDING_CHECKIN");
  const [searchValue, setSearchValue] = useState("");
  const [activeItem, setActiveItem] = useState<QueueSummary | null>(null);
  const [modalType, setModalType] = useState<"assign" | "transition" | "timeline" | "advanceAssign" | null>(null);
  const [staleWarning, setStaleWarning] = useState<string | null>(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceFormData, setInsuranceFormData] = useState<InsuranceFormData | undefined>(undefined);

  const { activeRole } = useRoleContext();
  const queueQuery = useQueueList(selectedStatus);
  useQueueStream(selectedStatus);
  const assignMutation = useAssignQueueItem(selectedStatus);
  const transitionMutation = useTransitionQueueItem(selectedStatus);
  const advanceAssignMutation = useAdvanceAssignQueueItem(selectedStatus);
  const timelineQuery = useQueueTimeline(
    modalType === "timeline" && activeItem ? activeItem.id : null
  );

  // Refetch queue list whenever the authenticated user changes
  React.useEffect(() => {
    if (user) {
      queueQuery.refetch();
    }
  }, [user]);

  const filteredItems = useMemo(() => {
    const items = Array.isArray(queueQuery.data) ? queueQuery.data : [];
    if (!searchValue) return items;
    const lower = searchValue.trim().toLowerCase();
    return items.filter((item) =>
      [item.ticketNumber, item.patientName, item.visitReason]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(lower))
    );
  }, [queueQuery.data, searchValue]);

  const handleOpenModal = (item: QueueSummary, type: "assign" | "transition" | "timeline" | "advanceAssign") => {
    setActiveItem(item);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setActiveItem(null);
  };

  const handleAssignSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeItem) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const assigneeId = formData.get("assigneeId")?.toString().trim() ?? "";
    if (!assigneeId) {
      return;
    }
    const payload: QueueAssignmentPayload = {
      assigneeId,
      assigneeDisplayName: formData.get("assigneeDisplayName")?.toString().trim() || undefined,
      assigneeRole: formData.get("assigneeRole")?.toString().trim() || activeRole,
      departmentId: formData.get("departmentId")?.toString().trim() || activeItem.departmentId || undefined,
      note: formData.get("note")?.toString().trim() || undefined
    };
    assignMutation.mutate(
      { queueItemId: activeItem.id, payload },
      {
        onSuccess: () => {
          form.reset();
          handleCloseModal();
        }
      }
    );
  };

  const handleTransitionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeItem) return;
    const formData = new FormData(event.currentTarget);
    const targetStatus = formData.get("targetStatus")?.toString() as QueueStatus | undefined;
    if (!targetStatus) return;
    const payload = {
      targetStatus,
      actorId: formData.get("actorId")?.toString().trim() || undefined,
      actorRole: formData.get("actorRole")?.toString().trim() || activeRole,
      actorDisplayName: formData.get("actorDisplayName")?.toString().trim() || undefined,
      departmentId: formData.get("departmentId")?.toString().trim() || activeItem.departmentId || undefined,
      note: formData.get("note")?.toString().trim() || undefined
    };

    // Pre-submit stale status check
    const latest = queueQuery.data?.find(i => i.id === activeItem.id);
    if (latest && latest.status !== activeItem.status) {
      setStaleWarning(`Item moved from ${statusLabels[activeItem.status]} to ${statusLabels[latest.status]}. Refreshing view.`);
      handleCloseModal();
      queueQuery.refetch();
      return;
    }

    transitionMutation.mutate(
      { queueItemId: activeItem.id, payload },
      {
        onSuccess: () => {
          event.currentTarget.reset();
          handleCloseModal();
        }
      }
    );
  };

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Queue overview"
        subtitle="Monitor patient progression, reassign work, and action status transitions in real-time."
      />
      <Card className="shadow-sm border-0">
        <Card.Body className="d-flex flex-column gap-3">
          <Row className="g-3 align-items-center">
            <Col md={4} sm={12}>
              <Form.Select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as QueueStatus)}
                aria-label="Queue status filter"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={5} sm={12}>
              <FilterBar placeholder="Search ticket, name, or reason..." value={searchValue} onChange={setSearchValue} />
            </Col>
            <Col md={3} sm={12} className="d-flex justify-content-end">
              <Button variant="outline-secondary" onClick={() => queueQuery.refetch()}>
                Refresh
              </Button>
            </Col>
          </Row>

          {queueQuery.isError && (
            <Alert variant="danger">Unable to load queue items. Please try again.</Alert>
          )}

          {staleWarning && <Alert variant="warning" onClose={() => setStaleWarning(null)} dismissible>{staleWarning}</Alert>}

          <div className="table-responsive">
            <Table hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Department</th>
                  <th>Created</th>
                  <th>SLA Due</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queueQuery.isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">
                      <Spinner animation="border" role="status" />
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-muted">
                      No queue items for this status.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td className="fw-semibold">{item.ticketNumber}</td>
                        <td>{item.patientName}</td>
                        <td>{item.visitReason}</td>
                        <td><QueueStatusBadge status={item.status} /></td>
                        <td><Badge bg={priorityVariant(item.priority)}>{item.priority}</Badge></td>
                        <td>{item.currentAssigneeId || "Unassigned"}</td>
                        <td>{item.departmentId ?? "—"}</td>
                        <td>{formatDateTime(item.createdAt)}</td>
                        <td>{formatDateTime(item.slaDueAt)}</td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            {item.status === 'PENDING_CHECKIN' ? (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleOpenModal(item, 'advanceAssign')}
                              >
                                Advance & Assign
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleOpenModal(item, 'assign')}
                              >
                                Assign
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleOpenModal(item, 'transition')}
                            >
                              Transition
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => handleOpenModal(item, 'timeline')}
                            >
                              Timeline
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {/* Expandable section for IN_REGISTRATION actions */}
                      {item.status === 'IN_REGISTRATION' && (
                        <tr>
                          <td colSpan={10} className="bg-light">
                            <details open>
                              <summary className="fw-semibold">Registration Actions: Insurance & Additional Details</summary>
                              <div className="mt-3">
                                {/* Fetch and show current insurance details */}
                                <InsuranceDetailsSection patientId={item.patientId} queueItemId={item.id} />
              
                              </div>
                            </details>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <AssignModal
        show={modalType === "assign" && Boolean(activeItem)}
        onHide={handleCloseModal}
        queueItem={activeItem}
        isSubmitting={assignMutation.isPending}
        error={assignMutation.isError ? assignMutation.error?.message ?? "Failed to assign" : null}
        onSubmit={handleAssignSubmit}
      />

      <TransitionModal
        show={modalType === "transition" && Boolean(activeItem)}
        onHide={handleCloseModal}
        queueItem={activeItem}
        isSubmitting={transitionMutation.isPending}
        error={
          transitionMutation.isError ? transitionMutation.error?.message ?? "Failed to transition" : null
        }
        onSubmit={handleTransitionSubmit}
      />

      <TimelineModal
        show={modalType === "timeline" && Boolean(activeItem)}
        onHide={handleCloseModal}
        queueItem={activeItem}
        timelineEntries={timelineQuery.data ?? []}
        isLoading={timelineQuery.isLoading}
      />

      <AdvanceAssignModal
        show={modalType === 'advanceAssign' && Boolean(activeItem)}
        onHide={handleCloseModal}
        queueItem={activeItem}
        isSubmitting={advanceAssignMutation.isPending}
        error={advanceAssignMutation.isError ? (advanceAssignMutation.error as any)?.message ?? 'Failed' : null}
        onSubmit={(e) => {
          e.preventDefault();
          if (!activeItem) return;
          const formData = new FormData(e.currentTarget as HTMLFormElement);
          const targetStatus = formData.get('targetStatus')?.toString();
          const assigneeId = formData.get('assigneeId')?.toString();
          if (!targetStatus || !assigneeId) return;
          const payload: any = {
            targetStatus,
            assigneeId,
            assigneeRole: formData.get('assigneeRole')?.toString() || undefined,
            assigneeDisplayName: formData.get('assigneeDisplayName')?.toString() || undefined,
            departmentId: formData.get('departmentId')?.toString() || undefined,
            note: formData.get('note')?.toString() || undefined,
          };
          advanceAssignMutation.mutate({ queueItemId: activeItem.id, payload }, { onSuccess: () => { (e.currentTarget as HTMLFormElement).reset(); handleCloseModal(); } });
        }}
      />
    </div>
  );
}


function AssignModal({
  show,
  onHide,
  queueItem,
  isSubmitting,
  error,
  onSubmit
}: { show: boolean; onHide: () => void; queueItem: QueueSummary | null; isSubmitting: boolean; error: string | null; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; }) {
  const staffQueryResult = useStaffDirectory(show);
  const staffData: StaffDirectoryEntry[] = staffQueryResult.data || [];
  const [staffQuery, setStaffQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffDirectoryEntry | null>(null);
  const [roleQuery, setRoleQuery] = useState("");
  const [deptQuery, setDeptQuery] = useState("");
  const { user } = useAuth();

  // Always pre-select current user and their primary role when modal opens
  React.useEffect(() => {
    if (show && user) {
      const staff = staffData.find(s => s.username === user.username);
      if (staff) {
        setSelectedStaff(staff);
        setStaffQuery(staff.displayName);
        setRoleQuery(staff.roles[0] || '');
        setDeptQuery(staff.departments[0] || '');
      }
    } else if (!show) {
      setSelectedStaff(null);
      setStaffQuery("");
      setRoleQuery("");
      setDeptQuery("");
    }
  }, [show, user, staffData]);

  const staffFiltered = useMemo(() => {
    const q = staffQuery.toLowerCase();
    return staffData.filter(s => s.username.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q));
  }, [staffQuery, staffData]);
  const roleOptions = selectedStaff ? selectedStaff.roles : Array.from(new Set(staffData.flatMap(s => s.roles)));
  const deptOptions = selectedStaff ? selectedStaff.departments : Array.from(new Set(staffData.flatMap(s => s.departments)));
  const roleFiltered = useMemo(() => roleOptions.filter(r => r.toLowerCase().includes(roleQuery.toLowerCase())), [roleOptions, roleQuery]);
  const deptFiltered = useMemo(() => deptOptions.filter(d => d.toLowerCase().includes(deptQuery.toLowerCase())), [deptOptions, deptQuery]);

  return (
    <Modal show={show} onHide={() => { onHide(); setSelectedStaff(null); setStaffQuery(""); }} centered>
      <Form onSubmit={e => { onSubmit(e); }}>
        <Modal.Header closeButton>
          <Modal.Title>Assign queue item</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          {queueItem && (
            <div className="bg-light rounded p-3">
              <div className="fw-semibold">{queueItem.ticketNumber}</div>
              <small className="text-muted">{queueItem.patientName}</small>
              <div className="text-muted small">{queueItem.visitReason}</div>
            </div>
          )}
          {error && <Alert variant="danger" className="mb-0">{error}</Alert>}

          <Form.Group>
            <Form.Label>Assignee</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search staff..."
              value={staffQuery}
              disabled={isSubmitting}
              onChange={(e) => { setStaffQuery(e.target.value); setSelectedStaff(null); }}
            />
            <div className="border rounded mt-1" style={{ maxHeight: 140, overflowY: 'auto' }}>
              {staffFiltered.map(s => (
                <div key={s.id} className={`px-2 py-1 selectable-item${selectedStaff?.id===s.id? ' bg-light':''}`} style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedStaff(s); setStaffQuery(s.displayName); setRoleQuery(s.roles[0] || ''); setDeptQuery(s.departments[0] || ''); }}>
                  <strong>{s.displayName}</strong> <span className="text-muted small">({s.username})</span>
                </div>
              ))}
              {staffFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
            </div>
              <input type="hidden" name="assigneeId" value={selectedStaff?.username || ''} required />
            <input type="hidden" name="assigneeDisplayName" value={selectedStaff?.displayName || ''} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              placeholder={selectedStaff ? `Filter (${selectedStaff.roles.join(', ')})` : 'Search role...'}
              value={roleQuery}
              disabled={isSubmitting || !!selectedStaff}
              onChange={(e) => setRoleQuery(e.target.value)}
            />
            {!selectedStaff && (
              <div className="border rounded mt-1" style={{ maxHeight: 110, overflowY: 'auto' }}>
                {roleFiltered.map(r => (
                  <div key={r} className="px-2 py-1 selectable-item" style={{ cursor: 'pointer' }} onClick={() => setRoleQuery(r)}>{r}</div>
                ))}
                {roleFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
              </div>
            )}
            <input type="hidden" name="assigneeRole" value={roleQuery || (selectedStaff?.roles[0] || '')} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              placeholder={selectedStaff ? `Filter (${selectedStaff.departments.join(', ')})` : 'Search department...'}
              value={deptQuery}
              disabled={isSubmitting || !!selectedStaff}
              onChange={(e) => setDeptQuery(e.target.value)}
            />
            {!selectedStaff && (
              <div className="border rounded mt-1" style={{ maxHeight: 110, overflowY: 'auto' }}>
                {deptFiltered.map(d => (
                  <div key={d} className="px-2 py-1 selectable-item" style={{ cursor: 'pointer' }} onClick={() => setDeptQuery(d)}>{d}</div>
                ))}
                {deptFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
              </div>
            )}
            <input type="hidden" name="departmentId" value={deptQuery || (selectedStaff?.departments[0] || queueItem?.departmentId || '')} />
          </Form.Group>

          <Form.Group controlId="note">
            <Form.Label>Note</Form.Label>
            <Form.Control as="textarea" name="note" rows={3} placeholder="Optional handoff note" disabled={isSubmitting} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || !selectedStaff}>{isSubmitting ? <Spinner animation="border" size="sm" /> : "Assign"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function TransitionModal({
  show,
  onHide,
  queueItem,
  isSubmitting,
  error,
  onSubmit
}: { show: boolean; onHide: () => void; queueItem: QueueSummary | null; isSubmitting: boolean; error: string | null; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; }) {
  const nextStatuses = queueItem ? allowedTransitions[queueItem.status] ?? [] : [];
  const staffQueryResult = useStaffDirectory(show);
  const staffData: StaffDirectoryEntry[] = staffQueryResult.data || [];
  const [actorQuery, setActorQuery] = useState("");
  const [selectedActor, setSelectedActor] = useState<StaffDirectoryEntry | null>(null);
  const [roleQuery, setRoleQuery] = useState("");
  const [deptQuery, setDeptQuery] = useState("");
  const { user } = useAuth();

  // Always pre-select current user and their primary role when modal opens
  React.useEffect(() => {
    if (show && user) {
      const staff = staffData.find(s => s.username === user.username);
      if (staff) {
        setSelectedActor(staff);
        setActorQuery(staff.displayName);
        setRoleQuery(staff.roles[0] || '');
        setDeptQuery(staff.departments[0] || '');
      }
    } else if (!show) {
      setSelectedActor(null);
      setActorQuery("");
      setRoleQuery("");
      setDeptQuery("");
    }
  }, [show, user, staffData]);

  const staffFiltered = useMemo(() => {
    const q = actorQuery.toLowerCase();
    return staffData.filter(s => s.username.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q));
  }, [actorQuery, staffData]);
  const roleOptions = selectedActor ? selectedActor.roles : Array.from(new Set(staffData.flatMap(s => s.roles)));
  const deptOptions = selectedActor ? selectedActor.departments : Array.from(new Set(staffData.flatMap(s => s.departments)));
  const roleFiltered = useMemo(() => roleOptions.filter(r => r.toLowerCase().includes(roleQuery.toLowerCase())), [roleOptions, roleQuery]);
  const deptFiltered = useMemo(() => deptOptions.filter(d => d.toLowerCase().includes(deptQuery.toLowerCase())), [deptOptions, deptQuery]);

  return (
    <Modal show={show} onHide={() => { onHide(); setSelectedActor(null); setActorQuery(""); }} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Transition queue item</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          {queueItem && (
            <div className="bg-light rounded p-3">
              <div className="fw-semibold">{queueItem.ticketNumber}</div>
              <div className="text-muted small">Current: {statusLabels[queueItem.status]}</div>
            </div>
          )}
          {nextStatuses.length === 0 ? (
            <Alert variant="warning" className="mb-0">
              No configured transitions for this status.
            </Alert>
          ) : (
            <>
              {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
              <Form.Group controlId="targetStatus">
                <Form.Label>Next status</Form.Label>
                <Form.Select
                  name="targetStatus"
                  defaultValue={nextStatuses[0] ?? ""}
                  key={queueItem?.id ?? "transition"}
                  disabled={isSubmitting}
                  required
                >
                  {nextStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status as QueueStatus]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Actor</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search staff..."
                  value={actorQuery}
                  disabled={isSubmitting}
                  onChange={(e) => { setActorQuery(e.target.value); setSelectedActor(null); }}
                />
                <div className="border rounded mt-1" style={{ maxHeight: 110, overflowY: 'auto' }}>
                  {staffFiltered.map(s => (
                    <div key={s.id} className={`px-2 py-1 selectable-item${selectedActor?.id===s.id? ' bg-light':''}`} style={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedActor(s); setActorQuery(s.displayName); setRoleQuery(s.roles[0]||''); setDeptQuery(s.departments[0]||''); }}>
                      <strong>{s.displayName}</strong> <span className="text-muted small">({s.username})</span>
                    </div>
                  ))}
                  {staffFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
                </div>
                <input type="hidden" name="actorId" value={selectedActor?.id || ''} />
                <input type="hidden" name="actorDisplayName" value={selectedActor?.displayName || ''} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Actor role</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={selectedActor ? selectedActor.roles.join(', ') : 'Search role...'}
                  value={roleQuery}
                  disabled={isSubmitting || !!selectedActor}
                  onChange={(e) => setRoleQuery(e.target.value)}
                />
                {!selectedActor && (
                  <div className="border rounded mt-1" style={{ maxHeight: 110, overflowY: 'auto' }}>
                    {roleFiltered.map(r => (
                      <div key={r} className="px-2 py-1 selectable-item" style={{ cursor: 'pointer' }} onClick={() => setRoleQuery(r)}>{r}</div>
                    ))}
                    {roleFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
                  </div>
                )}
                <input type="hidden" name="actorRole" value={roleQuery || (selectedActor?.roles[0] || '')} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Department</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={selectedActor ? selectedActor.departments.join(', ') : 'Search department...'}
                  value={deptQuery}
                  disabled={isSubmitting || !!selectedActor}
                  onChange={(e) => setDeptQuery(e.target.value)}
                />
                {!selectedActor && (
                  <div className="border rounded mt-1" style={{ maxHeight: 110, overflowY: 'auto' }}>
                    {deptFiltered.map(d => (
                      <div key={d} className="px-2 py-1 selectable-item" style={{ cursor: 'pointer' }} onClick={() => setDeptQuery(d)}>{d}</div>
                    ))}
                    {deptFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
                  </div>
                )}
                <input type="hidden" name="departmentId" value={deptQuery || (selectedActor?.departments[0] || queueItem?.departmentId || '')} />
              </Form.Group>

              <Form.Group controlId="note">
                <Form.Label>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  name="note"
                  rows={3}
                  placeholder="Reason or instructions"
                  disabled={isSubmitting}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={isSubmitting || nextStatuses.length === 0 || !selectedActor}>{isSubmitting ? <Spinner animation="border" size="sm" /> : "Transition"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function TimelineModal({
  show,
  onHide,
  queueItem,
  timelineEntries,
  isLoading
}: {
  show: boolean;
  onHide: () => void;
  queueItem: QueueSummary | null;
  timelineEntries: QueueTimelineEntry[];
  isLoading: boolean;
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Workflow timeline</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {queueItem && (
          <div className="bg-light rounded p-3 mb-3">
            <div className="fw-semibold">{queueItem.ticketNumber}</div>
            <div className="text-muted small">{queueItem.patientName}</div>
          </div>
        )}
        {isLoading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" role="status" />
          </div>
        ) : timelineEntries.length === 0 ? (
          <p className="text-muted mb-0">No timeline entries yet.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {timelineEntries.map((entry) => (
              <div key={entry.id} className="border-start border-3 ps-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="secondary">{entry.eventType}</Badge>
                  <span className="text-muted small">{formatDateTime(entry.createdAt)}</span>
                </div>
                <div className="mt-1">
                  {entry.fromStatus && entry.toStatus ? (
                    <div className="small text-muted">
                      {statusLabels[entry.fromStatus]} → {statusLabels[entry.toStatus]}
                    </div>
                  ) : null}
                  {entry.actorDisplayName || entry.actorId ? (
                    <div className="small">
                      <strong>{entry.actorDisplayName ?? entry.actorId}</strong>
                      {entry.actorRole ? <span className="text-muted"> ({entry.actorRole})</span> : null}
                    </div>
                  ) : null}
                  {entry.note ? <div className="mt-1">{entry.note}</div> : null}
                  {entry.departmentId ? (
                    <div className="text-muted small">Department: {entry.departmentId}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function AdvanceAssignModal({
  show,
  onHide,
  queueItem,
  isSubmitting,
  error,
  onSubmit
}: { show: boolean; onHide: () => void; queueItem: QueueSummary | null; isSubmitting: boolean; error: string | null; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; }) {
  const staffQueryResult = useStaffDirectory(show);
  const staffData: StaffDirectoryEntry[] = staffQueryResult.data || [];
  const [staffQuery, setStaffQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffDirectoryEntry | null>(null);
  const [roleQuery, setRoleQuery] = useState('');
  const [deptQuery, setDeptQuery] = useState('');
  const { user } = useAuth();

  // Always pre-select current user and their primary role when modal opens
  React.useEffect(() => {
    if (show && user) {
      const staff = staffData.find(s => s.username === user.username);
      if (staff) {
        setSelectedStaff(staff);
        setStaffQuery(staff.displayName);
        setRoleQuery(staff.roles[0] || '');
        setDeptQuery(staff.departments[0] || '');
      }
    } else if (!show) {
      setSelectedStaff(null);
      setStaffQuery("");
      setRoleQuery("");
      setDeptQuery("");
    }
  }, [show, user, staffData]);
  const staffFiltered = useMemo(() => {
    const q = staffQuery.toLowerCase();
    return staffData.filter(s => s.username.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q));
  }, [staffQuery, staffData]);
  const roleOptions = selectedStaff ? selectedStaff.roles : Array.from(new Set(staffData.flatMap(s => s.roles)));
  const deptOptions = selectedStaff ? selectedStaff.departments : Array.from(new Set(staffData.flatMap(s => s.departments)));
  const roleFiltered = useMemo(() => roleOptions.filter(r => r.toLowerCase().includes(roleQuery.toLowerCase())), [roleOptions, roleQuery]);
  const deptFiltered = useMemo(() => deptOptions.filter(d => d.toLowerCase().includes(deptQuery.toLowerCase())), [deptOptions, deptQuery]);
  const nextStatuses: QueueStatus[] = queueItem ? (allowedTransitions[queueItem.status] || []) : [];
  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Advance & Assign</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          {queueItem && (
            <div className="bg-light rounded p-3">
              <div className="fw-semibold">{queueItem.ticketNumber}</div>
              <small className="text-muted">Current: {statusLabels[queueItem.status]}</small>
            </div>
          )}
          {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
          <Form.Group controlId="targetStatus">
            <Form.Label>Next status</Form.Label>
            <Form.Select name="targetStatus" defaultValue={nextStatuses[0] || ''} required disabled={isSubmitting}>
              {nextStatuses.map(s => <option key={s} value={s}>{statusLabels[s as QueueStatus]}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Assignee</Form.Label>
            <Form.Control type="text" placeholder="Search staff..." value={staffQuery} disabled={isSubmitting} onChange={e => { setStaffQuery(e.target.value); setSelectedStaff(null); }} />
            <div className="border rounded mt-1" style={{ maxHeight:140, overflowY:'auto' }}>
              {staffFiltered.map(s => (
                <div key={s.id} className={`px-2 py-1 selectable-item${selectedStaff?.id===s.id?' bg-light':''}`} style={{ cursor:'pointer' }} onClick={() => { setSelectedStaff(s); setStaffQuery(s.displayName); setRoleQuery(s.roles[0]||''); setDeptQuery(s.departments[0]||''); }}>
                  <strong>{s.displayName}</strong> <span className="text-muted small">({s.username})</span>
                </div>
              ))}
              {staffFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
            </div>
              <input type="hidden" name="assigneeId" value={selectedStaff?.username || ''} required />
            <input type="hidden" name="assigneeDisplayName" value={selectedStaff?.displayName || ''} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Control type="text" placeholder={selectedStaff ? selectedStaff.roles.join(', ') : 'Search role...'} value={roleQuery} onChange={e => setRoleQuery(e.target.value)} disabled={isSubmitting || !!selectedStaff} />
            {!selectedStaff && (
              <div className="border rounded mt-1" style={{ maxHeight:110, overflowY:'auto' }}>
                {roleFiltered.map(r => <div key={r} className="px-2 py-1 selectable-item" style={{ cursor:'pointer' }} onClick={() => setRoleQuery(r)}>{r}</div>)}
                {roleFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
              </div>
            )}
            <input type="hidden" name="assigneeRole" value={roleQuery || (selectedStaff?.roles[0] || '')} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Control type="text" placeholder={selectedStaff ? selectedStaff.departments.join(', ') : 'Search department...'} value={deptQuery} onChange={e => setDeptQuery(e.target.value)} disabled={isSubmitting || !!selectedStaff} />
            {!selectedStaff && (
              <div className="border rounded mt-1" style={{ maxHeight:110, overflowY:'auto' }}>
                {deptFiltered.map(d => <div key={d} className="px-2 py-1 selectable-item" style={{ cursor:'pointer' }} onClick={() => setDeptQuery(d)}>{d}</div>)}
                {deptFiltered.length === 0 && <div className="px-2 py-1 text-muted small">No matches</div>}
              </div>
            )}
            <input type="hidden" name="departmentId" value={deptQuery || (selectedStaff?.departments[0] || queueItem?.departmentId || '')} />
          </Form.Group>
          <Form.Group controlId="note">
            <Form.Label>Note</Form.Label>
            <Form.Control as="textarea" name="note" rows={3} placeholder="Optional note" disabled={isSubmitting} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || !selectedStaff}>{isSubmitting ? <Spinner animation='border' size='sm' /> : 'Advance & Assign'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function InsuranceDetailsSection(props: { patientId: number, queueItemId: number }) {
  const { patientId, queueItemId } = props;
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [allDetails, setAllDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any | undefined>(undefined);
  const [queueItem, setQueueItem] = useState<any | null>(null);

  // Fetch queue item details by queueId
  useEffect(() => {
    if (!queueItemId) return;
    (async () => {
      try {
        const { fetchQueueItemById } = await import("../../../services/queueApi");
        const item = await fetchQueueItemById(queueItemId);
        setQueueItem(item || null);
      } catch (err) {
        setQueueItem(null);
      }
    })();
  }, [queueItemId]);

  // When both queueItem and allDetails are loaded, set selectedId and additionalDetails
  useEffect(() => {
    if (!queueItem || allDetails.length === 0) return;
    if (Array.isArray(queueItem.insuranceDetailsIds) && queueItem.insuranceDetailsIds.length > 0) {
      // Only set if the id exists in allDetails
      const validId = queueItem.insuranceDetailsIds.find((id: number) => allDetails.some((d: any) => d.id === id));
      if (validId) setSelectedId(validId);
    }
    if (queueItem.additionalDetails) {
      setAdditionalDetails(queueItem.additionalDetails);
    }
  }, [queueItem, allDetails]);

  const refreshDetails = () => {
    setLoading(true);
    setError(null);
    fetchAllPatientInsuranceDetails(patientId)
      .then((all) => {
        setAllDetails(all);
      })
      .catch(err => {
        setError(err?.message || 'Failed to fetch insurance details');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (patientId) {
      refreshDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-semibold">Insurance Details</span>
        <Button size="sm" variant="primary" onClick={() => { setEditData(undefined); setShowModal(true); }}>
          Add Insurance Details
        </Button>
      </div>
      {allDetails.length > 0 ? (
        <div className="mb-2">
          <table className="table table-sm table-bordered align-middle">
            <thead>
              <tr>
                <th></th>
                <th>Provider</th>
                <th>Plan</th>
                <th>Policy Number</th>
                <th>Coverage Type</th>
                <th>Expiry Date</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {allDetails.map((d, idx) => (
                <tr key={d.id || idx}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedId === d.id}
                      onChange={() => setSelectedId(selectedId === d.id ? null : d.id)}
                    />
                  </td>
                  <td>{d.providerName || '—'}</td>
                  <td>{d.planName || '—'}</td>
                  <td>{d.policyNumber || '—'}</td>
                  <td>{d.coverageType || '—'}</td>
                  <td>{d.expiryDate || '—'}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => { setEditData(d); setShowModal(true); }}>Edit</Button>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-danger" onClick={async () => {
                      const result = await Swal.fire({
                        title: 'Delete Insurance?',
                        text: 'Are you sure you want to delete this insurance detail?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Delete',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#d33',
                      });
                      if (result.isConfirmed) {
                        try {
                          await deletePatientInsuranceDetails(patientId, d.id);
                          await Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
                          refreshDetails();
                        } catch (err: any) {
                          await Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to delete.' });
                        }
                      }
                    }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         
          <div className="mb-2">
            <label className="fw-semibold mb-1">Other Additional Details</label>
            <RichTextEditor theme="snow" value={additionalDetails} onChange={setAdditionalDetails} placeholder="Enter any additional notes or details..." style={{ background: 'white' }} />
          </div>
        </div>
      ) : (
        <div className="text-muted small">No insurance details on file.</div>
      )}
       <div className="d-flex justify-content-end">
            <Button size="sm" variant="success" onClick={async () => {
              if (selectedId === null) return;
              try {
                  await updateQueueItem(queueItemId, { insuranceDetailsIds: [selectedId], additionalDetails })
                await Swal.fire({ icon: 'success', title: 'Saved!', text: 'Additional details saved.', timer: 1500, showConfirmButton: false });
              } catch (err: any) {
                await Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to save details.' });
              }
            }}>
              Save Additional Details
            </Button>
          </div>
      <InsuranceDetailsForm
        show={showModal}
        onHide={() => setShowModal(false)}
        title={editData ? "Edit Insurance Details" : "Add Insurance Details"}
        initialData={editData}
        onSave={async (data) => {
          try {
            const id = editData?.id !== undefined && editData?.id !== null ? Number(editData.id) : undefined;
            await savePatientInsuranceDetails(patientId, { ...data, id });
            await Swal.fire({
              icon: 'success',
              title: 'Saved!',
              text: 'Insurance details saved.',
              timer: 1800,
              showConfirmButton: false
            });
            setShowModal(false);
            setEditData(undefined);
            refreshDetails();
          } catch (err: any) {
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err?.message || 'Failed to save insurance details.'
            });
          }
        }}
      />
    </div>
  );
  
}