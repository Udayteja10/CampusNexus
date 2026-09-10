"use client";

import React from "react";
import { Search, RotateCcw, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResourceFilters as FilterType, ResourceType, Semester, Subject } from "@/types/academic.types";

interface ResourceFiltersBarProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  subjects: Subject[];
  onReset: () => void;
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "NOTE", label: "Lecture Notes" },
  { value: "PYQ", label: "Previous Year Questions" },
  { value: "LAB_MANUAL", label: "Lab Manuals" },
  { value: "CHEATSHEET", label: "Formula & Cheatsheets" },
  { value: "ASSIGNMENT_SOLUTION", label: "Assignment Solutions" },
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "REFERENCE_BOOK", label: "Reference Guides" },
];

export function ResourceFiltersBar({
  filters,
  onChange,
  subjects,
  onReset,
}: ResourceFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
      {/* Top row: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, subject, tags, or author..."
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9 bg-background h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filters.sortBy || "newest"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                sortBy: (val as "newest" | "downloads" | "upvotes" | "title") || "newest",
              })
            }
          >
            <SelectTrigger className="w-[160px] h-9 bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="downloads">Most Downloaded</SelectItem>
              <SelectItem value="upvotes">Most Upvoted</SelectItem>
              <SelectItem value="title">Alphabetical (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-9 px-3 gap-1 text-muted-foreground hover:text-foreground"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Reset</span>
          </Button>
        </div>
      </div>

      {/* Filter Badges Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-border/50 text-xs">
        {/* Semester select */}
        <div className="w-[130px]">
          <Select
            value={filters.semester ? String(filters.semester) : "ALL"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                semester: !val || val === "ALL" ? undefined : (Number(val) as Semester),
              })
            }
          >
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Semesters</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={String(sem)}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resource Type select */}
        <div className="w-[160px]">
          <Select
            value={filters.resourceType || "ALL"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                resourceType: !val || val === "ALL" ? undefined : (val as ResourceType),
              })
            }
          >
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {RESOURCE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject select */}
        <div className="w-[180px]">
          <Select
            value={filters.subjectCode || "ALL"}
            onValueChange={(val) =>
              onChange({
                ...filters,
                subjectCode: !val || val === "ALL" ? undefined : val,
              })
            }
          >
            <SelectTrigger className="h-8 text-xs bg-background truncate">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Verified Only toggle */}
        <div className="flex items-center gap-2 pl-2 sm:ml-auto">
          <Switch
            id="verified-filter"
            checked={Boolean(filters.verifiedOnly)}
            onCheckedChange={(checked) =>
              onChange({ ...filters, verifiedOnly: checked || undefined })
            }
          />
          <Label
            htmlFor="verified-filter"
            className="text-xs font-medium cursor-pointer flex items-center gap-1 text-muted-foreground select-none"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Verified only
          </Label>
        </div>
      </div>
    </div>
  );
}
