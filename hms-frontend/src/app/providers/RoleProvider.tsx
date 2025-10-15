import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchActiveRole, updateActiveRole } from "../../services/authApi";
import { useAuth } from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
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
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const resolvedRoles = useMemo<RoleKey[]>(() => {
    if (!roles || roles.length === 0) {
      return ["provider"];
    }
    return Array.from(new Set(roles));
  }, [roles]);

  const [activeRole, setActiveRoleState] = useState<RoleKey>(() => {
    // Try to get role from localStorage first
    try {
      const storedRole = localStorage.getItem('activeRole');
      if (storedRole && resolvedRoles.includes(storedRole as RoleKey)) {
        return storedRole as RoleKey;
      }
    } catch (error) {
      console.warn('Failed to read activeRole from localStorage', error);
    }
    // If no valid role in localStorage, return first available role as temporary
    // The bootstrap function will handle the actual role loading and logout if needed
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
              console.log('Syncing role to localStorage', existingRole);
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
        
        // If still no role found, use the first available role as default
        if (!roleToUse) {
          console.warn('No active role found in localStorage or backend, using default role');
          roleToUse = resolvedRoles[0];
          
          // Set this as the active role in the backend
          try {
            await updateActiveRole(roleToUse);
            // Also sync to localStorage
            try {
              localStorage.setItem('activeRole', roleToUse);
            } catch (error) {
              console.warn('Failed to sync default role to localStorage', error);
            }
          } catch (error) {
            console.warn('Failed to set default active role in backend:', error);
            // Continue anyway with the default role
          }
        }
          
        if (mounted) {
          setActiveRoleState(roleToUse);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to load active role", error);
        // On error, use default role instead of logging out
        if (mounted && resolvedRoles.length > 0) {
          console.warn('Error loading active role, using default role');
          const defaultRole = resolvedRoles[0];
          setActiveRoleState(defaultRole);
          setIsInitialized(true);
          
          // Try to set this as the active role in the backend
          try {
            await updateActiveRole(defaultRole);
            localStorage.setItem('activeRole', defaultRole);
          } catch (backendError) {
            console.warn('Failed to set default role in backend:', backendError);
          }
        } else if (mounted && resolvedRoles.length === 0) {
          // Only logout if user has no roles at all
          console.warn('No roles available for user, logging out');
          logout();
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
        // Invalidate permissions cache to trigger refetch with new role
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
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
