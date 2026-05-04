const BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('rr_token');
    const activeRole = localStorage.getItem('rr_mock_role');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-active-role': activeRole,
    };
};

export async function apiGetNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
}

export async function apiMarkAsRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return await res.json();
}

export async function apiReadAll() {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear all notifications');
    return await res.json();
}

export async function apiSendNotification(notifData) {
    const res = await fetch(`${BASE_URL}/notifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(notifData),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send notification');
    }
    return await res.json();
}
