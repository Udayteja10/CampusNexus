"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Layers,
  X,
  FileCheck,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import {
  InternshipOpportunity,
  StudentCareerProfile,
  WorkMode,
} from "@/types/career.types";
import { careerService } from "@/services/career";
import { OpportunityCard } from "@/components/career/OpportunityCard";

export default function InternshipHubPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState<InternshipOpportunity[]>([]);
  const [profile, setProfile] = useState<StudentCareerProfile | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [myApplications, setMyApplications] = useState<{ opportunityId: string }[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("latest");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [internshipData, sProfile, saved, apps] = await Promise.all([
          careerService.getInternships(),
          careerService.getStudentCareerProfile(),
          careerService.getSavedOpportunityIds(),
          careerService.getMyApplications(),
        ]);
        setInternships(internshipData);
        setProfile(sProfile);
        setSavedIds(saved);
        setMyApplications(apps);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load internship opportunities");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const domains = useMemo(() => {
    const set = new Set<string>();
    internships.forEach((i) => {
      if (i.domain) set.add(i.domain);
    });
    return Array.from(set);
  }, [internships]);

  const durations = useMemo(() => {
    const set = new Set<string>();
    internships.forEach((i) => {
      if (i.durationMonths) set.add(`${i.durationMonths} months`);
    });
    return Array.from(set);
  }, [internships]);

  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
      // Search
      const matchesSearch =
        !searchQuery ||
        internship.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        internship.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Domain
      const matchesDomain = selectedDomain === "all" || internship.domain === selectedDomain;

      // Work Mode
      const matchesWorkMode = selectedWorkMode === "all" || internship.workMode === selectedWorkMode;

      // Duration
      const matchesDuration =
        selectedDuration === "all" ||
        `${internship.durationMonths} months` === selectedDuration;

      // Eligible Only
      if (eligibleOnly && profile) {
        const evalResult = careerService.evaluateEligibilitySync(internship, profile);
        if (!evalResult.isEligible) return false;
      }

      return matchesSearch && matchesDomain && matchesWorkMode && matchesDuration;
    }).sort((a, b) => {
      if (sortBy === "stipendHigh") {
        return (b.stipendMonthly || 0) - (a.stipendMonthly || 0);
      }
      if (sortBy === "deadline") {
        const dA = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : 0;
        const dB = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : 0;
        return dA - dB;
      }
      // default: latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    internships,
    searchQuery,
    selectedDomain,
    selectedWorkMode,
    selectedDuration,
    eligibleOnly,
    sortBy,
    profile,
  ]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border-indigo-400/30 font-semibold px-3 py-0.5">
                Campus-Wide Discovery
              </Badge>
              <Badge className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/30 font-semibold px-3 py-0.5">
                3rd-Year Application Window
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Internship Opportunities
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Explore summer internships, industrial training, and research roles across all departments.
              Internship applications are reserved for 3rd-year students, but all students can view and bookmark.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.CAREER_APPLICATIONS}
              className={buttonVariants({ variant: "outline", size: "sm" }) + " bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              My Applications ({myApplications.length})
            </Link>
            <Link
              href={ROUTES.CAREER_COLLECTIONS}
              className={buttonVariants({ variant: "outline", size: "sm" }) + " bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"}
            >
              <Layers className="h-4 w-4 mr-2" />
              Smart Collections
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search company, role, skill, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Domain Filter */}
            <div className="md:col-span-2">
              <Select value={selectedDomain} onValueChange={(v) => setSelectedDomain(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work Mode */}
            <div className="md:col-span-2">
              <Select value={selectedWorkMode} onValueChange={(v) => setSelectedWorkMode(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Work Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Work Modes</SelectItem>
                  <SelectItem value="ONSITE">On-Site</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="md:col-span-2">
              <Select value={selectedDuration} onValueChange={(v) => setSelectedDuration(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  {durations.map((dur) => (
                    <SelectItem key={dur} value={dur}>
                      {dur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "latest")}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="stipendHigh">Highest Stipend</SelectItem>
                  <SelectItem value="deadline">Expiring Soonest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Secondary Controls: Eligible only switch + Clear Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40 text-sm">
            <div className="flex items-center space-x-2">
              <Switch
                id="eligible-toggle"
                checked={eligibleOnly}
                onCheckedChange={setEligibleOnly}
              />
              <Label htmlFor="eligible-toggle" className="cursor-pointer text-xs font-medium">
                Show only opportunities I am eligible to apply for
              </Label>
              {profile && (
                <span className="text-xs text-muted-foreground ml-2">
                  (You: Year {profile.currentYear}, {profile.department.split(" ")[0]}, CGPA: {profile.cgpa})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Showing <strong>{filteredInternships.length}</strong> of {internships.length} openings
              </span>
              {(searchQuery || selectedDomain !== "all" || selectedWorkMode !== "all" || selectedDuration !== "all" || eligibleOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDomain("all");
                    setSelectedWorkMode("all");
                    setSelectedDuration("all");
                    setEligibleOnly(false);
                  }}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredInternships.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-4">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No internship opportunities match your criteria</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {eligibleOnly
              ? "None of the currently published internships match your department, academic year (3rd year only), or CGPA criteria. Disable the eligibility filter to view all campus openings."
              : "Try adjusting your search terms, domain, or work mode filters."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedDomain("all");
              setSelectedWorkMode("all");
              setSelectedDuration("all");
              setEligibleOnly(false);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship) => {
            const isSaved = savedIds.includes(internship.id);
            const eligibility = profile
              ? careerService.evaluateEligibilitySync(internship, profile)
              : null;

            return (
              <OpportunityCard
                key={internship.id}
                opportunity={internship}
                isSavedInitial={isSaved}
                eligibility={eligibility}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
