const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchSettings() {
    const res = await fetch(`${BASE_URL}/settings`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
}

export async function updateSettings(data) {
    const res = await fetch(`${BASE_URL}/settings`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
}
