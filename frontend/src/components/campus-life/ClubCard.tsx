"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ArrowRight,
  Check,
  UserPlus,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Club } from "@/types/campus-life.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ClubCardProps {
  club: Club;
  isMemberInitial?: boolean;
  onMembershipChange?: (isMember: boolean) => void;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  TECHNICAL: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  CULTURAL: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  SPORTS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  LITERARY: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  SOCIAL: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  COMMUNITY: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  ENTREPRENEURSHIP: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

export function ClubCard({
  club,
  isMemberInitial = false,
  onMembershipChange,
  className,
}: ClubCardProps) {
  const user = useAuthStore((s) => s.user);
  const [isMember, setIsMember] = useState(isMemberInitial);
  const [memberCount, setMemberCount] = useState(club.membershipCount);
  const [loading, setLoading] = useState(false);

  const handleToggleMembership = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to join clubs.");
      return;
    }

    setLoading(true);
    try {
      if (isMember) {
        await campusLifeService.leaveClub(club.id);
        setIsMember(false);
        setMemberCount((prev) => Math.max(0, prev - 1));
        onMembershipChange?.(false);
        toast.success(`You have left ${club.name}`);
      } else {
        await campusLifeService.joinClub(club.id);
        setIsMember(true);
        setMemberCount((prev) => prev + 1);
        onMembershipChange?.(true);
        toast.success(`Welcome to ${club.name}!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update club membership";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const categoryStyle = CATEGORY_COLORS[club.category] || "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={cn("text-[11px] font-semibold tracking-wide", categoryStyle)}
          >
            {club.category}
          </Badge>

          {isMember && (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
              <Check className="h-3 w-3 mr-1" />
              Member
            </Badge>
          )}
        </div>

        {/* Club Name & Tagline */}
        <div>
          <Link
            href={ROUTES.CAMPUS_LIFE_CLUB_DETAIL(club.id)}
            className="group/title block"
          >
            <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover/title:text-primary">
              {club.name}
            </h3>
            <p className="text-xs font-medium text-muted-foreground mt-0.5 line-clamp-1">
              {club.tagline}
            </p>
          </Link>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
          {club.description}
        </p>

        {/* Activities Snippet */}
        {club.activities && club.activities.length > 0 && (
          <div className="pt-1">
            <div className="flex flex-wrap gap-1">
              {club.activities.slice(0, 2).map((act, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md border border-border/40"
                >
                  <Sparkles className="h-2.5 w-2.5 mr-1 text-primary/70" />
                  {act}
                </span>
              ))}
              {club.activities.length > 2 && (
                <span className="text-[10px] text-muted-foreground/70 px-1 py-0.5">
                  +{club.activities.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center text-xs text-muted-foreground gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground/80" />
          <span className="font-semibold text-foreground">{memberCount}</span>
          <span className="text-[11px]">members</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isMember ? "outline" : "default"}
            className={cn(
              "h-8 text-xs font-medium px-3",
              isMember && "text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            )}
            onClick={handleToggleMembership}
            disabled={loading}
          >
            {loading ? (
              "..."
            ) : isMember ? (
              <>
                <LogOut className="h-3 w-3 mr-1" />
                Leave
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Join
              </>
            )}
          </Button>

          <Link href={ROUTES.CAMPUS_LIFE_CLUB_DETAIL(club.id)}>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
