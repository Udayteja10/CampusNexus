"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Building,
  Phone,
  Mail,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Shield,
  HelpCircle,
  X,
} from "lucide-react";
import { CampusDirectoryEntry, DirectoryCategory } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { ROUTES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: DirectoryCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Offices & Desks" },
  { id: "ADMINISTRATION", label: "Administration & Leadership" },
  { id: "STUDENT_AFFAIRS", label: "Student Welfare & Affairs" },
  { id: "ACADEMIC_OFFICE", label: "Academic Section & Registrar" },
  { id: "EXAMINATION", label: "Examination Cell (CoE)" },
  { id: "IT_SERVICES", label: "IT Services & Network (NOC)" },
  { id: "EMERGENCY", label: "Emergency & Security Desks" },
];

export default function CampusDirectoryPage() {
  const [entries, setEntries] = useState<CampusDirectoryEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await campusLifeService.getDirectoryEntries(selectedCategory, search.trim() || undefined);
        setEntries(data);
      } catch (err) {
        console.error("Failed to load directory entries:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, search]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Campus Directory</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 font-semibold px-3 py-0.5">
              Official Campus Directory
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 font-semibold px-3 py-0.5">
              Administrative & Student Desks
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Campus Information & Office Directory
          </h1>
          <p className="text-sm text-cyan-100/90 leading-relaxed">
            Direct extension contacts, room locations, office hours, and services provided by official campus divisions.
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
                placeholder="Search by office name, officer, location, or service provided..."
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

            <div className="sm:col-span-4">
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory((v as DirectoryCategory | "ALL") ?? "ALL")}
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

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-3">
          <Building className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No directory entries found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try searching for a different office or clearing category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase text-primary">
                    {entry.category.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{entry.contactNumber}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">{entry.officeName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {entry.headName} • <span className="text-foreground">{entry.designation}</span>
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Location: <strong className="text-foreground">{entry.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Timings: {entry.operatingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-primary hover:underline cursor-pointer">{entry.email}</span>
                  </div>
                </div>

                {entry.servicesProvided && entry.servicesProvided.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-foreground block">Key Responsibilities & Services:</span>
                    <div className="flex flex-wrap gap-1">
                      {entry.servicesProvided.map((srv, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/40"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
