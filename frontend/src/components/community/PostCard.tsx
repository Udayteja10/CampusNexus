"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  MessageSquare,
  Edit2,
  Trash2,
  Flag,
  Shield,
  Loader2,
  AlertTriangle,
  Pin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Post } from "@/types/post.types";
import { useAuthStore } from "@/store/auth.store";
import { useCommunityStore } from "@/store/community.store";
import { useReaction } from "@/hooks/useReaction";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { CategoryBadge } from "./CategoryBadge";
import { ReactionButton } from "./ReactionButton";
import { ReportDialog } from "./ReportDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface PostCardProps {
  post: Post;
  isDetailed?: boolean;
}

export function PostCard({ post, isDetailed = false }: PostCardProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const store = useCommunityStore();
  const { reactions, toggleReaction } = useReaction(post.id, post.reactions);

  const [reportOpen, setReportOpen] = useState(false);

  const isMyPost = currentUser && post.author && post.author.id === currentUser.id;
  const isModerator = currentUser?.role === "MODERATOR";
  const isAdmin = currentUser?.role === "ADMIN";
  const hasModPrivileges = isModerator || isAdmin;

  const initials = post.author
    ? post.author.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await MockCommunityServiceInstance.deletePost(post.id);
        store.removeLocalPost(post.id);
        if (isDetailed) {
          router.push(ROUTES.COMMUNITY);
        }
      } catch (err) {
        console.error("Failed to delete post:", err);
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  const handleCardClick = () => {
    if (!isDetailed && post.status !== "pending") {
      router.push(ROUTES.POST_DETAIL(post.id));
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className={cn(
          "border-border/60 shadow-sm transition-all duration-200",
          !isDetailed && "cursor-pointer hover:border-border hover:shadow-md",
          post.status === "pending" && "opacity-70 pointer-events-none",
          post.status === "error" && "border-destructive/40 bg-destructive/5"
        )}
      >
        {/* Optimistic Status Banner */}
        {post.status === "pending" && (
          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--cn-indigo)]/10 text-[var(--cn-indigo)] text-xs font-medium border-b border-[var(--cn-indigo)]/25 rounded-t-lg">
            <Loader2 className="h-3 w-3 animate-spin" />
            Posting your update...
          </div>
        )}
        {post.status === "error" && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--cn-rose)]/10 text-[var(--cn-rose)] text-xs font-medium border-b border-[var(--cn-rose)]/25 rounded-t-lg">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Failed to post. Check your connection.
            </div>
            <Button
              variant="link"
              className="h-auto p-0 text-xs font-semibold text-[var(--cn-rose)] underline hover:text-[var(--cn-rose)]/80"
              onClick={() => store.removeLocalPost(post.id)}
            >
              Dismiss
            </Button>
          </div>
        )}

        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-3">
            {post.isAnonymous ? (
              <Avatar className="h-10 w-10 border bg-muted select-none">
                <AvatarFallback className="bg-muted text-muted-foreground font-semibold">❓</AvatarFallback>
              </Avatar>
            ) : (
              <Link
                href={post.author ? ROUTES.PROFILE(post.author.username) : "#"}
                onClick={(e) => e.stopPropagation()}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Avatar className="h-10 w-10 border hover:opacity-90">
                  <AvatarFallback className="bg-[var(--cn-indigo)]/15 text-[var(--cn-indigo)] text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}

            <div>
              <div className="flex items-center gap-1.5">
                {post.isAnonymous ? (
                  <span className="font-semibold text-foreground text-sm select-none">Anonymous</span>
                ) : (
                  <Link
                    href={post.author ? ROUTES.PROFILE(post.author.username) : "#"}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-foreground text-sm hover:underline hover:text-[var(--cn-indigo)]"
                  >
                    {post.author?.fullName}
                  </Link>
                )}
                {post.category && (
                  <CategoryBadge
                    category={post.category}
                    onClick={
                      !isDetailed
                        ? () => store.setCategory(post.category)
                        : undefined
                    }
                  />
                )}
                {post.isPinned && (
                  <span className="flex items-center gap-0.5 text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    <Pin className="h-2.5 w-2.5 rotate-45" /> Pinned
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-none mt-1">
                {timeAgo}
                {post.isEdited && <span className="ml-1 text-[10px] text-muted-foreground/60">(edited)</span>}
              </p>
            </div>
          </div>

          {/* More Actions Menu */}
          {post.status !== "pending" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  {isMyPost && !post.isAnonymous && (
                    <DropdownMenuItem
                      render={
                        <Link href={ROUTES.POST_EDIT(post.id)} className="flex w-full items-center gap-2">
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit Post
                        </Link>
                      }
                    />
                  )}
                  {isMyPost && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete Post
                    </DropdownMenuItem>
                  )}
                  {!isMyPost && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportOpen(true);
                      }}
                    >
                      <Flag className="mr-2 h-3.5 w-3.5" />
                      Report Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                {hasModPrivileges && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className="text-destructive font-semibold focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Shield className="mr-2 h-3.5 w-3.5 text-destructive" />
                        [Mod] Remove Post
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="pb-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed select-text">
          {post.content}
        </CardContent>

        <CardFooter className="pt-2 pb-3 flex items-center justify-between border-t border-border/40 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {reactions.map((r) => (
              <ReactionButton
                key={r.emoji}
                emoji={r.emoji}
                count={r.count}
                isActive={r.reactedByMe}
                onClick={() => toggleReaction(r.emoji)}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors py-1 px-2.5 rounded-full hover:bg-muted select-none">
            <MessageSquare className="h-4 w-4" />
            <span>
              {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}
            </span>
          </div>
        </CardFooter>
      </Card>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="POST"
        targetId={post.id}
      />
    </>
  );
}
