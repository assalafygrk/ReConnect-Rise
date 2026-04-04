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

            let role = 'official_member';
            let name = 'Official Member';

            if (email.includes('admin')) {
                role = 'admin';
                name = 'System Admin';
            } else if (email.includes('treasurer')) {
                role = 'treasurer';
                name = 'Test Treasurer';
            } else if (email.includes('leader')) {
                role = 'group_leader';
                name = 'Test Group Leader';
            } else if (email.includes('welfare')) {
                role = 'welfare';
                name = 'Test Welfare Officer';
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
