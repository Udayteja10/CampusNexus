"use client";

import { useState, useMemo } from "react";
import { ModerationAuditEntry, ModerationAuditAction } from "@/types/moderation.types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Shield, GraduationCap, History, X } from "lucide-react";

interface AuditLogTableProps {
  logs: ModerationAuditEntry[];
}

const ACTION_LABELS: Record<ModerationAuditAction, { label: string; className: string }> = {
  REPORT_REVIEWED: {
    label: "Report Reviewed",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  REPORT_DISMISSED: {
    label: "Report Dismissed",
    className: "bg-muted text-muted-foreground border-border",
  },
  REPORT_RESOLVED: {
    label: "Report Resolved",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  CONTENT_REMOVED: {
    label: "Content Removed",
    className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  CONTENT_RESTORED: {
    label: "Content Restored",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  SUPPORT_REPLIED: {
    label: "Support Replied",
    className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
  SUPPORT_STATUS_CHANGED: {
    label: "Support Status",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  USER_SUSPENDED: {
    label: "User Suspended",
    className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  USER_RESTORED: {
    label: "User Restored",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  USER_ROLE_CHANGED: {
    label: "Role Changed",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  ESCALATED: {
    label: "Escalated",
    className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
};

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredLogs = useMemo(() => {
    let list = [...logs];

    if (actionFilter !== "ALL") {
      list = list.filter((l) => l.action === actionFilter);
    }

    if (roleFilter !== "ALL") {
      list = list.filter((l) => l.actorRole === roleFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.targetSummary?.toLowerCase().includes(q) ||
          l.reason?.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    return list;
  }, [logs, actionFilter, roleFilter, search]);

  return (
    <div className="space-y-4">
      {/* Filters & Search Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {(
            [
              { id: "ALL", label: "All Actions" },
              { id: "REPORT_REVIEWED", label: "Reviews" },
              { id: "CONTENT_REMOVED", label: "Removals" },
              { id: "SUPPORT_REPLIED", label: "Support" },
              { id: "USER_SUSPENDED", label: "Suspensions" },
              { id: "USER_ROLE_CHANGED", label: "Role Updates" },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              size="xs"
              variant={actionFilter === tab.id ? "default" : "outline"}
              onClick={() => setActionFilter(tab.id)}
              className="rounded-xl shrink-0 font-medium"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40">
            {(["ALL", "MODERATOR", "ADMIN"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                  roleFilter === r
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "ALL" ? "All Roles" : r}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="pl-8 pr-8 h-9 text-xs rounded-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Entries List */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center bg-card/40 space-y-2">
          <History className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No Audit Logs Found</h3>
          <p className="text-xs text-muted-foreground">
            No moderation activity matches your current filters.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
          {filteredLogs.map((entry) => {
            const config = ACTION_LABELS[entry.action] || {
              label: entry.action,
              className: "bg-muted text-muted-foreground",
            };

            let formattedTime = "";
            try {
              formattedTime = format(new Date(entry.createdAt), "MMM d, yyyy • h:mm a");
            } catch {
              formattedTime = "Recently";
            }

            return (
              <div
                key={entry.id}
                className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-semibold ${config.className}`}>
                      {config.label}
                    </Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      {entry.actorRole === "ADMIN" ? (
                        <GraduationCap className="h-3 w-3 text-rose-500" />
                      ) : (
                        <Shield className="h-3 w-3 text-emerald-500" />
                      )}
                      {entry.actorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase bg-muted/60 px-1.5 py-0.5 rounded">
                      {entry.actorRole}
                    </span>
                  </div>

                  {entry.targetSummary && (
                    <div className="font-medium text-foreground text-xs line-clamp-1">
                      Target: {entry.targetSummary}
                    </div>
                  )}

                  {entry.reason && (
                    <p className="text-muted-foreground line-clamp-2 leading-relaxed italic">
                      &ldquo;{entry.reason}&rdquo;
                    </p>
                  )}
                </div>

                <span className="text-[11px] text-muted-foreground shrink-0 sm:self-center">
                  {formattedTime}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
