"use client";

import React from "react";
import { OpportunityStatus } from "@/types/career.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OpportunityStatusBadgeProps {
  status: OpportunityStatus;
  className?: string;
}

export function OpportunityStatusBadge({ status, className }: OpportunityStatusBadgeProps) {
  switch (status) {
    case "PUBLISHED":
      return (
        <Badge
          variant="outline"
          className={cn("bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]", className)}
        >
          Published & Active
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className={cn("bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]", className)}
        >
          Draft (Hidden)
        </Badge>
      );
    case "CLOSED":
      return (
        <Badge
          variant="outline"
          className={cn("bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30 text-[10px]", className)}
        >
          Closed
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge
          variant="outline"
          className={cn("bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px]", className)}
        >
          Archived
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
