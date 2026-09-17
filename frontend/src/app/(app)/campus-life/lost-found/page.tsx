"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  ChevronRight,
} from "lucide-react";
import {
  LostFoundItem,
  LostFoundType,
  LostFoundCategory,
  LostFoundStatus,
} from "@/types/campus-life.types";
import { campusLifeService } from "@/services/campus-life";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
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
import { LostFoundCard } from "@/components/campus-life/LostFoundCard";
import { LostFoundDialog } from "@/components/campus-life/LostFoundDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function LostFoundPage() {
  const user = useAuthStore((s) => s.user);

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState<LostFoundType | "ALL">("ALL");
  const [category, setCategory] = useState<LostFoundCategory | "ALL">("ALL");
  const [status, setStatus] = useState<LostFoundStatus | "ALL">("ALL");
  const [myItemsOnly, setMyItemsOnly] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await campusLifeService.getLostFoundItems({
        search: search.trim() || undefined,
        type,
        category,
        status,
        myItemsOnly,
      });
      setItems(data);
    } catch (err) {
      console.error("Failed to load Lost & Found items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, type, category, status, myItemsOnly, user?.id]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Lost & Found</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950 via-slate-900 to-rose-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 font-semibold px-3 py-0.5">
                Centralized Campus Recovery
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 font-semibold px-3 py-0.5">
                Safe In-App Contact
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Lost & Found Portal
            </h1>
            <p className="text-sm text-amber-100/90 leading-relaxed">
              Report lost personal items, submit found belongings deposited at security desks, and coordinate safe on-campus recovery.
            </p>
          </div>

          <Button
            size="sm"
            className="bg-primary text-primary-foreground font-bold shadow-lg shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Report Lost / Found Item
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, keywords..."
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

            {/* Type Filter */}
            <div className="sm:col-span-2">
              <Select value={type} onValueChange={(v) => setType((v as LostFoundType | "ALL") ?? "ALL")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="LOST">Lost Items</SelectItem>
                  <SelectItem value="FOUND">Found Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <Select value={status} onValueChange={(v) => setStatus((v as LostFoundStatus | "ALL") ?? "ALL")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Active Reports</SelectItem>
                  <SelectItem value="RESOLVED">Resolved / Claimed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* My Items Filter */}
            <div className="sm:col-span-4 flex items-center">
              <Button
                variant={myItemsOnly ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs w-full"
                onClick={() => setMyItemsOnly(!myItemsOnly)}
              >
                {myItemsOnly ? "Showing My Reports" : "Filter: My Reports Only"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>
              Showing <strong>{items.length}</strong> items
            </span>
            {(search || type !== "ALL" || status !== "ALL" || myItemsOnly) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setType("ALL");
                  setStatus("ALL");
                  setMyItemsOnly(false);
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lost & Found Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-3">
          <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No reports match your filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria or report a new lost or found item.
          </p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Report Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <LostFoundCard
              key={item.id}
              item={item}
              onUpdated={loadData}
              onDeleted={loadData}
            />
          ))}
        </div>
      )}

      <LostFoundDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
}
