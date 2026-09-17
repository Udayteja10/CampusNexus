"use client";

import React, { useState } from "react";
import {
  LostFoundItem,
  LostFoundType,
  LostFoundCategory,
} from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LostFoundDialogProps {
  item?: LostFoundItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (item: LostFoundItem) => void;
}

export function LostFoundDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: LostFoundDialogProps) {
  const user = useAuthStore((s) => s.user);
  const isEditing = Boolean(item);

  const [type, setType] = useState<LostFoundType>(item?.type ?? "LOST");
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [category, setCategory] = useState<LostFoundCategory>(item?.category ?? "ELECTRONICS");
  const [location, setLocation] = useState(item?.location ?? "");
  const [incidentDate, setIncidentDate] = useState(
    item?.incidentDate ?? new Date().toISOString().split("T")[0]
  );
  const [contactName] = useState(item?.contactName ?? (user?.fullName || ""));
  const [contactNote, setContactNote] = useState(
    item?.contactNote ?? "Handed over to Room 204 or contact via CampusNexus in-app message"
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && item) {
        const updated = await campusLifeService.updateLostFoundItem(item.id, {
          type,
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          incidentDate,
          contactName: contactName.trim(),
          contactNote: contactNote.trim(),
        });
        toast.success("Lost & Found report updated!");
        onSuccess?.(updated);
      } else {
        const created = await campusLifeService.createLostFoundItem({
          type,
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          incidentDate,
          status: "OPEN",
          contactName: contactName.trim() || "Student",
          contactNote: contactNote.trim() || "Contact via in-app message",
        });
        toast.success("Lost & Found report posted!");
        onSuccess?.(created);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save Lost & Found report";
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
            {isEditing ? "Edit Report" : "Report Lost or Found Item"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Help campus students recover lost belongings with safe, controlled contact points.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Item Type (Lost vs Found) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Report Type *</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as LostFoundType)}
              className="flex items-center gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LOST" id="type-lost" />
                <Label htmlFor="type-lost" className="text-xs font-medium cursor-pointer">
                  I Lost an Item
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FOUND" id="type-found" />
                <Label htmlFor="type-found" className="text-xs font-medium cursor-pointer">
                  I Found an Item
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="lf-title" className="text-xs font-semibold">
              Item Title *
            </Label>
            <Input
              id="lf-title"
              placeholder="e.g. Blue Dell Laptop Charger found in Library"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Category & Incident Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as LostFoundCategory)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELECTRONICS">Electronics & Gadgets</SelectItem>
                  <SelectItem value="ID_CARD">ID Cards & Documents</SelectItem>
                  <SelectItem value="BOOKS_DOCS">Books & Notebooks</SelectItem>
                  <SelectItem value="KEYS">Keys & Keychains</SelectItem>
                  <SelectItem value="BAGS_WALLETS">Bags & Wallets</SelectItem>
                  <SelectItem value="ACCESSORIES">Clothing & Accessories</SelectItem>
                  <SelectItem value="OTHER">Other Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="lf-date" className="text-xs font-semibold">
                Date Lost / Found *
              </Label>
              <Input
                id="lf-date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <Label htmlFor="lf-location" className="text-xs font-semibold">
              Campus Location *
            </Label>
            <Input
              id="lf-location"
              placeholder="e.g. Central Library 2nd Floor Reading Room"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="lf-desc" className="text-xs font-semibold">
              Detailed Description *
            </Label>
            <Textarea
              id="lf-desc"
              placeholder="Describe color, brand, unique identifiers, markings (avoid sensitive private passwords/codes)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Safe Contact Note */}
          <div className="space-y-1">
            <Label htmlFor="lf-contact-note" className="text-xs font-semibold">
              Safe Recovery / Contact Instructions *
            </Label>
            <Input
              id="lf-contact-note"
              placeholder="e.g. Deposited with CCF Lab Assistant or message me on CampusNexus"
              value={contactNote}
              onChange={(e) => setContactNote(e.target.value)}
              className="h-9 text-xs"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Note: Never post raw personal phone numbers or passwords.
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
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Post Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
