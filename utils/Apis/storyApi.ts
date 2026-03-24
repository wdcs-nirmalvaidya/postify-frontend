import axios from 'axios';
import { GroupedUserStories } from '../../types/story.types';

const API_BASE_URL = 'http://localhost:4000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const createStory = async (formData: FormData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/stories`, formData, {
            headers: {
                ...getAuthHeaders().headers,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchFeedStories = async (): Promise<GroupedUserStories[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stories/feed`, getAuthHeaders());
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const markStoryViewed = async (storyId: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/stories/${storyId}/view`,
            {},
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteStory = async (storyId: string) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/stories/${storyId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error;
    }
};
