
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
        console.log("Fetching YouTube videos for query:", query);
        const response = await axios.get(YOUTUBE_BASE_URL, { params });
        console.log("YouTube API Response:", response.data);
        return response.data.items;
    } catch (error: any) {
        if (error.response) {
            console.error("YouTube API Error Details:", error.response.data);
            console.error("Status:", error.response.status);
            console.error("Reason:", error.response.data.error?.errors?.[0]?.reason);
            console.error("Message:", error.response.data.error?.message);
        } else {
            console.error("Error fetching YouTube videos:", error);
        }
        return [];
    }
};
