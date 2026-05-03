const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
    const body = await res.json().catch(() => ({ message: 'Server error' }));
    if (!res.ok) throw new Error(body.message || 'Request failed');
    return body;
}

// GET all requests (role-filtered by server)
export async function fetchRequests() {
    return handleResponse(await fetch(`${BASE_URL}/requests`, { headers: authHeaders() }));
}

// Member submits a welfare request
export async function submitRequest(data) {
    // data: { type, amount, description, paymentMethod }
    return handleResponse(await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    }));
}

// Stage 1 — Welfare Officer: approve | decline
export async function welfareOfficerAction(id, { action, note, declineReason }) {
    return handleResponse(await fetch(`${BASE_URL}/requests/${id}/welfare`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ action, note, declineReason }),
    }));
}

// Stage 2 — Group Leader: approve | decline
export async function leaderWelfareAction(id, { action, note, declineReason }) {
    return handleResponse(await fetch(`${BASE_URL}/requests/${id}/leader`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ action, note, declineReason }),
    }));
}

// Stage 3 — Treasurer: approve (disburse) | decline
export async function treasurerWelfareAction(id, { action, declineReason }) {
    return handleResponse(await fetch(`${BASE_URL}/requests/${id}/treasurer`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ action, declineReason }),
    }));
}

// Legacy
export async function updateRequestStatus(id, status, note) {
    return handleResponse(await fetch(`${BASE_URL}/requests/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status, note }),
    }));
}
