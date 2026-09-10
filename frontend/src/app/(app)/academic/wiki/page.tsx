"use client";

import React, { useEffect, useState } from "react";
import {
  Star,
  Search,
  BookOpen,
  Plus,
  Shield,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { academicService } from "@/services/academic";
import { WikiArticle, WikiCategory } from "@/types/academic.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { WikiArticleCard } from "@/components/academic/WikiArticleCard";
import { AcademicEmptyState } from "@/components/academic/AcademicEmptyState";
import { toast } from "@/lib/toast";

const CATEGORIES: { value: WikiCategory; label: string }[] = [
  { value: "ACADEMIC_POLICIES", label: "Academic Policies & Grading" },
  { value: "CAMPUS_GUIDE", label: "Campus Facilities & Library" },
  { value: "EXAM_RULES", label: "Exam Rules & Regulations" },
  { value: "LAB_PROTOCOLS", label: "Lab Safety & Hardware" },
  { value: "FAQ", label: "Frequently Asked Questions" },
  { value: "GENERAL", label: "General Guidelines" },
];

export default function AcademicWikiPage() {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WikiCategory>("CAMPUS_GUIDE");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const list = await academicService.getWikiArticles(
        selectedCategory !== "ALL" ? (selectedCategory as WikiCategory) : undefined,
        search.trim() || undefined
      );
      setArticles(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, search]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter a title and content.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await academicService.createWikiArticle({
        title: title.trim(),
        category,
        content: content.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ["Guide"],
      });

      toast.success("Wiki article published!");
      setCreateDialogOpen(false);
      setTitle("");
      setContent("");
      setTags("");
      loadArticles();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to publish article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 text-primary fill-primary/20" />
            <span>Campus Wiki & Academic Handbook</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Shared university knowledge base for CGPA calculation, exam protocols, library digital subscriptions, and lab safety rules.
          </p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" />
          <span>Contribute Article</span>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wiki articles by title, policy, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
            selectedCategory === "ALL"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40"
          }`}
        >
          All Topics ({articles.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <AcademicEmptyState
          icon={BookOpen}
          title="No wiki articles found"
          description="Try selecting a different topic category or search with different keywords."
          actionLabel="Show All Topics"
          onAction={() => setSelectedCategory("ALL")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <WikiArticleCard key={art.id} article={art} onUpdate={loadArticles} />
          ))}
        </div>
      )}

      {/* Contribute Article Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Contribute to Campus Wiki</span>
            </DialogTitle>
            <DialogDescription>
              Share guidelines, exam tips, or departmental procedures with the entire campus.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateArticle} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="wiki-title" className="text-xs font-semibold">
                Article Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="wiki-title"
                placeholder="e.g. Complete Guide to IEEE Digital Access & Research Paper Formatting"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(val) => val && setCategory(val as WikiCategory)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wiki-content" className="text-xs font-semibold">
                Article Content (Markdown supported) <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="wiki-content"
                placeholder="Write your article in structured markdown. Headings (#, ##), bullet points, and code blocks are supported..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="font-mono text-xs resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wiki-tags" className="text-xs font-semibold">
                Tags (comma separated)
              </Label>
              <Input
                id="wiki-tags"
                placeholder="e.g. IEEE, Research, Library, Guidelines"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
