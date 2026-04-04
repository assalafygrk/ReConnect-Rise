const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchRequests() {
    const res = await fetch(`${BASE_URL}/requests`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load requests');
    return res.json();
}

export async function submitRequest(data) {
    const res = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit request');
    return res.json();
}

export async function updateRequestStatus(id, status, note) {
    const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Failed to update request');
    return res.json();
}
