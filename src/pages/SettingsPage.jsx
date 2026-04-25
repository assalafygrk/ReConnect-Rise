import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck, UserCog, Database, Moon, Sun, Save,
    Loader2, Cpu, Trash2
} from 'lucide-react';
import { fetchMembers, updateMemberRole } from '../api/members';
import { updateSettings, fetchSettings } from '../api/settings';
import { useAuth } from '../context/AuthContext';
import { fetchAuditLogs, clearAuditLogs } from '../api/auditLog';

export default function SettingsPage() {
    const { hasRole } = useAuth();
    const isAdmin = hasRole('admin');
    const isTreasurer = hasRole('treasurer');

    const [settings, setSettings] = useState({
        siteName: 'ReConnect & Rise',
        maintenanceMode: false,
        registrationOpen: true,
        monthlySavingsTarget: 0,
        loanInterestRate: 0,
        groupAnnouncement: '',
    });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);

    const refreshLogs = useCallback(async () => {
        try {
            const logs = await fetchAuditLogs();
            setAuditLogs(logs);
        } catch (err) {
            console.error('Audit logs unreachable');
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [s, m] = await Promise.all([
                fetchSettings(),
                fetchMembers()
            ]);
            setSettings(s || settings);
            setMembers(m || []);
            await refreshLogs();
        } catch (err) {
            toast.error("Strategy synchronization failed");
        } finally {
            setLoading(false);
        }
    }, [refreshLogs, settings]);

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await updateSettings(settings);
            toast.success('Omni-system Protocols Synchronized');
            refreshLogs();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUserRole = async (id, newRole) => {
        try {
            await updateMemberRole(id, newRole);
            setMembers(prev => prev.map(m => m._id === id ? { ...m, role: newRole } : m));
            toast.success(`Access Level Re-delegated`);
            refreshLogs();
        } catch (err) {
            toast.error('Role update failed');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-[#E8820C]" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Accessing Command Core...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4">
            <div className="relative bg-[#1A1A2E] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-[#E8820C]/10 rounded-full blur-[180px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#F5A623]">
                            <Cpu size={14} /> Global Control
                        </div>
                        <h2 className="text-5xl font-black text-white font-serif tracking-tight">Strategy Center</h2>
                        <p className="text-white/40 text-lg font-serif italic">Management of brotherhood operational protocols.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setDarkMode(!darkMode)} className="p-5 rounded-[1.5rem] bg-white/5 text-white border border-white/10">
                            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-4 px-10 py-6 rounded-[2rem] bg-[#E8820C] text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-xl disabled:opacity-50">
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            Sync Protocols
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {isAdmin && (
                    <div className="bg-[#0f172a] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                        <div className="flex items-center gap-6 border-b border-slate-800 pb-8 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><UserCog size={28} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-white font-serif">Personnel Registry</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Access Level Delegation</p>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                            {members.map(m => (
                                <div key={m._id} className="flex items-center justify-between p-6 bg-slate-800/20 rounded-2xl border border-slate-800/50">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-200">{m.name}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.email}</p>
                                    </div>
                                    <select value={m.role} onChange={(e) => handleUpdateUserRole(m._id, e.target.value)} className="bg-transparent text-[11px] font-black uppercase text-indigo-400 outline-none cursor-pointer">
                                        <option value="member" className="bg-slate-900">Member</option>
                                        <option value="treasurer" className="bg-slate-900">Treasurer</option>
                                        <option value="welfare_officer" className="bg-slate-900">Welfare</option>
                                        <option value="admin" className="bg-slate-900 text-red-400">Admin</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(isAdmin || isTreasurer) && (
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
                        <div className="flex items-center gap-5 border-b border-slate-800 pb-8 mb-10">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Database size={28} /></div>
                            <div>
                                <h3 className="text-2xl font-black text-white font-serif">Fiscal Guardrails</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Monetary Statutes</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50">
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Savings Goal (₦)</label>
                                <input type="number" value={settings.monthlySavingsTarget} onChange={(e) => setSettings({ ...settings, monthlySavingsTarget: e.target.value })} className="w-full bg-transparent border-b border-slate-600 text-4xl font-serif font-black text-white outline-none py-2" />
                            </div>
                            <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/50">
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Interest Protocol (%)</label>
                                <input type="number" value={settings.loanInterestRate} onChange={(e) => setSettings({ ...settings, loanInterestRate: e.target.value })} className="w-full bg-transparent border-b border-slate-600 text-4xl font-serif font-black text-white outline-none py-2" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isAdmin && (
                <div className="bg-[#1A1A2E] p-10 md:p-16 rounded-[3rem] border border-white/5 shadow-2xl space-y-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-[#F5A623] border border-white/10"><ShieldCheck size={30} /></div>
                            <div>
                                <h3 className="text-3xl font-black text-white font-serif">Security Audit Ledger</h3>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-1">Immutable system transparency</p>
                            </div>
                        </div>
                        <button onClick={async () => { if(confirm('Clear all logs?')) { await clearAuditLogs(); refreshLogs(); toast.success('Registry Wiped'); }}} className="p-4 bg-white/5 rounded-2xl hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"><Trash2 size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {auditLogs.length > 0 ? auditLogs.slice(0, 9).map(log => (
                            <div key={log._id} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-white/10 transition-all">
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
                                    <span>{log.userEmail || 'System'}</span>
                                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-base font-black text-white/90 leading-tight">{log.action}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium italic">{log.details}</p>
                            </div>
                        )) : (
                            <div className="col-span-full py-24 text-center opacity-20"><ShieldCheck size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Registry Silent</p></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
