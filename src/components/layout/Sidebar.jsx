import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ListChecks, Users, Wallet, HandCoins,
    FileQuestion, Vote, CalendarDays, Settings, LogOut, Menu, X,
    ChevronRight, MessageSquare, UserCircle, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const navGroups = [
    {
        label: 'Finance',
        items: [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/contributions', icon: ListChecks, label: 'Contributions' },
            { to: '/disbursements', icon: Wallet, label: 'Disbursements' },
            { to: '/loans', icon: HandCoins, label: 'Loans', roles: ['treasurer', 'group_leader', 'official_member'] },
            { to: '/wallet', icon: Wallet, label: 'My Wallet' },
        ],
    },
    {
        label: 'People',
        items: [
            { to: '/members', icon: Users, label: 'Members' },
            { to: '/requests', icon: FileQuestion, label: 'Requests' },
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

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout, hasRole, isPageEnabled, activeRole, switchActiveRole } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Signed out');
        navigate('/login');
    };

    const roles = [
        { id: 'admin', label: 'Super Admin' },
        { id: 'treasurer', label: 'Treasurer' },
        { id: 'group_leader', label: 'Group Leader' },
        { id: 'official_member', label: 'Official Member' },
    ];

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
                    ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}`}
                style={{ background: '#1A1A2E', borderRight: '1px solid rgba(255,255,255,0.06)' }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-white font-semibold text-sm leading-tight truncate"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                Reconnect & Rise
                            </p>
                            <p className="text-white/40 text-xs truncate">Brotherhood Portal</p>
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
                            const id = item.to.replace('/', '') || 'dashboard';
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
                </nav>

                {/* User footer */}
                <div className="border-t border-white/10 p-3 space-y-2">
                    {user?.role === 'admin' && !collapsed && (
                        <div className="px-3 mb-3">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-2">Switch Active Role</p>
                            <select
                                value={activeRole}
                                onChange={(e) => switchActiveRole(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg text-[11px] text-white px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#E8820C]"
                            >
                                {roles.map(r => (
                                    <option key={r.id} value={r.id} className="bg-[#1A1A2E]">{r.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {!collapsed && (
                        <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-white text-sm font-medium truncate">{user?.name || user?.email}</p>
                            <p className="text-[#F5A623] text-[10px] font-bold uppercase tracking-tight">{activeRole?.replace('_', ' ')}</p>
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
        </>
    );
}
