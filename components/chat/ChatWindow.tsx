"use client";

import { useChat } from "@/utils/context/ChatContext";
import { useAuth } from "@/utils/hooks/useAuth";
import Image from "next/image";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { getChatObjectMetadata } from "@/utils/helpers";

export const ChatWindow = () => {
  const { state } = useChat();
  const { user } = useAuth();
  const { activeConversationId, conversations, messages, loadingMessages } =
    state;

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const activeMessages = messages[activeConversationId || ""] || [];

  if (!activeConversation || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  const chatMetadata = getChatObjectMetadata(activeConversation, user);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center p-4 border-b bg-white">
        <Image
          src={chatMetadata.avatar || "/default-avatar.png"}
          alt={chatMetadata.title || "Chat"}
          width={40}
          height={40}
          className="rounded-full mr-4"
        />
        <div>
          <p className="font-bold text-gray-800">{chatMetadata.title}</p>
          <p className="text-sm text-gray-500">{chatMetadata.description}</p>
        </div>
      </div>

      <MessageList messages={activeMessages} isLoading={loadingMessages} />

      <MessageInput conversationId={activeConversationId!} />
    </div>
  );
};
