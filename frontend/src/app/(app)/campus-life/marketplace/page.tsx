"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Tag,
  Sparkles,
  X,
  Phone,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Check,
  DollarSign,
  Package,
} from "lucide-react";
import type {
  MarketplaceListing,
  MarketplaceListingRequest,
  MarketplaceCategory,
  ItemCondition,
  ListingStatus,
} from "@/types/campusLife.types";
import { marketplaceApi } from "@/lib/campusLifeApi";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: MarketplaceCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "BOOKS", label: "Textbooks & Books" },
  { id: "ELECTRONICS", label: "Electronics & Gadgets" },
  { id: "CALCULATORS", label: "Scientific Calculators" },
  { id: "STUDY_MATERIALS", label: "Notes & Drafting Tools" },
  { id: "FURNITURE", label: "Hostel Furniture" },
  { id: "OTHER", label: "Other Items" },
];

const CONDITIONS: { id: ItemCondition; label: string }[] = [
  { id: "NEW", label: "Brand New" },
  { id: "LIKE_NEW", label: "Like New" },
  { id: "GOOD", label: "Good" },
  { id: "FAIR", label: "Fair" },
];

export default function MarketplacePage() {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MarketplaceCategory | "ALL">("ALL");
  const [condition, setCondition] = useState<ItemCondition | "ALL">("ALL");

  // Sell Modal
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellForm, setSellForm] = useState<MarketplaceListingRequest>({
    title: "",
    description: "",
    price: 0,
    category: "BOOKS",
    conditionType: "GOOD",
    imageUrl: "",
    contactPhone: "",
  });

  // Selected Item Detail Modal
  const [selectedItem, setSelectedItem] = useState<MarketplaceListing | null>(null);

  const loadListings = async () => {
    setLoading(true);
    try {
      if (activeTab === "browse") {
        const data = await marketplaceApi.searchListings({
          category: category === "ALL" ? undefined : category,
          conditionType: condition === "ALL" ? undefined : condition,
          keyword: search.trim() || undefined,
        });
        setListings(data);
      } else {
        const data = await marketplaceApi.getMyListings();
        setMyListings(data);
      }
    } catch (err: any) {
      console.error("Failed to load listings:", err);
      toast.error(err.response?.data?.message || "Failed to load marketplace listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [activeTab, category, condition]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellForm.title.trim() || !sellForm.description.trim() || sellForm.price < 0) {
      toast.error("Title, description, and valid price are required");
      return;
    }
    try {
      await marketplaceApi.createListing({
        ...sellForm,
        title: sellForm.title.trim(),
        description: sellForm.description.trim(),
        imageUrl: sellForm.imageUrl?.trim() || undefined,
        contactPhone: sellForm.contactPhone?.trim() || undefined,
      });
      toast.success("Listing posted successfully!");
      setIsSellModalOpen(false);
      setSellForm({
        title: "",
        description: "",
        price: 0,
        category: "BOOKS",
        conditionType: "GOOD",
        imageUrl: "",
        contactPhone: "",
      });
      if (activeTab === "my") {
        const data = await marketplaceApi.getMyListings();
        setMyListings(data);
      } else {
        loadListings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create listing");
    }
  };

  const handleUpdateStatus = async (id: number, status: ListingStatus) => {
    try {
      await marketplaceApi.updateStatus(id, status);
      toast.success(`Listing marked as ${status}`);
      if (activeTab === "my") {
        setMyListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      } else {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteListing = async (id: number) => {
    try {
      await marketplaceApi.deleteListing(id);
      toast.success("Listing deleted successfully");
      setMyListings((prev) => prev.filter((item) => item.id !== id));
      setListings((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete listing");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600/15 via-primary/10 to-teal-500/10 border border-border/60 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Peer-to-Peer Campus Marketplace
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Student Marketplace
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Buy and sell textbooks, calculators, hostel supplies, and electronics directly with fellow students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsSellModalOpen(true)}
              className="gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4" /> Sell an Item
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Switch Browse / My Listings */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60 w-fit">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "browse"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse Marketplace
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "my"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Listings
          </button>
        </div>

        {/* Search form (browse tab only) */}
        {activeTab === "browse" && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>
        )}
      </div>

      {/* Category Pills (Browse tab) */}
      {activeTab === "browse" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  category === cat.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-card text-muted-foreground border-border/70 hover:border-emerald-500/50 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Condition:
            </span>
            <button
              onClick={() => setCondition("ALL")}
              className={`hover:underline ${condition === "ALL" ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
            >
              All
            </button>
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCondition(c.id)}
                className={`hover:underline ${condition === c.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === "browse" ? (
        listings.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-bold text-lg text-foreground">No Listings Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              There are currently no items matching your filter criteria. Be the first to post a listing!
            </p>
            <Button onClick={() => setIsSellModalOpen(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Post an Item
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <Card
                key={item.id}
                className="group border-border/60 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div>
                  <div className="aspect-[4/3] bg-muted/60 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 bg-secondary/30">
                        <Package className="w-12 h-12" />
                        <span className="text-xs mt-1">No Image</span>
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute top-2.5 right-2.5 font-bold text-xs bg-card/90 backdrop-blur-sm shadow-sm"
                    >
                      {item.conditionType.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category.replace("_", " ")}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </CardTitle>
                    <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{item.price}
                    </p>
                  </CardHeader>
                  {item.description && (
                    <CardContent className="px-4 pb-2 text-xs text-muted-foreground">
                      <p className="line-clamp-2">{item.description}</p>
                    </CardContent>
                  )}
                </div>
                <div className="p-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{item.sellerName || "Campus Student"}</span>
                  {item.sellerDepartment && (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.sellerDepartment}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* My Listings Tab */
        myListings.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-bold text-lg text-foreground">You haven&apos;t listed any items yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Ready to clear out old study materials, devices, or furniture? Create your first listing now.
            </p>
            <Button onClick={() => setIsSellModalOpen(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Create Listing
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {myListings.map((item) => (
              <Card key={item.id} className="border-border/60 hover:shadow-sm transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-base">{item.title}</h4>
                        <Badge
                          variant={
                            item.status === "ACTIVE"
                              ? "default"
                              : item.status === "SOLD"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₹{item.price} • <span className="text-muted-foreground font-normal">{item.category}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Posted on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {item.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "SOLD")}
                        className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 text-xs"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Mark as Sold
                      </Button>
                    )}
                    {item.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "CLOSED")}
                        className="text-xs"
                      >
                        Close Listing
                      </Button>
                    )}
                    {item.status !== "ACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                        className="text-xs"
                      >
                        Re-activate
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteListing(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* CREATE LISTING MODAL */}
      {isSellModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-xl w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">List an Item for Sale</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsSellModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateListing} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Item Title *</label>
                <input
                  type="text"
                  value={sellForm.title}
                  onChange={(e) => setSellForm({ ...sellForm, title: e.target.value })}
                  placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal"
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={sellForm.price}
                    onChange={(e) => setSellForm({ ...sellForm, price: parseFloat(e.target.value) || 0 })}
                    required
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Category *</label>
                  <select
                    value={sellForm.category}
                    onChange={(e) => setSellForm({ ...sellForm, category: e.target.value as MarketplaceCategory })}
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  >
                    {CATEGORIES.filter((c) => c.id !== "ALL").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Condition *</label>
                  <select
                    value={sellForm.conditionType}
                    onChange={(e) => setSellForm({ ...sellForm, conditionType: e.target.value as ItemCondition })}
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Description *</label>
                <textarea
                  value={sellForm.description}
                  onChange={(e) => setSellForm({ ...sellForm, description: e.target.value })}
                  placeholder="Describe condition, edition, accessories included..."
                  rows={3}
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Contact Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={sellForm.contactPhone || ""}
                    onChange={(e) => setSellForm({ ...sellForm, contactPhone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Photo URL</label>
                  <input
                    type="url"
                    value={sellForm.imageUrl || ""}
                    onChange={(e) => setSellForm({ ...sellForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsSellModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Post Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM DETAIL DIALOG */}
      {selectedItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <Badge variant="outline" className="text-xs">
                {selectedItem.category.replace("_", " ")}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden relative">
                {selectedItem.imageUrl ? (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
                    <Package className="w-16 h-16" />
                    <span className="text-xs mt-2">No Image Provided</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">{selectedItem.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{selectedItem.price}
                    </span>
                    <Badge variant="secondary">{selectedItem.conditionType.replace("_", " ")}</Badge>
                    <Badge
                      variant={selectedItem.status === "ACTIVE" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {selectedItem.status}
                    </Badge>
                  </div>

                  {selectedItem.description && (
                    <p className="text-sm text-foreground/80 pt-2 leading-relaxed whitespace-pre-line">
                      {selectedItem.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 space-y-2 text-xs">
                    <div className="font-semibold text-foreground flex items-center justify-between">
                      <span>Seller: {selectedItem.sellerName || "Campus Student"}</span>
                      {selectedItem.sellerDepartment && (
                        <span className="text-muted-foreground font-normal">
                          Dept: {selectedItem.sellerDepartment}
                        </span>
                      )}
                    </div>
                    {selectedItem.contactPhone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedItem.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {user?.id && String(user.id) === String(selectedItem.sellerId) && (
                    <div className="flex gap-2">
                      {selectedItem.status === "ACTIVE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-emerald-600 border-emerald-500/30"
                          onClick={() => handleUpdateStatus(selectedItem.id, "SOLD")}
                        >
                          Mark as Sold
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteListing(selectedItem.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
