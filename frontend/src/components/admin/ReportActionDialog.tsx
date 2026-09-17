"use client";

import { useState } from "react";
import { ModerationReport } from "@/types/moderation.types";
import { moderationService } from "@/services/moderation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

interface ReportActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ModerationReport;
  action: "REMOVE" | "RESTORE" | "DISMISS" | "RESOLVE";
  onActionComplete?: (updated: ModerationReport) => void;
}

export function ReportActionDialog({
  open,
  onOpenChange,
  report,
  action,
  onActionComplete,
}: ReportActionDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActionDetails = () => {
    switch (action) {
      case "REMOVE":
        return {
          title: "Remove Reported Content",
          description: "This will remove the reported content from public feeds and mark the report as resolved.",
          buttonLabel: "Confirm & Remove Content",
          variant: "destructive" as const,
          placeholder: "Specify the reason for content removal (e.g. Violation of Community Guidelines)...",
        };
      case "RESTORE":
        return {
          title: "Restore Content",
          description: "This will restore previously removed content back to active status and record an audit log.",
          buttonLabel: "Restore Content",
          variant: "default" as const,
          placeholder: "Specify why content is being restored...",
        };
      case "DISMISS":
        return {
          title: "Dismiss Report",
          description: "Dismiss this report if the content does not violate any community or campus safety rules.",
          buttonLabel: "Dismiss Report",
          variant: "outline" as const,
          placeholder: "Reason for dismissal (e.g. No violation found upon moderator review)...",
        };
      case "RESOLVE":
        return {
          title: "Mark Report Resolved",
          description: "Mark this report resolved after necessary review or corrective action.",
          buttonLabel: "Mark Resolved",
          variant: "default" as const,
          placeholder: "Add any resolution notes or actions taken...",
        };
    }
  };

  const config = getActionDetails();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason or note for this moderation action.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await moderationService.moderateContent(
        report.id,
        action,
        reason.trim()
      );
      onActionComplete?.(updated);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute moderation action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground">
            {action === "REMOVE" && <AlertTriangle className="h-5 w-5 text-destructive" />}
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
            <div>
              <span className="font-semibold text-foreground">Target:</span> {report.targetType} #{report.targetId}
            </div>
            {report.contentSnippet && (
              <div className="line-clamp-2 italic pt-1 text-foreground/80">
                &ldquo;{report.contentSnippet}&rdquo;
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mod-reason">Moderation Reason / Audit Note *</Label>
            <Textarea
              id="mod-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.placeholder}
              rows={3}
              className="rounded-xl text-sm leading-relaxed"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={config.variant}
              disabled={loading || !reason.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                config.buttonLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
