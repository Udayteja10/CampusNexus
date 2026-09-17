"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
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
  Hourglass,
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
import { InternshipOpportunity, OpportunityStatus } from "@/types/career.types";
import { careerService } from "@/services/career";
import { InternshipFormDialog } from "@/components/career/InternshipFormDialog";
import { OpportunityStatusBadge } from "@/components/career/OpportunityStatusBadge";

export default function AdminInternshipsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState<InternshipOpportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create / Edit modal state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<InternshipOpportunity | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState<InternshipOpportunity | null>(null);

  useEffect(() => {
    // Role guard check
    if (user && user.role !== "ADMIN") {
      toast.error("Access denied. Admin permissions required.");
      router.push(ROUTES.CAREER);
      return;
    }
    loadInternships();
  }, [user, router]);

  async function loadInternships() {
    setLoading(true);
    try {
      const data = await careerService.getInternships({ includeDrafts: true });
      setInternships(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateNew = () => {
    setSelectedInternship(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (i: InternshipOpportunity) => {
    setSelectedInternship(i);
    setFormDialogOpen(true);
  };

  const handleTogglePublish = async (i: InternshipOpportunity) => {
    try {
      if (i.status === "PUBLISHED") {
        await careerService.unpublishInternship(i.id);
        toast.success("Internship unpublished (saved as draft)");
      } else {
        await careerService.publishInternship(i.id);
        toast.success("Internship published across campus");
      }
      await loadInternships();
    } catch (err: any) {
      toast.error(err.message || "Failed to update internship status");
    }
  };

  const handleClose = async (i: InternshipOpportunity) => {
    try {
      await careerService.closeInternship(i.id);
      toast.success("Internship marked as closed");
      await loadInternships();
    } catch (err: any) {
      toast.error(err.message || "Failed to close internship");
    }
  };

  const handleDelete = async () => {
    if (!internshipToDelete) return;
    try {
      await careerService.deleteInternship(internshipToDelete.id);
      toast.success("Internship deleted successfully");
      setDeleteDialogOpen(false);
      setInternshipToDelete(null);
      await loadInternships();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete internship");
    }
  };

  const filteredInternships = useMemo(() => {
    return internships.filter((i) => {
      const matchesSearch =
        !searchQuery ||
        i.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || i.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [internships, searchQuery, statusFilter]);

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
            <Badge variant="secondary">Internship Management</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2.5">
            <GraduationCap className="h-8 w-8 text-primary" />
            Internship Openings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, publish, and manage summer internships and industrial training programs across campus
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={ROUTES.CAREER_INTERNSHIPS} className={buttonVariants({ variant: "outline" })}>
            <Eye className="h-4 w-4 mr-2" />
            View Student Portal
          </Link>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Internship
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
                placeholder="Search internships by company, role, or location..."
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
      ) : filteredInternships.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center space-y-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No internships found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No internship postings match your filter criteria."
                : "No internship openings have been created yet."}
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Internship
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInternships.map((i) => {
            return (
              <Card key={i.id} className="border-border hover:shadow-sm transition-shadow">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Role Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-foreground truncate">
                        {i.role}
                      </span>
                      <OpportunityStatusBadge status={i.status} />
                      <Badge variant="outline" className="text-xs">
                        {i.stipendDetails || `₹${i.stipendMonthly.toLocaleString("en-IN")}/mo`}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {i.durationMonths} months
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {i.companyName}
                      <span className="text-muted-foreground/60">•</span>
                      <MapPin className="h-3.5 w-3.5" />
                      {i.location} ({i.workMode})
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>
                        Depts:{" "}
                        <strong className="text-foreground">
                          {i.eligibility.eligibleDepartments.includes("all")
                            ? "All"
                            : i.eligibility.eligibleDepartments.map((d) => d.toUpperCase()).join(", ")}
                        </strong>
                      </span>
                      <span>
                        Min CGPA:{" "}
                        <strong className="text-foreground">
                          {i.eligibility.minCgpa && i.eligibility.minCgpa > 0 ? i.eligibility.minCgpa : "None"}
                        </strong>
                      </span>
                      {i.applicationDeadline && (
                        <span>
                          Deadline:{" "}
                          <strong className="text-foreground">
                            {new Date(i.applicationDeadline).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </strong>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <Users className="h-3.5 w-3.5" />
                        {i.applicantsCount || 0} Applicants
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {i.status === "DRAFT" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        onClick={() => handleTogglePublish(i)}
                      >
                        Publish
                      </Button>
                    ) : i.status === "PUBLISHED" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(i)}
                        >
                          Unpublish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          onClick={() => handleClose(i)}
                        >
                          Close
                        </Button>
                      </>
                    ) : null}

                    <Button variant="outline" size="sm" onClick={() => handleEdit(i)}>
                      <Edit2 className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setInternshipToDelete(i);
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
      <InternshipFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        internship={selectedInternship}
        onSuccess={() => loadInternships()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Internship Opening?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the internship opening for{" "}
              <strong>{internshipToDelete?.role}</strong> at{" "}
              <strong>{internshipToDelete?.companyName}</strong>? This action cannot be undone.
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
