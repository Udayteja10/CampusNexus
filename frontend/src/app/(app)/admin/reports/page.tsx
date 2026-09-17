"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Flag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportStatusBadge } from "@/components/admin/ReportStatusBadge";
import { ReportActionDialog } from "@/components/admin/ReportActionDialog";
import { moderationService } from "@/services/moderation";
import {
  ModerationReport,
  ReportStatus,
  ReportedContentType,
} from "@/types/moderation.types";
import { ReportReason } from "@/types/post.types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AdminReportsListPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ReportedContentType | "ALL">("ALL");
  const [reasonFilter, setReasonFilter] = useState<ReportReason | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [activeReport, setActiveReport] = useState<ModerationReport | null>(null);
  const [actionType, setActionType] = useState<"REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE">("RESOLVE");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moderationService.getReports({
        status: statusFilter,
        targetType: typeFilter,
        reason: reasonFilter,
        search: searchQuery,
      });
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, reasonFilter, searchQuery]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleOpenAction = (
    report: ModerationReport,
    action: "REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE"
  ) => {
    setActiveReport(report);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleActionComplete = (updated: ModerationReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const counts = {
    all: reports.length,
    open: reports.filter((r) => r.status === "OPEN").length,
    underReview: reports.filter((r) => r.status === "UNDER_REVIEW").length,
    resolved: reports.filter((r) => r.status === "RESOLVED").length,
    dismissed: reports.filter((r) => r.status === "DISMISSED").length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Flag className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Content Moderation Reports
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Review user-submitted reports for community posts, comments, events, and users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadReports()}
            className="rounded-xl"
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link
            href={ROUTES.ADMIN_MODERATION}
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-xl")}
          >
            Moderation Desk
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3">
        {(
          [
            { id: "ALL", label: "All Reports", count: counts.all },
            { id: "OPEN", label: "Open", count: counts.open },
            { id: "UNDER_REVIEW", label: "Under Review", count: counts.underReview },
            { id: "RESOLVED", label: "Resolved", count: counts.resolved },
            { id: "DISMISSED", label: "Dismissed", count: counts.dismissed },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive ? "bg-white/20 text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, reason, content snippet..."
            className="pl-9 text-sm rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Type:</span>
          </div>

          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as ReportedContentType | "ALL")}>
            <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="POST">Post</SelectItem>
              <SelectItem value="COMMENT">Comment</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
              <SelectItem value="CLUB">Club</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reasonFilter} onValueChange={(val) => setReasonFilter(val as ReportReason | "ALL")}>
            <SelectTrigger className="w-[150px] h-9 text-xs rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Reasons</SelectItem>
              <SelectItem value="HARASSMENT">Harassment</SelectItem>
              <SelectItem value="SPAM">Spam</SelectItem>
              <SelectItem value="HATE_SPEECH">Hate Speech</SelectItem>
              <SelectItem value="MISINFORMATION">Misinformation</SelectItem>
              <SelectItem value="INAPPROPRIATE">Inappropriate</SelectItem>
              <SelectItem value="ACADEMIC_DISHONESTY">Academic Dishonesty</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports List / Table */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <Flag className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No reports match your filters</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Clear or change your filters to see moderation reports.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-border/90 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      Report #{report.id}
                    </span>
                    <ReportStatusBadge status={report.status} />
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {report.targetType}
                    </span>
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      {report.reason}
                    </span>
                  </div>

                  {report.contentSnippet && (
                    <p className="line-clamp-2 text-xs italic text-foreground/85 bg-muted/30 p-2 rounded-lg border border-border/40">
                      &ldquo;{report.contentSnippet}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span>
                      Target ID: <span className="font-mono text-foreground">{report.targetId.slice(0, 10)}</span>
                    </span>
                    <span>•</span>
                    <span>
                      Author:{" "}
                      <span className="font-medium text-foreground">
                        {report.isAuthorAnonymous ? "Anonymous Student" : report.authorName || "Unknown"}
                      </span>
                    </span>
                    <span>•</span>
                    <span>Reported: {new Date(report.createdAt).toLocaleString()}</span>
                  </div>

                  {report.moderationNotes && (
                    <div className="mt-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
                      <span className="font-semibold text-primary">Moderator Note:</span> {report.moderationNotes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                  <Link
                    href={ROUTES.ADMIN_REPORT_DETAIL(report.id)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs rounded-xl")}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Details
                  </Link>

                  {report.status !== "RESOLVED" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAction(report, "REMOVE")}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-destructive" />
                        Remove
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenAction(report, "RESOLVE")}
                        className="h-8 text-xs rounded-xl"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Resolve
                      </Button>
                    </>
                  )}

                  {report.status === "OPEN" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAction(report, "DISMISS")}
                      className="h-8 text-xs text-muted-foreground rounded-xl"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      {activeReport && (
        <ReportActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          report={activeReport}
          action={actionType}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}
