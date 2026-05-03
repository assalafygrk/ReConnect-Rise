const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Get Wallet ───────────────────────────────────────────────────────────────
export async function fetchWallet() {
    const res = await fetch(`${BASE_URL}/wallet`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load wallet');
    return res.json(); // { balance, recentTransactions, totalGiftsSent, totalGiftsReceived }
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

// ─── Deposit Funds ────────────────────────────────────────────────────────────
export async function depositFunds(amount, note) {
    const res = await fetch(`${BASE_URL}/wallet/deposit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Deposit failed');
    return data;
}

// ─── Withdraw Funds ───────────────────────────────────────────────────────────
export async function withdrawFunds(amount, note) {
    const res = await fetch(`${BASE_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Withdrawal failed');
    return data;
}

// ─── Pay Weekly Contribution ──────────────────────────────────────────────────
export async function payWeeklyContribution() {
    const res = await fetch(`${BASE_URL}/wallet/contribute/weekly`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Contribution failed');
    return data;
}

// ─── Pay General Contribution ─────────────────────────────────────────────────
export async function payGeneralContribution(amount, note) {
    const res = await fetch(`${BASE_URL}/wallet/contribute/general`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Contribution failed');
    return data;
}
