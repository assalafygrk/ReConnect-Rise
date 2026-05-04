import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    CheckCircle2, Clock, Wallet, Calendar, Save, Search,
    Loader2, AlertCircle, TrendingUp, ShieldCheck, Plus, X,
    ArrowDownCircle, CreditCard, Users
} from 'lucide-react';
import dayjs from 'dayjs';
import { fetchWeeklyStatus, markMemberPaid, payViaWallet, recordGeneralContribution, recordBatchContributions } from '../api/contributions';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

function fmt(v) { return `₦${Number(v || 0).toLocaleString('en-NG')}`; }

function DeadlineCountdown({ deadline }) {
    const [diff, setDiff] = useState('');
    useEffect(() => {
        const tick = () => {
            const ms = new Date(deadline) - new Date();
            if (ms <= 0) { setDiff('CLOSED'); return; }
            const h = Math.floor(ms / 3600000);
            const m = Math.floor((ms % 3600000) / 60000);
            const s = Math.floor((ms % 60000) / 1000);
            setDiff(`${h}h ${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [deadline]);
    const isUrgent = new Date(deadline) - new Date() < 3600000 * 6;
    return (
        <span className={`font-mono font-black text-sm ${isUrgent ? 'text-red-500 animate-pulse' : 'text-[#E8820C]'}`}>
            {diff}
        </span>
    );
}

export default function ContributionsPage() {
    const { hasRole, user, ROLES } = useAuth();
    const { config } = usePageConfig('contributions');
    const isTreasurer = hasRole(ROLES.TREASURER);
    const isAdmin = hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPER_ADMIN);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // memberId being processed
    const [weekData, setWeekData] = useState(null);
    const [search, setSearch] = useState('');
    const [showGeneralForm, setShowGeneralForm] = useState(false);
    const [genForm, setGenForm] = useState({ amount: '', paymentChannel: 'cash', note: '', reference: '' });
    const [payingWallet, setPayingWallet] = useState(false);
    const [payPin, setPayPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [showHistoryForm, setShowHistoryForm] = useState(false);
    const [historyForm, setHistoryForm] = useState({ memberId: '', weekId: '', amount: '', paymentChannel: 'cash', note: '' });

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchWeeklyStatus();
            setWeekData(data);
        } catch (err) {
            toast.error('Failed to load weekly status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleMarkPaid = async (memberId, memberName, paymentChannel = 'cash') => {
        setActionLoading(memberId);
        try {
            await markMemberPaid({ memberId, paymentChannel, amount: weekData?.baseAmount || 100 });
            toast.success(`${memberName} marked as paid (${paymentChannel})`);
            loadData();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleWalletPay = async () => {
        setPayingWallet(true);
        try {
            const res = await payViaWallet(payPin);
            toast.success(`₦${weekData?.baseAmount} contribution paid from your wallet! New balance: ${fmt(res.newWalletBalance)}`);
            loadData();
            setPayPin('');
            setShowPinInput(false);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPayingWallet(false);
        }
    };

    const handleGeneralContribution = async (e) => {
        e.preventDefault();
        setPayingWallet(true);
        try {
            await recordGeneralContribution({ amount: Number(genForm.amount), paymentChannel: genForm.paymentChannel, note: genForm.note, reference: genForm.reference });
            toast.success('General pool contribution recorded!');
            setShowGeneralForm(false);
            setGenForm({ amount: '', paymentChannel: 'cash', note: '', reference: '' });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPayingWallet(false);
        }
    };

    const handleRecordHistory = async (e) => {
        e.preventDefault();
        setPayingWallet(true);
        try {
            await markMemberPaid({ 
                memberId: historyForm.memberId, 
                weekId: historyForm.weekId, 
                amount: historyForm.amount || weekData?.baseAmount || 100, 
                paymentChannel: historyForm.paymentChannel, 
                note: historyForm.note 
            });
            toast.success('Historical record added successfully!');
            setShowHistoryForm(false);
            setHistoryForm({ memberId: '', weekId: '', amount: '', paymentChannel: 'cash', note: '' });
            loadData();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPayingWallet(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-black/30 dark:text-white/30">Loading Treasury...</p>
        </div>
    );

    const members = weekData?.memberStatus || [];
    const filtered = members.filter(m => m.memberName?.toLowerCase().includes(search.toLowerCase()));
    const paidCount = members.filter(m => m.paid).length;
    const myRecord = members.find(m => String(m.memberId) === String(user?.id || user?._id));
    const myPaid = myRecord?.paid || false;

    // Current user's contribution status for member view
    const baseAmount = weekData?.baseAmount || 100;

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111827] p-6 sm:p-10 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-none border border-black/5 dark:border-white/10 transition-all duration-500">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-[0.05] dark:opacity-10 bg-[#E8820C] pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 text-[#F5A623]"><Wallet size={20} /></div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-[#1A1A2E] dark:text-white">{config.pageHeadline || 'Contribution Ledger'}</h1>
                        </div>
                        <p className="text-black/40 dark:text-white/40 text-sm max-w-md font-medium">{config.pageSubtitle || 'Weekly contribution tracking for all official members'}</p>
                        {weekData && (
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/20 dark:text-white/30">Deadline (Thursday 23:59)</span>
                                <DeadlineCountdown deadline={weekData.deadline} />
                                {!weekData.weekOpen && <span className="px-3 py-1 bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full">Week Closed</span>}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-center w-full lg:w-auto min-w-0 sm:min-w-[240px]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/10">
                                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{paidCount}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mt-1">Paid</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/10">
                                <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{members.length - paidCount}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mt-1">Pending</p>
                            </div>
                        </div>
                        <div className="bg-[#E8820C]/5 dark:bg-[#E8820C]/10 rounded-2xl p-4 border border-[#E8820C]/10 dark:border-[#E8820C]/20 sm:col-span-1 lg:col-span-1">
                            <p className="text-xl sm:text-2xl font-black text-[#E8820C] dark:text-[#F5A623]">{fmt(weekData?.totalCollected)}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mt-1">Collected This Week</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MEMBER self-service panel */}
            {(!isTreasurer && !isAdmin) && (
                <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-sm p-8 space-y-6">
                    <h3 className="text-xl font-serif font-black text-[#1A1A2E] dark:text-white/90">My Contribution — {weekData?.weekId}</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className={`flex-1 p-6 rounded-[2rem] border-2 flex items-center gap-5 ${myPaid ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200'}`}>
                            {myPaid ? <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> : <Clock size={36} className="text-amber-600 dark:text-amber-400 shrink-0" />}
                            <div>
                                <p className={`font-black text-sm uppercase tracking-widest ${myPaid ? 'text-emerald-700' : 'text-amber-700'}`}>{myPaid ? 'Paid ✓' : 'Not Yet Paid'}</p>
                                <p className="text-xs text-black/50 mt-1">Weekly amount: {fmt(baseAmount)}</p>
                                {myRecord?.bonus > 0 && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+{fmt(myRecord.bonus)} bonus recorded</p>}
                            </div>
                        </div>
                        {!myPaid && weekData?.weekOpen && (
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                {showPinInput ? (
                                    <div className="flex flex-col gap-2">
                                        <input 
                                            type="password" 
                                            maxLength="4" 
                                            value={payPin} 
                                            onChange={(e) => setPayPin(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-black/5 dark:border-white/10 rounded-2xl px-4 py-4 text-center text-xl font-black tracking-[0.5em] outline-none focus:border-[#E8820C]/30"
                                            placeholder="••••"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleWalletPay} 
                                                disabled={payingWallet || payPin.length !== 4}
                                                className="flex-1 bg-[#1A1A2E] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                onClick={() => { setShowPinInput(false); setPayPin(''); }}
                                                className="px-4 bg-gray-100 dark:bg-white/10 text-black/30 dark:text-white/30 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowPinInput(true)} disabled={payingWallet}
                                        className="flex items-center justify-center gap-3 bg-[#1A1A2E] text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                        <CreditCard size={18} /> Pay via Wallet
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="border-t border-black/5 dark:border-white/10 pt-6">
                        <button onClick={() => setShowGeneralForm(true)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E8820C] border border-[#E8820C]/30 px-5 py-3 rounded-xl hover:bg-amber-50 dark:bg-amber-950/20 transition-all">
                            <Plus size={14} /> Make General Pool Contribution
                        </button>
                    </div>
                </div>
            )}

            {/* TREASURER / ADMIN — weekly ledger table */}
            {(isTreasurer || isAdmin) && (
                <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-[#1A1A2E] dark:text-white/90">Weekly Ledger — {weekData?.weekId}</h3>
                            <p className="text-xs text-black/30 dark:text-white/30">Click a member to mark as paid. {!weekData?.weekOpen && '⚠️ Week closed.'}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
                                    className="bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none transition-all w-full sm:w-56 dark:text-white" />
                            </div>
                            {isTreasurer && (
                                <div className="flex gap-2">
                                    <button onClick={() => setShowHistoryForm(true)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-600/30 px-4 py-2.5 rounded-xl hover:bg-emerald-50 dark:bg-emerald-950/20 transition-all">
                                        <Plus size={13} /> History
                                    </button>
                                    <button onClick={() => setShowGeneralForm(true)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E8820C] border border-[#E8820C]/30 px-4 py-2.5 rounded-xl hover:bg-amber-50 dark:bg-amber-950/20 transition-all">
                                        <Plus size={13} /> General
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-white/5 text-left">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest text-center">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest text-center">Channel</th>
                                    {isTreasurer && <th className="px-8 py-4 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {filtered.map(m => (
                                    <tr key={m.memberId} className="hover:bg-gray-50 dark:bg-white/5/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center text-[10px] font-black text-[#1A1A2E] dark:text-white/90">{m.memberName?.[0]}</div>
                                                <span className="text-sm font-bold text-[#1A1A2E] dark:text-white/90">{m.memberName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">{m.role?.replace(/[-_]/g, ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {m.paid
                                                ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-emerald-600/10"><CheckCircle2 size={10} />Paid</span>
                                                : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-amber-600/10"><Clock size={10} />Pending</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-black text-[#1A1A2E] dark:text-white/90">
                                            {m.paid ? fmt(m.amount) : '—'}
                                            {m.bonus > 0 && <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block">+{fmt(m.bonus)} bonus</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {m.paymentChannel ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">{m.paymentChannel}</span>
                                            ) : '—'}
                                        </td>
                                        {isTreasurer && (
                                            <td className="px-8 py-4">
                                                {!m.paid && weekData?.weekOpen ? (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'cash')} disabled={actionLoading === m.memberId}
                                                            className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50">
                                                            {actionLoading === m.memberId ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />} Cash
                                                        </button>
                                                        <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'wallet')} disabled={actionLoading === m.memberId}
                                                            className="px-3 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50">
                                                            {actionLoading === m.memberId ? <Loader2 size={10} className="animate-spin" /> : <Wallet size={10} />} Wallet
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-black/20 dark:text-white/20 font-bold uppercase">{m.paid ? 'Done' : 'Week closed'}</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-black/5 dark:divide-white/10">
                        {filtered.map(m => (
                            <div key={m.memberId} className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#1A1A2E]/10 dark:bg-white/10 flex items-center justify-center text-xs font-black text-[#1A1A2E] dark:text-white">{m.memberName?.[0]}</div>
                                        <div>
                                            <p className="text-sm font-bold text-[#1A1A2E] dark:text-white">{m.memberName}</p>
                                            <p className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">{m.role?.replace(/[-_]/g, ' ')}</p>
                                        </div>
                                    </div>
                                    {m.paid
                                        ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-emerald-600/10"><CheckCircle2 size={10} />Paid</span>
                                        : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-amber-600/10"><Clock size={10} />Pending</span>
                                    }
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                                    <div className="text-center flex-1 border-r border-black/5 dark:border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Amount</p>
                                        <p className="text-sm font-black text-[#1A1A2E] dark:text-white">{m.paid ? fmt(m.amount) : '—'}</p>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Channel</p>
                                        <p className="text-xs font-black text-black/40 dark:text-white/40 uppercase">{m.paymentChannel || '—'}</p>
                                    </div>
                                </div>
                                {isTreasurer && !m.paid && weekData?.weekOpen && (
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'cash')} disabled={actionLoading === m.memberId}
                                            className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                            {actionLoading === m.memberId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Cash
                                        </button>
                                        <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'wallet')} disabled={actionLoading === m.memberId}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                                            {actionLoading === m.memberId ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />} Wallet
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="py-16 text-center">
                            <Users size={40} className="mx-auto text-black/5 dark:text-white/5 mb-3" />
                            <p className="text-xs font-black uppercase tracking-widest text-black/20 dark:text-white/20">No members found</p>
                        </div>
                    )}
                </div>
            )}

            {/* General Contribution Modal */}
            {showGeneralForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl" onClick={() => setShowGeneralForm(false)} />
                    <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">General Contribution</h3>
                                <p className="text-[10px] text-[#E8820C] font-black uppercase tracking-widest mt-1">Pool contribution (not weekly)</p>
                            </div>
                            <button onClick={() => setShowGeneralForm(false)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-black transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleGeneralContribution} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Amount (₦)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20">₦</span>
                                    <input required type="number" min="1" value={genForm.amount} onChange={e => setGenForm({ ...genForm, amount: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none dark:text-white dark:placeholder:text-white/10" placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Payment Method</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['cash', 'wallet', 'bank_transfer'].map(ch => (
                                        <button type="button" key={ch} onClick={() => setGenForm({ ...genForm, paymentChannel: ch })}
                                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${genForm.paymentChannel === ch ? 'bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E]' : 'bg-gray-50 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                            {ch.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Note (optional)</label>
                                <input value={genForm.note} onChange={e => setGenForm({ ...genForm, note: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-5 py-4 text-xs font-bold outline-none dark:text-white dark:placeholder:text-white/10" placeholder="Purpose or note..." />
                            </div>
                            <button type="submit" disabled={payingWallet}
                                className="w-full py-5 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {payingWallet ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Record Contribution
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Contribution Modal */}
            {showHistoryForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl" onClick={() => setShowHistoryForm(false)} />
                    <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">Record History</h3>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-1">Upload hardcopy records</p>
                            </div>
                            <button onClick={() => setShowHistoryForm(false)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-black transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleRecordHistory} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Select Member</label>
                                <select required value={historyForm.memberId} onChange={e => setHistoryForm({ ...historyForm, memberId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-600 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                                    <option value="" disabled>Choose a member...</option>
                                    {members.map(m => (
                                        <option key={m.memberId} value={m.memberId}>{m.memberName} ({m.role?.replace(/[-_]/g, ' ')})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Week ID</label>
                                    <input required value={historyForm.weekId} onChange={e => setHistoryForm({ ...historyForm, weekId: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-600 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="e.g. 2026-W12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Amount (₦)</label>
                                    <input required type="number" min="1" value={historyForm.amount} onChange={e => setHistoryForm({ ...historyForm, amount: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-600 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder={weekData?.baseAmount} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                 <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Payment Method</label>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                     {['cash', 'wallet', 'bank_transfer'].map(ch => (
                                         <button type="button" key={ch} onClick={() => setHistoryForm({ ...historyForm, paymentChannel: ch })}
                                             className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${historyForm.paymentChannel === ch ? 'bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E]' : 'bg-gray-50 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                             {ch.replace('_', ' ')}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             <div className="space-y-2">
                                 <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Note</label>
                                 <input value={historyForm.note} onChange={e => setHistoryForm({ ...historyForm, note: e.target.value })}
                                     className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-600 rounded-2xl px-5 py-4 text-xs font-bold outline-none dark:text-white dark:placeholder:text-white/10" placeholder="Historical data upload..." />
                             </div>
                            <button type="submit" disabled={payingWallet}
                                className="w-full py-5 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {payingWallet ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Record
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
