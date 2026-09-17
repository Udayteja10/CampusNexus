"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  Calendar,
  MapPin,
  IndianRupee,
  Edit2,
  Trash2,
  Eye,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PlacementOpportunity, OpportunityStatus } from "@/types/career.types";
import { careerService } from "@/services/career";
import { PlacementFormDialog } from "@/components/career/PlacementFormDialog";
import { OpportunityStatusBadge } from "@/components/career/OpportunityStatusBadge";

export default function AdminPlacementsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState<PlacementOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create / Edit modal state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementOpportunity | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [placementToDelete, setPlacementToDelete] = useState<PlacementOpportunity | null>(null);

  useEffect(() => {
    // Role guard check
    if (user && user.role !== "ADMIN") {
      toast.error("Access denied. Admin permissions required.");
      router.push(ROUTES.CAREER);
      return;
    }
    loadPlacements();
  }, [user, router]);

  async function loadPlacements() {
    setLoading(true);
    try {
      const data = await careerService.getPlacements({ includeDrafts: true });
      setPlacements(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load placements");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateNew = () => {
    setSelectedPlacement(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (p: PlacementOpportunity) => {
    setSelectedPlacement(p);
    setFormDialogOpen(true);
  };

  const handleTogglePublish = async (p: PlacementOpportunity) => {
    try {
      if (p.status === "PUBLISHED") {
        await careerService.unpublishPlacement(p.id);
        toast.success("Placement unpublished (saved as draft)");
      } else {
        await careerService.publishPlacement(p.id);
        toast.success("Placement published across campus");
      }
      await loadPlacements();
    } catch (err: any) {
      toast.error(err.message || "Failed to update placement status");
    }
  };

  const handleClose = async (p: PlacementOpportunity) => {
    try {
      await careerService.closePlacement(p.id);
      toast.success("Placement marked as closed");
      await loadPlacements();
    } catch (err: any) {
      toast.error(err.message || "Failed to close placement");
    }
  };

  const handleDelete = async () => {
    if (!placementToDelete) return;
    try {
      await careerService.deletePlacement(placementToDelete.id);
      toast.success("Placement deleted successfully");
      setDeleteDialogOpen(false);
      setPlacementToDelete(null);
      await loadPlacements();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete placement");
    }
  };

  const filteredPlacements = useMemo(() => {
    return placements.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [placements, searchQuery, statusFilter]);

  if (user && user.role !== "ADMIN") {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Admin Authorization Required</h2>
        <p className="text-muted-foreground">
          You must be signed in with an Administrator account to manage career openings.
        </p>
        <Link href={ROUTES.CAREER} className={buttonVariants({ variant: "default" })}>
          Return to Career Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Admin Console
            </Badge>
            <Badge variant="secondary">Placement Management</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2.5">
            <Briefcase className="h-8 w-8 text-primary" />
            Placement Openings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, publish, and manage full-time recruitment drives across campus departments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={ROUTES.CAREER_PLACEMENTS} className={buttonVariants({ variant: "outline" })}>
            <Eye className="h-4 w-4 mr-2" />
            View Student Portal
          </Link>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Placement
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="relative sm:col-span-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search placements by company, role, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="sm:col-span-4">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table / List View */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredPlacements.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center space-y-4">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No placements found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No placement drives match your filter criteria."
                : "No placement openings have been created yet."}
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Placement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPlacements.map((p) => {
            return (
              <Card key={p.id} className="border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Role Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-foreground truncate">
                        {p.role}
                      </span>
                      <OpportunityStatusBadge status={p.status} />
                      <Badge variant="outline" className="text-xs">
                        {p.packageDetails || `₹${p.packageLpa} LPA`}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {p.companyName}
                      <span className="text-muted-foreground/60">•</span>
                      <MapPin className="h-3.5 w-3.5" />
                      {p.location} ({p.workMode})
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>
                        Depts:{" "}
                        <strong className="text-foreground">
                          {p.eligibility.eligibleDepartments.includes("all")
                            ? "All"
                            : p.eligibility.eligibleDepartments.map((d) => d.toUpperCase()).join(", ")}
                        </strong>
                      </span>
                      <span>
                        Min CGPA:{" "}
                        <strong className="text-foreground">
                          {p.eligibility.minCgpa && p.eligibility.minCgpa > 0 ? p.eligibility.minCgpa : "None"}
                        </strong>
                      </span>
                      {p.applicationDeadline && (
                        <span>
                          Deadline:{" "}
                          <strong className="text-foreground">
                            {new Date(p.applicationDeadline).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <Users className="h-3.5 w-3.5" />
                        {p.applicantsCount || 0} Applicants
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {p.status === "DRAFT" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        onClick={() => handleTogglePublish(p)}
                      >
                        Publish
                      </Button>
                    ) : p.status === "PUBLISHED" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(p)}
                        >
                          Unpublish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          onClick={() => handleClose(p)}
                        >
                          Close
                        </Button>
                      </>
                    ) : null}

                    <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setPlacementToDelete(p);
                        setDeleteDialogOpen(true);
                      }}
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

      {/* Create / Edit Form Dialog */}
      <PlacementFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        placement={selectedPlacement}
        onSuccess={() => loadPlacements()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Placement Opening?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the placement opening for{" "}
              <strong>{placementToDelete?.role}</strong> at{" "}
              <strong>{placementToDelete?.companyName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
