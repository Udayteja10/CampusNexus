"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Phone,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Clock,
  Compass,
} from "lucide-react";
import type {
  LostFoundReport,
  LostFoundReportRequest,
  LostFoundType,
  LostFoundCategory,
  ReportStatus,
} from "@/types/campusLife.types";
import { lostFoundApi } from "@/lib/campusLifeApi";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: LostFoundCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Categories" },
  { id: "ELECTRONICS", label: "Phones, Laptops & Electronics" },
  { id: "ID_CARDS", label: "IDs, Cards & Documents" },
  { id: "KEYS", label: "Keys & Keychains" },
  { id: "WALLET", label: "Wallets & Purses" },
  { id: "CLOTHING", label: "Clothes & Bags" },
  { id: "BOOKS_NOTES", label: "Books & Study Material" },
  { id: "ACCESSORIES", label: "Jewelry, Glasses & Watches" },
  { id: "OTHER", label: "Other Items" },
];

export default function LostFoundPage() {
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<"browse" | "my">("browse");
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [myReports, setMyReports] = useState<LostFoundReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<LostFoundType | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<LostFoundCategory | "ALL">("ALL");

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState<LostFoundReportRequest>({
    title: "",
    description: "",
    type: "LOST",
    category: "ELECTRONICS",
    location: "",
    eventDate: new Date().toISOString().split("T")[0],
    imageUrl: "",
    contactInfo: "",
  });

  // Selected Detail Modal
  const [selectedReport, setSelectedReport] = useState<LostFoundReport | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (activeTab === "browse") {
        const data = await lostFoundApi.searchReports({
          type: typeFilter === "ALL" ? undefined : typeFilter,
          category: categoryFilter === "ALL" ? undefined : categoryFilter,
          keyword: search.trim() || undefined,
        });
        setReports(data);
      } else {
        const data = await lostFoundApi.getMyReports();
        setMyReports(data);
      }
    } catch (err: any) {
      console.error("Failed to load reports:", err);
      toast.error(err.response?.data?.message || "Failed to load lost & found items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab, typeFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports();
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.title.trim() || !reportForm.description.trim() || !reportForm.location.trim()) {
      toast.error("Title, description, and location are required");
      return;
    }
    try {
      await lostFoundApi.createReport({
        ...reportForm,
        title: reportForm.title.trim(),
        description: reportForm.description.trim(),
        location: reportForm.location.trim(),
        imageUrl: reportForm.imageUrl?.trim() || undefined,
        contactInfo: reportForm.contactInfo?.trim() || undefined,
      });
      toast.success("Report submitted successfully!");
      setIsReportModalOpen(false);
      setReportForm({
        title: "",
        description: "",
        type: "LOST",
        category: "ELECTRONICS",
        location: "",
        eventDate: new Date().toISOString().split("T")[0],
        imageUrl: "",
        contactInfo: "",
      });
      if (activeTab === "my") {
        const data = await lostFoundApi.getMyReports();
        setMyReports(data);
      } else {
        loadReports();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create report");
    }
  };

  const handleUpdateStatus = async (id: number, status: ReportStatus) => {
    try {
      await lostFoundApi.updateStatus(id, status);
      toast.success(`Report marked as ${status}`);
      if (activeTab === "my") {
        setMyReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      } else {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
      if (selectedReport?.id === id) {
        setSelectedReport((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      await lostFoundApi.deleteReport(id);
      toast.success("Report deleted successfully");
      setMyReports((prev) => prev.filter((r) => r.id !== id));
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete report");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-rose-600/15 via-primary/10 to-amber-500/10 border border-border/60 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Campus Recovery System
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Lost & Found Portal
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Lost an item or found something on campus? Report it here so students can reconnect with their belongings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsReportModalOpen(true)}
              className="gap-2 shadow-md bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Plus className="w-4 h-4" /> Report an Item
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Switch Browse / My Reports */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60 w-fit">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "browse"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse Reports
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "my"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Reports
          </button>
        </div>

        {/* Search */}
        {activeTab === "browse" && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lost & found..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>
        )}
      </div>

      {/* Type & Category Filters */}
      {activeTab === "browse" && (
        <div className="space-y-3">
          {/* Type filters (Lost vs Found) */}
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                typeFilter === "ALL"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border/70 hover:text-foreground"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter("LOST")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                typeFilter === "LOST"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-card text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => setTypeFilter("FOUND")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                typeFilter === "FOUND"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-card text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              }`}
            >
              Found Items
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  categoryFilter === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border/70 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === "browse" ? (
        reports.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-bold text-lg text-foreground">No Reports Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              No active lost or found reports match your filters.
            </p>
            <Button onClick={() => setIsReportModalOpen(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Report an Item
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {reports.map((item) => (
              <Card
                key={item.id}
                className="group border-border/60 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                onClick={() => setSelectedReport(item)}
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
                      variant={item.type === "LOST" ? "destructive" : "default"}
                      className={`absolute top-2.5 left-2.5 font-bold text-xs ${
                        item.type === "LOST"
                          ? "bg-rose-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {item.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="absolute top-2.5 right-2.5 font-semibold text-[10px] bg-card/90 backdrop-blur-sm"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 pb-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category.replace("_", " ")}</span>
                      <span>{new Date(item.eventDate).toLocaleDateString()}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    {item.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> {item.location}
                      </p>
                    )}
                  </CardHeader>
                  {item.description && (
                    <CardContent className="px-4 pb-2 text-xs text-muted-foreground">
                      <p className="line-clamp-2">{item.description}</p>
                    </CardContent>
                  )}
                </div>
                <div className="p-4 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">Reported by {item.reportedByName || "Student"}</span>
                  {item.reportedByDepartment && (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {item.reportedByDepartment}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* My Reports Tab */
        myReports.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-bold text-lg text-foreground">You haven&apos;t posted any reports yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              If you lose or find something on campus, report it here so the community can help.
            </p>
            <Button onClick={() => setIsReportModalOpen(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Create Report
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {myReports.map((item) => (
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
                        <Badge
                          className={`text-xs ${
                            item.type === "LOST" ? "bg-rose-600" : "bg-emerald-600"
                          }`}
                        >
                          {item.type}
                        </Badge>
                        <h4 className="font-bold text-foreground text-base">{item.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{item.category.replace("_", " ")}</span>
                        {item.location && <span>• {item.location}</span>}
                        <span>• Date: {new Date(item.eventDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    {item.status === "OPEN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                        className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                      </Button>
                    )}
                    {item.status === "OPEN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "CLOSED")}
                        className="text-xs"
                      >
                        Close
                      </Button>
                    )}
                    {item.status !== "OPEN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "OPEN")}
                        className="text-xs"
                      >
                        Re-open
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReport(item.id)}
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

      {/* CREATE REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-xl w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Post Lost / Found Report</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsReportModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateReport} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex items-center justify-center font-bold text-sm cursor-pointer transition-all ${
                    reportForm.type === "LOST"
                      ? "border-rose-600 bg-rose-600/10 text-rose-600"
                      : "border-border text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    checked={reportForm.type === "LOST"}
                    onChange={() => setReportForm({ ...reportForm, type: "LOST" })}
                    className="sr-only"
                  />
                  I Lost an Item
                </label>
                <label
                  className={`p-3 rounded-xl border flex items-center justify-center font-bold text-sm cursor-pointer transition-all ${
                    reportForm.type === "FOUND"
                      ? "border-emerald-600 bg-emerald-600/10 text-emerald-600"
                      : "border-border text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    checked={reportForm.type === "FOUND"}
                    onChange={() => setReportForm({ ...reportForm, type: "FOUND" })}
                    className="sr-only"
                  />
                  I Found an Item
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Item Title *</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  placeholder="e.g. Blue Titan Water Bottle / Black Dell Charger"
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Category *</label>
                  <select
                    value={reportForm.category}
                    onChange={(e) => setReportForm({ ...reportForm, category: e.target.value as LostFoundCategory })}
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
                  <label className="text-xs font-semibold text-foreground">Date *</label>
                  <input
                    type="date"
                    value={reportForm.eventDate}
                    onChange={(e) => setReportForm({ ...reportForm, eventDate: e.target.value })}
                    required
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Location (Where lost/found) *</label>
                  <input
                    type="text"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                    placeholder="e.g. CSE Lab 3 / Library 1st Floor"
                    required
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Contact Info (Phone/Email)</label>
                  <input
                    type="text"
                    value={reportForm.contactInfo || ""}
                    onChange={(e) => setReportForm({ ...reportForm, contactInfo: e.target.value })}
                    placeholder="e.g. Phone: 9876543210"
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Description & Identifying Details *</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Provide key identifiers (color, stickers, scratches, case, brand)..."
                  rows={3}
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Photo URL (Optional)</label>
                <input
                  type="url"
                  value={reportForm.imageUrl || ""}
                  onChange={(e) => setReportForm({ ...reportForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-xs ${
                    selectedReport.type === "LOST" ? "bg-rose-600" : "bg-emerald-600"
                  }`}
                >
                  {selectedReport.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedReport.category.replace("_", " ")}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden relative">
                {selectedReport.imageUrl ? (
                  <img
                    src={selectedReport.imageUrl}
                    alt={selectedReport.title}
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
                  <h3 className="text-xl font-bold text-foreground">{selectedReport.title}</h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{selectedReport.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>Date: {new Date(selectedReport.eventDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedReport.description && (
                    <p className="text-sm text-foreground/80 pt-2 leading-relaxed whitespace-pre-line">
                      {selectedReport.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60 space-y-2 text-xs">
                    <div className="font-semibold text-foreground flex items-center justify-between">
                      <span>Reported by: {selectedReport.reportedByName || "Student"}</span>
                      {selectedReport.reportedByDepartment && (
                        <span className="text-muted-foreground font-normal">
                          Dept: {selectedReport.reportedByDepartment}
                        </span>
                      )}
                    </div>
                    {selectedReport.contactInfo && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedReport.contactInfo}</span>
                      </div>
                    )}
                  </div>

                  {user?.id && String(user.id) === String(selectedReport.reportedById) && (
                    <div className="flex gap-2">
                      {selectedReport.status === "OPEN" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-emerald-600 border-emerald-500/30"
                          onClick={() => handleUpdateStatus(selectedReport.id, "RESOLVED")}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReport(selectedReport.id)}
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
