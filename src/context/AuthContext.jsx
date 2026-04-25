import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { addLog } from '../api/auditLog';
import { ROLES, ROLE_CLASSES, ROLE_HIERARCHY } from '../constants/roles';

const AuthContext = createContext(null);

const ADMIN_PASS_KEY = 'rr_admin_panel_pass'; 
const ADMIN_2FA_KEY = 'rr_admin_2fa_code';    
const ADMIN_SEC_MODE = 'rr_admin_sec_mode';   

function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

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
    const [adminPanelUnlocked, setAdminPanelUnlocked] = useState(false);
    const [adminSecurityMode, setAdminSecurityModeState] = useState(() => {
        return localStorage.getItem(ADMIN_SEC_MODE) || 'password';
    });

    useEffect(() => {
        localStorage.setItem('rr_enabled_pages', JSON.stringify(enabledPages));
    }, [enabledPages]);

    useEffect(() => {
        const token = localStorage.getItem('rr_token');
        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.exp * 1000 > Date.now()) {
                // Get full user object from localStorage if it exists (saved on login)
                const storedUser = localStorage.getItem('rr_user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    setActiveRole(parsed.role);
                } else {
                    setUser(payload);
                    setActiveRole(payload.role);
                }
            } else {
                localStorage.removeItem('rr_token');
                localStorage.removeItem('rr_user');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!localStorage.getItem(ADMIN_PASS_KEY)) {
            localStorage.setItem(ADMIN_PASS_KEY, simpleHash('rr2026'));
        }
    }, []);

    const login = (data) => {
        localStorage.setItem('rr_token', data.token);
        localStorage.setItem('rr_user', JSON.stringify(data.user));
        setUser(data.user);
        setActiveRole(data.user.role);
        toast.success(`Welcome back, ${data.user.name}`);
    };

    const logout = () => {
        localStorage.removeItem('rr_token');
        localStorage.removeItem('rr_user');
        localStorage.removeItem('rr_mock_role');
        setUser(null);
        setActiveRole(null);
        setAdminPanelUnlocked(false);
        addLog('System', 'Session Terminated', 'User logged out', 'security');
    };

    const updateUser = (data) => {
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem('rr_user', JSON.stringify(updated));
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
        if (activeRole === ROLES.ADMIN) return true;
        return enabledPages[pageId];
    };

    const hasRole = (...roles) => {
        if (!user) return false;
        const effective = activeRole || user.role;
        if (effective === ROLES.ADMIN) return true;
        return roles.includes(effective);
    };

    const unlockAdminPanel = useCallback((secret) => {
        const mode = adminSecurityMode;
        let valid = false;

        if (mode === 'password') {
            const stored = localStorage.getItem(ADMIN_PASS_KEY);
            valid = simpleHash(secret) === stored;
        } else if (mode === '2fa') {
            const stored = localStorage.getItem(ADMIN_2FA_KEY);
            valid = secret.replace(/\s/g, '') === stored;
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

    const setAdminSecurityMode = useCallback((mode) => {
        localStorage.setItem(ADMIN_SEC_MODE, mode);
        setAdminSecurityModeState(mode);
        addLog(user?.name || 'Admin', 'Security Mode Changed', `Mode: ${mode}`, 'security');
        let modeName = 'Password';
        if (mode === '2fa') modeName = 'Two-Factor Auth';
        toast.success(`Admin panel now secured via ${modeName}`);
    }, [user]);

    const setAdminPanelPassword = useCallback((newPass) => {
        localStorage.setItem(ADMIN_PASS_KEY, simpleHash(newPass));
        addLog(user?.name || 'Admin', 'Admin Password Updated', '', 'security');
        toast.success('Admin panel password updated');
    }, [user]);

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
            adminPanelUnlocked,
            adminSecurityMode,
            unlockAdminPanel,
            lockAdminPanel,
            setAdminSecurityMode,
            setAdminPanelPassword,
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
