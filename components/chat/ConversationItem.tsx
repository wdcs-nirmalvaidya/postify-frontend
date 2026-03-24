"use client";

import Image from "next/image";
import { Conversation } from "@/types/chat.types";
import { useAuth } from "@/utils/hooks/useAuth";
import { getChatObjectMetadata } from "@/utils/helpers";
import { useChat } from "@/utils/context/ChatContext";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) => {
  const { user } = useAuth();
  const { state } = useChat();

  if (!user) return null;

  const metadata = getChatObjectMetadata(conversation, user);

  // Determine if the other participant is online
  const otherParticipant = conversation.participants.find((p) => p.id !== user.id);
  const isOnline = otherParticipant ? state.onlineUsers.has(otherParticipant.id) : false;

  const lastMsgText = conversation.lastMessage
    ? conversation.lastMessage.deletedForEveryone
      ? "This message was deleted"
      : conversation.lastMessage.mediaType === "image"
        ? "📷 Photo"
        : conversation.lastMessage.mediaType === "audio"
          ? "🎤 Voice message"
          : conversation.lastMessage.contentText || ""
    : "No messages yet";

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200 ease-in-out group ${isActive
          ? "bg-blue-600 text-white shadow-md"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
    >
      <div className="relative flex-shrink-0 mr-4">
        <Image
          src={metadata.avatar}
          alt={metadata.title}
          width={48}
          height={48}
          className="rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all"
        />
        {/* Online status dot */}
        <span
          className={`absolute bottom-0.5 right-0.5 block h-3 w-3 rounded-full border-2 transition-all ${isOnline
              ? "bg-green-500 border-white dark:border-gray-800"
              : "bg-gray-400 border-white dark:border-gray-800"
            }`}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <p className={`font-bold truncate text-base ${isActive ? "text-white" : "text-gray-800 dark:text-white"}`}>
            {metadata.title}
          </p>
          <p className={`text-xs flex-shrink-0 ml-2 ${isActive ? "text-blue-200" : "text-gray-400 dark:text-gray-500"}`}>
            {conversation.lastMessage
              ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              : ""}
          </p>
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className={`text-sm truncate w-11/12 ${isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
            {lastMsgText}
          </p>
          {conversation.unreadCount > 0 && (
            <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ${isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white"
              }`}>
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
