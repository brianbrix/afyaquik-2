import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./apiClient";
import type { RoleKey } from "../types/roles";

type ActiveRoleResponse = {
  role: RoleKey;
};

export type UserProfile = {
  id: number;
  username: string;
  displayName: string;
  tenantId: string;
  roles: RoleKey[];
};

export type LoginResponse = {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  user: UserProfile;
};

export type RefreshResponse = {
  accessToken: string;
  accessTokenExpiresIn: number;
};

function unwrap<T>(raw: any): T {
  if (raw && typeof raw === "object" && "data" in raw && raw.data) {
    return raw.data as T;
  }
  return raw as T;
}

export async function login(
  tenantId: string,
  credentials: { username: string; password: string }
): Promise<LoginResponse> {
  const response = await apiClient.post<any>("/auth/login", credentials, {
    headers: { "X-Tenant-Id": tenantId }
  });
  return unwrap<LoginResponse>(response.data);
}

export async function refreshAccessToken(
  tenantId: string,
  refreshToken: string
): Promise<RefreshResponse> {
  const response = await apiClient.post<any>(
    "/auth/refresh",
    { refreshToken },
    {
      headers: { "X-Tenant-Id": tenantId }
    }
  );
  return unwrap<RefreshResponse>(response.data);
}

export async function fetchProfile(): Promise<UserProfile> {
  const response = await apiClient.get<any>("/auth/me");
  return unwrap<UserProfile>(response.data);
}

export async function fetchActiveRole(): Promise<RoleKey | null> {
  const config: AxiosRequestConfig = {
    url: "/auth/active-role",
    method: "get",
    validateStatus: (status) => (status >= 200 && status < 300) || status === 204
  };

  const response = await apiClient.request<ActiveRoleResponse>(config);

  if (response.status === 204 || !response.data) {
    return null;
  }

  return response.data.role;
}

export async function updateActiveRole(role: RoleKey): Promise<RoleKey> {
  const response = await apiClient.post<ActiveRoleResponse>("/auth/active-role", { role });
  return response.data.role;
}
