"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { careerService } from "@/services/career";
import {
  PlacementOpportunity,
  EligibilityResult,
  WorkMode,
} from "@/types/career.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityCard } from "@/components/career/OpportunityCard";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";

export default function PlacementHubPage() {
  const user = useAuthStore((s) => s.user);

  const [placements, setPlacements] = useState<PlacementOpportunity[]>([]);
  const [eligibilityMap, setEligibilityMap] = useState<Record<string, EligibilityResult>>({});
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("ALL");
  const [workMode, setWorkMode] = useState<string>("ALL");
  const [minCtc, setMinCtc] = useState<string>("ALL");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await careerService.getPlacements({
        search: search.trim() || undefined,
        domain: domain !== "ALL" ? domain : undefined,
        workMode: workMode !== "ALL" ? (workMode as WorkMode) : undefined,
        minCompensation: minCtc !== "ALL" ? Number(minCtc) : undefined,
        eligibleOnly: eligibleOnly || undefined,
      });

      setPlacements(list);

      // Evaluate eligibility in parallel for each opportunity for the current student
      if (user) {
        const evalEntries = await Promise.all(
          list.map(async (p) => {
            const res = await careerService.evaluateEligibility(p);
            return [p.id, res] as const;
          })
        );
        setEligibilityMap(Object.fromEntries(evalEntries));
      }
    } catch (err) {
      console.error("Failed to load placements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, domain, workMode, minCtc, eligibleOnly, user?.id, user?.department]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Placement Hub
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Campus-wide full-time recruitment drives for 4th-year students. Discover openings across all departments.
          </p>
        </div>

        {user?.role === "ADMIN" && (
          <Link href={ROUTES.ADMIN_CAREER_PLACEMENTS}>
            <Button size="sm" className="gap-1.5 text-xs shadow-xs">
              <Building2 className="h-3.5 w-3.5" />
              <span>Admin Placement Console</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search role, company, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <Select value={domain} onValueChange={(val) => setDomain(val || "ALL")}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Domain / Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Domains</SelectItem>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                <SelectItem value="AI/ML & Data Science">AI/ML & Data Science</SelectItem>
                <SelectItem value="Cloud & AI">Cloud & AI</SelectItem>
                <SelectItem value="Embedded Systems & Hardware">Embedded Systems</SelectItem>
                <SelectItem value="VLSI & Semiconductors">VLSI & Semiconductors</SelectItem>
                <SelectItem value="Consulting & Analytics">Consulting & Analytics</SelectItem>
                <SelectItem value="Cybersecurity & Networking">Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Mode Filter */}
          <div>
            <Select value={workMode} onValueChange={(val) => setWorkMode(val || "ALL")}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Work Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Work Modes</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
                <SelectItem value="ONSITE">On-Site</SelectItem>
                <SelectItem value="REMOTE">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Minimum CTC Filter */}
          <div>
            <Select value={minCtc} onValueChange={(val) => setMinCtc(val || "ALL")}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Package Cutoff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All CTC Packages</SelectItem>
                <SelectItem value="8">₹8 LPA & Above</SelectItem>
                <SelectItem value="15">₹15 LPA & Above</SelectItem>
                <SelectItem value="20">₹20 LPA & Above</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional "Eligible for me" toggle & Clear filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="eligible-only-toggle"
              checked={eligibleOnly}
              onCheckedChange={(c) => setEligibleOnly(Boolean(c))}
            />
            <label
              htmlFor="eligible-only-toggle"
              className="text-xs font-semibold text-foreground cursor-pointer select-none flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Show only opportunities I am eligible to apply for</span>
            </label>
          </div>

          {(search || domain !== "ALL" || workMode !== "ALL" || minCtc !== "ALL" || eligibleOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setDomain("ALL");
                setWorkMode("ALL");
                setMinCtc("ALL");
                setEligibleOnly(false);
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : placements.length === 0 ? (
        <AcademicEmptyState
          icon={Briefcase}
          title="No placement opportunities found"
          description="Try broadening your search keywords, clearing filters, or toggling off the eligibility restriction."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setDomain("ALL");
            setWorkMode("ALL");
            setMinCtc("ALL");
            setEligibleOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {placements.map((placement) => (
            <OpportunityCard
              key={placement.id}
              opportunity={placement}
              eligibility={eligibilityMap[placement.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
