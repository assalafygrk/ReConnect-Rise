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

export async function uploadArchive(data) {
    const res = await fetch(`${BASE_URL}/archives`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to upload archive');
    }
    return await res.json();
}

export async function upvoteArchive(id) {
    const res = await fetch(`${BASE_URL}/archives/${id}/upvote`, {
        method: 'PATCH',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to upvote');
    }
    return await res.json();
}

export async function deleteArchive(id) {
    const res = await fetch(`${BASE_URL}/archives/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete archive');
    }
    return await res.json();
}
