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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquarePlus } from "lucide-react";
import { Faculty, Semester } from "@/types/academic.types";
import { academicService } from "@/services/academic";
import { StarRating } from "./StarRating";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface FacultyReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: Faculty | null;
  onSuccess?: () => void;
}

const AVAILABLE_TAGS = [
  "Clear Explanations",
  "Helpful Office Hours",
  "Real-world Examples",
  "Interactive Classes",
  "Fair Evaluator",
  "Strict Attendance",
  "Research Focused",
  "Practical Lab Sessions",
  "Provides Good Notes",
];

export function FacultyReviewDialog({
  open,
  onOpenChange,
  faculty,
  onSuccess,
}: FacultyReviewDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [semester, setSemester] = useState<Semester>(5);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!faculty) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please provide a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please provide constructive feedback in your review.");
      return;
    }

    setIsSubmitting(true);
    try {
      await academicService.submitFacultyReview({
        facultyId: faculty.id,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        semester,
        academicYear: "2024-2025",
        isAnonymous,
      });

      toast.success("Thank you! Your feedback has been submitted.");
      onOpenChange(false);
      // Reset form
      setRating(5);
      setComment("");
      setSelectedTags([]);
      setIsAnonymous(true);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            <span>Review {faculty.name}</span>
          </DialogTitle>
          <DialogDescription>
            Share honest, constructive feedback to help your peers and guide academic growth.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Star Rating selector */}
          <div className="space-y-2 text-center py-2 bg-muted/40 rounded-xl border border-border/60">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Overall Academic Experience Rating
            </Label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
            </div>
            <p className="text-xs font-semibold text-foreground">
              {rating === 5 && "Outstanding — Highly Recommended"}
              {rating === 4 && "Very Good — Great Teaching & Guidance"}
              {rating === 3 && "Average — Satisfactory Performance"}
              {rating === 2 && "Needs Improvement — Room for Better Clarity"}
              {rating === 1 && "Poor — Struggled with Course Material"}
            </p>
          </div>

          {/* Quick Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Highlight Attributes</Label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Semester Taken */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Semester Under This Faculty
            </Label>
            <Select
              value={String(semester)}
              onValueChange={(val) => setSemester(Number(val) as Semester)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <Label htmlFor="review-comment" className="text-xs font-semibold">
              Your Review / Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="review-comment"
              placeholder="What did you like about this professor's teaching style, lab sessions, or office hours? Any tips for future students?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none text-xs leading-relaxed"
              required
            />
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card">
            <Checkbox
              id="anonymous-check"
              checked={isAnonymous}
              onCheckedChange={(c) => setIsAnonymous(Boolean(c))}
              className="mt-0.5"
            />
            <div className="space-y-0.5 text-xs">
              <label
                htmlFor="anonymous-check"
                className="font-semibold text-foreground cursor-pointer"
              >
                Submit Anonymously (Recommended)
              </label>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Your name will be displayed as &quot;Anonymous Student&quot;. Your student identity is protected.
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting Review..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
