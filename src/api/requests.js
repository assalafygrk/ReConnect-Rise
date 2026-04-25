const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const MOCK_REQUESTS = [
    { id: 1, submittedBy: 'Seun Adeyemi', type: 'Medical', amount: 5000, description: 'Hospital bill for malaria treatment at Garki Hospital.', status: 'pending', date: '2026-03-20' },
    { id: 2, submittedBy: 'Tunde Lawal', type: 'Emergency', amount: 3000, description: 'Loss of mobile device during transit. Requesting replacement support.', status: 'approved', date: '2026-03-10' },
    { id: 3, submittedBy: 'Musa Haruna', type: 'Education', amount: 8000, description: 'Final year project binding and submission fees.', status: 'declined', date: '2026-03-05' },
];

export async function fetchRequests() {
    try {
        const res = await fetch(`${BASE_URL}/requests`, { headers: authHeaders() });
        if (!res.ok) throw new Error('API failure');
        return await res.json();
    } catch (err) {
        return MOCK_REQUESTS;
    }
}

export async function submitRequest(data) {
    try {
        const res = await fetch(`${BASE_URL}/requests`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Submission failed');
        return await res.json();
    } catch (err) {
        return { ...data, id: Date.now(), status: 'pending', date: new Date().toISOString(), submittedBy: 'Institutional Member' };
    }
}

export async function updateRequestStatus(id, status, note) {
    try {
        const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ status, note }),
        });
        if (!res.ok) throw new Error('Update failed');
        return await res.json();
    } catch (err) {
        return { success: true };
    }
}

