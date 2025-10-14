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
  defaultRole,
  isAuthenticated
}: {
  children: ReactNode;
  roles?: RoleKey[];
  defaultRole?: RoleKey;
  isAuthenticated?: boolean;
}) {
  const resolvedRoles = useMemo<RoleKey[]>(() => {
    if (!roles || roles.length === 0) {
      return ["provider"];
    }
    return Array.from(new Set(roles));
  }, [roles]);

  const [activeRole, setActiveRoleState] = useState<RoleKey>(() => {
    // Try to get role from localStorage first, then fallback to first available role
    try {
      const storedRole = localStorage.getItem('activeRole');
      if (storedRole && resolvedRoles.includes(storedRole as RoleKey)) {
        return storedRole as RoleKey;
      }
    } catch (error) {
      console.warn('Failed to read activeRole from localStorage', error);
    }
    return resolvedRoles[0];
  });
  const [availableRoles, setAvailableRoles] = useState<RoleKey[]>(resolvedRoles);
  const [isInitialized, setIsInitialized] = useState(false);

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
        if (!isAuthenticated || resolvedRoles.length === 0) {
          setIsInitialized(true);
          return;
        }
        
        // First check localStorage for immediate role restoration
        let roleToUse: RoleKey | null = null;
        try {
          const storedRole = localStorage.getItem('activeRole');
          if (storedRole && resolvedRoles.includes(storedRole as RoleKey)) {
            roleToUse = storedRole as RoleKey;
          }
        } catch (error) {
          console.warn('Failed to read activeRole from localStorage', error);
        }
        
        // If no localStorage role, try backend
        if (!roleToUse) {
          try {
            const existingRole = await fetchActiveRole();
            if (existingRole && resolvedRoles.includes(existingRole)) {
              roleToUse = existingRole;
              // Sync to localStorage for next time
              try {
                localStorage.setItem('activeRole', existingRole);
              } catch (error) {
                console.warn('Failed to sync role to localStorage', error);
              }
            }
          } catch (error) {
            console.error("Failed to load active role from backend", error);
          }
        }
        
        if (mounted) {
          if (roleToUse) {
            setActiveRoleState(roleToUse);
          } else {
            // Fallback to default role
            const desiredDefault = defaultRole && resolvedRoles.includes(defaultRole) ? defaultRole : resolvedRoles[0];
            setActiveRoleState(desiredDefault);
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to load active role", error);
        // On error, use default role
        if (mounted) {
          const desiredDefault = defaultRole && resolvedRoles.includes(defaultRole) ? defaultRole : resolvedRoles[0];
          setActiveRoleState(desiredDefault);
          setIsInitialized(true);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [resolvedRoles, isAuthenticated, defaultRole]);

  const setActiveRole = useCallback(
    async (role: RoleKey) => {
      if (role === activeRole) {
        return;
      }
      const previous = activeRole;
      setActiveRoleState(role);
      
      // Persist to localStorage immediately for fast access
      try {
        localStorage.setItem('activeRole', role);
      } catch (error) {
        console.warn('Failed to persist activeRole to localStorage', error);
      }
      
      try {
        await updateActiveRole(role);
      } catch (error) {
        console.error("Failed to persist active role to backend", error);
        // Don't revert on backend error - localStorage will handle persistence
        // setActiveRoleState(previous);
        // throw error;
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
