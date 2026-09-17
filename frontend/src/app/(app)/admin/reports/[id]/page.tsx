"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Flag,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReportStatusBadge } from "@/components/admin/ReportStatusBadge";
import { ReportActionDialog } from "@/components/admin/ReportActionDialog";
import { moderationService } from "@/services/moderation";
import { ModerationReport, ReportStatus } from "@/types/moderation.types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [report, setReport] = useState<ModerationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE">("RESOLVE");

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await moderationService.getReportById(id);
        if (!data) {
          setError("Report not found.");
        } else {
          setReport(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report.");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleStatusUpdate = async (status: ReportStatus) => {
    if (!report) return;
    try {
      const updated = await moderationService.updateReportStatus(
        report.id,
        status,
        `Status transitioned to ${status} via report detail console.`
      );
      setReport(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleOpenAction = (action: "REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE") => {
    setActionType(action);
    setDialogOpen(true);
  };

  const handleActionComplete = (updated: ModerationReport) => {
    setReport(updated);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading report details...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Report Not Found</h2>
        <p className="text-sm text-muted-foreground">{error || "The requested report does not exist."}</p>
        <Link
          href={ROUTES.ADMIN_REPORTS}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.ADMIN_REPORTS}
            aria-label="Back to Reports"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-xl")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Report #{report.id}
              </h1>
              <ReportStatusBadge status={report.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted on {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {report.status === "OPEN" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate("UNDER_REVIEW")}
              className="rounded-xl"
            >
              <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              Mark Under Review
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAction("REMOVE")}
            className="rounded-xl text-destructive hover:bg-destructive/10"
          >
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-destructive" />
            Remove Content
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAction("DISMISS")}
            className="rounded-xl"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            Dismiss Report
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => handleOpenAction("RESOLVE")}
            className="rounded-xl"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Resolve Report
          </Button>
        </div>
      </div>

      {/* Grid Layout: Details & Moderation Trail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Content and Report Data */}
        <div className="space-y-6 lg:col-span-2">
          {/* Target Content Snapshot */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Flagged Content Details</h2>
              </div>
              <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                Type: {report.targetType}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Content Target ID</span>
                <p className="font-mono text-xs text-foreground bg-muted/40 p-2 rounded-lg mt-1 border border-border/40">
                  {report.targetId}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground">Reported Snippet / Body</span>
                <div className="mt-1 rounded-xl border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
                  {report.contentSnippet ? (
                    <p className="italic">&ldquo;{report.contentSnippet}&rdquo;</p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No textual snippet recorded with report.</p>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground">Violation Reason</span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Flag className="h-3.5 w-3.5" />
                    {report.reason}
                  </span>
                </div>
              </div>

              {report.description && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Reporter&apos;s Description</span>
                  <p className="mt-1 text-xs text-foreground bg-muted/30 p-3 rounded-xl border border-border/40">
                    {report.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Author & Privacy Safeguards */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">
              Author Information & Privacy Safeguards
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-muted/30 p-3 border border-border/40">
                <span className="text-muted-foreground font-medium">Author Anonymity Status</span>
                <div className="mt-1 font-semibold text-foreground">
                  {report.isAuthorAnonymous ? (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Shield className="h-3.5 w-3.5" /> Anonymous Author (Protected)
                    </span>
                  ) : (
                    "Public Author Profile"
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-3 border border-border/40">
                <span className="text-muted-foreground font-medium">Author Identifier</span>
                <div className="mt-1 font-semibold text-foreground">
                  {report.isAuthorAnonymous ? "Hidden by Privacy Rules" : report.authorName || report.authorId || "Unknown"}
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-3 border border-border/40">
                <span className="text-muted-foreground font-medium">Reported By User ID</span>
                <div className="mt-1 font-mono text-foreground">{report.reportedByUserId}</div>
              </div>

              <div className="rounded-xl bg-muted/30 p-3 border border-border/40">
                <span className="text-muted-foreground font-medium">Submission Timestamp</span>
                <div className="mt-1 text-foreground">{new Date(report.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Moderation Resolution Status */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Shield className="h-5 w-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-foreground">Moderation Review</h2>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground">Current Status</span>
                <div className="mt-1">
                  <ReportStatusBadge status={report.status} />
                </div>
              </div>

              {report.reviewedByUserName && (
                <div>
                  <span className="text-muted-foreground">Reviewed By Staff</span>
                  <div className="mt-1 font-medium text-foreground">
                    {report.reviewedByUserName} ({report.reviewedByUserId})
                  </div>
                </div>
              )}

              {report.reviewedAt && (
                <div>
                  <span className="text-muted-foreground">Reviewed At</span>
                  <div className="mt-1 text-foreground">{new Date(report.reviewedAt).toLocaleString()}</div>
                </div>
              )}

              {report.actionTaken && (
                <div>
                  <span className="text-muted-foreground">Action Executed</span>
                  <div className="mt-1 font-semibold text-foreground bg-primary/10 px-2.5 py-1 rounded-lg text-primary inline-block">
                    {report.actionTaken}
                  </div>
                </div>
              )}

              {report.moderationNotes && (
                <div>
                  <span className="text-muted-foreground">Moderation Audit Note</span>
                  <div className="mt-1 bg-muted/40 p-3 rounded-xl border border-border/50 text-foreground leading-relaxed">
                    {report.moderationNotes}
                  </div>
                </div>
              )}

              {!report.reviewedAt && (
                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-700 dark:text-amber-400">
                  This report is currently pending moderator action. Use the buttons above to review or resolve.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      <ReportActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        report={report}
        action={actionType}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}
