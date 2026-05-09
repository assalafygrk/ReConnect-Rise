const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function generateVirtualAccount() {
    const res = await fetch(`${BASE_URL}/payment/virtual-account`, {
        method: 'POST',
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to generate virtual account');
    return data;
}
export async function resolveAccount(bankCode, accountNumber) {
    const res = await fetch(`${BASE_URL}/payment/resolve-account`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ bankCode, accountNumber }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to resolve account');
    return data;
}
