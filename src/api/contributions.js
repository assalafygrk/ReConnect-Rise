const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchContributions(weekId) {
    const url = weekId ? `${BASE_URL}/contributions?week=${weekId}` : `${BASE_URL}/contributions`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load contributions');
    return res.json();
}

export async function recordContribution(memberId, weekId, type, amount) {
    const res = await fetch(`${BASE_URL}/contributions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ memberId, weekId, type, amount }),
    });
    if (!res.ok) throw new Error('Failed to record contribution');
    return res.json();
}

export async function fetchWeeks() {
    const res = await fetch(`${BASE_URL}/contributions/weeks`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load weeks');
    return res.json();
}
