"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building,
  Plus,
  Search,
  Users,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit2,
  UserCheck,
  UserX,
  History,
  ExternalLink,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Mail,
  Calendar,
  Layers,
  Award,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { adminClubsApi, clubsApi, ClubRequest } from "@/lib/campusLifeApi";
import { adminApi, AdminUserDto } from "@/lib/api";
import type { Club, ClubCategory, ClubPresident, PresidentCandidate } from "@/types/campusLife.types";
import { useAuthStore, selectIsAdmin } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";

const CLUB_CATEGORIES: { id: ClubCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "TECHNICAL", label: "Technical" },
  { id: "CULTURAL", label: "Cultural" },
  { id: "SPORTS", label: "Sports" },
  { id: "LITERARY", label: "Literary" },
  { id: "SOCIAL", label: "Social" },
  { id: "ACADEMIC", label: "Academic" },
  { id: "OTHER", label: "Other" },
];

export default function AdminClubsPage() {
  const isAdmin = useAuthStore(selectIsAdmin);
  const currentUser = useAuthStore((s) => s.user);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ClubCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClubRequest>({
    name: "",
    slug: "",
    category: "TECHNICAL",
    description: "",
    contactEmail: "",
    logoUrl: "",
    coverUrl: "",
    status: "ACTIVE",
  });
  const [createSaving, setCreateSaving] = useState(false);

  // Edit Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [editForm, setEditForm] = useState<ClubRequest>({
    name: "",
    slug: "",
    category: "TECHNICAL",
    description: "",
    contactEmail: "",
    logoUrl: "",
    coverUrl: "",
    status: "ACTIVE",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Status Dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [clubForStatus, setClubForStatus] = useState<Club | null>(null);
  const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "INACTIVE">("INACTIVE");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // President Management Modal
  const [presidentModalOpen, setPresidentModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [presidentHistory, setPresidentHistory] = useState<ClubPresident[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState<PresidentCandidate[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PresidentCandidate | null>(null);
  const [designation, setDesignation] = useState("PRESIDENT");
  const [presidentSaving, setPresidentSaving] = useState(false);
  const [presidentTab, setPresidentTab] = useState<"assign" | "history">("assign");

  const loadClubs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminClubsApi.getAllClubs({
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        keyword: searchQuery.trim() || undefined,
      });
      setClubs(data);
    } catch (err: any) {
      console.error("Failed to load admin clubs:", err);
      toast.error(err.response?.data?.message || "Failed to load clubs.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  // Debounced student search using eligible president candidates endpoint
  useEffect(() => {
    if (!presidentModalOpen) return;
    const timer = setTimeout(async () => {
      setSearchingStudents(true);
      try {
        const res = await adminClubsApi.getPresidentCandidates(studentSearch.trim() || undefined);
        setStudentResults(res);
      } catch (err) {
        console.error("Failed searching president candidates:", err);
      } finally {
        setSearchingStudents(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearch, presidentModalOpen]);

  // Handle Slug Auto Generation in Create
  const handleNameChangeInCreate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setCreateForm((prev) => ({
      ...prev,
      name: val,
      slug: autoSlug,
    }));
  };

  const handleCreateClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.slug.trim()) {
      toast.error("Club name and slug are required.");
      return;
    }

    setCreateSaving(true);
    try {
      await adminClubsApi.createClub({
        ...createForm,
        name: createForm.name.trim(),
        slug: createForm.slug.trim().toLowerCase(),
        description: createForm.description?.trim() || undefined,
        contactEmail: createForm.contactEmail?.trim() || undefined,
        logoUrl: createForm.logoUrl?.trim() || undefined,
        coverUrl: createForm.coverUrl?.trim() || undefined,
      });
      toast.success("Club created successfully!");
      setCreateOpen(false);
      setCreateForm({
        name: "",
        slug: "",
        category: "TECHNICAL",
        description: "",
        contactEmail: "",
        logoUrl: "",
        coverUrl: "",
        status: "ACTIVE",
      });
      loadClubs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create club.");
    } finally {
      setCreateSaving(false);
    }
  };

  const handleOpenEdit = (club: Club) => {
    setEditingClub(club);
    setEditForm({
      name: club.name,
      slug: club.slug,
      category: club.category,
      description: club.description || "",
      contactEmail: club.contactEmail || "",
      logoUrl: club.logoUrl || "",
      coverUrl: club.coverUrl || "",
      status: club.status,
    });
    setEditOpen(true);
  };

  const handleEditClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    if (!editForm.name.trim() || !editForm.slug.trim()) {
      toast.error("Club name and slug are required.");
      return;
    }

    setEditSaving(true);
    try {
      await adminClubsApi.updateClub(editingClub.id, {
        ...editForm,
        name: editForm.name.trim(),
        slug: editForm.slug.trim().toLowerCase(),
        description: editForm.description?.trim() || undefined,
        contactEmail: editForm.contactEmail?.trim() || undefined,
        logoUrl: editForm.logoUrl?.trim() || undefined,
        coverUrl: editForm.coverUrl?.trim() || undefined,
      });
      toast.success("Club updated successfully!");
      setEditOpen(false);
      setEditingClub(null);
      loadClubs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update club.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleOpenStatusDialog = (club: Club, newStatus: "ACTIVE" | "INACTIVE") => {
    setClubForStatus(club);
    setTargetStatus(newStatus);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!clubForStatus) return;
    setStatusUpdating(true);
    try {
      await adminClubsApi.updateClubStatus(clubForStatus.id, targetStatus);
      toast.success(
        targetStatus === "ACTIVE"
          ? `Restored ${clubForStatus.name} successfully!`
          : `Deactivated ${clubForStatus.name} successfully!`
      );
      setStatusDialogOpen(false);
      setClubForStatus(null);
      loadClubs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update club status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleOpenPresidentModal = async (club: Club) => {
    setSelectedClub(club);
    setSelectedStudent(null);
    setStudentSearch("");
    setDesignation("PRESIDENT");
    setPresidentTab("assign");
    setPresidentModalOpen(true);

    try {
      const history = await adminClubsApi.getClubPresidentHistory(club.id);
      setPresidentHistory(history);
    } catch (err) {
      console.error("Failed to load president history:", err);
    }
  };

  const handleAssignPresident = async () => {
    if (!selectedClub || !selectedStudent) {
      toast.error("Please select a student to assign as president.");
      return;
    }

    setPresidentSaving(true);
    try {
      await adminClubsApi.assignClubPresident(selectedClub.id, {
        userId: selectedStudent.id,
        designation: designation.trim() || "PRESIDENT",
      });
      toast.success(`Assigned ${selectedStudent.fullName} as President of ${selectedClub.name}!`);
      setPresidentModalOpen(false);
      setSelectedClub(null);
      setSelectedStudent(null);
      loadClubs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to assign club president.");
    } finally {
      setPresidentSaving(false);
    }
  };

  const handleRemovePresident = async () => {
    if (!selectedClub) return;
    setPresidentSaving(true);
    try {
      await adminClubsApi.removeClubPresident(selectedClub.id);
      toast.success(`Removed president from ${selectedClub.name}.`);
      setPresidentModalOpen(false);
      setSelectedClub(null);
      loadClubs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove president.");
    } finally {
      setPresidentSaving(false);
    }
  };

  // Metrics
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter((c) => c.status === "ACTIVE").length;
  const inactiveClubs = clubs.filter((c) => c.status === "INACTIVE").length;
  const clubsWithPresident = clubs.filter((c) => c.currentPresident != null).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Club Management
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Admin Exclusive
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and assign student leadership for institutional campus clubs and societies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadClubs()}
            className="rounded-xl gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="rounded-xl gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Club
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Clubs</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{totalClubs}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Campus registered</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Clubs</p>
              <p className="text-2xl font-bold mt-1 text-emerald-500">{activeClubs}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Visible to students</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactive Clubs</p>
              <p className="text-2xl font-bold mt-1 text-amber-500">{inactiveClubs}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Deactivated / Hidden</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Presidents Assigned</p>
              <p className="text-2xl font-bold mt-1 text-purple-500">{clubsWithPresident}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Student leadership</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Crown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by club name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm bg-background/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val) => setCategoryFilter(val as ClubCategory | "ALL")}
          >
            <SelectTrigger className="w-[160px] h-10 text-xs bg-background/80">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as "ALL" | "ACTIVE" | "INACTIVE")}
          >
            <SelectTrigger className="w-[140px] h-10 text-xs bg-background/80">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="ACTIVE" className="text-xs">Active Only</SelectItem>
              <SelectItem value="INACTIVE" className="text-xs">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clubs Table */}
      <Card className="border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Club Name & Slug</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Assigned President</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Contact Email</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <Skeleton className="h-8 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : clubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Building className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">No clubs found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or create a new club.</p>
                  </td>
                </tr>
              ) : (
                clubs.map((club) => {
                  const pres = club.currentPresident;
                  const isActive = club.status === "ACTIVE";

                  return (
                    <tr key={club.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {club.logoUrl ? (
                            <img
                              src={club.logoUrl}
                              alt={club.name}
                              className="h-9 w-9 rounded-xl object-cover border border-border/50"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                              {club.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {club.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              /{club.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {club.category}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        {pres ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/20">
                              {pres.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                {pres.fullName}
                                <span className="text-[10px] font-mono px-1 py-0.2 bg-muted rounded text-muted-foreground">
                                  {pres.htno || pres.username}
                                </span>
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                {pres.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 italic">
                            <UserX className="h-3.5 w-3.5" /> No President Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                            INACTIVE
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {club.contactEmail ? (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-primary/70" />
                            {club.contactEmail}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/campus-life/clubs/${club.id}`} target="_blank">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Public Club Hub">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(club)}
                            className="h-8 w-8 p-0"
                            title="Edit Club"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPresidentModal(club)}
                            className="h-8 text-xs gap-1.5 rounded-lg border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                          >
                            <Crown className="h-3.5 w-3.5" />
                            <span>President</span>
                          </Button>

                          {isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenStatusDialog(club, "INACTIVE")}
                              className="h-8 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenStatusDialog(club, "ACTIVE")}
                              className="h-8 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE CLUB MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" /> Create Campus Club
            </DialogTitle>
            <DialogDescription>
              Register a new student club or campus society in the institutional directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClubSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Club Name *</label>
              <Input
                placeholder="e.g. Robotics Club"
                value={createForm.name}
                onChange={handleNameChangeInCreate}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">URL Slug *</label>
              <Input
                placeholder="e.g. robotics-club"
                value={createForm.slug}
                onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category *</label>
              <Select
                value={createForm.category}
                onValueChange={(val) => setCreateForm({ ...createForm, category: (val as ClubCategory) || "TECHNICAL" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLUB_CATEGORIES.filter((c) => c.id !== "ALL").map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Contact Email</label>
              <Input
                type="email"
                placeholder="e.g. robotics@mlrit.ac.in"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                placeholder="Describe the club's mission, activities, and membership..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSaving} className="gap-2">
                {createSaving ? "Creating..." : "Create Club"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CLUB MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" /> Edit Club: {editingClub?.name}
            </DialogTitle>
            <DialogDescription>
              Modify club profile, category, contact email, and description.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditClubSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Club Name *</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">URL Slug *</label>
              <Input
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category *</label>
              <Select
                value={editForm.category}
                onValueChange={(val) => setEditForm({ ...editForm, category: (val as ClubCategory) || "TECHNICAL" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLUB_CATEGORIES.filter((c) => c.id !== "ALL").map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Contact Email</label>
              <Input
                type="email"
                value={editForm.contactEmail}
                onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editSaving} className="gap-2">
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* STATUS TOGGLE DIALOG */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {targetStatus === "INACTIVE" ? (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
              {targetStatus === "INACTIVE" ? "Deactivate Club" : "Restore Club"}
            </DialogTitle>
            <DialogDescription>
              {targetStatus === "INACTIVE" ? (
                <>
                  Are you sure you want to deactivate <strong className="text-foreground">{clubForStatus?.name}</strong>?
                  The club will no longer appear in the student directory, and new content creation will be blocked. Existing data is preserved.
                </>
              ) : (
                <>
                  Restore <strong className="text-foreground">{clubForStatus?.name}</strong> to active status? It will become visible in the student club directory again.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={targetStatus === "INACTIVE" ? "destructive" : "default"}
              onClick={handleConfirmStatusChange}
              disabled={statusUpdating}
            >
              {statusUpdating
                ? "Updating..."
                : targetStatus === "INACTIVE"
                ? "Deactivate Club"
                : "Restore Club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANAGE PRESIDENT MODAL */}
      <Dialog open={presidentModalOpen} onOpenChange={setPresidentModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-500" />
              Leadership: {selectedClub?.name}
            </DialogTitle>
            <DialogDescription>
              Assign or replace the student President authorized to publish announcements, events, gallery items, and achievements for this specific club.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Current President Banner */}
            <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Current Active President
                </span>
                {selectedClub?.currentPresident && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePresident}
                    disabled={presidentSaving}
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <UserX className="h-3.5 w-3.5 mr-1" />
                    Remove President
                  </Button>
                )}
              </div>

              {selectedClub?.currentPresident ? (
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
                    {selectedClub.currentPresident.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {selectedClub.currentPresident.fullName}
                      <span className="ml-2 font-mono text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {selectedClub.currentPresident.htno || selectedClub.currentPresident.username}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedClub.currentPresident.email}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      Assigned on {new Date(selectedClub.currentPresident.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-1">
                  No student president currently assigned. Club content management is restricted to Admin.
                </p>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border/60 gap-4">
              <button
                type="button"
                onClick={() => setPresidentTab("assign")}
                className={`pb-2 text-xs font-semibold transition-colors border-b-2 ${
                  presidentTab === "assign"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {selectedClub?.currentPresident ? "Replace President" : "Assign President"}
              </button>
              <button
                type="button"
                onClick={() => setPresidentTab("history")}
                className={`pb-2 text-xs font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                  presidentTab === "history"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                Leadership History ({presidentHistory.length})
              </button>
            </div>

            {presidentTab === "assign" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Search Student Candidate (Name, HTNO, Email, Username)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Type student name, HTNO (e.g. 23R21A...), or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Candidate Selection List */}
                <div className="space-y-1.5 max-h-44 overflow-y-auto border border-border/60 rounded-xl p-2 bg-muted/20">
                  {searchingStudents ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1 text-primary" />
                      Searching student database...
                    </div>
                  ) : studentResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      {studentSearch ? "No matching students found." : "Type above to search students."}
                    </div>
                  ) : (
                    studentResults.map((student) => {
                      const isSelected = selectedStudent?.id === student.id;
                      return (
                        <div
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary/10 border border-primary/40 text-foreground"
                              : "hover:bg-muted/50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                {student.fullName}
                                {student.htno && (
                                  <span className="font-mono text-[10px] px-1 bg-muted rounded text-muted-foreground">
                                    {student.htno}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                <span>{student.email}</span>
                                {student.departmentCode && (
                                  <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium text-foreground/80">
                                    {student.departmentCode}
                                  </span>
                                )}
                                {student.yearOfStudy && (
                                  <span className="text-[10px] text-muted-foreground/80">
                                    Year {student.yearOfStudy}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="text-[10px] h-5">
                              Selected
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedStudent && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Assigning: {selectedStudent.fullName} ({selectedStudent.htno || selectedStudent.username})
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        This student will immediately receive content management rights for {selectedClub?.name}.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Designation Title</label>
                  <Input
                    placeholder="e.g. PRESIDENT, LEAD COORDINATOR"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {presidentHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No previous leadership records for this club.
                  </p>
                ) : (
                  presidentHistory.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3 rounded-xl border border-border/50 bg-card/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          {hist.fullName}
                          <span className="font-mono text-[10px] text-muted-foreground">({hist.htno || hist.username})</span>
                          {hist.active ? (
                            <Badge variant="default" className="text-[9px] h-4 bg-emerald-500">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] h-4">Former</Badge>
                          )}
                        </p>
                        <p className="text-muted-foreground text-[11px]">{hist.email}</p>
                        <p className="text-muted-foreground/70 text-[10px] mt-1">
                          Assigned: {new Date(hist.assignedAt).toLocaleDateString()}
                          {hist.assignedByName && ` by ${hist.assignedByName}`}
                        </p>
                        {hist.removedAt && (
                          <p className="text-muted-foreground/70 text-[10px]">
                            Removed: {new Date(hist.removedAt).toLocaleDateString()}
                            {hist.removedByName && ` by ${hist.removedByName}`}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {hist.designation}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setPresidentModalOpen(false)}>
              Close
            </Button>
            {presidentTab === "assign" && (
              <Button
                onClick={handleAssignPresident}
                disabled={!selectedStudent || presidentSaving}
                className="gap-2"
              >
                {presidentSaving ? "Assigning..." : "Assign as President"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
