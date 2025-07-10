import axios from "axios";
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ,
    withCredentials: true // IMPORTANT: This tells axios to send cookies
});

export const login = (email, password) => {
    return API.post('/api/auth/login', { email, password });
};


export const register = (username, email, password) => {
    return API.post('/api/auth/register', { username, email, password });
};


export const logout = () => {
  // Matches the backend route: app.use('/api/auth', authRoutes); router.post('/logout', ...)
  return API.post('/api/auth/logout');
};

export const status = () => {
  return API.get('/api/auth/status').then(res => res.data);
};
