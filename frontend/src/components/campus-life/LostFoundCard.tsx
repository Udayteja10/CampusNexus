"use client";

import React, { useState } from "react";
import {
  MapPin,
  User,
  CheckCircle2,
  Trash2,
  Edit2,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { LostFoundItem } from "@/types/campus-life.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { campusLifeService } from "@/services/campus-life";
import { toast } from "@/lib/toast";
import { LostFoundDialog } from "./LostFoundDialog";
import { cn } from "@/lib/utils";

interface LostFoundCardProps {
  item: LostFoundItem;
  onUpdated?: () => void;
  onDeleted?: () => void;
  className?: string;
}

export function LostFoundCard({
  item,
  onUpdated,
  onDeleted,
  className,
}: LostFoundCardProps) {
  const user = useAuthStore((s) => s.user);
  const isOwner = Boolean(user && (user.id === item.authorId || user.role === "ADMIN"));

  const [editOpen, setEditOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleResolve = async () => {
    setLoadingAction(true);
    try {
      await campusLifeService.resolveLostFoundItem(item.id);
      toast.success("Item marked as resolved!");
      onUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update item";
      toast.error(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    setLoadingAction(true);
    try {
      await campusLifeService.deleteLostFoundItem(item.id);
      toast.success("Report deleted.");
      onDeleted?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete report";
      toast.error(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleContact = () => {
    toast.info(item.contactNote || "Please use in-app messages or visit the designated desk.");
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30",
          item.status === "RESOLVED" && "opacity-75 bg-muted/20",
          className
        )}
      >
        <div className="space-y-3">
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold tracking-wider uppercase",
                  item.type === "LOST"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                )}
              >
                {item.type === "LOST" ? "Lost Item" : "Found Item"}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-medium">
                {item.category}
              </Badge>
            </div>

            {item.status === "RESOLVED" ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Resolved / Claimed
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                Active Report
              </Badge>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{item.location}</span>
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
            {item.description}
          </p>

          {/* Safe Recovery Note Banner */}
          <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1 mb-0.5">
              <HelpCircle className="h-3 w-3 text-primary" />
              Recovery Instructions:
            </span>
            <p className="line-clamp-2 text-[11px]">{item.contactNote}</p>
          </div>
        </div>

        {/* Footer info & action buttons */}
        <div className="mt-4 pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>
              Reported by <strong className="text-foreground">{item.authorName}</strong>
            </span>
            <span>• {item.incidentDate}</span>
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                {item.status !== "RESOLVED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={handleResolve}
                    disabled={loadingAction}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Mark Resolved
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditOpen(true)}
                  disabled={loadingAction}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={handleDelete}
                  disabled={loadingAction}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-medium"
                onClick={handleContact}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Contact / Claim
              </Button>
            )}
          </div>
        </div>
      </div>

      {isOwner && (
        <LostFoundDialog
          item={item}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={onUpdated}
        />
      )}
    </>
  );
}
