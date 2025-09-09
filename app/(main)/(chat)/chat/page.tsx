"use client";

import { useEffect } from "react";
import { useChat } from "@/utils/context/ChatContext";
import { getConversations } from "@/utils/Apis/chatApi"; // Import our new API function
import toast from "react-hot-toast";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { AuthGuard } from "@/components/user/AuthGurd";

export default function ChatPage() {
  const { state, dispatch } = useChat();
  const { activeConversationId } = state;

  useEffect(() => {
    const fetchInitialConversations = async () => {
      dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
      try {
        const conversations = await getConversations();
        dispatch({ type: "SET_CONVERSATIONS", payload: conversations });
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: false });
      }
    };

    fetchInitialConversations();
  }, [dispatch]);

  return (
    <AuthGuard>
      <div className="flex h-full">
        <ConversationList />
        <div className="flex-1 flex flex-col">
          {activeConversationId ? (
            <ChatWindow key={activeConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">
                Select a conversation to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
