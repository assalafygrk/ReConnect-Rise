import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck, Plus, X, FileText, Printer,
    Clock, Search,
    Download, Loader2, CreditCard,
    TrendingDown, BadgeCheck, Fingerprint, Compass
} from 'lucide-react';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import TransactionReceipt from '../components/TransactionReceipt';
import { fetchDisbursements, addDisbursement } from '../api/disbursements';
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

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ member: '', amount: '', reason: '' });
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const printRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `RR_Receipt_Disbursement_${selectedItem?._id || ''}`,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchDisbursements();
            setItems(data);
        } catch (err) {
            toast.error('Financial Registry unreachable');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const data = await addDisbursement({ ...form, status: isTreasurer ? 'approved' : 'pending' });
            setItems((prev) => [data, ...prev]);
            toast.success(isTreasurer ? 'Transaction finalized successfully' : 'Request logged for review');
            setShowForm(false);
            setForm({ member: '', amount: '', reason: '' });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproval = async (id, newStatus) => {
        setActionLoading(true);
        try {
            // Placeholder for status update API if we had one
            toast.error('Approval logic pending full backend implementation for Disbursements');
        } catch (err) {
            toast.error('Audit update failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest text-center px-4">Synchronizing Financial Registry...</p>
        </div>
    );

    const filteredItems = items.filter(item => {
        const member = item.member || '';
        const reason = item.reason || '';
        const matchesSearch = member.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reason.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const totalDisbursed = items.filter(i => i.status === 'approved').reduce((sum, i) => sum + i.amount, 0);
    const pendingTotal = items.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

    const stats = [
        { label: 'Total Payouts', value: totalDisbursed, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Awaiting Action', value: pendingTotal, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Registry Count', value: items.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', isMoney: false },
        { label: 'Audit Status', value: 'Verified', icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', isMoney: false },
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
        <div className="max-w-7xl mx-auto pb-20 space-y-12 px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A2E] p-12 text-white shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8820C]/10 rounded-full blur-[150px] -mr-40 -mt-40 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-[0.4em]">
                            <Compass size={14} /> Fiscal Oversight
                        </div>
                        <div>
                            <h1 className="text-5xl font-serif font-black tracking-tight flex items-center gap-4">
                                {config.pageHeadline}
                                <Fingerprint size={32} className="text-white/10" />
                            </h1>
                            <p className="text-white/40 text-lg font-serif italic mt-3 max-w-xl leading-relaxed">
                                {config.pageSubtitle}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => toast.success('Initializing Audit Export...')}
                            className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all"
                        >
                            <Download size={16} /> Export Archive
                        </button>
                        {canManage && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-[#E8820C] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-[#E8820C]/20"
                            >
                                <Plus size={20} /> Commit Outlay
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm space-y-6 group hover:shadow-xl transition-all">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[9px] font-black text-black/10 uppercase tracking-widest">Registry</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h4 className="text-3xl font-serif font-black text-[#1A1A2E]">
                                {stat.isMoney === false ? stat.value : formatNaira(stat.value)}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
                <div className="p-10 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50/30">
                    <div className="flex flex-1 items-center gap-6">
                        <div className="relative flex-1 group">
                            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" />
                            <input
                                type="text"
                                placeholder="Audit Ledger Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-black/5 focus:border-[#E8820C]/30 rounded-2xl pl-16 pr-6 py-4 text-xs font-bold outline-none transition-all shadow-sm"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white border border-black/5 rounded-2xl px-8 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
                        >
                            <option value="all">Global Queue</option>
                            <option value="pending">Awaiting Audit</option>
                            <option value="approved">Finalized</option>
                            <option value="declined">Vetoed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left border-b border-black/5 whitespace-nowrap">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Transaction Protocol</th>
                                <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Beneficiary</th>
                                <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Audit Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em] text-right">Allocation</th>
                                <th className="px-10 py-6 text-[10px] font-black text-black/40 uppercase tracking-[0.2em] text-right">Registry Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 whitespace-nowrap">
                            {filteredItems.map((item) => (
                                <tr
                                    key={item._id}
                                    onClick={() => setSelectedItem(item)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-white transition-all">
                                                <CreditCard size={18} />
                                            </div>
                                            <span className="text-xs font-mono font-black text-black/30">#DSB-{String(item._id).slice(-4).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-[#1A1A2E]">{item.member}</p>
                                            <p className="text-[10px] font-bold text-black/30 uppercase tracking-tight truncate max-w-[150px] italic">"{item.reason}"</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${getStatusStyle(item.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'approved' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                            {item.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-base font-serif font-black text-[#1A1A2E]">{formatNaira(item.amount)}</span>
                                    </td>
                                    <td className="px-10 py-6 text-right font-black text-black/20 text-[10px] uppercase">
                                        {dayjs(item.createdAt).format('DD MMM YYYY')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/80 backdrop-blur-xl">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-10 sticky top-0 bg-white z-10 py-2">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-serif font-black text-[#1A1A2E]">New Outlay</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Authorized Registry Entry</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-4 bg-gray-50 rounded-2xl text-black/20 hover:text-red-500 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Beneficiary Name</label>
                                <input
                                    required
                                    value={form.member}
                                    onChange={(e) => setForm({ ...form, member: e.target.value })}
                                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-6 py-5 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:ring-4 focus:ring-[#E8820C]/5 transition-all outline-none"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Inducted Capital (₦)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-serif font-black text-black/20 text-lg">₦</span>
                                    <input
                                        required
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full bg-gray-50 border border-black/5 rounded-2xl pl-12 pr-6 py-5 text-lg font-black text-[#1A1A2E] focus:bg-white focus:ring-4 focus:ring-[#E8820C]/5 transition-all outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Verified Purpose</label>
                                <textarea
                                    required
                                    value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                    className="w-full bg-gray-50 border border-black/5 rounded-[2rem] px-8 py-8 text-sm font-bold text-[#1A1A2E] focus:bg-white focus:ring-4 focus:ring-[#E8820C]/5 transition-all outline-none resize-none leading-relaxed shadow-inner"
                                    rows={4}
                                    placeholder="Detail justification for this disbursement..."
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest text-black/30 hover:bg-gray-50 rounded-2xl transition-all">Discard</button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-[2] py-5 rounded-2xl bg-[#1A1A2E] text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-[#1A1A2E]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {actionLoading ? <Loader2 size={18} className="animate-spin text-[#E8820C]" /> : <ShieldCheck size={20} />}
                                    Commit Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/90 backdrop-blur-2xl">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 md:p-16 shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-serif font-black text-[#1A1A2E]">Fiscal Audit</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Ref #DSB-{String(selectedItem._id).slice(-4).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-4 bg-gray-50 rounded-2xl text-black/20 hover:text-black transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-black/5 space-y-6">
                                <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Entry Metadata</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-black/40 uppercase">Status:</span>
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${getStatusStyle(selectedItem.status)}`}>
                                            {selectedItem.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-black/5 pt-4">
                                        <span className="text-[10px] font-black text-black/40 uppercase">Beneficiary:</span>
                                        <span className="text-sm font-black text-[#1A1A2E]">{selectedItem.member}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#1A1A2E] p-10 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center space-y-4 shadow-2xl">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Audited Sum</p>
                                <h2 className="text-5xl font-serif font-black">{formatNaira(selectedItem.amount)}</h2>
                                <div className="flex items-center gap-2 py-2 px-5 bg-white/5 rounded-full">
                                    <BadgeCheck size={14} className="text-emerald-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Finalized Archive</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-10 rounded-[3rem] border-2 border-dashed border-black/10 space-y-4 mb-12">
                            <h4 className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest mb-1 flex items-center gap-2">
                                <FileText size={16} /> Formal Purpose Log
                            </h4>
                            <p className="text-lg font-serif italic text-black/70 leading-relaxed">
                                "{selectedItem.reason}"
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-black/5">
                            <button
                                onClick={handlePrint}
                                className="flex-1 py-6 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                            >
                                <Printer size={20} /> Generate Receipt
                            </button>
                            <button
                                onClick={() => toast.success('Initializing Registry Export...')}
                                className="flex-1 py-6 border-2 border-[#1A1A2E] text-[#1A1A2E] rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                <Download size={20} /> Registry Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden">
                <TransactionReceipt ref={printRef} data={selectedItem} type="disbursement" />
            </div>
        </div>
    );
}
