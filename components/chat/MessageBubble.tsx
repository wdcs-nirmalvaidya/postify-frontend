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
      className={`flex items-end gap-2 my-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && showAvatar && (
        <Image
          src={message.sender?.avatar_url || "/default-avatar.png"}
          alt={message.sender?.name || "User"}
          width={32}
          height={32}
          className="rounded-full object-cover self-start"
        />
      )}
      {!isOwnMessage && !showAvatar && <div className="w-8" />}

      <div
        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-lg"
            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-lg"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.contentText}</p>
        <p
          className={`text-xs mt-1 text-right ${
            isOwnMessage ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
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
