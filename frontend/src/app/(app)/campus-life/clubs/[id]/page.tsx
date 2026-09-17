"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Users,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  LogOut,
  Sparkles,
  ArrowLeft,
  Crown,
  ChevronRight,
} from "lucide-react";
import { Club, CampusEvent, ClubMembership } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/campus-life/EventCard";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ClubDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { id } = use(params);
  const user = useAuthStore((s) => s.user);

  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [c, clubEvts, memStatus] = await Promise.all([
          campusLifeService.getClubById(id),
          campusLifeService.getClubEvents(id),
          campusLifeService.isClubMember(id),
        ]);
        if (!c) {
          notFound();
        }
        setClub(c);
        setEvents(clubEvts);
        setIsMember(memStatus);
      } catch (err) {
        console.error("Failed to load club details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 md:col-span-2 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!club) {
    notFound();
  }

  const handleToggleMembership = async () => {
    if (!user) {
      toast.error("Please sign in to manage club memberships.");
      return;
    }

    setActionLoading(true);
    try {
      if (isMember) {
        await campusLifeService.leaveClub(club.id);
        setIsMember(false);
        setClub((prev) => (prev ? { ...prev, membershipCount: Math.max(0, prev.membershipCount - 1) } : null));
        toast.success(`You have left ${club.name}`);
      } else {
        await campusLifeService.joinClub(club.id);
        setIsMember(true);
        setClub((prev) => (prev ? { ...prev, membershipCount: prev.membershipCount + 1 } : null));
        toast.success(`Welcome to ${club.name}!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update membership");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={ROUTES.CAMPUS_LIFE_CLUBS} className="hover:text-foreground transition-colors">
          Clubs
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">{club.name}</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 px-3 py-0.5 text-xs font-semibold">
                {club.category}
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 px-3 py-0.5 text-xs font-semibold">
                College-Wide Club
              </Badge>
            </div>

            <Button
              variant={isMember ? "outline" : "default"}
              size="sm"
              className={isMember ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-primary text-primary-foreground font-bold"}
              onClick={handleToggleMembership}
              disabled={actionLoading}
            >
              {actionLoading ? (
                "..."
              ) : isMember ? (
                <>
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Leave Club
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Join {club.name}
                </>
              )}
            </Button>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {club.name}
            </h1>
            <p className="text-sm sm:text-base text-indigo-200/90 font-medium">
              {club.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-indigo-100/80 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-purple-300" />
              <span><strong className="text-white">{club.membershipCount}</strong> Members</span>
            </div>
            {club.meetingSchedule && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-300" />
                <span>{club.meetingSchedule}</span>
              </div>
            )}
            {club.roomVenue && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-purple-300" />
                <span>{club.roomVenue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: About, Activities, Club Events */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-bold text-foreground">About the Society</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {club.about}
              </p>
            </CardContent>
          </Card>

          {/* Activities List */}
          {club.activities && club.activities.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Key Activities & Annual Programs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {club.activities.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs p-3 rounded-xl bg-muted/40 border border-border/50 text-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium">{act}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Associated Club Events */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Events Organized by {club.name} ({events.length})
              </h2>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                No active events scheduled by {club.name} at this moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Leadership & Coordinator info */}
        <div className="space-y-6">
          {/* Leadership Roster */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-foreground">Student Leadership</h2>
              </div>

              <div className="space-y-3">
                {club.leaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-foreground font-semibold">{leader.name}</strong>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                          {leader.roleTitle}
                        </Badge>
                        {user?.role === "ADMIN" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[10px] text-destructive hover:bg-destructive/10"
                            onClick={async () => {
                              if (!confirm(`Demote ${leader.name} from leader to regular member?`)) return;
                              try {
                                await campusLifeService.removeClubLeader(club.id, leader.id);
                                const updated = await campusLifeService.getClubById(club.id);
                                setClub(updated);
                                toast.success(`Leader removed.`);
                              } catch (err: unknown) {
                                const msg = err instanceof Error ? err.message : "Failed to remove leader";
                                toast.error(msg);
                              }
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    {leader.department && (
                      <p className="text-[11px] text-muted-foreground">
                        {leader.department} {leader.year ? `• Year ${leader.year}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {user?.role === "ADMIN" && (
                <div className="pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold"
                    onClick={async () => {
                      const leaderName = prompt("Enter Student Leader Name:");
                      if (!leaderName) return;
                      const roleTitle = prompt("Enter Leadership Title (e.g. President, Convener):", "Student Leader");
                      if (!roleTitle) return;
                      const customId = `lead-${Date.now()}`;
                      try {
                        await campusLifeService.assignClubLeader(club.id, customId, roleTitle);
                        const updated = await campusLifeService.getClubById(club.id);
                        setClub(updated);
                        toast.success(`${leaderName} assigned as ${roleTitle}!`);
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Failed to assign leader";
                        toast.error(msg);
                      }
                    }}
                  >
                    <Crown className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Assign Leader (Admin)
                  </Button>
                </div>
              )}

              {club.facultyCoordinator && (
                <div className="pt-3 border-t border-border/50 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-foreground block">
                    Faculty Coordinator:
                  </span>
                  <p className="text-muted-foreground">{club.facultyCoordinator}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-3 text-xs">
              <h2 className="text-sm font-bold text-foreground">Club Contact & Office</h2>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{club.contactEmail}</span>
                </div>
                {club.roomVenue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{club.roomVenue}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
