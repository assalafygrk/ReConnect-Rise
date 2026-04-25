const BASE_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function formatRelative(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (s < 10) return 'Just now';
    if (s < 60) return `${s}s ago`;
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
}

export async function fetchAuditLogs() {
    const res = await fetch(`${BASE_URL}/audit`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load logs');
    const data = await res.json();
    return data.map(l => ({
        ...l,
        id: l._id,
        timeDisplay: formatRelative(l.timestamp)
    }));
}

export async function addLog(user = 'System', action = 'Event', detail = '', category = 'system') {
    const res = await fetch(`${BASE_URL}/audit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action, detail, category }),
    });
    if (!res.ok) return null;
    return await res.json();
}

export async function clearAuditLogs() {
    // Backend clear logs endpoint to be implemented if needed
    console.warn('Clear logs not implemented in backend');
}

export function exportLogsCSV(logs) {
    if (!logs || !logs.length) return null;
    const headers = ['ID', 'User', 'Action', 'Detail', 'Category', 'Timestamp'];
    const rows = logs.map(l => [
        l.id,
        `"${l.user}"`,
        `"${l.action}"`,
        `"${l.detail}"`,
        l.category,
        l.timestamp,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rr_security_ledger_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return csv;
}
