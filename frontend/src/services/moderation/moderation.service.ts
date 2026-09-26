/**
 * CampusNexus — Moderation & Admin Service
 * Phase 10 Service Implementation with strict service-layer authorization & persistence.
 *
 * AUTHORIZATION RULES:
 * - STUDENT: No access to any moderation/admin operations.
 * - MODERATOR: Global moderator. Can review reports, moderate content, triage support, view audit logs. Cannot manage user roles.
 * - ADMIN: Full access to all moderation, support management, user administration, and role updates.
 */

import {
  ModerationReport,
  ReportStatus,
  ModerationAuditEntry,
  ModerationAuditAction,
  ManagedUser,
  UserAccountStatus,
  ReportFilterParams,
  AuditFilterParams,
  UserManagementFilterParams,
} from "@/types/moderation.types";
import { UserRole } from "@/types/user.types";
import {
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MANAGED_USERS,
} from "./moderation.seed";
import { useAuthStore } from "@/store/auth.store";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { helpService } from "@/services/help";
import { adminApi } from "@/lib/api";

const STORAGE_KEYS = {
  REPORTS: "cn_moderation_reports",
  AUDIT: "cn_moderation_audit",
  USERS: "cn_user_moderation",
} as const;

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export class ModerationService {
  private getReportsStorage(): ModerationReport[] {
    return getStorage<ModerationReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  private saveReportsStorage(data: ModerationReport[]): void {
    setStorage(STORAGE_KEYS.REPORTS, data);
  }

  private getAuditStorage(): ModerationAuditEntry[] {
    return getStorage<ModerationAuditEntry[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  }

  private saveAuditStorage(data: ModerationAuditEntry[]): void {
    setStorage(STORAGE_KEYS.AUDIT, data);
  }

  private getUsersStorage(): ManagedUser[] {
    return getStorage<ManagedUser[]>(STORAGE_KEYS.USERS, INITIAL_MANAGED_USERS);
  }

  private saveUsersStorage(data: ManagedUser[]): void {
    setStorage(STORAGE_KEYS.USERS, data);
  }

  /**
   * Helper to verify staff authorization (Moderator or Admin).
   */
  private requireStaff(): { id: string; fullName: string; role: "MODERATOR" | "ADMIN" } {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || (currentUser.role !== "MODERATOR" && currentUser.role !== "ADMIN")) {
      throw new Error("Unauthorized: Staff (Moderator or Admin) access required.");
    }
    return {
      id: currentUser.id,
      fullName: currentUser.fullName,
      role: currentUser.role,
    };
  }

  /**
   * Helper to verify Admin authorization only.
   */
  private requireAdmin(): { id: string; fullName: string } {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Administrator access required.");
    }
    return {
      id: currentUser.id,
      fullName: currentUser.fullName,
    };
  }

  // ─── Moderation Reports ───────────────────────────────────────────────────

  /**
   * Get all moderation reports with filtering.
   * Service-layer Auth: Requires MODERATOR or ADMIN.
   */
  async getReports(params?: ReportFilterParams): Promise<ModerationReport[]> {
    this.requireStaff();

    let reports = this.getReportsStorage();

    if (params?.status && params.status !== "ALL") {
      reports = reports.filter((r) => r.status === params.status);
    }

    if (params?.reason && params.reason !== "ALL") {
      reports = reports.filter((r) => r.reason === params.reason);
    }

    if (params?.targetType && params.targetType !== "ALL") {
      reports = reports.filter((r) => r.targetType === params.targetType);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      reports = reports.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.contentSnippet?.toLowerCase().includes(q)
      );
    }

    // Sort latest first
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return reports;
  }

  /**
   * Get a single report by ID.
   */
  async getReportById(id: string): Promise<ModerationReport | null> {
    this.requireStaff();
    const reports = this.getReportsStorage();
    const found = reports.find((r) => r.id === id);
    return found || null;
  }

  /**
   * Update report status and moderation notes.
   */
  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    notes?: string
  ): Promise<ModerationReport> {
    const staff = this.requireStaff();

    const reports = this.getReportsStorage();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) {
      throw new Error("Report not found.");
    }

    const report = reports[index];
    const now = new Date().toISOString();

    const updated: ModerationReport = {
      ...report,
      status,
      reviewedByUserId: staff.id,
      reviewedByUserName: staff.fullName,
      reviewedAt: now,
      moderationNotes: notes?.trim() || report.moderationNotes,
    };

    reports[index] = updated;
    this.saveReportsStorage(reports);

    // Record audit entry
    await this.createAuditEntry({
      actorId: staff.id,
      actorName: staff.fullName,
      actorRole: staff.role,
      action: status === "RESOLVED" ? "REPORT_RESOLVED" : status === "DISMISSED" ? "REPORT_DISMISSED" : "REPORT_REVIEWED",
      targetType: report.targetType,
      targetId: report.targetId,
      targetSummary: report.contentSnippet || `Report #${report.id}`,
      reason: notes || `Report status changed to ${status}`,
    });

    return updated;
  }

  /**
   * Execute content moderation action (REMOVE, RESTORE, DISMISS, RESOLVE).
   */
  async moderateContent(
    reportId: string,
    action: "REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE",
    reason: string
  ): Promise<ModerationReport> {
    const staff = this.requireStaff();

    const reports = this.getReportsStorage();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) {
      throw new Error("Report not found.");
    }

    const report = reports[index];
    const now = new Date().toISOString();

    // If target is a post, perform content operation
    if (report.targetType === "POST") {
      if (action === "REMOVE") {
        try {
          await MockCommunityServiceInstance.deletePost(report.targetId);
        } catch {
          // continue
        }
      }
    }

    let nextStatus: ReportStatus = "RESOLVED";
    let auditAction: ModerationAuditAction = "REPORT_RESOLVED";

    if (action === "DISMISS") {
      nextStatus = "DISMISSED";
      auditAction = "REPORT_DISMISSED";
    } else if (action === "REMOVE") {
      nextStatus = "RESOLVED";
      auditAction = "CONTENT_REMOVED";
    } else if (action === "RESTORE") {
      nextStatus = "RESOLVED";
      auditAction = "CONTENT_RESTORED";
    }

    const updated: ModerationReport = {
      ...report,
      status: nextStatus,
      actionTaken: action,
      reviewedByUserId: staff.id,
      reviewedByUserName: staff.fullName,
      reviewedAt: now,
      moderationNotes: reason.trim(),
    };

    reports[index] = updated;
    this.saveReportsStorage(reports);

    // Record audit entry
    await this.createAuditEntry({
      actorId: staff.id,
      actorName: staff.fullName,
      actorRole: staff.role,
      action: auditAction,
      targetType: report.targetType,
      targetId: report.targetId,
      targetSummary: report.contentSnippet || `Report #${report.id}`,
      reason: reason.trim(),
    });

    return updated;
  }

  // ─── Audit Trail ─────────────────────────────────────────────────────────

  /**
   * Get audit log entries.
   */
  async getAuditLogs(params?: AuditFilterParams): Promise<ModerationAuditEntry[]> {
    this.requireStaff();

    let logs = this.getAuditStorage();

    if (params?.action && params.action !== "ALL") {
      logs = logs.filter((l) => l.action === params.action);
    }

    if (params?.actorRole && params.actorRole !== "ALL") {
      logs = logs.filter((l) => l.actorRole === params.actorRole);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      logs = logs.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.targetSummary?.toLowerCase().includes(q) ||
          l.reason?.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return logs;
  }

  /**
   * Create an audit entry.
   */
  async createAuditEntry(
    entry: Omit<ModerationAuditEntry, "id" | "createdAt">
  ): Promise<ModerationAuditEntry> {
    const newEntry: ModerationAuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };

    const logs = this.getAuditStorage();
    this.saveAuditStorage([newEntry, ...logs]);
    return newEntry;
  }

  // ─── User Management (Admin & Moderator) ───────────────────────────────────

  /**
   * Get managed users list from live backend.
   */
  async getManagedUsers(params?: UserManagementFilterParams): Promise<ManagedUser[]> {
    this.requireStaff();

    try {
      const pageData = await adminApi.getUsers({
        search: params?.search,
        role: params?.role,
        status: params?.status,
        page: 0,
        size: 100,
      });

      return pageData.content.map((u) => ({
        id: String(u.id),
        username: u.username,
        email: u.email,
        fullName: u.fullName || u.username,
        role: u.role,
        department: u.departmentName,
        htno: u.htno,
        yearOfStudy: u.yearOfStudy,
        regulation: u.regulation,
        admissionYear: u.admissionYear,
        emailVerified: u.emailVerified,
        isVerified: u.emailVerified,
        followersCount: 0,
        followingCount: 0,
        badges: [],
        clubLeaderOf: [],
        createdAt: u.createdAt || new Date().toISOString(),
        accountStatus: u.enabled ? "ACTIVE" : "SUSPENDED",
      }));
    } catch (err) {
      console.warn("Falling back to local user store:", err);
      let users = this.getUsersStorage();

      if (params?.role && params.role !== "ALL") {
        users = users.filter((u) => u.role === params.role);
      }

      if (params?.status && params.status !== "ALL") {
        users = users.filter((u) => u.accountStatus === params.status);
      }

      if (params?.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        users = users.filter(
          (u) =>
            u.fullName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.department?.toLowerCase().includes(q) ||
            u.htno?.toLowerCase().includes(q)
        );
      }

      return users;
    }
  }

  /**
   * Suspend, restrict, or restore a user account.
   */
  async updateUserStatus(
    userId: string,
    status: UserAccountStatus,
    reason?: string
  ): Promise<ManagedUser> {
    const staff = this.requireStaff();

    try {
      const res = await adminApi.updateUserStatus(userId, status, reason);
      return {
        id: String(res.id),
        username: res.username,
        email: res.email,
        fullName: res.fullName || res.username,
        role: res.role,
        department: res.departmentName,
        htno: res.htno,
        yearOfStudy: res.yearOfStudy,
        regulation: res.regulation,
        admissionYear: res.admissionYear,
        emailVerified: res.emailVerified,
        isVerified: res.emailVerified,
        followersCount: 0,
        followingCount: 0,
        badges: [],
        clubLeaderOf: [],
        createdAt: res.createdAt || new Date().toISOString(),
        accountStatus: res.enabled ? "ACTIVE" : "SUSPENDED",
        suspensionReason: !res.enabled ? reason : undefined,
      };
    } catch {
      const users = this.getUsersStorage();
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) {
        throw new Error("User account not found.");
      }

      const targetUser = users[index];

      // Moderators cannot suspend Admins
      if (staff.role === "MODERATOR" && targetUser.role === "ADMIN") {
        throw new Error("Moderators cannot modify Administrator accounts.");
      }

      const now = new Date().toISOString();
      const updated: ManagedUser = {
        ...targetUser,
        accountStatus: status,
        suspendedAt: status === "SUSPENDED" ? now : undefined,
        suspensionReason: status === "SUSPENDED" ? reason?.trim() : undefined,
      };

      users[index] = updated;
      this.saveUsersStorage(users);

      return updated;
    }
  }

  /**
   * Update a user's role.
   * STRICT ADMIN-ONLY: Moderators are strictly blocked from changing roles.
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<ManagedUser> {
    this.requireAdmin();

    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      return {
        id: String(res.id),
        username: res.username,
        email: res.email,
        fullName: res.fullName || res.username,
        role: res.role,
        department: res.departmentName,
        htno: res.htno,
        yearOfStudy: res.yearOfStudy,
        regulation: res.regulation,
        admissionYear: res.admissionYear,
        emailVerified: res.emailVerified,
        isVerified: res.emailVerified,
        followersCount: 0,
        followingCount: 0,
        badges: [],
        clubLeaderOf: [],
        createdAt: res.createdAt || new Date().toISOString(),
        accountStatus: res.enabled ? "ACTIVE" : "SUSPENDED",
      };
    } catch {
      const users = this.getUsersStorage();
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) {
        throw new Error("User account not found.");
      }

      const targetUser = users[index];
      const updated: ManagedUser = {
        ...targetUser,
        role: newRole,
      };

      users[index] = updated;
      this.saveUsersStorage(users);

      return updated;
    }
  }

  // ─── Dashboard Stats Summary ───────────────────────────────────────────────

  /**
   * Retrieve operational metrics for the Admin dashboard.
   */
  async getAdminStats(): Promise<{
    openReportsCount: number;
    pendingReportsCount: number;
    openSupportCount: number;
    highPrioritySupportCount: number;
    totalUsersCount: number;
    suspendedUsersCount: number;
  }> {
    this.requireStaff();

    const reports = this.getReportsStorage();
    const openReportsCount = reports.filter((r) => r.status === "OPEN").length;
    const pendingReportsCount = reports.filter((r) => r.status === "UNDER_REVIEW").length;

    const supportRequests = await helpService.getSupportRequests();
    const openSupportCount = supportRequests.filter((s) => s.status === "OPEN" || s.status === "IN_PROGRESS").length;
    const highPrioritySupportCount = supportRequests.filter(
      (s) => s.priority === "HIGH" && (s.status === "OPEN" || s.status === "IN_PROGRESS")
    ).length;

    const users = this.getUsersStorage();
    const totalUsersCount = users.length;
    const suspendedUsersCount = users.filter((u) => u.accountStatus === "SUSPENDED").length;

    return {
      openReportsCount,
      pendingReportsCount,
      openSupportCount,
      highPrioritySupportCount,
      totalUsersCount,
      suspendedUsersCount,
    };
  }
}

export const moderationService = new ModerationService();
