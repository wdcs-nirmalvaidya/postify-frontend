// utils/Apis/memoryApi.ts
import axios from "axios";
import { Post } from "@/types/post.types";

export interface Memory {
    id: string;
    title: string;
    date_range: string;
    posts: Post[];
}

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

export const getMemories = async (): Promise<Memory[]> => {
    try {
        const response = await apiClient.get("/memories");
        return response.data.memories;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message ||
                "Failed to fetch memories. Please try again later.",
            );
        }
        throw new Error(
            "An unexpected error occurred while fetching memories. Please try again.",
        );
    }
};
