const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchDisbursements() {
    const res = await fetch(`${BASE_URL}/disbursements`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load disbursements');
    return res.json();
}

export async function addDisbursement(data) {
    const res = await fetch(`${BASE_URL}/disbursements`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add disbursement');
    return res.json();
}
