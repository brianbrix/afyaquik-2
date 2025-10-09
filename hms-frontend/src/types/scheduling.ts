export type ShiftType =
	| "MORNING"
	| "AFTERNOON"
	| "EVENING"
	| "NIGHT"
	| "ON_CALL"
	| "FLEX";

export const SHIFT_TYPES: readonly ShiftType[] = [
	"MORNING",
	"AFTERNOON",
	"EVENING",
	"NIGHT",
	"ON_CALL",
	"FLEX"
] as const;

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
	MORNING: "Morning",
	AFTERNOON: "Afternoon",
	EVENING: "Evening",
	NIGHT: "Night",
	ON_CALL: "On call",
	FLEX: "Flexible"
};

export type ShiftStatus =
	| "SCHEDULED"
	| "CHECKED_IN"
	| "IN_PROGRESS"
	| "COMPLETED"
	| "CANCELLED"
	| "SWAP_REQUESTED"
	| "SWAPPED";

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
	SCHEDULED: "Scheduled",
	CHECKED_IN: "Checked in",
	IN_PROGRESS: "In progress",
	COMPLETED: "Completed",
	CANCELLED: "Cancelled",
	SWAP_REQUESTED: "Swap requested",
	SWAPPED: "Swapped"
};

export type StaffShift = {
	id: number;
	staffUserId: number;
	staffDisplayName: string;
	roleKey: string;
	departmentId: string;
	shiftType: ShiftType;
	status: ShiftStatus;
	startsAt: string;
	endsAt: string;
	notes?: string | null;
	handoverNotes?: string | null;
};

export type StaffShiftFilters = {
	staffUserId?: number;
	status?: ShiftStatus;
	roleKey?: string;
	departmentId?: string;
	rangeStart?: string;
	rangeEnd?: string;
};

export type CreateStaffShiftPayload = {
	staffUserId: number;
	roleKey: string;
	departmentId: string;
	shiftType: ShiftType;
	startsAt: string;
	endsAt: string;
	notes?: string | null;
};

export type UpdateStaffShiftPayload = {
	staffUserId?: number;
	shiftType?: ShiftType;
	status?: ShiftStatus;
	roleKey?: string;
	departmentId?: string;
	startsAt?: string;
	endsAt?: string;
	notes?: string | null;
	handoverNotes?: string | null;
};

export type ShiftSwapRequestPayload = {
	note: string;
};

export type ShiftSwapApprovalPayload = {
	targetStaffUserId: number;
	note?: string | null;
	handoverNotes?: string | null;
};
