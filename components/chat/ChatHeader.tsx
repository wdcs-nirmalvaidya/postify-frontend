import { useChat } from "@/utils/context/ChatContext";
import { useAuth } from "@/utils/hooks/useAuth";
import Image from "next/image";
import { getChatObjectMetadata } from "@/utils/helpers";
import { PublicUser } from "@/types/user.type";
import { useRouter } from "next/navigation";

export const ChatHeader = ({ user }: { user: PublicUser }) => {
  const { state } = useChat();
  const { user: authUser } = useAuth();
  const { activeConversationId, conversations } = state;
  const router = useRouter();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  if (!activeConversation || !authUser) {
    return null;
  }

  const chatMetadata = getChatObjectMetadata(activeConversation, authUser);

  return (
    <div className="sticky top-0 z-10 flex items-center p-3 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex-shrink-0 shadow-sm">
      <Image
        src={chatMetadata.avatar ?? user.avatar_url ?? "/default-avatar.png"}
        alt={chatMetadata.title}
        width={40}
        height={40}
        className="rounded-full mr-4 object-cover"
      />
      <div onClick={() => router.push(`/profile/${chatMetadata.title}`)}>
        <p className="font-bold text-gray-800 dark:text-white">
          {chatMetadata.title || user.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {chatMetadata.description}
        </p>
      </div>
    </div>
  );
};
