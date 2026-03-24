import { PublicUser } from "./user.type";

export interface Story {
    id: string;
    user_id: string;
    media_url: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
    isViewed?: boolean;
}

export interface GroupedUserStories {
    user: PublicUser;
    stories: Story[];
    allViewed: boolean;
}
