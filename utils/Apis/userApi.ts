import { PublicUser } from "@/types/user.type";
import axios from "axios";

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

const handleError = (err: unknown, defaultMessage: string): Error => {
  if (axios.isAxiosError(err)) {
    return new Error(err.response?.data?.message || defaultMessage);
  }
  return new Error("An unexpected error occurred.");
};

export const searchUsers = async (query: string) => {
  try {
    const response = await apiClient.get("/users/search", {
      params: { q: query },
    });
    return response.data;
  } catch (err) {
    throw handleError(err, "Search failed.");
  }
};

export const getFollowSuggestions = async () => {
  try {
    const response = await apiClient.get("/users/suggestions");
    return response.data;
  } catch (err) {
    throw handleError(err, "Failed to get suggestions.");
  }
};

export const followUser = async (userId: string) => {
  try {
    const response = await apiClient.post(`/users/${userId}/follow`);
    return response.data;
  } catch (err) {
    throw handleError(err, "Failed to follow user.");
  }
};

export const unfollowUser = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/users/${userId}/follow`);
    return response.data;
  } catch (err) {
    throw handleError(err, "Failed to unfollow user.");
  }
};

export const getUserProfile = async (username: string) => {
  try {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  } catch (err) {
    throw handleError(
      err,
      `Failed to fetch profile for user "${username}". Please try again later.`,
    );
  }
};

export const getUserPosts = async (username: string) => {
  try {
    const response = await apiClient.get(`/users/${username}/posts`);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message ||
          `Unable to load posts for user "${username}". Please try again later.`,
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching user posts. Please try again.",
    );
  }
};

export const updateUserProfile = async (data: Partial<PublicUser>) => {
  try {
    const response = await apiClient.put("/users/profile", data);
    return response.data;
  } catch (err) {
    throw handleError(err, "Failed to update your profile. Please try again.");
  }
};

export const updateUserPrivacy = async (isPrivate: boolean) => {
  try {
    const response = await apiClient.put("/users/profile/privacy", {
      is_private: isPrivate,
    });
    return response.data;
  } catch (err) {
    throw handleError(
      err,
      "Failed to update your privacy settings. Please try again.",
    );
  }
};

export const getFollowers = async (username: string) => {
  try {
    const response = await apiClient.get(`/users/${username}/followers`);
    return response.data;
  } catch (err) {
    throw handleError(
      err,
      `Failed to fetch followers for "${username}". Please try again later.`,
    );
  }
};

export const getFollowing = async (username: string) => {
  try {
    const response = await apiClient.get(`/users/${username}/following`);
    return response.data;
  } catch (err) {
    throw handleError(
      err,
      `Failed to fetch following list for "${username}". Please try again later.`,
    );
  }
};

export const getRandomUsers = async () => {
  try {
    const response = await apiClient.get("/users/explore/suggestions");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        error.message ||
          "Failed to fetch suggested users. Please try again later.",
      );
    }
    throw new Error(
      "An unexpected error occurred while fetching suggested users.",
    );
  }
};
