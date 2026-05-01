import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus, X, Clock, CheckCircle2, XCircle,
    Eye, MessageSquare, FileText, Download,
    Search, Filter, Loader2, ClipboardCheck,
    AlertCircle, ArrowRight, User, Hash,
    MoreHorizontal, ShieldAlert, BadgeCheck,
    Printer, TrendingUp, Inbox, Fingerprint, Compass, History, HeartHandshake
} from 'lucide-react';

import dayjs from 'dayjs';
import { fetchRequests, submitRequest, updateRequestStatus } from '../api/requests';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import { fetchMembers } from '../api/members';
import WeeklyReportTemplate from '../components/WeeklyReportTemplate';
import { useReactToPrint } from 'react-to-print';

const MOCK = [];

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

const statusStyles = {
    pending: { label: 'Pending Audit', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-600/10', icon: Clock },
    approved: { label: 'Authorized', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-600/10', icon: CheckCircle2 },
    declined: { label: 'Declined', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-600/10', icon: XCircle },
    voting: { label: 'Member Ballot', color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-600/10', icon: Eye },
};

export default function WelfarePage() {
    const { user, hasRole, ROLES } = useAuth();
    const { config } = usePageConfig('requests');
    const isWelfareOfficer = hasRole(ROLES.WELFARE, ROLES.ADMIN);

    const canReview = isWelfareOfficer;

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

    const [activeSite, setActiveSite] = useState(isWelfareOfficer ? 'officer' : 'public');
    const [publicTab, setPublicTab] = useState('transparency'); // 'transparency' | 'my-history'

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
            setRequests((prev) => [{ ...data, submittedBy: user?.name || 'Member' }, ...prev]);
            toast.success('Support application registered successfully');
            setShowForm(false);
            setForm({ type: 'Medical', amount: '', description: '' });
            setPublicTab('my-history');
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
            toast.success(`Case formalized as ${status.toUpperCase()}`);
            if (status !== 'pending') setSelectedRequest(null);
        } catch (err) {
            console.error('Update err:', err);
            toast.error('Record update failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                <Loader2 className="animate-spin text-[#E8820C]" size={48} />
                <ShieldAlert className="absolute inset-0 m-auto text-[#1A1A2E]/20" size={20} />
            </div>
            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.5em] animate-pulse">Synchronizing Welfare Registry...</p>
        </div>
    );

    const officerFiltered = requests.filter(r => {
        const matchesSearch = r.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const publicTransparency = requests.filter(r => r.status === 'approved').sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
    const myHistory = requests.filter(r => r.submittedBy === (user?.name || user?.id));

    const myPendingCount = requests.filter(r => r.submittedBy === (user?.name || user?.id) && r.status === 'pending').length;
    const globalPendingCount = requests.filter(r => r.status === 'pending').length;
    const canApply = !config.maxPendingPerMember || myPendingCount < Number(config.maxPendingPerMember);
    const totalDisbursed = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);

    const requestCategories = Array.isArray(config.customCategories)
        ? config.customCategories
        : (typeof config.customCategories === 'string'
            ? config.customCategories.split(',').map(c => c.trim())
            : ['Medical', 'Emergency', 'Education', 'Bereavement', 'Other']);

    return (
        <div className="max-w-7xl mx-auto pb-32 space-y-12 px-4 md:px-8 animate-in fade-in duration-700">
            {/* Serious System Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4.5rem] bg-[#1A1A2E] p-8 md:p-16 text-white shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-gradient-to-br from-[#E8820C] to-indigo-500" />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[80px] opacity-5 pointer-events-none bg-emerald-500" />

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[#F5A623]">
                                    <HeartHandshake size={24} />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-6xl font-serif font-black tracking-tighter">Welfare Centre.</h1>
                                    <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.4em] text-white/30 mt-1 italic">Supporting the Brotherhood Strength</p>
                                </div>

                            </div>
                            
                            <p className="text-white/40 text-lg md:text-xl font-serif italic max-w-xl leading-relaxed">
                                "Our collective resilience is measured by how we uphold a brother in need. Transparency in aid is the bedrock of our trust."
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row bg-white/5 p-1.5 rounded-2xl md:rounded-[2rem] border border-white/10 backdrop-blur-xl">
                                {isWelfareOfficer && (
                                    <button 
                                        onClick={() => setActiveSite('officer')}
                                        className={`px-4 md:px-8 py-3 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeSite === 'officer' ? 'bg-[#E8820C] text-white shadow-xl shadow-[#E8820C]/20' : 'text-white/40 hover:text-white/60'}`}
                                    >
                                        <ShieldAlert size={14} /> Officer Site
                                    </button>
                                )}
                                <button 
                                    onClick={() => setActiveSite('public')}
                                    className={`px-4 md:px-8 py-3 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeSite === 'public' ? 'bg-white text-[#1A1A2E] shadow-xl' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    <Eye size={14} /> Public Mirror
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    if (!canApply) {
                                        toast.error(`Limit reached: ${config.maxPendingPerMember} pending applications.`);
                                        return;
                                    }
                                    setShowForm(true);
                                }}
                                className="w-full bg-white text-[#1A1A2E] px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                            >
                                <Plus size={20} strokeWidth={3} className="text-[#E8820C]" />
                                Initialize Application
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Aid Disbursed</p>
                            <p className="text-2xl font-black text-[#F5A623]">{formatNaira(totalDisbursed)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Active Cases</p>
                            <p className="text-2xl font-black">{globalPendingCount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">My Pending</p>
                            <p className="text-2xl font-black text-amber-500">{myPendingCount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Member Trust Score</p>
                            <p className="text-2xl font-black text-emerald-500">100%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Site Views */}
            {activeSite === 'officer' ? (
                /* OFFICER SITE: Audit & Management */
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                                <ClipboardCheck size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#1A1A2E] font-serif">Audit Command</h3>
                                <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">Welfare Officer Control Registry</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 max-w-2xl justify-end">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" />
                                <input
                                    type="text"
                                    placeholder="Search registry..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border-2 border-black/5 focus:border-[#E8820C] rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold outline-none transition-all shadow-sm"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-white border-2 border-black/5 focus:border-[#E8820C] rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-sm cursor-pointer"
                            >
                                <option value="all">Global Queue</option>
                                <option value="pending">Awaiting Audit</option>
                                <option value="approved">Authorized</option>
                                <option value="declined">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-xl border border-black/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50">
                                    <tr className="border-b border-black/5">
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Protocol</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Applicant</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Classification</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black/40 text-right">Sum</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-black/40 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {officerFiltered.map((req) => {
                                        const st = statusStyles[req.status] || statusStyles.pending;
                                        return (
                                            <tr key={req.id} onClick={() => setSelectedRequest(req)} className="group hover:bg-gray-50 transition-colors cursor-pointer">
                                                <td className="px-10 py-6">
                                                    <span className="text-[11px] font-black text-black/20 font-mono tracking-tighter">#RR-W-{String(req.id).padStart(4, '0')}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-[#1A1A2E]">{req.submittedBy}</span>
                                                        <span className="text-[9px] font-bold text-black/30 uppercase truncate max-w-[120px]">{req.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">{req.type}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${st.bg} ${st.color} ${st.ring}`}>
                                                        <st.icon size={10} strokeWidth={3} /> {st.label}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-[#E8820C] text-sm">{formatNaira(req.amount)}</td>
                                                <td className="px-10 py-6 text-right text-[10px] font-bold text-black/30 uppercase tracking-tighter">{dayjs(req.date).format('DD MMM YYYY')}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {officerFiltered.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center space-y-4">
                                <Inbox size={64} className="text-black/[0.05]" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Audit registry clear</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* PUBLIC MIRROR: Transparency & Personal History */
                <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-4">
                        <div className="flex items-center gap-6 p-1 bg-gray-100 rounded-[2rem] border border-black/5 shadow-inner w-full md:w-auto">
                            <button 
                                onClick={() => setPublicTab('transparency')}
                                className={`flex-1 md:flex-none px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${publicTab === 'transparency' ? 'bg-white text-[#1A1A2E] shadow-xl' : 'text-black/30 hover:text-black/60'}`}
                            >
                                <BadgeCheck size={14} /> Transparency Site
                            </button>
                            <button 
                                onClick={() => setPublicTab('my-history')}
                                className={`flex-1 md:flex-none px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${publicTab === 'my-history' ? 'bg-white text-[#1A1A2E] shadow-xl' : 'text-black/30 hover:text-black/60'}`}
                            >
                                <History size={14} /> My Application Hub
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-[#1A1A2E]/20 text-[10px] font-black uppercase tracking-[0.3em] italic">
                            <Fingerprint size={16} /> Data Mirror Synced: {dayjs().format('HH:mm')}
                        </div>
                    </div>

                    {publicTab === 'transparency' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Transparency Ledger */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black font-serif text-[#1A1A2E]">Transparency Ledger</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Verified brotherhood disbursements public log</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {publicTransparency.map((req, i) => (
                                        <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 hover:border-[#E8820C]/30 transition-all flex items-center justify-between shadow-sm group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:rotate-6 transition-transform">
                                                    <BadgeCheck size={28} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Authorized Aid</p>
                                                    <h5 className="text-lg font-black text-[#1A1A2E]">{req.submittedBy}</h5>
                                                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-1">{req.type} Support • {dayjs(req.date).format('DD MMM YYYY')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: "'Playfair Display', serif" }}>{formatNaira(req.amount)}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-black/20 mt-1">Transaction Verified</p>
                                            </div>
                                        </div>
                                    ))}
                                    {publicTransparency.length === 0 && (
                                        <div className="py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-black/5 flex flex-col items-center justify-center gap-4">
                                            <ShieldAlert size={48} className="text-black/5" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-black/20">No public disbursements recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Aggregated Site Stats */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-gradient-to-br from-[#1A1A2E] to-black p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-[#E8820C]/20 transition-all duration-700">
                                        <TrendingUp size={120} />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F5A623] mb-8">Registry Insights</h4>
                                    
                                    <div className="space-y-8 relative z-10">
                                        <div className="flex justify-between items-end border-b border-white/10 pb-6">
                                            <div>
                                                <p className="text-3xl font-black">{requests.filter(r => r.status === 'approved').length}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Successful Interventions</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-black text-[#E8820C]">98%</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Fulfillment Rate</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Top Allocation Domains</p>
                                            <div className="space-y-4">
                                                {['Medical', 'Emergency'].map((type, i) => {
                                                    const count = requests.filter(r => r.type === type).length;
                                                    const pct = requests.length ? (count / requests.length) * 100 : 0;
                                                    return (
                                                        <div key={type} className="space-y-2">
                                                            <div className="flex justify-between text-[10px] font-bold">
                                                                <span>{type}</span>
                                                                <span className="text-[#E8820C]">{Math.round(pct)}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-[#E8820C] rounded-full" style={{ width: `${pct}%` }}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-10 rounded-[3rem] border border-amber-100 space-y-6">
                                    <div className="flex items-center gap-4 text-amber-600">
                                        <ShieldAlert size={24} />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Welfare Charter</h4>
                                    </div>
                                    <p className="text-[11px] font-bold text-amber-900/60 leading-relaxed italic">
                                        "Applications are processed with maximum confidentiality. The transparency site only reflects authorized aid to maintain institutional integrity."
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* MY HISTORY: Personal Records */
                        <div className="space-y-8 max-w-5xl">
                            <div className="space-y-2 px-4">
                                <h4 className="text-xl font-black font-serif text-[#1A1A2E]">My Application Hub</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Personal record of welfare engagements</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {myHistory.map((req) => {
                                    const st = statusStyles[req.status] || statusStyles.pending;
                                    return (
                                        <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-white p-8 rounded-[3rem] border border-black/5 hover:border-[#1A1A2E]/20 transition-all shadow-sm cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-[1.5in] flex items-center justify-center transition-all group-hover:rotate-6 ${st.bg} ${st.color} border ${st.ring}`}>
                                                    <st.icon size={32} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${st.bg} ${st.color} ${st.ring}`}>
                                                            {st.label}
                                                        </span>
                                                        <span className="text-[10px] font-black text-black/20 font-mono">#REQ-{req.id}</span>
                                                    </div>
                                                    <h5 className="text-xl font-black text-[#1A1A2E]">{req.type} Support</h5>
                                                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-1 italic leading-relaxed line-clamp-1">{req.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-black/5 pt-6 md:pt-0">
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-[#E8820C]" style={{ fontFamily: "'Playfair Display', serif" }}>{formatNaira(req.amount)}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/20 mt-1">{dayjs(req.date).format('DD MMM YYYY')}</p>
                                                </div>
                                                <ArrowRight size={24} className="text-black/10 group-hover:text-[#1A1A2E] transition-colors group-hover:translate-x-2 transition-transform" />
                                            </div>
                                        </div>
                                    );
                                })}
                                {myHistory.length === 0 && (
                                    <div className="py-32 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-black/5 flex flex-col items-center justify-center gap-6 text-center">
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl text-black/5">
                                            <Plus size={48} strokeWidth={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-lg font-black text-[#1A1A2E]">No Active Engagements</p>
                                            <p className="text-xs text-black/30 max-w-xs mx-auto">Initialize a new application if you require brotherhood support in any specialized domain.</p>
                                        </div>
                                        <button 
                                            onClick={() => setShowForm(true)}
                                            className="px-10 py-4 bg-[#1A1A2E] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                                        >
                                            Apply Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Application Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => !actionLoading && setShowForm(false)} />
                    <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 sm:p-12 shadow-[0_0_150px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 slide-in-from-bottom-12 duration-700">
                        <div className="flex items-center justify-between mb-12 sticky top-0 bg-white z-10 py-2">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-serif font-black text-[#1A1A2E]">Initialize Support</h3>
                                <p className="text-[10px] text-[#E8820C] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                    <ClipboardCheck size={14} /> Official Application Tunnel
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-4 bg-gray-50 rounded-2xl text-black/20 hover:text-red-500 transition-all hover:rotate-90">
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Classification Domain</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 focus:bg-white rounded-2xl px-6 py-5 text-sm font-bold outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        {requestCategories.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Capital Required (₦)</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-black/20 text-lg">₦</span>
                                        <input
                                            required
                                            type="number"
                                            min="100"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 focus:bg-white rounded-2xl pl-12 pr-6 py-5 text-lg font-black outline-none transition-all shadow-inner"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Circumstantial Narrative</label>
                                <textarea
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 focus:bg-white rounded-[2.5rem] px-8 py-8 text-sm font-bold outline-none transition-all resize-none leading-relaxed shadow-inner"
                                    rows={5}
                                    placeholder="Briefly state the necessity and intended use of funds..."
                                />
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-6 rounded-[2.5rem] bg-[#1A1A2E] text-white text-[12px] font-black uppercase tracking-[0.6em] shadow-[0_30px_70px_rgba(26,26,46,0.3)] hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                                >
                                    {actionLoading ? <Loader2 size={24} className="animate-spin text-[#F5A623]" /> : <ShieldAlert size={24} className="text-[#E8820C] group-hover:rotate-12 transition-transform" />}
                                    {actionLoading ? 'Encrypting Registry...' : 'Submit Case to Audit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Audit Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => !actionLoading && setSelectedRequest(null)} />
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-10 md:p-16 shadow-[0_0_200px_rgba(0,0,0,0.6)] border border-white/10 relative animate-in zoom-in-95 slide-in-from-bottom-12 duration-700">
                        <div className="flex items-center justify-between mb-12 sticky top-0 bg-white z-10 py-2">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-serif font-black text-[#1A1A2E]">Case Audit</h3>
                                <p className="text-[10px] text-black/30 font-black tracking-[0.4em] flex items-center gap-2 uppercase">
                                    <ClipboardCheck size={14} className="text-[#E8820C]" /> Protocol #RR-W-{String(selectedRequest.id).padStart(4, '0')}
                                </p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-4 bg-gray-50 rounded-2xl text-black/20 hover:text-black transition-all hover:rotate-90">
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-black/5 space-y-6 shadow-inner">
                                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Biological Identification</p>
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-[#1A1A2E] rounded-[1.5rem] flex items-center justify-center text-[#F5A623] text-xl font-serif italic shadow-xl">
                                            {selectedRequest.submittedBy.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-[#1A1A2E]">{selectedRequest.submittedBy}</p>
                                            <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest mt-1">Official Member</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-xl border-2 ${statusStyles[selectedRequest.status]?.bg || 'bg-gray-50'} ${statusStyles[selectedRequest.status]?.ring || 'border-black/5'}`}>
                                    <div className={`mb-3 ${statusStyles[selectedRequest.status]?.color}`}>
                                        {(() => {
                                            const Icon = statusStyles[selectedRequest.status]?.icon || Clock;
                                            return <Icon size={40} strokeWidth={3} />;
                                        })()}
                                    </div>
                                    <p className={`text-xs font-black uppercase tracking-widest ${statusStyles[selectedRequest.status]?.color}`}>
                                        {statusStyles[selectedRequest.status]?.label || 'Pending Audit'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] ml-2">Request Parameters</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-black/5">
                                        <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mb-1">Domain</p>
                                        <p className="text-sm font-black text-[#1A1A2E]">{selectedRequest.type}</p>
                                    </div>
                                    <div className="p-6 bg-[#1A1A2E] rounded-2xl text-white shadow-xl">
                                        <p className="text-[9px] font-black text-[#F5A623] uppercase tracking-widest mb-1">Authorization Sum</p>
                                        <p className="text-xl font-black">{formatNaira(selectedRequest.amount)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-10 rounded-[3rem] border-2 border-dashed border-black/10 space-y-4">
                                <h4 className="text-[10px] font-black text-black/30 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={16} className="text-[#E8820C]" /> Verified Narrative
                                </h4>
                                <p className="text-[14px] md:text-lg font-serif italic text-black/70 leading-relaxed">
                                    "{selectedRequest.description}"
                                </p>

                            </div>

                            {activeSite === 'officer' && selectedRequest.status === 'pending' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500 pt-6 border-t border-black/5">
                                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                                        <ShieldAlert size={18} /> Audit Action Protocol
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                                            disabled={actionLoading}
                                            className="py-6 bg-emerald-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:bg-emerald-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <BadgeCheck size={20} />}
                                            Authorize Aid
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedRequest.id, 'declined')}
                                            disabled={actionLoading}
                                            className="py-6 bg-red-600 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={20} />}
                                            Decline Case
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-6 pt-6 border-t border-black/5">
                                <button className="flex-1 py-5 border-2 border-[#1A1A2E] text-[#1A1A2E] rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-95">
                                    <Printer size={18} /> Print Audit File
                                </button>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="flex-1 py-5 bg-gray-100 text-black/40 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Close Portal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fiscal Report Modal */}
            {showReport && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/95 backdrop-blur-3xl animate-in fade-in duration-300" onClick={() => setShowReport(false)} />
                    <div className="bg-white rounded-[4rem] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_300px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-500 border-8 border-white">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-[#1A1A2E] text-white">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#F5A623] border border-white/10">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black font-serif">Executive Financial Registry</h3>
                                    <p className="text-[10px] text-[#F5A623] uppercase tracking-[0.4em] font-black flex items-center gap-2 mt-1">
                                        <BadgeCheck size={14} /> Official Audited Ledger Output
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handlePrint} className="bg-[#E8820C] text-white text-[11px] font-black uppercase tracking-[0.3em] px-10 py-5 rounded-[1.5rem] hover:bg-[#F5A623] transition-all shadow-2xl flex items-center gap-3">
                                    <Download size={18} /> Commit to PDF
                                </button>
                                <button onClick={() => setShowReport(false)} className="p-5 text-white/20 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5">
                                    <X size={28} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 bg-gray-50 flex justify-center">
                            <div className="shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-xl overflow-hidden border-[12px] border-white bg-white scale-90 origin-top">
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
            
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.4); }
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
