"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Building2,
  Sparkles,
  Filter,
  Plus,
  Compass,
  ArrowRight,
  Calendar,
  Award,
  Globe,
  Mail,
  Share2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { clubsApi } from "@/lib/campusLifeApi";
import type { Club, ClubCategory } from "@/types/campusLife.types";
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

const CLUB_CATEGORIES: { id: ClubCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Clubs" },
  { id: "TECHNICAL", label: "Technical" },
  { id: "CULTURAL", label: "Cultural" },
  { id: "SPORTS", label: "Sports" },
  { id: "LITERARY", label: "Literary" },
  { id: "SOCIAL", label: "Social" },
  { id: "ACADEMIC", label: "Academic" },
  { id: "OTHER", label: "Other" },
];

export default function ClubsDirectoryPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ClubCategory | "ALL">("ALL");

  // Create Modal (Admin)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState<ClubCategory>("TECHNICAL");
  const [formDescription, setFormDescription] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const data = await clubsApi.getAllClubs({
        category: category === "ALL" ? undefined : category,
        keyword: search.trim() || undefined,
      });
      setClubs(data);
    } catch (err: any) {
      console.error("Failed to load clubs:", err);
      toast.error("Failed to load campus clubs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClubs();
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      toast.error("Please enter a club name and slug.");
      return;
    }

    setSaving(true);
    try {
      await clubsApi.createClub({
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        category: formCategory,
        description: formDescription.trim() || undefined,
        contactEmail: formEmail.trim() || undefined,
      });
      toast.success("Club created successfully!");
      setCreateModalOpen(false);
      setFormName("");
      setFormSlug("");
      setFormDescription("");
      setFormEmail("");
      fetchClubs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create club");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-medium border border-white/20">
              <Compass className="h-3.5 w-3.5" />
              <span>Campus Life Societies & Guilds</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Clubs & Student Societies
            </h1>
            <p className="text-purple-100 max-w-xl text-sm md:text-base">
              Explore student-led technical communities, arts & cultural guilds, literary forums, and sports clubs across campus.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2.5 self-start md:self-center">
              <Link href="/admin/clubs">
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-medium text-xs h-9"
                >
                  Manage in Admin
                </Button>
              </Link>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-white text-purple-600 hover:bg-purple-50 font-medium shadow-md transition-all gap-2 h-9 text-xs"
              >
                <Plus className="h-4 w-4" />
                Register Club
              </Button>
            </div>
          )}
        </div>

        {/* Decorative blur */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border/60 shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CLUB_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={category === cat.id ? "default" : "outline"}
              onClick={() => setCategory(cat.id)}
              className="text-xs h-8"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 min-w-[240px]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs bg-background"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs">
            Search
          </Button>
        </form>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No clubs found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            No campus clubs match your active category or search query.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="group overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Cover Header */}
                <div className="h-28 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-4 flex items-start justify-between relative border-b border-border/40">
                  <Badge variant="secondary" className="font-semibold text-[10px] tracking-wide">
                    {club.category}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>

                {/* Club Details */}
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {club.description || "Active student organization enriching campus life at MLRIT."}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {club.currentPresident && (
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <span className="text-amber-500">👑</span>
                        <span>President: {club.currentPresident.fullName || club.currentPresident.username}</span>
                      </div>
                    )}
                    {club.contactEmail && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary/70" />
                        <span className="truncate">{club.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0 border-t border-border/40 mt-auto">
                <Link href={`/campus-life/clubs/${club.id}`} className="w-full block">
                  <Button variant="outline" className="w-full text-xs font-medium justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <span>View Club Hub</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Club Modal (Staff) */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateClub}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Register New Club</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add an official student club to the CampusNexus directory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Club Name *</label>
                <Input
                  required
                  placeholder="e.g. AI & Robotics Society"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!formSlug) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Unique Slug *</label>
                  <Input
                    required
                    placeholder="ai-robotics-society"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Category *</label>
                  <Select
                    value={formCategory}
                    onValueChange={(val) => setFormCategory(val as ClubCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TECHNICAL">Technical</SelectItem>
                      <SelectItem value="CULTURAL">Cultural</SelectItem>
                      <SelectItem value="SPORTS">Sports</SelectItem>
                      <SelectItem value="LITERARY">Literary</SelectItem>
                      <SelectItem value="SOCIAL">Social</SelectItem>
                      <SelectItem value="ACADEMIC">Academic</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Contact Email</label>
                <Input
                  type="email"
                  placeholder="club@mlrit.ac.in"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Club Overview</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  rows={3}
                  placeholder="Goals, activities, meeting schedule, and mission..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Registering..." : "Register Club"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
