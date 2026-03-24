"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DUMMY_POSTS } from "@/data/dummyPosts";
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

// Story Components
import { StoryCarousel } from "@/components/story/StoryCarousel";
import { StoryViewerModal } from "@/components/story/StoryViewerModal";
import { CreateStoryModal } from "@/components/story/CreateStoryModal";
import { fetchFeedStories, markStoryViewed, deleteStory } from "@/utils/Apis/storyApi";
import { GroupedUserStories } from "@/types/story.types";

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

  // Story States
  const [stories, setStories] = useState<GroupedUserStories[]>([]);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [activeStoryGroupIndex, setActiveStoryGroupIndex] = useState(0);

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

  // Fetch Stories
  const loadStories = async () => {
    try {
      const data = await fetchFeedStories();
      setStories(data);
    } catch (error) {
      console.error("Failed to fetch stories", error);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadStories();
    }
  }, [loggedIn]);

  const handleViewStory = async (storyId: string) => {
    try {
      await markStoryViewed(storyId);
      // Optimistically update the story as viewed locally to remove the colored ring
      setStories((prev) =>
        prev.map(group => {
          let allViewed = true;
          const updatedStories = group.stories.map(s => {
            if (s.id === storyId) s.isViewed = true;
            if (!s.isViewed) allViewed = false;
            return s;
          });
          return { ...group, stories: updatedStories, allViewed };
        }).sort((a, b) => { // keep sorting identical to backend if possible
          if (a.user.id === currentUser?.id) return -1;
          if (b.user.id === currentUser?.id) return 1;
          if (a.allViewed === b.allViewed) return 0;
          return a.allViewed ? 1 : -1;
        })
      );
    } catch (error) {
      console.error("Failed to mark story as viewed", error);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      toast.success("Story deleted");
      loadStories(); // Refresh after delete
    } catch (error) {
      toast.error("Failed to delete story");
    }
  };

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
        postContent={posts.find(p => p.id === viewingCommentsOfPostId)?.content_text}
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

      {loggedIn && (
        <>
          <CreateStoryModal
            isOpen={isCreateStoryOpen}
            onClose={() => setIsCreateStoryOpen(false)}
            onStoryCreated={loadStories}
          />
          <StoryViewerModal
            isOpen={isStoryViewerOpen}
            onClose={() => setIsStoryViewerOpen(false)}
            groupedStories={stories}
            initialGroupIndex={activeStoryGroupIndex}
            currentUserId={currentUser?.id}
            onViewStory={handleViewStory}
            onDeleteStory={handleDeleteStory}
          />
        </>
      )}

      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-black dark:to-black dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <main className="col-span-1 lg:col-span-2">
              {loggedIn === null || (loading && posts.length === 0) ? (
                renderSkeletons()
              ) : (
                <>
                  {loggedIn ? (
                    <>
                      <StoryCarousel
                        groupedStories={stories}
                        currentUser={currentUser}
                        onCreateStoryClick={() => setIsCreateStoryOpen(true)}
                        onStoryClick={(idx) => { setActiveStoryGroupIndex(idx); setIsStoryViewerOpen(true); }}
                      />
                    </>
                  ) : (
                    <WelcomeBanner />
                  )}

                  <div className="mt-6 space-y-6">
                    <AnimatePresence>
                      {/* Real Posts */}
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

                      {/* Dummy Posts appended to the bottom for visual flair, ONLY when scrolling is finished */}
                      {!hasNextPage && DUMMY_POSTS.map((post) => (
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
