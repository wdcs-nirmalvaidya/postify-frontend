"use client";

import { useChat } from "@/utils/context/ChatContext";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { getMessages } from "@/utils/Apis/chatApi";
import { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { PublicUser } from "@/types/user.type";
import { ChatHeader } from "./ChatHeader";
import { MessageSkeleton } from "./skeletons/MessageSkeleton";

export const ChatWindow = ({ user }: { user: PublicUser }) => {
  const { state, dispatch } = useChat();
  const { activeConversationId, messages, loadingMessages } = state;

  const [pageNum, setPageNum] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const activeMessages = messages[activeConversationId || ""] || [];

  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
    delay: 100,
  });

  const fetchMessages = useCallback(
    async (pageToFetch: number) => {
      if (!activeConversationId || loadingMessages || !hasMoreMessages) return;

      dispatch({ type: "SET_LOADING_MESSAGES", payload: true });

      try {
        const newMessages = await getMessages(
          activeConversationId,
          pageToFetch,
          20,
        );
        if (newMessages.length > 0) {
          dispatch({
            type: "PREPEND_MESSAGES",
            payload: {
              conversationId: activeConversationId,
              messages: newMessages,
            },
          });
          setPageNum((prev) => prev + 1);
        } else {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error("[fetchMessages] Error:", error);
      } finally {
        dispatch({
          type: "MARK_CONVERSATION_READ",
          payload: activeConversationId,
        });
        dispatch({ type: "SET_LOADING_MESSAGES", payload: false });
      }
    },
    [activeConversationId, dispatch, loadingMessages, hasMoreMessages],
  );

  useEffect(() => {
    const initConversation = async () => {
      if (!activeConversationId) return;
      dispatch({ type: "CLEAR_MESSAGES", payload: activeConversationId });
      setPageNum(1);
      setHasMoreMessages(true);
      await fetchMessages(1);
    };
    initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (inView && hasMoreMessages && !loadingMessages && pageNum > 1) {
      fetchMessages(pageNum);
    }
  }, [inView, hasMoreMessages, loadingMessages, pageNum, fetchMessages]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Select a conversation to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <ChatHeader user={user} />

      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
        {loadingMessages && activeMessages.length === 0 ? (
          <div className="space-y-4">
            <MessageSkeleton />
            <MessageSkeleton sent />
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton sent />
          </div>
        ) : (
          <MessageList messages={activeMessages} />
        )}

        {hasMoreMessages && <div ref={inViewRef} className="h-1" />}

        {loadingMessages && activeMessages.length > 0 && (
          <div className="text-center p-4">Loading older messages...</div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex-shrink-0">
        <MessageInput conversationId={activeConversationId!} />
      </div>
    </div>
  );
};
