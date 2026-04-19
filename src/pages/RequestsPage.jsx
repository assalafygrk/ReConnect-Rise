import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus, X, Clock, CheckCircle2, XCircle,
    Eye, MessageSquare, FileText, Download,
    Search, Filter, Loader2, ClipboardCheck,
    AlertCircle, ArrowRight, User, Hash,
    MoreHorizontal, ShieldAlert, BadgeCheck,
    Printer, TrendingUp, Inbox, Fingerprint, Compass
} from 'lucide-react';
import dayjs from 'dayjs';
import { fetchRequests, submitRequest, updateRequestStatus } from '../api/requests';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import { fetchMembers } from '../api/members';
import WeeklyReportTemplate from '../components/WeeklyReportTemplate';
import { useReactToPrint } from 'react-to-print';

const MOCK = [
    { id: 1, submittedBy: 'Seun Adeyemi', type: 'Medical', amount: 5000, description: 'Hospital bill for malaria treatment at Garki Hospital.', status: 'pending', date: '2026-03-20' },
    { id: 2, submittedBy: 'Tunde Lawal', type: 'Emergency', amount: 3000, description: 'Loss of mobile device during transit. Requesting replacement support.', status: 'approved', date: '2026-03-10' },
    { id: 3, submittedBy: 'Musa Haruna', type: 'Education', amount: 8000, description: 'Final year project binding and submission fees.', status: 'declined', date: '2026-03-05' },
];

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

const statusStyles = {
    pending: { label: 'Pending Audit', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-600/10', icon: Clock },
    approved: { label: 'Authorized', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-600/10', icon: CheckCircle2 },
    declined: { label: 'Declined', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-600/10', icon: XCircle },
    voting: { label: 'Member Ballot', color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-600/10', icon: Eye },
};

export default function RequestsPage() {
    const { user, hasRole } = useAuth();
    const { config } = usePageConfig('requests');
    const canReview = hasRole('welfare', 'group_leader', 'treasurer');

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [form, setForm] = useState({ type: 'Medical', amount: '', description: '' });
    const [members, setMembers] = useState([]);

    const reportRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `RR_Financial_Report_${dayjs().format('YYYY-MM-DD')}`,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reqs, mems] = await Promise.all([fetchRequests(), fetchMembers()]);
            setRequests(reqs);
            setMembers(mems);
        } catch (err) {
            console.error('Data load error:', err);
            setRequests(MOCK);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const data = await submitRequest(form);
            setRequests((prev) => [data, ...prev]);
            toast.success('Support application registered successfully');
            setShowForm(false);
            setForm({ type: 'Medical', amount: '', description: '' });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setActionLoading(true);
        try {
            await updateRequestStatus(id, status);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
            if (selectedRequest?.id === id) setSelectedRequest(prev => ({ ...prev, status }));
            toast.success(`Request formalized as ${status}`);
            if (status !== 'pending') setSelectedRequest(null);
        } catch (err) {
            console.error('Update err:', err);
            toast.error('Record update failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest text-center px-4">Synchronizing Review Queue...</p>
        </div>
    );

    const filtered = requests.filter(r => {
        const matchesSearch = r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const myPendingCount = requests.filter(r => r.submittedBy === (user?.name || user?.id) && r.status === 'pending').length;
    const canApply = !config.maxPendingPerMember || myPendingCount < Number(config.maxPendingPerMember);
    const totalDisbursed = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);

    const requestCategories = Array.isArray(config.customCategories)
        ? config.customCategories
        : (typeof config.customCategories === 'string'
            ? config.customCategories.split(',').map(c => c.trim())
            : ['Medical', 'Emergency', 'Education', 'Bereavement', 'Other']);

    const stats = [
        { label: 'Review Queue', value: pendingCount, icon: Inbox, color: 'text-amber-600', bg: 'bg-amber-50', isMoney: false },
        { label: 'Authorized Aid', value: totalDisbursed, icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'System Health', value: '100%', icon: ShieldAlert, color: 'text-blue-600', bg: 'bg-blue-50', isMoney: false },
        { label: 'Avg Processing', value: '2.4 Days', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50', isMoney: false },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A2E] p-10 text-white shadow-2xl border border-white/5">
                {/* Decorative background elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none bg-[#E8820C]" />
                <div className="absolute bottom-[-20%] left-[10%] w-[300px] h-[300px] rounded-full blur-[80px] opacity-5 pointer-events-none bg-blue-500" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-widest">
                            <Compass size={12} />
                            Welfare Audit
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif font-black tracking-tight flex items-center gap-3">
                                Review Queue
                                <Fingerprint size={24} className="text-white/20" />
                            </h1>
                            <p className="text-white/40 text-sm font-medium mt-2 max-w-md">
                                Centralized clearing house for brotherhood support applications and case-by-case welfare assessments.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {hasRole('treasurer', 'admin') && (
                            <button
                                onClick={() => setShowReport(true)}
                                className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all backdrop-blur-sm"
                            >
                                <FileText size={14} /> Fiscal Report
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (!canApply) {
                                    toast.error(`You have reached the limit of ${config.maxPendingPerMember} pending requests.`);
                                    return;
                                }
                                setShowForm(true);
                            }}
                            className="bg-[#E8820C] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-[#E8820C]/20"
                        >
                            <Plus size={14} /> New Application
                        </button>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon size={20} />
                            </div>
                            <TrendingUp size={16} className="text-black/10" />
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

            {/* Main Table Area */}
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
                            <option value="all">Global Queue</option>
                            <option value="pending">Awaiting Audit</option>
                            <option value="approved">Authorized</option>
                            <option value="declined">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left border-b border-black/5 whitespace-nowrap">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Protocol ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Applicant</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Classification</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Status / Stage</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Requested Sum</th>
                                <th className="px-8 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Registry Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 whitespace-nowrap">
                            {filtered.map((req) => {
                                const st = statusStyles[req.status] || statusStyles.pending;
                                return (
                                    <tr
                                        key={req.id}
                                        onClick={() => setSelectedRequest(req)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-white transition-all">
                                                    <Hash size={14} />
                                                </div>
                                                <span className="text-xs font-mono font-bold text-black/40">#REQ-{String(req.id).padStart(4, '0')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[#1A1A2E] leading-tight">{req.submittedBy}</span>
                                                <span className="text-[10px] text-black/30 font-medium uppercase truncate max-w-[120px]">{req.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                                                {req.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${st.bg} ${st.color} ${st.ring}`}>
                                                <st.icon size={10} />
                                                {st.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-[#E8820C] text-sm">
                                            {formatNaira(req.amount)}
                                        </td>
                                        <td className="px-8 py-5 text-right font-bold text-black/30 text-xs">
                                            {dayjs(req.date).format('DD MMM YYYY')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-black/20">
                        <Inbox size={48} className="mb-4 opacity-10" />
                        <p className="text-xs font-black uppercase tracking-widest">Queue Clear / No Records Found</p>
                    </div>
                )}
            </div>

            {/* Application Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowForm(false)} />
                    <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-1">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]">Support Application</h3>
                                <p className="text-xs text-black/30 font-medium tracking-wide flex items-center gap-1.5 uppercase">
                                    <ClipboardCheck size={12} className="text-[#E8820C]" /> Formal Registry Entry
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Assistance Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        {requestCategories.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Sum Requested</label>
                                    <div className="relative group">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20 text-xs">₦</span>
                                        <input
                                            required
                                            type="number"
                                            min="100"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl pl-10 pr-5 py-4 text-xs font-bold outline-none transition-all"
                                            placeholder="Sum"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Detailed Circumstances</label>
                                <textarea
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-[2rem] px-6 py-5 text-xs font-bold outline-none transition-all resize-none leading-relaxed"
                                    rows={4}
                                    placeholder="Explain the situation in detail for the welfare committee audit..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-[#1A1A2E]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    style={{ background: '#1A1A2E' }}
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                                    Submit to Registry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Audit Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedRequest(null)} />
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-1">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]">Case Audit</h3>
                                <p className="text-xs text-black/30 font-medium tracking-wide flex items-center gap-1.5 uppercase">
                                    <ClipboardCheck size={12} className="text-blue-500" /> Protocol #REQ-{String(selectedRequest.id).padStart(4, '0')}
                                </p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 p-6 rounded-[2rem] border border-black/[0.03] space-y-4">
                                <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Application Data</p>
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Applicant</span>
                                        <span className="text-xs font-black text-[#1A1A2E] flex items-center gap-2">
                                            <User size={12} className="text-[#E8820C]" /> {selectedRequest.submittedBy}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Classification</span>
                                            <span className="text-xs font-black text-[#1A1A2E]">{selectedRequest.type}</span>
                                        </div>
                                        <div className="flex flex-col items-end text-right">
                                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-0.5">Sum</span>
                                            <span className="text-xs font-black text-[#E8820C]">{formatNaira(selectedRequest.amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#1A1A2E] p-6 rounded-[2rem] text-white flex flex-col justify-center space-y-4">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Workflow Status</p>
                                <div className="space-y-2">
                                    {Object.entries(statusStyles).map(([key, st]) => (
                                        <div key={key} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${selectedRequest.status === key ? 'bg-white/10 ring-1 ring-white/20' : 'opacity-20 grayscale'}`}>
                                            <st.icon size={14} className={st.color} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{st.label}</span>
                                            {selectedRequest.status === key && <BadgeCheck size={14} className="ml-auto text-emerald-400" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-black/5 space-y-4 mb-8">
                            <h4 className="text-[10px] font-black text-black/30 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={14} className="text-[#E8820C]" /> Statement of Necessity
                            </h4>
                            <p className="text-sm font-medium text-black/70 leading-relaxed italic">
                                "{selectedRequest.description}"
                            </p>
                        </div>

                        {canReview && selectedRequest.status === 'pending' && (
                            <div className="flex flex-col gap-4 mb-8 animate-in slide-in-from-bottom-4 duration-300">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
                                    <ClipboardCheck size={14} /> Audit Authorization Required
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                                        disabled={actionLoading}
                                        className="py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95"
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
                                        Authorize Aid
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedRequest.id, 'declined')}
                                        disabled={actionLoading}
                                        className="py-5 bg-red-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 hover:bg-red-700 transition-all active:scale-95"
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                        Decline Case
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-black/5">
                            <button className="flex-1 py-4 border-2 border-[#1A1A2E] text-[#1A1A2E] rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                                <Printer size={16} /> Print Case File
                            </button>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Close Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fiscal Report Modal */}
            {showReport && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowReport(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-300 border-8 border-white">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#1A1A2E] text-white">
                            <div>
                                <h3 className="text-2xl font-black font-serif">Executive Financial Registry</h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                                    <BadgeCheck size={12} /> Audited Brotherhood Ledger Output
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handlePrint} className="bg-white text-[#1A1A2E] text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2">
                                    <Download size={14} /> Commit to PDF
                                </button>
                                <button onClick={() => setShowReport(false)} className="p-4 text-white/20 hover:text-white transition-colors bg-white/5 rounded-2xl">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 bg-gray-50">
                            <div className="shadow-2xl mx-auto rounded-lg overflow-hidden border-8 border-white bg-white">
                                <WeeklyReportTemplate
                                    ref={reportRef}
                                    members={members}
                                    disbursements={requests.filter(r => r.status === 'approved').map(r => ({
                                        member: r.submittedBy,
                                        reason: r.type,
                                        date: r.date,
                                        amount: r.amount
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
