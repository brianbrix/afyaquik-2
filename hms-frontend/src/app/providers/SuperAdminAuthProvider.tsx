import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { superAdminApi, SuperAdminUser, SuperAdminRefreshResponse } from '../../services/superAdminApi';
import { setAuthToken } from '../../services/apiClient';

interface SuperAdminAuthState {
  user: SuperAdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
}

interface SuperAdminAuthContextValue {
  user: SuperAdminUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextValue | undefined>(undefined);

const SUPER_ADMIN_SESSION_STORAGE_KEY = 'superAdminSession';

interface StoredSuperAdminSession {
  user: SuperAdminUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

const ACCESS_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SuperAdminAuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null
  });
  const [isInitializing, setIsInitializing] = useState(true);

  const persistSession = useCallback((session: StoredSuperAdminSession | null) => {
    try {
      if (!session) {
        localStorage.removeItem(SUPER_ADMIN_SESSION_STORAGE_KEY);
        localStorage.removeItem('superAdminAccessToken');
        localStorage.removeItem('superAdminRefreshToken');
        localStorage.removeItem('superAdminUser');
      } else {
        localStorage.setItem(SUPER_ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem('superAdminAccessToken', session.accessToken);
        localStorage.setItem('superAdminRefreshToken', session.refreshToken);
        localStorage.setItem('superAdminUser', JSON.stringify(session.user));
      }
    } catch (error) {
      console.warn("Failed to persist super admin session", error);
    }
  }, []);

  const applySession = useCallback((session: StoredSuperAdminSession) => {
    setAuthToken(session.accessToken);
    setState({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt,
      refreshTokenExpiresAt: session.refreshTokenExpiresAt
    });
    persistSession(session);
  }, [persistSession]);

  const resetSession = useCallback(() => {
    setAuthToken(null);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null
    });
    persistSession(null);
  }, [persistSession]);

  const scheduleRefresh = useCallback((session: StoredSuperAdminSession) => {
    const now = Date.now();
    const refreshDeadline = session.refreshTokenExpiresAt - now;
    
    if (refreshDeadline <= 0) {
      resetSession();
      return;
    }

    const accessDelay = session.accessTokenExpiresAt - now - ACCESS_REFRESH_BUFFER_MS;
    const triggerIn = Math.max(accessDelay, 0);

    setTimeout(async () => {
      try {
        const fresh = await superAdminApi.refresh(session.refreshToken);
        const updatedSession: StoredSuperAdminSession = {
          ...session,
          accessToken: fresh.accessToken,
          accessTokenExpiresAt: Date.now() + fresh.expiresIn * 1000
        };
        applySession(updatedSession);
        scheduleRefresh(updatedSession);
      } catch (error) {
        console.error("Failed to refresh super admin access token", error);
        resetSession();
      }
    }, triggerIn);
  }, [applySession, resetSession]);

  const bootstrap = useCallback(async () => {
    const stored = (() => {
      try {
        const raw = localStorage.getItem(SUPER_ADMIN_SESSION_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as StoredSuperAdminSession;
      } catch (error) {
        console.warn("Failed to parse stored super admin session", error);
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
        const refreshed = await superAdminApi.refresh(stored.refreshToken);
        session = {
          ...stored,
          accessToken: refreshed.accessToken,
          accessTokenExpiresAt: Date.now() + refreshed.expiresIn * 1000
        };
      }

      setAuthToken(session.accessToken);
      applySession(session);
      scheduleRefresh(session);
    } catch (error) {
      console.error("Failed to restore super admin session", error);
      resetSession();
    } finally {
      setIsInitializing(false);
    }
  }, [applySession, resetSession, scheduleRefresh]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const response = await superAdminApi.login(credentials);
    const session: StoredSuperAdminSession = {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAt: Date.now() + response.expiresIn * 1000,
      refreshTokenExpiresAt: Date.now() + response.refreshExpiresIn * 1000
    };
    applySession(session);
    scheduleRefresh(session);
  }, [applySession, scheduleRefresh]);

  const logout = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!state.refreshToken) return false;
    
    try {
      const response = await superAdminApi.refresh(state.refreshToken);
      const session: StoredSuperAdminSession = {
        user: state.user!,
        accessToken: response.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiresAt: Date.now() + response.expiresIn * 1000,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt!
      };
      applySession(session);
      return true;
    } catch (error) {
      console.error("Failed to refresh super admin token", error);
      resetSession();
      return false;
    }
  }, [state.refreshToken, state.user, state.refreshTokenExpiresAt, applySession, resetSession]);

  const value: SuperAdminAuthContextValue = {
    user: state.user,
    isAuthenticated: !!state.user,
    isInitializing,
    login,
    logout,
    refreshToken
  };

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth() {
  const context = useContext(SuperAdminAuthContext);
  if (context === undefined) {
    throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
  }
  return context;
}
