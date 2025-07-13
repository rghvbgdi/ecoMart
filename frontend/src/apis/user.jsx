import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

export const getLeaderboard = async () => {
  const res = await API.get('/api/user/leaderboard');
  return res.data;
};
