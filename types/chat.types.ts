import { PublicUser } from "./user.type";

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface MessageReadBy {
  userId: string;
  readAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  contentText: string | null;
  mediaUrl: string | null;
  mediaType: "image" | "audio" | null;
  sender?: PublicUser;
  createdAt: string;
  updatedAt: string;
  tempId?: string;
  status?: "sending" | "sent" | "failed";
  readBy?: MessageReadBy[];
  reactions?: MessageReaction[];
  deletedFor?: string[];
  deletedForEveryone?: boolean;
}

export interface Conversation {
  id: string;
  updatedAt: string;
  participants: PublicUser[];
  lastMessage: Message | null;
  unreadCount: number;
}

export interface UnReadnotification {
  conversationId: string;
  lastMessage: Message | null;
  senderName: string | undefined;
}
