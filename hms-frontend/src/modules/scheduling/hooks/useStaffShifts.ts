import { fetchShiftAlerts } from "../../../services/schedulingApi";

export function useShiftAlerts(pollInterval = 60000) {
	return useQuery<StaffShift[]>({
		queryKey: ["scheduling", "shift-alerts"],
		queryFn: fetchShiftAlerts,
		refetchInterval: pollInterval,
	});
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	approveShiftSwap,
	createStaffShift,
	fetchStaffShifts,
	requestShiftSwap,
	updateStaffShift
} from "../../../services/schedulingApi";
import type {
	StaffShift,
	StaffShiftFilters,
	CreateStaffShiftPayload,
	UpdateStaffShiftPayload,
	ShiftSwapApprovalPayload,
	ShiftSwapRequestPayload
} from "../../../types/scheduling";

const shiftsKey = (filters: StaffShiftFilters, page?: number, size?: number) => ["scheduling", "shifts", filters, page, size];

export function useStaffShiftsList(filters: StaffShiftFilters, page: number = 0, size: number = 20) {
    return useQuery({
        queryKey: shiftsKey(filters, page, size),
        queryFn: () => fetchStaffShifts(filters, page, size)
    });
}

export function useCreateStaffShift(filters: StaffShiftFilters) {
	const queryClient = useQueryClient();
	return useMutation<StaffShift, Error, CreateStaffShiftPayload>({
		mutationFn: createStaffShift,
		onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["scheduling","shifts"] });
		}
	});
}

export function useUpdateStaffShift(filters: StaffShiftFilters) {
	const queryClient = useQueryClient();
	return useMutation<StaffShift, Error, { shiftId: number; payload: UpdateStaffShiftPayload; useOwnerEndpoint?: boolean }>({
		mutationFn: ({ shiftId, payload, useOwnerEndpoint }: { shiftId: number; payload: UpdateStaffShiftPayload; useOwnerEndpoint?: boolean }) =>
			updateStaffShift(shiftId, payload, !!useOwnerEndpoint),
		onSuccess: async (
			_data: StaffShift,
			variables: { shiftId: number; payload: UpdateStaffShiftPayload }
		) => {
			await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["scheduling","shifts"] }),
				queryClient.invalidateQueries({ queryKey: ["scheduling", "shift", variables.shiftId] })
			]);
		}
	});
}

export function useRequestShiftSwap(filters: StaffShiftFilters) {
	const queryClient = useQueryClient();
	return useMutation<StaffShift, Error, { shiftId: number; payload: ShiftSwapRequestPayload }>({
		mutationFn: ({ shiftId, payload }: { shiftId: number; payload: ShiftSwapRequestPayload }) =>
			requestShiftSwap(shiftId, payload),
		onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["scheduling","shifts"] });
		}
	});
}

export function useApproveShiftSwap(filters: StaffShiftFilters) {
	const queryClient = useQueryClient();
	return useMutation<StaffShift, Error, { shiftId: number; payload: ShiftSwapApprovalPayload }>({
		mutationFn: ({ shiftId, payload }: { shiftId: number; payload: ShiftSwapApprovalPayload }) =>
			approveShiftSwap(shiftId, payload),
		onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["scheduling","shifts"] });
		}
	});
}
