"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Users,
  Calendar,
  Trophy,
  Building,
  Search,
  ShoppingBag,
  Bus,
  Home,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { campusLifeService } from "@/services/campus-life";
import { Club, CampusEvent, ClubMembership, EventRegistration } from "@/types/campus-life.types";
import { ROUTES } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClubCard } from "@/components/campus-life/ClubCard";
import { EventCard } from "@/components/campus-life/EventCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampusLifeHubPage() {
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allClubs, allEvents, myMems, myRegs] = await Promise.all([
          campusLifeService.getClubs(),
          campusLifeService.getEvents({ upcomingOnly: true }),
          campusLifeService.getMyClubMemberships(),
          campusLifeService.getMyEventRegistrations(),
        ]);
        setClubs(allClubs);
        setEvents(allEvents);
        setMemberships(myMems);
        setRegistrations(myRegs);
      } catch (err) {
        console.error("Failed to load Campus Life Hub data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const joinedClubIds = new Set(memberships.map((m) => m.clubId));
  const registeredEventIds = new Set(registrations.map((r) => r.eventId));

  const quickNavCards = [
    {
      title: "College Clubs",
      description: "9 College-wide societies & student organizations across tech, arts, culture & sports.",
      href: ROUTES.CAMPUS_LIFE_CLUBS,
      icon: Users,
      badge: "9 Active Clubs",
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Campus Events",
      description: "Techno-cultural festivals, hackathons, guest lectures, and competitions.",
      href: ROUTES.CAMPUS_LIFE_EVENTS,
      icon: Calendar,
      badge: `${events.length} Upcoming`,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Sports & Athletics",
      description: "Intramural tournaments, stadium grounds, court schedules, and varsity practice.",
      href: ROUTES.CAMPUS_LIFE_SPORTS,
      icon: Trophy,
      badge: "Council Hub",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Campus Facilities",
      description: "Central Library, Advanced Computing Center, Auditoriums, and Health Center.",
      href: ROUTES.CAMPUS_LIFE_FACILITIES,
      icon: Building,
      badge: "6 Facilities",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Lost & Found",
      description: "Report lost belongings or claim items deposited at central campus desks.",
      href: ROUTES.CAMPUS_LIFE_LOST_FOUND,
      icon: Search,
      badge: "Safe Recovery",
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Student Marketplace",
      description: "Peer-to-peer exchange for textbooks, scientific calculators, and room essentials.",
      href: ROUTES.CAMPUS_LIFE_MARKETPLACE,
      icon: ShoppingBag,
      badge: "Student P2P",
      color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Campus Transport",
      description: "Bus routes, stops, schedules, and morning/evening campus commuter routes.",
      href: ROUTES.CAMPUS_LIFE_TRANSPORT,
      icon: Bus,
      badge: "4 Routes",
      color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
    {
      title: "Hostel Information",
      description: "Residential blocks (A–E), amenities, mess timings, and warden contacts.",
      href: ROUTES.CAMPUS_LIFE_HOSTEL,
      icon: Home,
      badge: "Blocks A–E",
      color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
    },
    {
      title: "Campus Directory",
      description: "Key administrative offices, examination cell, student welfare, and helpdesks.",
      href: ROUTES.CAMPUS_LIFE_DIRECTORY,
      icon: BookOpen,
      badge: "Important Desks",
      color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 p-8 sm:p-10 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 px-3 py-0.5 text-xs font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              College-Wide Student Life
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 px-3 py-0.5 text-xs font-semibold">
              CampusNexus Experience
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Campus Life Hub
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            Your centralized portal for student organizations, flagship festivals, sports facilities, peer marketplace, transport, and campus amenities.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={ROUTES.CAMPUS_LIFE_CLUBS}
              className={buttonVariants({ variant: "default", size: "sm" }) + " bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"}
            >
              <Users className="h-4 w-4 mr-2" />
              Explore All 9 Clubs
            </Link>
            <Link
              href={ROUTES.CAMPUS_LIFE_EVENTS}
              className={buttonVariants({ variant: "outline", size: "sm" }) + " bg-white/10 border-white/20 text-white hover:bg-white/20"}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Upcoming Events
            </Link>
          </div>
        </div>
      </div>

      {/* Personalized Dashboard: My Campus Life Widget */}
      {user && (memberships.length > 0 || registrations.length > 0) && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">My Campus Life</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {memberships.length} Clubs • {registrations.length} Event Registrations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* My Clubs Widget */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-purple-500" />
                  My Joined Clubs ({memberships.length})
                </span>
                <Link
                  href={ROUTES.CAMPUS_LIFE_CLUBS}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Manage
                </Link>
              </div>

              {memberships.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">You have not joined any clubs yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {memberships.map((m) => (
                    <Link
                      key={m.id}
                      href={ROUTES.CAMPUS_LIFE_CLUB_DETAIL(m.clubId)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-card border border-border/80 hover:border-primary/50 transition-colors"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>{m.clubName}</span>
                      {m.role === "LEADER" && (
                        <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] py-0 px-1">
                          Leader
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* My Registrations Widget */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5 text-blue-500" />
                  My Registered Events ({registrations.length})
                </span>
                <Link
                  href={ROUTES.CAMPUS_LIFE_EVENTS}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Browse Events
                </Link>
              </div>

              {registrations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No upcoming registered events.</p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {registrations.slice(0, 3).map((r) => (
                    <Link
                      key={r.id}
                      href={ROUTES.CAMPUS_LIFE_EVENT_DETAIL(r.eventId)}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-card border border-border/60 hover:border-primary/50 transition-colors"
                    >
                      <span className="font-medium text-foreground truncate max-w-[200px]">{r.eventTitle}</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                        Confirmed
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campus Life Modules Navigation Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Explore Campus Life Modules
          </h2>
          <p className="text-xs text-muted-foreground">
            Everything you need for your day-to-day student journey at CampusNexus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickNavCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                href={card.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[11px] font-semibold">
                      {card.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Open {card.title}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Clubs Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              College-Wide Clubs
            </h2>
            <p className="text-xs text-muted-foreground">
              All 9 campus societies are open to every student regardless of department or year.
            </p>
          </div>
          <Link
            href={ROUTES.CAMPUS_LIFE_CLUBS}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All 9 Clubs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clubs.slice(0, 3).map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                isMemberInitial={joinedClubIds.has(club.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Campus & Club Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Upcoming Events & Festivals
            </h2>
            <p className="text-xs text-muted-foreground">
              Hackathons, inter-year sports tournaments, debate fests, and cultural nights.
            </p>
          </div>
          <Link
            href={ROUTES.CAMPUS_LIFE_EVENTS}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All Events <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isRegisteredInitial={registeredEventIds.has(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
