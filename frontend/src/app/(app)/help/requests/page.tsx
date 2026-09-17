"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SupportRequest, SupportRequestStatus } from "@/types/help.types";
import { helpService } from "@/services/help";
import { SupportRequestCard } from "@/components/help/SupportRequestCard";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  Plus,
  Search,
  ArrowLeft,
  LifeBuoy,
} from "lucide-react";

export default function MySupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<SupportRequestStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    helpService
      .getSupportRequests({
        status: statusFilter,
        search: searchQuery,
      })
      .then((data) => {
        if (isMounted) {
          setRequests(data);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, searchQuery]);

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-8">
      {/* Header & Navigation */}
      <div className="space-y-3">
        <Link
          href={ROUTES.HELP}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Help Center
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Inbox className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                My Support Requests
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Track the progress, coordinator replies, and resolution of your submitted support tickets.
            </p>
          </div>

          <Button
            className="rounded-xl font-semibold gap-1.5 shrink-0"
            render={
              <Link href={ROUTES.HELP_CONTACT}>
                <Plus className="h-4 w-4" />
                Submit New Request
              </Link>
            }
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {(
            [
              { id: "ALL", label: "All Tickets" },
              { id: "OPEN", label: "Open" },
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "RESOLVED", label: "Resolved" },
              { id: "CLOSED", label: "Closed" },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              size="xs"
              variant={statusFilter === tab.id ? "default" : "outline"}
              onClick={() => setStatusFilter(tab.id)}
              className="rounded-xl shrink-0 font-medium"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search in requests */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="pl-8 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card/40 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Inbox className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-foreground">No Support Requests Found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery || statusFilter !== "ALL"
                  ? "No support requests match your current filters."
                  : "You haven't submitted any support requests yet."}
              </p>
            </div>
            <div className="pt-2">
              <Button
                className="rounded-xl font-semibold gap-1.5"
                render={
                  <Link href={ROUTES.HELP_CONTACT}>
                    <Plus className="h-4 w-4" />
                    Submit a Support Request
                  </Link>
                }
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <SupportRequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </div>

      {/* Help footer banner */}
      <div className="rounded-2xl border border-border bg-card/60 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LifeBuoy className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Looking for quick answers? Browse our collection of frequently asked questions.
          </p>
        </div>
        <Link
          href={ROUTES.HELP_FAQ}
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Explore FAQs →
        </Link>
      </div>
    </div>
  );
}
