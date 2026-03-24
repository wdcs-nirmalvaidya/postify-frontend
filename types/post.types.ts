export type PostAuthor = {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
};

export type ReactionType = 'like' | 'love' | 'funny' | 'fire' | 'wow';

export type Post = {
  id: string;
  author: PostAuthor;
  title: string;
  content_text: string;
  image_url?: string;
  createdAt: string;
  likes_count: number;
  love_count: number;
  funny_count: number;
  fire_count: number;
  wow_count: number;
  comments_count: number;
  dislikes_count: number;
  user_has_disliked: boolean;
  user_has_liked: boolean;
  user_reaction_type: ReactionType | null;
  category_id: string;
  location?: string;
  tags?: string[];
  song?: string;
};

export type PostFormData = {
  title: string;
  content_text: string;
  image_url?: string;
  category_id?: string;
  location?: string;
  tags?: string[];
  song?: string;
};

export type PostFormInput = {
  title: string;
  content_text: string;
  image_url?: string;
  category_id?: string;
  location?: string;
  tags?: string;
  song?: string;
};
