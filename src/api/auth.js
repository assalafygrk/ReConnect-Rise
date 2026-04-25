const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiLogin(email, password) {
    const res = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
}

export async function apiRegister(userData) {
    const fullName = [userData.firstName, userData.middleName, userData.lastName]
        .filter(Boolean)
        .join(' ');

    const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: fullName,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            role: userData.role || 'member'
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
    }

    return data;
}

function authHeaders() {
    const token = localStorage.getItem('rr_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchProfile() {
    const res = await fetch(`${BASE_URL}/users/profile`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load profile');
    return await res.json();
}

export async function updateProfile(data) {
    const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return await res.json();
}
