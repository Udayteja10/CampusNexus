"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  MessageCircle,
  Search,
  Plus,
  Send,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  User as UserIcon,
  Shield,
  GraduationCap,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { chatApi } from "@/lib/chatApi";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import type {
  ConversationDto,
  MessageDto,
  ParticipantSummary,
} from "@/types/chat.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const currentUser = useAuthStore((state) => state.user);

  // Data states
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);

  // Loading & error states
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // New Chat Modal state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ParticipantSummary[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Mobile view toggle (conversation list vs chat view)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Load user conversations on initial mount
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      setChatError(null);
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load conversations.";
      setChatError(errorMsg);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load message history when active conversation changes
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setIsLoadingMessages(true);
        setChatError(null);
        const res = await chatApi.getConversationMessages(selectedConvId, 0, 50);
        if (isMounted) {
          setMessages(res.content || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMsg =
            err instanceof Error ? err.message : "Failed to load messages.";
          setChatError(errorMsg);
        }
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedConvId]);

  // Handle incoming real-time messages via STOMP subscription
  const handleIncomingMessage = useCallback(
    (newMsg: MessageDto) => {
      // 1. If incoming message belongs to currently open conversation, append to message thread
      if (newMsg.conversationId === selectedConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
      }

      // 2. Update conversation snippet and order in conversation list
      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c.id === newMsg.conversationId);
        if (convIndex === -1) {
          // If conversation wasn't in list yet, refresh list
          fetchConversations();
          return prev;
        }

        const updatedConv: ConversationDto = {
          ...prev[convIndex],
          lastMessage: newMsg,
          updatedAt: newMsg.createdAt,
        };

        const remaining = prev.filter((_, idx) => idx !== convIndex);
        return [updatedConv, ...remaining];
      });
    },
    [selectedConvId, fetchConversations]
  );

  // WebSocket connection & messaging hook
  const { status: wsStatus, sendMessage: sendWebSocketMessage } =
    useChatWebSocket({
      activeConversationId: selectedConvId,
      onMessageReceived: handleIncomingMessage,
    });

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingMessages]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || null;
  }, [conversations, selectedConvId]);

  // Filtered conversations list based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const name = c.otherParticipant?.fullName?.toLowerCase() || "";
      const username = c.otherParticipant?.username?.toLowerCase() || "";
      const dept = c.otherParticipant?.department?.toLowerCase() || "";
      const lastMsg = c.lastMessage?.content?.toLowerCase() || "";
      return (
        name.includes(q) ||
        username.includes(q) ||
        dept.includes(q) ||
        lastMsg.includes(q)
      );
    });
  }, [conversations, searchQuery]);

  // Debounced search for users in "New Chat" modal
  useEffect(() => {
    if (!isNewChatOpen) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingUsers(true);
        const users = await chatApi.searchUsers(userSearchQuery, 15);
        setSearchResults(users);
      } catch {
        // search failure
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [userSearchQuery, isNewChatOpen]);

  // Start new direct conversation
  const handleStartDirectChat = async (recipientId: number) => {
    try {
      setIsStartingChat(true);
      const conv = await chatApi.createOrGetDirectConversation(recipientId);
      setIsNewChatOpen(false);
      setUserSearchQuery("");

      // Update conversations list if not present
      setConversations((prev) => {
        if (!prev.some((c) => c.id === conv.id)) {
          return [conv, ...prev];
        }
        return prev;
      });

      setSelectedConvId(conv.id);
      setMobileView("chat");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start conversation.";
      setChatError(errorMsg);
    } finally {
      setIsStartingChat(false);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId || !messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    try {
      const directSentMessage = await sendWebSocketMessage(
        selectedConvId,
        content
      );

      // If sent via REST fallback, append directly to state
      if (directSentMessage) {
        handleIncomingMessage(directSentMessage);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to send message.";
      setChatError(errorMsg);
      setMessageInput(content); // Restore unsent message on failure
    } finally {
      setIsSending(false);
      messageInputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const otherUser = activeConversation?.otherParticipant;

  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col gap-3">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cn-indigo)] text-white shadow-sm">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Campus Chat
            </h1>
            <p className="text-xs text-muted-foreground">
              Direct real-time communication across campus
            </p>
          </div>
        </div>

        {/* Real-time Connection Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border shadow-xs transition-colors",
              wsStatus === "connected" &&
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
              wsStatus === "connecting" &&
                "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse",
              (wsStatus === "disconnected" || wsStatus === "error") &&
                "bg-muted text-muted-foreground border-border"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                wsStatus === "connected" && "bg-emerald-500",
                wsStatus === "connecting" && "bg-amber-500",
                (wsStatus === "disconnected" || wsStatus === "error") &&
                  "bg-muted-foreground"
              )}
            />
            <span className="capitalize">{wsStatus}</span>
          </div>

          <Button
            size="sm"
            variant="default"
            className="gap-1.5 shadow-sm"
            onClick={() => setIsNewChatOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Error alert if any */}
      {chatError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{chatError}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatError(null)}
            className="h-7 text-xs text-destructive hover:bg-destructive/20"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main 2-Pane Chat Container */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-xs lg:grid-cols-12">
        {/* ── Left Pane: Conversations List ────────────────────────────────── */}
        <div
          className={cn(
            "flex flex-col border-r border-border bg-card/60 lg:col-span-4",
            mobileView === "chat" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Search Conversations Input */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm h-9 bg-background/80"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingConversations ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg p-2.5 animate-pulse"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-24 bg-muted rounded-md" />
                      <div className="h-3 w-36 bg-muted/60 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
                  <MessageCircle className="h-6 w-6 opacity-60" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {searchQuery ? "No matching conversations" : "No conversations yet."}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  {searchQuery
                    ? "Try a different search term"
                    : "Start a conversation to chat with classmates & moderators."}
                </p>
                {!searchQuery && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 gap-1.5 text-xs"
                    onClick={() => setIsNewChatOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Start New Chat
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.otherParticipant;
                const isSelected = conv.id === selectedConvId;
                const displayName =
                  partner?.fullName || partner?.username || "Direct Chat";
                const lastMessageText =
                  conv.lastMessage?.content || "No messages yet";

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setMobileView("chat");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors duration-150",
                      "hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-accent text-accent-foreground font-medium shadow-xs"
                        : "text-foreground"
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-sm font-medium">
                          {displayName}
                        </span>
                        {conv.updatedAt && (
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {formatTimestamp(conv.updatedAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="truncate text-xs text-muted-foreground">
                          {lastMessageText}
                        </p>
                        {partner?.department && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground font-mono shrink-0 uppercase">
                            {partner.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Pane: Active Conversation & Messages ───────────────────── */}
        <div
          className={cn(
            "flex flex-col bg-background/40 lg:col-span-8",
            mobileView === "list" ? "hidden lg:flex" : "flex"
          )}
        >
          {selectedConvId && activeConversation ? (
            <>
              {/* Header */}
              <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-card/80">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                    onClick={() => setMobileView("list")}
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  {/* Partner Avatar & Details */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                    {otherUser?.fullName?.charAt(0).toUpperCase() ||
                      otherUser?.username?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold truncate text-foreground">
                        {otherUser?.fullName || otherUser?.username || "Campus Peer"}
                      </h2>
                      {otherUser?.role && otherUser.role !== "STUDENT" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 uppercase font-semibold"
                        >
                          <Shield className="h-2.5 w-2.5 mr-1" />
                          {otherUser.role}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {otherUser?.username && (
                        <span>@{otherUser.username}</span>
                      )}
                      {otherUser?.department && (
                        <span>• Dept: {otherUser.department}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={fetchConversations}
                    title="Refresh conversations"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Message Thread History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading messages...
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No messages yet. Start the conversation.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Send a message below to begin chatting in real-time.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser =
                      currentUser &&
                      (String(msg.senderId) === String(currentUser.id) ||
                        msg.senderUsername === currentUser.username ||
                        msg.senderUsername === currentUser.email);

                    const showSenderHeader =
                      !isCurrentUser &&
                      (index === 0 ||
                        messages[index - 1].senderId !== msg.senderId);

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col",
                          isCurrentUser ? "items-end" : "items-start"
                        )}
                      >
                        {showSenderHeader && (
                          <span className="text-[11px] font-medium text-muted-foreground px-1 mb-1">
                            {msg.senderName || msg.senderUsername}
                          </span>
                        )}

                        <div
                          className={cn(
                            "max-w-[80%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words",
                            isCurrentUser
                              ? "bg-[var(--cn-indigo)] text-white rounded-tr-xs"
                              : "bg-card border border-border text-foreground rounded-tl-xs"
                          )}
                        >
                          {msg.content}
                        </div>

                        <span className="text-[10px] text-muted-foreground/70 px-1 mt-0.5">
                          {formatTimestamp(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="border-t border-border p-3 bg-card/60">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2"
                >
                  <div className="relative flex-1">
                    <textarea
                      ref={messageInputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                      maxLength={2000}
                      rows={1}
                      className={cn(
                        "w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "min-h-[40px] max-h-[120px]"
                      )}
                    />
                    {messageInput.length > 1500 && (
                      <span className="absolute bottom-1 right-2 text-[10px] text-muted-foreground bg-background/80 px-1 rounded">
                        {messageInput.length}/2000
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageInput.trim() || isSending}
                    className="h-10 w-10 shrink-0 shadow-sm"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state when no conversation is selected */
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Select a conversation to start chatting.
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Choose a conversation from the list on the left or start a new direct chat with any campus user.
              </p>
              <Button
                className="mt-4 gap-1.5 shadow-sm"
                onClick={() => setIsNewChatOpen(true)}
              >
                <Plus className="h-4 w-4" /> Start New Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── New Chat Dialog ────────────────────────────────────────────────── */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Start New Conversation
            </DialogTitle>
            <DialogDescription>
              Search for any student, moderator, or peer by name, username, or HTNO.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or HTNO..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {/* Results list */}
            <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-border/40">
              {isSearchingUsers ? (
                <div className="flex items-center justify-center p-6 text-sm text-muted-foreground gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Searching peers...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  {userSearchQuery
                    ? "No users found matching your search."
                    : "Type a username or name to search peers."}
                </div>
              ) : (
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    disabled={isStartingChat}
                    onClick={() => handleStartDirectChat(user.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 p-2.5 rounded-lg text-left transition-colors",
                      "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                        {user.fullName?.charAt(0).toUpperCase() ||
                          user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {user.department && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono uppercase"
                        >
                          {user.department}
                        </Badge>
                      )}
                      {user.role && user.role !== "STUDENT" && (
                        <Badge variant="outline" className="text-[10px]">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
