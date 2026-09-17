/**
 * CampusNexus — Moderation & Admin Types
 * Phase 10 Admin / Moderation System
 */

import { UserRole, User } from "./user.types";
import { ReportReason } from "./post.types";

export type ReportStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export type ReportedContentType = "POST" | "COMMENT" | "EVENT" | "CLUB" | "USER";

export interface ModerationReport {
  id: string;
  targetType: ReportedContentType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  reportedByUserId: string;
  status: ReportStatus;
  contentSnippet?: string;
  authorId?: string;
  authorName?: string;
  isAuthorAnonymous?: boolean;
  createdAt: string;
  reviewedByUserId?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  moderationNotes?: string;
  actionTaken?: string;
}

export type ModerationAuditAction =
  | "REPORT_REVIEWED"
  | "REPORT_DISMISSED"
  | "REPORT_RESOLVED"
  | "CONTENT_REMOVED"
  | "CONTENT_RESTORED"
  | "SUPPORT_REPLIED"
  | "SUPPORT_STATUS_CHANGED"
  | "USER_SUSPENDED"
  | "USER_RESTORED"
  | "USER_ROLE_CHANGED"
  | "ESCALATED";

export interface ModerationAuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: "MODERATOR" | "ADMIN";
  action: ModerationAuditAction;
  targetType: string;
  targetId: string;
  targetSummary?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type UserAccountStatus = "ACTIVE" | "SUSPENDED" | "RESTRICTED";

export interface ManagedUser extends User {
  accountStatus: UserAccountStatus;
  suspendedAt?: string;
  suspensionReason?: string;
}

export interface ReportFilterParams {
  status?: ReportStatus | "ALL";
  reason?: ReportReason | "ALL";
  targetType?: ReportedContentType | "ALL";
  search?: string;
}

export interface AuditFilterParams {
  action?: ModerationAuditAction | "ALL";
  actorRole?: "ALL" | "MODERATOR" | "ADMIN";
  search?: string;
}

export interface UserManagementFilterParams {
  role?: UserRole | "ALL";
  status?: UserAccountStatus | "ALL";
  search?: string;
}
