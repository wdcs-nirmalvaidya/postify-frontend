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
    <div className="p-4 border rounded bg-white shadow w-80">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Notifications</h2>
        {notifications.some((n) => !n.read) && (
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-2 border-b last:border-b-0 ${!n.read ? "bg-blue-50" : ""}`}
            >
              <p className={!n.read ? "font-semibold" : ""}>
                {renderMessage(n)}
              </p>
              <span className="ml-2 text-xs text-gray-500">
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
