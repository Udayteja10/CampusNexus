"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { EligibilityStatus } from "@/types/career.types";
import { cn } from "@/lib/utils";

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  isEligible?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function EligibilityBadge({
  status,
  isEligible,
  className,
  size = "md",
}: EligibilityBadgeProps) {
  const eligible = isEligible !== undefined ? isEligible : status === "ELIGIBLE";

  if (status === "MISSING_PROFILE_DATA") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium rounded-full border bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
          className
        )}
      >
        <AlertCircle className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        <span>Profile Incomplete</span>
      </span>
    );
  }

  if (eligible) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-semibold rounded-full border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
          className
        )}
      >
        <CheckCircle2 className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        <span>Eligible to Apply</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full border bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
    >
      <XCircle className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span>Not Eligible</span>
    </span>
  );
}
