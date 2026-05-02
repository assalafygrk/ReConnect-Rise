const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchContributions(weekId) {
    const url = weekId ? `${BASE_URL}/contributions?week=${weekId}` : `${BASE_URL}/contributions`;
    const res = await fetch(url, { headers: authHeaders() });
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to load contributions' }));
        throw new Error(error.message || 'Failed to load contributions');
    }
    return res.json();
}

export async function fetchUserContributions(userId) {
    const res = await fetch(`${BASE_URL}/contributions?user=${userId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load user contributions');
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

export async function recordBatchContributions({ weekId, contributions }) {
    const res = await fetch(`${BASE_URL}/contributions/batch`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ weekId, contributions }),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to sync ledger' }));
        throw new Error(error.message || 'Failed to sync ledger');
    }
    return res.json();
}
