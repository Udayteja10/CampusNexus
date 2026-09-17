"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck2, UploadCloud, Send } from "lucide-react";
import { careerService } from "@/services/career";
import { toast } from "@/lib/toast";

interface ResumeReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ResumeReviewDialog({
  open,
  onOpenChange,
  onSuccess,
}: ResumeReviewDialogProps) {
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error("Please specify your target role.");
      return;
    }
    if (!resumeTitle.trim()) {
      toast.error("Please provide a title for your resume document.");
      return;
    }

    setIsSubmitting(true);
    try {
      await careerService.createResumeReview({
        targetRole: targetRole.trim(),
        targetCompany: targetCompany.trim() || undefined,
        resumeTitle: resumeTitle.trim(),
        resumeFileName: resumeFileName.trim() || `${resumeTitle.trim().replace(/\s+/g, "_")}.pdf`,
        notes: notes.trim() || undefined,
      });

      toast.success("Resume review request submitted successfully!");
      onOpenChange(false);
      // Reset form
      setTargetRole("");
      setTargetCompany("");
      setResumeTitle("");
      setResumeFileName("");
      setNotes("");
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit resume review request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <span>Request Resume Review</span>
          </DialogTitle>
          <DialogDescription>
            Submit your resume privately to receive structured evaluation on ATS score, technical impact metrics, and typography.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          {/* Target Role & Target Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="target-role" className="text-xs font-semibold">
                Target Role *
              </Label>
              <Input
                id="target-role"
                placeholder="e.g. SDE-1, Cloud Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="target-comp" className="text-xs font-semibold">
                Target Company (Optional)
              </Label>
              <Input
                id="target-comp"
                placeholder="e.g. Google, Amazon"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Resume Document Title */}
          <div className="space-y-1">
            <Label htmlFor="resume-title" className="text-xs font-semibold">
              Resume Document Label *
            </Label>
            <Input
              id="resume-title"
              placeholder="e.g. Rohit_Reddy_Backend_SDE_v2"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Mock File Upload Attachment box */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Attached PDF File</Label>
            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-1.5 cursor-pointer hover:border-primary/50 transition-colors">
              <UploadCloud className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-xs font-medium text-foreground">
                {resumeFileName ? resumeFileName : "Click or drag resume file (PDF, max 5MB)"}
              </p>
              <Input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                id="resume-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setResumeFileName(file.name);
                    if (!resumeTitle) setResumeTitle(file.name.replace(/\.[^/.]+$/, ""));
                  }
                }}
              />
              <label
                htmlFor="resume-file-input"
                className="inline-block text-[11px] text-primary hover:underline cursor-pointer font-medium"
              >
                Browse local device
              </label>
            </div>
          </div>

          {/* Specific questions for reviewer */}
          <div className="space-y-1">
            <Label htmlFor="rev-notes" className="text-xs font-semibold">
              Specific Areas for Feedback (Optional)
            </Label>
            <Textarea
              id="rev-notes"
              placeholder="e.g. Are my action verbs strong? Does my capstone project demonstrate sufficient backend complexity?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5 font-semibold">
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit for Review"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
