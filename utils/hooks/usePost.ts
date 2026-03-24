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
          setHasNextPage(false);
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
          setHasNextPage(false);
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
    (postId: string, type: string = 'like') => {
      if (!isAuthenticated())
        return toast.error("Please log in to react to posts.");

      const originalPosts = posts;
      const post = originalPosts.find((p) => p.id === postId);
      if (!post) return;

      const previousType = post.user_reaction_type;
      const isRemoving = previousType === type;

      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p.id !== postId) return p;

          const updatedPost = { ...p };

          // 1. Decruft the old reaction if it existed
          if (previousType) {
            const countKey = `${previousType}s_count` as keyof Post;
            if (typeof updatedPost[countKey] === 'number') {
              (updatedPost[countKey] as number) -= 1;
            }
          }

          // 2. Add the new reaction if we aren't just removing the old one
          if (!isRemoving) {
            const countKey = `${type}s_count` as keyof Post;
            if (typeof updatedPost[countKey] === 'number') {
              (updatedPost[countKey] as number) += 1;
            }
            updatedPost.user_reaction_type = type as any;
            updatedPost.user_has_liked = true;
          } else {
            updatedPost.user_reaction_type = null;
            updatedPost.user_has_liked = false;
          }

          // 3. Handle Dislike interaction (reacting removes dislike)
          if (updatedPost.user_has_disliked) {
            updatedPost.dislikes_count -= 1;
            updatedPost.user_has_disliked = false;
          }

          return updatedPost;
        }),
      );

      const apiPromise = likePost(postId, type);

      apiPromise.catch(() => {
        toast.error("Failed to update reaction.");
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
