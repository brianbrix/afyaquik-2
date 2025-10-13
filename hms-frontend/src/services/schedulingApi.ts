
import { apiClient } from "./apiClient";
import type {
	StaffShift,
	StaffShiftFilters,
	CreateStaffShiftPayload,
	UpdateStaffShiftPayload,
	ShiftSwapRequestPayload,
	ShiftSwapApprovalPayload
} from "../types/scheduling";


// Fetch pending check-in/out alerts for the logged-in staff
export async function fetchShiftAlerts(): Promise<StaffShift[]> {
	const response = await apiClient.get<StaffShift[]>("/scheduling/shifts/alerts");
	return response.data;
}
export async function fetchStaffShifts(filters: StaffShiftFilters = {}): Promise<StaffShift[]> {
	const response = await apiClient.get<StaffShift[]>("/scheduling/shifts", {
		params: {
			...filters,
			staffUserId: filters.staffUserId ?? undefined,
			status: filters.status ?? undefined,
			roleId: filters.roleId ?? undefined,
			departmentId: filters.departmentId ?? undefined,
			shiftType: filters.shiftType ?? undefined,
			rangeStart: filters.rangeStart ?? undefined,
			rangeEnd: filters.rangeEnd ?? undefined
		}
	});
	return response.data;
}

export async function createStaffShift(payload: CreateStaffShiftPayload): Promise<StaffShift> {
	const response = await apiClient.post<StaffShift>("/scheduling/shifts", payload);
	return response.data;
}

import { hasPermission, useResolvedPermissions } from "../hooks/usePermissions";

export async function updateStaffShift(
	shiftId: number,
	payload: UpdateStaffShiftPayload,
	useOwnerEndpoint = false
): Promise<StaffShift> {
	// If useOwnerEndpoint is true, use PATCH /owner endpoint
	if (useOwnerEndpoint) {
		const response = await apiClient.patch<StaffShift>(`/scheduling/shifts/${shiftId}/owner`, payload);
		return response.data;
	} else {
		const response = await apiClient.put<StaffShift>(`/scheduling/shifts/${shiftId}`, payload);
		return response.data;
	}
}

export async function requestShiftSwap(
	shiftId: number,
	payload: ShiftSwapRequestPayload
): Promise<StaffShift> {
	const response = await apiClient.post<StaffShift>(
		`/scheduling/shifts/${shiftId}/swap-request`,
		payload
	);
	return response.data;
}

export async function approveShiftSwap(
	shiftId: number,
	payload: ShiftSwapApprovalPayload
): Promise<StaffShift> {
	const response = await apiClient.post<StaffShift>(
		`/scheduling/shifts/${shiftId}/swap-approve`,
		payload
	);
	return response.data;
}
