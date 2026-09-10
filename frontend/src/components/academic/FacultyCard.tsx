"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Mail,
  Sparkles,
  ChevronRight,
  MessageSquarePlus,
} from "lucide-react";
import { Faculty } from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeptBadge } from "./DeptBadge";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

interface FacultyCardProps {
  faculty: Faculty;
  onReviewClick?: (faculty: Faculty) => void;
  className?: string;
}

export function FacultyCard({ faculty, onReviewClick, className }: FacultyCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <DeptBadge departmentIdOrName={faculty.departmentId} size="sm" />
            {faculty.isAcceptingStudents && (
              <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-2.5 w-2.5" /> Mentoring Projects
              </Badge>
            )}
          </div>
          <StarRating rating={faculty.rating} reviewCount={faculty.reviewCount} showScore size="sm" />
        </div>

        {/* Name & Designation */}
        <Link
          href={ROUTES.ACADEMIC_FACULTY_DETAIL(faculty.id)}
          className="group-hover:text-primary transition-colors text-base font-bold text-foreground block mb-0.5"
        >
          {faculty.name}
        </Link>
        <p className="text-xs font-medium text-muted-foreground mb-3">
          {faculty.designation}
        </p>

        {/* Cabin location & Office hours */}
        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{faculty.cabinLocation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{faculty.officeHours}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <a
              href={`mailto:${faculty.email}`}
              className="truncate hover:underline text-foreground"
            >
              {faculty.email}
            </a>
          </div>
        </div>

        {/* Specializations */}
        {faculty.specialization && faculty.specialization.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Specialization
            </span>
            <div className="flex flex-wrap gap-1">
              {faculty.specialization.map((spec, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-muted/80 text-foreground px-2 py-0.5 rounded-md font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Handled */}
        {faculty.subjectsHandled && faculty.subjectsHandled.length > 0 && (
          <div className="mb-4 text-xs text-muted-foreground">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Courses
            </span>
            <p className="line-clamp-1">
              {faculty.subjectsHandled.join(" • ")}
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-border/60 pt-3 mt-auto flex items-center justify-between gap-2">
        {onReviewClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReviewClick(faculty)}
            className="h-8 text-xs gap-1.5"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>Write Review</span>
          </Button>
        )}

        <Link href={ROUTES.ACADEMIC_FACULTY_DETAIL(faculty.id)} className="ml-auto">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary">
            <span>Full Profile & Reviews</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
