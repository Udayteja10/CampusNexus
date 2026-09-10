"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Users,
  Plus,
  FileText,
  Layers,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService, AcademicAccessError } from "@/services/academic";
import { Subject, AcademicResource } from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { ResourceCard } from "@/components/academic/ResourceCard";
import { ResourceUploadDialog } from "@/components/academic/ResourceUploadDialog";

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectCode = params?.id as string;
  const user = useAuthStore((s) => s.user);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadSubjectData = async () => {
    if (!subjectCode) return;
    setLoading(true);
    setAccessError(null);
    try {
      const s = await academicService.getSubjectByCode(subjectCode);
      if (!s) {
        setAccessError("Subject not found in your department curriculum.");
        return;
      }
      setSubject(s);
      const resList = await academicService.getResources({ subjectCode: s.code });
      setResources(resList);
    } catch (err: any) {
      if (err instanceof AcademicAccessError) {
        setAccessError(err.message);
      } else {
        setAccessError(err.message || "Failed to load subject details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjectData();
  }, [subjectCode, user?.department]);

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (accessError || !subject) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {accessError || "Subject not found."}
        </p>
        <div className="pt-2">
          <Link href={ROUTES.ACADEMIC_SUBJECTS}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Department Subjects</span>
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
        href={ROUTES.ACADEMIC_SUBJECTS}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Subjects Directory</span>
      </Link>

      {/* Subject Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DeptBadge departmentIdOrName={subject.departmentId} size="md" />
            <Badge variant="secondary" className="text-xs">
              Semester {subject.semester}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium gap-1 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700">
              <Award className="h-3.5 w-3.5" />
              {subject.credits} Credits
            </Badge>
          </div>
          <span className="font-mono text-sm font-bold text-primary">
            {subject.code}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2">
            {subject.name}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subject.description}
          </p>
        </div>

        {/* Faculty In Charge */}
        {subject.facultyInCharge && subject.facultyInCharge.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/50">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>Instructors & Course Leads:</strong> {subject.facultyInCharge.join(", ")}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Upload Notes for {subject.code}</span>
          </Button>
          <Link href={`${ROUTES.ACADEMIC_STUDY_GROUPS}?subjectCode=${subject.code}`}>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              <span>Find Study Groups</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Syllabus Unit Summary */}
      {subject.syllabusSummary && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Syllabus Breakdown</h2>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/60">
            {subject.syllabusSummary.split(". ").map((unit, idx) => (
              <p key={idx} className="font-medium text-foreground">
                • {unit}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Linked Resources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Course Resources ({resources.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Lecture notes, question papers, and solutions for {subject.code}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Material</span>
          </Button>
        </div>

        {resources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No study materials uploaded for this subject yet. Upload the first set of notes!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <ResourceCard key={res.id} resource={res} onUpdate={loadSubjectData} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <ResourceUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        subjects={[subject]}
        onSuccess={loadSubjectData}
      />
    </div>
  );
}
