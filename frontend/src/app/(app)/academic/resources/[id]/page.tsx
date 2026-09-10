"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ThumbsUp,
  Bookmark,
  CheckCircle2,
  Share2,
  FileText,
  Calendar,
  User,
  History,
  MessageSquare,
  Send,
  Trash2,
  Upload,
  AlertTriangle,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { academicService, AcademicAccessError } from "@/services/academic";
import {
  AcademicResource,
  ResourceComment,
} from "@/types/academic.types";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeptBadge } from "@/components/academic/DeptBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;
  const user = useAuthStore((s) => s.user);

  const [resource, setResource] = useState<AcademicResource | null>(null);
  const [comments, setComments] = useState<ResourceComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [upvoted, setUpvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [newVersionNote, setNewVersionNote] = useState("");
  const [newVersionFile, setNewVersionFile] = useState("");

  const loadResourceData = async () => {
    if (!resourceId) return;
    setLoading(true);
    setAccessError(null);
    try {
      const res = await academicService.getResourceById(resourceId);
      if (!res) {
        setAccessError("Resource not found or has been removed.");
        return;
      }
      setResource(res);
      const [cmts, hasUp, hasBm] = await Promise.all([
        academicService.getResourceComments(resourceId),
        academicService.hasUpvoted(resourceId),
        academicService.isBookmarked(resourceId),
      ]);
      setComments(cmts);
      setUpvoted(hasUp);
      setBookmarked(hasBm);
    } catch (err: any) {
      if (err instanceof AcademicAccessError) {
        setAccessError(err.message);
      } else {
        setAccessError(err.message || "Failed to load resource.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResourceData();
  }, [resourceId, user?.department]);

  const handleUpvote = async () => {
    if (!resource) return;
    try {
      const res = await academicService.toggleUpvote(resource.id);
      setUpvoted(res.upvoted);
      setResource((prev) => (prev ? { ...prev, upvotesCount: res.count } : null));
    } catch (err: any) {
      toast.error(err.message || "Failed to upvote");
    }
  };

  const handleBookmark = async () => {
    if (!resource) return;
    try {
      const res = await academicService.toggleBookmark(resource.id);
      setBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? "Resource saved to bookmarks" : "Removed from bookmarks");
    } catch (err: any) {
      toast.error(err.message || "Failed to bookmark");
    }
  };

  const handleDownload = async () => {
    if (!resource) return;
    try {
      const count = await academicService.recordDownload(resource.id);
      setResource((prev) => (prev ? { ...prev, downloadsCount: count } : null));
      toast.success(`Downloading ${resource.title}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Resource link copied to clipboard!");
    }
  };

  const handleVerify = async () => {
    if (!resource) return;
    try {
      const updated = await academicService.verifyResource(resource.id);
      setResource(updated);
      toast.success("Resource marked as verified by coordinator!");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !resource) return;
    setSubmittingComment(true);
    try {
      const newCmt = await academicService.addResourceComment(resource.id, commentText.trim());
      setComments((prev) => [...prev, newCmt]);
      setCommentText("");
      setResource((prev) =>
        prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null
      );
      toast.success("Comment posted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await academicService.deleteResourceComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setResource((prev) =>
        prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) } : null
      );
      toast.success("Comment deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource) return;
    try {
      const updated = await academicService.uploadNewVersion({
        resourceId: resource.id,
        fileUrl: `/mock/docs/${newVersionFile || "updated_doc.pdf"}`,
        fileSize: 1024 * 1024 * 3.5,
        changeLog: newVersionNote || "Uploaded updated revision",
      });
      setResource(updated);
      setVersionDialogOpen(false);
      setNewVersionNote("");
      setNewVersionFile("");
      toast.success("New version uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload version");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {accessError}
        </p>
        <div className="pt-2">
          <Link href={ROUTES.ACADEMIC_RESOURCES}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Department Resources</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const isCoordinator = academicService.isDeptCoordinator(resource.departmentId);
  const isOwner = user?.id === resource.uploaderId;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Link
        href={ROUTES.ACADEMIC_RESOURCES}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Resources</span>
      </Link>

      {/* Main Resource Card Header */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DeptBadge departmentIdOrName={resource.departmentId} size="md" />
            <Badge variant="outline" className="font-mono text-xs">
              {resource.subjectCode}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Semester {resource.semester}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium">
              {resource.resourceType}
            </Badge>
          </div>

          {resource.isVerifiedByCoordinator ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verified by {resource.verifiedByName || "Coordinator"}</span>
            </div>
          ) : isCoordinator ? (
            <Button
              size="sm"
              onClick={handleVerify}
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verify This Material</span>
            </Button>
          ) : null}
        </div>

        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            {resource.subjectName}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-3">
            {resource.title}
          </h1>
          {resource.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-md font-medium"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Uploader Meta & File Bar */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {resource.uploaderName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{resource.uploaderName}</p>
              <p className="text-[11px]">
                Uploaded on {new Date(resource.createdAt).toLocaleDateString()} • {resource.fileType.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={upvoted ? "default" : "outline"}
              size="sm"
              onClick={handleUpvote}
              className="gap-1.5 text-xs"
            >
              <ThumbsUp className={cn("h-3.5 w-3.5", upvoted && "fill-current")} />
              <span>{resource.upvotesCount} Upvotes</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmark}
              className="gap-1.5 text-xs"
            >
              <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-current text-primary")} />
              <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </Button>

            <Button size="sm" onClick={handleDownload} className="gap-1.5 text-xs shadow-xs">
              <Download className="h-3.5 w-3.5" />
              <span>Download ({resource.downloadsCount})</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Version History Section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Version History</h2>
          </div>
          {(isOwner || isCoordinator) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVersionDialogOpen(true)}
              className="text-xs gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload New Version</span>
            </Button>
          )}
        </div>

        <div className="space-y-2.5">
          {resource.versions && resource.versions.length > 0 ? (
            resource.versions.map((ver) => (
              <div
                key={ver.versionNumber}
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <span>Version {ver.versionNumber}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      by {ver.uploadedBy} on {new Date(ver.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {ver.changeLog && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{ver.changeLog}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleDownload} className="h-7 text-xs gap-1">
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Initial version 1.0 active.</p>
          )}
        </div>
      </div>

      {/* Discussion / Comments Section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Academic Discussion ({comments.length})
          </h2>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <Input
            placeholder="Ask a question about this material or share feedback..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="text-xs h-9 bg-background"
          />
          <Button
            type="submit"
            size="sm"
            disabled={submittingComment || !commentText.trim()}
            className="gap-1.5 h-9 text-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Post</span>
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No questions or comments yet. Start the conversation!
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="group p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{c.userName}</span>
                    <span className="text-[11px]">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  {(c.userId === user?.id || user?.role === "ADMIN" || user?.role === "MODERATOR") && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-foreground leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload New Version Dialog */}
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Upload Updated Version</span>
            </DialogTitle>
            <DialogDescription>
              Upload corrections, additional unit notes, or improved diagrams.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadVersion} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Change Summary</Label>
              <Input
                placeholder="e.g. Added Unit 5 practice problems and SQL solutions"
                value={newVersionNote}
                onChange={(e) => setNewVersionNote(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select File</Label>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setNewVersionFile(file.name);
                }}
                className="text-xs h-9 cursor-pointer"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVersionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Upload Version</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
