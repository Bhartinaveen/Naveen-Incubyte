export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Helper to handle responses, specifically 401 Unauthorized
const handleAuthResponse = async (res) => {
    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        // Return a safe object so UI doesn't crash or show generic errors before redirect
        return { message: 'Session expired. Redirecting to login...' };
    }
    return res.json();
};

// Helper for authenticated requests
const authFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    return handleAuthResponse(res);
};

export const login = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return res.json();
};

export const register = async (username, password, email, role = 'user') => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, role })
    });
    return res.json();
};

export const updateProfile = async (profileData) => {
    return authFetch('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
};

export const getSweets = async () => {
    const res = await fetch(`${API_URL}/sweets`);
    return res.json();
};

export const createOrder = async (items) => {
    return authFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ items })
    });
};

export const getMyOrders = async () => {
    return authFetch('/orders/myorders');
};

export const getAllOrders = async () => {
    return authFetch('/orders/admin');
};

export const updateOrderStatus = async (id, status) => {
    return authFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
};

export const getSweetById = async (id) => {
    const res = await fetch(`${API_URL}/sweets/${id}`);
    return res.json();
};

export const getReviews = async (id) => {
    const res = await fetch(`${API_URL}/sweets/${id}/reviews`);
    return res.json();
};

export const addReview = async (id, rating, comment) => {
    return authFetch(`/sweets/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
    });
};

export const addSweet = async (sweetData) => {
    return authFetch('/sweets', {
        method: 'POST',
        body: JSON.stringify(sweetData)
    });
};

export const deleteSweet = async (id) => {
    return authFetch(`/sweets/${id}`, {
        method: 'DELETE'
    });
};

export const updateSweet = async (id, sweetData) => {
    return authFetch(`/sweets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sweetData)
    });
};

export const getNotifications = async () => {
    return authFetch('/notifications');
};

export const markNotificationRead = async (id) => {
    return authFetch(`/notifications/${id}/read`, {
        method: 'PUT'
    });
};

export const getUsers = async () => {
    return authFetch('/users');
};

export const updateUserRole = async (userId, role) => {
    return authFetch(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
    });
};
