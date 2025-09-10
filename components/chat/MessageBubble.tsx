"use client";

import { Message } from "@/types/chat.types";
import { useAuth } from "@/utils/hooks/useAuth";
import Image from "next/image";

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
}

export const MessageBubble = ({ message, showAvatar }: MessageBubbleProps) => {
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.id;

  return (
    <div
      className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && showAvatar && (
        <Image
          src={message.sender?.avatar_url || "/default-avatar.png"}
          alt={message.sender?.name || "User"}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      )}
      {!isOwnMessage && !showAvatar && <div className="w-10" />}

      <div
        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-md ${
          isOwnMessage
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"
        }`}
      >
        <p className="text-sm">{message.contentText}</p>
        <p
          className={`text-xs mt-1 text-right ${
            isOwnMessage ? "text-blue-200" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
