"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  FileText,
  BookOpen,
  GraduationCap,
  Users,
  Book,
  Briefcase,
  Building,
  Compass,
  Calendar,
  ShoppingBag,
  HelpCircle,
  MapPin,
  Clock,
  Tag,
  IndianRupee,
} from "lucide-react";
import { SearchResult } from "@/services/search/search.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResultCardProps {
  result: SearchResult;
  className?: string;
}

export function SearchResultCard({ result, className }: SearchResultCardProps) {
  const getIcon = () => {
    switch (result.type) {
      case "COMMUNITY_POST":
        return <MessageSquare className="h-4 w-4 text-violet-500" />;
      case "ACADEMIC_RESOURCE":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "ACADEMIC_SUBJECT":
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
      case "ACADEMIC_FACULTY":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "ACADEMIC_STUDY_GROUP":
        return <Users className="h-4 w-4 text-teal-500" />;
      case "ACADEMIC_WIKI":
        return <Book className="h-4 w-4 text-amber-500" />;
      case "CAREER_PLACEMENT":
        return <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "CAREER_INTERNSHIP":
        return <Building className="h-4 w-4 text-cyan-500" />;
      case "CAMPUS_CLUB":
        return <Compass className="h-4 w-4 text-purple-500" />;
      case "CAMPUS_EVENT":
        return <Calendar className="h-4 w-4 text-rose-500" />;
      case "CAMPUS_MARKETPLACE":
        return <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "CAMPUS_LOST_FOUND":
        return <HelpCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  const meta = result.metadata;

  return (
    <Link
      href={result.href}
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm",
        className
      )}
    >
      <div className="space-y-2">
        {/* Header: Icon + Category + Type Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
              {getIcon()}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {result.category.replace("_", " ")}
            </span>
          </div>

          <Badge
            variant={result.badgeVariant || "outline"}
            className="text-[10px] font-medium"
          >
            {result.badgeLabel}
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {result.title}
          </h3>
          {result.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {result.description}
            </p>
          )}
        </div>
      </div>

      {/* Metadata Row */}
      {meta && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          {meta.authorName && (
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              {meta.authorName === "Anonymous Student" ? (
                <span className="italic text-muted-foreground">Anonymous</span>
              ) : (
                meta.authorName
              )}
            </span>
          )}

          {meta.department && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground/70">
              {meta.department}
            </span>
          )}

          {meta.subjectCode && (
            <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
              {meta.subjectCode}
            </span>
          )}

          {meta.company && (
            <span className="font-semibold text-foreground/80">
              {meta.company}
            </span>
          )}

          {meta.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {meta.location}
            </span>
          )}

          {meta.date && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {meta.date.split("T")[0]}
            </span>
          )}

          {typeof meta.price === "number" && (
            <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
              <IndianRupee className="h-3 w-3" />
              {meta.price}
            </span>
          )}

          {meta.tags && meta.tags.length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <Tag className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground/80 truncate max-w-[120px]">
                {meta.tags.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
