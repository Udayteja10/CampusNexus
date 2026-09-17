"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  SlidersHorizontal,
  Ticket,
  Sparkles,
  Filter,
  X,
  CheckCircle2,
} from "lucide-react";
import { CampusEvent, EventCategory, EventType, EventRegistration } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/campus-life/EventCard";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: EventCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "TECHNICAL", label: "Technical & Coding" },
  { id: "CULTURAL", label: "Cultural & Arts" },
  { id: "SPORTS", label: "Sports & Tournaments" },
  { id: "LITERARY", label: "Literary & Debate" },
  { id: "SOCIAL", label: "Social Awareness" },
  { id: "ENTREPRENEURSHIP", label: "Startup & Innovation" },
  { id: "WORKSHOP", label: "Hands-on Workshops" },
  { id: "FESTIVAL", label: "College Festivals" },
];

const EVENT_TYPES: { id: EventType | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Event Types" },
  { id: "CLUB", label: "Club Events" },
  { id: "CAMPUS", label: "College-Wide Events" },
  { id: "SPORTS", label: "Sports Tournaments" },
];

export default function EventsDirectoryPage() {
  const user = useAuthStore((s) => s.user);

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EventCategory | "ALL">("ALL");
  const [eventType, setEventType] = useState<EventType | "ALL">("ALL");
  const [myEventsOnly, setMyEventsOnly] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allEvents, myRegs] = await Promise.all([
          campusLifeService.getEvents({
            search: search.trim() || undefined,
            category,
            eventType,
          }),
          campusLifeService.getMyEventRegistrations(),
        ]);
        setEvents(allEvents);
        setRegistrations(myRegs);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, category, eventType, user?.id]);

  const registeredEventIds = new Set(registrations.map((r) => r.eventId));

  const displayedEvents = myEventsOnly
    ? events.filter((e) => registeredEventIds.has(e.id))
    : events;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 font-semibold px-3 py-0.5">
              College & Club Events
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 font-semibold px-3 py-0.5">
              Instant In-App Registration
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Campus Events & Activities
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            Participate in annual techno-cultural fests, hackathons, sports championships, startup pitches, and workshop cohorts across campus.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search event by name, organizer, venue, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Event Type Filter */}
            <div className="md:col-span-2">
              <Select
                value={eventType}
                onValueChange={(v) => setEventType((v as EventType | "ALL") ?? "ALL")}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <Select
                value={category}
                onValueChange={(v) => setCategory((v as EventCategory | "ALL") ?? "ALL")}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* My Registrations Toggle */}
            <div className="md:col-span-2 flex items-center">
              <Button
                variant={myEventsOnly ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs w-full"
                onClick={() => setMyEventsOnly(!myEventsOnly)}
              >
                <Ticket className="h-3.5 w-3.5 mr-1.5" />
                {myEventsOnly ? "My Registered" : "My Registered"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>
              Showing <strong>{displayedEvents.length}</strong> of {events.length} campus events
            </span>
            {(search || category !== "ALL" || eventType !== "ALL" || myEventsOnly) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setCategory("ALL");
                  setEventType("ALL");
                  setMyEventsOnly(false);
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-3">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No events match your criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search keyword or clearing selected filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategory("ALL");
              setEventType("ALL");
              setMyEventsOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isRegisteredInitial={registeredEventIds.has(evt.id)}
              onRegistrationChange={(isReg) => {
                if (isReg) {
                  setRegistrations((prev) => [
                    ...prev,
                    {
                      id: `reg-${Date.now()}`,
                      eventId: evt.id,
                      eventTitle: evt.title,
                      userId: user?.id || "",
                      userName: user?.fullName || "",
                      userEmail: user?.email || "",
                      registeredAt: new Date().toISOString(),
                      status: "CONFIRMED",
                    },
                  ]);
                } else {
                  setRegistrations((prev) => prev.filter((r) => r.eventId !== evt.id));
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
