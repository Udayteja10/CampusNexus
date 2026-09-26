import { apiClient, ApiResponseWrapper } from "@/lib/api";
import type { ConversationDto, MessageDto, ParticipantSummary } from "@/types/chat.types";
import type { PaginatedResponse } from "@/types/api.types";

export const chatApi = {
  searchUsers: async (
    query: string = "",
    limit: number = 15
  ): Promise<ParticipantSummary[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ParticipantSummary[]>>(
      "/api/v1/chat/users",
      {
        params: { query, limit },
      }
    );
    return res.data.data || [];
  },

  getConversations: async (): Promise<ConversationDto[]> => {
    const res = await apiClient.get<ApiResponseWrapper<ConversationDto[]>>(
      "/api/v1/chat/conversations"
    );
    return res.data.data || [];
  },

  createOrGetDirectConversation: async (
    recipientId: number
  ): Promise<ConversationDto> => {
    const res = await apiClient.post<ApiResponseWrapper<ConversationDto>>(
      "/api/v1/chat/conversations/direct",
      { recipientId }
    );
    return res.data.data;
  },

  getConversationById: async (
    conversationId: number
  ): Promise<ConversationDto> => {
    const res = await apiClient.get<ApiResponseWrapper<ConversationDto>>(
      `/api/v1/chat/conversations/${conversationId}`
    );
    return res.data.data;
  },

  getConversationMessages: async (
    conversationId: number,
    page = 0,
    size = 50
  ): Promise<PaginatedResponse<MessageDto>> => {
    const res = await apiClient.get<
      ApiResponseWrapper<PaginatedResponse<MessageDto>>
    >(`/api/v1/chat/conversations/${conversationId}/messages`, {
      params: { page, size },
    });
    return res.data.data;
  },

  sendMessageRest: async (
    conversationId: number,
    content: string
  ): Promise<MessageDto> => {
    const res = await apiClient.post<ApiResponseWrapper<MessageDto>>(
      `/api/v1/chat/conversations/${conversationId}/messages`,
      { conversationId, content }
    );
    return res.data.data;
  },
};
