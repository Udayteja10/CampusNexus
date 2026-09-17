"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Flag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/admin/ReportStatusBadge";
import { ReportActionDialog } from "@/components/admin/ReportActionDialog";
import { moderationService } from "@/services/moderation";
import { ModerationReport, ReportStatus } from "@/types/moderation.types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AdminModerationDeskPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE">("RESOLVE");

  const loadPendingReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moderationService.getReports({ status: "ALL" });
      const pending = data.filter((r) => r.status === "OPEN" || r.status === "UNDER_REVIEW");
      setReports(pending);
      if (pending.length > 0 && !selectedReport) {
        setSelectedReport(pending[0]);
      } else if (pending.length === 0) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error("Failed to load moderation desk reports:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedReport]);

  useEffect(() => {
    loadPendingReports();
  }, [loadPendingReports]);

  const handleOpenAction = (
    report: ModerationReport,
    action: "REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE"
  ) => {
    setSelectedReport(report);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleActionComplete = (updated: ModerationReport) => {
    setReports((prev) => prev.filter((r) => r.id !== updated.id));
    setSelectedReport((prev) => (prev?.id === updated.id ? null : prev));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Moderation Desk
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Live triage workbench for rapidly reviewing and resolving reported community violations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPendingReports()}
            className="rounded-xl"
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
          <Link
            href={ROUTES.ADMIN_REPORTS}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
          >
            All Reports
          </Link>
        </div>
      </div>

      {/* Workspace Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Loading moderation desk...</div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-16 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500/80" />
          <h3 className="mt-4 text-base font-semibold text-foreground">Moderation Queue Clear!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no unresolved flagged reports waiting for triage. Great job!
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={ROUTES.ADMIN_REPORTS}
              className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
            >
              Browse Historical Reports
            </Link>
            <Link
              href={ROUTES.ADMIN_DASHBOARD}
              className={cn(buttonVariants({ variant: "default" }), "rounded-xl")}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Triage Queue (5 cols) */}
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Triage ({reports.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {reports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">
                            {report.targetType} #{report.id}
                          </span>
                          <ReportStatusBadge status={report.status} />
                        </div>
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          {report.reason}
                        </div>
                        {report.contentSnippet && (
                          <p className="line-clamp-2 text-xs italic text-muted-foreground">
                            &ldquo;{report.contentSnippet}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Inspection Pane (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {selectedReport ? (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                {/* Header & Quick Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">
                        Report #{selectedReport.id}
                      </h2>
                      <ReportStatusBadge status={selectedReport.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: {selectedReport.targetType} • Reason: {selectedReport.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAction(selectedReport, "REMOVE")}
                      className="rounded-xl text-destructive hover:bg-destructive/10"
                    >
                      <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-destructive" />
                      Remove Content
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenAction(selectedReport, "RESOLVE")}
                      className="rounded-xl"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Resolve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAction(selectedReport, "DISMISS")}
                      className="rounded-xl text-muted-foreground"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Dismiss
                    </Button>
                  </div>
                </div>

                {/* Flagged Content Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Flagged Content Preview
                  </span>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
                    {selectedReport.contentSnippet ? (
                      <p className="italic font-normal">&ldquo;{selectedReport.contentSnippet}&rdquo;</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No snippet attached with this report.</p>
                    )}
                  </div>
                </div>

                {/* Violation & Reporter Metadata */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-muted/30 p-3.5 border border-border/40 space-y-1">
                    <span className="text-muted-foreground font-medium">Violation Reason</span>
                    <div className="font-semibold text-foreground text-sm">{selectedReport.reason}</div>
                    {selectedReport.description && (
                      <p className="text-muted-foreground pt-1">{selectedReport.description}</p>
                    )}
                  </div>

                  <div className="rounded-xl bg-muted/30 p-3.5 border border-border/40 space-y-1">
                    <span className="text-muted-foreground font-medium">Author Identity</span>
                    <div className="font-semibold text-foreground text-sm">
                      {selectedReport.isAuthorAnonymous ? "Anonymous Student (Protected)" : selectedReport.authorName || "Unknown"}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Reported by user ID: {selectedReport.reportedByUserId}
                    </p>
                  </div>
                </div>

                {/* Footer link to full report */}
                <div className="flex justify-end pt-2 border-t border-border/40">
                  <Link
                    href={ROUTES.ADMIN_REPORT_DETAIL(selectedReport.id)}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs rounded-xl")}
                  >
                    Open Full Report Console <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
                Select a report from the queue to inspect and take action.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {selectedReport && (
        <ReportActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          report={selectedReport}
          action={actionType}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}
