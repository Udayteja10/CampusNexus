"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  GraduationCap,
  Award,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Bookmark,
  Layers,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import {
  PlacementOpportunity,
  StudentCareerProfile,
  EligibilityResult,
} from "@/types/career.types";
import { careerService } from "@/services/career";
import { EligibilityCard } from "@/components/career/EligibilityCard";
import { SaveToCollectionDialog } from "@/components/career/SaveToCollectionDialog";
import { ApplicationDialog } from "@/components/career/ApplicationDialog";

export default function PlacementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [placement, setPlacement] = useState<PlacementOpportunity | null>(null);
  const [profile, setProfile] = useState<StudentCareerProfile | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const [pData, sProfile, savedIds, myApps] = await Promise.all([
          careerService.getPlacementById(id),
          careerService.getStudentCareerProfile(),
          careerService.getSavedOpportunityIds(),
          careerService.getMyApplications(),
        ]);

        if (!pData) {
          toast.error("Placement opportunity not found");
          router.push(ROUTES.CAREER_PLACEMENTS);
          return;
        }

        setPlacement(pData);
        setProfile(sProfile);
        setIsSaved(savedIds.includes(pData.id));

        const applied = myApps.some(
          (a) => a.opportunityId === pData.id && a.status !== "WITHDRAWN"
        );
        setHasApplied(applied);

        const evalResult = careerService.evaluateEligibilitySync(pData, sProfile);
        setEligibility(evalResult);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load placement details");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  const handleToggleBookmark = async () => {
    if (!placement) return;
    try {
      const res = await careerService.toggleBookmark(placement.id);
      setIsSaved(res.saved);
      toast.success(res.saved ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!placement) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Opportunity Not Found</h2>
        <p className="text-muted-foreground">
          The requested placement opportunity may have been removed or archived.
        </p>
        <Link href={ROUTES.CAREER_PLACEMENTS} className={buttonVariants({ variant: "default" })}>
          Back to Placements
        </Link>
      </div>
    );
  }

  const isClosed =
    placement.status === "CLOSED" ||
    (placement.applicationDeadline && new Date(placement.applicationDeadline).getTime() < Date.now());

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.CAREER_PLACEMENTS}
          className={buttonVariants({ variant: "ghost", size: "sm" }) + " -ml-2 text-muted-foreground hover:text-foreground"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Placements
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleToggleBookmark}
            className={isSaved ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}>
            <Layers className="h-4 w-4 mr-2" />
            Save to Collection
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden shadow-sm">
                {placement.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={placement.companyLogo}
                    alt={placement.companyName}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {placement.role}
                  </h1>
                  <Badge variant="secondary" className="font-semibold uppercase text-xs">
                    Placement
                  </Badge>
                  {isClosed && (
                    <Badge variant="destructive" className="text-xs">
                      Closed / Expired
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-medium text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {placement.companyName}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {placement.location} ({placement.workMode})
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {placement.packageDetails || `₹${placement.packageLpa} LPA`}
                  </span>
                  {placement.domain && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {placement.domain}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Application Action Button Header */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 shrink-0">
              {hasApplied ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-lg font-medium text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Application Submitted</span>
                </div>
              ) : isClosed ? (
                <Button disabled variant="secondary" size="lg" className="w-full">
                  Applications Closed
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full shadow-md"
                  disabled={!eligibility?.isEligible}
                  onClick={() => setApplyDialogOpen(true)}
                >
                  {eligibility?.isEligible ? "Apply Now" : "Not Eligible to Apply"}
                </Button>
              )}

              {placement.applicationDeadline && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center md:justify-end">
                  <Calendar className="h-3.5 w-3.5" />
                  Deadline:{" "}
                  {new Date(placement.applicationDeadline).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Details (Left) + Eligibility & Metadata (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Job Description & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Company About */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">About {placement.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {`${placement.companyName} is a leading organization actively recruiting graduating students from our campus.`}
              </p>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {placement.description}
              </p>

              {placement.responsibilities && placement.responsibilities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-semibold text-foreground">Key Responsibilities</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {placement.responsibilities.map((resp, i) => (
                      <li key={i} className="leading-relaxed">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Required */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Required Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {placement.requiredSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selection Rounds */}
          {placement.selectionRounds && placement.selectionRounds.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Selection Process</CardTitle>
                <CardDescription>
                  Expected interview and evaluation stages for this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {placement.selectionRounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/20"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{round}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Eligibility Engine Breakdown & Quick Meta */}
        <div className="space-y-6">
          {/* Eligibility Card */}
          {eligibility && (
            <EligibilityCard
              result={eligibility}
            />
          )}

          {/* Quick Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Summary Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> Academic Year
                </span>
                <span className="font-semibold text-foreground">4th Year Only</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4" /> Min CGPA
                </span>
                <span className="font-semibold text-foreground">
                  {placement.eligibility.minCgpa && placement.eligibility.minCgpa > 0
                    ? `${placement.eligibility.minCgpa} CGPA`
                    : "None"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Max Backlogs
                </span>
                <span className="font-semibold text-foreground">
                  {placement.eligibility.maxBacklogs === 0
                    ? "0 (No active backlogs)"
                    : placement.eligibility.maxBacklogs ?? "None"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> Eligible Depts
                </span>
                <span className="font-semibold text-foreground text-right">
                  {placement.eligibility.eligibleDepartments.includes("all")
                    ? "All Departments"
                    : placement.eligibility.eligibleDepartments.map((d) => d.toUpperCase()).join(", ")}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Method
                </span>
                <span className="font-semibold text-foreground">
                  {placement.applicationMethod === "PORTAL"
                    ? "On-Campus Portal"
                    : placement.applicationMethod === "DIRECT"
                    ? "Direct Application"
                    : "External Link"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notice on Academic Year Rule */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              Platform Academic Year Rule
            </p>
            <p className="leading-relaxed">
              Placements are strictly reserved for 4th-year graduating students. 1st, 2nd, and 3rd-year
              students can view and bookmark placements, but cannot apply.
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {placement && (
        <>
          <SaveToCollectionDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            opportunity={placement}
          />
          <ApplicationDialog
            open={applyDialogOpen}
            onOpenChange={setApplyDialogOpen}
            opportunity={placement}
            onSuccess={() => {
              setHasApplied(true);
            }}
          />
        </>
      )}
    </div>
  );
}
