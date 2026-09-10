"use client";

import { CommunityCategory } from "@/types/post.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const CATEGORY_MAP: Record<
  CommunityCategory,
  { label: string; bg: string; text: string; border: string }
> = {
  general: {
    label: "General",
    bg: "bg-[var(--cn-indigo)]/10",
    text: "text-[var(--cn-indigo)]",
    border: "border-[var(--cn-indigo)]/20",
  },
  academics: {
    label: "Academics",
    bg: "bg-[var(--cn-sky)]/10",
    text: "text-[var(--cn-sky)]",
    border: "border-[var(--cn-sky)]/20",
  },
  placements: {
    label: "Placements",
    bg: "bg-[var(--cn-amber)]/10",
    text: "text-[var(--cn-amber)]",
    border: "border-[var(--cn-amber)]/20",
  },
  internships: {
    label: "Internships",
    bg: "bg-[var(--cn-emerald)]/10",
    text: "text-[var(--cn-emerald)]",
    border: "border-[var(--cn-emerald)]/20",
  },
  events: {
    label: "Events",
    bg: "bg-[var(--cn-violet)]/10",
    text: "text-[var(--cn-violet)]",
    border: "border-[var(--cn-violet)]/20",
  },
  clubs: {
    label: "Clubs",
    bg: "bg-[var(--cn-rose)]/10",
    text: "text-[var(--cn-rose)]",
    border: "border-[var(--cn-rose)]/20",
  },
  "campus-life": {
    label: "Campus Life",
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
  },
  "lost-found": {
    label: "Lost & Found",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20",
  },
};

interface CategoryBadgeProps {
  category: CommunityCategory;
  className?: string;
  onClick?: () => void;
}

export function CategoryBadge({ category, className, onClick }: CategoryBadgeProps) {
  const config = CATEGORY_MAP[category];
  if (!config) return null;

  return (
    <Badge
      variant="outline"
      onClick={onClick}
      className={cn(
        "cursor-default text-xs font-medium px-2 py-0.5 border rounded-full transition-colors",
        config.bg,
        config.text,
        config.border,
        onClick && "cursor-pointer hover:bg-opacity-80",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
