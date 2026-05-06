import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { addLog } from '../api/auditLog';
import { fetchSettings, updateSettings, verifyAdminCredential, updateAdminSecurity } from '../api/settings';
import { ROLES, ROLE_CLASSES, ROLE_HIERARCHY } from '../constants/roles';
import { apiGetProfile } from '../api/auth';

const AuthContext = createContext(null);

const ADMIN_SEC_MODE = 'rr_admin_sec_mode';   // 'password' | '2fa' | 'facial'
const UNLOCK_KEY = 'rr_admin_unlock_ts';
const UNLOCK_DURATION = 10 * 60 * 1000; // 10 minutes

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
    const [userProfile, setUserProfile] = useState(null); // Full profile with facialUpload
    const [activeRole, setActiveRole] = useState(null);
    const [enabledPages, setEnabledPages] = useState(() => {
        const defaultPages = {
            dashboard: true, contributions: true, members: true,
            disbursements: true, loans: true, requests: true,
            votes: true, meetings: true, chat: true, wallet: true,
            settings: true, profile: true, documentary: true, advice: true,
            login: true, register: true, id_card: true, nexus: true
        };
        try {
            const saved = localStorage.getItem('rr_enabled_pages');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure new defaults are merged if older local storage exists
                return { ...defaultPages, ...parsed };
            }
            return defaultPages;
        } catch {
            return defaultPages;
        }
    });
    const [loading, setLoading] = useState(true);

    // --- Admin Panel Gate State ---
    const [adminPanelUnlocked, setAdminPanelUnlocked] = useState(() => {
        const ts = localStorage.getItem(UNLOCK_KEY);
        if (ts && (Date.now() - parseInt(ts)) < UNLOCK_DURATION) {
            return true;
        }
        return false;
    });

    // Session Heartbeat: Auto-lock after 10 mins
    useEffect(() => {
        const interval = setInterval(() => {
            if (adminPanelUnlocked) {
                const ts = localStorage.getItem(UNLOCK_KEY);
                if (!ts || (Date.now() - parseInt(ts)) >= UNLOCK_DURATION) {
                    setAdminPanelUnlocked(false);
                    localStorage.removeItem(UNLOCK_KEY);
                    toast.error('Admin session expired for security');
                }
            }
        }, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [adminPanelUnlocked]);

    const [adminSecurityMode, setAdminSecurityModeState] = useState(() => {
        return localStorage.getItem(ADMIN_SEC_MODE) || 'password';
    });

    useEffect(() => {
        const loadInitialSettings = async () => {
            try {
                const settings = await fetchSettings();
                if (settings) {
                    if (settings.enabledPages) {
                        setEnabledPages(prev => {
                            const merged = { ...prev, ...settings.enabledPages };
                            if (merged.login === undefined) merged.login = true;
                            if (merged.register === undefined) merged.register = true;
                            localStorage.setItem('rr_enabled_pages', JSON.stringify(merged));
                            return merged;
                        });
                    }
                    
                    // Priority: Always default to password if nothing set or if facial is unconfigured
                    let mode = settings.adminSecurityMode || 'password';
                    
                    setAdminSecurityModeState(mode);
                    localStorage.setItem(ADMIN_SEC_MODE, mode);
                }
            } catch (err) {
                console.error('Failed to load system settings:', err);
                setAdminSecurityModeState('password');
            }
        };

        loadInitialSettings();

        const token = localStorage.getItem('rr_token');
        if (token) {
            const payload = parseJwt(token);
            if (payload && payload.exp * 1000 > Date.now()) {
                setUser(payload);
                setActiveRole(payload.role);
                // Fetch full profile (includes facialUpload avatar)
                apiGetProfile().then(profile => setUserProfile(profile)).catch(() => {});
            } else {
                localStorage.removeItem('rr_token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('rr_token', token);
        const payload = parseJwt(token);
        setUser(payload);
        setActiveRole(payload.role);
        // Fetch full profile after login to get facialUpload avatar
        apiGetProfile().then(profile => setUserProfile(profile)).catch(() => {});
    };

    const logout = () => {
        localStorage.removeItem('rr_token');
        localStorage.removeItem('rr_mock_role');
        localStorage.removeItem(UNLOCK_KEY);
        setUser(null);
        setUserProfile(null);
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

    const togglePage = async (pageId) => {
        setEnabledPages(prev => {
            const next = { ...prev, [pageId]: !prev[pageId] };
            
            // Sync to backend asynchronously
            updateSettings({ enabledPages: next }).catch(err => {
                console.error('Failed to sync enabled pages to backend:', err);
                toast.error('Failed to save module state to server');
            });
            
            // Update local storage
            localStorage.setItem('rr_enabled_pages', JSON.stringify(next));

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
        if (pageId === 'login' || pageId === 'register') {
            return enabledPages[pageId];
        }

        if (activeRole === ROLES.SUPER_ADMIN || activeRole === ROLES.ADMIN) return true;
        
        return enabledPages[pageId];
    };

    const hasRole = (...roles) => {
        if (!user) return false;
        const effective = activeRole || user.role;
        if (effective === ROLES.SUPER_ADMIN || effective === ROLES.ADMIN) return true;
        return roles.includes(effective);
    };

    // ---- Admin Panel Gate ----
    /** Attempt to unlock admin panel. Returns success object. */
    const unlockAdminPanel = useCallback(async (secret, overrideMode, password) => {
        try {
            const mode = overrideMode || adminSecurityMode;
            const data = await verifyAdminCredential(mode, secret, password);
            
            if (data.step === 1) {
                // Multi-step authentication in progress
                return data;
            }

            setAdminPanelUnlocked(true);
            localStorage.setItem(UNLOCK_KEY, Date.now().toString());
            addLog(user?.name || 'Admin', 'Admin Panel Unlocked', `Mode: ${mode}`, 'security');
            return data;
        } catch (err) {
            toast.error(err.message || 'Access Denied');
            throw err; // Re-throw to allow component-level error handling
        }
    }, [adminSecurityMode, user]);

    const lockAdminPanel = useCallback(() => {
        setAdminPanelUnlocked(false);
        localStorage.removeItem(UNLOCK_KEY);
        addLog(user?.name || 'Admin', 'Admin Panel Locked', '', 'security');
        toast.success('Admin panel locked');
    }, [user]);

    /** Set the security mode and persist it */
    const setAdminSecurityMode = useCallback(async (mode) => {
        try {
            await updateAdminSecurity(mode);
            localStorage.setItem(ADMIN_SEC_MODE, mode);
            setAdminSecurityModeState(mode);
            addLog(user?.name || 'Admin', 'Security Mode Changed', `Mode: ${mode}`, 'security');
            let modeName = 'Password';
            if (mode === '2fa') modeName = 'Two-Factor Auth';
            if (mode === 'facial') modeName = 'Facial Recognition';
            toast.success(`Admin panel now secured via ${modeName}`);
        } catch (err) {
            toast.error(err.message || 'Failed to update security mode');
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            setUserProfile,
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

