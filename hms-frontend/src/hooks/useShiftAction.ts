import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStaffShift } from "../services/schedulingApi";
import type { StaffShift } from "../types/scheduling";

import type { ShiftStatus } from "../types/scheduling";

export function useShiftAction() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ shift, status }: { shift: StaffShift; status: ShiftStatus }) => {
      return updateStaffShift(shift.id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-alerts"] });
      queryClient.invalidateQueries();
    },
  });
  return mutation;
}
