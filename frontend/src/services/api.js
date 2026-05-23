import axios from 'axios';

// Reads backend URL from .env.local  (falls back to localhost for dev)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// AUTO-ATTACH JWT: adds Authorization header to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// AUTO-LOGOUT: if backend returns 401, clear token and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── API CALL FUNCTIONS ────────────────────────────────────

// POST /api/login  →  returns { token, user }
export const loginUser = async (email, password) => {
    const response = await api.post('/api/login', { email, password });
    return response.data;
};

// GET /api/users  →  returns array of users
export const getUsers = async () => {
    const response = await api.get('/api/users');
    return response.data;
};

// POST /api/users  →  creates a new user
export const createUser = async (userData) => {
    const response = await api.post('/api/users', userData);
    return response.data;
};

// DELETE /api/users/:id  →  deletes a user
export const deleteUser = async (userId) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
};

// GET /health  →  backend health check
export const getHealthStatus = async () => {
    const response = await api.get('/health');
    return response.data;
};

export default api;