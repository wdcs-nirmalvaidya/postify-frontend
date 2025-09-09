"use client";

import Image from "next/image";
import { useState } from "react";
import { Comment } from "@/types/comment.type";

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string) => void;
}

export const CommentItem = ({ comment, onReply }: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="flex items-start space-x-3">
      <Image
        src={
          comment.author.avatar_url ||
          "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
        }
        alt={comment.author.name || comment.author.username}
        width={32}
        height={32}
        className="rounded-full mt-1"
      />
      <div className="flex-1">
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="font-semibold text-sm text-gray-800">
            {comment.author.username}
          </p>
          <p className="text-gray-700">{comment.content_text}</p>
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
          <button
            onClick={() => onReply(comment.id)}
            className="hover:underline"
          >
            Reply
          </button>
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="hover:underline"
            >
              {showReplies ? "Hide" : "Show"} {comment.replies.length} replies
            </button>
          )}
        </div>

        {showReplies && comment.replies && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
