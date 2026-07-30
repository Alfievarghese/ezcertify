import axios from 'axios';

// Use the VITE_API_URL environment variable for the base URL, fallback to empty string (which means it defaults to the same host)
const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
});
