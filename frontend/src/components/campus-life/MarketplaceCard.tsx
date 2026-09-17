"use client";

import React, { useState } from "react";
import {
  User,
  CheckCircle2,
  Trash2,
  Edit2,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import { MarketplaceListing } from "@/types/campus-life.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { campusLifeService } from "@/services/campus-life";
import { toast } from "@/lib/toast";
import { MarketplaceDialog } from "./MarketplaceDialog";
import { cn } from "@/lib/utils";

interface MarketplaceCardProps {
  listing: MarketplaceListing;
  onUpdated?: () => void;
  onDeleted?: () => void;
  className?: string;
}

const CONDITION_COLORS: Record<string, string> = {
  NEW: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  LIKE_NEW: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  GOOD: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  FAIR: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export function MarketplaceCard({
  listing,
  onUpdated,
  onDeleted,
  className,
}: MarketplaceCardProps) {
  const user = useAuthStore((s) => s.user);
  const isOwner = Boolean(user && (user.id === listing.sellerId || user.role === "ADMIN"));

  const [editOpen, setEditOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleMarkSold = async () => {
    setLoadingAction(true);
    try {
      await campusLifeService.markListingSold(listing.id);
      toast.success("Listing marked as SOLD!");
      onUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update listing";
      toast.error(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setLoadingAction(true);
    try {
      await campusLifeService.deleteMarketplaceListing(listing.id);
      toast.success("Listing deleted.");
      onDeleted?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete listing";
      toast.error(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleContactSeller = () => {
    toast.info(listing.sellerContactNote || "Please use in-app messages to contact the seller.");
  };

  const isSold = listing.status === "SOLD";

  return (
    <>
      <div
        className={cn(
          "flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30",
          isSold && "opacity-75 bg-muted/20",
          className
        )}
      >
        <div className="space-y-3">
          {/* Top Badges & Price */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-semibold">
                {listing.category}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-[10px] font-semibold", CONDITION_COLORS[listing.condition])}
              >
                {listing.condition.replace("_", " ")}
              </Badge>
            </div>

            {isSold ? (
              <Badge className="bg-muted text-muted-foreground text-[10px] font-bold">
                SOLD
              </Badge>
            ) : (
              <div className="flex items-baseline gap-0.5 text-base font-extrabold text-foreground">
                <span className="text-xs text-primary font-bold">₹</span>
                <span>{listing.price.toLocaleString("en-IN")}</span>
                {listing.isNegotiable && (
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">(Nego)</span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground line-clamp-1">
              {listing.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
            {listing.description}
          </p>

          {/* Safe Exchange Note */}
          <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1 mb-0.5">
              <ShoppingBag className="h-3 w-3 text-primary" />
              Meeting / Collection:
            </span>
            <p className="line-clamp-2 text-[11px]">{listing.sellerContactNote}</p>
          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="mt-4 pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span>
              Seller: <strong className="text-foreground">{listing.sellerName}</strong>
            </span>
            {listing.sellerDepartment && (
              <span className="text-[11px]">({listing.sellerDepartment.split(" ")[0]})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                {!isSold && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={handleMarkSold}
                    disabled={loadingAction}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Mark Sold
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
                variant={isSold ? "outline" : "default"}
                className="h-8 text-xs font-medium"
                onClick={handleContactSeller}
                disabled={isSold}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                {isSold ? "Item Sold" : "Contact Seller"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isOwner && (
        <MarketplaceDialog
          listing={listing}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={onUpdated}
        />
      )}
    </>
  );
}
