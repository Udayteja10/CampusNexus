"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Clock,
  MapPin,
  Users,
  Shield,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { HostelInfo } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HostelPage() {
  const [hostelInfo, setHostelInfo] = useState<HostelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await campusLifeService.getHostelInfo();
        setHostelInfo(data);
      } catch (err) {
        console.error("Failed to load hostel info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !hostelInfo) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Hostel Information</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-950 via-slate-900 to-amber-950 p-8 sm:p-10 text-white shadow-xl border border-orange-900/40">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500/20 text-orange-200 border-orange-400/30 px-3 py-0.5 text-xs font-semibold">
              Student Residential Halls
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 px-3 py-0.5 text-xs font-semibold">
              Blocks A–E
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Campus Residential Halls & Hostels
          </h1>
          <p className="text-sm sm:text-base text-orange-100/90 leading-relaxed">
            Residential hall information, dining mess timings, central amenities, warden contacts, and code of conduct.
          </p>
        </div>
      </div>

      {/* Mess Timings & Central Amenities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mess Timings */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Dining Mess Timings</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Breakfast</span>
                <strong className="text-foreground block">{hostelInfo.messTimings.breakfast}</strong>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Lunch</span>
                <strong className="text-foreground block">{hostelInfo.messTimings.lunch}</strong>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Evening Tea & Snacks</span>
                <strong className="text-foreground block">{hostelInfo.messTimings.snacks}</strong>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Dinner</span>
                <strong className="text-foreground block">{hostelInfo.messTimings.dinner}</strong>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              * Valid mess card / biometric scanning required at the dining hall entrance.
            </p>
          </CardContent>
        </Card>

        {/* Chief Warden Contact */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Hostel Administration & Care</h2>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2 text-xs">
              <div>
                <strong className="text-foreground text-sm block">{hostelInfo.chiefWarden.name}</strong>
                <span className="text-muted-foreground">{hostelInfo.chiefWarden.office}</span>
              </div>
              <div className="pt-2 border-t border-border/50 space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{hostelInfo.chiefWarden.contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>{hostelInfo.chiefWarden.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <span className="font-bold text-foreground block text-[11px]">Emergency Protocol:</span>
              <p>Hostel wardens and security officers are stationed on-site 24/7 across all residential gates.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Residential Blocks Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Residential Blocks ({hostelInfo.blocks.length} Halls)
          </h2>
          <p className="text-xs text-muted-foreground">
            Information regarding capacity, amenities, and floor wardens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostelInfo.blocks.map((block) => (
            <Card key={block.id} className="border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${
                      block.gender === "BOYS"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                    }`}
                  >
                    {block.gender === "BOYS" ? "Boys Hostel" : "Girls Hostel"}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {block.floors} Floors • Cap: {block.capacity}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">{block.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {block.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
                  <span className="font-bold text-foreground block text-[11px]">Block Amenities:</span>
                  <div className="flex flex-wrap gap-1">
                    {block.amenities.map((am, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/40"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground space-y-0.5">
                  <span>Warden: <strong className="text-foreground">{block.wardenName}</strong></span>
                  <p className="text-[11px] text-muted-foreground/80">{block.wardenContact}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rules & Guidelines */}
      <Card className="border-border bg-muted/20">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            General Hostel Code of Conduct & Rules
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
            {hostelInfo.rulesAndGuidelines.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
