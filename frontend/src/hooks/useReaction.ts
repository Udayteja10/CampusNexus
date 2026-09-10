"use client";

import { useState } from "react";
import { useCommunityStore } from "@/store/community.store";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";
import { ReactionSummary } from "@/types/post.types";

export function useReaction(postId: string, initialReactions: ReactionSummary[]) {
  const [reactions, setReactions] = useState<ReactionSummary[]>(initialReactions);
  const store = useCommunityStore();

  const toggleReaction = async (emoji: string) => {
    // 1. Optimistic Update Local State
    const previousReactions = [...reactions];
    const updated = reactions.map((r) => {
      if (r.emoji === emoji) {
        return {
          ...r,
          count: r.reactedByMe ? Math.max(0, r.count - 1) : r.count + 1,
          reactedByMe: !r.reactedByMe,
        };
      }
      return r;
    });
    
    // Check if the emoji wasn't in the list
    const exists = reactions.some((r) => r.emoji === emoji);
    if (!exists) {
      updated.push({ emoji, count: 1, reactedByMe: true });
    }

    setReactions(updated);
    store.updateLocalReactions(postId, updated);

    try {
      // 2. Call service
      const updatedPost = await MockCommunityServiceInstance.toggleReaction(postId, emoji);
      setReactions(updatedPost.reactions);
      store.updateLocalReactions(postId, updatedPost.reactions);
    } catch (err) {
      // 3. Rollback on failure
      setReactions(previousReactions);
      store.updateLocalReactions(postId, previousReactions);
      console.error("Failed to toggle reaction:", err);
    }
  };

  return {
    reactions,
    toggleReaction,
  };
}
