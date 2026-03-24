"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { Conversation, Message, UnReadnotification, MessageReaction } from "@/types/chat.types";

// ─── State ───────────────────────────────────────────────────────────────────

interface TypingInfo {
  userId: string;
  username?: string;
  isTyping: boolean;
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
  onlineUsers: Set<string>;
  typingUsers: Record<string, TypingInfo>; // conversationId -> typing info
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type ChatAction =
  | { type: "SET_LOADING_CONVERSATIONS"; payload: boolean }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "SET_LOADING_MESSAGES"; payload: boolean }
  | { type: "SET_MESSAGES"; payload: { conversationId: string; messages: Message[] } }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_CONVERSATION_NOTIFICATION"; payload: UnReadnotification }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: string | null }
  | { type: "MARK_CONVERSATION_READ"; payload: string }
  | { type: "PREPEND_MESSAGES"; payload: { conversationId: string; messages: Message[] } }
  | { type: "REPLACE_MESSAGE"; payload: { tempId: string; finalMessage: Message } }
  | { type: "CLEAR_MESSAGES"; payload: string }
  | { type: "SET_ONLINE_USERS"; payload: string[] }
  | { type: "ADD_ONLINE_USER"; payload: string }
  | { type: "REMOVE_ONLINE_USER"; payload: string }
  | { type: "SET_TYPING"; payload: { conversationId: string; info: TypingInfo } }
  | { type: "UPDATE_MESSAGE_READ"; payload: { conversationId: string; messageIds: string[]; readByUserId: string } }
  | { type: "UPDATE_MESSAGE_REACTION"; payload: { conversationId: string; messageId: string; reactions: MessageReaction[] } }
  | { type: "REMOVE_MESSAGE"; payload: { conversationId: string; messageId: string; forEveryone: boolean; userId?: string } };

// ─── Reducer ─────────────────────────────────────────────────────────────────

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_LOADING_CONVERSATIONS":
      return { ...state, loadingConversations: action.payload };

    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload, loadingConversations: false };

    case "SET_LOADING_MESSAGES":
      return { ...state, loadingMessages: action.payload };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [...action.payload.messages].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        },
        loadingMessages: false,
      };

    case "ADD_MESSAGE": {
      const msg = action.payload;
      const existing = state.messages[msg.conversationId] || [];
      if (existing.some((m) => m.id === msg.id || (msg.tempId && m.id === msg.tempId))) return state;
      const updatedMessages = [...existing, msg].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        ...state,
        messages: { ...state.messages, [msg.conversationId]: updatedMessages },
        conversations: state.conversations
          .map((c) => c.id === msg.conversationId ? { ...c, lastMessage: msg, updatedAt: msg.createdAt } : c)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      };
    }

    case "UPDATE_CONVERSATION_NOTIFICATION": {
      const notif = action.payload;
      const isActive = state.activeConversationId === notif.conversationId;
      return {
        ...state,
        conversations: state.conversations
          .map((c) =>
            c.id === notif.conversationId
              ? { ...c, lastMessage: notif.lastMessage, unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1, updatedAt: notif.lastMessage?.createdAt || c.updatedAt }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      };
    }

    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversationId: action.payload };

    case "MARK_CONVERSATION_READ":
      return {
        ...state,
        conversations: state.conversations.map((c) => c.id === action.payload ? { ...c, unreadCount: 0 } : c),
      };

    case "PREPEND_MESSAGES": {
      const { conversationId, messages } = action.payload;
      const current = state.messages[conversationId] || [];
      const ids = new Set(current.map((m) => m.id));
      const unique = messages.filter((m) => !ids.has(m.id));
      const updated = [...unique, ...current].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return { ...state, messages: { ...state.messages, [conversationId]: updated } };
    }

    case "REPLACE_MESSAGE": {
      const { tempId, finalMessage } = action.payload;
      const cid = finalMessage.conversationId;
      return {
        ...state,
        messages: {
          ...state.messages,
          [cid]: (state.messages[cid] || []).map((m) => m.tempId === tempId || m.id === tempId ? finalMessage : m),
        },
      };
    }

    case "CLEAR_MESSAGES":
      return { ...state, messages: { ...state.messages, [action.payload]: [] } };

    // ─── Online Users ───
    case "SET_ONLINE_USERS":
      return { ...state, onlineUsers: new Set(action.payload) };

    case "ADD_ONLINE_USER": {
      const next = new Set(state.onlineUsers);
      next.add(action.payload);
      return { ...state, onlineUsers: next };
    }

    case "REMOVE_ONLINE_USER": {
      const next = new Set(state.onlineUsers);
      next.delete(action.payload);
      return { ...state, onlineUsers: next };
    }

    // ─── Typing ───
    case "SET_TYPING":
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.conversationId]: action.payload.info,
        },
      };

    // ─── Read Receipts ───
    case "UPDATE_MESSAGE_READ": {
      const { conversationId, messageIds, readByUserId } = action.payload;
      const msgs = state.messages[conversationId] || [];
      const idSet = new Set(messageIds.map(String));
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: msgs.map((m) => {
            if (idSet.has(String(m.id))) {
              const alreadyRead = m.readBy?.some((r) => r.userId === readByUserId);
              if (alreadyRead) return m;
              return { ...m, readBy: [...(m.readBy || []), { userId: readByUserId, readAt: new Date().toISOString() }] };
            }
            return m;
          }),
        },
      };
    }

    // ─── Reactions ───
    case "UPDATE_MESSAGE_REACTION": {
      const { conversationId, messageId, reactions } = action.payload;
      const msgs = state.messages[conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: msgs.map((m) => String(m.id) === String(messageId) ? { ...m, reactions } : m),
        },
      };
    }

    // ─── Delete Message ───
    case "REMOVE_MESSAGE": {
      const { conversationId, messageId, forEveryone, userId } = action.payload;
      const msgs = state.messages[conversationId] || [];
      if (forEveryone) {
        return {
          ...state,
          messages: {
            ...state.messages,
            [conversationId]: msgs.map((m) =>
              String(m.id) === String(messageId)
                ? { ...m, deletedForEveryone: true, contentText: null, mediaUrl: null }
                : m
            ),
          },
        };
      } else {
        // Delete for self: remove from local list
        return {
          ...state,
          messages: {
            ...state.messages,
            [conversationId]: msgs.filter((m) => {
              if (String(m.id) !== String(messageId)) return true;
              return false; // remove from local view
            }),
          },
        };
      }
    }

    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (payload: {
    conversationId: string;
    senderId: string;
    content: string;
    tempId: string;
    mediaUrl?: string;
    mediaType?: "image" | "audio" | null;
  }) => void;
  sendTypingStart: (conversationId: string, userId: string, username: string) => void;
  sendTypingStop: (conversationId: string, userId: string) => void;
  markMessagesRead: (conversationId: string, userId: string) => void;
  sendReaction: (messageId: string, userId: string, emoji: string, conversationId: string) => void;
  deleteMessage: (messageId: string, userId: string, forEveryone: boolean, conversationId: string) => void;
} | null>(null);

const socketref: { current: Socket | null } = { current: null };

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    conversations: [],
    messages: {},
    activeConversationId: null,
    loadingConversations: true,
    loadingMessages: false,
    onlineUsers: new Set<string>(),
    typingUsers: {},
  });

  const [isConnected, setIsConnected] = useState(false);
  const previousConversationIdRef = useRef<string | null>(null);

  // Join user room when connected
  useEffect(() => {
    if (isConnected && socketref.current) {
      let userId = localStorage.getItem("userId");

      // Fallback: try to get id from the "user" object if "userId" isn't explicitly set
      if (!userId) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user.id;
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
      }

      if (userId) {
        socketref.current.emit("join_user", userId);
        console.log(`🚪 Joined user room: ${userId}`);
      }
    }
  }, [isConnected]);

  // Setup socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !socketref.current) {
      socketref.current = io(process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socketref.current.on("connect", () => setIsConnected(true));
      socketref.current.on("disconnect", () => setIsConnected(false));
      socketref.current.on("connect_error", () => setIsConnected(false));

      // ─── Online/Offline ───
      socketref.current.on("online_users", (userIds: string[]) => {
        dispatch({ type: "SET_ONLINE_USERS", payload: userIds });
      });
      socketref.current.on("user_online", (userId: string) => {
        dispatch({ type: "ADD_ONLINE_USER", payload: userId });
      });
      socketref.current.on("user_offline", (userId: string) => {
        dispatch({ type: "REMOVE_ONLINE_USER", payload: userId });
      });

      // ─── Messages ───
      socketref.current.on("receive_message", (message: Message & { tempId?: string }) => {
        if (message.tempId) {
          dispatch({ type: "REPLACE_MESSAGE", payload: { tempId: message.tempId, finalMessage: message } });
        } else {
          dispatch({ type: "ADD_MESSAGE", payload: message });
        }
      });

      socketref.current.on("unread_notification", (notif: UnReadnotification) => {
        dispatch({ type: "UPDATE_CONVERSATION_NOTIFICATION", payload: notif });
      });

      // ─── Typing ───
      socketref.current.on("user_typing", ({ conversationId, userId, username, isTyping }: { conversationId: string; userId: string; username?: string; isTyping: boolean }) => {
        dispatch({ type: "SET_TYPING", payload: { conversationId, info: { userId, username, isTyping } } });
      });

      // ─── Read Receipts ───
      socketref.current.on("messages_read", ({ conversationId, readBy, messageIds }: { conversationId: string; readBy: string; messageIds: string[] }) => {
        dispatch({ type: "UPDATE_MESSAGE_READ", payload: { conversationId, messageIds, readByUserId: readBy } });
      });

      // ─── Reactions ───
      socketref.current.on("reaction_updated", ({ messageId, reactions, conversationId }: { messageId: string; reactions: { userId: string; emoji: string }[]; conversationId: string }) => {
        dispatch({ type: "UPDATE_MESSAGE_REACTION", payload: { conversationId, messageId, reactions } });
      });

      // ─── Delete ───
      socketref.current.on("message_deleted", ({ messageId, conversationId, forEveryone }: { messageId: string; conversationId: string; forEveryone: boolean }) => {
        dispatch({ type: "REMOVE_MESSAGE", payload: { conversationId, messageId, forEveryone } });
      });
    }

    return () => {
      if (socketref.current) {
        socketref.current.disconnect();
        socketref.current = null;
      }
    };
  }, []);

  // Conversation room management
  useEffect(() => {
    if (isConnected && socketref.current) {
      const previousConversationId = previousConversationIdRef.current;
      if (previousConversationId && previousConversationId !== state.activeConversationId) {
        socketref.current.emit("leave_conversation", previousConversationId);
      }
      if (state.activeConversationId) {
        socketref.current.emit("join_conversation", state.activeConversationId);
      }
      previousConversationIdRef.current = state.activeConversationId;
    }
  }, [isConnected, state.activeConversationId]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (payload: { conversationId: string; senderId: string; content: string; tempId: string; mediaUrl?: string; mediaType?: "image" | "audio" | null }) => {
      if (socketref.current && isConnected) {
        socketref.current.emit("send_message", payload);
      } else {
        console.error("Socket not connected, cannot send message.");
      }
    },
    [isConnected]
  );

  const sendTypingStart = useCallback((conversationId: string, userId: string, username: string) => {
    if (socketref.current && isConnected) {
      socketref.current.emit("typing_start", { conversationId, userId, username });
    }
  }, [isConnected]);

  const sendTypingStop = useCallback((conversationId: string, userId: string) => {
    if (socketref.current && isConnected) {
      socketref.current.emit("typing_stop", { conversationId, userId });
    }
  }, [isConnected]);

  const markMessagesRead = useCallback((conversationId: string, userId: string) => {
    if (socketref.current && isConnected) {
      socketref.current.emit("mark_read", { conversationId, userId });
    }
  }, [isConnected]);

  const sendReaction = useCallback((messageId: string, userId: string, emoji: string, conversationId: string) => {
    if (socketref.current && isConnected) {
      socketref.current.emit("message_reaction", { messageId, userId, emoji, conversationId });
    }
  }, [isConnected]);

  const deleteMessage = useCallback((messageId: string, userId: string, forEveryone: boolean, conversationId: string) => {
    if (socketref.current && isConnected) {
      socketref.current.emit("delete_message", { messageId, userId, forEveryone, conversationId });
    }
  }, [isConnected]);

  const contextValue = useMemo(
    () => ({ state, dispatch, sendMessage, sendTypingStart, sendTypingStop, markMessagesRead, sendReaction, deleteMessage }),
    [state, sendMessage, sendTypingStart, sendTypingStop, markMessagesRead, sendReaction, deleteMessage]
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
