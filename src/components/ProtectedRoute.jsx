import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
    const { user, loading, hasRole } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans" style={{ background: '#1A1A2E' }}>
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 mx-auto mb-4"
                        viewBox="0 0 24 24" fill="none"
                        style={{ color: '#E8820C' }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-white/60 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (roles && !hasRole(...roles)) return <Navigate to="/dashboard" replace />;

    return children;
}
