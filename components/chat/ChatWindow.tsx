"use client";

import { useChat } from "@/utils/context/ChatContext";
import { useAuth } from "@/utils/hooks/useAuth";
import Image from "next/image";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { getChatObjectMetadata } from "@/utils/helpers";
import { getMessages } from "@/utils/Apis/chatApi";
import { useEffect, useState, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";

export const ChatWindow = () => {
  const { state, dispatch } = useChat();
  const { user } = useAuth();
  const { activeConversationId, conversations, messages, loadingMessages } =
    state;

  const [pageNum, setPageNum] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const activeMessages = messages[activeConversationId || ""] || [];

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      ref(node);
      if (inViewRef.current) {
        inViewRef.current = node;
      }
    },
    [ref],
  );

  const fetchMessages = useCallback(async () => {
    if (!activeConversationId || loadingMessages) return;
    dispatch({ type: "SET_LOADING_MESSAGES", payload: true });

    try {
      const newMessages = await getMessages(activeConversationId, pageNum, 20);
      if (newMessages.length > 0) {
        dispatch({
          type: "PREPEND_MESSAGES",
          payload: {
            conversationId: activeConversationId,
            messages: newMessages,
          },
        });
        setPageNum((prev) => prev + 1);
      }
    } catch (error) {
      console.error("[fetchMessages] Error:", error);
    } finally {
      dispatch({ type: "SET_LOADING_MESSAGES", payload: false });
    }
  }, [activeConversationId, pageNum, dispatch, loadingMessages]);

  useEffect(() => {
    if (inView) {
      fetchMessages();
    }
  }, [inView, fetchMessages]);

  useEffect(() => {
    setPageNum(1);

    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timeout);
  }, [activeConversationId]);

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
      <div className="sticky top-0 z-10 flex items-center p-3 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex-shrink-0 shadow-sm">
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

      <div className="flex-1 overflow-y-auto p-4" ref={messageListRef}>
        <div ref={setRefs} className="h-6" />
        <MessageList
          messages={activeMessages}
          isLoading={loadingMessages}
          messageListRef={messageListRef}
          messagesEndRef={messagesEndRef}
          inViewRef={inViewRef}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex-shrink-0">
        <MessageInput conversationId={activeConversationId!} />
      </div>
    </div>
  );
};
