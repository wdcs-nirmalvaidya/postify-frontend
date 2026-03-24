"use client";

import { Message } from "@/types/chat.types";
import { useAuth } from "@/utils/hooks/useAuth";
import { useChat } from "@/utils/context/ChatContext";
import Image from "next/image";
import { useState, useRef } from "react";
import { Check, CheckCheck, Trash2, SmilePlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
}

export const MessageBubble = ({ message, showAvatar }: MessageBubbleProps) => {
  const { user } = useAuth();
  const { sendReaction, deleteMessage } = useChat();
  const isOwnMessage = message.senderId === user?.id;
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read receipt logic
  const isSent = !!message.id && !message.id.startsWith("temp_");
  const isRead = message.readBy && message.readBy.length > 0;

  const handleReaction = (emoji: string) => {
    if (!user) return;
    sendReaction(message.id, user.id, emoji, message.conversationId);
    setShowReactionPicker(false);
    setShowMenu(false);
  };

  const handleDelete = (forEveryone: boolean) => {
    if (!user) return;
    deleteMessage(message.id, user.id, forEveryone, message.conversationId);
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
    setShowReactionPicker(false);
  };

  if (message.deletedForEveryone) {
    return (
      <div className={`flex items-end gap-2 my-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        {!isOwnMessage && <div className="w-8" />}
        <div className="px-4 py-2 rounded-2xl border border-dashed dark:border-gray-700 text-gray-400 text-sm italic">
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 my-1 group ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {/* Avatar */}
      {!isOwnMessage && showAvatar && (
        <Image
          src={message.sender?.avatar_url || "/default-avatar.png"}
          alt={message.sender?.name || "User"}
          width={32}
          height={32}
          className="rounded-full object-cover self-start flex-shrink-0"
        />
      )}
      {!isOwnMessage && !showAvatar && <div className="w-8 flex-shrink-0" />}

      <div className={`relative flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-xs md:max-w-md`}>
        {/* Context menu button — shows on hover */}
        <div
          ref={menuRef}
          className={`absolute top-1 ${isOwnMessage ? "-left-8" : "-right-8"} opacity-0 group-hover:opacity-100 transition-opacity z-10`}
        >
          <button
            onClick={toggleMenu}
            className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <SmilePlus size={14} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Context Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              className={`absolute ${isOwnMessage ? "right-0" : "left-0"} -top-28 z-20 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-xl p-2 min-w-max`}
            >
              {/* Quick reactions */}
              <div className="flex gap-1 mb-2 border-b dark:border-gray-700 pb-2">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {/* Delete options */}
              <button
                onClick={() => handleDelete(false)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg w-full"
              >
                <Trash2 size={14} />
                Delete for me
              </button>
              {isOwnMessage && (
                <button
                  onClick={() => handleDelete(true)}
                  className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-lg w-full"
                >
                  <Trash2 size={14} />
                  Delete for everyone
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm ${isOwnMessage
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white dark:bg-[#1e1e1e] border dark:border-gray-800 text-gray-800 dark:text-white rounded-bl-sm"
            }`}
          onClick={() => setShowMenu(false)}
        >
          {/* Image message */}
          {message.mediaType === "image" && message.mediaUrl && (
            <div className="rounded-lg overflow-hidden mb-1 max-w-[220px]">
              <img
                src={message.mediaUrl}
                alt="Image"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          )}

          {/* Audio message */}
          {message.mediaType === "audio" && message.mediaUrl && (
            <audio controls className="max-w-[200px] h-8 outline-none" src={message.mediaUrl} preload="none" />
          )}

          {/* Text content */}
          {message.contentText && (
            <p className="text-sm whitespace-pre-wrap">{message.contentText}</p>
          )}

          {/* Timestamp + Read receipt */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}>
            <span className="text-xs">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isOwnMessage && (
              isRead ? (
                <CheckCheck size={14} className="text-blue-300" />
              ) : isSent ? (
                <CheckCheck size={14} className="text-blue-100 opacity-70" />
              ) : (
                <Check size={14} className="text-blue-100 opacity-50" />
              )
            )}
          </div>
        </div>

        {/* Reactions row */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-0.5 mt-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            {/* Group reactions by emoji */}
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => user && handleReaction(emoji)}
                className={`text-xs bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded-full px-1.5 py-0.5 hover:scale-110 transition-transform ${message.reactions?.some(r => r.userId === user?.id && r.emoji === emoji)
                    ? "ring-1 ring-blue-400"
                    : ""
                  }`}
              >
                {emoji} {count > 1 ? count : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
