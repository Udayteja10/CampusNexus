"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Mail,
  MessageSquarePlus,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService, AcademicAccessError } from "@/services/academic";
import { Faculty, FacultyReview } from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { StarRating } from "@/components/academic/StarRating";
import { FacultyReviewDialog } from "@/components/academic/FacultyReviewDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";

export default function FacultyDetailPage() {
  const params = useParams();
  const facultyId = params?.id as string;
  const user = useAuthStore((s) => s.user);

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [reviews, setReviews] = useState<FacultyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<FacultyReview | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!facultyId) return;
    setLoading(true);
    setAccessError(null);
    try {
      const f = await academicService.getFacultyById(facultyId);
      if (!f) {
        setAccessError("Faculty member not found.");
        return;
      }
      setFaculty(f);
      const revs = await academicService.getFacultyReviews(facultyId);
      setReviews(revs);
    } catch (err: any) {
      if (err instanceof AcademicAccessError) {
        setAccessError(err.message);
      } else {
        setAccessError(err.message || "Failed to load faculty profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [facultyId, user?.department]);

  const userReview = reviews.find((r) => r.studentId === user?.id);

  const handleOpenCreateReview = () => {
    setEditingReview(null);
    setReviewDialogOpen(true);
  };

  const handleOpenEditReview = (rev: FacultyReview) => {
    setEditingReview(rev);
    setReviewDialogOpen(true);
  };

  const handleDeleteReviewConfirm = async () => {
    if (!deletingReviewId) return;
    setIsDeleting(true);
    try {
      await academicService.deleteFacultyReview(deletingReviewId);
      toast.success("Your review has been deleted.");
      setDeletingReviewId(null);
      await loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete review.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (accessError || !faculty) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {accessError || "Faculty record not found."}
        </p>
        <div className="pt-2">
          <Link href={ROUTES.ACADEMIC_FACULTY}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Faculty Directory</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back link */}
      <Link
        href={ROUTES.ACADEMIC_FACULTY}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Faculty Directory</span>
      </Link>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <DeptBadge departmentIdOrName={faculty.departmentId} size="md" />
          </div>

          {userReview ? (
            <Button
              onClick={() => handleOpenEditReview(userReview)}
              variant="outline"
              className="gap-2 self-start sm:self-auto shadow-xs border-primary/40 text-primary hover:bg-primary/5"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Your Review</span>
            </Button>
          ) : (
            <Button
              onClick={handleOpenCreateReview}
              className="gap-2 self-start sm:self-auto shadow-xs"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Write Feedback Review</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border/60 pb-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {faculty.name}
            </h1>
            <p className="text-sm font-semibold text-primary">
              {faculty.designation}
            </p>
            {faculty.bio && (
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed pt-1">
                {faculty.bio}
              </p>
            )}
          </div>

          {/* Rating Block */}
          <div className="rounded-xl bg-muted/40 p-4 border border-border/60 text-center shrink-0 min-w-[170px]">
            <div className="text-3xl font-black text-foreground mb-1">
              {faculty.rating.toFixed(1)}
            </div>
            <StarRating rating={faculty.rating} size="md" className="justify-center mb-1" />
            <div className="text-xs text-muted-foreground font-medium">
              Based on {faculty.reviewCount} {faculty.reviewCount === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>

        {/* Info Grid: Cabin, Office Hours, Email, Courses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-semibold uppercase text-[11px] tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Cabin Location
            </span>
            <p className="font-medium text-foreground">{faculty.cabinLocation}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-semibold uppercase text-[11px] tracking-wider">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Office Hours
            </span>
            <p className="font-medium text-foreground">{faculty.officeHours}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-semibold uppercase text-[11px] tracking-wider">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Direct Email
            </span>
            <a
              href={`mailto:${faculty.email}`}
              className="font-medium text-foreground hover:underline block truncate"
            >
              {faculty.email}
            </a>
          </div>
        </div>

        {/* Specialization & Courses */}
        <div className="space-y-3 pt-2">
          {faculty.specialization && faculty.specialization.length > 0 && (
            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5">
                Research & Domain Expertise
              </span>
              <div className="flex flex-wrap gap-1.5">
                {faculty.specialization.map((spec, i) => (
                  <span
                    key={i}
                    className="text-xs bg-muted/80 text-foreground px-2.5 py-1 rounded-md font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {faculty.subjectsHandled && faculty.subjectsHandled.length > 0 && (
            <div>
              <span className="text-xs font-bold text-foreground block mb-1.5">
                Subjects Handled
              </span>
              <p className="text-xs text-muted-foreground">
                {faculty.subjectsHandled.join(" • ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews & Feedback Section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Student Reviews & Ratings ({reviews.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Peer experiences and feedback from past academic semesters
            </p>
          </div>

          {userReview ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEditReview(userReview)}
              className="text-xs gap-1.5 border-primary/40 text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit Your Review</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCreateReview}
              className="text-xs gap-1.5"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Write Review</span>
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No reviews written for this professor yet. Be the first to share your classroom experience!
            </p>
          ) : (
            reviews.map((rev) => {
              const isOwner = user && rev.studentId === user.id;

              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-2 relative group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {rev.studentName}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        Sem {rev.semester} ({rev.academicYear})
                      </Badge>
                      {rev.updatedAt && (
                        <span className="text-[10px] text-muted-foreground italic">
                          (Edited)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <StarRating rating={rev.rating} size="sm" />

                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => handleOpenEditReview(rev)}
                            title="Edit Review"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeletingReviewId(rev.id)}
                            title="Delete Review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {rev.tags && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rev.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-foreground leading-relaxed pt-1">{rev.comment}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <FacultyReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        faculty={faculty}
        initialReview={editingReview}
        onSuccess={loadData}
      />

      {/* Delete Review Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deletingReviewId)}
        onOpenChange={(open) => !open && setDeletingReviewId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your feedback will be permanently removed from this faculty member&apos;s profile and average ratings will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReviewConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
