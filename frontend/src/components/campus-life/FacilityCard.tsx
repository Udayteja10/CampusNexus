"use client";

import React from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  Users,
} from "lucide-react";
import { CampusFacility } from "@/types/campus-life.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FacilityCardProps {
  facility: CampusFacility;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  ACADEMIC: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  AUDITORIUM: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  SPORTS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  HEALTHCARE: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  STUDENT_CENTER: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ADMINISTRATION: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  RECREATION: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
};

export function FacilityCard({ facility, className }: FacilityCardProps) {
  const categoryStyle = CATEGORY_COLORS[facility.category] || "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40",
        className
      )}
    >
      <div className="space-y-3">
        {/* Category & Capacity */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px] font-bold uppercase tracking-wider", categoryStyle)}
          >
            {facility.category.replace("_", " ")}
          </Badge>

          {facility.capacity && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              <Users className="h-3 w-3 text-muted-foreground/70" />
              Cap: {facility.capacity}
            </span>
          )}
        </div>

        {/* Name & Location */}
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground">
            {facility.name}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate font-medium">{facility.location}</span>
          </p>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/40">
          <Clock className="h-3.5 w-3.5 text-primary/80 shrink-0" />
          <span className="font-medium text-foreground">{facility.operatingHours}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground/90 leading-relaxed line-clamp-3">
          {facility.description}
        </p>

        {/* Services Checklist */}
        {facility.services && facility.services.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-bold text-foreground">Available Services:</span>
            <ul className="grid grid-cols-1 gap-1">
              {facility.services.slice(0, 3).map((srv, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{srv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Contact */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">
          In-Charge: <strong className="text-foreground">{facility.inChargeName || "Faculty Lead"}</strong>
        </span>

        {facility.contactEmail && (
          <span className="text-[11px] text-primary hover:underline cursor-pointer">
            {facility.contactPhone || "Info Desk"}
          </span>
        )}
      </div>
    </div>
  );
}
