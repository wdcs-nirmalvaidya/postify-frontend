"use client";

import { Message } from "@/types/chat.types";
import { MessageBubble } from "./MessageBubble";
import { useAuth } from "@/utils/hooks/useAuth";
import { format, isToday, isYesterday } from "date-fns";

interface MessageListProps {
  messages: Message[];
}

const getDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

export const MessageList = ({ messages }: MessageListProps) => {
  const { user } = useAuth();

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No messages yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Be the first to say something!
          </p>
        </div>
      </div>
    );
  }

  // Messages arrive sorted newest-first (for flex-col-reverse display)
  // We need to group them by date, so work with them in chronological order
  const chronological = [...messages].reverse();

  // Build groups: [{label, messages}]
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = "";

  for (const msg of chronological) {
    const label = getDateLabel(msg.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  // Reverse groups so newest is at the bottom (for flex-col-reverse parent)
  const reversedGroups = [...groups].reverse();

  return (
    <>
      {reversedGroups.map((group, gi) => (
        <div key={group.label + gi}>
          {/* Messages in reverse order within group (for flex-col-reverse) */}
          {[...group.messages].reverse().map((msg, i, arr) => {
            const nextMsg = arr[i + 1]; // next = older (we're reversed)
            const showAvatar = !nextMsg || nextMsg.senderId !== msg.senderId;
            // Filter out messages deleted for current user
            if (msg.deletedFor?.includes(user?.id || "")) return null;
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                showAvatar={showAvatar}
              />
            );
          })}
          {/* Date label — appears above the group's messages */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </>
  );
};
