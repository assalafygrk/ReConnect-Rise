const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchRequests() {
    const res = await fetch(`${BASE_URL}/requests`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load requests');
    const data = await res.json();
    return data.map(req => ({
        id: req._id,
        submittedBy: req.user?.name || 'Unknown',
        type: req.type,
        amount: req.amount,
        description: req.description,
        status: req.status,
        date: req.createdAt.split('T')[0]
    }));
}

export async function submitRequest(data) {
    const res = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Submission failed');
    return await res.json();
}

export async function updateRequestStatus(id, status, note) {
    const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Update failed');
    return await res.json();
}
