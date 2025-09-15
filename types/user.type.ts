export type UserRole = "admin" | "user";

export interface PublicUser {
  id: string;
  username: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  is_following?: boolean;
  is_private?: boolean;
}

export interface UserProfile extends PublicUser {
  bio: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}
