"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Layers,
  Building,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService } from "@/services/academic";
import { AcademicEvent, AcademicEventType } from "@/types/academic.types";
import { getDepartmentLabel, getDepartmentId } from "@/lib/departments";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";
import { cn } from "@/lib/utils";

const EVENT_TYPE_COLORS: Record<AcademicEventType, { label: string; color: string }> = {
  EXAM: {
    label: "Examination",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
  HOLIDAY: {
    label: "Holiday / Vacation",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  SUBMISSION: {
    label: "Project Submission",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  FEST: {
    label: "Symposium / Fest",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  GUEST_LECTURE: {
    label: "Guest Lecture",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  WORKSHOP: {
    label: "Technical Workshop",
    color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  },
};

export default function AcademicCalendarPage() {
  const user = useAuthStore((s) => s.user);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const deptLabel = getDepartmentLabel(user?.department);
  const deptId = getDepartmentId(user?.department) || "cse";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    academicService
      .getAcademicEvents()
      .then((data) => {
        if (mounted) setEvents(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user?.department]);

  const filteredEvents = events.filter((e) => {
    if (selectedType !== "ALL" && e.eventType !== selectedType) return false;
    return true;
  });

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DeptBadge departmentIdOrName={deptId} size="md" />
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Academic Calendar & Deadlines
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Official university timetable, examination dates, lab internal submissions, and department symposiums for {deptLabel}.
          </p>
        </div>
      </div>

      {/* Filter Type Pills */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedType("ALL")}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
            selectedType === "ALL"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          All Events ({events.length})
        </button>
        {(
          [
            "EXAM",
            "SUBMISSION",
            "HOLIDAY",
            "FEST",
            "GUEST_LECTURE",
            "WORKSHOP",
          ] as AcademicEventType[]
        ).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedType === type
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {EVENT_TYPE_COLORS[type]?.label || type}
          </button>
        ))}
      </div>

      {/* Timeline Events List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <AcademicEmptyState
          icon={CalendarDays}
          title="No events found"
          description="There are no scheduled events matching this filter category."
          actionLabel="Show All Events"
          onAction={() => setSelectedType("ALL")}
        />
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            const isSingleDay =
              startDate.toDateString() === endDate.toDateString();

            const typeConfig = EVENT_TYPE_COLORS[event.eventType] || {
              label: event.eventType,
              color: "bg-muted text-muted-foreground",
            };

            return (
              <div
                key={event.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-2xl border border-border bg-card transition-all hover:shadow-xs",
                  event.isImportant ? "border-l-4 border-l-rose-500" : ""
                )}
              >
                {/* Date Block */}
                <div className="flex sm:flex-col items-center justify-center h-14 sm:h-16 w-full sm:w-16 rounded-xl bg-muted/40 border border-border shrink-0 text-center gap-2 sm:gap-0">
                  <span className="text-[11px] font-bold text-primary uppercase">
                    {startDate.toLocaleString("default", { month: "short" })}
                  </span>
                  <span className="text-xl font-black text-foreground leading-none">
                    {startDate.getDate()}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-medium border", typeConfig.color)}
                    >
                      {typeConfig.label}
                    </Badge>

                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {event.scope === "college" ? "College Wide" : deptLabel}
                    </Badge>

                    {event.isImportant && (
                      <Badge variant="destructive" className="text-[10px]">
                        High Priority
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {isSingleDay
                          ? `${startDate.toLocaleDateString()} (${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                          : `${startDate.toLocaleDateString()} — ${endDate.toLocaleDateString()}`}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
