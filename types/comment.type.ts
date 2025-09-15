import { PublicUser } from "./user.type"; 

export interface Comment {
  id: string;
  content_text: string;
  created_at: string;
  author: PublicUser;
  parent_id?: string | null;
  replies?: Comment[];
}
