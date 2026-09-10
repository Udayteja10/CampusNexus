import type { User } from "./user.types";

// ─── Post / Feed ────────────────────────────────────────────────────────────

export type PostType = "TEXT" | "IMAGE" | "LINK" | "POLL";

export type PostStatus = "pending" | "confirmed" | "error";

export type CommunityCategory =
  | "general"
  | "academics"
  | "placements"
  | "internships"
  | "events"
  | "clubs"
  | "campus-life"
  | "lost-found";

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
  category?: CommunityCategory; // Added for community module
  status?: PostStatus; // Added for optimistic UI
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
  emoji: string; // e.g. "👍"
  count: number;
  reactedByMe: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author?: User; // undefined when anonymous
  isAnonymous: boolean;
  content: string;
  parentId?: string; // null for top-level comments
  replies?: Comment[];
  reactions: ReactionSummary[];
  isEdited: boolean;
  createdAt: string;
}

// ─── Payloads and Requests ───────────────────────────────────────────────────

export interface CreatePostRequest {
  content: string;
  type: PostType;
  isAnonymous: boolean;
  mediaUrls?: string[];
  channelId?: string;
  studyGroupId?: string;
  category?: CommunityCategory;
  tags?: string[];
}

export interface CreatePostPayload {
  content: string;
  category: CommunityCategory;
  isAnonymous: boolean;
  mediaUrls?: string[];
}

export interface UpdatePostPayload {
  content: string;
  category: CommunityCategory;
  isAnonymous: boolean;
}

export interface CreateCommentRequest {
  content: string;
  isAnonymous: boolean;
  parentId?: string;
}

// ─── Reporting ───────────────────────────────────────────────────────────────

export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "INAPPROPRIATE"
  | "MISINFORMATION"
  | "OTHER";

export interface Report {
  id: string;
  reason: ReportReason;
  description?: string;
  reportedByType: "POST" | "COMMENT";
  targetId: string; // Post ID or Comment ID
  reportedByUserId: string;
  createdAt: string;
}

// ─── Real-Time Events ────────────────────────────────────────────────────────

export type CommunityEventType =
  | "POST_CREATED"
  | "POST_UPDATED"
  | "POST_DELETED"
  | "COMMENT_CREATED"
  | "COMMENT_DELETED"
  | "REACTION_UPDATED";

export interface CommunityEvent {
  type: CommunityEventType;
  postId: string;
  payload: unknown; // Can be Post, Comment, Reaction details, or Post ID
}
