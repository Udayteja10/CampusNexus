"use client";

import React, { useEffect, useState } from "react";
import { Search, Building2, Star, Sparkles, Filter } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService } from "@/services/academic";
import { Faculty } from "@/types/academic.types";
import { getDepartmentLabel, getDepartmentId } from "@/lib/departments";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { FacultyCard } from "@/components/academic/FacultyCard";
import { FacultyReviewDialog } from "@/components/academic/FacultyReviewDialog";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";

export default function AcademicFacultyPage() {
  const user = useAuthStore((s) => s.user);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [reviewFaculty, setReviewFaculty] = useState<Faculty | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const deptLabel = getDepartmentLabel(user?.department);
  const deptId = getDepartmentId(user?.department) || "cse";

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const list = await academicService.getFacultyList({
        search: search.trim() || undefined,
        minRating: minRating !== "ALL" ? Number(minRating) : undefined,
      });
      setFacultyList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, [search, minRating, user?.department]);

  const handleOpenReview = (faculty: Faculty) => {
    setReviewFaculty(faculty);
    setReviewDialogOpen(true);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DeptBadge departmentIdOrName={deptId} size="md" />
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Faculty Directory & Cabins
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Locate department professors, view office hours, research specializations, and submit anonymous student feedback for {deptLabel}.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by professor name, cabin location, course, or research domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        <div className="w-[180px]">
          <Select value={minRating} onValueChange={(val) => setMinRating(val || "ALL")}>
            <SelectTrigger className="h-9 text-xs bg-card">
              <SelectValue placeholder="Rating Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ratings</SelectItem>
              <SelectItem value="4.5">★ 4.5 & Above</SelectItem>
              <SelectItem value="4.0">★ 4.0 & Above</SelectItem>
              <SelectItem value="3.5">★ 3.5 & Above</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Faculty Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : facultyList.length === 0 ? (
        <AcademicEmptyState
          icon={Building2}
          title="No faculty members found"
          description="Try broadening your search keywords or resetting rating filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setMinRating("ALL");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {facultyList.map((faculty) => (
            <FacultyCard
              key={faculty.id}
              faculty={faculty}
              onReviewClick={handleOpenReview}
            />
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <FacultyReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        faculty={reviewFaculty}
        onSuccess={loadFaculty}
      />
    </div>
  );
}
