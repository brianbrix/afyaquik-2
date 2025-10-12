import { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { ShiftType } from "../types/shiftType";

export function useShiftTypes() {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<{ data: ShiftType[] }>("/scheduling/shift-types")
      .then(res => setShiftTypes(res.data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { shiftTypes, loading, error };
}
