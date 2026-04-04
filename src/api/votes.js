const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchVotes() {
    const res = await fetch(`${BASE_URL}/votes`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load votes');
    return res.json();
}

export async function castVote(voteId, choice) {
    const res = await fetch(`${BASE_URL}/votes/${voteId}/ballot`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ choice }),
    });
    if (!res.ok) throw new Error('Failed to cast vote');
    return res.json();
}
export async function createVote(voteData) {
    const res = await fetch(`${BASE_URL}/votes`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(voteData),
    });
    if (!res.ok) throw new Error('Failed to create vote');
    return res.json();
}

export async function closeVote(voteId) {
    const res = await fetch(`${BASE_URL}/votes/${voteId}/close`, {
        method: 'PATCH',
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to close vote');
    return res.json();
}
