const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchArchives() {
    const res = await fetch(`${BASE_URL}/archives`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load archives');
    return await res.json();
}

export async function uploadArchive(title, type) {
    const res = await fetch(`${BASE_URL}/archives`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title, type }),
    });
    if (!res.ok) throw new Error('Failed to upload archive');
    return await res.json();
}
