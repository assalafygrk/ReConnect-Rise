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

// GET all loans + vault balance (role-filtered by server)
export async function fetchLoans() {
    return handleResponse(await fetch(`${BASE_URL}/loans`, { headers: authHeaders() }));
}

// Member requests a loan
export async function addLoan(data) {
    // data: { amount, purpose, duration, disbursementMethod }
    return handleResponse(await fetch(`${BASE_URL}/loans`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    }));
}

// Group Leader action: approve / negotiate / decline
export async function leaderLoanAction(id, { action, negotiationNotes, declineReason }) {
    return handleResponse(await fetch(`${BASE_URL}/loans/${id}/leader`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ action, negotiationNotes, declineReason }),
    }));
}

// Treasurer action: disburse / decline
export async function treasurerLoanAction(id, { action, declineReason }) {
    return handleResponse(await fetch(`${BASE_URL}/loans/${id}/treasurer`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ action, declineReason }),
    }));
}

// Member action: respond to negotiation
export async function memberNegotiateLoan(id, negotiationNotes) {
    return handleResponse(await fetch(`${BASE_URL}/loans/${id}/negotiate`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ negotiationNotes }),
    }));
}

// Record repayment
export async function recordRepayment(loanId, amount, paymentChannel = 'cash') {
    return handleResponse(await fetch(`${BASE_URL}/loans/${loanId}/repay`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount, paymentChannel }),
    }));
}

// Legacy — kept for compat
export async function updateLoanStatus(id, status) {
    return handleResponse(await fetch(`${BASE_URL}/loans/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    }));
}
