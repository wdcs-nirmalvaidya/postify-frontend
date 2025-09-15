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
import { Conversation, Message, UnReadnotification } from "@/types/chat.types";

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  loadingConversations: boolean;
  loadingMessages: boolean;
}

type ChatAction =
  | { type: "SET_LOADING_CONVERSATIONS"; payload: boolean }
  | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
  | { type: "SET_LOADING_MESSAGES"; payload: boolean }
  | {
      type: "SET_MESSAGES";
      payload: { conversationId: string; messages: Message[] };
    }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_CONVERSATION_NOTIFICATION"; payload: UnReadnotification }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: string | null }
  | { type: "MARK_CONVERSATION_READ"; payload: string }
  | {
      type: "PREPEND_MESSAGES";
      payload: { conversationId: string; messages: Message[] };
    }
  | {
      type: "REPLACE_MESSAGE";
      payload: { tempId: string; finalMessage: Message };
    }
  | { type: "CLEAR_MESSAGES"; payload: string };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_LOADING_CONVERSATIONS":
      return { ...state, loadingConversations: action.payload };

    case "SET_CONVERSATIONS":
      return {
        ...state,
        conversations: action.payload,
        loadingConversations: false,
      };

    case "SET_LOADING_MESSAGES":
      return { ...state, loadingMessages: action.payload };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [...action.payload.messages].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        },
        loadingMessages: false,
      };

    case "ADD_MESSAGE": {
      const msg = action.payload;
      const existing = state.messages[msg.conversationId] || [];

      if (
        existing.some(
          (m) => m.id === msg.id || (msg.tempId && m.id === msg.tempId),
        )
      )
        return state;

      const updatedMessages = [...existing, msg].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return {
        ...state,
        messages: {
          ...state.messages,
          [msg.conversationId]: updatedMessages,
        },
        conversations: state.conversations
          .map((c) =>
            c.id === msg.conversationId
              ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
              : c,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
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
              ? {
                  ...c,
                  lastMessage: notif.lastMessage,
                  unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1,
                  updatedAt: notif.lastMessage?.createdAt || c.updatedAt,
                }
              : c,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      };
    }

    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversationId: action.payload };

    case "MARK_CONVERSATION_READ":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload ? { ...c, unreadCount: 0 } : c,
        ),
      };

    case "PREPEND_MESSAGES": {
      const { conversationId, messages } = action.payload;
      const current = state.messages[conversationId] || [];

      const ids = new Set(current.map((m) => m.id));
      const unique = messages.filter((m) => !ids.has(m.id));

      const updated = [...unique, ...current].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    }

    case "REPLACE_MESSAGE": {
      const { tempId, finalMessage } = action.payload;
      const cid = finalMessage.conversationId;

      return {
        ...state,
        messages: {
          ...state.messages,
          [cid]: (state.messages[cid] || []).map((m) =>
            m.tempId === tempId || m.id === tempId ? finalMessage : m,
          ),
        },
      };
    }

    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload]: [],
        },
      };

    default:
      return state;
  }
};

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (payload: {
    conversationId: string;
    senderId: string;
    content: string;
    tempId: string;
  }) => void;
} | null>(null);

const socketref: { current: Socket | null } = { current: null };

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    conversations: [],
    messages: {},
    activeConversationId: null,
    loadingConversations: true,
    loadingMessages: false,
  });

  const [isConnected, setIsConnected] = useState(false);
  const previousConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isConnected && socketref.current) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        socketref.current.emit("join_user", userId);
        console.log(`🚪 Joined user room: ${userId}`);
      }
    }
  }, [isConnected]);

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

      socketref.current.on("receive_message", (message: Message) => {
        dispatch({ type: "ADD_MESSAGE", payload: message });
        console.log("📩 Received:", message);
      });

      socketref.current.on(
        "unread_notification",
        (notif: UnReadnotification) => {
          dispatch({
            type: "UPDATE_CONVERSATION_NOTIFICATION",
            payload: notif,
          });
        },
      );
    }

    return () => {
      if (socketref.current) {
        socketref.current.disconnect();
        socketref.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected && socketref.current) {
      const previousConversationId = previousConversationIdRef.current;

      if (
        previousConversationId &&
        previousConversationId !== state.activeConversationId
      ) {
        socketref.current.emit("leave_conversation", previousConversationId);
      }

      if (state.activeConversationId) {
        socketref.current.emit("join_conversation", state.activeConversationId);
      }

      previousConversationIdRef.current = state.activeConversationId;
    }
  }, [isConnected, state.activeConversationId]);

  const sendMessage = useCallback(
    (payload: {
      conversationId: string;
      senderId: string;
      content: string;
      tempId: string;
    }) => {
      if (socketref.current && isConnected) {
        socketref.current.emit("send_message", payload);
      } else {
        console.error("Socket not connected, cannot send message.");
      }
    },
    [isConnected],
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      sendMessage,
    }),
    [state, sendMessage],
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
