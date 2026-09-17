"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FAQ } from "@/types/help.types";
import { helpService } from "@/services/help";
import { HELP_CATEGORIES } from "@/services/help/help.seed";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  HelpCircle,
  Share2,
  Calendar,
  Tag,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

interface FAQDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function FAQDetailPage({ params }: FAQDetailPageProps) {
  const { slug } = use(params);

  const [faq, setFaq] = useState<FAQ | null>(null);
  const [related, setRelated] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    helpService
      .getFAQBySlug(slug)
      .then(async (found) => {
        if (!isMounted) return;
        setFaq(found);
        if (found) {
          const rel = await helpService.getRelatedFAQs(found, 3);
          if (isMounted) setRelated(rel);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setFaq(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="container mx-auto max-w-2xl py-16 px-4 text-center">
        <div className="rounded-3xl border border-border bg-card p-10 space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">FAQ Article Not Found</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The FAQ article you are looking for does not exist or may have been moved.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              render={
                <Link href={ROUTES.HELP_FAQ}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to FAQs
                </Link>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const categoryMeta = HELP_CATEGORIES.find((c) => c.id === faq.category);

  let formattedDate = "";
  try {
    formattedDate = format(new Date(faq.updatedAt), "MMMM d, yyyy");
  } catch {
    formattedDate = "Recently";
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={ROUTES.HELP_FAQ}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all FAQs
        </Link>

        <Button
          variant="outline"
          size="xs"
          onClick={handleShare}
          className="gap-1.5 rounded-xl text-xs font-medium"
        >
          <Share2 className="h-3.5 w-3.5" />
          {copied ? "Link Copied!" : "Share Article"}
        </Button>
      </div>

      {/* Main FAQ Article Card */}
      <article className="rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 uppercase">
              {categoryMeta?.label || faq.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Updated {formattedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-snug">
            {faq.question}
          </h1>
        </div>

        <div className="pt-4 border-t border-border/60 text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
          {faq.answer}
        </div>

        {/* Keywords Tags */}
        {faq.keywords && faq.keywords.length > 0 && (
          <div className="pt-6 border-t border-border/40 flex flex-wrap items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {faq.keywords.map((kw) => (
              <Link
                key={kw}
                href={`${ROUTES.HELP_FAQ}?search=${encodeURIComponent(kw)}`}
                className="text-xs font-medium text-muted-foreground bg-muted/60 hover:bg-muted hover:text-foreground px-2.5 py-1 rounded-lg transition-colors"
              >
                #{kw}
              </Link>
            ))}
          </div>
        )}
      </article>

      {/* Related Questions */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Related Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={ROUTES.HELP_FAQ_DETAIL(rel.slug)}
                className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-2 group"
              >
                <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {rel.question}
                </h3>
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  Read answer
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Still need help CTA */}
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">Still need help with this?</h3>
          <p className="text-xs text-muted-foreground">
            Our campus coordinators can provide personalized guidance for your account or academic needs.
          </p>
        </div>

        <Button
          className="rounded-xl font-semibold shrink-0"
          render={
            <Link href={ROUTES.HELP_CONTACT}>
              Submit a Request
            </Link>
          }
        />
      </div>
    </div>
  );
}
