// ─── Chat Types ─────────────────────────────────────────────────────────────

export interface ParticipantSummary {
  id: number;
  username: string;
  fullName: string;
  department?: string | null;
  role?: string | null;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface ConversationDto {
  id: number;
  otherParticipant: ParticipantSummary | null;
  lastMessage?: MessageDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface DirectConversationRequest {
  recipientId: number;
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
}

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";
