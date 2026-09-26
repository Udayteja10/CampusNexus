"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/store/auth.store";
import type { ConnectionStatus, MessageDto } from "@/types/chat.types";
import { chatApi } from "@/lib/chatApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface UseChatWebSocketOptions {
  activeConversationId: number | null;
  onMessageReceived: (message: MessageDto) => void;
}

export function useChatWebSocket({
  activeConversationId,
  onMessageReceived,
}: UseChatWebSocketOptions) {
  const token = useAuthStore((state) => state.token);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const onMessageRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  // Initialize and maintain STOMP connection
  useEffect(() => {
    if (!token) {
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws/chat`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {
        // Disabled noisy console debugs in production
      },
      onConnect: () => {
        setStatus("connected");
      },
      onDisconnect: () => {
        setStatus("disconnected");
      },
      onStompError: (frame) => {
        console.warn("STOMP error:", frame.headers["message"]);
        setStatus("error");
      },
      onWebSocketError: (event) => {
        console.warn("WebSocket error:", event);
        setStatus("disconnected");
      },
      onWebSocketClose: () => {
        setStatus("disconnected");
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch {
          // ignore cleanup errors
        }
        subscriptionRef.current = null;
      }
      try {
        client.deactivate();
      } catch {
        // ignore deactivate errors
      }
      clientRef.current = null;
    };
  }, [token]);

  // Subscribe to active conversation topic
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !client.connected || !activeConversationId) {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch {
          // ignore
        }
        subscriptionRef.current = null;
      }
      return;
    }

    // Clean up previous subscription
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch {
        // ignore
      }
      subscriptionRef.current = null;
    }

    const topic = `/topic/conversations/${activeConversationId}`;
    try {
      const sub = client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed: MessageDto = JSON.parse(message.body);
          if (parsed && parsed.id) {
            onMessageRef.current(parsed);
          }
        } catch (e) {
          console.warn("Failed to parse incoming WebSocket message:", e);
        }
      });
      subscriptionRef.current = sub;
    } catch (err) {
      console.warn("Failed to subscribe to conversation topic:", err);
    }

    return () => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch {
          // ignore
        }
        subscriptionRef.current = null;
      }
    };
  }, [activeConversationId, status]);

  // Send message handler with STOMP or fallback to REST
  const sendMessage = useCallback(
    async (conversationId: number, content: string): Promise<MessageDto | null> => {
      const client = clientRef.current;
      const trimmed = content.trim();
      if (!trimmed || !conversationId) return null;

      if (client && client.connected) {
        try {
          client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
              conversationId,
              content: trimmed,
            }),
          });
          return null; // The incoming message will arrive via the /topic subscription
        } catch (e) {
          console.warn("STOMP publish failed, falling back to REST:", e);
        }
      }

      // REST fallback if WebSocket is offline or reconnecting
      const fallbackMsg = await chatApi.sendMessageRest(conversationId, trimmed);
      return fallbackMsg;
    },
    []
  );

  return {
    status,
    sendMessage,
  };
}
