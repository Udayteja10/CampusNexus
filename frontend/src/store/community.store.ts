"use client";

import { create } from "zustand";
import { Post, CommunityCategory, ReactionSummary } from "@/types/post.types";
import { MockCommunityServiceInstance } from "@/services/community/mock-community.service";

interface CommunityState {
  posts: Post[];
  pendingNewPosts: Post[]; // Queue of posts received via real-time simulation
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: CommunityCategory | undefined;
    sort: "latest" | "discussed";
  };

  // Actions
  loadPosts: () => Promise<void>;
  setSearch: (search: string) => void;
  setCategory: (category: CommunityCategory | undefined) => void;
  setSort: (sort: "latest" | "discussed") => void;
  
  // Real-time operations
  addPendingNewPost: (post: Post) => void;
  flushNewPosts: () => void;
  
  // Local CRUD & Optimistic UI
  addOptimisticPost: (post: Post) => void;
  confirmPost: (tempId: string, confirmedPost: Post) => void;
  failPost: (tempId: string) => void;
  
  updateLocalPost: (post: Post) => void;
  removeLocalPost: (postId: string) => void;
  updateLocalReactions: (postId: string, reactions: ReactionSummary[]) => void;
  incrementCommentCount: (postId: string) => void;
  decrementCommentCount: (postId: string, newCount: number) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  pendingNewPosts: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    category: undefined,
    sort: "latest",
  },

  loadPosts: async () => {
    set({ loading: true, error: null });
    try {
      const posts = await MockCommunityServiceInstance.getPosts(get().filters);
      set({ posts, loading: false });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to load posts";
      set({ error: errMsg, loading: false });
    }
  },

  setSearch: (search) => {
    set((state) => ({ filters: { ...state.filters, search } }));
    get().loadPosts();
  },

  setCategory: (category) => {
    set((state) => ({ filters: { ...state.filters, category } }));
    get().loadPosts();
  },

  setSort: (sort) => {
    set((state) => ({ filters: { ...state.filters, sort } }));
    get().loadPosts();
  },

  addPendingNewPost: (post) => {
    // Prevent duplicate entries in queue or visible posts
    const existsInFeed = get().posts.some((p) => p.id === post.id);
    const existsInQueue = get().pendingNewPosts.some((p) => p.id === post.id);
    if (!existsInFeed && !existsInQueue) {
      set((state) => ({
        pendingNewPosts: [post, ...state.pendingNewPosts],
      }));
    }
  },

  flushNewPosts: () => {
    const { pendingNewPosts, posts } = get();
    if (pendingNewPosts.length === 0) return;
    
    set({
      posts: [...pendingNewPosts, ...posts],
      pendingNewPosts: [],
    });
  },

  addOptimisticPost: (post) => {
    set((state) => ({
      posts: [post, ...state.posts],
    }));
  },

  confirmPost: (tempId, confirmedPost) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === tempId ? confirmedPost : p)),
    }));
  },

  failPost: (tempId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === tempId ? { ...p, status: "error" as const } : p
      ),
    }));
  },

  updateLocalPost: (updatedPost) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    }));
  },

  removeLocalPost: (postId) => {
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
      pendingNewPosts: state.pendingNewPosts.filter((p) => p.id !== postId),
    }));
  },

  updateLocalReactions: (postId, reactions) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, reactions } : p
      ),
    }));
  },

  incrementCommentCount: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ),
    }));
  },

  decrementCommentCount: (postId, newCount) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: newCount } : p
      ),
    }));
  },
}));
