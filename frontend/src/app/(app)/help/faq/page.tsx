"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { FAQ, HelpCategory } from "@/types/help.types";
import { helpService } from "@/services/help";
import { FAQAccordion } from "@/components/help/FAQAccordion";
import { FAQSearch } from "@/components/help/FAQSearch";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, FileQuestion } from "lucide-react";

interface FAQPageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default function FAQBrowsePage({ searchParams }: FAQPageProps) {
  const resolvedParams = use(searchParams);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState(resolvedParams.search || "");
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | "ALL">(
    (resolvedParams.category as HelpCategory) || "ALL"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    helpService
      .getFAQs({ search: searchQuery, category: selectedCategory })
      .then((data) => {
        if (isMounted) {
          setFaqs(data);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory]);

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-3">
        <Link
          href={ROUTES.HELP}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Help Center
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <FileQuestion className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Search and browse solutions for common queries regarding CampusNexus features.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <FAQSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        totalResults={faqs.length}
      />

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <FAQAccordion faqs={faqs} />
        )}
      </div>
    </div>
  );
}
