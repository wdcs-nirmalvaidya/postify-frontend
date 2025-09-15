import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Post } from "@/types/post.types";
import {
  getFeed,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
  getPosts,
} from "@/utils/Apis/postApi";
import { isAuthenticated } from "@/utils/auth";

export const usePosts = (isLoggedIn: boolean | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchPosts = useCallback(
    async (pageNum: number) => {
      if (isLoggedIn) {
        setLoading(true);
        try {
          const data = await getFeed(pageNum);
          setPosts((prev) =>
            pageNum === 1 ? data.posts : [...prev, ...data.posts],
          );
          setHasNextPage(data.pagination.hasNextPage);
          setPage(pageNum);
        } catch (error) {
          console.error("Failed to fetch feed:", error);
          toast.error("Could not fetch feed.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const data = await getPosts(pageNum);
          setPosts((prev) =>
            pageNum === 1 ? data.posts : [...prev, ...data.posts],
          );
          setHasNextPage(data.pagination.hasNextPage);
          setPage(pageNum);
        } catch (error) {
          console.error("Failed to fetch posts:", error);
          toast.error("Could not fetch posts.");
        } finally {
          setLoading(false);
        }
      }
    },
    [isLoggedIn],
  );

  useEffect(() => {
    if (isLoggedIn !== null) {
      setPosts([]);
      setPage(1);
      setHasNextPage(true);
      fetchPosts(1);
    }
  }, [isLoggedIn, fetchPosts]);

  const loadMorePosts = useCallback(() => {
    if (!loading && hasNextPage) {
      fetchPosts(page + 1);
    }
  }, [loading, hasNextPage, page, fetchPosts]);

  const addPost = useCallback((newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  const toggleLike = useCallback(
    (postId: string) => {
      if (!isAuthenticated())
        return toast.error("Please log in to like posts.");

      const originalPosts = posts;
      const post = originalPosts.find((p) => p.id === postId);
      if (!post) return;

      setPosts((currentPosts) =>
        currentPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes_count: p.user_has_liked
                  ? p.likes_count - 1
                  : p.likes_count + 1,
                dislikes_count: p.user_has_disliked
                  ? p.dislikes_count - 1
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
    },
    [posts],
  );

  const toggleDislike = useCallback(
    (postId: string) => {
      if (!isAuthenticated())
        return toast.error("Please log in to dislike posts.");

      const originalPosts = posts;
      const post = originalPosts.find((p) => p.id === postId);
      if (!post) return;

      setPosts((currentPosts) =>
        currentPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                dislikes_count: p.user_has_disliked
                  ? p.dislikes_count - 1
                  : p.dislikes_count + 1,
                likes_count: p.user_has_liked
                  ? p.likes_count - 1
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
    },
    [posts],
  );

  return {
    posts,
    setPosts,
    loading,
    addPost,
    toggleLike,
    toggleDislike,
    loadMorePosts,
    hasNextPage,
  };
};
