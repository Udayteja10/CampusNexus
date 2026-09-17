"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus, Plus, Check } from "lucide-react";
import { CareerOpportunity, SmartCollection } from "@/types/career.types";
import { careerService } from "@/services/career";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface SaveToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: CareerOpportunity;
  onSuccess?: () => void;
}

export function SaveToCollectionDialog({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: SaveToCollectionDialogProps) {
  const [collections, setCollections] = useState<SmartCollection[]>([]);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inline creation
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (open) {
      setLoading(true);
      careerService.getCollections().then((list) => {
        if (!isMounted) return;
        setCollections(list);
        if (list.length > 0) {
          setSelectedColId((curr) => curr || list[0].id);
        }
        setIsCreatingNew(false);
        setNewColName("");
        setNewColDesc("");
        setNote("");
      }).finally(() => {
        if (isMounted) setLoading(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleCreateAndSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) {
      toast.error("Please provide a collection name.");
      return;
    }
    setSaving(true);
    try {
      const created = await careerService.createCollection({
        name: newColName.trim(),
        description: newColDesc.trim() || undefined,
      });
      setCollections((prev) => [created, ...prev]);
      setSelectedColId(created.id);
      setIsCreatingNew(false);
      toast.success(`Created collection "${created.name}".`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create collection.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToCollection = async () => {
    if (!selectedColId) {
      toast.error("Please select a collection.");
      return;
    }

    setSaving(true);
    try {
      await careerService.addOpportunityToCollection(
        selectedColId,
        opportunity.id,
        opportunity.type,
        note.trim() || undefined
      );

      const targetCol = collections.find((c) => c.id === selectedColId);
      toast.success(
        `Added ${opportunity.companyName} to collection "${targetCol?.name || "Smart Collection"}".`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add opportunity to collection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            <span>Save to Smart Collection</span>
          </DialogTitle>
          <DialogDescription>
            Organize &ldquo;{opportunity.companyName} — {opportunity.role}&rdquo; into your custom career lists.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isCreatingNew ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">Select Destination Collection</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingNew(true)}
                  className="h-7 text-xs text-primary gap-1 px-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New List</span>
                </Button>
              </div>

              {loading ? (
                <div className="space-y-2 py-4 text-center text-xs text-muted-foreground">
                  Loading collections...
                </div>
              ) : collections.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">You don&apos;t have any collections yet.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreatingNew(true)}
                    className="text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Your First Collection</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                  {collections.map((col) => {
                    const isSelected = selectedColId === col.id;
                    const alreadyContains = col.items.some((i) => i.opportunityId === opportunity.id);

                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedColId(col.id)}
                        disabled={alreadyContains}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-semibold"
                            : alreadyContains
                            ? "bg-muted/40 opacity-60 border-border text-muted-foreground cursor-not-allowed"
                            : "bg-card border-border hover:border-primary/40 text-foreground"
                        )}
                      >
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">{col.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {col.items.length} {col.items.length === 1 ? "opportunity" : "opportunities"}
                            {alreadyContains && " • Already saved"}
                          </p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Optional personal note */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="col-note" className="text-xs font-semibold">
                  Personal Note (Optional)
                </Label>
                <Input
                  id="col-note"
                  placeholder="e.g. Prepare system design & dynamic programming"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          ) : (
            /* Inline create collection form */
            <form onSubmit={handleCreateAndSelect} className="space-y-3 p-3 rounded-xl border border-primary/30 bg-primary/[0.02]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Create New Collection</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingNew(false)}
                  className="h-6 text-xs text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="new-col-name" className="text-xs">Collection Name *</Label>
                <Input
                  id="new-col-name"
                  placeholder="e.g. High Package Targets, Summer 2025"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="new-col-desc" className="text-xs">Description (Optional)</Label>
                <Input
                  id="new-col-desc"
                  placeholder="e.g. Primary companies to focus on for placement season"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <Button type="submit" size="sm" disabled={saving || !newColName.trim()} className="w-full text-xs h-8">
                {saving ? "Creating..." : "Create & Select Collection"}
              </Button>
            </form>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveToCollection}
            disabled={saving || !selectedColId || isCreatingNew}
          >
            {saving ? "Saving..." : "Save to Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
