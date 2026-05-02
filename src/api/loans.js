const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchLoans() {
    const res = await fetch(`${BASE_URL}/loans`, { headers: authHeaders() });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to load loans' }));
        throw new Error(error.message || 'Failed to load loans');
    }
    return res.json();
}

export async function addLoan(data) {
    const res = await fetch(`${BASE_URL}/loans`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to add loan' }));
        throw new Error(error.message || 'Failed to add loan');
    }
    return res.json();
}

export async function updateLoanStatus(id, status) {
    const res = await fetch(`${BASE_URL}/loans/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to update loan status' }));
        throw new Error(error.message || 'Failed to update loan status');
    }
    return res.json();
}

export async function recordRepayment(loanId, amount) {
    const res = await fetch(`${BASE_URL}/loans/${loanId}/repay`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to record repayment' }));
        throw new Error(error.message || 'Failed to record repayment');
    }
    return res.json();
}
