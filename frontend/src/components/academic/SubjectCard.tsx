"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Award, Users, ChevronRight } from "lucide-react";
import { Subject } from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeptBadge } from "./DeptBadge";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: Subject;
  className?: string;
}

export function SubjectCard({ subject, className }: SubjectCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <div>
        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <DeptBadge departmentIdOrName={subject.departmentId} size="sm" />
            <Badge variant="secondary" className="text-[10px] font-medium">
              Sem {subject.semester}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-medium gap-1 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
              <Award className="h-3 w-3" />
              {subject.credits} Credits
            </Badge>
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground">
            {subject.code}
          </span>
        </div>

        {/* Title */}
        <Link
          href={ROUTES.ACADEMIC_SUBJECT_DETAIL(subject.code)}
          className="group-hover:text-primary transition-colors text-base font-bold text-foreground block mb-2"
        >
          {subject.name}
        </Link>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {subject.description}
        </p>

        {/* Faculty In Charge */}
        {subject.facultyInCharge && subject.facultyInCharge.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-4">
            <Users className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
            <span className="line-clamp-1">
              {subject.facultyInCharge.join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Footer info & links */}
      <div className="border-t border-border/60 pt-3 mt-auto flex items-center justify-between">
        <Link
          href={`${ROUTES.ACADEMIC_RESOURCES}?subjectCode=${subject.code}`}
          className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{subject.totalResourcesCount || 0} Resources</span>
        </Link>

        <Link href={ROUTES.ACADEMIC_SUBJECT_DETAIL(subject.code)}>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2.5 text-primary font-medium">
            <span>Syllabus & Details</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
