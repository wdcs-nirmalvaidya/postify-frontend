export type PostAuthor = {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
};

export type Post = {
  id: string;
  author: PostAuthor;
  title: string;
  content_text: string;
  image_url?: string;
  createdAt: string;
  likes_count: number;
  comments_count: number;
  dislikes_count: number;
  user_has_disliked: boolean;
  user_has_liked: boolean;
  category_id: string;
};

export type PostFormData = {
  title: string;
  content_text: string;
  image_url?: string;
  category_id?: string;
};
