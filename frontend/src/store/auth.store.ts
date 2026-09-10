/**
 * CampusNexus — Auth Store
 *
 * MOCK IMPLEMENTATION — Phase 2
 * Replace the `mockLogin` / `mockRegister` helpers with real Axios calls
 * to the Spring Boot API when the backend is ready. The store interface
 * (AuthState) must NOT change — only the inner async helpers.
 */

"use client";

import { create } from "zustand";
import type { User, UserRole } from "@/types/user.types";

// ─── Mock account seed data (dev-only) ───────────────────────────────────────

/** DO NOT expose passwords in UI. Passwords are intentionally omitted here. */
const MOCK_ACCOUNTS: Array<{
  email: string;
  role: UserRole;
  user: User;
}> = [
  {
    email: "student@mlrit.ac.in",
    role: "STUDENT",
    user: {
      id: "mock-student-001",
      username: "student_mlrit",
      email: "student@mlrit.ac.in",
      fullName: "Alex Johnson",
      role: "STUDENT",
      department: "Computer Science & Engineering",
      batch: "2022-2026",
      isVerified: true,
      followersCount: 42,
      followingCount: 18,
      badges: [],
      clubLeaderOf: [],
      createdAt: "2022-08-01T00:00:00Z",
    },
  },
  {
    email: "moderator@mlrit.ac.in",
    role: "MODERATOR",
    user: {
      id: "mock-mod-001",
      username: "mod_mlrit",
      email: "moderator@mlrit.ac.in",
      fullName: "Sam Patel",
      role: "MODERATOR",
      department: "Electronics & Communication Engineering",
      batch: "2021-2025",
      isVerified: true,
      followersCount: 87,
      followingCount: 35,
      badges: [],
      clubLeaderOf: [],
      createdAt: "2021-08-01T00:00:00Z",
    },
  },
  {
    email: "admin@mlrit.ac.in",
    role: "ADMIN",
    user: {
      id: "mock-admin-001",
      username: "admin_mlrit",
      email: "admin@mlrit.ac.in",
      fullName: "Jordan Smith",
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

// ─── Mock API helpers ─────────────────────────────────────────────────────────
// When replacing with real API: swap these functions with Axios calls.
// The store state and actions remain identical.

const MOCK_PASSWORD = "campusnexus2024"; // single dev password for all mock accounts

function simulateDelay(ms = 800) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function mockLogin(
  email: string,
  password: string
): Promise<User> {
  await simulateDelay(800);

  const account = MOCK_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );

  if (!account || password !== MOCK_PASSWORD) {
    throw new Error("Invalid email or password.");
  }

  return account.user;
}

async function mockRegister(data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<User> {
  await simulateDelay(1000);

  if (!data.email.toLowerCase().endsWith("@mlrit.ac.in")) {
    throw new Error("Only @mlrit.ac.in institutional email addresses are allowed.");
  }

  const existing = MOCK_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === data.email.toLowerCase()
  );
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  // Return a newly-minted student user (not persisted in mock)
  const newUser: User = {
    id: `mock-new-${Date.now()}`,
    username: data.email.split("@")[0].replace(/[^a-z0-9]/gi, "_"),
    email: data.email,
    fullName: data.fullName,
    role: "STUDENT",
    isVerified: false,
    followersCount: 0,
    followingCount: 0,
    badges: [],
    clubLeaderOf: [],
    createdAt: new Date().toISOString(),
  };

  return newUser;
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = "cn_auth_user";

function persistUser(user: User, remember: boolean) {
  const json = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(STORAGE_KEY, json);
  } else {
    sessionStorage.setItem(STORAGE_KEY, json);
  }
}

function clearPersistedUser() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

function loadPersistedUser(): User | null {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local) as User;
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) return JSON.parse(session) as User;
  } catch {
    // Corrupt storage — clear it
    clearPersistedUser();
  }
  return null;
}

// ─── Store State & Actions ────────────────────────────────────────────────────

export interface AuthState {
  /** Currently authenticated user, or null if not logged in */
  user: User | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Loading state for async auth operations */
  isLoading: boolean;
  /** Auth error message, or null */
  error: string | null;
  /**
   * True once hydrate() has run (even if no session was found).
   * ProtectedRoute must wait for this before deciding to redirect.
   */
  isHydrated: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Log in with email + password.
   * Set rememberMe=true to persist across browser sessions (localStorage).
   */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;

  /**
   * Register a new student account.
   * On success, the user is logged in and redirected to verify-email.
   */
  register: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;

  /** Log out and clear persisted session */
  logout: () => void;

  /** Clear the current error message */
  clearError: () => void;

  /**
   * Hydrate the store from persisted storage.
   * Call once on app startup (in a client component or layout).
   * Sets isHydrated=true when done so route guards know they can act.
   */
  hydrate: () => void;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isHydrated: false,

  login: async (email, password, rememberMe = false) => {
    set({ isLoading: true, error: null });
    try {
      const user = await mockLogin(email, password);
      persistUser(user, rememberMe);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      set({ error: message, isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await mockRegister(data);
      // After registration, user is considered authenticated but unverified
      persistUser(user, false);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    clearPersistedUser();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),

  hydrate: () => {
    const user = loadPersistedUser();
    if (user) {
      set({ user, isAuthenticated: true, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));

// ─── Selector helpers ─────────────────────────────────────────────────────────

/** Returns the current user's role, or null if not authenticated */
export const selectUserRole = (state: AuthState) => state.user?.role ?? null;

/** Returns true if the user has at least MODERATOR privileges */
export const selectIsModerator = (state: AuthState) =>
  state.user?.role === "MODERATOR" || state.user?.role === "ADMIN";

/** Returns true if the user is an ADMIN */
export const selectIsAdmin = (state: AuthState) =>
  state.user?.role === "ADMIN";
