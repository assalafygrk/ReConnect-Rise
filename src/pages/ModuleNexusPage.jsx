import React from 'react';
import { toast } from 'react-hot-toast';
import {
    LayoutDashboard, ListChecks, Users, Wallet, HandCoins,
    FileQuestion, Vote, CalendarDays, MessageSquare, UserCircle,
    Globe, Zap, RotateCcw, CreditCard, LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageConfigPanel from '../components/admin/PageConfigPanel';

export default function ModuleNexusPage() {
    const {
        hasRole, togglePage, enabledPages, adminPanelUnlocked
    } = useAuth();
    const isAdmin = hasRole('admin');

    if (!isAdmin || !adminPanelUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Access Denied. Admin Panel Locked.</p>
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
        { id: 'login', label: 'Login Page', icon: LogIn },
        { id: 'register', label: 'Registration Page', icon: UserPlus },
        { id: 'id_card', label: 'ID Card Access', icon: CreditCard },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 pb-24 space-y-12">
            <div className="bg-[#0f172a] p-6 md:p-14 rounded-[2rem] border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-12 relative overflow-hidden group mt-6">
                <div className="absolute top-0 right-0 p-12 text-white/[0.02] -mr-8 -mt-8 pointer-events-none">
                    <Globe size={300} />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 border-b border-slate-800 pb-8 mb-8 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Zap size={32} className="animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-serif font-medium text-white tracking-wide">Module Nexus</h3>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Omni-system capability toggles</p>
                        </div>
                    </div>
                    <button onClick={() => toast.success('Capabilities Reset to Core Default')} className="p-3 bg-slate-800/50 rounded-xl text-slate-400 hover:text-indigo-400 transition-all hover:bg-slate-800 border border-slate-700/50">
                        <RotateCcw size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 relative z-10">
                    {availablePages.map(page => (
                        <div
                            key={page.id}
                            onClick={() => togglePage(page.id)}
                            className={`p-5 rounded-[1.5rem] border border-slate-800/50 transition-all cursor-pointer flex items-center justify-between group/item ${enabledPages?.[page.id]
                                ? 'bg-slate-800/40 hover:bg-slate-800'
                                : 'bg-[#0a0f1c] opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${enabledPages?.[page.id] ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800/50 text-slate-500'}`}>
                                    <page.icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[12px] font-medium text-slate-200 truncate tracking-wide">{page.label}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">{enabledPages?.[page.id] ? 'Operational' : 'Deactivated'}</p>
                                </div>
                            </div>
                            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 shrink-0 ${enabledPages?.[page.id] ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-slate-700'}`}></div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-800 pt-10 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-px flex-1 bg-slate-800" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Granular Page Controls</span>
                        <div className="h-px flex-1 bg-slate-800" />
                    </div>
                    <div className="bg-slate-800/20 rounded-[1.5rem] p-4 sm:p-8 md:p-10 border border-slate-800/50 relative z-10 w-full max-w-4xl mx-auto">
                        <PageConfigPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}
