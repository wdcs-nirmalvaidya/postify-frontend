"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useChat } from "@/utils/context/ChatContext";
import { Conversation } from "@/types/chat.types";

const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) => {
  const otherParticipant = conversation.participants[0];
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors ${
        isActive ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
    >
      <Image
        src={otherParticipant.avatar_url || "/default-avatar.png"}
        alt={otherParticipant.name || "User Avatar"}
        width={48}
        height={48}
        className="rounded-full mr-4"
      />
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <p className="font-bold text-gray-800 truncate">
            {otherParticipant.name}
          </p>
          <p className="text-xs text-gray-400 flex-shrink-0">
            {conversation.lastMessage
              ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )
              : ""}
          </p>
        </div>
        <div className="flex justify-between items-start">
          <p className="text-sm text-gray-500 truncate">
            {conversation.lastMessage
              ? conversation.lastMessage.contentText
              : ""}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConversationList = () => {
  const { state, dispatch } = useChat();
  const { activeConversationId, loadingConversations, conversations } = state;

  useEffect(() => {
    dispatch({ type: "SET_CONVERSATIONS", payload: conversations });
  }, [dispatch, conversations]);

  const handleSelectConversation = (conversationId: string) => {
    dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversationId });
  };

  if (loadingConversations) {
    return <div className="w-96 border-r p-4">Loading chats...</div>;
  }

  return (
    <div className="w-96 border-r flex flex-col overflow-hidden flex-shrink-0">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((convo) => (
          <ConversationItem
            key={convo.id}
            conversation={convo}
            isActive={activeConversationId === convo.id}
            onClick={() => handleSelectConversation(convo.id)}
          />
        ))}
      </div>
    </div>
  );
};
