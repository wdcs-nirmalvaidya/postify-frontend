"use client";
import { searchUsers } from "@/utils/Apis/userApi";
import { PublicUser } from "@/types/user.type";
import { useState } from "react";
import { Search } from "lucide-react";
import { createConversation, getConversations } from "@/utils/Apis/chatApi";
import { useChat } from "@/utils/context/ChatContext";
import { useAuth } from "@/utils/hooks/useAuth";

export const ConversationSearch = () => {
  const { dispatch } = useChat();
  const { user: authUser } = useAuth();

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchQuery = async (query: string) => {
    setUserSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const result = await searchUsers(query);
      setSearchResults(result);
      setShowDropdown(true);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleStartChat = async (receiver: PublicUser) => {
    try {
      console.log("📩 Starting chat...");
      console.log("➡️ Receiver object:", receiver);
      console.log("➡️ Sender (authUser) object:", authUser);

      console.log("📦 Payload to API:", {
        senderId: authUser?.id,
        receiverId: receiver.id,
      });

      const response = await createConversation(receiver.id);

      console.log("✅ API Response from createConversation:", response);

      if (!response || !response.conversationId) {
        console.error(
          "💥 Failed to create conversation or missing conversationId.",
        );
        return;
      }

      const conversationId = response.conversationId;

      const updated = await getConversations();
      console.log("🔄 Updated conversations list:", updated);

      dispatch({ type: "SET_CONVERSATIONS", payload: updated });
      dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conversationId });

      setShowDropdown(false);
      setUserSearchQuery("");
    } catch (error) {
      console.error("💥 Error starting chat:", error);
    }
  };

  return (
    <div className="relative p-2">
      <input
        type="text"
        placeholder="Search users..."
        value={userSearchQuery}
        onChange={(e) => handleSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search
        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg border max-h-60 overflow-y-auto z-50">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleStartChat(user)}
            >
              {user.name}{" "}
              <span className="text-gray-500">@{user.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
