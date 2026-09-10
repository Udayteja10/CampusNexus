"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  ThumbsUp,
  Bookmark,
  CheckCircle2,
  MessageSquare,
  History,
  Tag,
  Share2,
} from "lucide-react";
import { AcademicResource, ResourceType } from "@/types/academic.types";
import { academicService } from "@/services/academic";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeptBadge } from "./DeptBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: AcademicResource;
  onUpdate?: () => void;
  className?: string;
}

const RESOURCE_TYPE_LABELS: Record<ResourceType, { label: string; color: string }> = {
  NOTE: { label: "Lecture Notes", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  PYQ: { label: "PYQ / Exam Paper", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  SYLLABUS: { label: "Syllabus", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  LAB_MANUAL: { label: "Lab Manual", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  ASSIGNMENT_SOLUTION: { label: "Assignment Solution", color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800" },
  REFERENCE_BOOK: { label: "Reference Guide", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
  CHEATSHEET: { label: "Cheatsheet", color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800" },
};

export function ResourceCard({ resource, onUpdate, className }: ResourceCardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState(resource.upvotesCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [downloadsCount, setDownloadsCount] = useState(resource.downloadsCount);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    academicService.hasUpvoted(resource.id).then((v) => mounted && setUpvoted(v));
    academicService.isBookmarked(resource.id).then((b) => mounted && setBookmarked(b));
    return () => {
      mounted = false;
    };
  }, [resource.id]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpvoting) return;
    setIsUpvoting(true);
    try {
      const res = await academicService.toggleUpvote(resource.id);
      setUpvoted(res.upvoted);
      setUpvotesCount(res.count);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upvote");
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      const res = await academicService.toggleBookmark(resource.id);
      setBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to bookmark");
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newCount = await academicService.recordDownload(resource.id);
      setDownloadsCount(newCount);
      toast.success(`Downloading ${resource.title}`);
      // Simulate file download
      const link = document.createElement("a");
      link.href = "#";
      link.download = `${resource.title}.${resource.fileType}`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${ROUTES.ACADEMIC_RESOURCE_DETAIL(resource.id)}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Resource link copied to clipboard!");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const typeConfig = RESOURCE_TYPE_LABELS[resource.resourceType] || {
    label: resource.resourceType,
    color: "bg-muted text-muted-foreground",
  };

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
          <div className="flex flex-wrap items-center gap-1.5">
            <DeptBadge departmentIdOrName={resource.departmentId} size="sm" />
            <Badge variant="outline" className={cn("text-[10px] font-medium border", typeConfig.color)}>
              {typeConfig.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-medium">
              Sem {resource.semester}
            </Badge>
            {resource.versions && resource.versions.length > 1 && (
              <Badge variant="outline" className="text-[10px] font-mono gap-1">
                <History className="h-2.5 w-2.5" /> v{resource.versions.length}
              </Badge>
            )}
          </div>

          {resource.isVerifiedByCoordinator && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </div>
                }
              />
              <TooltipContent side="top">
                Verified by {resource.verifiedByName || "Department Coordinator"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Subject code & Name */}
        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          {resource.subjectCode} • {resource.subjectName}
        </div>

        {/* Title */}
        <Link
          href={ROUTES.ACADEMIC_RESOURCE_DETAIL(resource.id)}
          className="group-hover:text-primary transition-colors line-clamp-2 text-base font-semibold text-foreground mb-2"
        >
          {resource.title}
        </Link>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {resource.description}
          </p>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="border-t border-border/60 pt-3 mt-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="truncate max-w-[150px]">
            By <span className="font-medium text-foreground">{resource.uploaderName}</span>
          </span>
          <span className="shrink-0 font-mono text-[11px]">
            {resource.fileType.toUpperCase()} • {formatFileSize(resource.fileSize)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Button
              variant={upvoted ? "default" : "outline"}
              size="sm"
              onClick={handleUpvote}
              className={cn("h-8 text-xs gap-1.5 px-2.5", upvoted && "bg-primary text-primary-foreground")}
            >
              <ThumbsUp className={cn("h-3.5 w-3.5", upvoted && "fill-current")} />
              <span>{upvotesCount}</span>
            </Button>

            <Link href={ROUTES.ACADEMIC_RESOURCE_DETAIL(resource.id)}>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{resource.commentsCount}</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={cn("h-8 w-8 text-muted-foreground", bookmarked && "text-primary")}
            >
              <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 text-muted-foreground"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs gap-1.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloadsCount}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
