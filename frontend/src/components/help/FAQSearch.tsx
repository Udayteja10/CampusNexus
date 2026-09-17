"use client";

import { HelpCategory } from "@/types/help.types";
import { HELP_CATEGORIES } from "@/services/help/help.seed";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface FAQSearchProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: HelpCategory | "ALL";
  onCategoryChange: (cat: HelpCategory | "ALL") => void;
  totalResults: number;
}

export function FAQSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  totalResults,
}: FAQSearchProps) {
  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search questions, answers, topics or keywords..."
          className="pl-10 pr-10 h-12 rounded-2xl border-border bg-card shadow-sm text-sm focus-visible:ring-primary/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Pills & Result Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
          <Button
            size="xs"
            variant={selectedCategory === "ALL" ? "default" : "outline"}
            onClick={() => onCategoryChange("ALL")}
            className="rounded-xl shrink-0 font-medium"
          >
            All Categories
          </Button>
          {HELP_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="xs"
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => onCategoryChange(cat.id)}
              className="rounded-xl shrink-0 font-medium"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground shrink-0">
          {totalResults} {totalResults === 1 ? "result" : "results"}
        </span>
      </div>
    </div>
  );
}
