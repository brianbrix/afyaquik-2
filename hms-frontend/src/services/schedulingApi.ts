import { apiClient } from "./apiClient";
import type {
	StaffShift,
	StaffShiftFilters,
	CreateStaffShiftPayload,
	UpdateStaffShiftPayload,
	ShiftSwapRequestPayload,
	ShiftSwapApprovalPayload
} from "../types/scheduling";

export async function fetchStaffShifts(filters: StaffShiftFilters = {}): Promise<StaffShift[]> {
	const response = await apiClient.get<StaffShift[]>("/api/v1/scheduling/shifts", {
		params: {
			...filters,
			staffUserId: filters.staffUserId ?? undefined,
			status: filters.status ?? undefined,
			roleKey: filters.roleKey ?? undefined,
			departmentId: filters.departmentId ?? undefined,
			rangeStart: filters.rangeStart ?? undefined,
			rangeEnd: filters.rangeEnd ?? undefined
		}
	});
	return response.data;
}

export async function createStaffShift(payload: CreateStaffShiftPayload): Promise<StaffShift> {
	const response = await apiClient.post<StaffShift>("/api/v1/scheduling/shifts", payload);
	return response.data;
}

export async function updateStaffShift(
	shiftId: number,
	payload: UpdateStaffShiftPayload
): Promise<StaffShift> {
	const response = await apiClient.put<StaffShift>(`/api/v1/scheduling/shifts/${shiftId}`, payload);
	return response.data;
}

export async function requestShiftSwap(
	shiftId: number,
	payload: ShiftSwapRequestPayload
): Promise<StaffShift> {
	const response = await apiClient.post<StaffShift>(
		`/api/v1/scheduling/shifts/${shiftId}/swap-request`,
		payload
	);
	return response.data;
}

export async function approveShiftSwap(
	shiftId: number,
	payload: ShiftSwapApprovalPayload
): Promise<StaffShift> {
	const response = await apiClient.post<StaffShift>(
		`/api/v1/scheduling/shifts/${shiftId}/swap-approve`,
		payload
	);
	return response.data;
}
