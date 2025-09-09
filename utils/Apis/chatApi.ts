import axios from "axios";
import { Conversation } from "@/types/chat.types";

const chatApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CHAT_SOCKET_URL,
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
