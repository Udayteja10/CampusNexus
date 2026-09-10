import { ICommunityService } from "./community.types";
import {
  Post,
  Comment,
  Report,
  CreatePostPayload,
  UpdatePostPayload,
  CreateCommentRequest,
  CommunityCategory,
  ReactionSummary,
  ReportReason,
} from "@/types/post.types";
import { User } from "@/types/user.types";
import { CommunityEventBus } from "./community-event-bus";
import { useAuthStore } from "@/store/auth.store";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Persisted Data Helpers
const getPersistedPosts = (): Post[] => {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem("campusnexus_community_posts");
  return val ? JSON.parse(val) : [];
};

const savePersistedPosts = (posts: Post[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("campusnexus_community_posts", JSON.stringify(posts));
};

const getPersistedComments = (): Record<string, Comment[]> => {
  if (typeof window === "undefined") return {};
  const val = localStorage.getItem("campusnexus_community_comments");
  return val ? JSON.parse(val) : {};
};

const savePersistedComments = (comments: Record<string, Comment[]>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("campusnexus_community_comments", JSON.stringify(comments));
};

const getPersistedReports = (): Report[] => {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem("campusnexus_community_reports");
  return val ? JSON.parse(val) : [];
};

const savePersistedReports = (reports: Report[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("campusnexus_community_reports", JSON.stringify(reports));
};

// Helper to simulate network latency
const sleep = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockCommunityService implements ICommunityService {
  async getPosts(filters: {
    search?: string;
    category?: CommunityCategory;
    sort?: "latest" | "discussed";
  }): Promise<Post[]> {
    await sleep(250);
    let posts = getPersistedPosts();

    // Filter by category
    if (filters.category) {
      posts = posts.filter((p) => p.category === filters.category);
    }

    // Search query (case insensitive)
    if (filters.search) {
      const query = filters.search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.content.toLowerCase().includes(query) ||
          (p.author && p.author.fullName.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (filters.sort === "discussed") {
      posts.sort((a, b) => b.commentsCount - a.commentsCount);
    } else {
      // default: latest
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Keep pinned items at the very top
    posts.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    return posts;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    await sleep(150);
    const posts = getPersistedPosts();
    return posts.find((p) => p.id === id);
  }

  async createPost(payload: CreatePostPayload): Promise<Post> {
    await sleep(350);
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error("Unauthenticated");

    const newPost: Post = {
      id: "post-" + generateId(),
      author: payload.isAnonymous ? undefined : (currentUser as User),
      isAnonymous: payload.isAnonymous,
      content: payload.content,
      category: payload.category,
      type: "TEXT",
      reactions: [
        { emoji: "👍", count: 0, reactedByMe: false },
        { emoji: "👎", count: 0, reactedByMe: false }
      ] as ReactionSummary[],
      commentsCount: 0,
      isPinned: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
    };

    const posts = getPersistedPosts();
    posts.unshift(newPost);
    savePersistedPosts(posts);

    // Publish event for real-time subscribers
    CommunityEventBus.publish({
      type: "POST_CREATED",
      postId: newPost.id,
      payload: newPost,
    });

    return newPost;
  }

  async updatePost(id: string, payload: UpdatePostPayload): Promise<Post> {
    await sleep(300);
    const currentUser = useAuthStore.getState().user;
    const posts = getPersistedPosts();
    const postIdx = posts.findIndex((p) => p.id === id);
    if (postIdx === -1) throw new Error("Post not found");

    const post = posts[postIdx];
    // Check ownership
    if (currentUser?.role === "STUDENT" && post.author?.id !== currentUser.id && !post.isAnonymous) {
      throw new Error("Unauthorized to edit this post");
    }

    const updatedPost: Post = {
      ...post,
      content: payload.content,
      category: payload.category,
      isAnonymous: payload.isAnonymous,
      author: payload.isAnonymous ? undefined : (post.author || (currentUser as User)),
      isEdited: true,
      updatedAt: new Date().toISOString(),
    };

    posts[postIdx] = updatedPost;
    savePersistedPosts(posts);

    // Publish event
    CommunityEventBus.publish({
      type: "POST_UPDATED",
      postId: id,
      payload: updatedPost,
    });

    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    await sleep(300);
    const currentUser = useAuthStore.getState().user;
    const posts = getPersistedPosts();
    const postIdx = posts.findIndex((p) => p.id === id);
    if (postIdx === -1) return false;

    const post = posts[postIdx];
    // Check ownership or Moderator/Admin rights
    const canDelete =
      currentUser?.role === "ADMIN" ||
      currentUser?.role === "MODERATOR" ||
      (post.author && post.author.id === currentUser?.id);

    if (!canDelete) throw new Error("Unauthorized to delete this post");

    posts.splice(postIdx, 1);
    savePersistedPosts(posts);

    const comments = getPersistedComments();
    delete comments[id];
    savePersistedComments(comments);

    // Publish event
    CommunityEventBus.publish({
      type: "POST_DELETED",
      postId: id,
      payload: id,
    });

    return true;
  }

  async getComments(postId: string): Promise<Comment[]> {
    await sleep(150);
    const comments = getPersistedComments();
    return comments[postId] || [];
  }

  async addComment(postId: string, payload: CreateCommentRequest): Promise<Comment> {
    await sleep(250);
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error("Unauthenticated");

    const newComment: Comment = {
      id: "comment-" + generateId(),
      postId,
      author: payload.isAnonymous ? undefined : (currentUser as User),
      isAnonymous: payload.isAnonymous,
      content: payload.content,
      parentId: payload.parentId || undefined,
      reactions: [
        { emoji: "👍", count: 0, reactedByMe: false },
        { emoji: "👎", count: 0, reactedByMe: false }
      ] as ReactionSummary[],
      isEdited: false,
      createdAt: new Date().toISOString(),
    };

    const comments = getPersistedComments();
    if (!comments[postId]) {
      comments[postId] = [];
    }
    comments[postId].push(newComment);
    savePersistedComments(comments);

    // Update comment count on post (including top level + nested replies)
    const posts = getPersistedPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.commentsCount = comments[postId].length;
      savePersistedPosts(posts);
    }

    // Publish event
    CommunityEventBus.publish({
      type: "COMMENT_CREATED",
      postId,
      payload: { comment: newComment, commentsCount: comments[postId].length },
    });

    return newComment;
  }

  async deleteComment(postId: string, commentId: string): Promise<boolean> {
    await sleep(250);
    const currentUser = useAuthStore.getState().user;
    const comments = getPersistedComments();
    const postComments = comments[postId];
    if (!postComments) return false;

    const commentIdx = postComments.findIndex((c) => c.id === commentId);
    if (commentIdx === -1) return false;

    const comment = postComments[commentIdx];
    const canDelete =
      currentUser?.role === "ADMIN" ||
      currentUser?.role === "MODERATOR" ||
      (comment.author && comment.author.id === currentUser?.id);

    if (!canDelete) throw new Error("Unauthorized to delete comment");

    // Remove this comment/reply. If it's a parent, also remove its nested replies.
    const isParent = !comment.parentId;
    let newPostComments = postComments.filter((c) => c.id !== commentId);
    if (isParent) {
      // Remove any children of this parent
      newPostComments = newPostComments.filter((c) => c.parentId !== commentId);
    }

    comments[postId] = newPostComments;
    savePersistedComments(comments);

    // Update comment count on post
    const posts = getPersistedPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.commentsCount = newPostComments.length;
      savePersistedPosts(posts);
    }

    // Publish event
    CommunityEventBus.publish({
      type: "COMMENT_DELETED",
      postId,
      payload: { commentId, commentsCount: newPostComments.length },
    });

    return true;
  }

  async toggleReaction(postId: string, emoji: string): Promise<Post> {
    await sleep(150);
    const posts = getPersistedPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error("Post not found");

    if (!post.reactions || post.reactions.length === 0) {
      post.reactions = [
        { emoji: "👍", count: 0, reactedByMe: false },
        { emoji: "👎", count: 0, reactedByMe: false }
      ];
    }

    const likeReaction = post.reactions.find((r) => r.emoji === "👍") || { emoji: "👍", count: 0, reactedByMe: false };
    const dislikeReaction = post.reactions.find((r) => r.emoji === "👎") || { emoji: "👎", count: 0, reactedByMe: false };

    post.reactions = [likeReaction, dislikeReaction];

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

    savePersistedPosts(posts);

    // Publish event
    CommunityEventBus.publish({
      type: "REACTION_UPDATED",
      postId,
      payload: post.reactions,
    });

    return post;
  }

  async toggleCommentReaction(postId: string, commentId: string, emoji: string): Promise<Comment> {
    await sleep(150);
    const comments = getPersistedComments();
    const postComments = comments[postId];
    if (!postComments) throw new Error("Comments not found");

    const commentIdx = postComments.findIndex((c) => c.id === commentId);
    if (commentIdx === -1) throw new Error("Comment not found");

    const comment = postComments[commentIdx];

    if (!comment.reactions || comment.reactions.length === 0) {
      comment.reactions = [
        { emoji: "👍", count: 0, reactedByMe: false },
        { emoji: "👎", count: 0, reactedByMe: false }
      ];
    }

    const likeReaction = comment.reactions.find((r) => r.emoji === "👍") || { emoji: "👍", count: 0, reactedByMe: false };
    const dislikeReaction = comment.reactions.find((r) => r.emoji === "👎") || { emoji: "👎", count: 0, reactedByMe: false };

    comment.reactions = [likeReaction, dislikeReaction];

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

    savePersistedComments(comments);

    // Publish event
    CommunityEventBus.publish({
      type: "POST_UPDATED",
      postId,
      payload: getPersistedPosts().find((p) => p.id === postId)!,
    });

    return comment;
  }

  async reportPost(postId: string, reason: string, description?: string): Promise<Report> {
    await sleep(200);
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error("Unauthenticated");

    const newReport: Report = {
      id: "report-" + generateId(),
      reason: reason as ReportReason,
      description,
      reportedByType: "POST",
      targetId: postId,
      reportedByUserId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const reports = getPersistedReports();
    reports.push(newReport);
    savePersistedReports(reports);
    return newReport;
  }

  async reportComment(postId: string, commentId: string, reason: string, description?: string): Promise<Report> {
    await sleep(200);
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error("Unauthenticated");

    const newReport: Report = {
      id: "report-" + generateId(),
      reason: reason as ReportReason,
      description,
      reportedByType: "COMMENT",
      targetId: commentId,
      reportedByUserId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const reports = getPersistedReports();
    reports.push(newReport);
    savePersistedReports(reports);
    return newReport;
  }

  async moderatorRemovePost(postId: string): Promise<boolean> {
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.role !== "MODERATOR" && currentUser?.role !== "ADMIN") {
      throw new Error("Only moderators or administrators can force-delete posts");
    }
    return this.deletePost(postId);
  }
}

export const MockCommunityServiceInstance = new MockCommunityService();
