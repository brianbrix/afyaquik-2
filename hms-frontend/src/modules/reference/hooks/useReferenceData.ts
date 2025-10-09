import { useQuery } from "@tanstack/react-query";
import { fetchRoles, fetchDepartments } from "../../../services/referenceApi";

export function useRoles() {
  return useQuery({
    queryKey: ["reference", "roles"],
    queryFn: fetchRoles,
    staleTime: 5 * 60 * 1000
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["reference", "departments"],
    queryFn: fetchDepartments,
    staleTime: 5 * 60 * 1000
  });
}
