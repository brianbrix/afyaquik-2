
import { apiClient } from "./apiClient";
import type {
	StaffShift,
	StaffShiftFilters,
	CreateStaffShiftPayload,
	UpdateStaffShiftPayload,
	ShiftSwapRequestPayload,
	ShiftSwapApprovalPayload
} from "../types/scheduling";

// Helper function to format date for backend (removes timezone info)
const formatDateForBackend = (dateString: string): string => {
	if (!dateString) return dateString;
	
	// If it's already in the correct format (no timezone), return as is
	if (!dateString.includes('+') && !dateString.includes('Z')) {
		return dateString;
	}
	
	// Parse the date and format it without timezone
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};


// Fetch pending check-in/out alerts for the logged-in staff
export async function fetchShiftAlerts(): Promise<StaffShift[]> {
	const response = await apiClient.get<StaffShift[]>("/scheduling/shifts/alerts");
	return response.data;
}
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export async function fetchStaffShifts(filters: StaffShiftFilters = {}, page = 0, size = 20): Promise<PageResponse<StaffShift>> {
    const response = await apiClient.get<PageResponse<StaffShift>>("/scheduling/shifts", {
        params: {
            ...filters,
            page,
            size,
            staffUserId: filters.staffUserId ?? undefined,
            status: filters.status ?? undefined,
            roleId: filters.roleId ?? undefined,
            departmentId: filters.departmentId ?? undefined,
            shiftType: filters.shiftType ?? undefined,
            rangeStart: filters.rangeStart ? formatDateForBackend(filters.rangeStart) : undefined,
            rangeEnd: filters.rangeEnd ? formatDateForBackend(filters.rangeEnd) : undefined
        }
    });
    return response.data as any;
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
