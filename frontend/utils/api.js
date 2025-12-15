export const API_URL = 'https://naveen-incubyte.vercel.app/api';

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
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
    });

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }
        return data;
    } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        // If we get HTML (likely 404 from standard Express/Next handling), it means the route isn't found
        if (res.status === 404) {
            throw new Error("Backend endpoint not found. Please RESTART your backend server to apply recent changes.");
        }
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
};

export const getSweets = async () => {
    const res = await fetch(`${API_URL}/sweets`);
    return res.json();
};

export const createOrder = async (items) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
    });
    return res.json();
};

export const getMyOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/myorders`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
};

export const getAllOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
};

export const updateOrderStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    return res.json();
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
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/sweets/${id}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
    });
    return res.json();
};

export const addSweet = async (sweetData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/sweets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sweetData)
    });
    return res.json();
};

export const deleteSweet = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/sweets/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.json();
};

export const updateSweet = async (id, sweetData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/sweets/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sweetData)
    });
    return res.json();
};

export const getNotifications = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/notifications`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.json();
};

export const markNotificationRead = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.json();
};
