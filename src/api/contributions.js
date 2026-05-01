const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchContributions(weekId) {
    const url = weekId ? `${BASE_URL}/contributions?week=${weekId}` : `${BASE_URL}/contributions`;
    const res = await fetch(url, { headers: authHeaders() });
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) throw new Error('Failed to load contributions');
    return data;
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
    if (!res.ok) throw new Error('Failed to sync ledger');
    return res.json();
}
