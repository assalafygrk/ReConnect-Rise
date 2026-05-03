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
    const isLeader = hasRole(ROLES.GROUP_LEADER);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // memberId being processed
    const [weekData, setWeekData] = useState(null);
    const [search, setSearch] = useState('');
    const [showGeneralForm, setShowGeneralForm] = useState(false);
    const [genForm, setGenForm] = useState({ amount: '', paymentChannel: 'cash', note: '', reference: '' });
    const [payingWallet, setPayingWallet] = useState(false);

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
            const res = await payViaWallet();
            toast.success(`₦${weekData?.baseAmount} contribution paid from your wallet! New balance: ${fmt(res.newWalletBalance)}`);
            loadData();
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

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-black/30">Loading Treasury...</p>
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
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A2E] p-10 text-white shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-[#E8820C] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-[#F5A623]"><Wallet size={20} /></div>
                            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight">{config.pageHeadline || 'Contribution Ledger'}</h1>
                        </div>
                        <p className="text-white/40 text-sm max-w-md">{config.pageSubtitle || 'Weekly contribution tracking for all official members'}</p>
                        {weekData && (
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Deadline (Thursday 23:59)</span>
                                <DeadlineCountdown deadline={weekData.deadline} />
                                {!weekData.weekOpen && <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full">Week Closed</span>}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center min-w-[240px]">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <p className="text-3xl font-black text-emerald-400">{paidCount}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Paid</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <p className="text-3xl font-black text-amber-400">{members.length - paidCount}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Pending</p>
                        </div>
                        <div className="col-span-2 bg-[#E8820C]/10 rounded-2xl p-4 border border-[#E8820C]/20">
                            <p className="text-2xl font-black text-[#F5A623]">{fmt(weekData?.totalCollected)}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Collected This Week</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MEMBER self-service panel */}
            {!isTreasurer && !isLeader && (
                <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm p-8 space-y-6">
                    <h3 className="text-xl font-serif font-black text-[#1A1A2E]">My Contribution — {weekData?.weekId}</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className={`flex-1 p-6 rounded-[2rem] border-2 flex items-center gap-5 ${myPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            {myPaid ? <CheckCircle2 size={36} className="text-emerald-600 shrink-0" /> : <Clock size={36} className="text-amber-600 shrink-0" />}
                            <div>
                                <p className={`font-black text-sm uppercase tracking-widest ${myPaid ? 'text-emerald-700' : 'text-amber-700'}`}>{myPaid ? 'Paid ✓' : 'Not Yet Paid'}</p>
                                <p className="text-xs text-black/50 mt-1">Weekly amount: {fmt(baseAmount)}</p>
                                {myRecord?.bonus > 0 && <p className="text-xs text-emerald-600 font-bold">+{fmt(myRecord.bonus)} bonus recorded</p>}
                            </div>
                        </div>
                        {!myPaid && weekData?.weekOpen && (
                            <button onClick={handleWalletPay} disabled={payingWallet}
                                className="flex items-center justify-center gap-3 bg-[#1A1A2E] text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {payingWallet ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                                Pay via Wallet
                            </button>
                        )}
                    </div>
                    <div className="border-t border-black/5 pt-6">
                        <button onClick={() => setShowGeneralForm(true)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E8820C] border border-[#E8820C]/30 px-5 py-3 rounded-xl hover:bg-amber-50 transition-all">
                            <Plus size={14} /> Make General Pool Contribution
                        </button>
                    </div>
                </div>
            )}

            {/* TREASURER / LEADER — weekly ledger table */}
            {(isTreasurer || isLeader) && (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
                    <div className="p-8 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-[#1A1A2E]">Weekly Ledger — {weekData?.weekId}</h3>
                            <p className="text-xs text-black/30">Click a member to mark as paid. {!weekData?.weekOpen && '⚠️ Week closed.'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
                                    className="bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none transition-all w-56" />
                            </div>
                            {isTreasurer && (
                                <button onClick={() => setShowGeneralForm(true)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E8820C] border border-[#E8820C]/30 px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-all">
                                    <Plus size={13} /> General
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest">Member</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest text-center">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest text-center">Channel</th>
                                    {isTreasurer && <th className="px-8 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {filtered.map(m => (
                                    <tr key={m.memberId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center text-[10px] font-black text-[#1A1A2E]">{m.memberName?.[0]}</div>
                                                <span className="text-sm font-bold text-[#1A1A2E]">{m.memberName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">{m.role?.replace(/[-_]/g, ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {m.paid
                                                ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-emerald-600/10"><CheckCircle2 size={10} />Paid</span>
                                                : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-amber-600/10"><Clock size={10} />Pending</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-black text-[#1A1A2E]">
                                            {m.paid ? fmt(m.amount) : '—'}
                                            {m.bonus > 0 && <span className="text-[9px] text-emerald-600 block">+{fmt(m.bonus)} bonus</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {m.paymentChannel ? (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-black/40">{m.paymentChannel}</span>
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
                                                    <span className="text-[9px] text-black/20 font-bold uppercase">{m.paid ? 'Done' : 'Week closed'}</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="py-16 text-center">
                                <Users size={40} className="mx-auto text-black/5 mb-3" />
                                <p className="text-xs font-black uppercase tracking-widest text-black/20">No members found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* General Contribution Modal */}
            {showGeneralForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl" onClick={() => setShowGeneralForm(false)} />
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">General Contribution</h3>
                                <p className="text-[10px] text-[#E8820C] font-black uppercase tracking-widest mt-1">Pool contribution (not weekly)</p>
                            </div>
                            <button onClick={() => setShowGeneralForm(false)} className="p-3 bg-gray-50 rounded-2xl text-black/20 hover:text-black transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleGeneralContribution} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Amount (₦)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20">₦</span>
                                    <input required type="number" min="1" value={genForm.amount} onChange={e => setGenForm({ ...genForm, amount: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-10 pr-5 py-4 text-sm font-bold outline-none" placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Payment Method</label>
                                <div className="flex gap-3">
                                    {['cash', 'wallet', 'bank_transfer'].map(ch => (
                                        <button type="button" key={ch} onClick={() => setGenForm({ ...genForm, paymentChannel: ch })}
                                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${genForm.paymentChannel === ch ? 'bg-[#1A1A2E] text-white' : 'bg-gray-50 text-black/40 hover:bg-gray-100'}`}>
                                            {ch.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Note (optional)</label>
                                <input value={genForm.note} onChange={e => setGenForm({ ...genForm, note: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-5 py-4 text-xs font-bold outline-none" placeholder="Purpose or note..." />
                            </div>
                            <button type="submit" disabled={payingWallet}
                                className="w-full py-5 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {payingWallet ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Record Contribution
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
