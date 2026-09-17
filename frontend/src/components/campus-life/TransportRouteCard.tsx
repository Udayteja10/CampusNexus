"use client";

import React, { useState } from "react";
import {
  Bus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
} from "lucide-react";
import { TransportRoute } from "@/types/campus-life.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TransportRouteCardProps {
  route: TransportRoute;
  className?: string;
}

export function TransportRouteCard({ route, className }: TransportRouteCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header Badges & Bus Number */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/15 text-primary border-primary/30 text-xs font-bold px-2.5 py-0.5">
              <Bus className="h-3.5 w-3.5 mr-1" />
              {route.routeNumber}
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {route.busNumber}
            </Badge>
          </div>

          {route.feePerSemester !== undefined && route.feePerSemester > 0 ? (
            <span className="text-xs font-bold text-foreground">
              ₹{route.feePerSemester.toLocaleString("en-IN")}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">/ sem</span>
            </span>
          ) : (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
              Free Campus Shuttle
            </Badge>
          )}
        </div>

        {/* Route Name */}
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground">
            {route.routeName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{route.operatingDays}</span>
            <span>•</span>
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Capacity: {route.capacity} seats</span>
          </p>
        </div>

        {/* Key Route Summary (Start to End) */}
        {route.stops.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground block">First Stop</span>
              <strong className="text-foreground">{route.stops[0].stopName}</strong>
              <span className="text-[11px] text-primary block">{route.stops[0].morningPickupTime}</span>
            </div>
            <div className="text-muted-foreground font-bold">→</div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Terminal</span>
              <strong className="text-foreground">{route.stops[route.stops.length - 1].stopName}</strong>
              <span className="text-[11px] text-primary block">{route.stops[route.stops.length - 1].eveningDropTime}</span>
            </div>
          </div>
        )}

        {/* Informational notice */}
        <p className="text-[11px] text-muted-foreground italic">
          * Scheduled operational timings. Passes verified daily by transport coordinators.
        </p>
      </div>

      {/* Expandable Stops Timeline */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-border/50 space-y-3">
          <span className="text-xs font-bold text-foreground block">
            Complete Route Stops & Schedules ({route.stops.length} Stops):
          </span>
          <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/30">
            {route.stops.map((stop, idx) => (
              <div key={idx} className="relative text-xs">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-card" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <strong className="text-foreground font-semibold">{stop.stopName}</strong>
                    {stop.landmark && (
                      <span className="text-[11px] text-muted-foreground block">({stop.landmark})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                    <span>Pickup: <strong className="text-foreground">{stop.morningPickupTime}</strong></span>
                    <span>Drop: <strong className="text-foreground">{stop.eveningDropTime}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Driver / Supervisor: <strong className="text-foreground">{route.driverName}</strong></span>
            <span>{route.inChargeContact}</span>
          </div>
        </div>
      )}

      {/* Footer Toggle Button */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs font-medium"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Hide Stops <ChevronUp className="h-3.5 w-3.5 ml-1" />
            </>
          ) : (
            <>
              View All {route.stops.length} Stops <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
