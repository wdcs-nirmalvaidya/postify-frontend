import { getConversations } from "@/utils/Apis/chatApi";
import { useChat } from "@/utils/context/ChatContext";
import { useEffect } from "react";
import { ConversationItem } from "./ConversationItem";
import { ConversationSearch } from "./ConversationSearch";
import { ConversationSkeleton } from "./skeletons/ConversationSkeleton";

export const ConversationList = () => {
  const { state, dispatch } = useChat();
  const { activeConversationId, loadingConversations, conversations } = state;

  useEffect(() => {
    const fetchConversations = async () => {
      dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: true });
      try {
        const conversations = await getConversations();
        dispatch({ type: "SET_CONVERSATIONS", payload: conversations });
      } catch (error) {
        console.error(error);
      }
      dispatch({ type: "SET_LOADING_CONVERSATIONS", payload: false });
    };
    fetchConversations();
  }, [dispatch]);

  const handleSelectConversation = (conversationId: string) => {
    dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversationId });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b dark:border-gray-700 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Chats
        </h2>
      </div>

      <ConversationSearch />

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingConversations ? (
          <div>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((convo) => (
            <ConversationItem
              key={convo.id}
              conversation={convo}
              isActive={activeConversationId === convo.id}
              onClick={() => handleSelectConversation(convo.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No conversations yet.
          </div>
        )}
      </div>
    </div>
  );
};
