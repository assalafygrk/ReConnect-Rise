const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchMeetings() {
    const res = await fetch(`${BASE_URL}/meetings`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load meetings');
    return res.json();
}

export async function addMeeting(data) {
    const res = await fetch(`${BASE_URL}/meetings`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add meeting');
    return res.json();
}

export async function updateMeeting(id, data) {
    const res = await fetch(`${BASE_URL}/meetings/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update meeting');
    return res.json();
}
