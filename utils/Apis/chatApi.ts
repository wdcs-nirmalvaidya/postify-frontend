import axios from "axios";
import { Conversation, Message } from "@/types/chat.types";

const chatApiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_CHAT_SOCKET_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

chatApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await chatApiClient.get("/chat/conversations");
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch conversations.",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching conversations.",
    );
  }
};

export const createConversation = async (
  receiverId: string,
): Promise<{ conversationId: string } | undefined> => {
  try {
    const response = await chatApiClient.post("/chat/conversations", {
      receiverId,
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Failed to create conversation.",
      );
    }
    return undefined;
  }
};

export const getMessages = async (
  conversationId: string,
  pageNum: number,
  limit: number,
): Promise<Message[]> => {
  try {
    const response = await chatApiClient.get(
      `/chat/conversations/${conversationId}/messages?page=${pageNum}&limit=${limit}`,
    );
    console.log("🚀 ~ getMessages ~ response:", response);

    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch messages.",
      );
    }
    throw new Error("An unexpected error occurred while fetching messages.");
  }
};

export const markConversationAsRead = async (
  conversationId: string,
): Promise<void> => {
  try {
    await chatApiClient.post(`/chat/conversations/${conversationId}/read`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Failed to mark conversation as read.",
      );
    }
    throw new Error(
      "An unexpected error occurred while marking conversation as read.",
    );
  }
};
