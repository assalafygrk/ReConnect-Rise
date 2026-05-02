import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck, Plus, X, FileText, Printer,
    ArrowUpCircle, ArrowDownCircle, History,
    CheckCircle2, XCircle, Clock, Search,
    Filter, Download, Loader2, CreditCard,
    TrendingDown, BadgeCheck, AlertTriangle, Fingerprint, Compass, User
} from 'lucide-react';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import TransactionReceipt from '../components/TransactionReceipt';
import { fetchDisbursements, addDisbursement, updateDisbursementStatus } from '../api/disbursements';
import { fetchMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}



export default function DisbursementsPage() {
    const { hasRole, ROLES } = useAuth();
    const { config } = usePageConfig('disbursements');
    const isTreasurer = hasRole(ROLES.TREASURER, ROLES.ADMIN);
    const isGroupLeader = hasRole(ROLES.GROUP_LEADER);
    const canManage = isTreasurer || isGroupLeader;


    // States
    const [items, setItems] = useState([]);
    const [membersList, setMembersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ memberId: '', amount: '', reason: '', type: 'welfare', method: 'Bank Transfer' });
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const printRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `RR_Receipt_Disbursement_${selectedItem?.id || ''}`,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [data, members] = await Promise.all([
                fetchDisbursements(),
                fetchMembers().catch(() => []),
            ]);
            setItems(data);
            setMembersList(members);
        } catch (err) {
            toast.error('Failed to load financial registry');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.memberId) { toast.error('Please select a member'); return; }
        setActionLoading(true);
        try {
            const payload = {
                memberId: form.memberId,
                amount: Number(form.amount),
                reason: form.reason,
                type: form.type || 'welfare',
                method: form.method || 'Bank Transfer',
                status: isTreasurer ? 'approved' : 'pending',
            };
            const data = await addDisbursement(payload);
            setItems((prev) => [data, ...prev]);
            toast.success(isTreasurer ? 'Transaction finalized successfully' : 'Request logged for review');
            setShowForm(false);
            setForm({ memberId: '', amount: '', reason: '', type: 'welfare', method: 'Bank Transfer' });
        } catch (err) {
            toast.error(err.message || 'Failed to add disbursement');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproval = async (id, newStatus) => {
        setActionLoading(true);
        try {
            const updated = await updateDisbursementStatus(id, newStatus);
            setItems((prev) => prev.map(item => item._id === id || item.id === id ? updated : item));
            if (selectedItem?._id === id || selectedItem?.id === id) setSelectedItem(updated);
            toast.success(`Disbursement registry updated: ${newStatus}`);
        } catch (err) {
            toast.error(err.message || 'Audit update failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest text-center px-4">Loading Financial Registry...</p>
        </div>
    );

    // Derived values
    const filteredItems = items.filter(item => {
        const matchesSearch = item.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.reason.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const totalDisbursed = items.filter(i => i.status === 'approved').reduce((sum, i) => sum + i.amount, 0);
    const pendingTotal = items.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

    const stats = [
        { label: 'Total Payouts', value: totalDisbursed, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Awaiting Action', value: pendingTotal, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Registry Count', value: items.length, icon: History, color: 'text-blue-600', bg: 'bg-blue-50', isMoney: false },
        { label: 'Audit Health', value: '100%', icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', isMoney: false },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 ring-emerald-600/10';
            case 'pending': return 'bg-amber-50 text-amber-600 ring-amber-600/10';
            case 'declined': return 'bg-red-50 text-red-600 ring-red-600/10';
            default: return 'bg-gray-50 text-gray-600 ring-gray-600/10';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A2E] p-10 text-white shadow-2xl border border-white/5">
                {/* Decorative background elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none bg-[#E8820C]" />
                <div className="absolute bottom-[-20%] left-[10%] w-[300px] h-[300px] rounded-full blur-[80px] opacity-5 pointer-events-none bg-blue-500" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-widest">
                            <Compass size={12} />
                            Treasury Oversight
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif font-black tracking-tight flex items-center gap-3">
                                {config.pageHeadline}
                                <Fingerprint size={24} className="text-white/20" />
                            </h1>
                            <p className="text-white/40 text-sm font-medium mt-2 max-w-md">
                                {config.pageSubtitle}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => toast.success('Exporting audited records...')}
                            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all backdrop-blur-sm"
                        >
                            <Download size={14} /> Export Audit
                        </button>
                        {canManage && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-[#E8820C] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-[#E8820C]/20"
                            >
                                <Plus size={14} /> Commit Entry
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {config.approvalNotice && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldCheck size={20} className="text-blue-600" />
                    <p className="text-sm font-bold text-blue-800">
                        {config.approvalNotice}
                    </p>
                </div>
            )
            }

            {/* Financial Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">System</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-serif font-black text-[#1A1A2E]">
                                {stat.isMoney === false ? stat.value : formatNaira(stat.value)}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
                <div className="p-8 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Audit search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-12 pr-4 py-2.5 text-xs font-bold outline-none transition-all w-full sm:w-64 shadow-inner"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-2.5 text-xs font-bold outline-none transition-all shadow-inner"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending Audit</option>
                            <option value="approved">Finalized</option>
                            <option value="declined">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left border-b border-black/5 whitespace-nowrap">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Transaction Ref</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Beneficiary</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Purpose</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 whitespace-nowrap">
                            {filteredItems.map((item) => (
                                <tr
                                    key={item._id || item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-white transition-all">
                                                <CreditCard size={14} />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-black/40">#DSB-{String(item.id).padStart(4, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-[#1A1A2E]">{item.member}</span>
                                    </td>
                                    <td className="px-6 py-5 max-w-xs truncate">
                                        <span className="text-xs font-medium text-black/60 italic">"{item.reason}"</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${getStatusStyle(item.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'approved' ? 'bg-emerald-600' :
                                                item.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'
                                                }`} />
                                            {item.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-sm font-black text-[#1A1A2E]">{formatNaira(item.amount)}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-bold text-black/30 text-xs">
                                        {dayjs(item.date).format('DD MMM YYYY')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Meticulous Modals */}
            {/* Record Form Modal */}
            {
                showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowForm(false)} />
                        <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-1">
                                <div className="space-y-1">
                                    <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]">New Financial Outlay</h3>
                                    <p className="text-xs text-black/30 font-medium tracking-wide flex items-center gap-1.5 uppercase">
                                        <ShieldCheck size={12} className="text-[#E8820C]" /> Registry Entry Mode
                                    </p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-5">
                                {/* Beneficiary Select */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Beneficiary / Recipient *</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 pointer-events-none" />
                                        <select
                                            required
                                            value={form.memberId}
                                            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl pl-12 pr-5 py-4 text-xs font-bold outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Select a member --</option>
                                            {membersList.map(m => (
                                                <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Amount *</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20 text-xs">₦</span>
                                        <input
                                            required
                                            type="number"
                                            min="100"
                                            max={config.maxDisburseAmount || undefined}
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl pl-10 pr-5 py-4 text-xs font-bold outline-none transition-all"
                                            placeholder="Min: 100"
                                        />
                                    </div>
                                </div>

                                {/* Type & Method */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Type</label>
                                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-4 text-xs font-bold outline-none transition-all appearance-none cursor-pointer">
                                            <option value="welfare">Welfare</option>
                                            <option value="loan">Loan</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Method</label>
                                        <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-4 text-xs font-bold outline-none transition-all appearance-none cursor-pointer">
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Mobile Money">Mobile Money</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Verified Purpose / Reason *</label>
                                    <textarea
                                        required
                                        value={form.reason}
                                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-[2rem] px-6 py-5 text-xs font-bold outline-none transition-all resize-none leading-relaxed"
                                        rows={3}
                                        placeholder="Provide detailed justification for this disbursement..."
                                    />
                                </div>

                                {Number(form.amount) > 5000 && (
                                    <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 border border-amber-100 items-start">
                                        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                                        <p className="text-[10px] font-bold text-amber-800 leading-normal uppercase">
                                            Threshold Warning: Requests exceeding ₦5,000 are subject to multi-stage Executive Review.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading || !form.memberId}
                                        className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{ background: '#1A1A2E' }}
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                        Commit Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Transaction Detail & Audit View */}
            {
                selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedItem(null)} />
                        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-1">
                                <div className="space-y-1">
                                    <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]">Transaction Audit</h3>
                                    <p className="text-xs text-black/30 font-medium tracking-wide flex items-center gap-1.5 uppercase">
                                        <History size={12} className="text-blue-500" /> Reference #{String(selectedItem._id || selectedItem.id).slice(-6).toUpperCase()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-gray-50 p-6 rounded-[2rem] border border-black/[0.03] space-y-4">
                                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Entry Metadata</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-black/40">Status:</span>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${getStatusStyle(selectedItem.status)}`}>
                                                {selectedItem.status}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-black/40">Beneficiary:</span>
                                            <span className="text-xs font-black text-[#1A1A2E]">{selectedItem.member}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-black/40">Execute Date:</span>
                                            <span className="text-xs font-black text-[#1A1A2E]">{dayjs(selectedItem.date).format('DD MMMM YYYY')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#1A1A2E] p-6 rounded-[2rem] text-white flex flex-col justify-center items-center text-center space-y-2">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Audited Amount</p>
                                    <h2 className="text-3xl font-serif font-black">{formatNaira(selectedItem.amount)}</h2>
                                    <div className="flex items-center gap-1.5 py-1.5 px-4 bg-white/5 rounded-full mt-2">
                                        <BadgeCheck size={12} className="text-emerald-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Vault Cleared</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-black/5 space-y-4 mb-8">
                                <h4 className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <FileText size={14} className="text-[#E8820C]" /> Purpose Log
                                </h4>
                                <p className="text-sm font-medium text-black/70 italic leading-relaxed">
                                    "{selectedItem.reason}"
                                </p>
                            </div>

                            <div className="space-y-4 pt-4">
                                {selectedItem.status === 'pending' && isTreasurer && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleApproval(selectedItem._id || selectedItem.id, 'approved')}
                                            disabled={actionLoading}
                                            className="py-4 bg-[#15803D] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/10 hover:opacity-90 active:scale-95 transition-all"
                                        >
                                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            Authorize Outlay
                                        </button>
                                        <button
                                            onClick={() => handleApproval(selectedItem._id || selectedItem.id, 'declined')}
                                            disabled={actionLoading}
                                            className="py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-red-900/10 hover:opacity-90 active:scale-95 transition-all"
                                        >
                                            <XCircle size={16} /> Veto Entry
                                        </button>
                                    </div>
                                )}

                                {selectedItem.status === 'approved' && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handlePrint}
                                            className="flex-1 py-4 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all"
                                        >
                                            <Printer size={16} /> Official Receipt
                                        </button>
                                        <button
                                            onClick={() => toast.success('Dispatching audit report...')}
                                            className="flex-1 py-4 border-2 border-[#1A1A2E] text-[#1A1A2E] rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
                                        >
                                            <Download size={16} /> Audit Export
                                        </button>
                                    </div>
                                )}

                                <button onClick={() => setSelectedItem(null)} className="w-full text-center py-2 text-[10px] font-black text-black/20 uppercase tracking-widest hover:text-black transition-colors">Close Audit View</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Hidden Print Wrapper */}
            <div className="hidden">
                <TransactionReceipt ref={printRef} data={selectedItem} type="disbursement" />
            </div>
        </div >
    );
}
