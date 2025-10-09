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

const shiftsKey = (filters: StaffShiftFilters) => ["scheduling", "shifts", filters];

export function useStaffShiftsList(filters: StaffShiftFilters) {
	return useQuery<StaffShift[]>({
		queryKey: shiftsKey(filters),
		queryFn: () => fetchStaffShifts(filters)
	});
}

export function useCreateStaffShift(filters: StaffShiftFilters) {
	const queryClient = useQueryClient();
	return useMutation<StaffShift, Error, CreateStaffShiftPayload>({
		mutationFn: createStaffShift,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: shiftsKey(filters) });
		}
	});
}

export function useUpdateStaffShift(filters: StaffShiftFilters) {
	const queryClient = useQueryClient();
	return useMutation<StaffShift, Error, { shiftId: number; payload: UpdateStaffShiftPayload }>({
		mutationFn: ({ shiftId, payload }: { shiftId: number; payload: UpdateStaffShiftPayload }) =>
			updateStaffShift(shiftId, payload),
		onSuccess: async (
			_data: StaffShift,
			variables: { shiftId: number; payload: UpdateStaffShiftPayload }
		) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: shiftsKey(filters) }),
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
			await queryClient.invalidateQueries({ queryKey: shiftsKey(filters) });
		}
	});
}

export function useApproveShiftSwap(filters: StaffShiftFilters) {
	const queryClient = useQueryClient();
	return useMutation<StaffShift, Error, { shiftId: number; payload: ShiftSwapApprovalPayload }>({
		mutationFn: ({ shiftId, payload }: { shiftId: number; payload: ShiftSwapApprovalPayload }) =>
			approveShiftSwap(shiftId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: shiftsKey(filters) });
		}
	});
}
