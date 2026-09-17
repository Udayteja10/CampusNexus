"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FAQ, HelpCategory } from "@/types/help.types";
import { helpService } from "@/services/help";
import { HelpCategoryGrid } from "@/components/help/HelpCategoryGrid";
import { FAQAccordion } from "@/components/help/FAQAccordion";
import { FAQSearch } from "@/components/help/FAQSearch";
import { ROUTES } from "@/lib/constants";
import {
  FileQuestion,
  Send,
  Inbox,
  ArrowRight,
  Shield,
  LifeBuoy,
} from "lucide-react";

export default function HelpCenterPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | "ALL">("ALL");

  useEffect(() => {
    let isMounted = true;
    helpService.getFAQs({ search: searchQuery, category: selectedCategory }).then((data) => {
      if (isMounted) setFaqs(data);
    });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory]);

  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== "ALL";

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm overflow-hidden text-center space-y-4">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--cn-indigo)]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LifeBuoy className="h-7 w-7" />
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            CampusNexus Help & Support
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Find answers to common questions, explore platform guides, or submit a private support request to campus coordinators.
          </p>
        </div>

        {/* Prominent FAQ Search Box */}
        <div className="max-w-xl mx-auto pt-2">
          <FAQSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            totalResults={faqs.length}
          />
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={ROUTES.HELP_FAQ}
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all group flex items-start gap-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <FileQuestion className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1 font-bold text-sm text-foreground group-hover:text-primary transition-colors">
              <span>Browse All FAQs</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-xs text-muted-foreground">
              Explore frequently asked questions across all categories.
            </p>
          </div>
        </Link>

        <Link
          href={ROUTES.HELP_CONTACT}
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all group flex items-start gap-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Send className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1 font-bold text-sm text-foreground group-hover:text-emerald-600 transition-colors">
              <span>Contact Support</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-xs text-muted-foreground">
              Submit a support ticket regarding technical or academic issues.
            </p>
          </div>
        </Link>

        <Link
          href={ROUTES.HELP_REQUESTS}
          className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all group flex items-start gap-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Inbox className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1 font-bold text-sm text-foreground group-hover:text-amber-600 transition-colors">
              <span>My Support Requests</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-xs text-muted-foreground">
              Track the status and resolution timeline of your submitted tickets.
            </p>
          </div>
        </Link>
      </div>

      {/* Main Content Area */}
      {isFiltering ? (
        /* Filtered FAQ Results View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Matching FAQs</h2>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
          <FAQAccordion faqs={faqs} />
        </div>
      ) : (
        /* Default Landing View */
        <div className="space-y-10">
          {/* Categories Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Browse Help Topics</h2>
                <p className="text-xs text-muted-foreground">
                  Select a topic to view related FAQs and guidance.
                </p>
              </div>
            </div>
            <HelpCategoryGrid />
          </div>

          {/* Featured Frequently Asked Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
                <p className="text-xs text-muted-foreground">
                  Common questions regarding accounts, privacy, and platform modules.
                </p>
              </div>
              <Link
                href={ROUTES.HELP_FAQ}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View all ({faqs.length})
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <FAQAccordion faqs={faqs.slice(0, 6)} />
          </div>
        </div>
      )}

      {/* Safety & Policy Note */}
      <div className="rounded-2xl border border-border bg-card/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-foreground">Anonymous-First Privacy</h3>
            <p className="text-[11px] text-muted-foreground">
              Your support tickets and account queries remain private and are handled securely by campus coordinators.
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.PRIVACY}
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Read Privacy Policy →
        </Link>
      </div>
    </div>
  );
}
