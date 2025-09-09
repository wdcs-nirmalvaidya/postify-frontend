"use client";

import { Message } from "@/types/chat.types";
import { useAuth } from "@/utils/hooks/useAuth";

export const MessageBubble = ({ message }: { message: Message }) => {
  const { user } = useAuth();
  const isOwnMessage = message.senderId === user?.id;

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-lg"
            : "bg-gray-200 text-gray-800 rounded-bl-lg"
        }`}
      >
        <p>{message.contentText}</p>
        <p
          className={`text-xs mt-1 text-right ${isOwnMessage ? "text-blue-200" : "text-gray-500"}`}
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
