import type { User } from "./user.types";

// ─── Post / Feed ────────────────────────────────────────────────────────────

export type PostType = "TEXT" | "IMAGE" | "LINK" | "POLL";

export interface Post {
  id: string;
  author?: User; // undefined when anonymous
  isAnonymous: boolean;
  content: string;
  mediaUrls?: string[];
  linkPreview?: LinkPreview;
  type: PostType;
  channelId?: string;
  studyGroupId?: string;
  tags?: string[];
  reactions: ReactionSummary[];
  commentsCount: number;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LinkPreview {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author?: User;
  isAnonymous: boolean;
  content: string;
  parentId?: string;       // null for top-level comments
  replies?: Comment[];
  reactions: ReactionSummary[];
  isEdited: boolean;
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
  type: PostType;
  isAnonymous: boolean;
  mediaUrls?: string[];
  channelId?: string;
  studyGroupId?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  content: string;
  isAnonymous: boolean;
  parentId?: string;
}
