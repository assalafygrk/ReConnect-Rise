import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

function parseJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [activeRole, setActiveRole] = useState(null);
    const [enabledPages, setEnabledPages] = useState(() => {
        const saved = localStorage.getItem('rr_enabled_pages');
        return saved ? JSON.parse(saved) : {
            dashboard: true,
            contributions: true,
            members: true,
            disbursements: true,
            loans: true,
            requests: true,
            votes: true,
            meetings: true,
            chat: true,
            wallet: true,
            settings: true,
            profile: true,
            documentary: true,
            advice: true
        };
    });
    const [loading, setLoading] = useState(true);

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
        } else {
            // TEMPORARY: force a mock user for testing without backend
            const mockUser = { id: 1, name: 'Super Admin', email: 'admin@rrgroup.com', role: 'admin' };
            setUser(mockUser);
            setActiveRole('admin');
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('rr_token', token);
        const payload = parseJwt(token);
        setUser(payload);
        setActiveRole(payload.role);
    };

    const logout = () => {
        localStorage.removeItem('rr_token');
        setUser(null);
        setActiveRole(null);
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
        // In a real app, this would hit an API and maybe refresh the token
        toast.success('System record updated');
    };

    const switchActiveRole = (role) => {
        setActiveRole(role);
    };

    const togglePage = (pageId) => {
        setEnabledPages(prev => ({ ...prev, [pageId]: !prev[pageId] }));
    };

    const isPageEnabled = (pageId) => user?.role === 'admin' || enabledPages[pageId];

    const hasRole = (...roles) => {
        if (!user) return false;
        const effective = activeRole || user.role;
        if (effective === 'admin') return true; // Super Admin mode
        return roles.includes(effective);
    };

    const isCurrentActiveRole = (role) => activeRole === role;

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
            isPageEnabled
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
