const BASE_URL = import.meta.env.VITE_API_URL;

function generateMockJwt(payload) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.mock-signature`;
}

export async function apiLogin(email, password) {
    // MOCK LOGIN SINCE BACKEND IS NOT YET CONNECTED
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (password !== 'rr2026') { // Using a simple static password for dev
                return reject(new Error('Invalid password. Use "rr2026" for testing.'));
            }

            let role = 'member';
            let name = 'New Member';

            if (email.includes('admin')) {
                role = 'admin';
                name = 'System Admin';
            } else if (email.includes('treasurer')) {
                role = 'treasurer';
                name = 'Test Treasurer';
            } else if (email.includes('leader')) {
                role = 'groupleader';
                name = 'Test Group Leader';
            } else if (email.includes('welfare')) {
                role = 'welfare';
                name = 'Test Welfare Officer';
            } else if (email.includes('advisor')) {
                role = 'special-advisor';
                name = 'Test Advisor';
            } else if (email.includes('organizer')) {
                role = 'meeting-organizer';
                name = 'Test Organizer';
            } else if (email.includes('official')) {
                role = 'official-member';
                name = 'Official Member';
            }

            const token = generateMockJwt({
                id: Date.now(),
                name,
                email,
                role,
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
            });

            resolve({ token, user: { name, email, role } });
        }, 800);
    });
}

export async function apiRegister(userData) {
    // MOCK REGISTER SINCE BACKEND IS NOT YET CONNECTED
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const role = 'member'; // Default role for new users
            const fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ');

            const token = generateMockJwt({
                id: Date.now(),
                name: fullName,
                email: userData.email,
                phone: userData.phone,
                role,
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
            });

            resolve({ token, user: { name: fullName, email: userData.email, phone: userData.phone, role } });
        }, 800);
    });
}
