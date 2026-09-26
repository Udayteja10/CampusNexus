import axios from "axios";
import type {
  HtnoValidationResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  User,
  UsernameAvailabilityResponse,
} from "@/types/user.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach JWT token if present
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("cn_jwt_token") ||
      sessionStorage.getItem("cn_jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface ApiResponseWrapper<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface BackendUserDto {
  id: number | string;
  email: string;
  fullName?: string;
  username?: string;
  emailVerified?: boolean;
  role: string;
  department?: string;
  htno?: string;
  yearOfStudy?: number;
  avatarUrl?: string;
  regulation?: string;
  admissionYear?: number;
  coordinatorDepartment?: string;
}

export const authApi = {
  checkUsernameAvailability: async (
    username: string
  ): Promise<UsernameAvailabilityResponse> => {
    const res = await apiClient.get<
      ApiResponseWrapper<UsernameAvailabilityResponse>
    >("/api/v1/auth/username-availability", {
      params: { username },
    });
    return res.data.data;
  },

  validateHtno: async (htno: string): Promise<HtnoValidationResponse> => {
    const res = await apiClient.get<
      ApiResponseWrapper<HtnoValidationResponse>
    >("/api/v1/auth/validate-htno", {
      params: { htno },
    });
    return res.data.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await apiClient.post<ApiResponseWrapper<RegisterResponse>>(
      "/api/v1/auth/register",
      data
    );
    return res.data.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await apiClient.post<ApiResponseWrapper<void>>("/api/v1/auth/verify-otp", {
      email,
      otp,
    });
  },

  resendOtp: async (email: string): Promise<string> => {
    const res = await apiClient.post<ApiResponseWrapper<string>>(
      "/api/v1/auth/resend-otp",
      {
        email,
      }
    );
    return res.data.data || res.data.message || "New code sent";
  },

  login: async (
    data: LoginRequest
  ): Promise<{
    token: string;
    tokenType: string;
    expiresIn: number;
    user: User;
  }> => {
    const res = await apiClient.post<
      ApiResponseWrapper<{
        token: string;
        tokenType: string;
        expiresIn: number;
        user: {
          id: number;
          email: string;
          fullName?: string;
          username?: string;
          emailVerified: boolean;
          role: string;
          admissionYear?: number;
          regulation?: string;
          yearOfStudy?: number;
          department?: string;
          htno?: string;
          coordinatorDepartment?: string;
        };
      }>
    >("/api/v1/auth/login", data);

    const rawUser = res.data.data.user;
    const user: User = {
      id: String(rawUser.id),
      email: rawUser.email,
      fullName: rawUser.fullName || rawUser.email.split("@")[0],
      username: rawUser.username || rawUser.email.split("@")[0],
      emailVerified: rawUser.emailVerified ?? false,
      role: rawUser.role as User["role"],
      department: rawUser.department,
      htno: rawUser.htno,
      yearOfStudy: rawUser.yearOfStudy,
      regulation: rawUser.regulation,
      admissionYear: rawUser.admissionYear,
      isVerified: rawUser.emailVerified ?? false,
      followersCount: 0,
      followingCount: 0,
      badges: [],
      clubLeaderOf: [],
      deptCoordinatorOf: rawUser.coordinatorDepartment
        ? [
            {
              departmentId: rawUser.coordinatorDepartment.toLowerCase(),
              departmentName: rawUser.coordinatorDepartment,
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
    };

    return {
      token: res.data.data.token,
      tokenType: res.data.data.tokenType,
      expiresIn: res.data.data.expiresIn,
      user,
    };
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponseWrapper<BackendUserDto>>("/api/v1/users/me");
    const rawUser = res.data.data;
    return {
      id: String(rawUser.id),
      email: rawUser.email,
      fullName: rawUser.fullName || rawUser.email.split("@")[0],
      username: rawUser.username || rawUser.email.split("@")[0],
      emailVerified: rawUser.emailVerified ?? false,
      role: rawUser.role as User["role"],
      department: rawUser.department,
      htno: rawUser.htno,
      yearOfStudy: rawUser.yearOfStudy,
      regulation: rawUser.regulation,
      admissionYear: rawUser.admissionYear,
      isVerified: rawUser.emailVerified ?? false,
      followersCount: 0,
      followingCount: 0,
      badges: [],
      clubLeaderOf: [],
      deptCoordinatorOf: rawUser.coordinatorDepartment
        ? [
            {
              departmentId: rawUser.coordinatorDepartment.toLowerCase(),
              departmentName: rawUser.coordinatorDepartment,
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
    };
  },

  forgotPassword: async (email: string): Promise<string> => {
    const res = await apiClient.post<ApiResponseWrapper<string>>(
      "/api/v1/auth/forgot-password",
      { email }
    );
    return res.data.message || res.data.data || "If an account exists, a password reset instruction has been sent.";
  },

  verifyResetCode: async (email: string, code: string): Promise<string> => {
    const res = await apiClient.post<ApiResponseWrapper<string>>(
      "/api/v1/auth/verify-reset-code",
      { email, code }
    );
    return res.data.message || res.data.data || "Verification code is valid.";
  },

  resetPassword: async (
    email: string,
    code: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<string> => {
    const res = await apiClient.post<ApiResponseWrapper<string>>(
      "/api/v1/auth/reset-password",
      { email, code, newPassword, confirmPassword }
    );
    return res.data.message || res.data.data || "Password reset successfully.";
  },

  updateProfile: async (data: {
    fullName?: string;
    username?: string;
  }): Promise<User> => {
    const res = await apiClient.patch<ApiResponseWrapper<BackendUserDto>>("/api/v1/users/me", data);
    const rawUser = res.data.data;
    return {
      id: String(rawUser.id),
      email: rawUser.email,
      fullName: rawUser.fullName || rawUser.email.split("@")[0],
      username: rawUser.username || rawUser.email.split("@")[0],
      emailVerified: rawUser.emailVerified ?? false,
      role: rawUser.role as User["role"],
      department: rawUser.department,
      htno: rawUser.htno,
      yearOfStudy: rawUser.yearOfStudy,
      regulation: rawUser.regulation,
      admissionYear: rawUser.admissionYear,
      isVerified: rawUser.emailVerified ?? false,
      followersCount: 0,
      followingCount: 0,
      badges: [],
      clubLeaderOf: [],
      deptCoordinatorOf: rawUser.coordinatorDepartment
        ? [
            {
              departmentId: rawUser.coordinatorDepartment.toLowerCase(),
              departmentName: rawUser.coordinatorDepartment,
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
    };
  },
};

export interface AdminUserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  htno?: string;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
  enabled: boolean;
  emailVerified: boolean;
  departmentName?: string;
  yearOfStudy?: number;
  regulation?: string;
  admissionYear?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const adminApi = {
  getUsers: async (params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminUserDto>> => {
    const queryParams: Record<string, string | number> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.role && params.role !== "ALL") queryParams.role = params.role;
    if (params?.status && params.status !== "ALL") queryParams.status = params.status;
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size !== undefined) queryParams.size = params.size;

    const res = await apiClient.get<ApiResponseWrapper<PageResponse<AdminUserDto>>>(
      "/api/v1/admin/users",
      { params: queryParams }
    );
    return res.data.data;
  },

  updateUserStatus: async (
    userId: string | number,
    status: string,
    reason?: string
  ): Promise<AdminUserDto> => {
    const res = await apiClient.patch<ApiResponseWrapper<AdminUserDto>>(
      `/api/v1/admin/users/${userId}/status`,
      { status, reason }
    );
    return res.data.data;
  },

  updateUserRole: async (
    userId: string | number,
    role: string
  ): Promise<AdminUserDto> => {
    const res = await apiClient.patch<ApiResponseWrapper<AdminUserDto>>(
      `/api/v1/admin/users/${userId}/role`,
      { role }
    );
    return res.data.data;
  },
};
