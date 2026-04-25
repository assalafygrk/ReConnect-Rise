const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchVisions() {
    const res = await fetch(`${BASE_URL}/visions`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load visions');
    return await res.json();
}

export async function createVision(content, category) {
    const res = await fetch(`${BASE_URL}/visions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content, category }),
    });
    if (!res.ok) throw new Error('Failed to create vision');
    return await res.json();
}

export async function upvoteVision(id) {
    const res = await fetch(`${BASE_URL}/visions/${id}/upvote`, {
        method: 'POST',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to upvote vision');
    return await res.json();
}
