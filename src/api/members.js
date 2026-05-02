const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchMembers() {
    const res = await fetch(`${BASE_URL}/members`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load members');
    return res.json();
}

export async function fetchMember(id) {
    const res = await fetch(`${BASE_URL}/members/${id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load member');
    return res.json();
}

export async function createMember(data) {
    const res = await fetch(`${BASE_URL}/members`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create member');
    return json;
}

export async function updateMemberStatus(id, status) {
    const res = await fetch(`${BASE_URL}/members/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update member status');
    return json;
}

export async function deleteMember(id) {
    const res = await fetch(`${BASE_URL}/members/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to remove member');
    return json;
}
