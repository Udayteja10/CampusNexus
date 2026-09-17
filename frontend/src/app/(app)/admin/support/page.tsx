"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { helpService } from "@/services/help";
import {
  SupportRequest,
  SupportRequestStatus,
  SupportRequestPriority,
  HelpCategory,
} from "@/types/help.types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AdminSupportQueuePage() {
  const [tickets, setTickets] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<SupportRequestStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<SupportRequestPriority | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<HelpCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const all = await helpService.getSupportRequests();
      let filtered = all;

      if (statusFilter !== "ALL") {
        filtered = filtered.filter((t) => t.status === statusFilter);
      }
      if (priorityFilter !== "ALL") {
        filtered = filtered.filter((t) => t.priority === priorityFilter);
      }
      if (categoryFilter !== "ALL") {
        filtered = filtered.filter((t) => t.category === categoryFilter);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.id.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.userFullName.toLowerCase().includes(q) ||
            t.userEmail.toLowerCase().includes(q)
        );
      }

      setTickets(filtered);
    } catch (err) {
      console.error("Failed to load support requests:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const getStatusBadge = (status: SupportRequestStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: SupportRequestPriority) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-2.5 w-2.5" /> High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Medium
          </span>
        );
      case "LOW":
        return (
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Staff Support Desk
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage student inquiries, technical issue reports, and academic appeals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTickets()}
            className="rounded-xl"
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3">
        {(
          [
            { id: "ALL", label: "All Tickets" },
            { id: "OPEN", label: "Open" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "RESOLVED", label: "Resolved" },
            { id: "CLOSED", label: "Closed" },
          ] as const
        ).map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, subject, student name..."
            className="pl-9 text-sm rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={priorityFilter}
            onValueChange={(val) => setPriorityFilter(val as SupportRequestPriority | "ALL")}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="HIGH">High Priority</SelectItem>
              <SelectItem value="MEDIUM">Medium Priority</SelectItem>
              <SelectItem value="LOW">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val as HelpCategory | "ALL")}
          >
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="TECHNICAL">Technical Issue</SelectItem>
              <SelectItem value="ACADEMIC">Academic Inquiry</SelectItem>
              <SelectItem value="ACCOUNT">Account &amp; Access</SelectItem>
              <SelectItem value="CAREER">Career &amp; Placements</SelectItem>
              <SelectItem value="CAMPUS_LIFE">Campus Life</SelectItem>
              <SelectItem value="PRIVACY_SAFETY">Privacy &amp; Safety</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No support tickets found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No student tickets match the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-border/90 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {ticket.subject}
                    </span>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {ticket.category}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {ticket.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span>
                      Student: <span className="font-medium text-foreground">{ticket.userFullName}</span> ({ticket.userEmail})
                    </span>
                    <span>•</span>
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {ticket.messages?.length || 0} messages
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-start">
                  <Link
                    href={ROUTES.ADMIN_SUPPORT_DETAIL(ticket.id)}
                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-8 text-xs rounded-xl")}
                  >
                    Open Console <ExternalLink className="ml-1.5 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
