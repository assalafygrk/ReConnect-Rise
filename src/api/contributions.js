const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
    const body = await res.json().catch(() => ({ message: 'Server error' }));
    if (!res.ok) throw new Error(body.message || 'Request failed');
    return body;
}

// GET all contributions (role-filtered by server)
export async function fetchContributions(weekId) {
    const url = weekId ? `${BASE_URL}/contributions?week=${weekId}` : `${BASE_URL}/contributions`;
    return handleResponse(await fetch(url, { headers: authHeaders() }));
}

// GET weekly status for all members + deadline info
export async function fetchWeeklyStatus() {
    return handleResponse(await fetch(`${BASE_URL}/contributions/weekly-status`, { headers: authHeaders() }));
}

// GET distinct week IDs
export async function fetchWeeks() {
    return handleResponse(await fetch(`${BASE_URL}/contributions/weeks`, { headers: authHeaders() }));
}

// Treasurer marks a member as paid manually
export async function markMemberPaid({ memberId, weekId, amount, paymentChannel, note }) {
    return handleResponse(await fetch(`${BASE_URL}/contributions/mark-paid`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ memberId, weekId, amount, paymentChannel, note }),
    }));
}

// Member pays their own weekly contribution from their wallet
export async function payViaWallet(pin) {
    return handleResponse(await fetch(`${BASE_URL}/contributions/pay-via-wallet`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pin }),
    }));
}

// Record a general/pool contribution (cash or wallet)
export async function recordGeneralContribution({ memberId, amount, paymentChannel, note, reference }) {
    return handleResponse(await fetch(`${BASE_URL}/contributions/general`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ memberId, amount, paymentChannel, note, reference }),
    }));
}

// Legacy batch sync (treasurer)
export async function recordBatchContributions({ weekId, contributions }) {
    return handleResponse(await fetch(`${BASE_URL}/contributions/batch`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ weekId, contributions }),
    }));
}

// Kept for legacy compatibility
export async function fetchUserContributions(userId) {
    return handleResponse(await fetch(`${BASE_URL}/contributions?user=${userId}`, { headers: authHeaders() }));
}

export async function recordContribution(memberId, weekId, type, amount) {
    return handleResponse(await fetch(`${BASE_URL}/contributions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ memberId, weekId, type, amount }),
    }));
}
