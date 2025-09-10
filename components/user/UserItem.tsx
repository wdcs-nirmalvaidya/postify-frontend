"use client";

import { PublicUser } from "@/types/user.type";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { followUser, unfollowUser } from "@/utils/Apis/userApi";

export const UserItem = ({
  user,
  isFollowing,
}: {
  user: PublicUser;
  isFollowing?: boolean;
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

  const buttonText = isFollowed ? "Following" : "Follow";
  const buttonStyle = isFollowed
    ? "bg-white text-blue-600 border border-blue-600"
    : "bg-blue-100 text-blue-600";

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center space-x-3 group"
      >
        <Image
          src={
            user.avatar_url ||
            "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
          }
          alt={user.name || user.username}
          width={40}
          height={40}
          className="rounded-full"
          unoptimized
        />
        <div>
          <p className="font-bold text-sm text-gray-800 group-hover:underline">
            {user.name || user.username}
          </p>
          <p className="text-xs text-gray-500">@{user.username}</p>
        </div>
      </Link>
      <button
        onClick={handleToggleFollow}
        className={`px-3 py-1 text-xs font-bold rounded-full hover:opacity-80 transition ${buttonStyle}`}
      >
        {buttonText}
      </button>
    </div>
  );
};
