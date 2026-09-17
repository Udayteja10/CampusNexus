"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  FolderPlus,
  ArrowRight,
} from "lucide-react";
import { CareerOpportunity, EligibilityResult } from "@/types/career.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EligibilityBadge } from "./EligibilityBadge";
import { SaveToCollectionDialog } from "./SaveToCollectionDialog";
import { careerService } from "@/services/career";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: CareerOpportunity;
  eligibility?: EligibilityResult | null;
  isSavedInitial?: boolean;
  onSavedChange?: (isSaved: boolean) => void;
  className?: string;
}

function formatDeadline(isoString: string): { label: string; isUrgent: boolean; isExpired: boolean } {
  try {
    const deadline = new Date(isoString);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs <= 0) {
      return { label: "Expired", isUrgent: false, isExpired: true };
    }
    if (diffDays === 1) {
      return { label: "Closes Today", isUrgent: true, isExpired: false };
    }
    if (diffDays <= 3) {
      return { label: `${diffDays} days left`, isUrgent: true, isExpired: false };
    }
    if (diffDays <= 7) {
      return { label: "1 week left", isUrgent: false, isExpired: false };
    }
    return {
      label: `Deadline: ${deadline.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
      isUrgent: false,
      isExpired: false,
    };
  } catch {
    return { label: "Active", isUrgent: false, isExpired: false };
  }
}

export function OpportunityCard({
  opportunity,
  eligibility,
  isSavedInitial = false,
  onSavedChange,
  className,
}: OpportunityCardProps) {
  const [saved, setSaved] = useState(isSavedInitial);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);

  const isPlacement = opportunity.type === "PLACEMENT";
  const detailUrl = isPlacement
    ? ROUTES.CAREER_PLACEMENT_DETAIL(opportunity.id)
    : ROUTES.CAREER_INTERNSHIP_DETAIL(opportunity.id);

  const compensationDisplay = isPlacement
    ? `₹${opportunity.packageLpa.toFixed(1)} LPA`
    : `₹${opportunity.stipendMonthly.toLocaleString("en-IN")} / mo`;

  const deadlineInfo = formatDeadline(opportunity.applicationDeadline);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await careerService.toggleBookmark(opportunity.id);
      setSaved(res.saved);
      onSavedChange?.(res.saved);
      if (res.saved) {
        toast.success(`Saved ${opportunity.companyName} to your bookmarks.`);
      } else {
        toast.success(`Removed ${opportunity.companyName} from bookmarks.`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update bookmark.");
    }
  };

  const handleOpenCollectionDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCollectionDialogOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-200 hover:shadow-md hover:border-primary/40",
          className
        )}
      >
        <div className="space-y-4">
          {/* Top header: Company, Type Badge, Save Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base border border-primary/20">
                {opportunity.companyName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground">
                  {opportunity.companyName}
                </h4>
                <Link
                  href={detailUrl}
                  className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1"
                >
                  {opportunity.role}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleOpenCollectionDialog}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                title="Add to Smart Collection"
                aria-label="Add to collection"
              >
                <FolderPlus className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  saved
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                )}
                title={saved ? "Remove bookmark" : "Bookmark opportunity"}
                aria-label="Bookmark opportunity"
              >
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
              </button>
            </div>
          </div>

          {/* Badges strip: Type, Compensation, Work Mode, Location */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge
              variant="secondary"
              className={cn(
                "font-semibold text-[11px] px-2.5 py-0.5",
                isPlacement
                  ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              <Briefcase className="h-3 w-3 mr-1" />
              {isPlacement ? "Full-Time Placement" : "Internship"}
            </Badge>

            <span className="font-extrabold text-foreground bg-muted/80 px-2.5 py-0.5 rounded-md text-[11px] border border-border/60">
              {compensationDisplay}
            </span>

            <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
              <MapPin className="h-3 w-3 text-primary" />
              {opportunity.location} ({opportunity.workMode.toLowerCase()})
            </span>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {opportunity.description}
          </p>

          {/* Skills */}
          {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {opportunity.requiredSkills.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-md"
                >
                  {skill}
                </span>
              ))}
              {opportunity.requiredSkills.length > 4 && (
                <span className="text-[10px] text-muted-foreground self-center px-1">
                  +{opportunity.requiredSkills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Eligibility pill + Deadline + View Details */}
        <div className="border-t border-border/60 pt-4 mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {eligibility ? (
              <EligibilityBadge
                status={eligibility.status}
                isEligible={eligibility.isEligible}
                size="sm"
              />
            ) : (
              <span className="text-[10px] text-muted-foreground">
                Eligible: {opportunity.eligibility.eligibleDepartments.map((d) => d.toUpperCase()).join(", ")}
              </span>
            )}

            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border",
                deadlineInfo.isUrgent
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-semibold"
                  : deadlineInfo.isExpired
                  ? "bg-muted text-muted-foreground border-border"
                  : "bg-muted/60 text-muted-foreground border-border/60"
              )}
            >
              <Clock className="h-3 w-3" />
              {deadlineInfo.label}
            </span>
          </div>

          <Link href={detailUrl} className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1 font-semibold text-primary hover:text-primary hover:bg-primary/10"
            >
              <span>View Opening</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Save to Collection Dialog */}
      <SaveToCollectionDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        opportunity={opportunity}
      />
    </>
  );
}
