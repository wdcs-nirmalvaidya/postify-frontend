"use client";

import { useEffect, useState } from "react";
import { useChat } from "@/utils/context/ChatContext";
import { getConversations } from "@/utils/Apis/chatApi";
import toast from "react-hot-toast";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { AuthGuard } from "@/components/user/AuthGurd";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ChatPage() {
  const { state, dispatch } = useChat();
  const { activeConversationId } = state;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchInitialConversations = async () => {
      dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
      try {
        const conversations = await getConversations();
        dispatch({ type: "SET_CONVERSATIONS", payload: conversations });
        if (conversations.length > 0) {
          dispatch({
            type: "SET_ACTIVE_CONVERSATION",
            payload: conversations[0].id,
          });
        }
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
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Sidebar for conversations */}
        <div
          className={`fixed inset-y-0 left-0 z-30 w-80 transform bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ConversationList />
        </div>

        {/* Main chat window */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="md:hidden p-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          {activeConversationId ? (
            <ChatWindow key={activeConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                Select a conversation to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
