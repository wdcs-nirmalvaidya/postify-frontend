import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const generateComment = async (postContent: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/ai/generate-comment`,
            { postContent },
            getAuthHeaders()
        );
        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export const rewriteComment = async (draftComment: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/ai/rewrite-comment`,
            { draftComment },
            getAuthHeaders()
        );
        return response.data.data;
    } catch (error) {
        throw error;
    }
};
