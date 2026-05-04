import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, X, Clock, CheckCircle2, XCircle, Loader2, Shield, ShieldAlert, BadgeCheck, Search, ArrowRight, History, Eye } from 'lucide-react';
import dayjs from 'dayjs';
import { fetchRequests, submitRequest, welfareOfficerAction, leaderWelfareAction, treasurerWelfareAction } from '../api/requests';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

function fmt(v) { return `₦${Number(v || 0).toLocaleString('en-NG')}`; }

const STATUS = {
    pending:          { label: 'Pending', color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',   icon: Clock },
    welfare_approved: { label: 'At Group Leader', color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: ArrowRight },
    leader_approved:  { label: 'At Treasurer',    color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-50 dark:bg-indigo-900/20',  icon: ArrowRight },
    approved:         { label: 'Disbursed',        color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2 },
    declined:         { label: 'Declined',         color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20',     icon: XCircle },
};

export default function WelfarePage() {
    const { user, hasRole, ROLES } = useAuth();
    const { config } = usePageConfig('requests');

    const isWelfareOfficer = hasRole(ROLES.WELFARE);
    const isLeader = hasRole(ROLES.GROUP_LEADER);
    const isTreasurer = hasRole(ROLES.TREASURER);
    const isPrivileged = isWelfareOfficer || isLeader || isTreasurer || hasRole(ROLES.ADMIN);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [form, setForm] = useState({ type: 'Medical', amount: '', description: '', paymentMethod: 'wallet' });
    const [declineReason, setDeclineReason] = useState('');
    const [showDeclineBox, setShowDeclineBox] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // { type, action }

    const categories = ['Medical', 'Emergency', 'Education', 'Bereavement', 'Other'];

    const load = async () => {
        setLoading(true);
        try { setRequests(await fetchRequests()); }
        catch { toast.error('Failed to load requests'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const r = await submitRequest(form);
            setRequests(p => [r, ...p]);
            toast.success('Welfare request submitted successfully');
            setShowForm(false);
            setForm({ type: 'Medical', amount: '', description: '', paymentMethod: 'wallet' });
        } catch (err) { toast.error(err.message); }
        finally { setActionLoading(false); }
    };

    const doAction = async (type, id, action, extra = {}) => {
        if (action === 'decline' && !declineReason.trim()) {
            setPendingAction({ type, id, action });
            setShowDeclineBox(true);
            return;
        }
        setActionLoading(true);
        try {
            let updated;
            if (type === 'welfare') updated = await welfareOfficerAction(id, { action, declineReason, ...extra });
            else if (type === 'leader') updated = await leaderWelfareAction(id, { action, declineReason, ...extra });
            else if (type === 'treasurer') updated = await treasurerWelfareAction(id, { action, declineReason });
            setRequests(p => p.map(r => r._id === id ? updated : r));
            if (selected?._id === id) setSelected(updated);
            toast.success(`Action recorded: ${action}`);
            setDeclineReason('');
            setShowDeclineBox(false);
            setPendingAction(null);
        } catch (err) { toast.error(err.message); }
        finally { setActionLoading(false); }
    };

    const confirmDecline = () => {
        if (!declineReason.trim()) { toast.error('Please enter a decline reason'); return; }
        const { type, id, action } = pendingAction;
        setShowDeclineBox(false);
        doAction(type, id, action);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-black/30 dark:text-white/30">Loading Welfare Centre...</p>
        </div>
    );

    const myReqs = requests.filter(r => String(r.user?._id || r.user) === String(user?.id));
    const visible = isPrivileged ? requests : myReqs;
    const filtered = visible.filter(r => {
        const matchSearch = r.member?.toLowerCase().includes(search.toLowerCase()) || r.type?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Stage-filtered queues for privileged roles
    const welfareQueue = requests.filter(r => r.status === 'pending');
    const leaderQueue  = requests.filter(r => r.status === 'welfare_approved');
    const treasurerQueue = requests.filter(r => r.status === 'leader_approved');

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111827] p-6 sm:p-10 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-none border border-black/5 dark:border-white/10 transition-all duration-500">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-[0.05] dark:opacity-10 bg-[#E8820C] pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 text-[#F5A623]"><Shield size={20} /></div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-[#1A1A2E] dark:text-white">Welfare Centre</h1>
                        </div>
                        <p className="text-black/40 dark:text-white/40 text-sm max-w-md font-medium">3-stage approval: Welfare Officer → Group Leader → Treasurer</p>
                        <div className="flex flex-wrap gap-3 sm:gap-4 text-center pt-2">
                            {[['Pending', welfareQueue.length, 'text-amber-600 dark:text-amber-400'], ['At Leader', leaderQueue.length, 'text-blue-600 dark:text-blue-400'], ['At Treasurer', treasurerQueue.length, 'text-indigo-600 dark:text-indigo-400']].map(([l, v, c]) => (
                                <div key={l} className="bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-2 border border-black/5 dark:border-white/10 flex-1 sm:flex-none min-w-[80px]">
                                    <p className={`text-xl sm:text-2xl font-black ${c}`}>{v}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">{l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="w-full lg:w-auto bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl dark:shadow-none">
                        <Plus size={18} strokeWidth={3} className="text-[#E8820C]" /> Apply for Support
                    </button>
                </div>
            </div>

            {/* Role-specific action queues */}
            {isWelfareOfficer && welfareQueue.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2rem] p-6 space-y-4">
                    <h3 className="text-sm font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={16} /> Your Queue — Welfare Officer ({welfareQueue.length})</h3>
                    {welfareQueue.map(r => (
                        <div key={r._id} className="bg-white dark:bg-[#0B1221] rounded-2xl p-5 border border-amber-100 dark:border-amber-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                            <div className="flex-1">
                                <p className="font-black text-[#1A1A2E] dark:text-white">{r.member} <span className="text-black/30 dark:text-white/30 font-normal">— {r.type}</span></p>
                                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5 line-clamp-1">{r.description}</p>
                                <p className="text-sm font-black text-[#E8820C] mt-1">{fmt(r.amount)} · <span className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase">{r.paymentMethod}</span></p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => doAction('welfare', r._id, 'approve')} disabled={actionLoading}
                                    className="w-full sm:w-auto px-5 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <BadgeCheck size={12} />} Forward to Leader
                                </button>
                                <button onClick={() => doAction('welfare', r._id, 'decline')} disabled={actionLoading}
                                    className="w-full sm:w-auto px-5 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isLeader && leaderQueue.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-[2rem] p-6 space-y-4">
                    <h3 className="text-sm font-black text-blue-800 dark:text-blue-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={16} /> Your Queue — Group Leader ({leaderQueue.length})</h3>
                    {leaderQueue.map(r => (
                        <div key={r._id} className="bg-white dark:bg-[#0B1221] rounded-2xl p-5 border border-blue-100 dark:border-blue-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                            <div className="flex-1">
                                <p className="font-black text-[#1A1A2E] dark:text-white">{r.member} <span className="text-black/30 dark:text-white/30 font-normal">— {r.type}</span></p>
                                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5 line-clamp-1">{r.description}</p>
                                <p className="text-sm font-black text-[#E8820C] mt-1">{fmt(r.amount)} · <span className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase">{r.paymentMethod}</span></p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => doAction('leader', r._id, 'approve')} disabled={actionLoading}
                                    className="w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />} Forward to Treasurer
                                </button>
                                <button onClick={() => doAction('leader', r._id, 'decline')} disabled={actionLoading}
                                    className="w-full sm:w-auto px-5 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isTreasurer && treasurerQueue.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-[2rem] p-6 space-y-4">
                    <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={16} /> Your Queue — Treasurer ({treasurerQueue.length})</h3>
                    {treasurerQueue.map(r => (
                        <div key={r._id} className="bg-white dark:bg-[#0B1221] rounded-2xl p-5 border border-emerald-100 dark:border-emerald-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                            <div className="flex-1">
                                <p className="font-black text-[#1A1A2E] dark:text-white">{r.member} <span className="text-black/30 dark:text-white/30 font-normal">— {r.type}</span></p>
                                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5 line-clamp-1">{r.description}</p>
                                <p className="text-sm font-black text-[#E8820C] mt-1">{fmt(r.amount)} · <span className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase">{r.paymentMethod}</span></p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => doAction('treasurer', r._id, 'approve')} disabled={actionLoading}
                                    className="w-full sm:w-auto px-5 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <BadgeCheck size={12} />} Approve & Disburse
                                </button>
                                <button onClick={() => doAction('treasurer', r._id, 'decline')} disabled={actionLoading}
                                    className="w-full sm:w-auto px-5 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* All requests ledger */}
            <div className="bg-white dark:bg-[#0B1221] rounded-[2.5rem] shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
                <div className="p-6 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-serif font-bold text-[#1A1A2E] dark:text-white">{isPrivileged ? 'All Requests' : 'My Applications'}</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative w-full sm:w-48">
                            <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none dark:text-white" />
                        </div>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-2.5 text-xs font-bold outline-none dark:text-white">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="welfare_approved">At Leader</option>
                            <option value="leader_approved">At Treasurer</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                </div>
                <div className="divide-y divide-black/5 dark:divide-white/10">
                    {filtered.map(r => {
                        const st = STATUS[r.status] || STATUS.pending;
                        const Icon = st.icon;
                        return (
                            <div key={r._id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-4 cursor-pointer" onClick={() => setSelected(r)}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${st.bg} ${st.color}`}><Icon size={18} /></div>
                                    <div>
                                        <p className="font-black text-sm text-[#1A1A2E] dark:text-white">{isPrivileged ? r.member : r.type + ' Support'}</p>
                                        <p className="text-[10px] text-black/30 dark:text-white/30 font-bold uppercase tracking-widest">{st.label} · {dayjs(r.createdAt || r.date).format('DD MMM YYYY')}</p>
                                    </div>
                                </div>
                                <p className="text-lg font-black text-[#E8820C]">{fmt(r.amount)}</p>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="py-16 text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-black/20 dark:text-white/20">No requests found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl" onClick={() => !actionLoading && setShowForm(false)} />
                    <div className="bg-white dark:bg-[#0B1221] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">Apply for Support</h3>
                            <button onClick={() => setShowForm(false)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/40 hover:text-black dark:hover:text-white transition-all"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Category</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-4 text-sm font-bold outline-none dark:text-white">
                                        {categories.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Amount (₦)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20">₦</span>
                                        <input required type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-9 pr-4 py-4 font-bold outline-none dark:text-white" placeholder="0" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Receive via</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['wallet','cash'].map(m => (
                                        <button type="button" key={m} onClick={() => setForm({ ...form, paymentMethod: m })}
                                            className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.paymentMethod === m ? 'bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E]' : 'bg-gray-50 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Description</label>
                                <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-5 py-4 text-sm font-medium outline-none resize-none dark:text-white"
                                    placeholder="Briefly explain your situation..." />
                            </div>
                            <button type="submit" disabled={actionLoading}
                                className="w-full py-5 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} className="text-[#E8820C]" />} Submit Application
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Decline Reason Modal */}
            {showDeclineBox && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="bg-white dark:bg-[#0B1221] w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <h4 className="text-lg font-serif font-black text-[#1A1A2E] dark:text-white mb-4">Decline Reason</h4>
                        <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3}
                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-red-400 rounded-2xl px-5 py-4 text-sm font-medium outline-none resize-none mb-4 dark:text-white"
                            placeholder="State the reason for declining..." autoFocus />
                        <div className="flex gap-3">
                            <button onClick={() => { setShowDeclineBox(false); setPendingAction(null); setDeclineReason(''); }}
                                className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-black/50 dark:text-white/50 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={confirmDecline} disabled={actionLoading}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null} Confirm Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
