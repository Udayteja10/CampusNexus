"use client";

import { useState } from "react";
import { ReportReason } from "@/types/post.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "POST" | "COMMENT";
  targetId: string;
  postId?: string; // only needed if reporting a comment
}

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "SPAM", label: "Spam or misleading content" },
  { value: "HARASSMENT", label: "Harassment or hate speech" },
  { value: "INAPPROPRIATE", label: "Inappropriate or explicit content" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OTHER", label: "Other issue" },
];

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  postId,
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (targetType === "POST") {
        await MockCommunityServiceInstance.reportPost(targetId, reason, description);
      } else {
        await MockCommunityServiceInstance.reportComment(postId || targetId, targetId, reason, description);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription("");
        setReason("SPAM");
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to submit report. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep CampusNexus safe. Please select a reason for reporting this {targetType.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-[var(--cn-emerald)] animate-bounce" />
            <p className="font-semibold text-foreground">Report Submitted Successfully</p>
            <p className="text-xs text-muted-foreground">Thank you for reporting. Our moderators will review it shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Reason</Label>
              <div className="space-y-2.5">
                {REASONS.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-border/50 p-2.5 hover:bg-muted/40 transition-colors text-sm"
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={item.value}
                      checked={reason === item.value}
                      onChange={() => setReason(item.value)}
                      className="mt-0.5 accent-[var(--cn-indigo)]"
                    />
                    <div className="leading-tight">
                      <p className="font-medium text-foreground">{item.label}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-desc" className="text-xs font-semibold text-muted-foreground uppercase">
                Optional Details
              </Label>
              <Textarea
                id="report-desc"
                placeholder="Provide additional details or context about this report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="min-h-[80px] text-sm resize-none bg-muted/20 focus-visible:bg-background"
              />
              <div className="text-right text-[10px] text-muted-foreground">
                {description.length}/500 characters
              </div>
            </div>

            <DialogFooter className="-mx-4 -mb-4 bg-muted/30 p-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
