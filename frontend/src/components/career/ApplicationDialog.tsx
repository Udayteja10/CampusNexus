"use client";

import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Send, FileText, CheckCircle2, Building2 } from "lucide-react";
import { CareerOpportunity, StudentCareerProfile } from "@/types/career.types";
import { careerService } from "@/services/career";
import { toast } from "@/lib/toast";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CareerOpportunity | null;
  onSuccess?: () => void;
}

export function ApplicationDialog({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: ApplicationDialogProps) {
  const [profile, setProfile] = useState<StudentCareerProfile | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [agreeDeclaration, setAgreeDeclaration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (open) {
      careerService
        .getStudentCareerProfile()
        .then((p) => {
          if (!isMounted) return;
          setProfile(p);
          setResumeTitle(p.resumeTitle || "Student_Resume_2025.pdf");
          setNotes("");
          setAgreeDeclaration(false);
        })
        .catch(console.error);
    }
    return () => {
      isMounted = false;
    };
  }, [open]);

  if (!opportunity) return null;

  const isPlacement = opportunity.type === "PLACEMENT";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeDeclaration) {
      toast.error("Please confirm the academic and accuracy declaration.");
      return;
    }

    setIsSubmitting(true);
    try {
      await careerService.applyToOpportunity({
        opportunityId: opportunity.id,
        opportunityType: opportunity.type,
        resumeTitle: resumeTitle.trim() || "Student_Resume.pdf",
        notes: notes.trim() || undefined,
      });

      toast.success(
        `Application submitted successfully to ${opportunity.companyName} for ${opportunity.role}!`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>Apply to {opportunity.companyName}</span>
          </DialogTitle>
          <DialogDescription>
            {opportunity.role} • {isPlacement ? `₹${opportunity.packageLpa.toFixed(1)} LPA` : `₹${opportunity.stipendMonthly.toLocaleString("en-IN")}/mo`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Candidate Profile Verification Summary */}
          <div className="rounded-xl bg-muted/40 p-4 border border-border/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="font-bold text-foreground">Verified Student Profile</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Eligibility Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Student Name:</span>
                <span className="font-semibold text-foreground">{profile?.studentName || "Student"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Branch / Dept:</span>
                <span className="font-semibold text-foreground">{profile?.department || "CSE"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Academic Year:</span>
                <span className="font-semibold text-foreground">Year {profile?.currentYear || 4}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">CGPA / Backlogs:</span>
                <span className="font-semibold text-foreground">
                  {profile?.cgpa.toFixed(2) || "8.20"} CGPA ({profile?.backlogsCount || 0} active backlogs)
                </span>
              </div>
            </div>
          </div>

          {/* Attached Resume */}
          <div className="space-y-1.5">
            <Label htmlFor="app-resume" className="text-xs font-semibold">
              Attached Resume Document <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <Input
                id="app-resume"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="Resume_Filename.pdf"
                className="h-8 text-xs border-0 focus-visible:ring-0 px-1 shadow-none"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Candidate profile information and skills will be submitted alongside your resume reference.
            </p>
          </div>

          {/* Cover note / message */}
          <div className="space-y-1.5">
            <Label htmlFor="app-notes" className="text-xs font-semibold">
              Candidate Note / Project Highlights (Optional)
            </Label>
            <Textarea
              id="app-notes"
              placeholder="Highlight any relevant capstone projects, coding rankings, or certifications relevant to this role..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          {/* Declaration check */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-muted/20">
            <Checkbox
              id="app-agree"
              checked={agreeDeclaration}
              onCheckedChange={(c) => setAgreeDeclaration(Boolean(c))}
              className="mt-0.5"
            />
            <div className="space-y-0.5 text-xs">
              <label
                htmlFor="app-agree"
                className="font-semibold text-foreground cursor-pointer"
              >
                Accuracy Declaration & Terms
              </label>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                I declare that my academic details, CGPA, and backlog declarations are true. I agree to abide by the campus placement and internship code of conduct.
              </p>
            </div>
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
            <Button
              type="submit"
              disabled={isSubmitting || !agreeDeclaration}
              className="gap-1.5 font-semibold"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
