// ─── App Info ────────────────────────────────────────────────────────────────

export const APP_NAME = "CampusNexus";
export const APP_DESCRIPTION = "Your Integrated Academic and Campus Community Platform";
export const APP_VERSION = "1.0.0";

// ─── Routes ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public / Landing
  HOME: "/",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_EMAIL: "/verify-email",

  // Legal
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // App core
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  PROFILE: (username: string) => `/profile/${username}`,
  NOTIFICATIONS: "/notifications",
  SEARCH: "/search",
  SETTINGS: "/settings",
  HELP: "/help",
  HELP_SUPPORT: "/help-support",
  HELP_FAQ: "/help/faq",
  HELP_FAQ_DETAIL: (slug: string) => `/help/faq/${slug}`,
  HELP_CONTACT: "/help/contact",
  HELP_REQUESTS: "/help/requests",
  HELP_REQUEST_DETAIL: (id: string) => `/help/requests/${id}`,

  // Community
  COMMUNITY: "/community",
  FEED: "/community/feed",
  CHANNELS: "/community/channels",
  MESSAGES: "/community/messages",
  CREATE_POST: "/community/create",
  POST_DETAIL: (id: string) => `/community/post/${id}`,
  POST_EDIT: (id: string) => `/community/post/${id}/edit`,

  // Academic
  ACADEMIC: "/academic",
  ACADEMIC_DASHBOARD: "/academic",
  ACADEMIC_RESOURCES: "/academic/resources",
  ACADEMIC_RESOURCE_DETAIL: (id: string) => `/academic/resources/${id}`,
  ACADEMIC_SUBJECTS: "/academic/subjects",
  ACADEMIC_SUBJECT_DETAIL: (id: string) => `/academic/subjects/${id}`,
  ACADEMIC_STUDY_GROUPS: "/academic/study-groups",
  ACADEMIC_STUDY_GROUP_DETAIL: (id: string) => `/academic/study-groups/${id}`,
  ACADEMIC_FACULTY: "/academic/faculty",
  ACADEMIC_FACULTY_DETAIL: (id: string) => `/academic/faculty/${id}`,
  ACADEMIC_REQUESTS: "/academic/requests",
  ACADEMIC_CALENDAR: "/academic/calendar",
  ACADEMIC_WIKI: "/academic/wiki",

  // Legacy Academic aliases (redirected)
  RESOURCES: "/resources",
  FACULTY: "/faculty",
  STUDY_GROUPS: "/resources/study-groups",
  WIKI: "/resources/wiki",

  // Career
  CAREER: "/career",
  CAREER_PLACEMENTS: "/career/placements",
  CAREER_PLACEMENT_DETAIL: (id: string) => `/career/placements/${id}`,
  CAREER_INTERNSHIPS: "/career/internships",
  CAREER_INTERNSHIP_DETAIL: (id: string) => `/career/internships/${id}`,
  CAREER_APPLICATIONS: "/career/applications",
  CAREER_RESUME_REVIEW: "/career/resume-review",
  CAREER_COLLECTIONS: "/career/collections",

  // Legacy Career aliases (redirected)
  PLACEMENTS: "/placements",
  INTERNSHIPS: "/internships",
  RESUME_REVIEW: "/resume-review",

  // Campus Life
  CAMPUS_LIFE: "/campus-life",
  CAMPUS_LIFE_CLUBS: "/campus-life/clubs",
  CAMPUS_LIFE_CLUB_DETAIL: (id: string) => `/campus-life/clubs/${id}`,
  CAMPUS_LIFE_EVENTS: "/campus-life/events",
  CAMPUS_LIFE_EVENT_DETAIL: (id: string) => `/campus-life/events/${id}`,
  CAMPUS_LIFE_SPORTS: "/campus-life/sports",
  CAMPUS_LIFE_FACILITIES: "/campus-life/facilities",
  CAMPUS_LIFE_LOST_FOUND: "/campus-life/lost-found",
  CAMPUS_LIFE_MARKETPLACE: "/campus-life/marketplace",
  CAMPUS_LIFE_TRANSPORT: "/campus-life/transport",
  CAMPUS_LIFE_HOSTEL: "/campus-life/hostel",
  CAMPUS_LIFE_DIRECTORY: "/campus-life/directory",

  // Legacy Campus Life aliases (redirected)
  CLUBS: "/clubs",
  EVENTS: "/events",
  MARKETPLACE: "/marketplace",
  LOST_FOUND: "/lost-found",

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
  ADMIN_EVENTS: "/admin/events",
  ADMIN_ANNOUNCEMENTS: "/admin/announcements",
  ADMIN_BADGES: "/admin/badges",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_REPORT_DETAIL: (id: string) => `/admin/reports/${id}`,
  ADMIN_SUPPORT: "/admin/support",
  ADMIN_SUPPORT_DETAIL: (id: string) => `/admin/support/${id}`,
  ADMIN_MODERATION: "/admin/moderation",
  ADMIN_AUDIT: "/admin/audit",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_CAREER_PLACEMENTS: "/admin/career/placements",
  ADMIN_CAREER_INTERNSHIPS: "/admin/career/internships",
} as const;

// Routes that do NOT require authentication
export const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/terms",
  "/privacy",
]);

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
