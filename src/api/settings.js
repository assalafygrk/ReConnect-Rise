const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── System Settings ─────────────────────────────────────────────────────────
export async function fetchSettings() {
    const res = await fetch(`${BASE_URL}/settings`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
}

export async function updateSettings(data) {
    const res = await fetch(`${BASE_URL}/settings`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
}

// ─── Password Change ─────────────────────────────────────────────────────────
export async function changePassword({ currentPassword, newPassword }) {
    const res = await fetch(`${BASE_URL}/settings/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data;
}

// ─── Notification Preferences ─────────────────────────────────────────────────
export async function updateNotifications(prefs) {
    const res = await fetch(`${BASE_URL}/settings/notifications`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(prefs),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save preferences');
    return data;
}

// ─── Admin Panel Security Mode ────────────────────────────────────────────────
export async function updateAdminSecurity(adminSecurityMode) {
    const res = await fetch(`${BASE_URL}/settings/security`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ adminSecurityMode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update security mode');
    return data;
}

// ─── Transaction PIN ────────────────────────────────────────────────────────
export async function updateTransactionPin(pin) {
    const res = await fetch(`${BASE_URL}/settings/transaction-pin`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update PIN');
    return data;
}

// ─── User Role Management ─────────────────────────────────────────────────────
export async function updateUserRole(userId, role) {
    const res = await fetch(`${BASE_URL}/settings/users/${userId}/role`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update role');
    return data;
}

// ─── User Status Management ───────────────────────────────────────────────────
export async function updateUserStatus(userId, status) {
    const res = await fetch(`${BASE_URL}/settings/users/${userId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data;
}

// ─── Two-Factor Authentication ──────────────────────────────────────────────
export async function setup2FA() {
    const res = await fetch(`${BASE_URL}/settings/2fa/setup`, {
        method: 'POST',
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to setup 2FA');
    return data;
}

export async function verify2FA(token) {
    const res = await fetch(`${BASE_URL}/settings/2fa/verify`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Verification failed');
    return data;
}

export async function disable2FA() {
    const res = await fetch(`${BASE_URL}/settings/2fa/disable`, {
        method: 'POST',
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to disable 2FA');
    return data;
}
