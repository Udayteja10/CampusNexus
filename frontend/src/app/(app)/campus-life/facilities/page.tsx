"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { CampusFacility, FacilityCategory } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FacilityCard } from "@/components/campus-life/FacilityCard";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: FacilityCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "ACADEMIC", label: "Academic & Digital Labs" },
  { id: "AUDITORIUM", label: "Auditoriums & Halls" },
  { id: "HEALTHCARE", label: "Health & Dispensary" },
  { id: "STUDENT_CENTER", label: "Student Centers" },
  { id: "ADMINISTRATION", label: "Administrative Complex" },
];

export default function FacilitiesDirectoryPage() {
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await campusLifeService.getFacilities(selectedCategory);
        setFacilities(data);
      } catch (err) {
        console.error("Failed to load facilities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory]);

  const filtered = facilities.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.services.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Campus Facilities</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 font-semibold px-3 py-0.5">
              Infrastructure & Amenities
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 font-semibold px-3 py-0.5">
              Operating Hours & Services
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Campus Facilities Directory
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            Operating hours, desk contacts, services provided, and location guidelines across all campus facilities.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="relative sm:col-span-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities by name, location, or available service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="sm:col-span-4">
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory((v as FacilityCategory | "ALL") ?? "ALL")}
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
          </div>
        </CardContent>
      </Card>

      {/* Facilities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-3">
          <Building className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No facilities found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or category selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((fac) => (
            <FacilityCard key={fac.id} facility={fac} />
          ))}
        </div>
      )}
    </div>
  );
}
