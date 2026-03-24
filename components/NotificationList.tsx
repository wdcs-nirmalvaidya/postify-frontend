"use client";

import React from "react";
import { useNotifications } from "@/utils/context/NotificationsContext";

type Notification = {
  _id: string;
  type: "follow" | "like" | "dislike" | "comment" | string;
  sender?: { username?: string };
  read: boolean;
  createdAt: string | Date;
};

const NotificationList = () => {
  const { notifications, markAllAsRead } = useNotifications();

  const renderMessage = (notification: Notification) => {
    const senderName = notification.sender?.username || "Someone";
    switch (notification.type) {
      case "follow":
        return `${senderName} started following you`;
      case "like":
        return `${senderName} liked your post`;
      case "dislike":
        return `${senderName} disliked your post`;
      case "comment":
        return `${senderName} commented on your post`;
      default:
        return "You have a new notification";
    }
  };

  return (
    <div className="p-4 border dark:border-gray-800 rounded bg-white dark:bg-gray-950 shadow w-80">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <button
            className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No notifications yet.
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-3 border-b dark:border-gray-800 last:border-b-0 transition-colors ${!n.read ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-900"}`}
            >
              <p className={`text-sm ${!n.read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                {renderMessage(n)}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-500 block mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;
