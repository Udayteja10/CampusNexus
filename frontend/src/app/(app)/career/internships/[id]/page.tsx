"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
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
  Briefcase,
  Hourglass,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import {
  InternshipOpportunity,
  StudentCareerProfile,
  EligibilityResult,
} from "@/types/career.types";
import { careerService } from "@/services/career";
import { EligibilityCard } from "@/components/career/EligibilityCard";
import { SaveToCollectionDialog } from "@/components/career/SaveToCollectionDialog";
import { ApplicationDialog } from "@/components/career/ApplicationDialog";

export default function InternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState<InternshipOpportunity | null>(null);
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
        const [iData, sProfile, savedIds, myApps] = await Promise.all([
          careerService.getInternshipById(id),
          careerService.getStudentCareerProfile(),
          careerService.getSavedOpportunityIds(),
          careerService.getMyApplications(),
        ]);

        if (!iData) {
          toast.error("Internship opportunity not found");
          router.push(ROUTES.CAREER_INTERNSHIPS);
          return;
        }

        setInternship(iData);
        setProfile(sProfile);
        setIsSaved(savedIds.includes(iData.id));

        const applied = myApps.some(
          (a) => a.opportunityId === iData.id && a.status !== "WITHDRAWN"
        );
        setHasApplied(applied);

        const evalResult = careerService.evaluateEligibilitySync(iData, sProfile);
        setEligibility(evalResult);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load internship details");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  const handleToggleBookmark = async () => {
    if (!internship) return;
    try {
      const res = await careerService.toggleBookmark(internship.id);
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

  if (!internship) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold">Opportunity Not Found</h2>
        <p className="text-muted-foreground">
          The requested internship opportunity may have been removed or archived.
        </p>
        <Link href={ROUTES.CAREER_INTERNSHIPS} className={buttonVariants({ variant: "default" })}>
          Back to Internships
        </Link>
      </div>
    );
  }

  const isClosed =
    internship.status === "CLOSED" ||
    (internship.applicationDeadline &&
      new Date(internship.applicationDeadline).getTime() < Date.now());

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.CAREER_INTERNSHIPS}
          className={buttonVariants({ variant: "ghost", size: "sm" }) + " -ml-2 text-muted-foreground hover:text-foreground"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Internships
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
        <div className="h-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden shadow-sm">
                {internship.companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={internship.companyLogo}
                    alt={internship.companyName}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {internship.role}
                  </h1>
                  <Badge variant="secondary" className="font-semibold uppercase text-xs">
                    Internship
                  </Badge>
                  {isClosed && (
                    <Badge variant="destructive" className="text-xs">
                      Closed / Expired
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-medium text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {internship.companyName}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {internship.location} ({internship.workMode})
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {internship.stipendDetails || `₹${internship.stipendMonthly.toLocaleString("en-IN")}/month`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hourglass className="h-4 w-4 text-muted-foreground" />
                    {internship.durationMonths} months
                  </span>
                  {internship.domain && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {internship.domain}
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
                  {eligibility?.isEligible ? "Apply for Internship" : "Not Eligible to Apply"}
                </Button>
              )}

              {internship.applicationDeadline && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center md:justify-end">
                  <Calendar className="h-3.5 w-3.5" />
                  Deadline:{" "}
                  {new Date(internship.applicationDeadline).toLocaleDateString("en-IN", {
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
              <CardTitle className="text-base font-semibold">About {internship.companyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {`${internship.companyName} is actively partnering with our campus to recruit talented pre-final year engineering interns.`}
              </p>
            </CardContent>
          </Card>

          {/* Internship Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Internship Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {internship.description}
              </p>

              {internship.responsibilities && internship.responsibilities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-semibold text-foreground">What You Will Do</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {internship.responsibilities.map((resp, i) => (
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
                {internship.requiredSkills.map((skill) => (
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
                <span className="font-semibold text-foreground">3rd Year Only</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Hourglass className="h-4 w-4" /> Duration
                </span>
                <span className="font-semibold text-foreground">{internship.durationMonths} months</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4" /> Min CGPA
                </span>
                <span className="font-semibold text-foreground">
                  {internship.eligibility.minCgpa && internship.eligibility.minCgpa > 0
                    ? `${internship.eligibility.minCgpa} CGPA`
                    : "None"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Max Backlogs
                </span>
                <span className="font-semibold text-foreground">
                  {internship.eligibility.maxBacklogs === 0
                    ? "0 (No active backlogs)"
                    : internship.eligibility.maxBacklogs ?? "None"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> Eligible Depts
                </span>
                <span className="font-semibold text-foreground text-right">
                  {internship.eligibility.eligibleDepartments.includes("all")
                    ? "All Departments"
                    : internship.eligibility.eligibleDepartments.map((d) => d.toUpperCase()).join(", ")}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-4 w-4" /> Method
                </span>
                <span className="font-semibold text-foreground">
                  {internship.applicationMethod === "PORTAL"
                    ? "On-Campus Portal"
                    : internship.applicationMethod === "DIRECT"
                    ? "Direct Application"
                    : "External Link"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notice on Academic Year Rule */}
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900 text-xs text-purple-800 dark:text-purple-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              Platform Academic Year Rule
            </p>
            <p className="leading-relaxed">
              Internships are strictly reserved for 3rd-year pre-final students. 1st, 2nd, and 4th-year
              students can view and bookmark internships, but cannot apply.
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {internship && (
        <>
          <SaveToCollectionDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            opportunity={internship}
          />
          <ApplicationDialog
            open={applyDialogOpen}
            onOpenChange={setApplyDialogOpen}
            opportunity={internship}
            onSuccess={() => {
              setHasApplied(true);
            }}
          />
        </>
      )}
    </div>
  );
}
