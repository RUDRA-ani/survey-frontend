
import api from "@/shared/api/axiosInstance";
import { setTokens, clearTokens } from "@/shared/api/authStorage";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
}

export interface AuthResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Login
export async function loginAdmin(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  const result = response.data;

  if (result.success && result.data?.token) {
    clearTokens();

    setTokens({
      accessToken: result.data.token,
    });
  }

  return result;
}

// Get currently authenticated admin
export async function getCurrentAdmin(): Promise<AdminUser> {
  const response = await api.get<AuthResponse<AdminUser>>(
    "/auth/me"
  );

  return response.data.data;
}

// Forgot password
export async function forgotAdminPassword(
  email: string
): Promise<AuthResponse<null>> {
  const response = await api.post<AuthResponse<null>>(
    "/auth/forgot-password",
    { email }
  );

  return response.data;
}

// Reset password
export async function resetAdminPassword(
  token: string,
  newPassword: string
): Promise<AuthResponse<null>> {
  const response = await api.post<AuthResponse<null>>(
    "/auth/reset-password",
    {
      token,
      newPassword,
    }
  );

  return response.data;
}

// Logout
export function logoutAdmin(): void {
  clearTokens();
}
