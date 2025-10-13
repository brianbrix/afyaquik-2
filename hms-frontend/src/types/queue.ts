export type QueuePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type QueueStatus =
  | "PENDING_CHECKIN"
  | "IN_REGISTRATION"
  | "WAITING_TRIAGE"
  | "IN_TRIAGE"
  | "WAITING_PROVIDER"
  | "IN_CONSULT"
  | "WAITING_DIAGNOSTICS"
  | "IN_DIAGNOSTICS"
  | "WAITING_PHARMACY"
  | "IN_PHARMACY"
  | "WAITING_BILLING"
  | "IN_BILLING"
  | "BLOCKED"
  | "NO_SHOW"
  | "CANCELLED"
  | "CLOSED";

export type QueueItem = {
  id: number;
  patientId: number;
  ticketNumber: string;
  visitReason: string;
  status: QueueStatus;
  previousStatus?: QueueStatus | null;
  priority: QueuePriority;
  currentAssigneeId?: string | null;
  departmentId?: string | null;
  createdAt: string;
  slaDueAt?: string | null;
  additionalDetails?: string | null;
  insuranceDetailsIds?: number[];
};

export type QueueSummary = {
  id: number;
  ticketNumber: string;
  patientName: string;
  patientId: number;
  visitReason: string;
  status: QueueStatus;
  priority: QueuePriority;
  currentAssigneeId?: string | null;
  departmentId?: string | null;
  createdAt: string;
  slaDueAt?: string | null;
};

export type QueueTimelineEntry = {
  id: number;
  eventType: "CHECKED_IN" | "ASSIGNED" | "STATUS_CHANGED" | "NOTE";
  fromStatus?: QueueStatus | null;
  toStatus?: QueueStatus | null;
  actorId?: string | null;
  actorRole?: string | null;
  actorDisplayName?: string | null;
  note?: string | null;
  departmentId?: string | null;
  createdAt: string;
};

export type QueueAssignmentPayload = {
  assigneeId: string;
  assigneeDisplayName?: string;
  assigneeRole?: string;
  departmentId?: string;
  note?: string;
};

export type QueueTransitionPayload = {
  targetStatus: QueueStatus;
  actorId?: string;
  actorRole?: string;
  actorDisplayName?: string;
  note?: string;
  departmentId?: string;
};

export type QueueAdvanceAssignPayload = {
  targetStatus: QueueStatus;
  assigneeId: string;
  assigneeRole?: string;
  assigneeDisplayName?: string;
  departmentId?: string;
  note?: string;
};
