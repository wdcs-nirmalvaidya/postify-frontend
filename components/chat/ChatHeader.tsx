"use client";

import { useChat } from "@/utils/context/ChatContext";
import { useAuth } from "@/utils/hooks/useAuth";
import Image from "next/image";
import { getChatObjectMetadata } from "@/utils/helpers";
import { PublicUser } from "@/types/user.type";
import { useRouter } from "next/navigation";
import { TypingIndicator } from "./TypingIndicator";

export const ChatHeader = ({ user }: { user: PublicUser }) => {
  const { state } = useChat();
  const { user: authUser } = useAuth();
  const { activeConversationId, conversations, onlineUsers, typingUsers } = state;
  const router = useRouter();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  if (!activeConversation || !authUser) return null;

  const chatMetadata = getChatObjectMetadata(activeConversation, authUser);

  // Get the other participant
  const otherParticipant = activeConversation.participants.find((p) => p.id !== authUser.id);
  const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;

  // Check if other user is typing in active conversation
  const typingInfo = activeConversationId ? typingUsers[activeConversationId] : null;
  const isTyping = typingInfo?.isTyping && typingInfo.userId !== authUser.id;

  return (
    <div className="sticky top-0 z-10 flex items-center p-3 border-b bg-white dark:bg-gray-950 dark:border-gray-800 flex-shrink-0 shadow-sm">
      <div className="relative mr-4 flex-shrink-0">
        <Image
          src={chatMetadata.avatar ?? user.avatar_url ?? "/default-avatar.png"}
          alt={chatMetadata.title}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <span
          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white dark:border-gray-950 transition-all ${isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
        />
      </div>
      <div
        className="flex-1 cursor-pointer"
        onClick={() => router.push(`/profile/${chatMetadata.title}`)}
      >
        <p className="font-bold text-gray-800 dark:text-white leading-tight">
          {chatMetadata.title || user.name}
        </p>
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <p className={`text-xs font-medium ${isOnline ? "text-green-500" : "text-gray-400 dark:text-gray-500"}`}>
            {isOnline ? "● Online" : "Offline"}
          </p>
        )}
      </div>
    </div>
  );
};
