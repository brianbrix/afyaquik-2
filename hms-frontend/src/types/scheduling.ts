

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
		roleId: number;
		roleName: string;
		departmentId: number;
		departmentName: string;
		shiftType: number;
		status: ShiftStatus;
		startsAt: string;
		endsAt: string;
		notes?: string | null;
		handoverNotes?: string | null;
	};


	export type StaffShiftFilters = {
		staffUserId?: number;
		status?: ShiftStatus;
		roleId?: number;
		departmentId?: number;
		shiftType?: number;
		rangeStart?: string;
		rangeEnd?: string;
	};


	export type CreateStaffShiftPayload = {
		staffUserId: number;
		roleId: number;
		departmentId: number;
		shiftType: number;
		startsAt: string;
		endsAt: string;
		notes?: string | null;
	};


	export type UpdateStaffShiftPayload = {
		staffUserId?: number;
		shiftType?: number;
		status?: ShiftStatus;
		roleId?: number;
		departmentId?: number;
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
