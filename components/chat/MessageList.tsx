"use client";

import { Message } from "@/types/chat.types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No messages yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Be the first to say something!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} showAvatar={true} />
      ))}
    </>
  );
};
