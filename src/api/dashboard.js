const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchDashboard() {
    const res = await fetch(`${BASE_URL}/dashboard`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load dashboard');
    return res.json();
}
