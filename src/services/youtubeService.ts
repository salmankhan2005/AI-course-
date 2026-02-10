
import axios from "axios";

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

export const getVideos = async (query: string, limit: number = 1) => {
    const params = {
        part: "snippet",
        q: query,
        maxResults: limit,
        key: import.meta.env.VITE_YOUTUBE_API_KEY,
        type: "video",
    };

    try {
        const response = await axios.get(YOUTUBE_BASE_URL, { params });
        return response.data.items;
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }
};
