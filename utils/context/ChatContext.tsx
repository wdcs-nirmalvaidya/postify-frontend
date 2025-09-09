"use client";
import React, { createContext, useContext, useReducer, ReactNode } from "react";
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
    };

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
          [action.payload.conversationId]: action.payload.messages,
        },
        loadingMessages: false,
      };
    case "ADD_MESSAGE":
      const msg = action.payload;
      const existingMessages = state.messages[msg.conversationId] || [];
      if (existingMessages.some((m) => m.id === msg.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [msg.conversationId]: [...existingMessages, msg],
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
    case "UPDATE_CONVERSATION_NOTIFICATION":
      const notif = action.payload;
      return {
        ...state,
        conversations: state.conversations
          .map((c) =>
            c.id === notif.conversationId
              ? {
                  ...c,
                  lastMessage: notif.lastMessage,
                  unreadCount: (c.unreadCount || 0) + 1,
                  updatedAt: notif.lastMessage
                    ? notif.lastMessage.createdAt
                    : c.updatedAt,
                }
              : c,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      };
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
      const { conversationId, messages: olderMessages } = action.payload;
      const currentMessages = state.messages[conversationId] || [];
      const messageIds = new Set(currentMessages.map((m) => m.id));
      const newMessages = olderMessages.filter((m) => !messageIds.has(m.id));
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [...newMessages, ...currentMessages],
        },
      };
    }

    case "REPLACE_MESSAGE": {
      const { tempId, finalMessage } = action.payload;
      const conversationId = finalMessage.conversationId;
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).map((m) =>
            m.id === tempId ? finalMessage : m,
          ),
        },
      };
    }

    default:
      return state;
  }
};

const ChatContext = createContext<
  | {
      state: ChatState;
      dispatch: React.Dispatch<ChatAction>;
    }
  | undefined
>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    conversations: [],
    messages: {},
    activeConversationId: null,
    loadingConversations: true,
    loadingMessages: false,
  });

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
