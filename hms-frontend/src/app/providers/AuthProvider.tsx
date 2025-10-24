import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { fetchRoleRedirects, RoleRedirectUrl } from "../../services/roleRedirectApi";
import { DEFAULT_TENANT_ID, setAuthToken, setTenantHeader } from "../../services/apiClient";
import {
  fetchProfile,
  login as loginRequest,
  refreshAccessToken,
  type LoginResponse,
  type UserProfile
} from "../../services/authApi";


export const AUTH_SESSION_STORAGE_KEY = "afyaquik.hms.session";
const ACCESS_REFRESH_BUFFER_MS = 60_000; // refresh 60s before expiry when possible

type StoredSession = {
  tenantId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  user: UserProfile;
};

type AuthState = {
  user: UserProfile | null;
  tenantId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
};

type Credentials = {
  username: string;
  password: string;
};

type AuthContextValue = {
  user: UserProfile | null;
  tenantId: string;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  isTokenExpired: boolean;
  login: (tenantId: string, credentials: Credentials) => Promise<{ roleRedirects: RoleRedirectUrl[] } | void>;
  logout: () => void;
  clearError: () => void;
  ensureFreshAccessToken: () => Promise<string | null>;
};

const defaultState: AuthState = {
  user: null,
  tenantId: DEFAULT_TENANT_ID,
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const persistSession = useCallback((session: StoredSession | null) => {
    try {
      if (!session) {
        window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      } else {
        window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
      }
    } catch (error) {
      console.warn("Failed to persist session", error);
    }
  }, []);

  const applySession = useCallback(
    (session: StoredSession) => {
      setTenantHeader(session.tenantId);
      setAuthToken(session.accessToken);
      setState({
        user: session.user,
        tenantId: session.tenantId,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt,
        refreshTokenExpiresAt: session.refreshTokenExpiresAt
      });
      persistSession(session);
    },
    [persistSession]
  );

  const resetSession = useCallback((reason?: string) => {
    clearRefreshTimer();
    setAuthToken(null);
    setTenantHeader(DEFAULT_TENANT_ID);
    setState(defaultState);
    persistSession(null);
    
    // Set appropriate error message based on reason
    if (reason === 'token_expired') {
      setAuthError("Your session has expired. Please login again.");
    } else {
      setAuthError(null);
    }
    
    // Clear activeRole from localStorage on logout
    try {
      localStorage.removeItem('activeRole');
    } catch (error) {
      console.warn('Failed to clear activeRole from localStorage', error);
    }
  }, [clearRefreshTimer, persistSession]);

  const scheduleRefresh = useCallback(
    (session: StoredSession) => {
      clearRefreshTimer();
      const now = Date.now();
      const refreshDeadline = session.refreshTokenExpiresAt - now;
      if (refreshDeadline <= 0) {
        resetSession('token_expired');
        return;
      }

      const accessDelay = session.accessTokenExpiresAt - now - ACCESS_REFRESH_BUFFER_MS;
      const triggerIn = Math.max(accessDelay, 0);

      refreshTimerRef.current = setTimeout(async () => {
        try {
          // Check if we're offline before attempting refresh
          if (!navigator.onLine) {
            console.log("Offline - cannot refresh token, checking if expired");
            const accessTokenExpired = session.accessTokenExpiresAt <= Date.now();
            if (accessTokenExpired) {
              console.log("Access token expired while offline - logging out user");
              resetSession('token_expired');
              return;
            }
            // Token is still valid, reschedule check
            scheduleRefresh(session);
            return;
          }
          
          const fresh = await refreshAccessToken(session.tenantId, session.refreshToken);
          const updatedSession: StoredSession = {
            ...session,
            accessToken: fresh.accessToken,
            accessTokenExpiresAt: Date.now() + fresh.accessTokenExpiresIn * 1000
          };
          applySession(updatedSession);
          scheduleRefresh(updatedSession);
        } catch (error) {
          console.error("Failed to refresh access token", error);
          resetSession('token_expired');
        }
      }, triggerIn);
    },
    [applySession, clearRefreshTimer, resetSession]
  );

  // No static role normalization; use backend-provided roles as-is
  const normalizeUser = useCallback((user: LoginResponse["user"] | UserProfile): UserProfile => {
    return {
      ...user,
      roles: (user.roles ?? [])
    };
  }, []);

  const bootstrap = useCallback(async () => {
    const stored = (() => {
      try {
        const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as StoredSession;
      } catch (error) {
        console.warn("Failed to parse stored session", error);
        return null;
      }
    })();

    if (!stored) {
      setIsInitializing(false);
      return;
    }

    if (stored.refreshTokenExpiresAt <= Date.now()) {
      resetSession();
      setIsInitializing(false);
      return;
    }

    // Check if we're offline
    const isOffline = !navigator.onLine;
    
    if (isOffline) {
      console.log("Offline mode detected - using cached session data");
      
      // Check if access token has expired
      const accessTokenExpired = stored.accessTokenExpiresAt <= Date.now();
      
      if (accessTokenExpired) {
        console.log("Access token expired in offline mode - logging out user");
        // Token expired, logout user and show clear message
        resetSession('token_expired');
        setIsInitializing(false);
        return;
      }
      
      // Use cached session data directly without network requests
      setTenantHeader(stored.tenantId);
      setAuthToken(stored.accessToken);
      setState({
        user: stored.user,
        tenantId: stored.tenantId,
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        accessTokenExpiresAt: stored.accessTokenExpiresAt,
        refreshTokenExpiresAt: stored.refreshTokenExpiresAt
      });
      setIsInitializing(false);
      return;
    }

    let session = stored;
    try {
      const needsRefresh = stored.accessTokenExpiresAt <= Date.now() + ACCESS_REFRESH_BUFFER_MS;
      if (needsRefresh) {
        const refreshed = await refreshAccessToken(stored.tenantId, stored.refreshToken);
        session = {
          ...stored,
          accessToken: refreshed.accessToken,
          accessTokenExpiresAt: Date.now() + refreshed.accessTokenExpiresIn * 1000
        };
      }

      setTenantHeader(session.tenantId);
      setAuthToken(session.accessToken);

      const profile = await fetchProfile();
      const normalizedUser = normalizeUser(profile);
      const hydratedSession: StoredSession = { ...session, user: normalizedUser };
      applySession(hydratedSession);
      scheduleRefresh(hydratedSession);
    } catch (error) {
      console.error("Failed to restore session", error);
      // If online but network fails, try to use cached data as fallback
      if (stored.user) {
        console.log("Network failed - falling back to cached session data");
        setTenantHeader(stored.tenantId);
        setAuthToken(stored.accessToken);
        setState({
          user: stored.user,
          tenantId: stored.tenantId,
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
          accessTokenExpiresAt: stored.accessTokenExpiresAt,
          refreshTokenExpiresAt: stored.refreshTokenExpiresAt
        });
      } else {
        resetSession();
      }
    } finally {
      setIsInitializing(false);
    }
  }, [applySession, normalizeUser, resetSession, scheduleRefresh]);

  useEffect(() => {
    bootstrap();
    
    // Listen for online events to handle token expiration recovery
    const handleOnline = () => {
      console.log("Network connection restored");
      // If user was logged out due to token expiration, they can now login again
      if (authError && authError.includes("session has expired")) {
        console.log("User can now login again after token expiration");
        setAuthError(null); // Clear the error so user can attempt login
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearRefreshTimer();
      window.removeEventListener('online', handleOnline);
    };
  }, [bootstrap, clearRefreshTimer, authError]);

  const login = useCallback(
    async (tenantId: string, credentials: Credentials) => {
      setIsAuthenticating(true);
      setAuthError(null);
      
      // Check if we're offline
      const isOffline = !navigator.onLine;
      
      if (isOffline) {
        console.log("Offline mode detected - attempting offline login");
        
        // Try to find existing session for the user
        const stored = (() => {
          try {
            const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as StoredSession;
          } catch (error) {
            console.warn("Failed to parse stored session", error);
            return null;
          }
        })();
        
        if (stored && stored.user && stored.refreshTokenExpiresAt > Date.now()) {
          console.log("Found valid cached session for offline login");
          
          // Check if access token has expired
          const accessTokenExpired = stored.accessTokenExpiresAt <= Date.now();
          
          if (accessTokenExpired) {
            console.log("Access token expired in offline mode - logging out user");
            resetSession('token_expired');
            setIsAuthenticating(false);
            throw new Error("Access token expired - session cleared");
          }
          
          // Use cached session data
          setTenantHeader(stored.tenantId);
          setAuthToken(stored.accessToken);
          setState({
            user: stored.user,
            tenantId: stored.tenantId,
            accessToken: stored.accessToken,
            refreshToken: stored.refreshToken,
            accessTokenExpiresAt: stored.accessTokenExpiresAt,
            refreshTokenExpiresAt: stored.refreshTokenExpiresAt
          });
          setIsAuthenticating(false);
          return { roleRedirects: [] }; // Return empty role redirects for offline
        } else {
          console.log("No valid cached session found for offline login");
          setAuthError("No cached session found. Please connect to the internet to login.");
          setIsAuthenticating(false);
          throw new Error("No cached session found for offline login");
        }
      }
      
      try {
        const response = await loginRequest(tenantId, credentials);
        const normalizedUser = normalizeUser(response.user);
        // Prefer tenant from profile (authoritative) over user-entered tenantId
        const resolvedTenant = normalizedUser.tenantId ?? tenantId;
        const session: StoredSession = {
          tenantId: resolvedTenant,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          accessTokenExpiresAt: Date.now() + response.accessTokenExpiresIn * 1000,
          refreshTokenExpiresAt: Date.now() + response.refreshTokenExpiresIn * 1000,
          user: normalizedUser
        };
        applySession(session);
        scheduleRefresh(session);
        // Fetch per-role redirect URLs after login
        const roleRedirects = await fetchRoleRedirects();
        return { roleRedirects };
      } catch (error) {
        console.error("Login failed", error);
        setAuthError("Invalid credentials or tenant");
        throw error;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [applySession, normalizeUser, scheduleRefresh]
  );

  const logout = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const ensureFreshAccessToken = useCallback(async () => {
    const { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, tenantId } = state;
    if (!accessToken || !accessTokenExpiresAt || !refreshToken || !refreshTokenExpiresAt) {
      return null;
    }
    
    // Check if we're offline
    const isOffline = !navigator.onLine;
    
    if (isOffline) {
      console.log("Offline mode - checking token validity");
      
      // Check if access token has expired
      const accessTokenExpired = accessTokenExpiresAt <= Date.now();
      
      if (accessTokenExpired) {
        console.log("Access token expired in offline mode - logging out user");
        // Token expired, logout user and show clear message
        resetSession('token_expired');
        return null;
      }
      
      // In offline mode, return the existing token if it's still valid
      console.log("Offline mode - using existing valid token");
      return accessToken;
    }
    
    const now = Date.now();
    if (accessTokenExpiresAt - now > ACCESS_REFRESH_BUFFER_MS) {
      return accessToken;
    }
    if (refreshTokenExpiresAt <= now) {
      resetSession();
      return null;
    }
    try {
      const refreshed = await refreshAccessToken(tenantId, refreshToken);
      const session: StoredSession = {
        tenantId,
        refreshToken,
        refreshTokenExpiresAt,
        accessToken: refreshed.accessToken,
        accessTokenExpiresAt: Date.now() + refreshed.accessTokenExpiresIn * 1000,
        user: state.user ?? normalizeUser(await fetchProfile())
      };
      applySession(session);
      scheduleRefresh(session);
      return session.accessToken;
    } catch (error) {
      console.error("Failed to ensure fresh token", error);
      // If online but network fails, try to use existing token as fallback
      if (isOffline || !navigator.onLine) {
        console.log("Network failed - using existing token as fallback");
        return accessToken;
      }
      resetSession();
      return null;
    }
  }, [applySession, normalizeUser, resetSession, scheduleRefresh, state]);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(state.accessToken && state.user);
    const isTokenExpired = Boolean(
      state.accessToken && 
      state.accessTokenExpiresAt && 
      state.accessTokenExpiresAt <= Date.now()
    );
    return {
      user: state.user,
      tenantId: state.tenantId,
      isAuthenticated,
      isInitializing,
      isAuthenticating,
      authError,
      isTokenExpired,
      login,
      logout,
      clearError: () => setAuthError(null),
      ensureFreshAccessToken
    };
  }, [authError, ensureFreshAccessToken, isAuthenticating, isInitializing, login, logout, state.user, state.tenantId, state.accessToken, state.accessTokenExpiresAt]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}