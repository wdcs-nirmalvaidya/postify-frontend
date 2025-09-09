import { PublicUser } from "./user.type";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  contentText: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  sender?: PublicUser;
  createdAt: string;
  updatedAt: string;
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
