import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Ingests a YouTube URL and an Instagram Reel URL to chunk and index them.
 * @param {string} youtubeUrl 
 * @param {string} instagramUrl 
 * @returns {Promise<{status: string, youtube_chunks: number, instagram_chunks: number}>}
 */
export const ingestVideos = async (youtubeUrl, instagramUrl) => {
  try {
    const response = await api.post('/ingest', {
      youtube_url: youtubeUrl,
      instagram_url: instagramUrl,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to ingest videos.';
    throw new Error(errorMessage);
  }
};

/**
 * Submits a question about the ingested videos and retrieves an AI answer with citations.
 * @param {string} question 
 * @returns {Promise<{answer: string, sources: Array<{video_id: string, chunk_id: number}>, memory_size: number}>}
 */
export const askQuestion = async (question) => {
  try {
    const response = await api.post('/ask', { question });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch an answer.';
    throw new Error(errorMessage);
  }
};

export default api;
