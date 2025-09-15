"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import useSocket from "@/utils/hooks/useNotificationSocket";
import {
  fetchNotifications,
  markNotificationsAsRead,
} from "@/utils/Apis/notificationApi";
import toast from "react-hot-toast";

interface NotificationSender {
  username: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: NotificationSender;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider = ({
  children,
}: NotificationsProviderProps) => {
  const socket = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    const sender = notification.sender?.username || "Someone";
    toast.success(`Notification Received from ${sender}`);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = (notification: Notification) => {
      addNotification(notification);
    };
    socket.off("notification", handler);
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socket, addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};
