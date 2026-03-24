"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, ThumbsDown, Smile, Flame, Ghost, Music } from "lucide-react";
import { Post, ReactionType } from "@/types/post.types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserListModal } from "@/components/user/UserListModal";
import { PublicUser } from "@/types/user.type";
import { AnimatePresence } from "framer-motion";
import { getSongById } from "@/utils/songsData";
import {
  getPostDislikes,
  getPostLikers as getPostLikersApi,
} from "@/utils/Apis/postApi";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLikeToggle: (postId: string, type?: ReactionType) => void;
  onDislikeToggle: (postId: string) => void;
  onCommentClick: (postId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const PostCard = ({
  post,
  currentUserId,
  onLikeToggle,
  onDislikeToggle,
  onCommentClick,
  onEdit,
  onDelete,
}: PostCardProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [userListTitle, setUserListTitle] = useState("");

  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [likers, setLikers] = useState<PublicUser[]>([]);

  const author = post?.author || {
    id: "",
    name: "Anonymous",
    username: "anonymous",
    avatar_url:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
  };

  const isAuthor = !!currentUserId && currentUserId === author.id;
  const likeColor = post?.user_has_liked ? "text-red-500" : "text-gray-500";
  const dislikeColor = post?.user_has_disliked
    ? "text-blue-500"
    : "text-gray-500";

  const isVideo = post?.image_url?.startsWith("data:video");

  const openUserListModal = async (type: "likers" | "dislikers") => {
    if (type === "likers") {
      await fetchPostLikers(post.id);
    } else {
      await fetchPostDislikers(post.id);
    }

    setIsUserListModalOpen(true);
  };

  const fetchPostDislikers = async (id: string) => {
    try {
      setUserListTitle("Disliked by");
      setIsModalLoading(true);
      setIsUserListModalOpen(true);
      const data = await getPostDislikes(id);
      if (Array.isArray(data)) {
        setLikers(data);
      } else {
        setLikers([]);
      }
    } catch (error) {
      console.error("Error fetching post dislikers:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const fetchPostLikers = async (id: string) => {
    try {
      setIsModalLoading(true);
      setIsUserListModalOpen(true);
      setUserListTitle("Liked by");
      const data = await getPostLikersApi(id);
      if (Array.isArray(data)) {
        setLikers(data);
      } else {
        setLikers([]);
      }
    } catch (error) {
      console.error("Error fetching post likers:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const [showReactions, setShowReactions] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reactions: { type: ReactionType; icon: string; label: string; color: string }[] = [
    { type: 'like', icon: '👍', label: 'Like', color: 'text-blue-500' },
    { type: 'love', icon: '❤️', label: 'Love', color: 'text-red-500' },
    { type: 'funny', icon: '😂', label: 'Funny', color: 'text-yellow-500' },
    { type: 'fire', icon: '🔥', label: 'Fire', color: 'text-orange-500' },
    { type: 'wow', icon: '😮', label: 'Wow', color: 'text-purple-500' },
  ];

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 500);
  };

  const getReactionDisplay = () => {
    if (!post.user_reaction_type) return { icon: <Heart size={20} />, color: "text-gray-500", label: "Like" };
    const r = reactions.find(rx => rx.type === post.user_reaction_type);
    if (!r) return { icon: <Heart size={20} />, color: "text-gray-500", label: "Like" };
    return { icon: <span className="text-xl">{r.icon}</span>, color: r.color, label: r.label };
  };

  const { icon: activeIcon, color: activeColor, label: activeLabel } = getReactionDisplay();

  const totalReactions = (post.likes_count || 0) + (post.love_count || 0) + (post.funny_count || 0) + (post.fire_count || 0) + (post.wow_count || 0);

  const attachedSong = post?.song ? getSongById(post.song) : null;

  return (
    <>
      <UserListModal
        isOpen={isUserListModalOpen}
        onClose={() => setIsUserListModalOpen(false)}
        title={userListTitle}
        users={likers}
        loading={isModalLoading}
      />

      <motion.div
        variants={cardVariants}
        className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60 border border-gray-100 dark:border-gray-800 dark:shadow-none dark:hover:shadow-none mb-6 relative transition-all duration-300"
      >
        {isAuthor && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MoreHorizontal size={20} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    onEdit(post);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(post?.id || "");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center mb-4">
          <Image
            src={
              author.avatar_url ||
              "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
            }
            alt={author.name || author.username}
            width={40}
            height={40}
            className="rounded-full mr-4 object-cover w-10 h-10 aspect-square"
            unoptimized
          />
          <div
            className="flex flex-col cursor-pointer"
            onClick={() => router.push(`/profile/${author.username}`)}
          >
            <p className="font-bold text-gray-800 dark:text-gray-200">
              {author.name || author.username}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1 flex-wrap">
              <span>@{author.username}</span>
              <span>·</span>
              <span>
                {post?.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </span>
              {attachedSong && (
                <>
                  <span className="hidden sm:inline">·</span>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg mt-1 sm:mt-0 w-full sm:w-auto overflow-hidden">
                    <div className="flex items-center space-x-1 shrink-0">
                      <Music size={14} />
                      <span className="text-xs font-medium max-w-[150px] truncate" title={`${attachedSong.title} - ${attachedSong.artist}`}>
                        {attachedSong.title} - {attachedSong.artist}
                      </span>
                    </div>
                    {attachedSong.audioUrl && (
                      <audio controls className="h-6 w-[200px] sm:w-[150px] outline-none shrink-0" src={attachedSong.audioUrl} preload="none" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{post?.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
          {post?.content_text || ""}
        </p>

        {post?.image_url && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-gray-900">
            {isVideo ? (
              <video
                src={post.image_url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={post.image_url}
                alt="Post media"
                layout="fill"
                objectFit="cover"
                className="w-full h-full object-cover"
                unoptimized
              />
            )}
          </div>
        )}

        <div className="flex items-center text-gray-500 space-x-6">
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full left-0 mb-2 flex items-center space-x-2 bg-white dark:bg-gray-900 border dark:border-gray-800 p-2 rounded-full shadow-xl z-20"
                >
                  {reactions.map((r) => (
                    <motion.button
                      key={r.type}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        onLikeToggle(post.id, r.type);
                        setShowReactions(false);
                      }}
                      className="text-2xl hover:drop-shadow-md transition-all active:scale-90"
                      title={r.label}
                    >
                      {r.icon}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLikeToggle(post.id, 'like')}
              className={`flex items-center space-x-2 ${activeColor} transition-colors font-medium`}
            >
              {activeIcon}
              <span>{totalReactions > 0 ? totalReactions : "Like"}</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center space-x-2 ${dislikeColor} hover:text-blue-500 transition-colors`}
          >
            <ThumbsDown
              size={20}
              fill={post?.user_has_disliked ? "currentColor" : "none"}
              onClick={() => onDislikeToggle(post.id)}
            />
            <span onClick={() => openUserListModal("dislikers")}>
              {post?.dislikes_count ?? 0}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCommentClick(post?.id || "")}
            className="flex items-center space-x-2 hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span>{post?.comments_count ?? 0}</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};
