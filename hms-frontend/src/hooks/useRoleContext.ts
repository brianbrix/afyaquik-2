import { useContext } from "react";
import { RoleContext } from "../app/providers/RoleProvider";

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return ctx;
}
