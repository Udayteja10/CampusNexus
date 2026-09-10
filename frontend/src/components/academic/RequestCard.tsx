"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  FileCheck2,
  Send,
} from "lucide-react";
import { AcademicRequest, RequestComment } from "@/types/academic.types";
import { academicService } from "@/services/academic";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeptBadge } from "./DeptBadge";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface RequestCardProps {
  request: AcademicRequest;
  onUpdate?: () => void;
  className?: string;
}

export function RequestCard({ request, onUpdate, className }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const toggleComments = async () => {
    if (!expanded) {
      setLoadingComments(true);
      try {
        const list = await academicService.getRequestComments(request.id);
        setComments(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const newCmt = await academicService.addRequestComment(request.id, commentText.trim());
      setComments((prev) => [...prev, newCmt]);
      setCommentText("");
      toast.success("Response posted!");
      onUpdate?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const isFulfilled = request.status === "FULFILLED";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-xs",
        isFulfilled ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "",
        className
      )}
    >
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <DeptBadge departmentIdOrName={request.departmentId} size="sm" />
          <Badge variant="secondary" className="text-[10px] font-medium">
            Sem {request.semester}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-medium">
            {request.resourceType}
          </Badge>
        </div>

        {isFulfilled ? (
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Fulfilled</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock className="h-3.5 w-3.5" />
            <span>Open Request</span>
          </div>
        )}
      </div>

      {/* Subject & Title */}
      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
        {request.subjectCode} • {request.subjectName}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 leading-snug">
        {request.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        {request.description}
      </p>

      {/* Fulfilled Reference Link */}
      {isFulfilled && request.fulfilledResourceId && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between gap-2 mb-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <FileCheck2 className="h-4 w-4 shrink-0" />
            <span className="font-medium truncate">
              {request.fulfilledResourceTitle || "Resolved with shared resource"}
            </span>
          </div>
          <Link href={ROUTES.ACADEMIC_RESOURCE_DETAIL(request.fulfilledResourceId)}>
            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-300 dark:border-emerald-700">
              View Resource
            </Button>
          </Link>
        </div>
      )}

      {/* Footer Info */}
      <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Requested by <span className="font-medium text-foreground">{request.requesterName}</span>
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleComments}
            className="h-8 text-xs gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              {comments.length > 0 ? comments.length : request.commentsCount}{" "}
              {comments.length === 1 ? "Response" : "Responses"}
            </span>
          </Button>
        </div>
      </div>

      {/* Expanded Comments Section */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              Loading responses...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No responses yet. Have notes or materials that can help? Share them below!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                    <span className="text-foreground font-semibold">{c.userName}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{c.content}</p>
                  {c.suggestedResourceUrl && (
                    <a
                      href={c.suggestedResourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-[11px] block mt-1"
                    >
                      🔗 {c.suggestedResourceUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add response form */}
          <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
            <Input
              placeholder="Suggest a solution, link, or upload note..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="h-8 text-xs bg-background"
            />
            <Button
              type="submit"
              size="sm"
              disabled={submittingComment || !commentText.trim()}
              className="h-8 px-3 text-xs gap-1"
            >
              <Send className="h-3 w-3" />
              <span>Reply</span>
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
