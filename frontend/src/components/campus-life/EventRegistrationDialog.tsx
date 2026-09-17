"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { CampusEvent, EventRegistration } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventRegistrationDialogProps {
  event: CampusEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (reg: EventRegistration) => void;
}

export function EventRegistrationDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: EventRegistrationDialogProps) {
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);

  const isFull = Boolean(event?.capacity && event.registeredCount >= event.capacity);
  const isDeadlinePassed = useMemo(() => {
    if (!event) return false;
    return new Date(event.registrationDeadline).getTime() < new Date().getTime();
  }, [event]);

  if (!event) return null;

  const handleRegister = async () => {
    if (!user) {
      toast.error("You must be logged in to register for events.");
      return;
    }

    setSubmitting(true);
    try {
      const reg = await campusLifeService.registerForEvent(event.id);
      toast.success(`Successfully registered for ${event.title}!`);
      onSuccess?.(reg);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register for event";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-semibold">
              {event.eventType} EVENT
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground leading-tight">
            Register for Event
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Confirm your registration details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Event Summary Card */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
            <h4 className="text-sm font-bold text-foreground">{event.title}</h4>
            <p className="text-xs text-muted-foreground font-medium">
              Organized by <span className="text-foreground">{event.organizer}</span>
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{event.startDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{event.startTime}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>
          </div>

          {/* Registrant details */}
          <div className="rounded-xl border border-border/60 p-3 space-y-1.5 text-xs">
            <span className="font-semibold text-foreground">Registered Student:</span>
            <div className="text-muted-foreground">
              <p><strong className="text-foreground">{user?.fullName || user?.username}</strong> ({user?.email})</p>
              <p>{user?.department ? `Dept: ${user.department}` : "Campus Student"}</p>
            </div>
          </div>

          {/* Requirements Check */}
          {event.requirements && event.requirements.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Event Requirements:
              </span>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                {event.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings if full or deadline passed */}
          {isFull && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>This event has reached full capacity. Registrations are closed.</span>
            </div>
          )}

          {isDeadlinePassed && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Registration deadline has expired.</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRegister}
            disabled={submitting || isFull || isDeadlinePassed}
          >
            {submitting ? "Registering..." : "Confirm Registration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
