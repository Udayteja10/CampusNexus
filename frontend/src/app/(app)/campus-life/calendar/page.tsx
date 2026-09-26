"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Clock,
  MapPin,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Tag,
  Building,
  Layers,
  X,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { calendarApi } from "@/lib/campusLifeApi";
import type {
  CalendarEvent,
  CalendarEventRequest,
  CalendarEventType,
} from "@/types/campusLife.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";

const EVENT_TYPE_COLORS: Record<CalendarEventType, { bg: string; text: string; border: string; label: string }> = {
  ACADEMIC: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20", label: "Academic" },
  EXAM: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20", label: "Examinations" },
  HOLIDAY: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", label: "Holiday" },
  REGISTRATION: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20", label: "Registration" },
  EVENT: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20", label: "Campus Event" },
  OTHER: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", border: "border-slate-500/20", label: "General" },
};

export default function AcademicCalendarPage() {
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<CalendarEventType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"list" | "month">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<CalendarEventType>("ACADEMIC");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formAllDay, setFormAllDay] = useState(false);
  const [formYear, setFormYear] = useState<number | undefined>(undefined);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await calendarApi.getEvents(
        selectedType === "ALL" ? undefined : { eventType: selectedType }
      );
      setEvents(data);
    } catch (err: any) {
      console.error("Failed to load calendar events:", err);
      setError("Unable to load calendar events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedType]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartDate || !formEndDate) {
      toast.error("Please provide title, start date, and end date.");
      return;
    }

    setSaving(true);
    try {
      const payload: CalendarEventRequest = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        eventType: formType,
        startDate: new Date(formStartDate).toISOString(),
        endDate: new Date(formEndDate).toISOString(),
        allDay: formAllDay,
        yearOfStudy: formYear || undefined,
      };

      await calendarApi.createEvent(payload);
      toast.success("Calendar event created successfully!");
      setCreateModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create event";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormType("ACADEMIC");
    setFormStartDate("");
    setFormEndDate("");
    setFormAllDay(false);
    setFormYear(undefined);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Helper for calendar month grid
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const getEventsForDay = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = checkDate.toISOString().split("T")[0];

    return events.filter((e) => {
      const startStr = e.startDate.split("T")[0];
      const endStr = e.endDate.split("T")[0];
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-medium border border-white/20">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Campus Schedules & Deadlines</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Academic Calendar
            </h1>
            <p className="text-blue-100 max-w-xl text-sm md:text-base">
              Stay organized with semester timelines, examination dates, registration deadlines, and campus holidays.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isStaff && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium shadow-md transition-all gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            )}
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-purple-500/20 blur-2xl" />
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "ACADEMIC", "EXAM", "HOLIDAY", "REGISTRATION", "EVENT"] as const).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className="text-xs h-8"
            >
              {type === "ALL" ? "All Events" : EVENT_TYPE_COLORS[type]?.label || type}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex rounded-lg border border-border bg-background p-0.5">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "month"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchEvents} className="mt-4">
            Retry
          </Button>
        </Card>
      ) : viewMode === "month" ? (
        /* Month Calendar View */
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-muted/20">
            <CardTitle className="text-xl font-bold">{monthName}</CardTitle>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={prevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCurrentMonth(new Date())} className="text-xs h-8">
                Today
              </Button>
              <Button size="icon" variant="ghost" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Weekdays header */}
            <div className="grid grid-cols-7 border-b bg-muted/30 text-center text-xs font-semibold text-muted-foreground py-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-[110px] sm:auto-rows-[130px] divide-x divide-y divide-border">
              {/* Blank placeholders for first day offset */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-muted/10 p-2" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentMonth.getMonth() &&
                  new Date().getFullYear() === currentMonth.getFullYear();

                return (
                  <div
                    key={`day-${day}`}
                    className={`p-1.5 sm:p-2 overflow-y-auto transition-colors hover:bg-muted/30 ${
                      isToday ? "bg-blue-500/5 font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs h-6 w-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((e) => {
                        const style = EVENT_TYPE_COLORS[e.eventType] || EVENT_TYPE_COLORS.OTHER;
                        return (
                          <div
                            key={e.id}
                            onClick={() => setSelectedEvent(e)}
                            className={`cursor-pointer truncate rounded px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium border ${style.bg} ${style.text} ${style.border} hover:opacity-80 transition-opacity`}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-muted-foreground block pl-1">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-3">
          {events.length === 0 ? (
            <Card className="text-center p-12 border-dashed">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No calendar events found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                There are no scheduled academic events matching your current filter criteria.
              </p>
            </Card>
          ) : (
            events.map((e) => {
              const style = EVENT_TYPE_COLORS[e.eventType] || EVENT_TYPE_COLORS.OTHER;
              return (
                <Card
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className="cursor-pointer border-border/60 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl p-3 flex flex-col items-center justify-center min-w-[64px] border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <span className="text-xs font-semibold uppercase">
                          {new Date(e.startDate).toLocaleString("default", { month: "short" })}
                        </span>
                        <span className="text-xl font-bold leading-none mt-0.5">
                          {new Date(e.startDate).getDate()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`${style.bg} ${style.text} ${style.border} text-[10px]`}>
                            {style.label}
                          </Badge>
                          {e.departmentCode && (
                            <Badge variant="secondary" className="text-[10px]">
                              Dept: {e.departmentCode}
                            </Badge>
                          )}
                          {e.yearOfStudy && (
                            <Badge variant="secondary" className="text-[10px]">
                              Year {e.yearOfStudy}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{e.title}</h3>
                        {e.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                            {e.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between md:justify-center text-xs text-muted-foreground gap-1 border-t md:border-t-0 pt-2 md:pt-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(e.startDate).toLocaleDateString()}
                          {!e.allDay && ` - ${new Date(e.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      {e.allDay && <span className="text-primary font-medium">All Day Event</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={`${EVENT_TYPE_COLORS[selectedEvent.eventType]?.bg} ${EVENT_TYPE_COLORS[selectedEvent.eventType]?.text} ${EVENT_TYPE_COLORS[selectedEvent.eventType]?.border}`}
                  >
                    {EVENT_TYPE_COLORS[selectedEvent.eventType]?.label}
                  </Badge>
                  {selectedEvent.departmentCode && (
                    <Badge variant="secondary">{selectedEvent.departmentCode} Dept</Badge>
                  )}
                  {selectedEvent.yearOfStudy && (
                    <Badge variant="secondary">Year {selectedEvent.yearOfStudy}</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Posted by {selectedEvent.createdByName || "Campus Administration"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="bg-muted/40 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {new Date(selectedEvent.startDate).toLocaleString()} &rarr;{" "}
                      {new Date(selectedEvent.endDate).toLocaleString()}
                    </span>
                  </div>
                  {selectedEvent.allDay && (
                    <p className="text-muted-foreground pl-6">This is marked as a full-day event.</p>
                  )}
                </div>

                {selectedEvent.description ? (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Event Details
                    </h4>
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No additional description provided.</p>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Event Modal (Admin/Moderator Only) */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateEvent}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add Academic Calendar Event</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Create a new event, exam date, or holiday for students.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Event Title *</label>
                <Input
                  required
                  placeholder="e.g. Mid-Term Examinations / Commencement"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Event Type *</label>
                  <Select
                    value={formType}
                    onValueChange={(val) => setFormType(val as CalendarEventType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="EXAM">Examination</SelectItem>
                      <SelectItem value="HOLIDAY">Holiday</SelectItem>
                      <SelectItem value="REGISTRATION">Registration</SelectItem>
                      <SelectItem value="EVENT">Campus Event</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Target Year of Study</label>
                  <Select
                    value={formYear ? String(formYear) : "ALL"}
                    onValueChange={(val) => setFormYear(val === "ALL" ? undefined : Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Years</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Start Date & Time *</label>
                  <Input
                    type="datetime-local"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">End Date & Time *</label>
                  <Input
                    type="datetime-local"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={formAllDay}
                  onChange={(e) => setFormAllDay(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="allDay" className="text-xs font-medium cursor-pointer">
                  All-day event
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Description</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows={3}
                  placeholder="Additional instructions, venue, or syllabus details..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
