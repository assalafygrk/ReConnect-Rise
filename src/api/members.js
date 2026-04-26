const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchMembers() {
    const res = await fetch(`${BASE_URL}/members`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load members');
    return res.json();
}

export async function fetchMember(id) {
    const res = await fetch(`${BASE_URL}/members/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load member');
    return res.json();
}
