/**
 * CampusNexus — Auth Store
 *
 * Supports:
 * 1. Real API integration with Spring Boot Backend /api/v1/auth
 * 2. Frontend-only development accounts for local UI/demo testing
 */

"use client";

import { create } from "zustand";
import axios from "axios";
import { authApi } from "@/lib/api";
import type {
  HtnoValidationResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UserRole,
  UsernameAvailabilityResponse,
} from "@/types/user.types";

// ─── Development Accounts Seed ────────────────────────────────────────────────
// These accounts are used only for frontend development/demo login.
// They DO NOT replace the real Spring Boot authentication flow.

export const MOCK_ACCOUNTS: Array<{
  email: string;
  role: UserRole;
  user: User;
}> = [
  {
    email: "student@mlrit.ac.in",
    role: "STUDENT",
    user: {
      id: "1",
      username: "student_mlrit",
      email: "student@mlrit.ac.in",
      fullName: "MLRIT Student",
      emailVerified: true,
      role: "STUDENT",
      department: "CSE",
      htno: "23R21A0501",
      admissionYear: 2023,
      yearOfStudy: 4,
      regulation: "R21",
      batch: "2023-2027",
      isVerified: true,
      followersCount: 42,
      followingCount: 18,
      badges: [],
      clubLeaderOf: [],
      createdAt: "2023-08-01T00:00:00Z",
    },
  },

  {
    email: "moderator@mlrit.ac.in",
    role: "MODERATOR",
    user: {
      id: "2",
      username: "mod_mlrit",
      email: "moderator@mlrit.ac.in",
      fullName: "MLRIT Moderator",
      emailVerified: true,
      role: "MODERATOR",
      department: "ECE",
      batch: "2022-2026",
      isVerified: true,
      followersCount: 87,
      followingCount: 35,
      badges: [],
      clubLeaderOf: [],
      createdAt: "2022-08-01T00:00:00Z",
    },
  },

  {
    email: "admin@mlrit.ac.in",
    role: "ADMIN",
    user: {
      id: "3",
      username: "admin_mlrit",
      email: "admin@mlrit.ac.in",
      fullName: "MLRIT Administrator",
      emailVerified: true,
      role: "ADMIN",
      department: "Administration",
      isVerified: true,
      followersCount: 210,
      followingCount: 60,
      badges: [],
      clubLeaderOf: [],
      createdAt: "2020-01-01T00:00:00Z",
    },
  },
];

// ─── Demo Account Configuration ──────────────────────────────────────────────

const DEMO_PASSWORD = "Password@123";

// ─── Persistence Helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = "cn_auth_user";
const TOKEN_KEY = "cn_jwt_token";

function persistUser(user: User, token: string, remember: boolean) {
  const userJson = JSON.stringify(user);

  if (remember) {
    localStorage.setItem(STORAGE_KEY, userJson);
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(STORAGE_KEY, userJson);
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

function clearPersistedUser() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);

  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

function loadPersistedUser(): User | null {
  try {
    const local = localStorage.getItem(STORAGE_KEY);

    if (local) {
      return JSON.parse(local) as User;
    }

    const session = sessionStorage.getItem(STORAGE_KEY);

    if (session) {
      return JSON.parse(session) as User;
    }
  } catch {
    clearPersistedUser();
  }

  return null;
}

// ─── Store State & Actions ────────────────────────────────────────────────────

export interface AuthState {
  /** Currently authenticated user, or null if not logged in */
  user: User | null;

  /** Active JWT authentication token */
  token: string | null;

  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** Loading state for async auth operations */
  isLoading: boolean;

  /** Auth error message, or null */
  error: string | null;

  /**
   * True once hydrate() has run.
   * ProtectedRoute should wait for this before redirecting.
   */
  isHydrated: boolean;

  /** Log in with email + password */
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;

  /** Register a new student account */
  register: (data: RegisterRequest) => Promise<RegisterResponse>;

  /** Verify email via 6-digit OTP */
  verifyOtp: (email: string, otp: string) => Promise<void>;

  /** Request resend of 6-digit OTP */
  resendOtp: (email: string) => Promise<string>;

  /** Check username availability */
  checkUsernameAvailability: (
    username: string
  ) => Promise<UsernameAvailabilityResponse>;

  /** Validate institutional HTNO */
  validateHtno: (htno: string) => Promise<HtnoValidationResponse>;

  /** Log out */
  logout: () => void;

  /** Clear current error */
  clearError: () => void;

  /** Update current user's profile details */
  updateProfile: (
    data: Partial<
      Pick<
        User,
        | "fullName"
        | "username"
        | "bio"
        | "department"
        | "batch"
        | "avatarUrl"
      >
    >
  ) => void;

  /** Hydrate store from persisted storage */
  hydrate: () => void;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isHydrated: false,

  // ──────────────────────────────────────────────────────────────────────────
  // LOGIN
  // ──────────────────────────────────────────────────────────────────────────

  login: async (email, password, rememberMe = false) => {
    set({
      isLoading: true,
      error: null,
    });

    const normalizedEmail = email.trim().toLowerCase();

    // ─── FRONTEND DEMO LOGIN ───────────────────────────────────────────────
    //
    // Only the three predefined development accounts use this path.
    // The Spring Boot backend is NOT contacted for these accounts.
    //
    // This does NOT modify the real backend authentication.

    const demoAccount = MOCK_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === normalizedEmail
    );

    if (demoAccount && password === DEMO_PASSWORD) {
      const demoToken = `campusnexus-demo-${demoAccount.role.toLowerCase()}`;

      persistUser(
        demoAccount.user,
        demoToken,
        rememberMe
      );

      set({
        user: demoAccount.user,
        token: demoToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return;
    }

    // ─── REAL SPRING BOOT LOGIN ────────────────────────────────────────────
    //
    // Any account other than the three demo accounts continues through
    // the existing Spring Boot authentication API exactly as before.

    try {
      const response = await authApi.login({
        email: normalizedEmail,
        password,
      });

      persistUser(
        response.user,
        response.token,
        rememberMe
      );

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      clearPersistedUser();

      let message = "Invalid email or password.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: message,
        isLoading: false,
      });

      throw new Error(message);
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // REGISTER
  // ──────────────────────────────────────────────────────────────────────────

  register: async (data) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const res = await authApi.register(data);

      set({
        isLoading: false,
      });

      return res;
    } catch (err: unknown) {
      let message =
        "Registration failed. Please verify your details.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      set({
        error: message,
        isLoading: false,
      });

      throw new Error(message);
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // VERIFY OTP
  // ──────────────────────────────────────────────────────────────────────────

  verifyOtp: async (email, otp) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      await authApi.verifyOtp(email, otp);

      set({
        isLoading: false,
      });
    } catch (err: unknown) {
      let message = "Invalid verification code.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      set({
        error: message,
        isLoading: false,
      });

      throw new Error(message);
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // RESEND OTP
  // ──────────────────────────────────────────────────────────────────────────

  resendOtp: async (email) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const msg = await authApi.resendOtp(email);

      set({
        isLoading: false,
      });

      return msg;
    } catch (err: unknown) {
      let message = "Failed to resend code.";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      set({
        error: message,
        isLoading: false,
      });

      throw new Error(message);
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // USERNAME AVAILABILITY
  // ──────────────────────────────────────────────────────────────────────────

  checkUsernameAvailability: async (username) => {
    try {
      return await authApi.checkUsernameAvailability(username);
    } catch {
      return {
        username,
        available: false,
        message: "Could not check username availability.",
      };
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // HTNO VALIDATION
  // ──────────────────────────────────────────────────────────────────────────

  validateHtno: async (htno) => {
    try {
      return await authApi.validateHtno(htno);
    } catch {
      return {
        htno,
        valid: false,
        available: false,
        message: "Unable to validate HTNO at this moment.",
      };
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────────────────────────────────────

  logout: () => {
    clearPersistedUser();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLEAR ERROR
  // ──────────────────────────────────────────────────────────────────────────

  clearError: () => {
    set({
      error: null,
    });
  },

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ──────────────────────────────────────────────────────────────────────────

  updateProfile: (data) => {
    const current = get().user;

    if (!current) {
      return;
    }

    const updated: User = {
      ...current,
      ...data,
    };

    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY) ||
        "";

      const isLocal = !!localStorage.getItem(STORAGE_KEY);

      persistUser(
        updated,
        token,
        isLocal
      );
    }

    set({
      user: updated,
    });
  },

  // ──────────────────────────────────────────────────────────────────────────
  // HYDRATE
  // ──────────────────────────────────────────────────────────────────────────

  hydrate: () => {
    const user = loadPersistedUser();

    let token: string | null = null;

    if (typeof window !== "undefined") {
      token =
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY);
    }

    if (user && token) {
      set({
        user,
        token,
        isAuthenticated: true,
        isHydrated: true,
      });
    } else if (user) {
      set({
        user,
        token: null,
        isAuthenticated: true,
        isHydrated: true,
      });
    } else {
      set({
        isHydrated: true,
      });
    }
  },
}));

// ─── Selector Helpers ─────────────────────────────────────────────────────────

export const selectUserRole = (state: AuthState) =>
  state.user?.role ?? null;

export const selectIsModerator = (state: AuthState) =>
  state.user?.role === "MODERATOR" ||
  state.user?.role === "ADMIN";

export const selectIsAdmin = (state: AuthState) =>
  state.user?.role === "ADMIN";