"use client";

import Link from "next/link";
import { Plus, AlertCircle, RotateCcw, MessageSquare } from "lucide-react";

import { useCommunityFeed } from "@/hooks/useCommunityFeed";
import { useCommunityStore } from "@/store/community.store";
import { PostCard } from "./PostCard";
import { CommunityFilters } from "./CommunityFilters";
import { NewPostsIndicator } from "./NewPostsIndicator";
import { FeedSkeleton } from "./PostSkeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants";

export function CommunityFeed() {
  const {
    posts,
    pendingCount,
    loading,
    error,
    flushNewPosts,
  } = useCommunityFeed();

  const store = useCommunityStore();
  
  const hasActiveFilters = !!(store.filters.search || store.filters.category);

  return (
    <div className="space-y-5">
      {/* Feed Title / Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
            Campus Discussions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 sm:text-sm">
            Share ideas, ask questions, and engage with the campus community.
          </p>
        </div>
        <Link href={ROUTES.CREATE_POST}>
          <Button
            size="sm"
            className="bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white font-medium gap-1.5 h-9 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </Link>
      </div>

      {/* Filter Options */}
      <CommunityFilters />

      {/* "N New Posts" Indicator */}
      <NewPostsIndicator count={pendingCount} onClick={flushNewPosts} />

      {/* Feed Content */}
      {loading && posts.length === 0 ? (
        <FeedSkeleton />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.loadPosts()}
              className="border-destructive/30 hover:bg-destructive/10 text-destructive h-8 text-xs font-semibold gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : posts.length === 0 ? (
        hasActiveFilters ? (
          // Search/filter active but empty results
          <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl bg-card/20 max-w-lg mx-auto space-y-3">
            <p className="text-sm font-semibold text-foreground">No discussions found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              There are no discussions matching your active filters. Try resetting search query or categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                store.setSearch("");
                store.setCategory(undefined);
              }}
              className="text-xs h-8.5 rounded-lg"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          // Completely empty feed state
          <div className="text-center py-16 border border-dashed border-border/60 rounded-2xl bg-card/20 max-w-lg mx-auto space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--cn-indigo)]/10 text-[var(--cn-indigo)]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No discussions yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Be the first to start a conversation. Ask a question or share something interesting with your peers!
              </p>
            </div>
            <Link href={ROUTES.CREATE_POST}>
              <Button
                size="sm"
                className="bg-[var(--cn-indigo)] hover:bg-[var(--cn-indigo)]/90 text-white text-xs rounded-lg"
              >
                Create First Post
              </Button>
            </Link>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
