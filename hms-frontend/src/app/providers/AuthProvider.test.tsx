import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, AUTH_SESSION_STORAGE_KEY } from "./AuthProvider";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../services/apiClient";
import * as authApi from "../../services/authApi";
import type { RoleKey } from "../../types/roles";

vi.mock("../../services/authApi", () => ({
  login: vi.fn(),
  refreshAccessToken: vi.fn(),
  fetchProfile: vi.fn()
}));

const mockedAuthApi = vi.mocked(authApi);

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    delete apiClient.defaults.headers.common.Authorization;
    mockedAuthApi.login.mockReset();
    mockedAuthApi.fetchProfile.mockReset();
    mockedAuthApi.refreshAccessToken.mockReset();
    mockedAuthApi.refreshAccessToken.mockResolvedValue({ accessToken: "refreshed", accessTokenExpiresIn: 900 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("logs in and stores session", async () => {
  const loginResponse = {
      accessToken: "access-token",
      accessTokenExpiresIn: 900,
      refreshToken: "refresh-token",
      refreshTokenExpiresIn: 604800,
      user: {
        id: 1,
        username: "demo",
        displayName: "Demo User",
        tenantId: "tenantA",
  roles: ["PROVIDER"] as RoleKey[]
      }
    };

  mockedAuthApi.login.mockResolvedValue(loginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("tenantA", { username: "demo", password: "pass" });
    });

    expect(result.current.user?.username).toBe("demo");
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toContain("access-token");
    expect(apiClient.defaults.headers.common.Authorization).toBe("Bearer access-token");
  });

  it("restores session from storage", async () => {
  const storedSession = {
      tenantId: "tenantA",
      accessToken: "stored-access",
      refreshToken: "stored-refresh",
      accessTokenExpiresAt: Date.now() + 300_000,
      refreshTokenExpiresAt: Date.now() + 3_600_000,
      user: {
        id: 2,
        username: "reception",
        displayName: "Reception Desk",
        tenantId: "tenantA",
  roles: ["RECEPTION"] as RoleKey[]
      }
    };

    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(storedSession));
  mockedAuthApi.fetchProfile.mockResolvedValue(storedSession.user);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe("reception");
    expect(apiClient.defaults.headers.common.Authorization).toBe("Bearer stored-access");
  });

  it("clears session on logout", async () => {
  const loginResponse = {
      accessToken: "token",
      accessTokenExpiresIn: 900,
      refreshToken: "refresh",
      refreshTokenExpiresIn: 604800,
      user: {
        id: 3,
        username: "triage",
        displayName: "Triage Nurse",
        tenantId: "tenantA",
  roles: ["TRIAGE"] as RoleKey[]
      }
    };

  mockedAuthApi.login.mockResolvedValue(loginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("tenantA", { username: "triage", password: "pass" });
    });

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)).toBeNull();
    expect(apiClient.defaults.headers.common.Authorization).toBeUndefined();
  });
});
