"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, ThumbsDown } from "lucide-react";
import { Post } from "@/types/post.types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserListModal } from "@/components/user/UserListModal";
import { PublicUser } from "@/types/user.type";
import {
  getPostDislikes,
  getPostLikers as getPostLikersApi,
} from "@/utils/Apis/postApi";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLikeToggle: (postId: string) => void;
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
  const [userListType, setUserListType] = useState<"likers" | "dislikers">(
    "likers",
  );

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
    setUserListType(type);

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
        className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-6 relative"
      >
        {isAuthor && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <MoreHorizontal size={20} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border z-10">
                <button
                  onClick={() => {
                    onEdit(post);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(post?.id || "");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
            className="rounded-full mr-4"
            unoptimized
          />
          <div
            className="flex flex-col cursor-pointer"
            onClick={() => router.push(`/profile/${author.username}`)}
          >
            <p className="font-bold text-gray-800">
              {author.name || author.username}
            </p>
            <p className="text-sm text-gray-500">
              @{author.username} ·{" "}
              {post?.createdAt
                ? new Date(post.createdAt).toLocaleDateString()
                : "Unknown date"}
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{post?.title}</h3>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
          {post?.content_text || ""}
        </p>

        {post?.image_url && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center space-x-2 ${likeColor} hover:text-red-500 transition-colors`}
          >
            <Heart
              onClick={() => onLikeToggle(post.id)}
              size={20}
              fill={post?.user_has_liked ? "currentColor" : "none"}
            />
            <span onClick={() => openUserListModal("likers")}>
              {post?.likes_count ?? 0}
            </span>
          </motion.button>

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
