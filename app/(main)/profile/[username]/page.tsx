"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PostCard } from "@/components/post/Postcard";
import { Post } from "@/types/post.types";
import { UserProfile, PublicUser } from "@/types/user.type";
import {
  getUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "@/utils/Apis/userApi";
import {
  deletePost,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
} from "@/utils/Apis/postApi";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { EditProfileModal } from "@/components/post/EditProfileModal";
import { CommentModal } from "@/components/comment/CommentModal";
import { UserListModal } from "@/components/user/UserListModal";
import { ProfilePageSkeleton } from "./ProfilePageSkeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

type FollowListType = "followers" | "following";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);

  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [viewingCommentsOfPostId, setViewingCommentsOfPostId] = useState<
    string | null
  >(null);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followListType, setFollowListType] =
    useState<FollowListType>("followers");
  const [followListUsers, setFollowListUsers] = useState<PublicUser[]>([]);
  const [isFollowListLoading, setIsFollowListLoading] = useState(false);

  const fetchUserPosts = async () => {
    if (!username) return;
    try {
      const postsData = await getUserPosts(username);
      setPosts(postsData);
    } catch {
      toast.error("Could not refresh user's posts.");
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    if (!username) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, postsData] = await Promise.all([
          getUserProfile(username),
          getUserPosts(username),
        ]);
        setProfile(profileData);
        setPosts(postsData);
      } catch (error: unknown) {
        if (error instanceof Error) toast.error(error.message);
        else toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(
      posts.map((p) =>
        p.id === updatedPost.id ? { ...p, ...updatedPost } : p,
      ),
    );
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Post deleted successfully.");
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Failed to delete post.");
    }
  };

  const handleToggleFollow = async () => {
    if (!profile) return;
    const isCurrentlyFollowing = profile.is_following;
    const apiCall = isCurrentlyFollowing ? unfollowUser : followUser;
    const originalProfile = { ...profile };

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            is_following: !isCurrentlyFollowing,
            followers_count: isCurrentlyFollowing
              ? prev.followers_count - 1
              : prev.followers_count + 1,
          }
        : null,
    );

    try {
      await apiCall(profile.id);
      if (!isCurrentlyFollowing && profile.is_private) await fetchUserPosts();
      toast.success(
        isCurrentlyFollowing
          ? `Unfollowed @${profile.username}`
          : `Followed @${profile.username}`,
      );
    } catch (err: unknown) {
      setProfile(originalProfile);
      if (err instanceof Error) toast.error(err.message);
      else toast.error("An error occurred while updating follow status.");
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : null));
  };

  const handleLikeToggle = (postId: string) => {
    const originalPosts = [...posts];
    const post = originalPosts.find((p) => p.id === postId);
    if (!post) return;

    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes_count: p.user_has_liked
                ? parseInt(p.likes_count.toString()) - 1
                : parseInt(p.likes_count.toString()) + 1,
              dislikes_count: p.user_has_disliked
                ? parseInt(p.dislikes_count.toString()) - 1
                : p.dislikes_count,
              user_has_liked: !p.user_has_liked,
              user_has_disliked: false,
            }
          : p,
      ),
    );

    const apiCall = post.user_has_liked ? unlikePost : likePost;
    apiCall(postId).catch(() => {
      toast.error("Failed to update like.");
      setPosts(originalPosts);
    });
  };

  const handleDislikeToggle = (postId: string) => {
    const originalPosts = [...posts];
    const post = originalPosts.find((p) => p.id === postId);
    if (!post) return;

    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              dislikes_count: p.user_has_disliked
                ? parseInt(p.dislikes_count.toString()) - 1
                : parseInt(p.dislikes_count.toString()) + 1,
              likes_count: p.user_has_liked
                ? parseInt(p.likes_count.toString()) - 1
                : p.likes_count,
              user_has_disliked: !p.user_has_disliked,
              user_has_liked: false,
            }
          : p,
      ),
    );

    const apiCall = post.user_has_disliked ? undislikePost : dislikePost;
    apiCall(postId).catch(() => {
      toast.error("Failed to update dislike.");
      setPosts(originalPosts);
    });
  };

  const openFollowModal = async (type: FollowListType) => {
    if (!profile) return;
    setIsFollowModalOpen(true);
    setIsFollowListLoading(true);
    setFollowListType(type);
    try {
      const apiCall = type === "followers" ? getFollowers : getFollowing;
      const users = await apiCall(profile.username);
      if (isOwnProfile && type === "following") {
        const correctedUsers = users.map((u: PublicUser) => ({
          ...u,
          is_following: true,
        }));
        setFollowListUsers(correctedUsers);
      } else {
        setFollowListUsers(users);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch follow list.");
      }
    } finally {
      setIsFollowListLoading(false);
    }
  };

  if (loading) return <ProfilePageSkeleton />;
  if (!profile) return <div className="text-center py-20">User not found.</div>;

  const isOwnProfile = currentUser?.username === profile.username;
  const canViewPosts =
    !profile.is_private || profile.is_following || isOwnProfile;

  return (
    <>
      <CreatePostModal
        isOpen={!!postToEdit}
        onClose={() => setPostToEdit(null)}
        onPostCreated={handlePostUpdated}
        postToEdit={postToEdit}
      />
      {profile && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      <CommentModal
        postId={viewingCommentsOfPostId}
        onClose={() => setViewingCommentsOfPostId(null)}
      />
      <UserListModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        title={followListType}
        users={followListUsers}
        loading={isFollowListLoading}
      />

      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
            <div className="flex items-center">
              <Image
                src={
                  profile.avatar_url ||
                  "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                }
                alt={profile.name || ""}
                width={128}
                height={128}
                className="rounded-full mr-8 border-4 border-blue-500"
                unoptimized
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.name || profile.username}
                    </h1>
                    <p className="text-md text-gray-500">@{profile.username}</p>
                  </div>
                  {isOwnProfile ? (
                    <button
                      onClick={() => setIsEditProfileModalOpen(true)}
                      className="px-4 py-2 text-sm font-semibold rounded-full border hover:bg-gray-100 transition"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleToggleFollow}
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition ${profile.is_following ? "bg-white text-blue-600 border border-blue-600" : "bg-blue-600 text-white"}`}
                    >
                      {profile.is_following ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mt-4">
                  {profile.bio || "No bio available."}
                </p>
                <div className="flex space-x-6 mt-4 text-gray-600">
                  <span>
                    <span className="font-bold text-gray-800">
                      {posts.length}
                    </span>{" "}
                    Posts
                  </span>
                  <button
                    onClick={() => openFollowModal("followers")}
                    className="hover:underline"
                  >
                    <span className="font-bold text-gray-800">
                      {profile.followers_count}
                    </span>{" "}
                    Followers
                  </button>
                  <button
                    onClick={() => openFollowModal("following")}
                    className="hover:underline"
                  >
                    <span className="font-bold text-gray-800">
                      {profile.following_count}
                    </span>{" "}
                    Following
                  </button>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Posts</h2>
          {canViewPosts ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id}
                    onEdit={setPostToEdit}
                    onDelete={handleDeletePost}
                    onLikeToggle={handleLikeToggle}
                    onDislikeToggle={handleDislikeToggle}
                    onCommentClick={setViewingCommentsOfPostId}
                  />
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500">
                    This user hasn&apos;t posted anything yet.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">
                🔒 This Account is Private
              </h3>
              <p className="text-gray-500 mt-2">
                Follow this account to see their posts.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
