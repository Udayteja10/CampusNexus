"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Eye,
  ShieldCheck,
  FileText,
  User,
  ArrowRight,
  X,
  Trash2,
} from "lucide-react";
import type {
  CampusWikiPage,
  CampusWikiPageRequest,
  CampusWikiCategory,
  WikiStatus,
} from "@/types/campusLife.types";
import { wikiApi } from "@/lib/campusLifeApi";
import { useAuthStore } from "@/store/auth.store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES: { id: CampusWikiCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "All Topics" },
  { id: "ACADEMICS", label: "Academics & Regulations" },
  { id: "CAMPUS", label: "Campus Navigation & Guide" },
  { id: "FACILITIES", label: "Labs, Library & Hostels" },
  { id: "DEPARTMENTS", label: "Department Info" },
  { id: "STUDENT_RESOURCES", label: "Student Services & Portals" },
  { id: "FAQ", label: "Frequently Asked Questions" },
  { id: "OTHER", label: "Other Knowledge" },
];

export default function CampusWikiPageMain() {
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const [activeTab, setActiveTab] = useState<"browse" | "my" | "moderation">("browse");
  const [pages, setPages] = useState<CampusWikiPage[]>([]);
  const [myPages, setMyPages] = useState<CampusWikiPage[]>([]);
  const [moderationPages, setModerationPages] = useState<CampusWikiPage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CampusWikiCategory | "ALL">("ALL");

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CampusWikiPageRequest>({
    title: "",
    category: "CAMPUS",
    content: "",
  });

  // Rejection modal
  const [rejectModalTarget, setRejectModalTarget] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "browse") {
        const data = await wikiApi.searchPages({
          status: "PUBLISHED",
          category: category === "ALL" ? undefined : category,
          keyword: search.trim() || undefined,
        });
        setPages(data);
      } else if (activeTab === "my") {
        const data = await wikiApi.getMyPages();
        setMyPages(data);
      } else if (activeTab === "moderation" && isStaff) {
        const data = await wikiApi.searchPages({ status: "PENDING_REVIEW" });
        setModerationPages(data);
      }
    } catch (err: any) {
      console.error("Failed to load wiki pages:", err);
      toast.error(err.response?.data?.message || "Failed to load wiki articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    try {
      await wikiApi.createPage({
        ...createForm,
        title: createForm.title.trim(),
        content: createForm.content.trim(),
      });
      toast.success("Article submitted! It will appear after moderator review.");
      setIsCreateModalOpen(false);
      setCreateForm({
        title: "",
        category: "CAMPUS",
        content: "",
      });
      if (activeTab === "my") {
        const data = await wikiApi.getMyPages();
        setMyPages(data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit article");
    }
  };

  const handleModerate = async (pageId: number, status: WikiStatus, reason?: string) => {
    try {
      await wikiApi.moderatePage(pageId, {
        status,
        rejectionReason: reason,
      });
      toast.success(status === "PUBLISHED" ? "Article published!" : "Article rejected");
      setModerationPages((prev) => prev.filter((p) => p.id !== pageId));
      if (rejectModalTarget === pageId) {
        setRejectModalTarget(null);
        setRejectionReason("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Moderation action failed");
    }
  };

  const handleDeletePage = async (pageId: number) => {
    try {
      await wikiApi.deletePage(pageId);
      toast.success("Article deleted");
      setMyPages((prev) => prev.filter((p) => p.id !== pageId));
      setPages((prev) => prev.filter((p) => p.id !== pageId));
      setModerationPages((prev) => prev.filter((p) => p.id !== pageId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete article");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600/15 via-primary/10 to-violet-500/10 border border-border/60 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Campus Knowledge Base
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Campus Wiki & Survival Guide
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Crowdsourced guidelines, academic FAQs, facility locations, and tips curated by students and verified by moderators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4" /> Write an Article
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/60 w-fit">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "browse"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse Articles
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "my"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Submissions
          </button>
          {isStaff && (
            <button
              onClick={() => setActiveTab("moderation")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "moderation"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Review Queue
            </button>
          )}
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
                placeholder="Search wiki articles..."
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                category === cat.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-card text-muted-foreground border-border/70 hover:border-indigo-500/50 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === "browse" ? (
        pages.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-bold text-lg text-foreground">No Articles Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              No published articles match this category or search term.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Contribute Article
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((article) => (
              <Card
                key={article.id}
                className="group border-border/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <Badge variant="outline" className="text-[11px] font-semibold">
                        {article.category.replace("_", " ")}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {article.viewsCount} views
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                      <Link href={`/campus-life/wiki/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-3 text-xs text-foreground/80">
                    <p className="line-clamp-3 leading-relaxed">
                      {article.content.substring(0, 160)}...
                    </p>
                  </CardContent>
                </div>

                <div className="p-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate max-w-[120px]">{article.authorName || "Student"}</span>
                  </div>
                  <Link
                    href={`/campus-life/wiki/${article.slug}`}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:underline"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : activeTab === "my" ? (
        /* My Submissions */
        myPages.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-bold text-lg text-foreground">No Submissions Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Share your knowledge about clubs, lab tips, campus food, or exam preparation!
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Write Article
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {myPages.map((page) => (
              <Card key={page.id} className="border-border/60">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground text-base">{page.title}</h4>
                      <Badge
                        variant={
                          page.status === "PUBLISHED"
                            ? "default"
                            : page.status === "PENDING_REVIEW"
                            ? "secondary"
                            : page.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {page.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {page.category}
                      </Badge>
                    </div>
                    {page.rejectionReason && (
                      <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-lg mt-1">
                        Reason: {page.rejectionReason}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Submitted on {new Date(page.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {page.status === "PUBLISHED" && (
                      <Link
                        href={`/campus-life/wiki/${page.slug}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        View Live
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePage(page.id)}
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
      ) : (
        /* Review Queue (Moderation Tab) */
        moderationPages.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/70">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/60" />
            <h3 className="font-bold text-lg text-foreground">Review Queue is Empty</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              All submitted wiki articles have been reviewed.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {moderationPages.map((page) => (
              <Card key={page.id} className="border-border/60">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{page.category}</Badge>
                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                          Pending Review
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Author: {page.authorName} • Submitted:{" "}
                        {new Date(page.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleModerate(page.id, "PUBLISHED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setRejectModalTarget(page.id);
                          setRejectionReason("");
                        }}
                        className="gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="text-sm text-foreground/90 whitespace-pre-line bg-card/60 p-4 rounded-xl border border-border/50 max-h-60 overflow-y-auto font-mono">
                    {page.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* CREATE ARTICLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Write a Wiki Article</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleCreatePage} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Article Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Complete Guide to Semester Registration & Credits"
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Category *</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as CampusWikiCategory })}
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
                <label className="text-xs font-semibold text-foreground">Content (Markdown / Text) *</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  placeholder="Write comprehensive, helpful information for students..."
                  rows={10}
                  required
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Submit for Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalTarget !== null && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-foreground">Reject Article Submission</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Provide feedback to the author on why this submission cannot be published.
            </p>
            <div className="mt-4">
              <label className="text-xs font-semibold text-foreground">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Inaccurate information, needs citations, duplicate..."
                rows={3}
                className="mt-1.5 w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setRejectModalTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleModerate(rejectModalTarget, "REJECTED", rejectionReason)}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
