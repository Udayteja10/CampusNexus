"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  ThumbsUp,
  Share2,
  Calendar,
  User,
  Tag,
  Star,
  CheckCircle2,
} from "lucide-react";
import { academicService } from "@/services/academic";
import { WikiArticle, WikiCategory } from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

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

export default function WikiArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    academicService
      .getWikiArticleBySlug(slug)
      .then((data) => {
        if (data) {
          setArticle(data);
          setHelpfulCount(data.helpfulCount);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleVoteHelpful = async () => {
    if (!article || hasVoted) return;
    try {
      const count = await academicService.voteWikiHelpful(article.id);
      setHelpfulCount(count);
      setHasVoted(true);
      toast.success("Thank you for your feedback!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-foreground">Article Not Found</h1>
        <p className="text-sm text-muted-foreground">
          The requested wiki article does not exist or has been moved.
        </p>
        <Link href={ROUTES.ACADEMIC_WIKI}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Campus Wiki</span>
          </Button>
        </Link>
      </div>
    );
  }

  const catConfig = CATEGORY_CONFIG[article.category] || {
    label: article.category,
    color: "bg-muted text-muted-foreground",
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back link */}
      <Link
        href={ROUTES.ACADEMIC_WIKI}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Campus Wiki</span>
      </Link>

      {/* Article Container */}
      <article className="rounded-2xl border border-border bg-card p-6 sm:p-10 space-y-8 shadow-xs">
        {/* Header Badges & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium border", catConfig.color)}
          >
            {catConfig.label}
          </Badge>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.viewsCount} Views
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-7 text-xs gap-1 px-2.5"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug mb-3">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <User className="h-3.5 w-3.5 text-primary" />
              {article.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Published on {new Date(article.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-md font-medium"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-foreground space-y-4 whitespace-pre-wrap font-sans">
          {article.content}
        </div>

        {/* Helpful Feedback Box */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5 text-xs">
            <span className="font-semibold text-foreground">Was this article helpful?</span>
            <p className="text-muted-foreground text-[11px]">
              {helpfulCount} students found this handbook guide useful.
            </p>
          </div>

          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            onClick={handleVoteHelpful}
            disabled={hasVoted}
            className={cn("gap-1.5 text-xs", hasVoted && "bg-emerald-600 text-white")}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{hasVoted ? "Marked as Helpful" : "Yes, Helpful"}</span>
          </Button>
        </div>
      </article>
    </div>
  );
}
