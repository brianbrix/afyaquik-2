import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchActiveRole, updateActiveRole } from "../../services/authApi";
import type { RoleKey } from "../../types/roles";

export type { RoleKey } from "../../types/roles";

type RoleContextValue = {
  activeRole: RoleKey;
  availableRoles: RoleKey[];
  setActiveRole: (role: RoleKey) => Promise<void>;
};

export const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({
  children,
  roles = ["provider"],
  defaultRole
}: {
  children: ReactNode;
  roles?: RoleKey[];
  defaultRole?: RoleKey;
}) {
  const resolvedRoles = useMemo<RoleKey[]>(() => {
    if (!roles || roles.length === 0) {
      return ["provider"];
    }
    return Array.from(new Set(roles));
  }, [roles]);

  const [activeRole, setActiveRoleState] = useState<RoleKey>(() => {
    if (defaultRole && resolvedRoles.includes(defaultRole)) {
      return defaultRole;
    }
    return resolvedRoles[0];
  });
  const [availableRoles, setAvailableRoles] = useState<RoleKey[]>(resolvedRoles);

  useEffect(() => {
    setAvailableRoles(resolvedRoles);
    const desiredDefault = defaultRole && resolvedRoles.includes(defaultRole) ? defaultRole : resolvedRoles[0];
    if (!resolvedRoles.includes(activeRole)) {
      setActiveRoleState(desiredDefault);
    }
  }, [activeRole, defaultRole, resolvedRoles]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        if (resolvedRoles.length === 0) {
          return;
        }
        const existingRole = await fetchActiveRole();
        if (mounted && existingRole && resolvedRoles.includes(existingRole)) {
          setActiveRoleState(existingRole);
        }
      } catch (error) {
        console.error("Failed to load active role", error);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [resolvedRoles]);

  const setActiveRole = useCallback(
    async (role: RoleKey) => {
      if (role === activeRole) {
        return;
      }
      const previous = activeRole;
      setActiveRoleState(role);
      try {
        await updateActiveRole(role);
      } catch (error) {
        console.error("Failed to persist active role", error);
        setActiveRoleState(previous);
        throw error;
      }
    },
    [activeRole]
  );

  const value = useMemo(
    () => ({ activeRole, availableRoles, setActiveRole }),
    [activeRole, availableRoles, setActiveRole]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
