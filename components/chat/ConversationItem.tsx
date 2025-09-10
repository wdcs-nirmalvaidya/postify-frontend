"use client";

import Image from "next/image";
import { Conversation } from "@/types/chat.types";
import { useAuth } from "@/utils/hooks/useAuth";
import { getChatObjectMetadata } from "@/utils/helpers";

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

  if (!user) {
    // Render a placeholder or nothing while user is loading
    return null;
  }

  const metadata = getChatObjectMetadata(conversation, user);

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200 ease-in-out ${
        isActive
          ? "bg-blue-500 text-white shadow-lg"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <div className="relative">
        <Image
          src={metadata.avatar}
          alt={metadata.title}
          width={48}
          height={48}
          className="rounded-full mr-4 object-cover border-2 border-transparent group-hover:border-blue-500"
        />
        {/* Add online/offline status indicator if available */}
        {/* <span className="absolute bottom-0 right-4 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span> */}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <p
            className={`font-bold truncate ${
              isActive ? "text-white" : "text-gray-800 dark:text-white"
            }`}
          >
            {metadata.title}
          </p>
          <p
            className={`text-xs flex-shrink-0 ${
              isActive ? "text-blue-200" : "text-gray-400 dark:text-gray-500"
            }`}
          >
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
          <p
            className={`text-sm truncate ${
              isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {conversation.lastMessage
              ? conversation.lastMessage.contentText
              : "No messages yet"}
          </p>
          {conversation.unreadCount > 0 && (
            <span
              className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                isActive ? "bg-white text-blue-500" : "bg-blue-500 text-white"
              }`}
            >
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
