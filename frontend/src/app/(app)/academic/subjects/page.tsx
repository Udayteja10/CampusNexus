"use client";

import React, { useEffect, useState } from "react";
import { Search, FileText, Award, BookOpen } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService } from "@/services/academic";
import { Subject, Semester } from "@/types/academic.types";
import { getDepartmentLabel, getDepartmentId } from "@/lib/departments";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { SubjectCard } from "@/components/academic/SubjectCard";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";

export default function AcademicSubjectsPage() {
  const user = useAuthStore((s) => s.user);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSem, setSelectedSem] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const deptLabel = getDepartmentLabel(user?.department);
  const deptId = getDepartmentId(user?.department) || "cse";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    academicService
      .getSubjects()
      .then((data) => {
        if (mounted) setSubjects(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.department]);

  const filteredSubjects = subjects.filter((s) => {
    if (selectedSem !== "ALL" && s.semester !== Number(selectedSem)) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCredits = filteredSubjects.reduce((sum, s) => sum + s.credits, 0);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DeptBadge departmentIdOrName={deptId} size="md" />
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Curriculum & Subjects Directory
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Explore academic courses, credits, syllabus unit breakdowns, and linked study materials for {deptLabel}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl border border-border/60">
          <Award className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            <strong className="text-foreground">{filteredSubjects.length}</strong> Courses (
            <strong className="text-foreground">{totalCredits}</strong> Credits)
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title, subject code (e.g. CS501PC)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        {/* Semester pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSem("ALL")}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedSem === "ALL"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            All Semesters
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSem(String(sem))}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                selectedSem === String(sem)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              Sem {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <AcademicEmptyState
          icon={FileText}
          title="No subjects found"
          description="Try selecting a different semester or clearing your search keywords."
          actionLabel="Reset Search"
          onAction={() => {
            setSearch("");
            setSelectedSem("ALL");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => (
            <SubjectCard key={subject.code} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
