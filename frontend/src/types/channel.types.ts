import type { User } from "./user.types";

// ─── Channel / Real-Time Chat ────────────────────────────────────────────────

export type ChannelType = "PUBLIC" | "PRIVATE" | "ANNOUNCEMENT";

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  category?: string; // e.g. "General", "Academic", "Career"
  memberCount: number;
  isJoined: boolean;
  lastMessage?: ChannelMessage;
  unreadCount: number;
  createdAt: string;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  author?: User;
  isAnonymous: boolean;
  content: string;
  mediaUrls?: string[];
  isPinned: boolean;
  isEdited: boolean;
  reactions: import("./post.types").ReactionSummary[];
  replyTo?: Pick<ChannelMessage, "id" | "content" | "author">;
  createdAt: string;
}

// ─── Direct Messages ─────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participant: User;
  lastMessage?: DirectMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  mediaUrls?: string[];
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  mediaUrls?: string[];
}
