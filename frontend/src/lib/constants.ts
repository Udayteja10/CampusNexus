// ─── App Info ────────────────────────────────────────────────────────────────

export const APP_NAME = "CampusNexus";
export const APP_DESCRIPTION = "Your Integrated Academic and Campus Community Platform";
export const APP_VERSION = "1.0.0";

// ─── Routes ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Community
  FEED: "/feed",
  CHANNELS: "/channels",
  MESSAGES: "/messages",

  // Academic
  RESOURCES: "/academic/resources",
  RESOURCE_REQUESTS: "/academic/resource-requests",
  STUDY_GROUPS: "/academic/study-groups",
  FACULTY: "/academic/faculty",
  WIKI: "/academic/wiki",

  // Career
  PLACEMENT: "/career/placement",
  INTERNSHIP: "/career/internship",
  RESUME_REVIEW: "/career/resume-review",
  SMART_COLLECTIONS: "/career/smart-collections",

  // Campus Life
  CLUBS: "/campus/clubs",
  EVENTS: "/campus/events",
  CALENDAR: "/campus/calendar",
  MARKETPLACE: "/campus/marketplace",
  LOST_FOUND: "/campus/lost-found",
  MEMES: "/campus/memes",

  // User
  NOTIFICATIONS: "/notifications",
  SEARCH: "/search",
  PROFILE: (username: string) => `/profile/${username}`,
  HELP: "/help",

  // Moderator
  MOD_REPORTS: "/moderation/reports",
  MOD_ACTIONS: "/moderation/actions",
  MOD_LOGS: "/moderation/logs",

  // Admin
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_FACULTY: "/admin/faculty",
  ADMIN_DEPARTMENTS: "/admin/departments",
  ADMIN_CLUBS: "/admin/clubs",
  ADMIN_CHANNELS: "/admin/channels",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_CALENDAR: "/admin/calendar",
  ADMIN_ANNOUNCEMENTS: "/admin/announcements",
  ADMIN_BADGES: "/admin/badges",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SUPPORT: "/admin/support",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

// ─── User Roles ───────────────────────────────────────────────────────────────

export const USER_ROLES = {
  STUDENT: "STUDENT",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const TOPBAR_HEIGHT = 56;
