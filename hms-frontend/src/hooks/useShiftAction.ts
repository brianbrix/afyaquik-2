import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStaffShift } from "../services/schedulingApi";
import type { StaffShift } from "../types/scheduling";

import type { ShiftStatus } from "../types/scheduling";

export function useShiftAction() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ shift, status }: { shift: StaffShift; status: ShiftStatus }) => {
      // Use PATCH /owner endpoint for CHECKED_IN (owner check-in) or COMPLETED (owner check-out) or IN_PROGRESS (owner check-out), else use PUT
      const useOwnerEndpoint = status === "CHECKED_IN" || status === "COMPLETED" || status === "IN_PROGRESS";
      return updateStaffShift(shift.id, { status }, useOwnerEndpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-alerts"] });
      queryClient.invalidateQueries();
    },
  });
  return mutation;
}
