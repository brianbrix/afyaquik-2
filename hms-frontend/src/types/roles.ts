export type RoleKey =
  | "reception"
  | "triage"
  | "provider"
  | "pharmacy"
  | "billing"
  | "admin";

export const ROLE_KEYS: readonly RoleKey[] = [
  "reception",
  "triage",
  "provider",
  "pharmacy",
  "billing",
  "admin"
] as const;

export function isRoleKey(value: string): value is RoleKey {
  return (ROLE_KEYS as readonly string[]).includes(value);
}
