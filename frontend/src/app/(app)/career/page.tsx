"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  FileCheck2,
  FolderHeart,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  careerService,
  CareerDashboardStats,
} from "@/services/career";
import {
  PlacementOpportunity,
  InternshipOpportunity,
  CareerApplication,
  StudentCareerProfile,
} from "@/types/career.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityCard } from "@/components/career/OpportunityCard";
import { cn } from "@/lib/utils";

export default function CareerHubPage() {
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<CareerDashboardStats | null>(null);
  const [profile, setProfile] = useState<StudentCareerProfile | null>(null);
  const [placements, setPlacements] = useState<PlacementOpportunity[]>([]);
  const [internships, setInternships] = useState<InternshipOpportunity[]>([]);
  const [recentApplications, setRecentApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, plList, intList, apps] = await Promise.all([
        careerService.getCareerStats(),
        careerService.getStudentCareerProfile(),
        careerService.getPlacements(),
        careerService.getInternships(),
        careerService.getMyApplications(),
      ]);

      setStats(s);
      setProfile(p);
      setPlacements(plList.slice(0, 3));
      setInternships(intList.slice(0, 3));
      setRecentApplications(apps.slice(0, 3));
    } catch (err) {
      console.error("Failed to load career hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, user?.department]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.04] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Campus-Wide Career Hub
              </Badge>
              <span className="text-xs text-muted-foreground">
                Academic Year 2024–2025
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Unlock Your Career Opportunities
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Discover verified full-time campus placements, summer internships, track your applications in real-time, and polish your resume with structured review feedback.
            </p>
          </div>

          {/* Student Career Eligibility Snapshot Pill */}
          {profile && (
            <div className="rounded-2xl border border-border/80 bg-background/80 backdrop-blur-xs p-4 sm:p-5 shrink-0 min-w-[240px] space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  Your Profile Status
                </span>
                <span className="text-[11px] font-semibold text-primary">
                  Year {profile.currentYear}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Branch:</span>
                  <span className="font-semibold text-foreground truncate block">
                    {profile.department}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">CGPA:</span>
                  <span className="font-semibold text-foreground">{profile.cgpa.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                {profile.currentYear === 4
                  ? "✓ Eligible for 4th-Year Placements"
                  : profile.currentYear === 3
                  ? "✓ Eligible for 3rd-Year Internships"
                  : "Explore & Bookmark Opportunities"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
            Active Placements
          </span>
          <div className="text-2xl font-black text-foreground">
            {loading ? <Skeleton className="h-7 w-12" /> : stats?.activePlacementsCount ?? 0}
          </div>
          <span className="text-[10px] text-muted-foreground">Campus-wide drives</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />
            Active Internships
          </span>
          <div className="text-2xl font-black text-foreground">
            {loading ? <Skeleton className="h-7 w-12" /> : stats?.activeInternshipsCount ?? 0}
          </div>
          <span className="text-[10px] text-muted-foreground">Summer openings</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Eligible for You
          </span>
          <div className="text-2xl font-black text-foreground">
            {loading ? <Skeleton className="h-7 w-12" /> : stats?.eligibleOpportunitiesCount ?? 0}
          </div>
          <span className="text-[10px] text-muted-foreground">Matched criteria</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
            <Send className="h-3.5 w-3.5 text-blue-500" />
            My Applications
          </span>
          <div className="text-2xl font-black text-foreground">
            {loading ? <Skeleton className="h-7 w-12" /> : stats?.myApplicationsCount ?? 0}
          </div>
          <span className="text-[10px] text-muted-foreground">Submitted drives</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
            <FolderHeart className="h-3.5 w-3.5 text-rose-500" />
            Saved / Bookmarks
          </span>
          <div className="text-2xl font-black text-foreground">
            {loading ? <Skeleton className="h-7 w-12" /> : stats?.savedOpportunitiesCount ?? 0}
          </div>
          <span className="text-[10px] text-muted-foreground">In your lists</span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
            <FileCheck2 className="h-3.5 w-3.5 text-amber-500" />
            Resume Reviews
          </span>
          <div className="text-2xl font-black text-foreground">
            {loading ? <Skeleton className="h-7 w-12" /> : stats?.pendingResumeReviewsCount ?? 0}
          </div>
          <span className="text-[10px] text-muted-foreground">In review pipeline</span>
        </div>
      </div>

      {/* Main Career Navigation Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placement Hub Card */}
        <Link
          href={ROUTES.CAREER_PLACEMENTS}
          className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
              Placement Hub
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore Tier-1 product and consulting recruitment drives, package breakdowns, and eligibility cutoffs.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2">
            <span>Browse Placements</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Internship Hub Card */}
        <Link
          href={ROUTES.CAREER_INTERNSHIPS}
          className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
              Internship Hub
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discover summer internships with competitive stipends across software, hardware, IoT, and analytics domains.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2">
            <span>Explore Internships</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Resume Review Hub Card */}
        <Link
          href={ROUTES.CAREER_RESUME_REVIEW}
          className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
              Resume Review
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Privately submit your resume for structured evaluation of action metrics, formatting, and technical impact.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2">
            <span>Review Center</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {/* Smart Collections Card */}
        <Link
          href={ROUTES.CAREER_COLLECTIONS}
          className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FolderHeart className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
              Smart Collections
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curate customized opportunity folders across any engineering department with personal notes.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2">
            <span>Manage Collections</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      {/* Featured Placements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Featured Campus Placements
            </h2>
            <p className="text-xs text-muted-foreground">
              4th-year recruitment openings open for discovery campus-wide
            </p>
          </div>

          <Link href={ROUTES.CAREER_PLACEMENTS}>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <span>View All ({stats?.activePlacementsCount ?? 0})</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {placements.map((p) => (
              <OpportunityCard key={p.id} opportunity={p} />
            ))}
          </div>
        )}
      </div>

      {/* Featured Internships Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Featured Summer Internships
            </h2>
            <p className="text-xs text-muted-foreground">
              3rd-year summer research and industrial opportunities
            </p>
          </div>

          <Link href={ROUTES.CAREER_INTERNSHIPS}>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <span>View All ({stats?.activeInternshipsCount ?? 0})</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {internships.map((i) => (
              <OpportunityCard key={i.id} opportunity={i} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications Tracker Strip */}
      {recentApplications.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Your Active Applications ({recentApplications.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Track status updates and scheduled interview rounds
              </p>
            </div>
            <Link href={ROUTES.CAREER_APPLICATIONS}>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>View Full Application Tracker</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate">{app.companyName}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-primary/10 text-primary border-primary/20"
                  >
                    {app.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-muted-foreground truncate">{app.role}</p>
                <p className="text-[10px] text-muted-foreground">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
