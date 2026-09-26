"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Calendar,
  Users,
  ShoppingBag,
  HelpCircle,
  BookOpen,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Tag,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  calendarApi,
  clubsApi,
  marketplaceApi,
  lostFoundApi,
  wikiApi,
  badgesApi,
} from "@/lib/campusLifeApi";
import type {
  CalendarEvent,
  Club,
  MarketplaceListing,
  LostFoundReport,
  CampusWikiPage,
  UserBadge,
} from "@/types/campusLife.types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampusLifeHubPage() {
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [recentListings, setRecentListings] = useState<MarketplaceListing[]>([]);
  const [recentReports, setRecentReports] = useState<LostFoundReport[]>([]);
  const [wikiArticles, setWikiArticles] = useState<CampusWikiPage[]>([]);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    async function loadHubData() {
      setLoading(true);
      try {
        const [evts, clbs, mkt, lf, wk, bg] = await Promise.all([
          calendarApi.getEvents().catch(() => []),
          clubsApi.getAllClubs().catch(() => []),
          marketplaceApi.searchListings({ status: "ACTIVE" }).catch(() => []),
          lostFoundApi.searchReports({ status: "OPEN" }).catch(() => []),
          wikiApi.searchPages({ status: "PUBLISHED" }).catch(() => []),
          badgesApi.getMyBadges().catch(() => []),
        ]);
        setUpcomingEvents(evts.slice(0, 3));
        setClubs(clbs.slice(0, 4));
        setRecentListings(mkt.slice(0, 4));
        setRecentReports(lf.slice(0, 3));
        setWikiArticles(wk.slice(0, 3));
        setMyBadges(bg);
      } catch (err) {
        console.error("Failed to load hub data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHubData();
  }, []);

  const coreModules = [
    {
      title: "Academic Calendar",
      description: "Official schedule for exams, semester deadlines, campus holidays, and academic milestones.",
      href: "/campus-life/calendar",
      icon: Calendar,
      badge: `${upcomingEvents.length} Upcoming`,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Student Clubs & Events",
      description: "Explore technical societies, cultural chapters, sports teams, and upcoming club activities.",
      href: "/campus-life/clubs",
      icon: Users,
      badge: `${clubs.length} Active Clubs`,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Peer Marketplace",
      description: "Buy and sell textbooks, scientific calculators, stationery, and hostel essentials with classmates.",
      href: "/campus-life/marketplace",
      icon: ShoppingBag,
      badge: `${recentListings.length} Active Listings`,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Lost & Found Portal",
      description: "Report missing items or help fellow students recover misplaced cards, IDs, keys, and devices.",
      href: "/campus-life/lost-found",
      icon: HelpCircle,
      badge: `${recentReports.length} Open Reports`,
      color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Campus Wiki & Guide",
      description: "Crowdsourced knowledge base for lab survival, exam prep, hostel tips, and campus navigation.",
      href: "/campus-life/wiki",
      icon: BookOpen,
      badge: `${wikiArticles.length} Guides`,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Achievement Badges",
      description: "Earn community points and collect badges for answering questions, publishing guides, and participation.",
      href: "/campus-life/badges",
      icon: Award,
      badge: `${myBadges.length} Earned`,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-10 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 border border-border/60 p-6 md:p-10 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/20 text-primary">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Campus Life Ecosystem
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            Welcome to Campus Life, {user?.fullName?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Your central gateway to academic schedules, student organizations, peer trade, lost & found recoveries, and campus knowledge.
          </p>
        </div>
      </div>

      {/* 6 Core Modules Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Explore Campus Life</h2>
          <p className="text-xs text-muted-foreground">Select a module to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.href} href={mod.href} className="group block">
                <Card className="h-full border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className={`p-3 rounded-2xl border ${mod.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold">
                        {mod.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {mod.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {mod.description}
                    </CardDescription>
                  </CardHeader>
                  <div className="p-6 pt-0 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Enter {mod.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Live Preview Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Academic Calendar Events */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Upcoming Calendar Events
              </CardTitle>
              <CardDescription className="text-xs">Upcoming academic deadlines and holidays</CardDescription>
            </div>
            <Link href="/campus-life/calendar" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">No upcoming events found.</p>
            ) : (
              upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px]">
                      {evt.eventType}
                    </Badge>
                    <h4 className="font-semibold text-sm text-foreground">{evt.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(evt.startDate).toLocaleDateString()}
                      {evt.endDate ? ` - ${new Date(evt.endDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Latest Marketplace Listings */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-500" /> Fresh Marketplace Items
              </CardTitle>
              <CardDescription className="text-xs">Recently listed textbooks & items</CardDescription>
            </div>
            <Link href="/campus-life/marketplace" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Browse All
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : recentListings.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">No active listings available.</p>
            ) : (
              recentListings.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.category.replace("_", " ")} • {item.conditionType.replace("_", " ")}
                    </p>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{item.price}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
