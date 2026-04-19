import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck, UserCog, Database, Bell, ChevronRight, Lock,
    Eye, EyeOff, LayoutDashboard, ListChecks, Users, Wallet, HandCoins,
    FileQuestion, Vote, CalendarDays, MessageSquare, UserCircle,
    Settings as SettingsIcon, Moon, Sun, Info, Save,
    Loader2, Zap, ShieldAlert, Cpu, Fingerprint, UserPlus,
    X, CheckCircle2, Smartphone, Key, QrCode, Mail,
    Search, Download, Trash2, Shield, ScanFace
} from 'lucide-react';
import { fetchMembers } from '../api/members';
import { updateSettings, fetchSettings } from '../api/settings';
import { useAuth } from '../context/AuthContext';
import { getLogs, addLog, clearLogs, exportLogsCSV } from '../api/auditLog';

export default function SettingsPage() {
    const {
        hasRole,
        adminSecurityMode, setAdminSecurityMode,
        setAdminPanelPassword, getAdmin2FACode,
    } = useAuth();
    const isAdmin = hasRole('admin');
    const isTreasurer = hasRole('treasurer');

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
    const [darkMode, setDarkMode] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    // Security Ledger
    const [auditLogs, setAuditLogs] = useState([]);
    const [logFilter, setLogFilter] = useState('all');
    const [logSearch, setLogSearch] = useState('');
    const [showFullLedger, setShowFullLedger] = useState(false);
    // Admin panel security config
    const [adminPassInput, setAdminPassInput] = useState('');
    const [showAdminPass, setShowAdminPass] = useState(false);
    // Notification setup
    const [notifications, setNotifications] = useState({ push: true, email: false, app: true });

    const refreshLogs = useCallback(() => setAuditLogs(getLogs()), []);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchSettings().catch(() => ({})), fetchMembers().catch(() => [])])
            .then(([s, m]) => {
                setSettings(prev => ({ ...prev, ...(s || {}) }));
                setMembers(m || []);
            })
            .catch(err => {
                console.error("Settings Core Failure:", err);
                toast.error("Strategy synchronization failed - utilizing local cache");
            })
            .finally(() => {
                setLoading(false);
                refreshLogs();
            });
    }, [refreshLogs]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await updateSettings(settings);
            await new Promise(r => setTimeout(r, 1200));
            addLog('Admin', 'Settings Deployed', 'System protocols synchronized', 'admin');
            refreshLogs();
            toast.success('Omni-system Protocols Synchronized');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUserRole = (id, newRole) => {
        const target = members.find(m => m.id === id);
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
        addLog('Admin', 'Role Re-delegated', `${target?.name || id} → ${newRole.replace('_', ' ')}`, 'admin');
        refreshLogs();
        toast.success(`Access Level Re-delegated: ${newRole.split('_').join(' ').toUpperCase()}`);
    };



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-[#E8820C]/20 border-t-[#E8820C] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Accessing Command Core...</p>
            </div>
        );
    }



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


                {/* ADMIN ONLY: User Role Authority */}
                {isAdmin && (
                    <div className="bg-[#0f172a] p-10 md:p-14 rounded-[2rem] border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 text-white/[0.02] -mr-8 -mt-8 pointer-events-none">
                            <ShieldCheck size={200} />
                        </div>

                        <div className="flex items-center gap-6 relative z-10 border-b border-slate-800 pb-8 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <UserCog size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-medium text-white tracking-wide">Executive Council Registry</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">System Access & Role Management</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                        <th className="pb-4 pl-4 font-bold">Personnel</th>
                                        <th className="pb-4 font-bold">Designation</th>
                                        <th className="pb-4 pr-4 text-right font-bold">Access Protocol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map(m => (
                                        <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-5 pl-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                        {(m.name || '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-200">{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-700">
                                                    {m.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-5 pr-4 text-right">
                                                <select
                                                    value={m.role}
                                                    onChange={(e) => handleUpdateUserRole(m.id, e.target.value)}
                                                    className="bg-transparent border-none text-[11px] font-bold uppercase tracking-wider text-indigo-400 outline-none cursor-pointer hover:text-indigo-300 text-right"
                                                >
                                                    <option value="official_member" className="bg-slate-900 text-white">Member</option>
                                                    <option value="treasurer" className="bg-slate-900 text-white">Treasurer</option>
                                                    <option value="welfare" className="bg-slate-900 text-white">Welfare</option>
                                                    <option value="group_leader" className="bg-slate-900 text-white">Group Leader</option>
                                                    <option value="admin" className="bg-slate-900 text-red-400">Super Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}



                {/* TREASURER SECTION: Monetary Statutes */}
                {isTreasurer && (
                    <div className={`${isAdmin ? 'lg:col-span-1' : 'lg:col-span-2'} bg-slate-900 p-10 md:p-14 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-8 text-white/[0.02] -mr-8 -mt-8 pointer-events-none">
                            <Database size={200} />
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 pb-8 mb-10 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                    <Database size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-medium text-white tracking-wide">Monetary Statutes Regulation</h3>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Global Financial Guardrails and Compliance</p>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <span className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-500/20">System Audited</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/50">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Mandatory Savings Target</label>
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-mono text-slate-500">₦</span>
                                    <input
                                        type="number"
                                        value={settings.monthlySavingsTarget}
                                        onChange={(e) => setSettings({ ...settings, monthlySavingsTarget: e.target.value })}
                                        className="w-full bg-transparent border-b border-slate-600 focus:border-emerald-500 text-4xl font-mono text-white outline-none transition-colors py-2"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-6 font-mono uppercase tracking-wide">Sets required global treasury health indices</p>
                            </div>

                            <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/50">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Base Lending Rate</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={settings.loanInterestRate}
                                        onChange={(e) => setSettings({ ...settings, loanInterestRate: e.target.value })}
                                        className="flex-1 bg-transparent border-b border-slate-600 focus:border-red-500 text-4xl font-mono text-white outline-none transition-colors py-2 text-right"
                                    />
                                    <span className="text-3xl font-mono text-slate-500">%</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-6 font-mono uppercase tracking-wide">Zero% statutory compliance is strictly monitored</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* EVERYONE: Personal Security & Experience Center */}
                <div className={`${isAdmin ? 'lg:col-span-1' : 'lg:col-span-2'} bg-[#0f172a] p-10 md:p-14 rounded-[2rem] border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-10 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-12 text-white/[0.02] -mr-8 -mt-8 pointer-events-none">
                        <SettingsIcon size={200} />
                    </div>

                    <div className="flex items-center gap-6 relative z-10 border-b border-slate-800 pb-8">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <SettingsIcon size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-medium text-white tracking-wide">Personal Config</h3>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Security, 2FA & Experience</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4 px-2">Authentication & Security</p>

                            <div onClick={() => setActiveModal('password')} className="p-5 rounded-[1.5rem] border border-slate-800/50 bg-slate-800/30 flex items-center justify-between hover:bg-slate-800/50 transition-all cursor-pointer group/item">
                                <div className="flex items-center gap-4">
                                    <Lock size={18} className="text-slate-500 group-hover/item:text-indigo-400" />
                                    <div>
                                        <p className="text-[12px] font-medium text-slate-200">Change Password</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Review standard access key</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover/item:translate-x-1 transition-transform" />
                            </div>

                            <div onClick={() => setActiveModal('2fa')} className="p-5 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between hover:bg-emerald-500/10 transition-all cursor-pointer group/item">
                                <div className="flex items-center gap-4">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    <div>
                                        <p className="text-[12px] font-medium text-emerald-100">Two-Factor Auth (2FA)</p>
                                        <p className="text-[10px] text-emerald-500/70 mt-1">Secured via Authenticator App</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest text-emerald-400 transition-colors">Manage</button>
                            </div>

                            <div onClick={() => setActiveModal('pin')} className="p-5 rounded-[1.5rem] border border-slate-800/50 bg-slate-800/30 flex items-center justify-between hover:bg-slate-800/50 transition-all cursor-pointer group/item">
                                <div className="flex items-center gap-4">
                                    <Wallet size={18} className="text-slate-500 group-hover/item:text-indigo-400" />
                                    <div>
                                        <p className="text-[12px] font-medium text-slate-200">Transaction PIN</p>
                                        <p className="text-[10px] text-slate-500 mt-1">4-digit wallet security</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover/item:translate-x-1 transition-transform" />
                            </div>

                            {/* ADMIN ONLY: Admin Panel Security Mode */}
                            {isAdmin && (
                                <div className="p-6 rounded-[1.5rem] border border-orange-500/20 bg-orange-500/5 space-y-5 mt-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Shield size={18} className="text-orange-400" />
                                        <div>
                                            <p className="text-[12px] font-medium text-orange-100">Admin Panel Security</p>
                                            <p className="text-[10px] text-orange-500/70 mt-0.5">Sidebar admin gate authentication method</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setAdminSecurityMode('password')}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-2 ${adminSecurityMode === 'password' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-transparent text-slate-500 border-slate-700 hover:border-orange-500/30 hover:text-slate-300'}`}>
                                            <Lock size={12} />Password
                                        </button>
                                        <button onClick={() => setAdminSecurityMode('2fa')}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-2 ${adminSecurityMode === '2fa' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-transparent text-slate-500 border-slate-700 hover:border-emerald-500/30 hover:text-slate-300'}`}>
                                            <ShieldCheck size={12} />2FA
                                        </button>
                                        <button onClick={() => setAdminSecurityMode('facial')}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-2 ${adminSecurityMode === 'facial' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-transparent text-slate-500 border-slate-700 hover:border-indigo-500/30 hover:text-slate-300'}`}>
                                            <ScanFace size={12} />Facial
                                        </button>
                                    </div>
                                    {adminSecurityMode === 'password' && (
                                        <form onSubmit={(e) => { e.preventDefault(); if (adminPassInput.length >= 4) { setAdminPanelPassword(adminPassInput); setAdminPassInput(''); } }} className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input type={showAdminPass ? 'text' : 'password'} value={adminPassInput}
                                                    onChange={e => setAdminPassInput(e.target.value)}
                                                    placeholder="New password (min 4 chars)"
                                                    className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500/50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 outline-none transition-all pr-10 placeholder:text-slate-600" />
                                                <button type="button" onClick={() => setShowAdminPass(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                                    {showAdminPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                            <button type="submit" className="px-4 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500/30 transition-all">Set</button>
                                        </form>
                                    )}
                                    {adminSecurityMode === '2fa' && (
                                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
                                            <p className="text-[10px] text-slate-500">Your mock 2FA code (enter this in the sidebar gate):</p>
                                            <p className="text-2xl font-mono tracking-[0.4em] text-emerald-400 py-2">{getAdmin2FACode()}</p>
                                            <p className="text-[9px] text-slate-600 italic">In production this is generated by an Authenticator app</p>
                                        </div>
                                    )}
                                    {adminSecurityMode === 'facial' && (
                                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                                                <ScanFace size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-medium text-indigo-100">Biometric Pattern Active</p>
                                                <p className="text-[10px] text-indigo-400/60 mt-0.5">Your device's biometric scanner will unlock the panel.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4 px-2">System Experience</p>

                            <div className="p-5 rounded-[1.5rem] border border-slate-800/50 bg-slate-800/30 flex items-center justify-between hover:bg-slate-800/50 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Moon size={18} className={`text-slate-500 ${darkMode ? 'text-indigo-400' : ''}`} />
                                    <p className="text-[12px] font-medium text-slate-200">Dark Mode Interface</p>
                                </div>
                                <div onClick={() => { setDarkMode(!darkMode); toast.success(`Interface Optimized for ${!darkMode ? 'Dark' : 'Light'} Operations`); }} className={`w-10 h-5 rounded-full transition-all flex items-center px-1 cursor-pointer ${darkMode ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                                    <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            <div className="p-5 rounded-[1.5rem] border border-slate-800/50 bg-slate-800/30 flex items-center justify-between hover:bg-slate-800/50 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Eye size={18} className="text-slate-500" />
                                    <p className="text-[12px] font-medium text-slate-200">High Contrast Text</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-all flex items-center px-1 cursor-pointer bg-slate-700`}>
                                    <div className={`w-3.5 h-3.5 bg-slate-400 rounded-full shadow-md transform transition-transform translate-x-0`}></div>
                                </div>
                            </div>

                            <div onClick={() => setActiveModal('notifications')} className="p-5 rounded-[1.5rem] border border-slate-800/50 bg-slate-800/30 flex items-center justify-between hover:bg-slate-800/50 transition-all cursor-pointer group/item">
                                <div className="flex items-center gap-4">
                                    <Bell size={18} className="text-slate-500 group-hover/item:text-indigo-400" />
                                    <div>
                                        <p className="text-[12px] font-medium text-slate-200">Notification Preferences</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Push, Email & SMS Setup</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-600 group-hover/item:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ADMIN ONLY: Full System Audit Log — Live */}
                {isAdmin && (() => {
                    const CAT_COLOR = { admin: '#E8820C', system: '#6366f1', member: '#10b981', security: '#ef4444' };
                    const filtered = auditLogs.filter(l => {
                        const catOk = logFilter === 'all' || l.category === logFilter;
                        const searchOk = !logSearch || [l.user, l.action, l.detail].some(v => v?.toLowerCase().includes(logSearch.toLowerCase()));
                        return catOk && searchOk;
                    });
                    const preview = filtered.slice(0, 6);
                    return (
                        <>
                            <div className="lg:col-span-2 bg-[#1A1A2E] p-8 md:p-14 rounded-[4.5rem] text-white/90 shadow-2xl relative overflow-hidden border border-white/5">
                                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#F5A623]/5 rounded-full -mr-40 -mt-40 blur-[160px]" />

                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-5 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-[#F5A623] border border-white/10">
                                            <ShieldCheck size={30} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white font-serif">Security Ledger</h3>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Immutable system protocol history</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{auditLogs.length} Events</span>
                                        </div>
                                        <button onClick={() => { exportLogsCSV(); toast.success('Ledger exported'); }} title="Export CSV"
                                            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-[#F5A623] transition-all border border-white/5">
                                            <Download size={16} />
                                        </button>
                                        <button onClick={() => { clearLogs(); refreshLogs(); toast.success('Security ledger cleared'); }} title="Clear log"
                                            className="p-2.5 rounded-2xl bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all border border-white/5">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Filters + Search */}
                                <div className="flex flex-col sm:flex-row gap-3 mb-8 relative z-10">
                                    <div className="relative flex-1">
                                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                        <input value={logSearch} onChange={e => setLogSearch(e.target.value)}
                                            placeholder="Search events, users, details..."
                                            className="w-full bg-white/5 border border-white/10 focus:border-[#E8820C]/40 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white/70 outline-none placeholder:text-white/20 transition-all" />
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {['all', 'admin', 'system', 'member', 'security'].map(f => (
                                            <button key={f} onClick={() => setLogFilter(f)}
                                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${logFilter === f
                                                    ? 'bg-[#E8820C] text-white border-[#E8820C]'
                                                    : 'bg-white/5 text-white/30 border-white/5 hover:border-white/20 hover:text-white/60'
                                                    }`}>{f}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Log Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                    {preview.length === 0 ? (
                                        <div className="lg:col-span-3 py-16 text-center">
                                            <Fingerprint size={40} className="mx-auto text-white/10 mb-4" />
                                            <p className="text-white/20 text-sm font-medium">No events match your criteria</p>
                                            <p className="text-white/10 text-xs mt-1">Perform actions in the portal to generate audit events</p>
                                        </div>
                                    ) : preview.map(log => (
                                        <div key={log.id} className="flex flex-col gap-3 p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 hover:border-white/15 transition-all hover:-translate-y-1 group/log relative overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: CAT_COLOR[log.category] || '#fff' }}>
                                                        <Fingerprint size={12} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{log.user}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-white/15 italic shrink-0">{log.timeDisplay}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white/80 group-hover/log:text-[#F5A623] transition-colors font-serif leading-snug">{log.action}</p>
                                                <p className="text-[10px] font-bold text-white/25 mt-1 uppercase tracking-wider">{log.detail}</p>
                                            </div>
                                            <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg"
                                                style={{ background: `${CAT_COLOR[log.category]}22`, color: CAT_COLOR[log.category] }}>
                                                {log.category}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => setShowFullLedger(true)}
                                    className="w-full mt-8 py-7 rounded-[2.5rem] border-2 border-white/5 text-[11px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-4 group relative z-10">
                                    Decrypt Full Security Manifest ({filtered.length} total)
                                    <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>

                            {/* Full Ledger Modal */}
                            {showFullLedger && (
                                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-[#0a0a1a]/85 backdrop-blur-md" onClick={() => setShowFullLedger(false)} />
                                    <div className="relative bg-[#1A1A2E] w-full max-w-3xl max-h-[88vh] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                                        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                                            <div className="flex items-center gap-4">
                                                <ShieldCheck size={22} className="text-[#F5A623]" />
                                                <div>
                                                    <h3 className="text-lg font-black text-white font-serif">Full Security Manifest</h3>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{filtered.length} entries</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { exportLogsCSV(); toast.success('Exported'); }}
                                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#F5A623] transition-all">
                                                    <Download size={15} />
                                                </button>
                                                <button onClick={() => setShowFullLedger(false)}
                                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-5 space-y-2">
                                            {filtered.length === 0 ? (
                                                <div className="text-center py-16 text-white/20 text-sm">No events found</div>
                                            ) : filtered.map(log => (
                                                <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/8 transition-all group">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shrink-0"
                                                            style={{ background: `${CAT_COLOR[log.category]}22`, color: CAT_COLOR[log.category] }}>
                                                            {log.category}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-black text-white/70 group-hover:text-[#F5A623] transition-colors truncate">{log.action}</p>
                                                            <p className="text-[10px] text-white/30 truncate">{log.detail}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-4">
                                                        <p className="text-[11px] font-bold text-white/50">{log.user}</p>
                                                        <p className="text-[10px] text-white/20 italic">{log.timeDisplay}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

            {/* Application Modals Layer */}
            {activeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/20 select-none overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">

                        {/* Dynamic Header */}
                        <div className="bg-[#1A1A2E] p-8 md:p-10 relative overflow-hidden group">
                            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#E8820C] rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
                            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 hover:rotate-90 rounded-xl flex items-center justify-center text-white transition-all backdrop-blur-md">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className={`w-14 h-14 bg-white/10 border border-white/20 rounded-[1.5rem] flex items-center justify-center shadow-inner backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.05)] ${activeModal === '2fa' ? 'text-emerald-400' : 'text-[#E8820C]'}`}>
                                    {activeModal === 'password' && <Lock size={26} className="animate-pulse" />}
                                    {activeModal === '2fa' && <ShieldCheck size={26} />}
                                    {activeModal === 'pin' && <Wallet size={26} />}
                                    {activeModal === 'notifications' && <Bell size={26} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white font-serif tracking-tight">
                                        {activeModal === 'password' && 'Access Key'}
                                        {activeModal === '2fa' && 'Two-Factor Protocol'}
                                        {activeModal === 'pin' && 'Transaction PIN'}
                                        {activeModal === 'notifications' && 'Notification Matrix'}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5A623] mt-1">
                                        Personal Configuration Layer
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Forms */}
                        <div className="p-8 md:p-10 space-y-8 bg-gray-50/50">

                            {/* 1. Change Password */}
                            {activeModal === 'password' && (
                                <form onSubmit={(e) => { e.preventDefault(); toast.success('Access Key Synchronized Successfully'); setActiveModal(null); }} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 ml-4">Current Key</label>
                                        <input type="password" required className="w-full bg-white border-2 border-black/5 focus:border-[#E8820C]/30 rounded-[2rem] px-6 py-4 text-sm font-medium outline-none transition-all shadow-sm focus:shadow-md" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 ml-4">New Encrypted Key</label>
                                        <input type="password" required minLength="8" className="w-full bg-white border-2 border-black/5 focus:border-[#E8820C]/30 rounded-[2rem] px-6 py-4 text-sm font-medium outline-none transition-all shadow-sm focus:shadow-md" placeholder="Min. 8 cryptographic characters" />
                                    </div>
                                    <button type="submit" className="w-full py-5 rounded-[2rem] bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(26,26,46,0.2)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                                        <Key size={16} /> Deploy New Key
                                    </button>
                                </form>
                            )}

                            {/* 2. Setup 2FA */}
                            {activeModal === '2fa' && (
                                <div className="space-y-8 text-center">
                                    <div className="mx-auto w-48 h-48 bg-white border border-black/10 rounded-3xl shadow-xl flex items-center justify-center p-4 group">
                                        <div className="w-full h-full border-[8px] border-[#1A1A2E] rounded-xl flex items-center justify-center relative bg-gray-50 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                            <div className="absolute inset-x-0 h-1 bg-[#10b981]/50 top-1/2 animate-[pulse_2s_ease-in-out_infinite_alternate] shadow-[0_0_10px_#10b981]"></div>
                                            <QrCode size={100} className="text-[#1A1A2E] opacity-50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[12px] font-bold text-[#1A1A2E] italic font-serif leading-relaxed px-4">
                                            Scan this cryptographic matrix using Microsoft or Google Authenticator to pair your device.
                                        </p>
                                        <button className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] hover:text-[#1A1A2E] transition-colors border-b-2 border-transparent hover:border-[#1A1A2E]">
                                            Copy Encrypted Secret Instead
                                        </button>
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); toast.success('2FA Link Successfully Established'); setActiveModal(null); }} className="space-y-6 pt-4 border-t border-black/5">
                                        <input type="text" maxLength="6" required className="w-full text-center bg-white border-2 border-black/5 focus:border-[#10b981]/30 rounded-[2rem] px-6 py-5 text-3xl font-black uppercase outline-none transition-all shadow-sm tracking-[0.8em]" placeholder="000 000" />
                                        <button type="submit" className="w-full py-5 rounded-[2rem] bg-[#1A1A2E] text-[#10b981] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(26,26,46,0.2)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                                            <ShieldCheck size={18} /> Verify & Activate
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* 3. Transaction PIN */}
                            {activeModal === 'pin' && (
                                <form onSubmit={(e) => { e.preventDefault(); toast.success('Transaction PIN Locked'); setActiveModal(null); }} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A2E] flex justify-center w-full">Establish 4-Digit Sequence</label>
                                        <div className="flex gap-4 sm:gap-6 justify-center">
                                            {[1, 2, 3, 4].map(idx => (
                                                <input key={idx} type="password" required maxLength="1" className="w-14 h-16 sm:w-16 sm:h-18 text-center bg-white border-2 border-black/5 focus:border-[#E8820C]/30 focus:shadow-md rounded-2xl text-2xl font-black outline-none transition-all shadow-sm" placeholder="-" />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-[#E8820C]/10 border border-[#E8820C]/20 rounded-[2rem] p-6 flex items-start gap-5">
                                        <Info size={24} className="text-[#E8820C] shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-bold text-[#E8820C] leading-relaxed italic font-serif">
                                            This pin authorizes financial distributions and treasury withdrawals. Never share this with anyone, including institutional elders.
                                        </p>
                                    </div>
                                    <button type="submit" className="w-full py-5 rounded-[2rem] bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(26,26,46,0.2)] hover:-translate-y-1 transition-all active:scale-95 flex justify-center gap-3 items-center">
                                        <Wallet size={16} /> Confirm Vault Lock
                                    </button>
                                </form>
                            )}

                            {/* 4. Notifications */}
                            {activeModal === 'notifications' && (
                                <div className="space-y-5">
                                    {[
                                        { id: 'push', label: 'Push Directives', desc: 'Real-time alerts on your device', icon: Smartphone },
                                        { id: 'email', label: 'Email Intelligence', desc: 'Daily cryptographic summaries', icon: Mail },
                                        { id: 'app', label: 'In-App Telemetry', desc: 'Internal system bell ringers', icon: MessageSquare }
                                    ].map(n => (
                                        <div key={n.id} onClick={() => setNotifications(prev => ({ ...prev, [n.id]: !prev[n.id] }))} className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-black/5 hover:border-black/10 transition-all shadow-sm cursor-pointer group/toggle">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${notifications[n.id] ? 'bg-[#E8820C]/10 text-[#E8820C] border-[#E8820C]/20 shadow-inner' : 'bg-gray-50 text-black/30 hover:text-[#E8820C] border-black/5'}`}>
                                                    <n.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-black text-[#1A1A2E]">{n.label}</p>
                                                    <p className="text-[10px] text-black/40 font-medium italic mt-1">{n.desc}</p>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${notifications[n.id] ? 'bg-[#E8820C]' : 'bg-black/10'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform ${notifications[n.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => { setActiveModal(null); toast.success('Notification Matrix Reprogrammed'); }} className="w-full py-5 rounded-[2rem] bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(26,26,46,0.2)] hover:-translate-y-1 transition-all active:scale-95 mt-8 flex items-center justify-center gap-3">
                                        <CheckCircle2 size={16} className="text-[#F5A623]" /> Validate Matrix
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
