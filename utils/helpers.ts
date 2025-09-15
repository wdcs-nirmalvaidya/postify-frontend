import { Conversation } from "@/types/chat.types";
import { PublicUser } from "@/types/user.type";

export const getChatObjectMetadata = (
  conversation: Conversation,
  currentUser: PublicUser,
) => {
  if (!conversation) {
    return { title: "", description: "", avatar: "" };
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser.id,
  );

  return {
    title:
      otherParticipant?.name || otherParticipant?.username || "Unknown User",
    description: `@${otherParticipant?.username || "..."}`,
    avatar:
      otherParticipant?.avatar_url ||
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
  };
};
