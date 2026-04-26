/**
 * Audit Log Utility — localStorage-backed, session-instrumented
 * Max 200 entries (FIFO). Categories: admin | system | member | security
 */

const STORAGE_KEY = 'rr_audit_log';
const MAX_ENTRIES = 200;

function now() {
    return new Date().toISOString();
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

export function getLogs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const logs = raw ? JSON.parse(raw) : [];
        return logs.map(l => ({ ...l, timeDisplay: formatRelative(l.timestamp) }));
    } catch {
        return [];
    }
}

export function addLog(user = 'System', action = 'Event', detail = '', category = 'system') {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const logs = raw ? JSON.parse(raw) : [];
        const entry = {
            id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            user,
            action,
            detail,
            category,   // 'admin' | 'system' | 'member' | 'security'
            timestamp: now(),
        };
        const updated = [entry, ...logs].slice(0, MAX_ENTRIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return entry;
    } catch {
        return null;
    }
}

export function clearLogs() {
    localStorage.removeItem(STORAGE_KEY);
}

export function exportLogsCSV() {
    const logs = getLogs();
    if (!logs.length) return null;
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
