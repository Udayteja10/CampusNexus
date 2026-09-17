"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Ticket,
  XCircle,
} from "lucide-react";
import { CampusEvent } from "@/types/campus-life.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { campusLifeService } from "@/services/campus-life";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CampusEvent;
  isRegisteredInitial?: boolean;
  onRegistrationChange?: (isRegistered: boolean) => void;
  className?: string;
}

const TYPE_BADGES: Record<string, string> = {
  CLUB: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  CAMPUS: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  SPORTS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function EventCard({
  event,
  isRegisteredInitial = false,
  onRegistrationChange,
  className,
}: EventCardProps) {
  const [isRegistered, setIsRegistered] = useState(isRegisteredInitial);
  const [registeredCount, setRegisteredCount] = useState(event.registeredCount);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isFull = Boolean(event.capacity && registeredCount >= event.capacity);
  const isDeadlinePassed = Boolean(event.registrationDeadline && event.registrationDeadline < "2026-09-11T23:59:59.000Z");
  const canRegister = !isRegistered && !isFull && !isDeadlinePassed && event.status === "UPCOMING" && event.isRegistrationOpen;

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCancelling(true);
    try {
      await campusLifeService.cancelEventRegistration(event.id);
      setIsRegistered(false);
      setRegisteredCount((c) => Math.max(0, c - 1));
      onRegistrationChange?.(false);
      toast.success(`Registration cancelled for ${event.title}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel registration";
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40",
          className
        )}
      >
        <div className="space-y-3">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn("text-[10px] font-bold tracking-wider uppercase", TYPE_BADGES[event.eventType])}
              >
                {event.eventType}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-medium">
                {event.category}
              </Badge>
            </div>

            {isRegistered && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Registered
              </Badge>
            )}
          </div>

          {/* Event Title */}
          <div>
            <Link
              href={ROUTES.CAMPUS_LIFE_EVENT_DETAIL(event.id)}
              className="group/title block"
            >
              <h3 className="text-base font-bold tracking-tight text-foreground transition-colors group-hover/title:text-primary line-clamp-1">
                {event.title}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              By <span className="text-foreground">{event.organizer}</span>
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Metadata Grid */}
          <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary/80 shrink-0" />
              <span>{event.startDate} • {event.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary/80 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
          <div className="flex items-center text-xs text-muted-foreground gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span>
              <strong className="text-foreground">{registeredCount}</strong>
              {event.capacity ? ` / ${event.capacity}` : " registered"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRegistered ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={handleCancel}
                disabled={cancelling}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                {cancelling ? "..." : "Cancel"}
              </Button>
            ) : canRegister ? (
              <Button
                size="sm"
                className="h-8 text-xs font-semibold px-3.5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDialogOpen(true);
                }}
              >
                <Ticket className="h-3.5 w-3.5 mr-1" />
                Register
              </Button>
            ) : (
              <Badge variant="outline" className="text-[11px] text-muted-foreground">
                {isFull ? "Capacity Full" : isDeadlinePassed ? "Registration Closed" : "Unavailable"}
              </Badge>
            )}

            <Link href={ROUTES.CAMPUS_LIFE_EVENT_DETAIL(event.id)}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <EventRegistrationDialog
        event={event}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setIsRegistered(true);
          setRegisteredCount((c) => c + 1);
          onRegistrationChange?.(true);
        }}
      />
    </>
  );
}
