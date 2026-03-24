"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Comment } from "@/types/comment.type";
import { getComments, createComment } from "@/utils/Apis/commentApi";
import { generateComment, rewriteComment } from "@/utils/Apis/aiApi";
import { CommentItem } from "./CommentItem";
import { CommentItemSkeleton } from "./CommentItemSkeleton";
import { Sparkles } from "lucide-react";

interface CommentModalProps {
  postId: string | null;
  postContent?: string;
  onClose: () => void;
}

export const CommentModal = ({ postId, postContent, onClose }: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGeneratingAILoading, setIsGeneratingAILoading] = useState(false);
  const [isRewritingAILoading, setIsRewritingAILoading] = useState(false);
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

  const handleGenerateAIComment = async () => {
    if (!postContent) {
      toast.error("Can't generate a comment without post context.");
      return;
    }

    try {
      setIsGeneratingAILoading(true);
      const generated = await generateComment(postContent);
      setNewComment(generated);
      toast.success("AI generated a comment!");
    } catch {
      toast.error("Failed to generate AI comment.");
    } finally {
      setIsGeneratingAILoading(false);
    }
  };

  const handleRewriteAIComment = async () => {
    if (!newComment.trim()) {
      toast.error("Type a draft comment first to rewrite it.");
      return;
    }

    try {
      setIsRewritingAILoading(true);
      const rewritten = await rewriteComment(newComment);
      setNewComment(rewritten);
      toast.success("AI rewrote your comment!");
    } catch {
      toast.error("Failed to rewrite your comment.");
    } finally {
      setIsRewritingAILoading(false);
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <CommentItemSkeleton key={i} />
      ))}
    </div>
  );

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
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
              <h3 className="text-xl font-bold text-blue-700 dark:text-indigo-400">Comments</h3>
              <button
                onClick={() => {
                  onClose();
                  setReplyingTo(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading
                ? renderSkeletons()
                : comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleSetReplyingTo}
                  />
                ))}
            </div>

            <div className="p-4 border-t dark:border-gray-800">
              {replyingTo && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex justify-between">
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

              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleGenerateAIComment}
                  disabled={isGeneratingAILoading}
                  className="flex flex-1 items-center justify-center space-x-1 py-1.5 px-3 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 focus:outline-none transition disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isGeneratingAILoading ? 'Generating...' : 'Auto-generate'}</span>
                </button>
                <button
                  onClick={handleRewriteAIComment}
                  disabled={!newComment.trim() || isRewritingAILoading}
                  className="flex flex-1 items-center justify-center space-x-1 py-1.5 px-3 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 focus:outline-none transition disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isRewritingAILoading ? 'Rewriting...' : 'Rewrite'}</span>
                </button>
              </div>

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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
