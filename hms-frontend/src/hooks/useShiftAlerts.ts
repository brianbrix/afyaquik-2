import { useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchShiftAlerts } from "../services/schedulingApi";
import { useAuth } from "../hooks/useAuth";

export function useShiftAlerts(pollInterval = 30000) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const enabled = Boolean(user?.id);

  const query = useQuery({
    queryKey: ["shift-alerts", user?.id],
    queryFn: () => fetchShiftAlerts(),
    enabled,
    refetchInterval: pollInterval,
  });

  // Optionally, refetch on login
  useEffect(() => {
    if (enabled) queryClient.invalidateQueries({ queryKey: ["shift-alerts", user?.id] });
  }, [enabled, user?.id, queryClient]);

  return query;
}
