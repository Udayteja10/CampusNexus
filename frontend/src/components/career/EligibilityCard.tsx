"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Building2,
  Award,
  Clock,
  HelpCircle,
} from "lucide-react";
import { EligibilityResult } from "@/types/career.types";
import { cn } from "@/lib/utils";

interface EligibilityCardProps {
  result: EligibilityResult | null;
  loading?: boolean;
  className?: string;
}

export function EligibilityCard({ result, loading, className }: EligibilityCardProps) {
  if (loading || !result) {
    return (
      <div className={cn("p-5 rounded-2xl border border-border bg-card animate-pulse space-y-3", className)}>
        <div className="h-5 w-40 bg-muted rounded-md" />
        <div className="h-4 w-60 bg-muted rounded-md" />
        <div className="space-y-2 pt-2">
          <div className="h-12 bg-muted/60 rounded-xl" />
          <div className="h-12 bg-muted/60 rounded-xl" />
        </div>
      </div>
    );
  }

  const { isEligible, reasons, criteria } = result;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6 transition-all space-y-5",
        isEligible
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : "border-rose-500/30 bg-rose-500/[0.03]",
        className
      )}
    >
      {/* Header status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              isEligible
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {isEligible ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {isEligible ? "You Are Eligible to Apply" : "You Are Not Eligible"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEligible
                ? "Your academic profile meets all criteria for this opportunity."
                : "You can still bookmark this opportunity or save it to your Smart Collections."}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border self-start sm:self-auto",
            isEligible
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
          )}
        >
          {isEligible ? "Application Open" : "Application Restricted"}
        </span>
      </div>

      {/* Reasons if ineligible */}
      {!isEligible && reasons.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Eligibility Requirements Not Met:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-foreground/90 pl-1">
            {reasons.map((r, i) => (
              <li key={i} className="leading-relaxed">
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Criteria Breakdown Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Criteria Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {criteria.map((crit) => (
            <div
              key={crit.key}
              className={cn(
                "p-3 rounded-xl border flex items-start justify-between gap-3 text-xs bg-card/60",
                crit.passed
                  ? "border-border/60"
                  : "border-rose-500/30 bg-rose-500/[0.04]"
              )}
            >
              <div className="space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  {crit.key === "platform_year" && <GraduationCap className="h-3.5 w-3.5 text-primary" />}
                  {crit.key === "department" && <Building2 className="h-3.5 w-3.5 text-primary" />}
                  {crit.key === "cgpa" && <Award className="h-3.5 w-3.5 text-primary" />}
                  {crit.key === "backlogs" && <HelpCircle className="h-3.5 w-3.5 text-primary" />}
                  {crit.key === "deadline" && <Clock className="h-3.5 w-3.5 text-primary" />}
                  {crit.label}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Required: <span className="font-medium text-foreground">{crit.required}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Your Profile:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      crit.passed
                        ? "text-foreground"
                        : "text-rose-600 dark:text-rose-400 font-bold"
                    )}
                  >
                    {crit.actual}
                  </span>
                </p>
              </div>

              <div className="shrink-0 mt-0.5">
                {crit.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
