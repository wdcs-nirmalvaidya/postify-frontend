"use client";

import { useChat } from "@/utils/context/ChatContext";
import { useAuth } from "@/utils/hooks/useAuth";
import Image from "next/image";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { getChatObjectMetadata } from "@/utils/helpers";
import { getMessages } from "@/utils/Apis/chatApi";
import { useEffect } from "react";

export const ChatWindow = () => {
  const { state, dispatch } = useChat();
  const { user } = useAuth();
  const { activeConversationId, conversations, messages, loadingMessages } =
    state;

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const activeMessages = messages[activeConversationId || ""] || [];

  useEffect(() => {
    if (!activeConversationId) return;
    const fetchMessages = async () => {
      dispatch({ type: "SET_LOADING_MESSAGES", payload: true });
      try {
        const messages = await getMessages(activeConversationId);
        console.log("[fetchMessages] API returned:", messages);
        dispatch({
          type: "SET_MESSAGES",
          payload: { conversationId: activeConversationId, messages },
        });
      } catch (error) {
        console.error("[fetchMessages] Error:", error);
      }
      dispatch({ type: "SET_LOADING_MESSAGES", payload: false });
    };
    fetchMessages();
  }, [activeConversationId, dispatch]);

  if (!activeConversation || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  const chatMetadata = getChatObjectMetadata(activeConversation, user);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center p-3 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex-shrink-0 sticky top-0 z-10 shadow-sm">
        <Image
          src={chatMetadata.avatar}
          alt={chatMetadata.title}
          width={40}
          height={40}
          className="rounded-full mr-4 object-cover"
        />
        <div>
          <p className="font-bold text-gray-800 dark:text-white">
            {chatMetadata.title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {chatMetadata.description}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={activeMessages} isLoading={loadingMessages} />
      </div>

      <div className="flex-shrink-0 sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <MessageInput conversationId={activeConversationId!} />
      </div>
    </div>
  );
};
