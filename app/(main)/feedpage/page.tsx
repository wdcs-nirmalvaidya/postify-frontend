"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "@/components/post/Postcard";
import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";
import { CreatePostModal } from "@/components/post/CreatePostModal";
import { CommentModal } from "@/components/comment/CommentModal";
import { isAuthenticated } from "@/utils/auth";
import { usePosts } from "@/utils/hooks/usePost";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { WelcomeBanner } from "@/components/layout/WelcomeBanner";
import { CreatePostWidget } from "@/components/post/CreatePostWidget";
import { Post } from "@/types/post.types";
import { PublicUser } from "@/types/user.type";
import Sidebar from "@/components/layout/Sidebar";
import { deletePost } from "@/utils/Apis/postApi";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { RightSidebarSkeleton } from "@/components/layout/RightSidebarSkeleton";

const postVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function FeedPage() {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCommentsOfPostId, setViewingCommentsOfPostId] = useState<
    string | null
  >(null);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);

  const {
    posts,
    setPosts,
    loading,
    addPost,
    toggleLike,
    toggleDislike,
    loadMorePosts,
    hasNextPage,
  } = usePosts(loggedIn);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setLoggedIn(authStatus);

    if (authStatus) {
      const userData = localStorage.getItem("user");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
  }, []);

  useEffect(() => {
    if (inView && !loading && hasNextPage) {
      loadMorePosts();
    }
  }, [inView, loading, hasNextPage, loadMorePosts]);

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      try {
        await deletePost(postId);
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
        toast.success("Post deleted successfully.");
      } catch (error: unknown) {
        if (error instanceof Error) toast.error(error.message);
        else toast.error("Failed to delete post.");
      }
    },
    [setPosts],
  );

  const handleOpenCreateModal = () => {
    setPostToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: Post) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPostToEdit(null);
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    );
  };

  const renderSkeletons = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );

  return (
    <>
      <CommentModal
        postId={viewingCommentsOfPostId}
        onClose={() => setViewingCommentsOfPostId(null)}
      />

      {loggedIn && (
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPostCreated={postToEdit ? handlePostUpdated : addPost}
          postToEdit={postToEdit}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block lg:col-span-1">
              <Sidebar />
            </aside>

            <main className="col-span-1 lg:col-span-2">
              {loggedIn === null || (loading && posts.length === 0) ? (
                renderSkeletons()
              ) : (
                <>
                  {loggedIn ? (
                    <CreatePostWidget
                      openFullModal={handleOpenCreateModal}
                      onPostCreated={addPost}
                      avatar_url={currentUser?.avatar_url}
                    />
                  ) : (
                    <WelcomeBanner />
                  )}

                  {posts.length > 0 ? (
                    <div className="mt-6 space-y-6">
                      <AnimatePresence>
                        {posts.map((post) => (
                          <motion.div
                            key={post.id}
                            variants={postVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                          >
                            <PostCard
                              post={post}
                              currentUserId={currentUser?.id}
                              onEdit={handleOpenEditModal}
                              onDelete={handleDeletePost}
                              onLikeToggle={toggleLike}
                              onDislikeToggle={toggleDislike}
                              onCommentClick={setViewingCommentsOfPostId}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {loading && hasNextPage && (
                        <div className="space-y-4">
                          {[...Array(2)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <PostCardSkeleton />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {hasNextPage && !loading && (
                        <div ref={ref} className="h-10" />
                      )}
                    </div>
                  ) : (
                    !loading && (
                      <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Your Feed is Empty
                        </h3>
                        <p className="text-gray-500 mt-2">
                          Follow some users to see their posts here!
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
            </main>

            <div className="hidden lg:block lg:col-span-1">
              {loggedIn === null ? <RightSidebarSkeleton /> : <RightSidebar />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
