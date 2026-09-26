"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { helpService } from "@/services/help";
import { moderationService } from "@/services/moderation";
import { SupportRequest, SupportRequestStatus } from "@/types/help.types";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export default function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const currentUser = useAuthStore((s) => s.user);

  const [ticket, setTicket] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reply State
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const data = await helpService.getSupportRequestById(id);
        if (!data) {
          setError("Support ticket not found.");
        } else {
          setTicket(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load support ticket.");
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [id]);

  const handleStatusChange = async (newStatus: SupportRequestStatus) => {
    if (!ticket) return;
    try {
      const updated = await helpService.updateSupportStatus(ticket.id, newStatus);
      setTicket(updated);

      // Record audit log
      if (currentUser) {
        await moderationService.createAuditEntry({
          actorId: currentUser.id,
          actorName: currentUser.fullName,
          actorRole: (currentUser.role as "MODERATOR" | "ADMIN") || "MODERATOR",
          action: "SUPPORT_STATUS_CHANGED",
          targetType: "SUPPORT_TICKET",
          targetId: ticket.id,
          targetSummary: ticket.subject,
          reason: `Ticket status updated to ${newStatus}`,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !ticket) return;

    setSubmittingReply(true);
    try {
      const updated = await helpService.addMessageToRequest(ticket.id, replyContent.trim());
      setTicket(updated);
      setReplyContent("");
      toast.success("Reply dispatched.");

      // Record audit log
      if (currentUser) {
        await moderationService.createAuditEntry({
          actorId: currentUser.id,
          actorName: currentUser.fullName,
          actorRole: (currentUser.role as "MODERATOR" | "ADMIN") || "MODERATOR",
          action: "SUPPORT_REPLIED",
          targetType: "SUPPORT_TICKET",
          targetId: ticket.id,
          targetSummary: ticket.subject,
          reason: "Staff response added to support ticket",
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading support ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Ticket Not Found</h2>
        <p className="text-sm text-muted-foreground">{error || "The requested support ticket does not exist."}</p>
        <Link
          href={ROUTES.ADMIN_SUPPORT}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Support Desk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.ADMIN_SUPPORT}
            aria-label="Back to Support Queue"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-xl")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {ticket.subject}
              </h1>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                #{ticket.id}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted by <span className="font-semibold text-foreground">{ticket.userFullName}</span> ({ticket.userEmail}) on {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Ticket Status:</span>
          <Select
            value={ticket.status}
            onValueChange={(val) => handleStatusChange(val as SupportRequestStatus)}
          >
            <SelectTrigger className="w-[150px] h-9 text-xs rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid: Thread & Meta */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Message Thread */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Original Request */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{ticket.userFullName} (Student)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="mt-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Conversation History</h3>

            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-4 border ${
                    msg.isStaff
                      ? "bg-primary/5 border-primary/20 ml-6"
                      : "bg-card border-border mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      {msg.isStaff ? (
                        <>
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold text-primary">{msg.authorName} (Staff)</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">{msg.authorName}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No staff replies sent yet.
              </div>
            )}
          </div>

          {/* Reply Box */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Reply as Staff</h3>
            <form onSubmit={handleSendReply} className="space-y-3">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write official staff guidance or resolution details to the student..."
                rows={4}
                className="rounded-xl text-sm leading-relaxed"
                required
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  The student will see this response in their Help &amp; Support portal.
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingReply || !replyContent.trim()}
                  className="rounded-xl"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {submittingReply ? "Sending..." : "Send Staff Response"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Metadata Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">
              Ticket Details
            </h2>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground">Category</span>
                <div className="mt-1 font-semibold text-foreground">{ticket.category}</div>
              </div>

              <div>
                <span className="text-muted-foreground">Priority</span>
                <div className="mt-1 font-semibold text-foreground">{ticket.priority}</div>
              </div>

              <div>
                <span className="text-muted-foreground">Student Email</span>
                <div className="mt-1 font-mono text-foreground">{ticket.userEmail}</div>
              </div>

              <div>
                <span className="text-muted-foreground">Student ID</span>
                <div className="mt-1 font-mono text-foreground">{ticket.userId}</div>
              </div>

              <div>
                <span className="text-muted-foreground">Created Timestamp</span>
                <div className="mt-1 text-foreground">{new Date(ticket.createdAt).toLocaleString()}</div>
              </div>

              <div>
                <span className="text-muted-foreground">Last Updated</span>
                <div className="mt-1 text-foreground">{new Date(ticket.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
