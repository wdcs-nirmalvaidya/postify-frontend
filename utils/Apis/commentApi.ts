import axios from "axios";
import { Comment } from "@/types/comment.type";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to fetch comments.");
    } else {
      throw new Error("Failed to fetch comments.");
    }
  }
};

export const createComment = async (
  postId: string,
  content_text: string,
  parentId?: string | null,
): Promise<Comment> => {
  try {
    const response = await apiClient.post(`/posts/${postId}/comments`, {
      content_text,
      parent_id: parentId,
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Failed to create comment.");
    } else {
      throw new Error("Failed to create comment.");
    }
  }
};
