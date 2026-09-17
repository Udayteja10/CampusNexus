"use client";

import React, { useState, useEffect, useTransition, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search as SearchIcon,
  X,
  Clock,
  Sparkles,
  BookOpen,
  MessageSquare,
  Briefcase,
  Compass,
  ArrowRight,
} from "lucide-react";
import { mockSearchService } from "@/services/search/mock-search.service";
import {
  SearchCategory,
  SearchGroupedResults,
} from "@/services/search/search.types";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { key: SearchCategory; label: string; icon: React.ReactNode }[] = [
  { key: "ALL", label: "All Content", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: "ACADEMIC", label: "Academic", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "COMMUNITY", label: "Community", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { key: "CAREER", label: "Career", icon: <Briefcase className="h-3.5 w-3.5" /> },
  { key: "CAMPUS_LIFE", label: "Campus Life", icon: <Compass className="h-3.5 w-3.5" /> },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("ALL");
  const [data, setData] = useState<SearchGroupedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return mockSearchService.getRecentSearches();
  });
  const [, startTransition] = useTransition();

  const performSearch = useCallback(
    async (q: string, cat: SearchCategory) => {
      const clean = q.trim();
      if (!clean) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await mockSearchService.search({
          query: clean,
          category: cat,
        });
        setData(res);
        setRecentSearches(mockSearchService.getRecentSearches());
      } catch (err) {
        console.error("Search execution failed:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sync search when urlQuery or category changes
  useEffect(() => {
    if (urlQuery.trim()) {
      let isMounted = true;
      mockSearchService.search({ query: urlQuery.trim(), category: activeCategory }).then((res) => {
        if (!isMounted) return;
        setData(res);
        setRecentSearches(mockSearchService.getRecentSearches());
      });
      return () => {
        isMounted = false;
      };
    }
  }, [urlQuery, activeCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    // Live debounced search
    const timer = setTimeout(() => {
      if (val.trim()) {
        startTransition(() => {
          router.replace(`/search?q=${encodeURIComponent(val.trim())}`);
        });
      } else {
        startTransition(() => {
          router.replace(`/search`);
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (clean) {
      router.push(`/search?q=${encodeURIComponent(clean)}`);
      performSearch(clean, activeCategory);
    }
  };

  const handleClear = () => {
    setQuery("");
    setData(null);
    router.replace("/search");
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleRemoveRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    mockSearchService.removeRecentSearch(term);
    setRecentSearches(mockSearchService.getRecentSearches());
  };

  const handleClearRecent = () => {
    mockSearchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const totalResults = data?.totalCount ?? 0;

  return (
    <div className="container mx-auto max-w-4xl py-6 sm:py-10 px-4 space-y-6">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Global Search
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Search courses, resources, faculty, community discussions, career openings, clubs, and campus events.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <SearchIcon className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources, subjects, faculty, posts, clubs, events..."
            value={query}
            onChange={handleInputChange}
            className="h-12 pl-12 pr-10 text-sm sm:text-base rounded-2xl bg-card border-border/80 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count = data?.categoryCounts?.[cat.key];
            const isSelected = activeCategory === cat.key;
            return (
              <Button
                key={cat.key}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.key)}
                className={`h-8 rounded-full text-xs font-semibold px-3 shrink-0 transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border-border/70 hover:bg-muted/60"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {cat.icon}
                  {cat.label}
                  {typeof count === "number" && query.trim() && (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Results / Empty / Recent Search Sections */}
      {loading ? (
        <div className="space-y-3 pt-2">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : !query.trim() ? (
        /* Empty / Initial State */
        <div className="space-y-6 pt-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Recent Searches
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearRecent}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear all
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => handleSelectRecent(term)}
                    className="group flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-muted/40 cursor-pointer transition-all"
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecent(term, e)}
                      className="rounded p-0.5 text-muted-foreground opacity-60 hover:opacity-100 hover:text-destructive"
                      aria-label={`Remove ${term}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Discover Tips */}
          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Popular Content to Search
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                onClick={() => handleSelectRecent("Data Structures")}
                className="p-3 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 cursor-pointer transition-all space-y-1"
              >
                <strong className="text-foreground flex items-center justify-between">
                  Academic: Data Structures & Algorithms
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </strong>
                <p className="text-muted-foreground text-[11px]">
                  Subjects, faculty notes, previous year question papers.
                </p>
              </div>

              <div
                onClick={() => handleSelectRecent("Hackathon")}
                className="p-3 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 cursor-pointer transition-all space-y-1"
              >
                <strong className="text-foreground flex items-center justify-between">
                  Campus Life: Hackathons & Clubs
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </strong>
                <p className="text-muted-foreground text-[11px]">
                  CSI HackNexus, Apex Robowars, CAME festivals, and club schedules.
                </p>
              </div>

              <div
                onClick={() => handleSelectRecent("Software Engineer")}
                className="p-3 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 cursor-pointer transition-all space-y-1"
              >
                <strong className="text-foreground flex items-center justify-between">
                  Career: Placements & Internships
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </strong>
                <p className="text-muted-foreground text-[11px]">
                  Software engineering openings, campus drives, and summer internships.
                </p>
              </div>

              <div
                onClick={() => handleSelectRecent("Hostel")}
                className="p-3 rounded-xl border border-border/50 bg-background/60 hover:border-primary/40 cursor-pointer transition-all space-y-1"
              >
                <strong className="text-foreground flex items-center justify-between">
                  Campus Life: Facilities & Guidelines
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </strong>
                <p className="text-muted-foreground text-[11px]">
                  Hostel blocks, transport routes, and central library schedules.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : totalResults === 0 ? (
        /* No Results State */
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            <SearchIcon className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            No results found for &ldquo;{query}&rdquo;
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Try checking for spelling errors, using fewer keywords, or switching to the &ldquo;All Content&rdquo; category tab.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs"
            >
              Clear search query
            </Button>
          </div>
        </div>
      ) : (
        /* Results List */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-2">
            <span>
              Found <strong className="text-foreground">{totalResults}</strong> result
              {totalResults === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </span>
            {activeCategory !== "ALL" && (
              <span className="font-semibold text-primary">
                Filtering by {activeCategory.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {data?.results.map((item) => (
              <SearchResultCard key={item.id} result={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl py-10 px-4 space-y-4">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
