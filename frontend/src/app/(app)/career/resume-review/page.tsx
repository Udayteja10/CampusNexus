"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/toast";
import { ResumeReviewRequest, ResumeReviewStatus } from "@/types/career.types";
import { careerService } from "@/services/career";
import { ResumeReviewDialog } from "@/components/career/ResumeReviewDialog";

export default function ResumeReviewPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ResumeReviewRequest[]>([]);
  const [selectedReview, setSelectedReview] = useState<ResumeReviewRequest | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await careerService.getMyResumeReviews();
      setReviews(data);
      if (data.length > 0) {
        setSelectedReview(data[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your resume reviews");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: ResumeReviewStatus) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
            <Clock className="h-3 w-3 mr-1" /> Submitted
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
            <Clock className="h-3 w-3 mr-1" /> In Review
          </Badge>
        );
      case "REVIEWED":
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Reviewed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 font-semibold px-3 py-0.5">
              Placement Cell & Mentor Feedback
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <FileText className="h-8 w-8 text-indigo-400" />
              Private Resume Review
            </h1>
            <p className="text-sm text-slate-200/90 leading-relaxed">
              Get constructive, personalized evaluation from faculty mentors and placement coordinators.
              All submissions and reports are completely private to your account.
            </p>
          </div>

          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shrink-0"
            onClick={() => setRequestDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Request Resume Review
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 md:col-span-2 rounded-xl" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No resume review requests yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Submit your resume PDF to receive a comprehensive ATS compatibility and structural breakdown
              from campus placement advisors.
            </p>
            <Button onClick={() => setRequestDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Review Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Submissions History List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Your Requests ({reviews.length})
            </h3>
            {reviews.map((rev) => {
              const isSelected = selectedReview?.id === rev.id;
              return (
                <Card
                  key={rev.id}
                  onClick={() => setSelectedReview(rev)}
                  className={`cursor-pointer transition-all border-border ${
                    isSelected
                      ? "ring-2 ring-primary bg-muted/40 shadow-sm"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold truncate max-w-[170px]">
                        {rev.resumeTitle}
                      </span>
                      {getStatusBadge(rev.status)}
                    </div>
                    {rev.targetRole && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" /> Target: {rev.targetRole}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                      <span>
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {rev.feedback?.overallScore !== undefined && (
                        <span className="font-bold text-primary">
                          Score: {rev.feedback.overallScore}/100
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right Column: Selected Request Review Details */}
          <div className="md:col-span-2 space-y-6">
            {selectedReview && (
              <>
                {/* Header Card */}
                <Card className="border-border">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl font-bold">
                            {selectedReview.resumeTitle}
                          </CardTitle>
                          {getStatusBadge(selectedReview.status)}
                        </div>
                        <CardDescription className="pt-1">
                          Submitted on{" "}
                          {new Date(selectedReview.createdAt).toLocaleDateString("en-IN", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {selectedReview.targetRole && ` • Target: ${selectedReview.targetRole}`}
                          {selectedReview.targetCompany && ` at ${selectedReview.targetCompany}`}
                        </CardDescription>
                      </div>

                      <Badge variant="secondary" className="font-mono text-xs">
                        {selectedReview.resumeFileName}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Score & Breakdown (if reviewed) */}
                {selectedReview.feedback ? (
                  <div className="space-y-6">
                    {/* Overall Score Card */}
                    <Card className="border-border bg-gradient-to-br from-card to-primary/5">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="space-y-1">
                            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                              Overall Resume Score
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-extrabold text-foreground">
                                {selectedReview.feedback.overallScore}
                              </span>
                              <span className="text-muted-foreground text-sm font-semibold">/ 100</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Assessed by: {selectedReview.feedback.reviewerName || "Placement Review Panel"}
                            </p>
                          </div>

                          {/* Section Score Bars */}
                          {selectedReview.feedback.sectionScores && (
                            <div className="grid grid-cols-2 gap-3 w-full sm:w-72 text-xs">
                              {Object.entries(selectedReview.feedback.sectionScores).map(([key, val]) => (
                                <div key={key} className="space-y-1 bg-muted/40 p-2 rounded-lg">
                                  <div className="flex justify-between font-medium capitalize text-muted-foreground">
                                    <span>{key.replace(/([A-Z])/g, " $1")}</span>
                                    <span className="font-bold text-foreground">{val}/100</span>
                                  </div>
                                  <Progress value={val} className="h-1.5" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Feedback & Action Items */}
                    <Card className="border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                          Mentor Feedback & Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Strengths & Weaknesses Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedReview.feedback.strengths && selectedReview.feedback.strengths.length > 0 && (
                            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4" /> Key Strengths
                              </h4>
                              <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200/90 list-disc list-inside">
                                {selectedReview.feedback.strengths.map((str, i) => (
                                  <li key={i} className="leading-relaxed">
                                    {str}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedReview.feedback.weaknesses && selectedReview.feedback.weaknesses.length > 0 && (
                            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                                <AlertCircle className="h-4 w-4" /> Areas for Improvement
                              </h4>
                              <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200/90 list-disc list-inside">
                                {selectedReview.feedback.weaknesses.map((weak, i) => (
                                  <li key={i} className="leading-relaxed">
                                    {weak}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Recommendations */}
                        {selectedReview.feedback.recommendations && selectedReview.feedback.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <Sparkles className="h-4 w-4 text-primary" /> Actionable Next Steps
                            </h4>
                            <div className="space-y-2">
                              {selectedReview.feedback.recommendations.map((rec, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card text-xs text-foreground"
                                >
                                  <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                    {i + 1}
                                  </div>
                                  <span className="leading-relaxed">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-border p-8 text-center space-y-3">
                    <Clock className="h-10 w-10 text-amber-500 mx-auto" />
                    <h3 className="text-base font-semibold">Review in Progress</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Your resume is currently queued for evaluation. You will receive an updated score
                      and actionable mentor feedback shortly.
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* New Request Modal Dialog */}
      <ResumeReviewDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSuccess={() => loadReviews()}
      />
    </div>
  );
}
