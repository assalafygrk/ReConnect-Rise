const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Get Wallet ───────────────────────────────────────────────────────────────
export async function fetchWallet() {
    const res = await fetch(`${BASE_URL}/wallet`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load wallet');
    return res.json(); // { balance, recentTransactions }
}

// ─── Transfer Funds ───────────────────────────────────────────────────────────
export async function transferFunds(to, amount, note) {
    const res = await fetch(`${BASE_URL}/wallet/transfer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ to, amount, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Transfer failed');
    return data; // { success, message, newBalance }
}
