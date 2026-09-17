"use client";

import React, { useState } from "react";
import {
  MarketplaceListing,
  MarketplaceCategory,
  MarketplaceCondition,
} from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarketplaceDialogProps {
  listing?: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (listing: MarketplaceListing) => void;
}

export function MarketplaceDialog({
  listing,
  open,
  onOpenChange,
  onSuccess,
}: MarketplaceDialogProps) {
  const isEditing = Boolean(listing);

  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [category, setCategory] = useState<MarketplaceCategory>(listing?.category ?? "TEXTBOOKS");
  const [price, setPrice] = useState<number>(listing?.price ?? 500);
  const [isNegotiable, setIsNegotiable] = useState(listing?.isNegotiable ?? true);
  const [condition, setCondition] = useState<MarketplaceCondition>(listing?.condition ?? "GOOD");
  const [sellerContactNote, setSellerContactNote] = useState(
    listing?.sellerContactNote ?? "Contact via in-app message or meet at Central Library"
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (price < 0) {
      toast.error("Price cannot be negative.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && listing) {
        const updated = await campusLifeService.updateMarketplaceListing(listing.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          price: Number(price),
          isNegotiable,
          condition,
          sellerContactNote: sellerContactNote.trim(),
        });
        toast.success("Listing updated successfully!");
        onSuccess?.(updated);
      } else {
        const created = await campusLifeService.createMarketplaceListing({
          title: title.trim(),
          description: description.trim(),
          category,
          price: Number(price),
          isNegotiable,
          condition,
          status: "AVAILABLE",
          sellerContactNote: sellerContactNote.trim() || "Contact via in-app message",
        });
        toast.success("Listing created successfully!");
        onSuccess?.(created);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save marketplace listing";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing ? "Edit Marketplace Listing" : "Create Marketplace Listing"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sell or buy textbooks, calculators, stationery, and student essentials directly with campus peers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="mkt-title" className="text-xs font-semibold">
              Item Title *
            </Label>
            <Input
              id="mkt-title"
              placeholder="e.g. Casio fx-991EX Scientific Calculator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as MarketplaceCategory)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXTBOOKS">Textbooks & Books</SelectItem>
                  <SelectItem value="ELECTRONICS">Electronics & Gadgets</SelectItem>
                  <SelectItem value="CALCULATORS">Calculators</SelectItem>
                  <SelectItem value="DRAWING_TOOLS">Engineering Drawing Tools</SelectItem>
                  <SelectItem value="BICYCLES">Bicycles</SelectItem>
                  <SelectItem value="ROOM_ESSENTIALS">Room & Hostel Essentials</SelectItem>
                  <SelectItem value="NOTES_STUDY_MATERIAL">Study Notes & Material</SelectItem>
                  <SelectItem value="OTHER">Other Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Condition *</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as MarketplaceCondition)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Brand New</SelectItem>
                  <SelectItem value="LIKE_NEW">Like New</SelectItem>
                  <SelectItem value="GOOD">Good Condition</SelectItem>
                  <SelectItem value="FAIR">Fair / Functional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price & Negotiable */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1">
              <Label htmlFor="mkt-price" className="text-xs font-semibold">
                Price (₹) *
              </Label>
              <Input
                id="mkt-price"
                type="number"
                min="0"
                step="10"
                placeholder="₹ Amount"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pb-2">
              <Checkbox
                id="mkt-neg"
                checked={isNegotiable}
                onCheckedChange={(c) => setIsNegotiable(Boolean(c))}
              />
              <Label htmlFor="mkt-neg" className="text-xs font-medium cursor-pointer">
                Price is Negotiable
              </Label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="mkt-desc" className="text-xs font-semibold">
              Item Details / Description *
            </Label>
            <Textarea
              id="mkt-desc"
              placeholder="State edition, semester used, defects (if any), accessories included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Safe Contact Note */}
          <div className="space-y-1">
            <Label htmlFor="mkt-contact" className="text-xs font-semibold">
              Exchange / Meeting Instructions *
            </Label>
            <Input
              id="mkt-contact"
              placeholder="e.g. Meet at SAC Courtyard or message me on CampusNexus"
              value={sellerContactNote}
              onChange={(e) => setSellerContactNote(e.target.value)}
              className="h-9 text-xs"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Note: Transactions are settled in-person on campus. No external payment links.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Post Listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
