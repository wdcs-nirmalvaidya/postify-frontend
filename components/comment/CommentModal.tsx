"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Comment } from "@/types/comment.type";
import { getComments, createComment } from "@/utils/Apis/commentApi";
import { CommentItem } from "./CommentItem";

interface CommentModalProps {
  postId: string | null;
  onClose: () => void;
}

export const CommentModal = ({ postId, onClose }: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    username: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postId) {
      const fetchComments = async () => {
        try {
          setLoading(true);
          const fetchedComments = await getComments(postId);
          setComments(fetchedComments);
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message || "Failed to fetch comments.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchComments();
    } else {
      setComments([]);
      setReplyingTo(null);
    }
  }, [postId]);

  const addCommentToState = (
    newComment: Comment,
    commentsList: Comment[],
  ): Comment[] => {
    if (!newComment.parent_id) {
      return [...commentsList, newComment];
    }

    return commentsList.map((comment) => {
      if (comment.id === newComment.parent_id) {
        const replies = comment.replies
          ? [...comment.replies, newComment]
          : [newComment];
        return { ...comment, replies };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: addCommentToState(newComment, comment.replies),
        };
      }
      return comment;
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId) return;

    try {
      const parentId = replyingTo ? replyingTo.commentId : null;
      const createdComment = await createComment(postId, newComment, parentId);
      setComments((prevComments) =>
        addCommentToState(createdComment, prevComments),
      );
      setNewComment("");
      setReplyingTo(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create comment.");
      }
    }
  };

  const handleSetReplyingTo = (commentId: string) => {
    const findComment = (id: string, list: Comment[]): Comment | undefined => {
      for (const c of list) {
        if (c.id === id) return c;
        if (c.replies) {
          const found = findComment(id, c.replies);
          if (found) return found;
        }
      }
    };
    const comment = findComment(commentId, comments);
    if (comment) {
      setReplyingTo({ commentId, username: comment.author.username });
      inputRef.current?.focus();
    }
  };

  return (
    <AnimatePresence>
      {postId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose();
            setReplyingTo(null);
          }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-blue-700">Comments</h3>
              <button
                onClick={() => {
                  onClose();
                  setReplyingTo(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <p>Loading...</p>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleSetReplyingTo}
                  />
                ))
              )}
            </div>

            <div className="p-4 border-t">
              {replyingTo && (
                <div className="text-sm text-gray-500 mb-2 flex justify-between">
                  <span>
                    Replying to <strong>@{replyingTo.username}</strong>
                  </span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="font-semibold hover:text-red-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <form
                onSubmit={handleSubmitComment}
                className="flex items-center space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:bg-blue-300"
                  disabled={!newComment.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
