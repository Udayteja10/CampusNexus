"use client";

import { useEffect } from "react";
import { useCommunityStore } from "@/store/community.store";
import { CommunityEventBus } from "@/services/community/community-event-bus";
import { useAuthStore } from "@/store/auth.store";
import { Post, ReactionSummary } from "@/types/post.types";

export function useCommunityFeed() {
  const store = useCommunityStore();
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    // Load initial feed
    store.loadPosts();

    // Subscribe to Event Bus for all community events
    const unsubscribe = CommunityEventBus.subscribe("*", (event) => {
      const { type, postId, payload } = event;

      switch (type) {
        case "POST_CREATED": {
          const newPost = payload as Post;
          // Determine if we authored it
          const isMyPost = currentUser && newPost.author && newPost.author.id === currentUser.id;
          
          if (isMyPost) {
            // Already handled optimistically or we replace the temp one if any
            // We refresh the local list to ensure correct ordering/ids
            store.loadPosts();
          } else {
            // Created by another user -> add to queue
            store.addPendingNewPost(newPost);
          }
          break;
        }

        case "POST_UPDATED": {
          store.updateLocalPost(payload as Post);
          break;
        }

        case "POST_DELETED": {
          store.removeLocalPost(postId);
          break;
        }

        case "COMMENT_CREATED": {
          store.incrementCommentCount(postId);
          break;
        }

        case "COMMENT_DELETED": {
          store.decrementCommentCount(postId, (payload as { commentsCount: number }).commentsCount);
          break;
        }

        case "REACTION_UPDATED": {
          store.updateLocalReactions(postId, payload as ReactionSummary[]);
          break;
        }

        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return {
    posts: store.posts,
    pendingCount: store.pendingNewPosts.length,
    loading: store.loading,
    error: store.error,
    filters: store.filters,
    setSearch: store.setSearch,
    setCategory: store.setCategory,
    setSort: store.setSort,
    flushNewPosts: store.flushNewPosts,
  };
}
