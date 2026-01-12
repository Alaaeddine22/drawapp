import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyCode: (data) => api.post('/auth/verify-code', data),
    resendCode: (data) => api.post('/auth/resend-code', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.patch('/auth/me', data)
};

// Notebooks
export const notebooksAPI = {
    getAll: () => api.get('/notebooks'),
    create: (data) => api.post('/notebooks', data),
    getOne: (id) => api.get(`/notebooks/${id}`),
    update: (id, data) => api.put(`/notebooks/${id}`, data),
    delete: (id) => api.delete(`/notebooks/${id}`),
    share: (id, password) => api.post(`/notebooks/${id}/share`, { password }),
    checkJoin: (shareLink) => api.get(`/notebooks/join/${shareLink}/check`),
    join: (shareLink, password) => api.post(`/notebooks/join/${shareLink}`, { password }),
    invite: (id, data) => api.post(`/notebooks/${id}/invite`, data),
    // Member management
    getMembers: (id) => api.get(`/notebooks/${id}/members`),
    removeMember: (id, memberId) => api.delete(`/notebooks/${id}/members/${memberId}`),
    timeoutMember: (id, memberId, duration) => api.post(`/notebooks/${id}/members/${memberId}/timeout`, { duration })
};

// Content
export const contentAPI = {
    get: (notebookId) => api.get(`/content/${notebookId}`),
    update: (notebookId, data) => api.put(`/content/${notebookId}`, data),
    getHistory: (notebookId) => api.get(`/content/${notebookId}/history`),
    restore: (notebookId, index) => api.post(`/content/${notebookId}/restore/${index}`),
    // Todos
    addTodo: (notebookId, text) => api.post(`/content/${notebookId}/todos`, { text }),
    toggleTodo: (notebookId, todoId) => api.patch(`/content/${notebookId}/todos/${todoId}`),
    deleteTodo: (notebookId, todoId) => api.delete(`/content/${notebookId}/todos/${todoId}`),
    // Comments
    addComment: (notebookId, text) => api.post(`/content/${notebookId}/comments`, { text }),
    // Activity
    getActivity: (notebookId) => api.get(`/content/${notebookId}/activity`)
};

// Search
export const searchAPI = {
    notebooks: (query) => api.get(`/notebooks?search=${encodeURIComponent(query)}`)
};

export default api;
