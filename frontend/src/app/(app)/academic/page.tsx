"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  Building2,
  HelpCircle,
  CalendarDays,
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService, AcademicDashboardStats } from "@/services/academic";
import {
  AcademicResource,
  AcademicEvent,
  StudyGroup,
  Subject,
} from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { getDepartmentLabel, getDepartmentId } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { ResourceCard } from "@/components/academic/ResourceCard";
import { StudyGroupCard } from "@/components/academic/StudyGroupCard";
import { ResourceUploadDialog } from "@/components/academic/ResourceUploadDialog";

export default function AcademicHubPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<AcademicDashboardStats | null>(null);
  const [recentResources, setRecentResources] = useState<AcademicResource[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<AcademicEvent[]>([]);
  const [featuredGroups, setFeaturedGroups] = useState<StudyGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const deptLabel = getDepartmentLabel(user?.department);
  const deptId = getDepartmentId(user?.department) || "cse";
  const isCoordinator = academicService.isDeptCoordinator();

  const loadData = async () => {
    try {
      const [statsData, resourcesData, eventsData, groupsData, subjectsData] =
        await Promise.all([
          academicService.getDashboardStats(),
          academicService.getResources({ sortBy: "newest" }),
          academicService.getAcademicEvents(),
          academicService.getStudyGroups(),
          academicService.getSubjects(),
        ]);

      setStats(statsData);
      setRecentResources(resourcesData.slice(0, 4));
      setUpcomingEvents(eventsData.slice(0, 4));
      setFeaturedGroups(groupsData.slice(0, 3));
      setSubjects(subjectsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.department]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* ─── Hero / Department Header ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <DeptBadge departmentIdOrName={deptId} size="lg" />
              <Badge variant="secondary" className="text-xs font-semibold">
                Curriculum Hub
              </Badge>
              {isCoordinator && (
                <Badge variant="outline" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Student Coordinator
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {deptLabel}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your centralized academic workspace: curated lecture notes, verified PYQs,
              study squads, faculty office hours, and university guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setUploadOpen(true)}
              className="gap-2 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Notes / PYQ</span>
            </Button>
            <Link href={ROUTES.ACADEMIC_RESOURCES}>
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Browse All</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Quick Stats Grid ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <Link href={ROUTES.ACADEMIC_RESOURCES} className="group">
              <div className="h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/40">
                <div className="text-muted-foreground text-xs font-medium flex items-center justify-between mb-1">
                  <span>Resources</span>
                  <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalResources || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">Notes & PYQs</div>
              </div>
            </Link>

            <Link href={`${ROUTES.ACADEMIC_RESOURCES}?verifiedOnly=true`} className="group">
              <div className="h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-emerald-500/40">
                <div className="text-muted-foreground text-xs font-medium flex items-center justify-between mb-1">
                  <span>Verified</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.verifiedResources || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">Coordinator approved</div>
              </div>
            </Link>

            <Link href={ROUTES.ACADEMIC_STUDY_GROUPS} className="group">
              <div className="h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/40">
                <div className="text-muted-foreground text-xs font-medium flex items-center justify-between mb-1">
                  <span>Study Groups</span>
                  <Users className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.activeStudyGroups || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">Active cohorts</div>
              </div>
            </Link>

            <Link href={ROUTES.ACADEMIC_FACULTY} className="group">
              <div className="h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/40">
                <div className="text-muted-foreground text-xs font-medium flex items-center justify-between mb-1">
                  <span>Faculty</span>
                  <Building2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.departmentFacultyCount || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">Profiles & Cabins</div>
              </div>
            </Link>

            <Link href={ROUTES.ACADEMIC_REQUESTS} className="group">
              <div className="h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-amber-500/40">
                <div className="text-muted-foreground text-xs font-medium flex items-center justify-between mb-1">
                  <span>Requests</span>
                  <HelpCircle className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats?.openRequestsCount || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">Peer note requests</div>
              </div>
            </Link>

            <Link href={ROUTES.ACADEMIC_CALENDAR} className="group">
              <div className="h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-rose-500/40">
                <div className="text-muted-foreground text-xs font-medium flex items-center justify-between mb-1">
                  <span>Exams</span>
                  <CalendarDays className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {stats?.upcomingExamsCount || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">Upcoming events</div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* ─── Main Academic Modules Navigation Cards ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Academic Modules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={ROUTES.ACADEMIC_RESOURCES} className="group">
            <div className="h-full rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Resources & PYQs
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Download verified semester notes, question papers, lab manuals, and cheatsheets.
              </p>
            </div>
          </Link>

          <Link href={ROUTES.ACADEMIC_SUBJECTS} className="group">
            <div className="h-full rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Subjects & Syllabus
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explore semester course syllabi, unit breakdowns, credits, and linked course notes.
              </p>
            </div>
          </Link>

          <Link href={ROUTES.ACADEMIC_STUDY_GROUPS} className="group">
            <div className="h-full rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Study Groups
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Form exam study circles, practice problems together, and schedule review sessions.
              </p>
            </div>
          </Link>

          <Link href={ROUTES.ACADEMIC_FACULTY} className="group">
            <div className="h-full rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Faculty Directory
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Locate faculty cabins, view office hours, specializations, and read student reviews.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Recent Resources & Events 2-Column Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Resources */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Study Resources</h2>
              <p className="text-xs text-muted-foreground">
                Latest notes and materials shared in {deptLabel}
              </p>
            </div>
            <Link href={ROUTES.ACADEMIC_RESOURCES}>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : recentResources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No resources uploaded yet. Be the first to upload for {deptLabel}!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Deadlines & Calendar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Academic Timeline</h2>
            <Link href={ROUTES.ACADEMIC_CALENDAR}>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                <span>Calendar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No upcoming events scheduled.
              </p>
            ) : (
              upcomingEvents.map((event) => {
                const eventDate = new Date(event.startDate);
                const isExam = event.eventType === "EXAM";
                const isHoliday = event.eventType === "HOLIDAY";
                const isSubmission = event.eventType === "SUBMISSION";

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-xs"
                  >
                    <div className="flex flex-col items-center justify-center h-11 w-11 rounded-lg bg-background border border-border shrink-0 text-center">
                      <span className="text-[10px] font-bold text-primary uppercase">
                        {eventDate.toLocaleString("default", { month: "short" })}
                      </span>
                      <span className="text-sm font-extrabold text-foreground leading-none">
                        {eventDate.getDate()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-foreground truncate">
                          {event.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {event.location || event.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 border"
                        >
                          {event.scope === "college" ? "College" : deptLabel}
                        </Badge>
                        {event.isImportant && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            Important
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Wiki Link */}
          <Link href={ROUTES.ACADEMIC_WIKI} className="block group">
            <div className="rounded-xl border border-border bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-card p-4 transition-all duration-200 hover:border-primary/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" /> Campus Wiki & Policies
                </span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Check CGPA calculation formulas, lab safety rules, and library digital databases.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Upload Dialog ─── */}
      <ResourceUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        subjects={subjects}
        onSuccess={loadData}
      />
    </div>
  );
}
