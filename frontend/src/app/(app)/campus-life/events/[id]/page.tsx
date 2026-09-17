"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Ticket,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Tag,
  Building,
  Trophy,
} from "lucide-react";
import { CampusEvent } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EventRegistrationDialog } from "@/components/campus-life/EventRegistrationDialog";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = use(params);
  const user = useAuthStore((s) => s.user);

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [evt, regStatus] = await Promise.all([
          campusLifeService.getEventById(id),
          campusLifeService.isRegisteredForEvent(id),
        ]);
        if (!evt) {
          notFound();
        }
        setEvent(evt);
        setIsRegistered(regStatus);
        setRegisteredCount(evt.registeredCount);
      } catch (err) {
        console.error("Failed to load event details:", err);
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

  if (!event) {
    notFound();
  }

  const isFull = Boolean(event.capacity && registeredCount >= event.capacity);
  const isDeadlinePassed = new Date(event.registrationDeadline).getTime() < Date.now();
  const canRegister = !isRegistered && !isFull && !isDeadlinePassed && event.status === "UPCOMING" && event.isRegistrationOpen;

  const handleCancelRegistration = async () => {
    setCancelling(true);
    try {
      await campusLifeService.cancelEventRegistration(event.id);
      setIsRegistered(false);
      setRegisteredCount((c) => Math.max(0, c - 1));
      toast.success("Registration cancelled successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel registration");
    } finally {
      setCancelling(false);
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
        <Link href={ROUTES.CAMPUS_LIFE_EVENTS} className="hover:text-foreground transition-colors">
          Events
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold truncate max-w-xs">{event.title}</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary-foreground border-primary/30 text-xs font-bold uppercase">
                {event.eventType} EVENT
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20 text-xs">
                {event.category}
              </Badge>
              {isRegistered && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  You are Registered
                </Badge>
              )}
            </div>

            {/* Registration Actions */}
            <div>
              {isRegistered ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-destructive/40 text-destructive-foreground hover:bg-destructive/20 text-xs"
                  onClick={handleCancelRegistration}
                  disabled={cancelling}
                >
                  <XCircle className="h-4 w-4 mr-1.5 text-destructive" />
                  {cancelling ? "Cancelling..." : "Cancel My Registration"}
                </Button>
              ) : canRegister ? (
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4"
                  onClick={() => setDialogOpen(true)}
                >
                  <Ticket className="h-4 w-4 mr-1.5" />
                  Register for Event
                </Button>
              ) : (
                <Badge variant="outline" className="text-xs text-indigo-200 border-indigo-400/30 py-1 px-3">
                  {isFull ? "Event Full" : isDeadlinePassed ? "Registration Closed" : "Registrations Unavailable"}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 font-medium">
              Organized by <strong className="text-white">{event.organizer}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs text-indigo-100">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{event.startDate} {event.endDate ? `to ${event.endDate}` : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{event.startTime} – {event.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Requirements, Tags */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-base font-bold text-foreground">Event Overview</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements & Guidelines */}
          {event.requirements && event.requirements.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Participation Guidelines & Requirements
                </h2>
                <ul className="space-y-2 pt-1 text-xs text-muted-foreground">
                  {event.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sports Metadata if applicable */}
          {event.sportsMetadata && (
            <Card className="border-border bg-muted/20">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-emerald-500" />
                  Tournament Fixture Details
                </h2>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="text-[11px] font-bold text-foreground block">Sport:</span>
                    <span>{event.sportsMetadata.sportName}</span>
                  </div>
                  {event.sportsMetadata.fixtureType && (
                    <div>
                      <span className="text-[11px] font-bold text-foreground block">Format:</span>
                      <span>{event.sportsMetadata.fixtureType}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Event Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Registration summary & Capacity */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground">Registration Status</h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Capacity:</span>
                  <strong className="text-foreground">{event.capacity || "Open Entry"}</strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Registered:</span>
                  <strong className="text-foreground">{registeredCount} Students</strong>
                </div>

                {event.capacity && (
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <span className="text-muted-foreground">Remaining Seats:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {Math.max(0, event.capacity - registeredCount)}
                    </strong>
                  </div>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="text-foreground font-medium">
                    {new Date(event.registrationDeadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fee:</span>
                  <strong className="text-foreground">Free (Campus Pass)</strong>
                </div>
              </div>

              {canRegister && (
                <Button
                  className="w-full text-xs font-bold"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  <Ticket className="h-4 w-4 mr-1.5" />
                  Register Now
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-2 text-xs">
              <h2 className="text-sm font-bold text-foreground">Host Body</h2>
              <p className="text-muted-foreground">
                This event is conducted under official oversight of <strong className="text-foreground">{event.organizer}</strong>.
              </p>
              {event.organizerId && (
                <Link
                  href={ROUTES.CAMPUS_LIFE_CLUB_DETAIL(event.organizerId)}
                  className="text-xs text-primary font-semibold hover:underline block pt-1"
                >
                  Visit {event.organizer} Club Page →
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EventRegistrationDialog
        event={event}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setIsRegistered(true);
          setRegisteredCount((c) => c + 1);
        }}
      />
    </div>
  );
}
