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

// GET all disbursements (role-filtered by server)
export async function fetchDisbursements() {
    return handleResponse(await fetch(`${BASE_URL}/disbursements`, { headers: authHeaders() }));
}

// Group Leader creates a disbursement request
export async function addDisbursement(data) {
    // data: { memberId, amount, reason, type, method, bankAccountNumber, bankName, bankAccountName }
    return handleResponse(await fetch(`${BASE_URL}/disbursements`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    }));
}

// Treasurer action: approve | decline
export async function treasurerDisbursementAction(id, { action, declineReason }) {
    return handleResponse(await fetch(`${BASE_URL}/disbursements/${id}/treasurer`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ action, declineReason }),
    }));
}

// Mark as completed (after physical bank/cash transfer)
export async function markDisbursementCompleted(id) {
    return handleResponse(await fetch(`${BASE_URL}/disbursements/${id}/complete`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({}),
    }));
}

// Legacy
export async function updateDisbursementStatus(id, status) {
    return handleResponse(await fetch(`${BASE_URL}/disbursements/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    }));
}
