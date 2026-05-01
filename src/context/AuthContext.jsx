import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { addLog } from '../api/auditLog';
import { ROLES, ROLE_CLASSES, ROLE_HIERARCHY } from '../constants/roles';

const AuthContext = createContext(null);

const ADMIN_PASS_KEY = 'rr_admin_panel_pass'; // stores a simple hash
const ADMIN_2FA_KEY = 'rr_admin_2fa_code';    // stores the mock 6-digit TOTP
const ADMIN_SEC_MODE = 'rr_admin_sec_mode';   // 'password' | '2fa'

function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

/** Very simple non-cryptographic hash for the mock environment */
function simpleHash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) + str.charCodeAt(i);
        h |= 0;
    }
    return h.toString(16);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [activeRole, setActiveRole] = useState(null);
    const [enabledPages, setEnabledPages] = useState(() => {
        try {
            const saved = localStorage.getItem('rr_enabled_pages');
            return saved ? JSON.parse(saved) : {
                dashboard: true, contributions: true, members: true,
                disbursements: true, loans: true, requests: true,
                votes: true, meetings: true, chat: true, wallet: true,
                settings: true, profile: true, documentary: true, advice: true,
                login: true, register: true, id_card: true, nexus: true
            };
        } catch {
            return {
                dashboard: true, contributions: true, members: true,
                disbursements: true, loans: true, requests: true,
                votes: true, meetings: true, chat: true, wallet: true,
                settings: true, profile: true, documentary: true, advice: true,
                login: true, register: true, id_card: true, nexus: true
            };
        }
    });
    const [loading, setLoading] = useState(true);

    // --- Admin Panel Gate State ---
    // Session-only — resets on page reload for security
    const [adminPanelUnlocked, setAdminPanelUnlocked] = useState(false);

    const [adminSecurityMode, setAdminSecurityModeState] = useState(() => {
        return localStorage.getItem(ADMIN_SEC_MODE) || 'password';
    });

    // Mock 2FA code (6 digits stored locally; shown to admin when they enable 2FA)
    const [admin2FACode] = useState(() => {
        let code = localStorage.getItem(ADMIN_2FA_KEY);
        if (!code) {
            code = String(Math.floor(100000 + Math.random() * 900000));
            localStorage.setItem(ADMIN_2FA_KEY, code);
        }
        return code;
    });

    useEffect(() => {
        localStorage.setItem('rr_enabled_pages', JSON.stringify(enabledPages));
    }, [enabledPages]);

    useEffect(() => {
        const token = localStorage.getItem('rr_token');
        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.exp * 1000 > Date.now()) {
                setUser(payload);
                setActiveRole(payload.role);
            } else {
                localStorage.removeItem('rr_token');
            }
        }
        setLoading(false);
    }, []);

    // Initialise default admin password hash if not set
    useEffect(() => {
        if (!localStorage.getItem(ADMIN_PASS_KEY)) {
            localStorage.setItem(ADMIN_PASS_KEY, simpleHash('rr2026'));
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('rr_token', token);
        const payload = parseJwt(token);
        setUser(payload);
        setActiveRole(payload.role);
    };

    const logout = () => {
        localStorage.removeItem('rr_token');
        localStorage.removeItem('rr_mock_role');
        setUser(null);
        setActiveRole(null);
        setAdminPanelUnlocked(false);
        addLog('System', 'Session Terminated', 'User logged out', 'security');
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
        toast.success('System record updated');
    };

    const switchActiveRole = (role) => {
        setActiveRole(role);
        localStorage.setItem('rr_mock_role', role);
        toast.success(`Active Role Switched to: ${ROLE_CLASSES[role]?.label || role}`);
    };

    const togglePage = (pageId) => {
        setEnabledPages(prev => {
            const next = { ...prev, [pageId]: !prev[pageId] };
            addLog(
                user?.name || 'Admin',
                next[pageId] ? 'Module Activated' : 'Module Deactivated',
                `Page: ${pageId}`,
                'admin'
            );
            return next;
        });
    };

    const isPageEnabled = (pageId) => {
        // super_admin and admin always have access to all pages
        if (activeRole === ROLES.SUPER_ADMIN || activeRole === ROLES.ADMIN) return true;
        return enabledPages[pageId];
    };

    const hasRole = (...roles) => {
        if (!user) return false;
        const effective = activeRole || user.role;
        // super_admin inherits ALL roles automatically
        if (effective === ROLES.SUPER_ADMIN || effective === ROLES.ADMIN) return true;
        return roles.includes(effective);
    };

    // ---- Admin Panel Gate ----
    /** Attempt to unlock admin panel. Returns true on success. */
    const unlockAdminPanel = useCallback((secret) => {
        const mode = adminSecurityMode;
        let valid = false;

        if (mode === 'password') {
            const stored = localStorage.getItem(ADMIN_PASS_KEY);
            valid = simpleHash(secret) === stored;
        } else if (mode === '2fa') {
            const stored = localStorage.getItem(ADMIN_2FA_KEY);
            valid = secret.replace(/\s/g, '') === stored;
        } else if (mode === 'facial') {
            valid = secret === 'mock-face-scan-success';
        }

        // super_admin never needs a password — always unlocked
        if (user?.role === 'super_admin') {
            setAdminPanelUnlocked(true);
            return true;
        }

        if (valid) {
            setAdminPanelUnlocked(true);
            addLog(user?.name || 'Admin', 'Admin Panel Unlocked', `Mode: ${mode}`, 'security');
            return true;
        }
        return false;
    }, [adminSecurityMode, user]);

    const lockAdminPanel = useCallback(() => {
        setAdminPanelUnlocked(false);
        addLog(user?.name || 'Admin', 'Admin Panel Locked', '', 'security');
    }, [user]);

    /** Set the security mode and persist it */
    const setAdminSecurityMode = useCallback((mode) => {
        localStorage.setItem(ADMIN_SEC_MODE, mode);
        setAdminSecurityModeState(mode);
        addLog(user?.name || 'Admin', 'Security Mode Changed', `Mode: ${mode}`, 'security');
        let modeName = 'Password';
        if (mode === '2fa') modeName = 'Two-Factor Auth';
        if (mode === 'facial') modeName = 'Facial Recognition';
        toast.success(`Admin panel now secured via ${modeName}`);
    }, [user]);

    /** Change the stored admin panel password */
    const setAdminPanelPassword = useCallback((newPass) => {
        localStorage.setItem(ADMIN_PASS_KEY, simpleHash(newPass));
        addLog(user?.name || 'Admin', 'Admin Password Updated', '', 'security');
        toast.success('Admin panel password updated');
    }, [user]);

    /** Returns the mock 2FA code (for display in Settings when enabling 2FA) */
    const getAdmin2FACode = useCallback(() => {
        return localStorage.getItem(ADMIN_2FA_KEY) || admin2FACode;
    }, [admin2FACode]);

    return (
        <AuthContext.Provider value={{
            user,
            activeRole,
            enabledPages,
            loading,
            login,
            logout,
            hasRole,
            switchActiveRole,
            updateUser,
            togglePage,
            isPageEnabled,
            // Admin panel gate
            adminPanelUnlocked,
            adminSecurityMode,
            unlockAdminPanel,
            lockAdminPanel,
            setAdminSecurityMode,
            setAdminPanelPassword,
            getAdmin2FACode,
            ROLES,
            ROLE_CLASSES,
            ROLE_HIERARCHY
        }}>

            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

