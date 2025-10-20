
import React, { useMemo, useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { isQueueItemReadonly } from '../../../services/queueApi';
import { TriageActionsSection } from '../../../components/triage/TriageActionsSection';
import { ConsultationActionsSection } from '../../../components/consult/ConsultationActionsSection';
import { PharmacyActionsSection } from '../../../components/pharmacy/PharmacyActionsSection';
import { DiagnosticsActionsSection } from '../../../components/diagnostics/DiagnosticsActionsSection';
import { DiagnosticResultsReadOnly } from '../../../components/diagnostics/DiagnosticResultsReadOnly';
import { BillingActionsSection } from '../../../components/billing/BillingActionsSection';
import { PreviousStaffNotesModal } from '../../../components/shared/PreviousStaffNotesModal';
import { SearchableStaffSelect } from '../../../components/shared/SearchableStaffSelect';
import { FilteredStaffSelect } from '../../../components/shared/FilteredStaffSelect';
import {
  fetchConsultationEntries,
  createConsultationEntry,
  updateConsultationEntry,
  deleteConsultationEntry,
  bulkUpsertConsultationEntries,
  bulkDeleteConsultationEntries,
  ConsultationEntryDto
} from '../../../services/consultationEntriesApi';
// Loader for consultation entries per queue item
type ConsultationEntriesLoaderProps = {
  queueItemId: number;
  children: (
    consultationEntries: ConsultationEntryDto[],
    handlers: {
      onAdd: (entry: { title: string; details: string }) => Promise<void>;
      onUpdate: (id: number, entry: { title: string; details: string }) => Promise<void>;
      onDelete: (id: number) => Promise<void>;
      loading: boolean;
    }
  ) => React.ReactNode;
};



function ConsultationEntriesLoader(props: ConsultationEntriesLoaderProps) {
  const { queueItemId, children } = props;
  const [consultationEntries, setConsultationEntries] = React.useState<ConsultationEntryDto[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetchConsultationEntries(queueItemId)
      .then(setConsultationEntries)
      .finally(() => setLoading(false));
  }, [queueItemId]);

  const onAdd = async (entry: { title: string; details: string }) => {
    setLoading(true);
    try {
      const created = await createConsultationEntry(queueItemId, entry);
      setConsultationEntries(prev => [...prev, created]);
    } finally {
      setLoading(false);
    }
  };
  const onUpdate = async (id: number, entry: { title: string; details: string }) => {
    setLoading(true);
    try {
      const updated = await updateConsultationEntry(queueItemId, id, entry);
      setConsultationEntries(prev => prev.map(e => e.id === id ? updated : e));
    } finally {
      setLoading(false);
    }
  };
  const onDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteConsultationEntry(queueItemId, id);
      setConsultationEntries(prev => prev.filter(e => e.id !== id));
    } finally {
      setLoading(false);
    }
  };
  return <>{children(consultationEntries, { onAdd, onUpdate, onDelete, loading })}</>;
}
import { fetchTriageTitles } from '../../../services/triageTitlesApi';
import {
  fetchTriageEntries,
  createTriageEntry,
  updateTriageEntry,
  deleteTriageEntry,
  TriageEntryDto
} from '../../../services/triageEntriesApi';
import {
  bulkUpsertTriageEntries,
  bulkDeleteTriageEntries
} from '../../../services/triageEntriesApi.bulk';
import type { TriageTitleDto } from '../../../services/triageTitlesApi';
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
import { useAssignQueueItem, useQueueList, useQueueListByRole, useQueueTimeline, useTransitionQueueItem, useQueueStream, useAdvanceAssignQueueItem } from "../hooks/useQueueBoardData";
import type {
  QueueAssignmentPayload,
  QueueStatus,
  QueueSummary,
  QueueTimelineEntry
} from "../../../types/queue";
import { useRoleContext } from "../../../hooks/useRoleContext";
import { fetchQueueStatusRoleMatrix } from "../../../services/queueStatusRoleApi";
import { useAuth } from "../../../hooks/useAuth";
import { useStaffDirectory } from '../../../services/staffDirectoryApi';
import { apiClient } from "../../../services/apiClient";
import { savePatientInsuranceDetails, fetchAllPatientInsuranceDetails, deletePatientInsuranceDetails } from "../../../services/insuranceApi";
import RichTextEditor from '../../../components/shared/RichTextEditor';
import { FormModal } from '../../../components/shared/FormModal';
import { updateQueueItem } from "../../../services/queueApi";
import { hasPermission, useResolvedPermissions } from "../../../hooks/usePermissions";
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


// Remove static statusOptions; will be dynamic per role

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
    "WAITING_TRIAGE", // Allow reverse to triage
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
  const { activeRole } = useRoleContext();
  const { permissions, loading: permissionsLoading, error: permissionsError, refetch: refetchPermissions } = useResolvedPermissions();
  const CAN_VIEW_NOTES = hasPermission(permissions, 'VIEW_PATIENT_NOTES');
  const [selectedStatus, setSelectedStatus] = useState<QueueStatus>("PENDING_CHECKIN");
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [activeItem, setActiveItem] = useState<QueueSummary | null>(null);
  const [modalType, setModalType] = useState<"assign" | "transition" | "timeline" | "advanceAssign" | null>(null);
  const [staleWarning, setStaleWarning] = useState<string | null>(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceFormData, setInsuranceFormData] = useState<InsuranceFormData | undefined>(undefined);
  const [showPreviousNotesModal, setShowPreviousNotesModal] = useState(false);
  const [selectedItemForNotes, setSelectedItemForNotes] = useState<QueueSummary | null>(null);
  const [showDiagnosticResultsModal, setShowDiagnosticResultsModal] = useState(false);
  const [selectedItemForResults, setSelectedItemForResults] = useState<QueueSummary | null>(null);
  const [isReadonly, setIsReadonly] = useState(false);

  // Matrix: { [roleKey]: Set<QueueStatus> }
  const [statusMatrix, setStatusMatrix] = useState<Record<string, Set<string>>>({});
  const [statusOptions, setStatusOptions] = useState<QueueStatus[]>([]);
  // Helper function to safely check permissions with loading state
  const canManage = (permission: string) => {
    if (permissionsLoading || permissionsError) return false;
    return hasPermission(permissions, permission);
  };

  // Only check permissions if they're loaded, otherwise default to false to prevent showing actions
  const CAN_MANAGE_REGISTRATION = canManage('MANAGE_REGISTRATION');
  const CAN_MANAGE_TRIAGE = canManage('MANAGE_TRIAGE');
  const CAN_MANAGE_CONSULTATIONS = canManage('MANAGE_CONSULTATIONS');
  const CAN_MANAGE_PHARMACY = canManage('MANAGE_PHARMACY');
  const CAN_MANAGE_DIAGNOSTICS = canManage('MANAGE_DIAGNOSTICS');
  const CAN_MANAGE_BILLING = canManage('MANAGE_BILLING');

  // Fetch matrix on mount or when role changes
  useEffect(() => {
    fetchQueueStatusRoleMatrix().then(matrix => setStatusMatrix(matrix));
  }, []);

  // Update statusOptions when matrix or activeRole changes
  useEffect(() => {
    if (activeRole && statusMatrix[activeRole]) {
      setStatusOptions(Array.from(statusMatrix[activeRole]) as QueueStatus[]);
      // If current selectedStatus is not allowed, reset
      if (!statusMatrix[activeRole].has(selectedStatus)) {
        setSelectedStatus(Array.from(statusMatrix[activeRole])[0] as QueueStatus);
      }
    } else {
      setStatusOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRole, statusMatrix]);

  // Check readonly status when activeItem changes
  useEffect(() => {
    if (activeItem?.id) {
      isQueueItemReadonly(activeItem.id)
        .then(setIsReadonly)
        .catch(() => setIsReadonly(false));
    } else {
      setIsReadonly(false);
    }
  }, [activeItem?.id]);

  // Get allowed statuses for the current role
  const allowedStatuses = useMemo(() => {
    if (activeRole && statusMatrix[activeRole]) {
      return Array.from(statusMatrix[activeRole]) as QueueStatus[];
    }
    return [];
  }, [activeRole, statusMatrix]);

  // Use role-based queue fetching with date filtering and server-side pagination
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);
  const queueQuery = useQueueListByRole(allowedStatuses, startDate, endDate, page, size);
  useQueueStream(selectedStatus);
  const assignMutation = useAssignQueueItem(selectedStatus);
  const transitionMutation = useTransitionQueueItem(selectedStatus);
  const advanceAssignMutation = useAdvanceAssignQueueItem(selectedStatus);
  const timelineQuery = useQueueTimeline(
    modalType === "timeline" && activeItem ? activeItem.id : null
  );

  // Refetch and clear queue list cache whenever the authenticated user changes
  const queryClient = useQueryClient();
  React.useEffect(() => {
    if (user) {
      // Invalidate all queue list queries so new user gets fresh data
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["queue", "role-based"] });
      queueQuery.refetch();
    }
  }, [user, queryClient]);

  const filteredItems = useMemo(() => {
    const pageData = queueQuery.data as any;
    const items: any[] = Array.isArray(pageData?.content) ? pageData.content : [];
    
    // First filter by selected status (since we now fetch all allowed statuses)
    let statusFilteredItems = items.filter((item: any) => item.status === selectedStatus);
    
    // Then apply search filtering
    if (!searchValue) return statusFilteredItems;
    const lower = searchValue.trim().toLowerCase();
    return statusFilteredItems.filter((item: any) =>
      [item.ticketNumber, item.patientName, item.visitReason]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(lower))
    );
  }, [queueQuery.data, searchValue, selectedStatus]);

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
          if (form && typeof (form as HTMLFormElement).reset === 'function') {
            (form as HTMLFormElement).reset();
          }
          handleCloseModal();
          // Force a refetch to ensure UI is updated immediately
          queueQuery.refetch();
        },
        onError: () => {
          // Refetch on error to ensure UI is in sync
          queueQuery.refetch();
        }
      }
    );
  };
// Loader for triage entries per queue item
type TriageEntriesLoaderProps = {
  queueItemId: number;
  children: (
    triageEntries: TriageEntryDto[],
    handlers: {
      onAdd: (entry: { title: string; details: string }) => Promise<void>;
      onUpdate: (id: number, entry: { title: string; details: string }) => Promise<void>;
      onDelete: (id: number) => Promise<void>;
      loading: boolean;
    }
  ) => React.ReactNode;
};


// Loader for triage entries per queue item
type TriageEntriesLoaderHandlers = {
  onAdd: (entry: { title: string; details: string }) => Promise<void>;
  onUpdate: (id: number, entry: { title: string; details: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
};



function TriageEntriesLoader(props: TriageEntriesLoaderProps) {
  const { queueItemId, children } = props;
  const [triageEntries, setTriageEntries] = React.useState<TriageEntryDto[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetchTriageEntries(queueItemId)
      .then(setTriageEntries)
      .finally(() => setLoading(false));
  }, [queueItemId]);

  const onAdd = async (entry: { title: string; details: string }) => {
    setLoading(true);
    try {
      const created = await createTriageEntry(queueItemId, entry);
      setTriageEntries(prev => [...prev, created]);
    } finally {
      setLoading(false);
    }
  };
  const onUpdate = async (id: number, entry: { title: string; details: string }) => {
    setLoading(true);
    try {
      const updated = await updateTriageEntry(queueItemId, id, entry);
      setTriageEntries(prev => prev.map(e => e.id === id ? updated : e));
    } finally {
      setLoading(false);
    }
  };
  const onDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteTriageEntry(queueItemId, id);
      setTriageEntries(prev => prev.filter(e => e.id !== id));
    } finally {
      setLoading(false);
    }
  };
  return <>{children(triageEntries, { onAdd, onUpdate, onDelete, loading })}</>;
}
// Helper to get triage titles from localStorage (admin-configured)
function getTriageTitlesFromStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem('triageTitles') || '[]');
  } catch (e) {
    return [];
  }
}
// Loader component to fetch triage titles from backend
function TriageTitlesLoader({ children }: { children: (titles: TriageTitleDto[]) => React.ReactNode }) {
  const [titles, setTitles] = React.useState<TriageTitleDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetchTriageTitles().then(setTitles).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="text-muted small">Loading triage titles...</div>;
  return <>{children(titles)}</>;
}

  const handleTransitionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeItem) return;
    const formData = new FormData(event.currentTarget);
    const targetStatus = formData.get("targetStatus")?.toString() as QueueStatus | undefined;
    if (!targetStatus) return;
    
    const assigneeId = formData.get("assigneeId")?.toString().trim() || undefined;
    const assigneeDisplayName = formData.get("assigneeDisplayName")?.toString().trim() || undefined;
    const assigneeRole = formData.get("assigneeRole")?.toString().trim() || undefined;
    
    // Log transition data for debugging
    
    const payload = {
      targetStatus,
      // Actor fields (current user performing the transition)
      actorId: formData.get("actorId")?.toString().trim() || undefined,
      actorDisplayName: formData.get("actorDisplayName")?.toString().trim() || undefined,
      actorRole: formData.get("actorRole")?.toString().trim() || activeRole,
      // Assignee fields (who the item will be assigned to after transition)
      assigneeId,
      assigneeDisplayName,
      assigneeRole,
      departmentId: formData.get("departmentId")?.toString().trim() || activeItem.departmentId || undefined,
      note: formData.get("note")?.toString().trim() || undefined
    };

    // Pre-submit stale status check
    const pageData2 = queueQuery.data as any;
    const latest = Array.isArray(pageData2?.content) ? pageData2.content.find((i: any) => i.id === activeItem.id) : undefined;
    if (latest && latest.status !== activeItem.status) {
      const fromLabel = statusLabels[activeItem.status as keyof typeof statusLabels] ?? activeItem.status;
      const toLabel = statusLabels[latest.status as keyof typeof statusLabels] ?? latest.status;
      setStaleWarning(`Item moved from ${fromLabel} to ${toLabel}. Refreshing view.`);
      handleCloseModal();
      queueQuery.refetch();
      return;
    }

    transitionMutation.mutate(
      { queueItemId: activeItem.id, payload },
      {
        onSuccess: () => {
          if (event.currentTarget && typeof (event.currentTarget as HTMLFormElement).reset === 'function') {
            (event.currentTarget as HTMLFormElement).reset();
          }
          handleCloseModal();
          // Force a refetch to ensure UI is updated immediately
          queueQuery.refetch();
        },
        onError: () => {
          // Refetch on error to ensure UI is in sync
          queueQuery.refetch();
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
                disabled={statusOptions.length === 0}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={8} sm={12}>
              <div className="d-flex flex-wrap gap-2">
                <span className="text-muted small align-self-center me-2">Quick filters:</span>
                {statusOptions
                  .filter(status => status.includes('WAITING'))
                  .map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedStatus === status ? "primary" : "outline-secondary"}
                      onClick={() => setSelectedStatus(status)}
                      className="text-nowrap"
                    >
                      {statusLabels[status]}
                    </Button>
                  ))}
              </div>
            </Col>
          </Row>
          <Row className="g-3 align-items-center">
            <Col md={4} sm={12}>
              <FilterBar placeholder="Search ticket, name, or reason..." value={searchValue} onChange={setSearchValue} />
            </Col>
            <Col md={2} sm={6}>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Start Date"
              />
            </Col>
            <Col md={2} sm={6}>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="End Date"
              />
            </Col>
            <Col md={2} sm={12} className="d-flex justify-content-end gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setStartDate(today);
                  setEndDate(today);
                }}
                title="Set to today"
              >
                Today
              </Button>
              <Button variant="outline-secondary" onClick={() => queueQuery.refetch()}>
                Refresh
              </Button>
            </Col>
          </Row>

          {queueQuery.isError && (
            <Alert variant="danger">Unable to load queue items. Please try again.</Alert>
          )}

          {permissionsError && (
            <Alert variant="warning" dismissible onClose={() => refetchPermissions()}>
              <div className="d-flex justify-content-between align-items-center">
                <span>Failed to load permissions. Some actions may not be available.</span>
                <Button variant="outline-warning" size="sm" onClick={() => refetchPermissions()}>
                  Retry
                </Button>
              </div>
            </Alert>
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
                {queueQuery.isLoading || permissionsLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">
                      <Spinner animation="border" role="status" />
                      {permissionsLoading && (
                        <div className="mt-2 text-muted small">Loading permissions...</div>
                      )}
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
                        <td>
                          <QueueStatusBadge status={item.status} />
                          {isReadonly && (
                            <Badge bg="secondary" className="ms-1" title="This queue item is readonly (closed and fully paid)">
                              Readonly
                            </Badge>
                          )}
                        </td>
                        <td><Badge bg={priorityVariant(item.priority)}>{item.priority}</Badge></td>
                        <td>{item.currentAssigneeId || "Unassigned"}</td>
                        <td>{item.departmentId ?? "—"}</td>
                        <td>{formatDateTime(item.createdAt)}</td>
                        <td>{formatDateTime(item.slaDueAt)}</td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            {CAN_VIEW_NOTES && (
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => {
                                setSelectedItemForNotes(item);
                                setShowPreviousNotesModal(true);
                              }}
                              title="View previous staff notes"
                            >
                              <i className="bi bi-clipboard-data me-1"></i>
                              Notes
                            </Button>
                            )}
                            {(item.status === 'IN_CONSULT' || item.status === 'WAITING_PROVIDER') && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => {
                                  setSelectedItemForResults(item);
                                  setShowDiagnosticResultsModal(true);
                                }}
                                title="View diagnostic results"
                              >
                                <i className="bi bi-clipboard-check me-1"></i>
                                Results
                              </Button>
                            )}
                            {item.status === 'PENDING_CHECKIN' ? (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleOpenModal(item, 'advanceAssign')}
                                disabled={isReadonly}
                              >
                                Advance & Assign
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleOpenModal(item, 'assign')}
                                disabled={isReadonly}
                              >
                                Assign
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleOpenModal(item, 'transition')}
                              disabled={isReadonly}
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
                      {item.status === 'IN_REGISTRATION' && CAN_MANAGE_REGISTRATION && (
                        <tr>
                          <td colSpan={10} className="bg-light">
                            <details>
                              <summary className="fw-semibold">Registration Actions: Insurance & Additional Details</summary>
                              <div className="mt-3">
                                <InsuranceDetailsSection patientId={item.patientId} queueItemId={item.id} />
                              </div>
                            </details>
                          </td>
                        </tr>
                      )}

                      {item.status === 'IN_TRIAGE' && CAN_MANAGE_TRIAGE && (
                        <tr>
                          <td colSpan={10} className="bg-light">
                            <details>
                              <summary className="fw-semibold">Triage Actions</summary>
                              <div className="mt-3">
                                <TriageTitlesLoader>
                                  {(triageTitles) => (
                                    <TriageEntriesLoader queueItemId={item.id}>
                                      {(triageEntries, { onAdd, onUpdate, onDelete, loading }) => (
                                        <TriageActionsSection
                                          triageTitles={triageTitles}
                                          initialItems={triageEntries.map(e => ({
                                            id: e.id,
                                            title: e.title,
                                            details: e.details,
                                            isCustom: false
                                          }))}
                                          // onAdd, onUpdate, onDelete removed
                                          loading={loading}
                                          isReadonly={isReadonly}
                                          onSubmit={async (items) => {
                                            try {
                                              // Only send changed items, and use bulk API
                                              // 1. Find deleted items (in triageEntries but not in items)
                                              const deletedIds = triageEntries
                                                .filter(e => !items.some(i => i.id === e.id))
                                                .map(e => e.id);
                                              // 2. Find new or updated items
                                              const upserts = items.map(i => ({
                                                id: i.id > 0 ? i.id : undefined, // id may be undefined for new
                                                title: i.title,
                                                details: i.details
                                              }));
                                              if (deletedIds.length > 0) {
                                                await bulkDeleteTriageEntries(item.id, deletedIds);
                                              }
                                              if (upserts.length > 0) {
                                                await bulkUpsertTriageEntries(item.id, upserts);
                                              }
                                              Swal.fire({ icon: 'success', title: 'Triage items submitted', timer: 1200, showConfirmButton: false });
                                            } catch (error: any) {
                                              console.error('Failed to submit triage items:', error);
                                              const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit triage items';
                                              Swal.fire({ 
                                                icon: 'error', 
                                                title: 'Error', 
                                                text: errorMessage,
                                                confirmButtonText: 'OK'
                                              });
                                            }
                                          }}
                                        />
                                      )}
                                    </TriageEntriesLoader>
                                  )}
                                </TriageTitlesLoader>
                              </div>
                            </details>
                          </td>
                        </tr>
                      )}


                      {item.status === 'IN_CONSULT' && CAN_MANAGE_CONSULTATIONS && (
                        <tr>
                          <td colSpan={10} className="bg-light">
                            <details>
                              <summary className="fw-semibold">Consultation Actions</summary>
                              <div className="mt-3">
                                <ConsultationEntriesLoader queueItemId={item.id}>
                                  {(consultationEntries, { onAdd, onUpdate, onDelete, loading }) => (
                                <ConsultationActionsSection
                                  initialItems={consultationEntries.map(e => ({
                                    id: e.id,
                                    title: e.title,
                                    details: e.details,
                                    isCustom: e.isCustom || false,
                                    consultationTitleId: e.consultationTitleId,
                                    consultationTitleName: e.consultationTitleName,
                                    consultationTitleLevel: e.consultationTitleLevel,
                                    sortOrder: e.sortOrder
                                  }))}
                                  loading={loading}
                                  queueItemId={item.id}
                                  patientId={item.patientId}
                                  isReadonly={isReadonly}
                                  onSubmit={async (items) => {
                                    try {
                                      // Use bulk API for upsert and delete
                                      const deletedIds = consultationEntries
                                        .filter(e => !items.some(i => i.id === e.id))
                                        .map(e => e.id);
                                      const upserts = items.map(i => ({
                                        id: i.id > 0 ? i.id : undefined,
                                        title: i.title,
                                        details: i.details,
                                        consultationTitleId: i.consultationTitleId,
                                        sortOrder: i.sortOrder
                                      }));
                                      if (deletedIds.length > 0) {
                                        await bulkDeleteConsultationEntries(item.id, deletedIds);
                                      }
                                      if (upserts.length > 0) {
                                        await bulkUpsertConsultationEntries(item.id, upserts);
                                      }
                                      Swal.fire({ icon: 'success', title: 'Consultation items submitted', timer: 1200, showConfirmButton: false });
                                    } catch (error: any) {
                                      console.error('Failed to submit consultation items:', error);
                                      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit consultation items';
                                      Swal.fire({ 
                                        icon: 'error', 
                                        title: 'Error', 
                                        text: errorMessage,
                                        confirmButtonText: 'OK'
                                      });
                                    }
                                  }}
                                />
                                  )}
                                </ConsultationEntriesLoader>
                              </div>
                            </details>
                          </td>
                        </tr>
                      )}

                      {item.status === 'IN_PHARMACY' && CAN_MANAGE_PHARMACY && (
                        <tr>
                          <td colSpan={10} className="bg-light">
                            <details>
                              <summary className="fw-semibold">Pharmacy Actions</summary>
                              <div className="mt-3">
                                {permissionsLoading ? (
                                  <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" />
                                    <div className="mt-2 text-muted small">Loading pharmacy permissions...</div>
                                  </div>
                                ) : (
                                  <PharmacyActionsSection
                                    queueItemId={item.id}
                                    patientId={item.patientId}
                                    isReadonly={isReadonly}
                                    onSubmit={async (items) => {
                                      // Pharmacy actions are handled internally by PharmacyActionsSection
                                      // This includes prescription management, dispensing, and stock operations
                                      console.log('Pharmacy actions completed:', items);
                                    }}
                                  />
                                )}
                              </div>
                            </details>
                          </td>
                        </tr>
                      )}

                      {item.status === 'IN_DIAGNOSTICS' && CAN_MANAGE_DIAGNOSTICS && (
                        <tr>
                          <td colSpan={10} className="bg-light">
                            <details>
                              <summary className="fw-semibold">Diagnostics Actions</summary>
                              <div className="mt-3">
                                {permissionsLoading ? (
                                  <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" />
                                    <div className="mt-2 text-muted small">Loading diagnostics permissions...</div>
                                  </div>
                                ) : (
                                  <DiagnosticsActionsSection
                                    queueItemId={item.id}
                                    patientId={item.patientId}
                                    isReadonly={isReadonly}
                                  />
                                )}
                              </div>
                            </details>
                          </td>
                        </tr>
                      )}

                      {item.status === 'IN_BILLING' && CAN_MANAGE_BILLING && (
                        <tr>
                          <td colSpan={10} className="bg-light">
                            <details>
                              <summary className="fw-semibold">Billing Actions</summary>
                              <div className="mt-3">
                                {permissionsLoading ? (
                                  <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" />
                                    <div className="mt-2 text-muted small">Loading billing permissions...</div>
                                  </div>
                                ) : (
                                  <BillingActionsSection
                                    queueItemId={item.id}
                                    patientId={item.patientId}
                                    patientName={item.patientName}
                                    isReadonly={isReadonly}
                                  />
                                )}
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
        activeRole={activeRole}
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
          advanceAssignMutation.mutate({ queueItemId: activeItem.id, payload }, {
            onSuccess: (data, variables, context) => {
              if (e.currentTarget && typeof (e.currentTarget as HTMLFormElement).reset === 'function') {
                (e.currentTarget as HTMLFormElement).reset();
              }
              handleCloseModal();
              // Force a refetch to ensure UI is updated immediately
              queueQuery.refetch();
            },
            onError: () => {
              // Refetch on error to ensure UI is in sync
              queueQuery.refetch();
            }
          });
        }}
      />
      
      <PreviousStaffNotesModal
        show={showPreviousNotesModal}
        onHide={() => {
          setShowPreviousNotesModal(false);
          setSelectedItemForNotes(null);
        }}
        queueItemId={selectedItemForNotes?.id || 0}
        patientName={selectedItemForNotes?.patientName || ''}
      />

      {/* Diagnostic Results Modal */}
      <Modal show={showDiagnosticResultsModal} onHide={() => setShowDiagnosticResultsModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Diagnostic Results - {selectedItemForResults?.patientName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItemForResults && (
            <DiagnosticResultsReadOnly
              queueItemId={selectedItemForResults.id}
              onClose={() => setShowDiagnosticResultsModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>
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
  const [selectedStaff, setSelectedStaff] = useState<StaffDirectoryEntry | null>(null);
  const [roleQuery, setRoleQuery] = useState("");
  const [deptQuery, setDeptQuery] = useState("");
  const { user } = useAuth();
  const staffQueryResult = useStaffDirectory(show);
  const staffData: StaffDirectoryEntry[] = staffQueryResult.data || [];

  // Get unique roles and departments from all staff
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    staffData.forEach(staff => {
      staff.roles.forEach(role => roles.add(role));
    });
    return Array.from(roles).sort();
  }, [staffData]);

  const availableDepartments = useMemo(() => {
    const departments = new Set<string>();
    staffData.forEach(staff => {
      staff.departments.forEach(dept => departments.add(dept));
    });
    return Array.from(departments).sort();
  }, [staffData]);

  // Always pre-select current user when modal opens
  React.useEffect(() => {
    if (show && user) {
      // We'll let the SearchableStaffSelect handle finding the current user
      setRoleQuery("");
      setDeptQuery("");
    } else if (!show) {
      setSelectedStaff(null);
      setRoleQuery("");
      setDeptQuery("");
    }
  }, [show, user]);

  return (
    <Modal show={show} onHide={() => { onHide(); setSelectedStaff(null); }} centered>
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

          <SearchableStaffSelect
            value={selectedStaff}
            onChange={(staff) => {
              setSelectedStaff(staff);
              if (staff) {
                setRoleQuery(staff.roles[0] || '');
                setDeptQuery(staff.departments[0] || '');
              }
            }}
            placeholder="Search staff..."
            disabled={isSubmitting}
            required
            label="Assignee"
          />
          <input type="hidden" name="assigneeId" value={selectedStaff?.username || ''} required />
          <input type="hidden" name="assigneeDisplayName" value={selectedStaff?.displayName || ''} />

              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={roleQuery}
                  disabled={isSubmitting}
                  onChange={(e) => setRoleQuery(e.target.value)}
                >
                  <option value="">Select role...</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
                <input type="hidden" name="assigneeRole" value={roleQuery} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={deptQuery}
                  disabled={isSubmitting}
                  onChange={(e) => setDeptQuery(e.target.value)}
                >
                  <option value="">Select department...</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
                <input type="hidden" name="departmentId" value={deptQuery || queueItem?.departmentId || ''} />
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
  onSubmit,
  activeRole
}: { show: boolean; onHide: () => void; queueItem: QueueSummary | null; isSubmitting: boolean; error: string | null; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; activeRole: string; }) {
  const nextStatuses = queueItem ? allowedTransitions[queueItem.status] ?? [] : [];
  const [selectedAssignee, setSelectedAssignee] = useState<StaffDirectoryEntry | null>(null);
  const [roleQuery, setRoleQuery] = useState("");
  const [deptQuery, setDeptQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { user } = useAuth();
  const staffQueryResult = useStaffDirectory(show);
  const staffData: StaffDirectoryEntry[] = staffQueryResult.data || [];
  
  // Fetch queue status role matrix for filtering users
  const { data: statusMatrix } = useQuery({
    queryKey: ['queue-status-role-matrix'],
    queryFn: fetchQueueStatusRoleMatrix,
    enabled: show
  });

  // Initialize status and auto-select current user as assignee when transitioning to status containing "IN"
  React.useEffect(() => {
    if (show && user) {
      // Initialize with first available status if none selected
      if (!selectedStatus && nextStatuses.length > 0) {
        setSelectedStatus(nextStatuses[0]);
      }
      
      // Auto-select current user for IN status
      if (selectedStatus && selectedStatus.includes("IN")) {
        const currentUser = staffData.find(s => s.username === user.username);
        if (currentUser) {
          setSelectedAssignee(currentUser);
          setRoleQuery(activeRole || '');
          setDeptQuery(currentUser.departments[0] || '');
          // Auto-assigned current user for IN status with active role
        } else {
          console.warn('Current user not found in staff directory:', user.username);
        }
      }
    } else if (!show) {
      setSelectedAssignee(null);
      setRoleQuery("");
      setDeptQuery("");
      setSelectedStatus("");
    }
  }, [show, user, selectedStatus, staffData, nextStatuses]);

  // Filter staff based on selected status and role matrix
  const filteredStaff = useMemo(() => {
    if (!selectedStatus || !statusMatrix) return staffData;
    
    // Get roles that can see the selected status
    const allowedRoles = Object.entries(statusMatrix)
      .filter(([_, statuses]) => (statuses as Set<string>).has(selectedStatus))
      .map(([role, _]) => role);
    
    // Filter staff by allowed roles
    return staffData.filter(staff => 
      staff.roles.some(role => allowedRoles.includes(role))
    );
  }, [staffData, selectedStatus, statusMatrix]);

  // Get unique roles and departments from filtered staff
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    filteredStaff.forEach(staff => {
      staff.roles.forEach(role => roles.add(role));
    });
    return Array.from(roles).sort();
  }, [filteredStaff]);

  const availableDepartments = useMemo(() => {
    const departments = new Set<string>();
    filteredStaff.forEach(staff => {
      staff.departments.forEach(dept => departments.add(dept));
    });
    return Array.from(departments).sort();
  }, [filteredStaff]);

  return (
    <Modal show={show} onHide={() => { onHide(); setSelectedAssignee(null); }} centered>
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
                  value={selectedStatus}
                  key={queueItem?.id ?? "transition"}
                  disabled={isSubmitting}
                  required
                  onChange={(e) => {
                    const newSelectedStatus = e.target.value;
                    setSelectedStatus(newSelectedStatus);
                    
                    // Check if this is a reverse transition (going backwards in the workflow)
                    const isReverseTransition = queueItem && (
                      (queueItem.status === 'IN_CONSULT' && newSelectedStatus === 'WAITING_TRIAGE') ||
                      (queueItem.status === 'WAITING_PROVIDER' && newSelectedStatus === 'IN_TRIAGE') ||
                      (queueItem.status === 'IN_DIAGNOSTICS' && newSelectedStatus === 'WAITING_PROVIDER') ||
                      (queueItem.status === 'IN_PHARMACY' && newSelectedStatus === 'WAITING_PROVIDER')
                    );
                    
                    if (isReverseTransition) {
                      // Show a warning for reverse transitions
                      const warningElement = document.getElementById('reverse-transition-warning');
                      if (warningElement) {
                        warningElement.style.display = 'block';
                      }
                    } else {
                      const warningElement = document.getElementById('reverse-transition-warning');
                      if (warningElement) {
                        warningElement.style.display = 'none';
                      }
                    }
                  }}
                >
                  <option value="">Select status...</option>
                  {nextStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status as QueueStatus]}
                    </option>
                  ))}
                </Form.Select>
                <Alert 
                  id="reverse-transition-warning" 
                  variant="warning" 
                  className="mt-2" 
                  style={{ display: 'none' }}
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Reverse Transition:</strong> This will move the patient backwards in the workflow. 
                  Please ensure this is intentional and add a note explaining the reason.
                </Alert>
              </Form.Group>

              <FilteredStaffSelect
                value={selectedAssignee}
                onChange={(staff) => {
                  setSelectedAssignee(staff);
                  if (staff) {
                    setRoleQuery(staff.roles[0] || '');
                    setDeptQuery(staff.departments[0] || '');
                  }
                }}
                placeholder="Search staff..."
                disabled={isSubmitting}
                required
                label="Assignee"
                staffData={staffData}
                selectedStatus={selectedStatus}
                statusMatrix={statusMatrix}
              />
              {selectedStatus && selectedStatus.includes("IN") && selectedAssignee && (
                <div className="alert alert-info py-2 mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>
                    <strong>Auto-assigned:</strong> {selectedAssignee.displayName} (current user) for {selectedStatus} status
                  </small>
                </div>
              )}
              <input type="hidden" name="assigneeId" value={selectedAssignee?.username || ''} />
              <input type="hidden" name="assigneeDisplayName" value={selectedAssignee?.displayName || ''} />

              <Form.Group>
                <Form.Label>Assignee role</Form.Label>
                <Form.Select
                  value={roleQuery}
                  disabled={isSubmitting}
                  onChange={(e) => setRoleQuery(e.target.value)}
                >
                  <option value="">Select role...</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Form.Select>
                <input type="hidden" name="assigneeRole" value={roleQuery} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={deptQuery}
                  disabled={isSubmitting}
                  onChange={(e) => setDeptQuery(e.target.value)}
                >
                  <option value="">Select department...</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
                <input type="hidden" name="departmentId" value={deptQuery || queueItem?.departmentId || ''} />
              </Form.Group>

              {/* Hidden fields for actor (current user) */}
              <input type="hidden" name="actorId" value={user?.username || ''} />
              <input type="hidden" name="actorDisplayName" value={user?.displayName || user?.username || ''} />
              <input type="hidden" name="actorRole" value={user?.roles?.[0] || ''} />

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
          <Button type="submit" variant="success" disabled={isSubmitting || nextStatuses.length === 0 || !selectedAssignee}>{isSubmitting ? <Spinner animation="border" size="sm" /> : "Transition"}</Button>
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
         
         
        </div>
      ) : (
        <div className="text-muted small">No insurance details on file.</div>
      )}
       <div className="mb-2">
            <label className="fw-semibold mb-1">Other Additional Details</label>
            <RichTextEditor theme="snow" value={additionalDetails} onChange={setAdditionalDetails} placeholder="Enter any additional notes or details..." style={{ background: 'white' }} />
          </div>
       <div className="d-flex justify-content-end">
            <Button 
              size="sm" 
              variant="success" 
              disabled={!additionalDetails?.trim() && selectedId === null}
              onClick={async () => {
                try {
                  const payload: any = { additionalDetails };
                  // Only include insuranceDetailsIds if an insurance is selected
                  if (selectedId !== null) {
                    payload.insuranceDetailsIds = [selectedId];
                  }
                  await updateQueueItem(queueItemId, payload);
                  await Swal.fire({ 
                    icon: 'success', 
                    title: 'Saved!', 
                    text: 'Additional details saved successfully.', 
                    timer: 1500, 
                    showConfirmButton: false 
                  });
                } catch (err: any) {
                  console.error('Failed to save additional details:', err);
                  await Swal.fire({ 
                    icon: 'error', 
                    title: 'Error', 
                    text: err?.response?.data?.message || err?.message || 'Failed to save details. Please try again.' 
                  });
                }
              }}
            >
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