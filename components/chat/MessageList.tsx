"use client";

import { useEffect, useRef, RefObject } from "react";
import { Message } from "@/types/chat.types";
import { MessageBubble } from "./MessageBubble";
import { MessageSkeleton } from "./skeletons/MessageSkeleton";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messageListRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  inViewRef: RefObject<HTMLDivElement | null>;
}

export const MessageList = ({
  messages,
  isLoading,
  messageListRef,
  messagesEndRef,
  inViewRef,
}: MessageListProps) => {
  const isInitialLoad = useRef(true);
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    if (isInitialLoad.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isInitialLoad.current = false;
    } else if (
      messageListRef.current &&
      messageListRef.current.scrollHeight - messageListRef.current.scrollTop <
        messageListRef.current.clientHeight + 200 &&
      messages.length > prevMessagesLength.current
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages, messagesEndRef, messageListRef]);

  useEffect(() => {
    if (
      messageListRef.current &&
      messages.length > prevMessagesLength.current
    ) {
      const oldScrollHeight = messageListRef.current.scrollHeight;
      setTimeout(() => {
        const newScrollHeight = messageListRef.current?.scrollHeight || 0;
        messageListRef.current?.scrollTo({
          top:
            newScrollHeight -
            oldScrollHeight +
            (messageListRef.current?.scrollTop || 0),
          behavior: "auto",
        });
      }, 0);
    }
  }, [messages, messageListRef]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div ref={messageListRef} className="flex-1 overflow-y-auto p-4">
      <div ref={inViewRef} className="h-6"></div>
      <div className="space-y-4 flex flex-col">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} showAvatar={true} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
