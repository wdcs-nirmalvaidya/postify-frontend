import { Conversation } from "@/types/chat.types";
import { PublicUser } from "@/types/user.type";

/**
 * Gets the display metadata (title, avatar, description) for a chat.
 * For a 1-on-1 chat, it returns the other person's details.
 * For a group chat, it would return the group's name.
 */
export const getChatObjectMetadata = (
  conversation: Conversation,
  currentUser: PublicUser,
) => {
  if (!conversation) {
    return { title: "", description: "", avatar: "" };
  }

  // In a 1-on-1 chat, find the other participant
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id,
  );

  // In a real app with group chats, you would add a check here:
  // if (conversation.isGroupChat) { return { title: conversation.name, ... } }

  return {
    title:
      otherParticipant?.name || otherParticipant?.username || "Unknown User",
    description: `@${otherParticipant?.username || "..."}`,
    avatar: otherParticipant?.avatar_url || "/default-avatar.png",
  };
};
