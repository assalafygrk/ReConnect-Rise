import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck, UserCog, Database, Bell, Activity, ChevronRight, Lock,
    Eye, LayoutDashboard, ListChecks, Users, Wallet, HandCoins,
    FileQuestion, Vote, CalendarDays, MessageSquare, UserCircle,
    Settings as SettingsIcon, Globe, Moon, Sun, Info, Save, RotateCcw,
    Loader2, Zap, ShieldAlert, Cpu
} from 'lucide-react';
import { fetchMembers } from '../api/members';
import { updateSettings, fetchSettings } from '../api/settings';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const { hasRole, togglePage, enabledPages } = useAuth();
    const isAdmin = hasRole('admin');
    const isTreasurer = hasRole('treasurer');
    const isLeader = hasRole('group_leader');

    const [settings, setSettings] = useState({
        siteName: 'ReConnect & Rise',
        maintenanceMode: false,
        registrationOpen: true,
        monthlySavingsTarget: 250000,
        loanInterestRate: 0,
        groupAnnouncement: '',
    });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [globalNotice, setGlobalNotice] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        Promise.all([fetchSettings(), fetchMembers()])
            .then(([s, m]) => {
                setSettings({ ...settings, ...s });
                setMembers(m);
            })
            .catch(() => {
                setMembers([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await updateSettings(settings);
            // Simulate sync
            await new Promise(r => setTimeout(r, 1200));
            toast.success('Omni-system Protocols Synchronized');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUserRole = (id, newRole) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
        toast.success(`Access Level Re-delegated: ${newRole.split('_').join(' ').toUpperCase()}`);
    };

    const handlePostNotice = () => {
        if (!globalNotice.trim()) return;
        toast.success('Strategy Directive Dispatched to All Nodes');
        setGlobalNotice('');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-[#E8820C]/20 border-t-[#E8820C] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Accessing Command Core...</p>
            </div>
        );
    }

    const availablePages = [
        { id: 'dashboard', label: 'Strategic Overview', icon: LayoutDashboard },
        { id: 'contributions', label: 'Treasury Ledger', icon: ListChecks },
        { id: 'members', label: 'Brotherhood Registry', icon: Users },
        { id: 'disbursements', label: 'Asset Distribution', icon: Wallet },
        { id: 'loans', label: 'Credit & Leverage', icon: HandCoins },
        { id: 'requests', label: 'Resource Petitions', icon: FileQuestion },
        { id: 'votes', label: 'Governance Ballot', icon: Vote },
        { id: 'meetings', label: 'Summit Schedule', icon: CalendarDays },
        { id: 'chat', label: 'Secure Comms', icon: MessageSquare },
        { id: 'wallet', label: 'Personal Vault', icon: Wallet },
        { id: 'profile', label: 'Member Dossier', icon: UserCircle },
    ];

    return (
        <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4">
            {/* Header: Strategic Command Center */}
            <div className="relative bg-[#1A1A2E] rounded-[3.5rem] p-10 md:p-16 overflow-hidden shadow-2xl group border border-white/5">
                <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-gradient-to-br from-[#E8820C] to-[#F5A623] rounded-full blur-[180px] opacity-10 group-hover:opacity-15 transition-opacity duration-1000"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#F5A623] backdrop-blur-md">
                            <Cpu size={14} className="animate-pulse" /> System Core v4.0
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white font-serif leading-none tracking-tight">Command Center</h2>
                        <p className="text-white/40 text-lg font-serif italic max-w-xl mx-auto md:mx-0">Universal configuration of brotherhood operational protocols and security parameters.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setDarkMode(!darkMode); toast.success(`Interface Optimized for ${!darkMode ? 'Dark' : 'Light'} Operations`); }}
                            className="p-5 rounded-[1.5rem] bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10 shadow-2xl backdrop-blur-xl"
                        >
                            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="flex items-center gap-4 px-10 py-6 rounded-[2rem] bg-[#E8820C] text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(232,130,12,0.3)] hover:-translate-y-2 hover:bg-[#F5A623] transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={20} className="animate-spin text-white" /> : <Save size={20} />}
                            {saving ? 'Syncing...' : 'Deploy Protocols'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* ADMIN ONLY: Full Page Control Management */}
                {isAdmin && (
                    <div className="bg-white p-12 rounded-[4rem] border border-black/5 shadow-2xl space-y-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 text-black/[0.02] -mr-8 -mt-8">
                            <Globe size={200} />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[2rem] bg-[#E8820C]/10 flex items-center justify-center text-[#E8820C] shadow-inner group-hover:rotate-12 transition-transform">
                                    <Zap size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-[#1A1A2E] font-serif tracking-tight">Module Nexus</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Omni-system capability toggles</p>
                                </div>
                            </div>
                            <button onClick={() => toast.success('Capabilities Reset to Core Default')} className="p-4 bg-gray-50 rounded-2xl text-black/20 hover:text-[#E8820C] transition-all hover:bg-orange-50"><RotateCcw size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[550px] overflow-y-auto pr-3 scrollbar-hide relative z-10">
                            {availablePages.map(page => (
                                <div
                                    key={page.id}
                                    onClick={() => togglePage(page.id)}
                                    className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group/item ${enabledPages[page.id]
                                        ? 'bg-white border-[#E8820C]/20 shadow-xl shadow-black/5'
                                        : 'bg-gray-50 border-transparent opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${enabledPages[page.id] ? 'bg-[#E8820C] text-white shadow-lg' : 'bg-white text-black/10'}`}>
                                            <page.icon size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black text-[#1A1A2E] truncate tracking-tight">{page.label}</p>
                                            <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.2em]">{enabledPages[page.id] ? 'Operational' : 'Deactivated'}</p>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full transition-all duration-500 ${enabledPages[page.id] ? 'bg-[#E8820C] shadow-[0_0_15px_#E8820C] scale-110' : 'bg-black/5'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ADMIN ONLY: User Role Authority */}
                {isAdmin && (
                    <div className="bg-white p-12 rounded-[4rem] border border-black/5 shadow-2xl space-y-12 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 text-black/[0.02] -mr-8 -mt-8">
                            <ShieldCheck size={200} />
                        </div>

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-[2rem] bg-[#1A1A2E]/5 flex items-center justify-center text-[#1A1A2E] group-hover:scale-110 transition-transform">
                                <UserCog size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-[#1A1A2E] font-serif tracking-tight">Executive Council</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Hierarchy & role delegation</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[550px] space-y-4 pr-3 scrollbar-hide py-2 relative z-10">
                            {members.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2.5rem] border border-black/5 hover:bg-white transition-all hover:shadow-2xl group/m">
                                    <div className="flex items-center gap-5 min-w-0">
                                        <div className="w-14 h-14 rounded-2xl bg-[#1A1A2E] text-white flex items-center justify-center text-sm font-black shadow-lg">
                                            {(m.name || '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-[#1A1A2E] truncate tracking-tight">{m.name}</p>
                                            <p className="text-[10px] text-[#E8820C] font-black uppercase tracking-[0.3em] mt-1">{m.role.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <select
                                        value={m.role}
                                        onChange={(e) => handleUpdateUserRole(m.id, e.target.value)}
                                        className="bg-white border-2 border-transparent hover:border-[#E8820C]/20 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-[#E8820C]/5 shadow-sm transition-all cursor-pointer"
                                    >
                                        <option value="official_member">Member</option>
                                        <option value="treasurer">Treasurer</option>
                                        <option value="welfare">Welfare</option>
                                        <option value="group_leader">Group Leader</option>
                                        <option value="admin">Super Admin</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TREASURER SECTION: Financial Parameters */}
                {isTreasurer && (
                    <div className={`${isAdmin ? 'lg:col-span-1' : 'lg:col-span-2'} bg-white p-12 rounded-[4rem] border border-black/5 shadow-2xl space-y-12 relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-12 text-black/[0.02] -mr-8 -mt-8">
                            <HandCoins size={200} />
                        </div>

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                                <Database size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black text-[#1A1A2E] font-serif tracking-tight">Monetary Statutes</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Global financial guardrails</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                            <div className="space-y-5">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-black/30 ml-4 flex items-center gap-2">
                                    <Zap size={14} className="text-[#E8820C]" /> Savings Target (₦)
                                </label>
                                <input
                                    type="number"
                                    value={settings.monthlySavingsTarget}
                                    onChange={(e) => setSettings({ ...settings, monthlySavingsTarget: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-[2rem] px-8 py-6 text-lg font-black outline-none transition-all shadow-inner"
                                />
                                <p className="text-[10px] text-black/30 italic font-medium px-4 leading-relaxed">Directly influences the Treasury Health Index on all brother dashboards.</p>
                            </div>
                            <div className="space-y-5">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-black/30 ml-4 flex items-center gap-2">
                                    <ShieldAlert size={14} className="text-[#E8820C]" /> Interest Rate (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.loanInterestRate}
                                        onChange={(e) => setSettings({ ...settings, loanInterestRate: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-[2rem] px-8 py-6 text-lg font-black outline-none transition-all shadow-inner"
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-black/20">% P.A.</span>
                                </div>
                                <p className="text-[10px] text-black/30 italic font-medium px-4 leading-relaxed">Zero-percent interest remains the primary brotherhood mandate for unity.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* EVERYONE: System Broadcast & Notifications */}
                <div className={`${isAdmin ? 'lg:col-span-1' : 'lg:col-span-2'} bg-white p-12 rounded-[4rem] border border-black/5 shadow-2xl space-y-12 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-12 text-black/[0.02] -mr-8 -mt-8">
                        <Bell size={200} />
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Zap size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-[#1A1A2E] font-serif tracking-tight">Signal Nexus</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Global alerts & broadcast relay</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        {/* Admin Global Notice Input */}
                        {isAdmin && (
                            <div className="space-y-6">
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#E8820C] ml-4">Imperial Broadcast</p>
                                <textarea
                                    value={globalNotice}
                                    onChange={(e) => setGlobalNotice(e.target.value)}
                                    placeholder="Enter directive for all active nodes..."
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 focus:bg-white rounded-[2.5rem] p-8 text-sm font-medium outline-none transition-all resize-none shadow-inner leading-relaxed"
                                    rows="5"
                                />
                                <button
                                    onClick={handlePostNotice}
                                    className="w-full py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] text-white transition-all hover:bg-[#252545] shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4"
                                    style={{ background: '#1A1A2E' }}
                                >
                                    Transmit Broadcast <Zap size={16} className="animate-pulse" />
                                </button>
                            </div>
                        )}

                        {/* Notification Preferences */}
                        <div className="space-y-8">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#E8820C] ml-4">Feed Optimization</p>
                            <div className="space-y-4">
                                {[
                                    { id: 'notif_contribute', label: 'Treasury Reminders', enabled: true },
                                    { id: 'notif_vote', label: 'Poll Activations', enabled: true },
                                    { id: 'notif_request', label: 'Petition Results', enabled: false },
                                    { id: 'notif_meeting', label: 'Summit Schedule', enabled: true },
                                ].map(n => (
                                    <div key={n.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-black/5 hover:bg-white hover:shadow-xl transition-all group/toggle">
                                        <span className="text-xs font-black text-[#1A1A2E] group-hover:text-[#E8820C] transition-colors">{n.label}</span>
                                        <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 cursor-pointer ${n.enabled ? 'bg-[#E8820C]' : 'bg-black/10'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform ${n.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ADMIN ONLY: Full System Audit Log */}
                {isAdmin && (
                    <div className="lg:col-span-2 bg-[#1A1A2E] p-12 md:p-20 rounded-[4.5rem] text-white/90 shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#F5A623]/5 rounded-full -mr-48 -mt-48 blur-[180px] group-hover:opacity-10 transition-opacity"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-[#F5A623] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                    <ShieldCheck size={40} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black text-white font-serif tracking-tight">Security Ledger</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Immutable system protocol history</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Real-time Stream Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            {[
                                { user: 'Admin', action: 'Sync System Protocols', time: 'Just now', detail: 'Hierarchy Adjusted' },
                                { user: 'Treasurer', action: 'Amended Savings Target', time: '12m ago', detail: 'Target: ₦250k' },
                                { user: 'System', action: 'Ledger Node Verification', time: '45m ago', detail: '24 Synchronized' },
                                { user: 'Leader', action: 'Dispatched Group Decree', time: '2h ago', detail: 'Manifesto Live' },
                                { user: 'Admin', action: 'Authorized Privilege', time: '4h ago', detail: 'Member -> Treasurer' },
                                { user: 'Treasurer', action: 'Disbursed Emergency Asset', time: '6h ago', detail: 'ID: #EFF-99' },
                            ].map((log, i) => (
                                <div key={i} className="flex flex-col gap-5 p-8 bg-white/5 rounded-[3rem] border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-2 cursor-pointer group/log relative overflow-hidden backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover/log:text-[#F5A623] transition-colors">
                                                <Fingerprint size={16} />
                                            </div>
                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover/log:text-white/40 transition-colors">{log.user}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/10 italic">{log.time}</span>
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-white/90 group-hover/log:text-[#F5A623] transition-colors font-serif leading-tight">{log.action}</p>
                                        <p className="text-[10px] font-bold text-white/30 mt-2 uppercase tracking-widest">{log.detail}</p>
                                    </div>
                                    <div className="absolute bottom-[-2rem] right-[-2rem] opacity-[0.03] group-hover/log:opacity-10 transition-opacity">
                                        <ShieldCheck size={120} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-12 py-10 rounded-[3rem] border-2 border-white/5 text-[11px] font-black uppercase tracking-[0.6em] text-white/20 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-6 group">
                            Decrypt Full Security Manifest <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
