"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Send, EyeOff, Globe } from "lucide-react";
import { Comment } from "@/types/post.types";
import { CommentItem } from "./CommentItem";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { useCommunityStore } from "@/store/community.store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const store = useCommunityStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for top-level comment
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await MockCommunityServiceInstance.getComments(postId);
        setComments(data);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to load comments.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPostComments();
    
    // Rename variable to fetchPostComments inside to prevent shadow issues
    function fetchPostComments() {
      fetchComments();
    }
  }, [postId]);

  // Handle top-level comment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setFormError("Comment content cannot be empty.");
      return;
    }

    if (trimmed.length > 500) {
      setFormError("Comment cannot exceed 500 characters.");
      return;
    }

    setSubmitLoading(true);
    try {
      const newComment = await MockCommunityServiceInstance.addComment(postId, {
        content: trimmed,
        isAnonymous,
      });

      setComments((prev) => [...prev, newComment]);
      store.incrementCommentCount(postId);
      
      setContent("");
      setIsAnonymous(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to post comment.";
      setFormError(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle nested reply submission
  const handleReplySubmit = async (parentId: string, replyContent: string, replyAnonymous: boolean) => {
    const newReply = await MockCommunityServiceInstance.addComment(postId, {
      content: replyContent,
      isAnonymous: replyAnonymous,
      parentId,
    });

    setComments((prev) => [...prev, newReply]);
    store.incrementCommentCount(postId);
  };

  // Handle comment/reply reactions (👍 and 👎, mutually exclusive)
  const handleCommentReact = async (commentId: string, emoji: string) => {
    const previousComments = [...comments];
    
    // Optimistic Update Local State
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        if (!c.reactions || c.reactions.length === 0) {
          c.reactions = [
            { emoji: "👍", count: 0, reactedByMe: false },
            { emoji: "👎", count: 0, reactedByMe: false }
          ];
        }

        const likeReaction = c.reactions.find((r) => r.emoji === "👍") || { emoji: "👍", count: 0, reactedByMe: false };
        const dislikeReaction = c.reactions.find((r) => r.emoji === "👎") || { emoji: "👎", count: 0, reactedByMe: false };

        c.reactions = [likeReaction, dislikeReaction];

        if (emoji === "👍") {
          if (likeReaction.reactedByMe) {
            likeReaction.reactedByMe = false;
            likeReaction.count = Math.max(0, likeReaction.count - 1);
          } else {
            likeReaction.reactedByMe = true;
            likeReaction.count += 1;
            if (dislikeReaction.reactedByMe) {
              dislikeReaction.reactedByMe = false;
              dislikeReaction.count = Math.max(0, dislikeReaction.count - 1);
            }
          }
        } else if (emoji === "👎") {
          if (dislikeReaction.reactedByMe) {
            dislikeReaction.reactedByMe = false;
            dislikeReaction.count = Math.max(0, dislikeReaction.count - 1);
          } else {
            dislikeReaction.reactedByMe = true;
            dislikeReaction.count += 1;
            if (likeReaction.reactedByMe) {
              likeReaction.reactedByMe = false;
              likeReaction.count = Math.max(0, likeReaction.count - 1);
            }
          }
        }
      }
      return c;
    });

    setComments(updated);

    try {
      const updatedComment = await MockCommunityServiceInstance.toggleCommentReaction(postId, commentId, emoji);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)));
    } catch (err) {
      setComments(previousComments);
      console.error("Failed to toggle comment reaction:", err);
    }
  };

  // Handle comment deletion (cascade deletion is handled in service)
  const handleDeleteComment = async (commentId: string) => {
    try {
      await MockCommunityServiceInstance.deleteComment(postId, commentId);
      
      // Update local state (remove both parent comment and its children if any)
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      
      // Reload comments to keep counts sync'd correctly
      const data = await MockCommunityServiceInstance.getComments(postId);
      setComments(data);
      store.decrementCommentCount(postId, data.length);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete comment.";
      alert(errMsg);
    }
  };

  // Top level comments only
  const topLevelComments = comments.filter((c) => !c.parentId);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
        <MessageSquare className="h-4 w-4" />
        <span>Comments ({comments.length})</span>
      </h3>

      {/* Top Level Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {formError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertDescription className="text-xs">{formError}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitLoading}
            maxLength={500}
            className="min-h-[80px] text-xs resize-none rounded-xl bg-muted/20 border-border/60 p-3.5 pr-10"
          />
          <Button
            type="submit"
            disabled={submitLoading || !content.trim()}
            size="icon"
            className="absolute right-2.5 bottom-2.5 h-7 w-7 rounded-lg bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white shrink-0"
          >
            {submitLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          {/* Anonymous toggle */}
          <div className="flex items-center gap-2 h-7">
            <Switch
              id="comment-anonymous-toggle"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              disabled={submitLoading}
            />
            <Label
              htmlFor="comment-anonymous-toggle"
              className="flex items-center gap-1 cursor-pointer font-semibold text-muted-foreground select-none"
            >
              {isAnonymous ? (
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

          <span>{content.length}/500 characters</span>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--cn-indigo)]" />
        </div>
      ) : error ? (
        <div className="text-center py-6 text-sm text-destructive font-medium">{error}</div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
          No comments yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comments.filter((reply) => reply.parentId === comment.id)}
              onDelete={handleDeleteComment}
              onReact={handleCommentReact}
              onReplySubmit={handleReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
