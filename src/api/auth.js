const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Login ───────────────────────────────────────────────────────────────────
export async function apiLogin(email, password) {
    const res = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data; // { token, user }
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function apiRegister(userData) {
    // Compose full name from parts
    const name = [userData.firstName, userData.middleName, userData.lastName]
        .filter(Boolean)
        .join(' ');

    const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            firstName: userData.firstName,
            middleName: userData.middleName,
            lastName: userData.lastName,
            dateOfBirth: userData.dateOfBirth,
            residentialAddress: userData.residentialAddress,
            occupation: userData.occupation,
            facialUpload: userData.facialUpload,
        }),
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data; // { token, user }
}

// ─── Get Profile ──────────────────────────────────────────────────────────────
export async function apiGetProfile() {
    const token = localStorage.getItem('rr_token');
    const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
}

// ─── Update Profile ───────────────────────────────────────────────────────────
export async function apiUpdateProfile(profileData) {
    const token = localStorage.getItem('rr_token');
    const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
}

// ─── Update Password ──────────────────────────────────────────────────────────
export async function apiUpdatePassword(password) {
    const token = localStorage.getItem('rr_token');
    const res = await fetch(`${BASE_URL}/users/profile/password`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
    });
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) throw new Error(data.message || 'Failed to update password');
    return data;
}
