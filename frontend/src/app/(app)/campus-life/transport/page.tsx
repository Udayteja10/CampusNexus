"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bus,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { TransportRoute } from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TransportRouteCard } from "@/components/campus-life/TransportRouteCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await campusLifeService.getTransportRoutes();
        setRoutes(data);
      } catch (err) {
        console.error("Failed to load transport routes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Campus Transport</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-500/20 text-teal-200 border-teal-400/30 font-semibold px-3 py-0.5">
              Campus Bus Fleet & Electric Shuttles
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 font-semibold px-3 py-0.5">
              Scheduled Routes
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Campus Transport & Schedules
          </h1>
          <p className="text-sm text-teal-100/90 leading-relaxed">
            Bus routes connecting major city hubs, residential localities, metro junctions, and internal free campus electric shuttles.
          </p>
        </div>
      </div>

      {/* Transport Notice & Guidelines */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Transport Guidelines & Bus Pass Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="p-3 rounded-lg bg-card border border-border/50 space-y-1">
            <strong className="text-foreground block">Bus Pass Verification</strong>
            <p>Passes are verified at the entrance gate and bus boarding points by coordinators.</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/50 space-y-1">
            <strong className="text-foreground block">Reporting Timings</strong>
            <p>Students must report to designated boarding stops 5 minutes prior to scheduled pickup.</p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border/50 space-y-1">
            <strong className="text-foreground block">Internal EV Shuttles</strong>
            <p>Free electric shuttle operates continuously in 20-min loops across hostel & academic blocks.</p>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Official Bus Routes ({routes.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Click on any route card to expand complete stop timings and landmark points.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <TransportRouteCard key={route.id} route={route} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
