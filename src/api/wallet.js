const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchWallet() {
    const res = await fetch(`${BASE_URL}/wallet`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load wallet');
    return await res.json();
}

export async function transferFunds(to, amount, note) {
    const res = await fetch(`${BASE_URL}/wallet/transfer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ to, amount, note }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Transfer failed');
    }
    return await res.json();
}

export async function fetchMyContributions() {
    const res = await fetch(`${BASE_URL}/contributions/my`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load contributions');
    return await res.json();
}
