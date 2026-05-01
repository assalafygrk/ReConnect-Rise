import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ListChecks, Users, Wallet, HandCoins,
    HeartHandshake, FileQuestion, Vote, CalendarDays, Settings, LogOut, X,
    ChevronRight, MessageSquare, UserCircle, FileText,
    Shield, Lock, LockOpen, ChevronDown, ChevronUp,
    ToggleLeft, ToggleRight, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBrand } from '../../context/BrandContext';
import { toast } from 'react-hot-toast';
import AdminAuthGate from '../admin/AdminAuthGate';

const navGroups = [
    {
        label: 'Finance',
        items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/contributions', icon: ListChecks, label: 'Contributions' },
            { to: '/disbursements', icon: Wallet, label: 'Disbursements' },
            { to: '/loans', icon: HandCoins, label: 'Loans' },
            { to: '/wallet', icon: Wallet, label: 'My Wallet' },
        ],
    },
    {
        label: 'People',
        items: [
            { to: '/members', icon: Users, label: 'Members' },
            { id: 'requests', to: '/welfare', icon: HeartHandshake, label: 'Welfare' },
        ],
    },

    {
        label: 'Group',
        items: [
            { to: '/votes', icon: Vote, label: 'Votes' },
            { to: '/meetings', icon: CalendarDays, label: 'Meetings' },
            { to: '/chat', icon: MessageSquare, label: 'Brotherhood Chat' },
            { to: '/documentary', icon: FileText, label: 'Documentary' },
            { to: '/advice', icon: MessageSquare, label: 'Advice Room' },
        ],
    },

    {
        label: 'Account',
        items: [
            { to: '/profile', icon: UserCircle, label: 'My Profile' },
            { to: '/settings', icon: Settings, label: 'Settings' },
        ],
    },
];


const modulePages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'contributions', label: 'Contributions' },
    { id: 'disbursements', label: 'Disbursements' },
    { id: 'loans', label: 'Loans' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'members', label: 'Members' },
    { id: 'requests', label: 'Welfare' },

    { id: 'votes', label: 'Votes' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'chat', label: 'Chat' },
    { id: 'documentary', label: 'Documentary' },
    { id: 'advice', label: 'Advice Room' },
    { id: 'login', label: 'Login Page' },
    { id: 'register', label: 'Registration' },
    { id: 'id_card', label: 'ID Card Access' },
];

export default function Sidebar({ collapsed, onToggle }) {
    const {
        user, logout, hasRole, isPageEnabled,
        activeRole, enabledPages, togglePage,
        adminPanelUnlocked, lockAdminPanel,
    } = useAuth();
    const { brand } = useBrand();
    const navigate = useNavigate();

    const [showGate, setShowGate] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Signed out');
        navigate('/login');
    };

    const handleAdminSectionClick = () => {
        if (collapsed) return; // Don't handle when sidebar is icon-only
        if (!adminPanelUnlocked) {
            setShowGate(true);
        } else {
            navigate('/nexus');
        }
    };

    const handleGateSuccess = () => {
        setShowGate(false);
        toast.success('Admin Control Panel unlocked');
        navigate('/nexus');
    };

    const enabledCount = Object.values(enabledPages).filter(Boolean).length;

    return (
        <>
            {/* Mobile overlay */}
            {!collapsed && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={onToggle}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300
                    ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
                    bg-[#1A1A2E] dark:bg-[#1A2235]/60 dark:backdrop-blur-3xl border-r border-white/5 dark:border-white/10`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-[#252545]">
                        <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-white font-semibold text-sm leading-tight truncate"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                {brand.orgName}
                            </p>
                            <p className="text-white/40 text-xs truncate">{brand.orgSlogan}</p>
                        </div>
                    )}
                    <button
                        onClick={onToggle}
                        className="ml-auto text-white/40 hover:text-white transition-colors"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <X size={18} />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
                    {navGroups.map((group) => {
                        const visibleItems = group.items.filter((item) => {
                            const id = item.id || item.to.replace('/', '') || 'dashboard';
                            return (!item.roles || hasRole(...item.roles)) && isPageEnabled(id);
                        });

                        if (!visibleItems.length) return null;
                        return (
                            <div key={group.label}>
                                {!collapsed && (
                                    <p className="text-white/30 text-[10px] uppercase tracking-widest px-3 mb-2 font-medium">
                                        {group.label}
                                    </p>
                                )}
                                <ul className="space-y-0.5">
                                    {visibleItems.map(({ to, icon: Icon, label }) => (
                                        <li key={to}>
                                            <NavLink
                                                to={to}
                                                title={collapsed ? label : undefined}
                                                onClick={() => { if (window.innerWidth < 1024) onToggle?.(); }}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                                                    ${isActive ? 'text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'}`
                                                }
                                                style={({ isActive }) =>
                                                    isActive ? { background: 'rgba(232,130,12,0.2)', color: '#F5A623' } : {}
                                                }
                                            >
                                                <Icon size={18} className="flex-shrink-0" />
                                                {!collapsed && <span className="text-sm truncate">{label}</span>}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}

                    {/* Admin Control Section */}
                    {hasRole('admin') && !collapsed && (
                        <div className="pt-2">
                            {/* Section header / lock button */}
                            <button
                                onClick={handleAdminSectionClick}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                                    ${adminPanelUnlocked
                                        ? 'bg-[#E8820C]/10 border border-[#E8820C]/20 hover:bg-[#E8820C]/15'
                                        : 'bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
                                        ${adminPanelUnlocked ? 'bg-[#E8820C]/20 text-[#E8820C]' : 'bg-white/5 text-white/30'}`}>
                                        {adminPanelUnlocked ? <LockOpen size={14} /> : <Lock size={14} />}
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${adminPanelUnlocked ? 'text-[#F5A623]' : 'text-white/30'}`}>
                                            Admin Control
                                        </p>
                                        {!adminPanelUnlocked && (
                                            <p className="text-[9px] text-white/20 font-medium">Click to authenticate</p>
                                        )}
                                    </div>
                                </div>
                                {adminPanelUnlocked
                                    ? <ChevronRight size={14} className="text-[#E8820C]/60" />
                                    : <Shield size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
                                }
                            </button>
                        </div>
                    )}

                    {/* Admin lock icon (collapsed mode) */}
                    {hasRole('admin') && collapsed && (
                        <button
                            onClick={() => setShowGate(true)}
                            title="Admin Control"
                            className={`flex items-center justify-center w-full py-2.5 rounded-xl transition-all
                                ${adminPanelUnlocked ? 'text-[#E8820C] bg-[#E8820C]/10' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
                        >
                            {adminPanelUnlocked ? <LockOpen size={18} /> : <Lock size={18} />}
                        </button>
                    )}
                </nav>

                {/* User footer */}
                <div className="border-t border-white/10 p-3 space-y-2">
                    {!collapsed && (
                        <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                            {/* Supreme Admin glow */}
                            {user?.role === 'super_admin' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-[#E8820C]/10 via-[#F5A623]/10 to-[#E8820C]/10 animate-pulse pointer-events-none rounded-xl" />
                            )}
                            <p className="text-white text-sm font-medium truncate relative z-10">{user?.name || user?.email}</p>
                            {user?.role === 'super_admin' ? (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
                                    <p className="text-[#F5A623] text-[10px] font-black uppercase tracking-widest">Supreme Admin</p>
                                </div>
                            ) : (
                                <p className="text-[#F5A623] text-[10px] font-bold uppercase tracking-tight">{activeRole?.replace(/_/g, ' ')}</p>
                            )}
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium"
                    >
                        <LogOut size={18} />
                        {!collapsed && <span className="text-sm">Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Auth Gate Modal */}
            {showGate && (
                <AdminAuthGate
                    onClose={() => setShowGate(false)}
                    onSuccess={handleGateSuccess}
                />
            )}
        </>
    );
}
