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

/**
 * Fetch audit logs with pagination & filtering support.
 * @param {Object} opts - { page, limit, category, search, from, to }
 * @returns {{ logs: Array, total: number, page: number, pages: number }}
 */
export async function getLogs(opts = {}) {
    try {
        const params = new URLSearchParams();
        if (opts.page) params.set('page', opts.page);
        if (opts.limit) params.set('limit', opts.limit);
        if (opts.category && opts.category !== 'all') params.set('category', opts.category);
        if (opts.search) params.set('search', opts.search);
        if (opts.from) params.set('from', opts.from);
        if (opts.to) params.set('to', opts.to);

        const res = await fetch(`${BASE_URL}/audit?${params.toString()}`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        const data = await res.json();

        // Handle both old (array) and new (paginated) response formats
        const logs = Array.isArray(data) ? data : (data.logs || []);
        const mapped = logs.map(l => ({
            ...l,
            id: l._id || l.id,
            timeDisplay: formatRelative(l.timestamp || l.createdAt || new Date())
        }));

        if (Array.isArray(data)) {
            return mapped; // Legacy: return plain array for backward compat
        }

        return {
            logs: mapped,
            total: data.total || mapped.length,
            page: data.page || 1,
            pages: data.pages || 1,
        };
    } catch (err) {
        console.error('Audit get logs failed:', err);
        return { logs: [], total: 0, page: 1, pages: 1 };
    }
}

export function addLog(user = 'System', action = 'Event', detail = '', category = 'system') {
    // Run asynchronously to allow instant non-blocking usage in synchronous event handlers.
    fetch(`${BASE_URL}/audit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action, detail, category })
    }).catch(err => console.error('addLog failed:', err));
}

export async function clearLogs() {
    const res = await fetch(`${BASE_URL}/audit`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to purge audit ledger');
    return res.json();
}

export async function exportLogsCSV() {
    try {
        // Fetch ALL logs (large limit) for CSV export
        const params = new URLSearchParams({ limit: '10000' });
        const res = await fetch(`${BASE_URL}/audit?${params.toString()}`, { headers: authHeaders() });
        if (!res.ok) return null;
        const data = await res.json();
        const logs = Array.isArray(data) ? data : (data.logs || []);
        if (!logs.length) return null;
        const headers = ['ID', 'User', 'Action', 'Detail', 'Category', 'Timestamp'];
        const rows = logs.map(l => [
            l._id || l.id,
            `"${(l.user || '').replace(/"/g, '""')}"`,
            `"${(l.action || '').replace(/"/g, '""')}"`,
            `"${(l.detail || '').replace(/"/g, '""')}"`,
            l.category,
            l.timestamp || l.createdAt,
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
    } catch (err) {
        console.error('Failed to export CSV:', err);
        return null;
    }
}
