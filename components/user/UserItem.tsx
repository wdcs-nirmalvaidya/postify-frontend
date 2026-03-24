"use client";

import { PublicUser } from "@/types/user.type";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { followUser, unfollowUser } from "@/utils/Apis/userApi";
import { CheckCircle2, Users, Camera } from "lucide-react";

export const UserItem = ({
  user,
  isFollowing,
  variant = "card",
}: {
  user: PublicUser;
  isFollowing?: boolean;
  variant?: "card" | "list";
}) => {
  const [isFollowed, setIsFollowed] = useState(
    isFollowing || user.is_following || false,
  );

  useEffect(() => {
    setIsFollowed(isFollowing || user.is_following || false);
  }, [isFollowing, user.is_following]);

  const handleToggleFollow = async () => {
    const originalFollowState = isFollowed;
    const apiCall = originalFollowState ? unfollowUser : followUser;

    setIsFollowed(!originalFollowState);

    try {
      await apiCall(user.id);
      toast.success(
        originalFollowState
          ? `Unfollowed @${user.username}`
          : `Followed @${user.username}`,
      );
    } catch (error) {
      setIsFollowed(originalFollowState);
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const formatCount = (count: number = 0) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
  };

  if (variant === "list") {
    return (
      <div className="flex items-center justify-between group">
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center space-x-3 group"
        >
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
              alt={user.name || user.username}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate group-hover:underline">
                {user.name || user.username}
              </p>
              {user.is_verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          </div>
        </Link>
        <button
          onClick={handleToggleFollow}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${isFollowed
              ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
        >
          {isFollowed ? "Following" : "Follow"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 group">
      <div className="flex items-start space-x-4 mb-4">
        <Link
          href={`/profile/${user.username}`}
          className="relative flex-shrink-0"
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-gray-100 dark:ring-gray-800 group-hover:ring-blue-500/50 transition-all duration-300 shadow-sm">
            <Image
              src={user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
              alt={user.name || user.username}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-110 transition-transform duration-500"
              unoptimized
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0 pt-1">
          <Link href={`/profile/${user.username}`} className="inline-flex items-center gap-1.5 max-w-full">
            <p className="font-black text-gray-900 dark:text-white truncate hover:text-blue-600 transition-colors">
              {user.name || user.username}
            </p>
            {user.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10 flex-shrink-0" />
            )}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">@{user.username}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        {user.bio ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {user.bio}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic min-h-[2.5rem]">No bio available</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <Camera className="w-3.5 h-3.5 text-pink-500" />
            <span>{formatCount(user.posts_count)} posts</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>{formatCount(user.followers_count)} followers</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleToggleFollow}
        className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 shadow-sm ${isFollowed
            ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
          }`}
      >
        {isFollowed ? "Following" : "Follow"}
      </button>
    </div>
  );
};
