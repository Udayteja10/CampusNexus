"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Share2,
  CheckCircle2,
} from "lucide-react";
import type { CampusWikiPage } from "@/types/campusLife.types";
import { wikiApi } from "@/lib/campusLifeApi";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface WikiArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default function WikiArticleDetailPage({ params }: WikiArticlePageProps) {
  const { slug } = use(params);
  const router = useRouter();

  const [article, setArticle] = useState<CampusWikiPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      try {
        const data = await wikiApi.getPageBySlug(slug);
        setArticle(data);
      } catch (err: any) {
        console.error("Failed to load article:", err);
        toast.error(err.response?.data?.message || "Wiki article not found");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-2xl font-bold text-foreground">Article Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The requested wiki page does not exist or may not be published yet.
        </p>
        <Link
          href="/campus-life/wiki"
          className={`mt-4 inline-flex items-center ${buttonVariants({ variant: "default" })}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Wiki
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/campus-life/wiki"
          className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Wiki Knowledge Base
        </Link>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
      </div>

      {/* Article Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold">
            {article.category.replace("_", " ")}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Verified Knowledge
          </Badge>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight">
          {article.title}
        </h1>

        <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>
                By <strong>{article.authorName || "Campus Contributor"}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Published {new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{article.viewsCount} Views</span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <Card className="border-border/60">
        <CardContent className="p-6 md:p-8">
          <div className="prose dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed text-base space-y-4 font-sans">
            {article.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
