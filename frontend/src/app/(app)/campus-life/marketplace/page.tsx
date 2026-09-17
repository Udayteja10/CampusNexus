"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Tag,
  IndianRupee,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import {
  MarketplaceListing,
  MarketplaceCategory,
  MarketplaceCondition,
  MarketplaceStatus,
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
import { MarketplaceCard } from "@/components/campus-life/MarketplaceCard";
import { MarketplaceDialog } from "@/components/campus-life/MarketplaceDialog";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: MarketplaceCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "TEXTBOOKS", label: "Textbooks & Books" },
  { id: "ELECTRONICS", label: "Electronics & Gadgets" },
  { id: "CALCULATORS", label: "Scientific Calculators" },
  { id: "DRAWING_TOOLS", label: "Drawing & Drafting Tools" },
  { id: "BICYCLES", label: "Bicycles & Commuting" },
  { id: "ROOM_ESSENTIALS", label: "Hostel & Room Essentials" },
  { id: "NOTES_STUDY_MATERIAL", label: "Notes & Material" },
];

export default function MarketplacePage() {
  const user = useAuthStore((s) => s.user);

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MarketplaceCategory | "ALL">("ALL");
  const [status, setStatus] = useState<MarketplaceStatus | "ALL">("AVAILABLE");
  const [myListingsOnly, setMyListingsOnly] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await campusLifeService.getMarketplaceListings({
        search: search.trim() || undefined,
        category,
        status,
        myListingsOnly,
      });
      setListings(data);
    } catch (err) {
      console.error("Failed to load marketplace listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, category, status, myListingsOnly, user?.id]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href={ROUTES.CAMPUS_LIFE} className="hover:text-foreground transition-colors">
          Campus Life
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Marketplace</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-500/20 text-rose-200 border-rose-400/30 font-semibold px-3 py-0.5">
                Peer-to-Peer Student Exchange
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 font-semibold px-3 py-0.5">
                Zero Fees • Hand-to-Hand Campus Pickup
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Campus Student Marketplace
            </h1>
            <p className="text-sm text-rose-100/90 leading-relaxed">
              Buy and sell engineering textbooks, Casio scientific calculators, drafting tools, bicycles, and room essentials directly with fellow students.
            </p>
          </div>

          <Button
            size="sm"
            className="bg-primary text-primary-foreground font-bold shadow-lg shrink-0"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Post Item for Sale
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by textbook title, calculator model, seller..."
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
            <div className="sm:col-span-3">
              <Select
                value={category}
                onValueChange={(v) => setCategory((v as MarketplaceCategory | "ALL") ?? "ALL")}
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

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <Select
                value={status}
                onValueChange={(v) => setStatus((v as MarketplaceStatus | "ALL") ?? "ALL")}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Items</SelectItem>
                  <SelectItem value="AVAILABLE">Available Now</SelectItem>
                  <SelectItem value="SOLD">Sold Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* My Listings Toggle */}
            <div className="sm:col-span-2 flex items-center">
              <Button
                variant={myListingsOnly ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs w-full"
                onClick={() => setMyListingsOnly(!myListingsOnly)}
              >
                {myListingsOnly ? "My Listings" : "My Listings"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
            <span>
              Showing <strong>{listings.length}</strong> listings
            </span>
            {(search || category !== "ALL" || status !== "AVAILABLE" || myListingsOnly) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setCategory("ALL");
                  setStatus("AVAILABLE");
                  setMyListingsOnly(false);
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border space-y-3">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No listings found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria or post a new item for sale.
          </p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Post New Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <MarketplaceCard
              key={item.id}
              listing={item}
              onUpdated={loadData}
              onDeleted={loadData}
            />
          ))}
        </div>
      )}

      <MarketplaceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
}
