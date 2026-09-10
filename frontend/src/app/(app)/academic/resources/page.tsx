"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Plus,
  Bookmark,
  Sparkles,
  Layers,
  FileCheck2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService } from "@/services/academic";
import {
  AcademicResource,
  ResourceFilters,
  Subject,
} from "@/types/academic.types";
import { getDepartmentLabel, getDepartmentId } from "@/lib/departments";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { ResourceCard } from "@/components/academic/ResourceCard";
import { ResourceFiltersBar } from "@/components/academic/ResourceFilters";
import { ResourceUploadDialog } from "@/components/academic/ResourceUploadDialog";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";

export default function AcademicResourcesPage() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<"all" | "bookmarks">("all");
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<AcademicResource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const initialSubject = searchParams.get("subjectCode") || undefined;
  const initialVerified = searchParams.get("verifiedOnly") === "true";

  const [filters, setFilters] = useState<ResourceFilters>({
    subjectCode: initialSubject,
    verifiedOnly: initialVerified ? true : undefined,
    sortBy: "newest",
  });

  const deptLabel = getDepartmentLabel(user?.department);
  const deptId = getDepartmentId(user?.department) || "cse";

  const loadResources = async () => {
    setLoading(true);
    try {
      const [resList, bList, sList] = await Promise.all([
        academicService.getResources(filters),
        academicService.getBookmarkedResources(),
        academicService.getSubjects(),
      ]);
      setResources(resList);
      setBookmarkedResources(bList);
      setSubjects(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [filters, user?.department]);

  const handleResetFilters = () => {
    setFilters({
      sortBy: "newest",
    });
  };

  const currentList = activeTab === "all" ? resources : bookmarkedResources;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DeptBadge departmentIdOrName={deptId} size="md" />
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Resources & PYQ Repository
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Curated lecture notes, solved previous year question papers, lab manuals, and cheatsheets for {deptLabel}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setUploadOpen(true)} className="gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Upload Material</span>
          </Button>
        </div>
      </div>

      {/* Tabs: All vs Bookmarks */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-muted/60">
              <TabsTrigger value="all" className="gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                <span>All Materials ({resources.length})</span>
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="gap-1.5 text-xs">
                <Bookmark className="h-3.5 w-3.5" />
                <span>My Bookmarks ({bookmarkedResources.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Filter Controls (only shown on 'all' tab) */}
      {activeTab === "all" && (
        <ResourceFiltersBar
          filters={filters}
          onChange={setFilters}
          subjects={subjects}
          onReset={handleResetFilters}
        />
      )}

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <AcademicEmptyState
          icon={activeTab === "bookmarks" ? Bookmark : BookOpen}
          title={
            activeTab === "bookmarks"
              ? "No bookmarked resources yet"
              : "No resources found matching filters"
          }
          description={
            activeTab === "bookmarks"
              ? "Bookmark useful lecture notes and PYQs to quickly access them before exams."
              : "Try adjusting your search criteria or be the first to upload lecture notes for this course!"
          }
          actionLabel={activeTab === "bookmarks" ? undefined : "Upload Material"}
          onAction={activeTab === "bookmarks" ? undefined : () => setUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map((res) => (
            <ResourceCard key={res.id} resource={res} onUpdate={loadResources} />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <ResourceUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        subjects={subjects}
        onSuccess={loadResources}
      />
    </div>
  );
}
