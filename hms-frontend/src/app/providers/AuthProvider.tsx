import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { DEFAULT_TENANT_ID, setAuthToken, setTenantHeader } from "../../services/apiClient";
import {
  fetchProfile,
  login as loginRequest,
  refreshAccessToken,
  type LoginResponse,
  type UserProfile
} from "../../services/authApi";
import { isRoleKey, type RoleKey } from "../../types/roles";

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
  login: (tenantId: string, credentials: Credentials) => Promise<void>;
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

  const resetSession = useCallback(() => {
    clearRefreshTimer();
    setAuthToken(null);
    setTenantHeader(DEFAULT_TENANT_ID);
    setState(defaultState);
    persistSession(null);
    setAuthError(null);
  }, [clearRefreshTimer, persistSession]);

  const scheduleRefresh = useCallback(
    (session: StoredSession) => {
      clearRefreshTimer();
      const now = Date.now();
      const refreshDeadline = session.refreshTokenExpiresAt - now;
      if (refreshDeadline <= 0) {
        resetSession();
        return;
      }

      const accessDelay = session.accessTokenExpiresAt - now - ACCESS_REFRESH_BUFFER_MS;
      const triggerIn = Math.max(accessDelay, 0);

      refreshTimerRef.current = setTimeout(async () => {
        try {
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
          resetSession();
        }
      }, triggerIn);
    },
    [applySession, clearRefreshTimer, resetSession]
  );

  const normalizeUser = useCallback((user: LoginResponse["user"] | UserProfile): UserProfile => {
    const normalizedRoles = (user.roles ?? [])
      .map((role) => role.toLowerCase())
      .filter((role): role is RoleKey => isRoleKey(role));

    const roles: RoleKey[] = normalizedRoles.length > 0 ? normalizedRoles : ["provider"];

    return {
      ...user,
      roles
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
      resetSession();
    } finally {
      setIsInitializing(false);
    }
  }, [applySession, normalizeUser, resetSession, scheduleRefresh]);

  useEffect(() => {
    bootstrap();
    return () => clearRefreshTimer();
  }, [bootstrap, clearRefreshTimer]);

  const login = useCallback(
    async (tenantId: string, credentials: Credentials) => {
      setIsAuthenticating(true);
      setAuthError(null);
      try {
        const response = await loginRequest(tenantId, credentials);
        const normalizedUser = normalizeUser(response.user);
        const session: StoredSession = {
          tenantId,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          accessTokenExpiresAt: Date.now() + response.accessTokenExpiresIn * 1000,
          refreshTokenExpiresAt: Date.now() + response.refreshTokenExpiresIn * 1000,
          user: normalizedUser
        };
        applySession(session);
        scheduleRefresh(session);
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
      resetSession();
      return null;
    }
  }, [applySession, normalizeUser, resetSession, scheduleRefresh, state]);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(state.accessToken && state.user);
    return {
      user: state.user,
      tenantId: state.tenantId,
      isAuthenticated,
      isInitializing,
      isAuthenticating,
      authError,
      login,
      logout,
      clearError: () => setAuthError(null),
      ensureFreshAccessToken
    };
  }, [authError, ensureFreshAccessToken, isAuthenticating, isInitializing, login, logout, state.user, state.tenantId, state.accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}