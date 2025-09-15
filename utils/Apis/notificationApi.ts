import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/`,
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

export const fetchNotifications = async () => {
  try {
    const response = await apiClient.get("/notifications");
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      toast(error.message || "Failed to get notifications.");
    }
    return [];
  }
};

export const markNotificationsAsRead = async () => {
  try {
    const response = await apiClient.post("/notifications/read");
    console.log("Notifications marked as read successfully:", response.data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      toast(error.message || "Failed to mark notifications as read.");
    }
  }
};
