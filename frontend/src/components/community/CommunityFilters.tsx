"use client";

import { Search } from "lucide-react";
import { useCommunityStore } from "@/store/community.store";
import { CATEGORY_MAP } from "./CategoryBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CommunityCategory } from "@/types/post.types";

export function CommunityFilters() {
  const store = useCommunityStore();
  const activeCategory = store.filters.category;
  const sort = store.filters.sort;

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search discussions or authors..."
            value={store.filters.search}
            onChange={(e) => store.setSearch(e.target.value)}
            className="pl-9 h-9.5 text-sm bg-muted/20 border-border/60 focus-visible:bg-background rounded-lg"
          />
        </div>

        {/* Sort Select */}
        <div className="w-[180px] self-end sm:self-auto">
          <Select
            value={sort}
            onValueChange={(val) => store.setSort(val as "latest" | "discussed")}
          >
            <SelectTrigger className="h-9.5 text-xs font-semibold">
              <span className="text-muted-foreground mr-1">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest" className="text-xs font-medium">
                Latest Activity
              </SelectItem>
              <SelectItem value="discussed" className="text-xs font-medium">
                Most Discussed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="w-full">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 select-none">
          Filter by Category
        </p>
        <div className="flex flex-wrap gap-1.5 py-1">
          {/* "All" Pill */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => store.setCategory(undefined)}
            className={cn(
              "h-7 px-3 text-xs rounded-full border transition-all",
              activeCategory === undefined
                ? "bg-[var(--cn-indigo)] text-white border-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/40"
            )}
          >
            All Discussions
          </Button>

          {/* Specific Categories */}
          {Object.entries(CATEGORY_MAP).map(([key, config]) => {
            const isSelected = activeCategory === key;
            return (
              <Button
                key={key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => store.setCategory(key as CommunityCategory)}
                className={cn(
                  "h-7 px-3 text-xs rounded-full border transition-all",
                  isSelected
                    ? "bg-[var(--cn-indigo)] text-white border-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/40"
                )}
              >
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
