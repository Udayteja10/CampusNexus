"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Activity,
  Clock,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Shield,
  ChevronRight,
} from "lucide-react";
import {
  SportsActivity,
  SportsFacility,
  SportsTournament,
  CampusEvent,
} from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/campus-life/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";

export default function SportsHubPage() {
  const [activities, setActivities] = useState<SportsActivity[]>([]);
  const [facilities, setFacilities] = useState<SportsFacility[]>([]);
  const [tournaments, setTournaments] = useState<SportsTournament[]>([]);
  const [sportsEvents, setSportsEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [acts, facs, tourns, evts] = await Promise.all([
          campusLifeService.getSportsActivities(),
          campusLifeService.getSportsFacilities(),
          campusLifeService.getSportsTournaments(),
          campusLifeService.getSportsEvents(),
        ]);
        setActivities(acts);
        setFacilities(facs);
        setTournaments(tourns);
        setSportsEvents(evts);
      } catch (err) {
        console.error("Failed to load sports data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Sports & Athletics</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl border border-emerald-900/40">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 px-3 py-0.5 text-xs font-semibold">
              Sports Council & Athletics
            </Badge>
            <Badge className="bg-teal-500/20 text-teal-200 border-teal-400/30 px-3 py-0.5 text-xs font-semibold">
              College-Wide Participation
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Sports & Physical Fitness
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Varsity coaching, intramural leagues, Olympic-standard fitness centers, synthetic courts, and athletic tracks open to all students.
          </p>
        </div>
      </div>

      {/* Sports Activities Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Active Sports Squads & Practice Schedules
          </h2>
          <p className="text-xs text-muted-foreground">
            Regular coaching and sparring sessions conducted daily by certified coaches.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((sport) => (
              <Card key={sport.id} className="border-border hover:border-primary/40 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{sport.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      {sport.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sport.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{sport.practiceTimings}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{sport.venue}</span>
                    </div>
                    {sport.coachName && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Coach: <strong className="text-foreground">{sport.coachName}</strong></span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Tournaments & Competitions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Upcoming Tournaments & Intramural Championships
          </h2>
          <p className="text-xs text-muted-foreground">
            Register your department squad or participate as an individual contender.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((tourn) => (
            <Card key={tourn.id} className="border-border bg-gradient-to-br from-card via-card to-muted/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">
                    {tourn.sport}
                  </Badge>
                  {tourn.isOpenForRegistration && (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold">
                      Open for Entry
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground">{tourn.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{tourn.dateRange}</span>
                    <span>•</span>
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{tourn.venue}</span>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1">
                  <p><strong>Eligibility:</strong> {tourn.eligibility}</p>
                  <p><strong>Contact Desk:</strong> {tourn.contactPerson}</p>
                </div>

                <Button
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={() => toast.info(`Registration for ${tourn.title} is managed at SAC Sports Desk.`)}
                >
                  Apply at Sports Council
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sports Facilities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Sports Arenas & Facilities
          </h2>
          <p className="text-xs text-muted-foreground">
            Operating hours, booking guidelines, and arena rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac) => (
            <Card key={fac.id} className="border-border">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">{fac.name}</h3>
                  <span className="text-xs text-muted-foreground">{fac.type} • {fac.location}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Timings: <strong className="text-foreground">{fac.timings}</strong></span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-foreground block">Key Amenities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.amenities.map((am, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {am}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <span className="font-bold text-foreground block text-[11px]">Facility Rules:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {fac.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
