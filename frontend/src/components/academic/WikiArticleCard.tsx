"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye,
  ThumbsUp,
  Tag,
  ChevronRight,
} from "lucide-react";
import { WikiArticle, WikiCategory } from "@/types/academic.types";
import { academicService } from "@/services/academic";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface WikiArticleCardProps {
  article: WikiArticle;
  onUpdate?: () => void;
  className?: string;
}

const CATEGORY_CONFIG: Record<WikiCategory, { label: string; color: string }> = {
  ACADEMIC_POLICIES: {
    label: "Academic Policies",
    color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  },
  CAMPUS_GUIDE: {
    label: "Campus Guide",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  EXAM_RULES: {
    label: "Exam Rules & Regulations",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
  LAB_PROTOCOLS: {
    label: "Lab Safety & Protocols",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  FAQ: {
    label: "Frequently Asked Questions",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  GENERAL: {
    label: "General Guidelines",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
};

export function WikiArticleCard({ article, onUpdate, className }: WikiArticleCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(article.helpfulCount);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVoteHelpful = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVoted) return;
    try {
      const count = await academicService.voteWikiHelpful(article.id);
      setHelpfulCount(count);
      setHasVoted(true);
      toast.success("Thank you for your feedback!");
      onUpdate?.();
    } catch (err) {
      console.error(err);
    }
  };

  const catConfig = CATEGORY_CONFIG[article.category] || {
    label: article.category,
    color: "bg-muted text-muted-foreground",
  };

  // Strip markdown formatting for preview
  const plainSnippet = article.content
    .replace(/[#*`_~[\]]/g, "")
    .replace(/\\/g, "")
    .trim();

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <div>
        {/* Category badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="outline" className={cn("text-[10px] font-medium border", catConfig.color)}>
            {catConfig.label}
          </Badge>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewsCount}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link
          href={`${ROUTES.ACADEMIC_WIKI}/${article.slug}`}
          className="group-hover:text-primary transition-colors text-base font-bold text-foreground block mb-2 leading-snug"
        >
          {article.title}
        </Link>

        {/* Snippet */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
          {plainSnippet}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {article.tags.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
              >
                <Tag className="h-2.5 w-2.5" />
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer info & helpful vote */}
      <div className="border-t border-border/60 pt-3 mt-auto flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground truncate">
          By <span className="font-medium text-foreground">{article.authorName}</span>
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            onClick={handleVoteHelpful}
            disabled={hasVoted}
            className={cn("h-7 text-xs gap-1 px-2.5", hasVoted && "bg-emerald-600 text-white")}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>Helpful ({helpfulCount})</span>
          </Button>

          <Link href={`${ROUTES.ACADEMIC_WIKI}/${article.slug}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
