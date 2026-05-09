const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchPublicStats() {
    const res = await fetch(`${BASE_URL}/public/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
}
