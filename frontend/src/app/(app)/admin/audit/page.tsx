"use client";

import { useState, useEffect } from "react";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { moderationService } from "@/services/moderation";
import { ModerationAuditEntry } from "@/types/moderation.types";

export default function AdminAuditTrailPage() {
  const [logs, setLogs] = useState<ModerationAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await moderationService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Moderation &amp; Administrative Audit Trail
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete, chronological log of all moderation resolutions, content removals, user suspensions, role changes, and support replies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLogs()}
            className="rounded-xl"
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Trail
          </Button>
        </div>
      </div>

      {/* Audit Log Table Component */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading audit entries...</div>
      ) : (
        <AuditLogTable logs={logs} />
      )}
    </div>
  );
}
