import axios from "axios";
import { PostFormData } from "@/types/post.types";

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

export const createPost = async (data: PostFormData) => {
  try {
    const response = await apiClient.post("/posts", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to create post. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while creating the post. Please try again.",
    );
  }
};

export const getCategories = async () => {
  try {
    const response = await apiClient.get("/posts/categories");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch categories. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching categories. Please try again.",
    );
  }
};

export const getPosts = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await apiClient.get(`/posts`, {
      params: { page, limit, _: new Date().getTime() },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch posts. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching posts. Please try again.",
    );
  }
};

export const getFeed = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get("/posts/feed", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch feed. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching the feed. Please try again.",
    );
  }
};

export const likePost = async (postId: string) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to like the post. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while liking the post. Please try again.",
    );
  }
};

export const unlikePost = async (postId: string) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to unlike the post. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while unliking the post. Please try again.",
    );
  }
};

export const dislikePost = async (postId: string) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/dislike`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to dislike the post. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while disliking the post. Please try again.",
    );
  }
};

export const undislikePost = async (postId: string) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}/dislike`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to remove dislike. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while removing dislike. Please try again.",
    );
  }
};

export const updatePost = async (
  postId: string,
  data: Partial<PostFormData>,
) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update the post. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while updating the post. Please try again.",
    );
  }
};

export const deletePost = async (postId: string) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete the post. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while deleting the post. Please try again.",
    );
  }
};

export const getPostsByUsername = async (username: string) => {
  try {
    const response = await apiClient.get(`/posts/user/${username}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch posts for user "${username}". Please try again later.`,
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching posts by username. Please try again.",
    );
  }
};

export const getPostLikers = async (id: string) => {
  try {
    const res = await apiClient.get(`/posts/${id}/likers`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch likers. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching likers. Please try again.",
    );
  }
};

export const getPostDislikes = async (id: string) => {
  try {
    const res = await apiClient.get(`/posts/${id}/dislikers`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch dislikers. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching dislikers. Please try again.",
    );
  }
};
