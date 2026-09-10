"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Flag, Shield, MoreVertical, CornerDownRight, EyeOff, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Comment } from "@/types/post.types";
import { useAuthStore } from "@/store/auth.store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ReactionButton } from "./ReactionButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "./ReportDialog";
import { ROUTES } from "@/lib/constants";

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  onDelete: (commentId: string) => Promise<void>;
  onReact: (commentId: string, emoji: string) => Promise<void>;
  onReplySubmit?: (parentId: string, content: string, isAnonymous: boolean) => Promise<void>;
}

export function CommentItem({
  comment,
  replies = [],
  onDelete,
  onReact,
  onReplySubmit,
}: CommentItemProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reply inline states
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const isMyComment = currentUser && comment.author && comment.author.id === currentUser.id;
  const isModerator = currentUser?.role === "MODERATOR";
  const isAdmin = currentUser?.role === "ADMIN";
  const hasModPrivileges = isModerator || isAdmin;

  // Safe reaction lookup
  const likeReaction = comment.reactions?.find((r) => r.emoji === "👍") || { emoji: "👍", count: 0, reactedByMe: false };
  const dislikeReaction = comment.reactions?.find((r) => r.emoji === "👎") || { emoji: "👎", count: 0, reactedByMe: false };

  const initials = comment.author
    ? comment.author.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      setDeleting(true);
      try {
        await onDelete(comment.id);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReplySubmit) return;

    setSubmittingReply(true);
    try {
      await onReplySubmit(comment.id, replyContent.trim(), replyAnonymous);
      setReplyContent("");
      setReplyAnonymous(false);
      setShowReplyInput(false);
    } catch (err) {
      console.error("Failed to submit reply:", err);
      alert("Failed to submit reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {/* Comment block */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/25 border border-border/40 group relative">
          {comment.isAnonymous ? (
            <Avatar className="h-8 w-8 border bg-muted select-none">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">❓</AvatarFallback>
            </Avatar>
          ) : (
            <Link
              href={comment.author ? ROUTES.PROFILE(comment.author.username) : "#"}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            >
              <Avatar className="h-8 w-8 border hover:opacity-90">
                <AvatarFallback className="bg-[var(--cn-indigo)]/15 text-[var(--cn-indigo)] text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {comment.isAnonymous ? (
                <span className="font-semibold text-foreground text-xs select-none">Anonymous</span>
              ) : (
                <Link
                  href={comment.author ? ROUTES.PROFILE(comment.author.username) : "#"}
                  className="font-semibold text-foreground text-xs hover:underline hover:text-[var(--cn-indigo)]"
                >
                  {comment.author?.fullName}
                </Link>
              )}
              <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
            </div>

            <p className="text-xs text-foreground/90 mt-1 select-text leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Reactions & Actions Row */}
            <div className="flex items-center gap-3 mt-2">
              <ReactionButton
                emoji="👍"
                count={likeReaction.count}
                isActive={likeReaction.reactedByMe}
                onClick={() => onReact(comment.id, "👍")}
                className="h-7 px-2.5"
              />
              <ReactionButton
                emoji="👎"
                count={dislikeReaction.count}
                isActive={dislikeReaction.reactedByMe}
                onClick={() => onReact(comment.id, "👎")}
                className="h-7 px-2.5"
              />

              {/* Inline Reply Trigger (Only for top-level comments) */}
              {!comment.parentId && onReplySubmit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="h-7 text-[10px] font-semibold text-muted-foreground hover:text-foreground px-2"
                >
                  Reply
                </Button>
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    aria-label="Comment actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  {isMyComment && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {!isMyComment && (
                    <DropdownMenuItem onClick={() => setReportOpen(true)}>
                      <Flag className="mr-2 h-3.5 w-3.5" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                {hasModPrivileges && (
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-destructive font-semibold focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Shield className="mr-2 h-3.5 w-3.5 text-destructive" />
                      [Mod] Remove
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Inline Reply Composer Block */}
        {showReplyInput && (
          <form onSubmit={handleReplySubmit} className="pl-8 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex gap-2">
              <CornerDownRight className="h-4 w-4 text-muted-foreground/60 mt-2.5 shrink-0" />
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={submittingReply}
                maxLength={500}
                className="min-h-[60px] text-xs resize-none rounded-xl bg-muted/20 border-border/60 p-2.5"
              />
            </div>
            <div className="pl-6 flex items-center justify-between">
              {/* Anonymous Reply Switch */}
              <div className="flex items-center gap-1.5 h-6">
                <Switch
                  id={`anon-reply-${comment.id}`}
                  checked={replyAnonymous}
                  onCheckedChange={setReplyAnonymous}
                  disabled={submittingReply}
                />
                <Label htmlFor={`anon-reply-${comment.id}`} className="flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-muted-foreground select-none">
                  {replyAnonymous ? (
                    <>
                      <EyeOff className="h-3 w-3 text-amber-500" />
                      <span>Anonymous</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3 text-[var(--cn-indigo)]" />
                      <span>Public</span>
                    </>
                  )}
                </Label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyInput(false)}
                  disabled={submittingReply}
                  className="h-7 text-[10px] px-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingReply || !replyContent.trim()}
                  className="h-7 bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white text-[10px] font-medium px-3 rounded-lg"
                >
                  Reply
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Nested Replies Rendering */}
        {replies.length > 0 && (
          <div className="pl-8 border-l border-border/40 space-y-2 mt-2">
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <CornerDownRight className="h-4 w-4 text-muted-foreground/40 mt-3 shrink-0" />
                <div className="flex-1">
                  <CommentItem
                    comment={reply}
                    onDelete={onDelete}
                    onReact={onReact}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="COMMENT"
        targetId={comment.id}
        postId={comment.postId}
      />
    </>
  );
}
