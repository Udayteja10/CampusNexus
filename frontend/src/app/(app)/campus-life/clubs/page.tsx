"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Building2,
  Sparkles,
  CheckCircle2,
  Filter,
  X,
} from "lucide-react";
import { Club, ClubCategory, ClubMembership } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClubCard } from "@/components/campus-life/ClubCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORIES: { id: ClubCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "TECHNICAL", label: "Technical & Coding" },
  { id: "CULTURAL", label: "Cultural & Arts" },
  { id: "SPORTS", label: "Sports & Athletics" },
  { id: "LITERARY", label: "Literary & Debate" },
  { id: "SOCIAL", label: "Social & Volunteering" },
  { id: "COMMUNITY", label: "Community Service" },
  { id: "ENTREPRENEURSHIP", label: "Innovation & Startups" },
];

export default function ClubsDirectoryPage() {
  const user = useAuthStore((s) => s.user);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ClubCategory | "ALL">("ALL");
  const [myClubsOnly, setMyClubsOnly] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allClubs, myMems] = await Promise.all([
          campusLifeService.getClubs({
            search: search.trim() || undefined,
            category: selectedCategory,
          }),
          campusLifeService.getMyClubMemberships(),
        ]);
        setClubs(allClubs);
        setMemberships(myMems);
      } catch (err) {
        console.error("Failed to load clubs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, selectedCategory, user?.id]);

  const joinedClubIds = new Set(memberships.map((m) => m.clubId));

  const displayedClubs = myClubsOnly
    ? clubs.filter((c) => joinedClubIds.has(c.id))
    : clubs;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 font-semibold px-3 py-0.5">
              College-Wide Societies
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 font-semibold px-3 py-0.5">
              Open to All Departments
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Clubs & Organizations
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            Discover the official 9 college societies. Every student across any branch, year, or section can explore, join, and participate without department boundaries.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clubs by name, activities, or focus area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory((v as ClubCategory | "ALL") ?? "ALL")}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* My Clubs Toggle */}
            <div className="md:col-span-3 flex items-center">
              <Button
                variant={myClubsOnly ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs w-full"
                onClick={() => setMyClubsOnly(!myClubsOnly)}
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                {myClubsOnly ? "Showing My Clubs" : "Filter: My Clubs Only"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>
              Showing <strong>{displayedClubs.length}</strong> of {clubs.length} campus clubs
            </span>
            {(search || selectedCategory !== "ALL" || myClubsOnly) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("ALL");
                  setMyClubsOnly(false);
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : displayedClubs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No clubs match your query</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search keyword or resetting category filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedCategory("ALL");
              setMyClubsOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              isMemberInitial={joinedClubIds.has(club.id)}
              onMembershipChange={(isMember) => {
                if (isMember) {
                  setMemberships((prev) => [
                    ...prev,
                    {
                      id: `mem-${Date.now()}`,
                      clubId: club.id,
                      clubName: club.name,
                      userId: user?.id || "",
                      role: "MEMBER",
                      joinedAt: new Date().toISOString(),
                    },
                  ]);
                } else {
                  setMemberships((prev) => prev.filter((m) => m.clubId !== club.id));
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
