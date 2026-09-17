"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { SupportRequest } from "@/types/help.types";
import { helpService } from "@/services/help";
import { HELP_CATEGORIES } from "@/services/help/help.seed";
import { StatusBadge } from "@/components/help/StatusBadge";
import { PriorityBadge } from "@/components/help/PriorityBadge";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Send,
  Loader2,
  Link as LinkIcon,
  ShieldAlert,
  User,
  Headphones,
} from "lucide-react";
import { format } from "date-fns";

interface RequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SupportRequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = use(params);

  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    helpService
      .getSupportRequestById(id)
      .then((data) => {
        if (isMounted) {
          setRequest(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRequest(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !request) return;

    setSubmittingReply(true);
    setError(null);

    try {
      const updated = await helpService.addMessageToRequest(request.id, replyContent.trim());
      setRequest(updated);
      setReplyContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add message.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!request) return;
    if (!window.confirm("Are you sure you want to mark this support request as closed?")) return;

    setClosing(true);
    try {
      const updated = await helpService.closeSupportRequest(request.id);
      setRequest(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close support request.");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto max-w-2xl py-16 px-4 text-center">
        <div className="rounded-3xl border border-border bg-card p-10 space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Support Request Not Accessible</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This support request does not exist or you do not have permission to view tickets submitted by other students.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              render={
                <Link href={ROUTES.HELP_REQUESTS}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to My Requests
                </Link>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const categoryMeta = HELP_CATEGORIES.find((c) => c.id === request.category);

  let formattedCreated = "";
  let formattedUpdated = "";
  try {
    formattedCreated = format(new Date(request.createdAt), "MMMM d, yyyy • h:mm a");
    formattedUpdated = format(new Date(request.updatedAt), "MMMM d, yyyy • h:mm a");
  } catch {
    formattedCreated = "Recently";
    formattedUpdated = "Recently";
  }

  const isClosed = request.status === "CLOSED";

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={ROUTES.HELP_REQUESTS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Support Requests
        </Link>

        {!isClosed && (
          <Button
            variant="outline"
            size="xs"
            onClick={handleCloseTicket}
            disabled={closing}
            className="rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40"
          >
            {closing ? "Closing..." : "Close Ticket"}
          </Button>
        )}
      </div>

      {/* Main Request Summary Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
              #{request.id}
            </span>
            <span className="text-xs font-semibold text-foreground/80">
              {categoryMeta?.label || request.category}
            </span>
            <PriorityBadge priority={request.priority} />
          </div>

          <StatusBadge status={request.status} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
            {request.subject}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Submitted {formattedCreated}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Last update {formattedUpdated}
            </span>
          </div>
        </div>

        {/* Related Route if available */}
        {request.relatedRoute && (
          <div className="flex items-center gap-2 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/50">
            <LinkIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Referenced feature:</span>
            <Link
              href={request.relatedRoute}
              className="font-mono text-primary hover:underline font-semibold"
            >
              {request.relatedRoute}
            </Link>
          </div>
        )}

        {/* Original Description */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Original Inquiry Details
          </h3>
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/40 whitespace-pre-line">
            {request.description}
          </p>
        </div>
      </div>

      {/* Timeline & Follow-up Messages */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Updates & Conversation</h2>

        {request.messages && request.messages.length > 0 ? (
          <div className="space-y-3">
            {request.messages.map((msg) => {
              let msgDate = "";
              try {
                msgDate = format(new Date(msg.createdAt), "MMM d, yyyy • h:mm a");
              } catch {
                msgDate = "Recently";
              }

              return (
                <div
                  key={msg.id}
                  className={`rounded-2xl border p-4 sm:p-5 space-y-2 ${
                    msg.isStaff
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                          msg.isStaff
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {msg.isStaff ? (
                          <Headphones className="h-3.5 w-3.5" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-foreground">
                        {msg.authorName}
                      </span>
                      {msg.isStaff && (
                        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                          Support Coordinator
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-muted-foreground">{msgDate}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-9 whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-card/30">
            <p className="text-xs text-muted-foreground">
              No follow-up messages yet. Support coordinators will update this ticket upon review.
            </p>
          </div>
        )}
      </div>

      {/* Add Follow-up Message Box */}
      {!isClosed ? (
        <form
          onSubmit={handleAddReply}
          className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-3 shadow-sm"
        >
          <h3 className="text-sm font-bold text-foreground">Add Follow-up Information</h3>

          {error && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-xl">
              {error}
            </div>
          )}

          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Type your response or additional context here..."
            rows={3}
            className="rounded-xl leading-relaxed text-xs sm:text-sm"
            required
          />

          <div className="flex items-center justify-end pt-1">
            <Button
              type="submit"
              disabled={submittingReply || !replyContent.trim()}
              className="rounded-xl font-semibold gap-2"
              size="sm"
            >
              {submittingReply ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
          This support ticket has been closed. If you have a new question, please{" "}
          <Link href={ROUTES.HELP_CONTACT} className="text-primary font-semibold hover:underline">
            submit a new support request
          </Link>
          .
        </div>
      )}
    </div>
  );
}
