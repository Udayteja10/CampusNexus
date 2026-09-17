"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Flag,
  HelpCircle,
  Users,
  History,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { ReportStatusBadge } from "@/components/admin/ReportStatusBadge";
import { moderationService } from "@/services/moderation";
import { helpService } from "@/services/help";
import { ModerationReport, ModerationAuditEntry } from "@/types/moderation.types";
import { SupportRequest } from "@/types/help.types";
import { ROUTES } from "@/lib/constants";
import { useAuthStore, selectIsAdmin } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const isAdmin = useAuthStore(selectIsAdmin);
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState({
    openReportsCount: 0,
    pendingReportsCount: 0,
    openSupportCount: 0,
    highPrioritySupportCount: 0,
    totalUsersCount: 0,
    suspendedUsersCount: 0,
  });

  const [recentReports, setRecentReports] = useState<ModerationReport[]>([]);
  const [highPriorityTickets, setHighPriorityTickets] = useState<SupportRequest[]>([]);
  const [recentAudit, setRecentAudit] = useState<ModerationAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, reportsData, supportData, auditData] = await Promise.all([
          moderationService.getAdminStats(),
          moderationService.getReports({ status: "ALL" }),
          helpService.getSupportRequests(),
          moderationService.getAuditLogs(),
        ]);

        setStats(statsData);
        setRecentReports(reportsData.slice(0, 5));
        setHighPriorityTickets(
          supportData
            .filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS")
            .slice(0, 4)
        );
        setRecentAudit(auditData.slice(0, 5));
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isAdmin ? "Admin Console" : "Moderator Workspace"}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              {isAdmin ? "Administrator" : "Moderator"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user?.fullName}. Review flagged community content, triage student support, and audit system actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={ROUTES.ADMIN_MODERATION}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
          >
            <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" />
            Moderation Desk
          </Link>
          <Link
            href={ROUTES.ADMIN_REPORTS}
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl")}
          >
            <Flag className="mr-2 h-4 w-4" />
            View Reports ({stats.openReportsCount})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Open Reports"
          count={stats.openReportsCount}
          description={`${stats.pendingReportsCount} under active review`}
          icon={Flag}
          colorClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          href={ROUTES.ADMIN_REPORTS}
        />
        <AdminStatCard
          title="Active Support"
          count={stats.openSupportCount}
          description={`${stats.highPrioritySupportCount} marked high priority`}
          icon={HelpCircle}
          colorClassName="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          href={ROUTES.ADMIN_SUPPORT}
        />
        <AdminStatCard
          title="Managed Users"
          count={stats.totalUsersCount}
          description={`${stats.suspendedUsersCount} suspended / locked`}
          icon={Users}
          colorClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          href={ROUTES.ADMIN_USERS}
        />
        <AdminStatCard
          title="Audit Trail"
          count={recentAudit.length > 0 ? `${recentAudit.length}+` : "0"}
          description="Real-time moderation logs"
          icon={History}
          colorClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          href={ROUTES.ADMIN_AUDIT}
        />
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Link
          href={ROUTES.ADMIN_REPORTS}
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all duration-150 hover:border-amber-500/40 hover:bg-muted/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Content Reports</div>
              <div className="text-xs text-muted-foreground">Triage flagged posts & comments</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </Link>

        <Link
          href={ROUTES.ADMIN_SUPPORT}
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all duration-150 hover:border-rose-500/40 hover:bg-muted/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Support Desk</div>
              <div className="text-xs text-muted-foreground">Respond to student tickets</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </Link>

        <Link
          href={ROUTES.ADMIN_USERS}
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all duration-150 hover:border-indigo-500/40 hover:bg-muted/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">User Management</div>
              <div className="text-xs text-muted-foreground">Accounts, status & permissions</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </Link>

        <Link
          href={ROUTES.ADMIN_AUDIT}
          className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all duration-150 hover:border-emerald-500/40 hover:bg-muted/40 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Audit Logs</div>
              <div className="text-xs text-muted-foreground">Accountability & history</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </Link>
      </div>

      {/* Main Content Split: Reports Queue & Active Support */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reports Section */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-amber-500" />
              <h2 className="text-base font-semibold text-foreground">Recent Moderation Reports</h2>
            </div>
            <Link
              href={ROUTES.ADMIN_REPORTS}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}
            >
              View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading reports...</div>
            ) : recentReports.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No active moderation reports in the queue.
              </div>
            ) : (
              recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={ROUTES.ADMIN_REPORT_DETAIL(report.id)}
                  className="block rounded-xl border border-border/60 bg-muted/20 p-3.5 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-foreground">
                          {report.targetType} #{report.targetId.slice(0, 8)}
                        </span>
                        <ReportStatusBadge status={report.status} />
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-foreground/80">
                        Reason: <span className="font-semibold text-foreground">{report.reason}</span>
                      </p>
                      {report.contentSnippet && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground italic">
                          &ldquo;{report.contentSnippet}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Support Queue Section */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-rose-500" />
              <h2 className="text-base font-semibold text-foreground">Pending Support Tickets</h2>
            </div>
            <Link
              href={ROUTES.ADMIN_SUPPORT}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}
            >
              View Support Desk <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading tickets...</div>
            ) : highPriorityTickets.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No pending support tickets in queue.
              </div>
            ) : (
              highPriorityTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={ROUTES.ADMIN_SUPPORT_DETAIL(ticket.id)}
                  className="block rounded-xl border border-border/60 bg-muted/20 p-3.5 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{ticket.subject}</span>
                        {ticket.priority === "HIGH" && (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {ticket.category} • From: {ticket.userFullName}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Preview */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-500" />
            <h2 className="text-base font-semibold text-foreground">Recent Staff Actions</h2>
          </div>
          <Link
            href={ROUTES.ADMIN_AUDIT}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}
          >
            Full Audit Trail <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-border/40">
          {recentAudit.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No recent audit entries recorded yet.
            </div>
          ) : (
            recentAudit.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{log.actorName}</span> (
                    <span className="text-primary font-medium">{log.actorRole}</span>) performed{" "}
                    <span className="font-medium text-foreground">{log.action.replace(/_/g, " ")}</span>
                    {log.targetSummary && (
                      <span className="text-muted-foreground"> on &ldquo;{log.targetSummary}&rdquo;</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Clock className="h-3 w-3" />
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
