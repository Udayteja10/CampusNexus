"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Folder,
  Briefcase,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { SmartCollection } from "@/types/career.types";
import { careerService } from "@/services/career";

export default function SmartCollectionsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<SmartCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<SmartCollection | null>(null);

  // Create/Rename dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<SmartCollection | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    setLoading(true);
    try {
      const data = await careerService.getCollections();
      setCollections(data);
      if (data.length > 0) {
        setSelectedCollection((prev) => {
          if (prev) {
            const found = data.find((c) => c.id === prev.id);
            return found || data[0];
          }
          return data[0];
        });
      } else {
        setSelectedCollection(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormName("");
    setFormDesc("");
    setEditDialogOpen(true);
  };

  const handleOpenEdit = (col: SmartCollection) => {
    setIsEditing(true);
    setFormName(col.name);
    setFormDesc(col.description || "");
    setEditDialogOpen(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please provide a collection name");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && selectedCollection) {
        await careerService.updateCollection(selectedCollection.id, {
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });
        toast.success("Collection updated");
      } else {
        const newCol = await careerService.createCollection({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
        });
        toast.success("Collection created");
        setSelectedCollection(newCol);
      }
      setEditDialogOpen(false);
      await loadCollections();
    } catch (err: any) {
      toast.error(err.message || "Failed to save collection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;
    try {
      await careerService.deleteCollection(collectionToDelete.id);
      toast.success("Collection deleted");
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
      await loadCollections();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete collection");
    }
  };

  const handleRemoveItem = async (collectionId: string, opportunityId: string) => {
    try {
      await careerService.removeOpportunityFromCollection(collectionId, opportunityId);
      toast.success("Removed opportunity from collection");
      await loadCollections();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove opportunity");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Layers className="h-8 w-8 text-primary" />
            Smart Collections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize career opportunities across departments into custom folders, target lists, and bookmarks
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 md:col-span-2 rounded-xl" />
        </div>
      ) : collections.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center space-y-4">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No Smart Collections yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Create collections like &quot;Dream Companies&quot;, &quot;Backend Roles&quot;, or &quot;Summer Internships&quot;
              to organize opportunities from across campus.
            </p>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Collections Folders List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Your Collections ({collections.length})
            </h3>
            {collections.map((col) => {
              const isSelected = selectedCollection?.id === col.id;
              return (
                <Card
                  key={col.id}
                  onClick={() => setSelectedCollection(col)}
                  className={`cursor-pointer transition-all border-border ${
                    isSelected
                      ? "ring-2 ring-primary bg-muted/40 shadow-sm"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1 truncate pr-2">
                      <div className="flex items-center gap-2">
                        <Folder
                          className={`h-4 w-4 shrink-0 ${
                            isSelected ? "text-primary fill-primary/20" : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-bold truncate">{col.name}</span>
                      </div>
                      {col.description && (
                        <p className="text-xs text-muted-foreground truncate">{col.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {col.items.length} {col.items.length === 1 ? "item" : "items"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right Column: Selected Collection Details & Items */}
          <div className="md:col-span-2 space-y-6">
            {selectedCollection ? (
              <>
                {/* Collection Header */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <Folder className="h-6 w-6 text-primary fill-primary/20" />
                          {selectedCollection.name}
                        </h2>
                        {selectedCollection.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedCollection.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created on{" "}
                          {new Date(selectedCollection.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(selectedCollection)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setCollectionToDelete(selectedCollection);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items List */}
                {selectedCollection.items.length === 0 ? (
                  <Card className="border-border border-dashed">
                    <CardContent className="p-8 text-center space-y-3">
                      <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm font-medium">This collection is empty</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Browse Placements or Internships across campus and click &quot;Save to Collection&quot; to add them here.
                      </p>
                      <div className="flex justify-center gap-2 pt-2">
                        <Link href={ROUTES.CAREER_PLACEMENTS} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Browse Placements
                        </Link>
                        <Link href={ROUTES.CAREER_INTERNSHIPS} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Browse Internships
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedCollection.items.map((item) => {
                      const detailUrl =
                        item.opportunityType === "PLACEMENT"
                          ? `${ROUTES.CAREER_PLACEMENTS}/${item.opportunityId}`
                          : `${ROUTES.CAREER_INTERNSHIPS}/${item.opportunityId}`;

                      return (
                        <Card key={item.opportunityId} className="border-border hover:shadow-sm">
                          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={detailUrl}
                                  className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                                >
                                  {item.role}
                                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                                  {item.opportunityType}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {item.companyName}
                                <span className="text-muted-foreground/60">•</span>
                                <span>{item.compensationDisplay}</span>
                              </p>
                              {item.note && (
                                <p className="text-xs italic text-primary/80 pt-0.5">
                                  &quot;{item.note}&quot;
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <Link href={detailUrl} className={buttonVariants({ variant: "outline", size: "sm" })}>
                                View
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  handleRemoveItem(selectedCollection.id, item.opportunityId)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Rename Collection" : "Create Smart Collection"}</DialogTitle>
            <DialogDescription>
              Organize your career journey with custom lists and tags
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCollection} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Collection Name *
              </label>
              <Input
                placeholder="e.g. Backend Engineering Roles"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Description (Optional)
              </label>
              <Input
                placeholder="e.g. Roles targeting 10+ LPA with Java/Go requirements"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Collection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the collection &quot;{collectionToDelete?.name}&quot;? The
              saved opportunities inside will not be deleted from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
