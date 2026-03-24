"use client";

import { useEffect, useState } from "react";
import { useChat } from "@/utils/context/ChatContext";
import { getConversations } from "@/utils/Apis/chatApi";
import toast from "react-hot-toast";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { AuthGuard } from "@/components/user/AuthGurd";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/utils/hooks/useAuth";

export default function ChatPage() {
  const { state, dispatch } = useChat();
  const { user } = useAuth();
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
      <div className="flex h-full bg-gray-100 dark:bg-black">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-white dark:bg-gray-950 border-r dark:border-gray-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <ConversationList />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="md:hidden p-2 bg-white dark:bg-gray-950 border-b dark:border-gray-800 flex justify-between items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Chats
            </h1>
          </div>

          {activeConversationId && user ? (
            <ChatWindow key={activeConversationId} user={user} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-4 text-center">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Welcome to Your Inbox!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Select a conversation from the list on the left to start
                  chatting. If you don&apos;t have any conversations yet, you
                  can start one by searching for a user.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                  Start a New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
