// ─── User / Auth ───────────────────────────────────────────────────────────

export type UserRole = "STUDENT" | "MODERATOR" | "ADMIN";

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

export interface UserBadge {
  id: string;
  badge: Badge;
  awardedAt: string;
}

export interface ClubLeaderPermission {
  clubId: string;
  clubName: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  department?: string;
  batch?: string; // e.g. "2022-2026"
  role: UserRole;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  badges: UserBadge[];
  clubLeaderOf: ClubLeaderPermission[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  department?: string;
  batch?: string;
}
