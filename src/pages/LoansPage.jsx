import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus, X, CreditCard, FileText, Printer,
    CheckSquare, Square, ShieldCheck, History,
    Clock, Search,
    Download, Loader2, TrendingUp,
    BadgeCheck, AlertTriangle,
    UserCheck, Wallet, Fingerprint, Compass
} from 'lucide-react';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import TransactionReceipt from '../components/TransactionReceipt';
import { fetchLoans, addLoan, recordRepayment } from '../api/loans';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

import { fetchDashboard } from '../api/dashboard';

export default function LoansPage() {
    const { hasRole, ROLES, user } = useAuth();
    const { config } = usePageConfig('loans');
    const isTreasurer = hasRole(ROLES.TREASURER, ROLES.ADMIN);
    const isLeader = hasRole(ROLES.GROUP_LEADER, ROLES.ADMIN);
    const isMemberOnly = !isTreasurer && !isLeader && config.loansEnabled;

    const [loans, setLoans] = useState([]);
    const [vaultBalance, setVaultBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showRepayForm, setShowRepayForm] = useState(false);
    const [repayAmt, setRepayAmt] = useState('');
    const [form, setForm] = useState({ member: user?.name || '', amount: '', plan: '' });
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [leaderChecks, setLeaderChecks] = useState({
        amountVerified: false,
        repaymentPlanVerified: false,
        memberStandingVerified: false
    });

    const printRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `RR_Audit_Loan_${selectedLoan?._id || ''}`,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [loansData, dashboardData] = await Promise.all([
                fetchLoans(),
                fetchDashboard()
            ]);
            setLoans(loansData);
            setVaultBalance(dashboardData.stats.loanFundBalance + dashboardData.stats.welfareBalance);
        } catch (err) {
            toast.error('Failed to load loan registry');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const data = await addLoan(form);
            setLoans((prev) => [data, ...prev]);
            toast.success('Loan application committed to registry');
            setShowForm(false);
            setForm({ member: user?.name || '', amount: '', plan: '' });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproval = async (id, newStatus) => {
        setActionLoading(true);
        try {
            // This should call an updateLoanStatus API if we had one, 
            // for now let's assume updateRequestStatus or similar or just toast
            toast.error('Approval endpoint not yet fully rewired in backend for Loans');
        } catch (err) {
            toast.error('Audit update failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRepaySubmission = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const updatedLoan = await recordRepayment(selectedLoan._id, Number(repayAmt));
            setLoans((prev) => prev.map((l) => l._id === updatedLoan._id ? updatedLoan : l));
            toast.success('Repayment formalized successfully');
            setShowRepayForm(false);
            setRepayAmt('');
            setSelectedLoan(null);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest text-center px-4">Accessing Loan Registry...</p>
        </div>
    );

    const filteredLoans = loans.filter(l => {
        const matchesSearch = (l.member || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || l.status === filterStatus;
        const matchesRole = isTreasurer || isLeader || l.member === user?.name || l.user === user?._id;
        return matchesSearch && matchesFilter && matchesRole;
    });

    const totalLoaned = loans.filter(l => l.status !== 'declined').reduce((sum, l) => sum + (l.amount || 0), 0);
    const activeBalance = loans.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.balance || 0), 0);

    const stats = [
        { label: 'Total Loaned', value: totalLoaned, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Outstanding', value: activeBalance, icon: Wallet, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Pending Audit', value: loans.filter(l => (l.status || '').startsWith('pending')).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', isMoney: false },
        { label: 'Vault Ready', value: vaultBalance, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'repaid': return 'bg-emerald-50 text-emerald-600 ring-emerald-600/10';
            case 'active': return 'bg-blue-50 text-blue-600 ring-blue-600/10';
            case 'pending_leader':
            case 'pending_treasurer': return 'bg-amber-50 text-amber-600 ring-amber-600/10';
            case 'declined': return 'bg-red-50 text-red-600 ring-red-600/10';
            default: return 'bg-gray-50 text-gray-600 ring-gray-600/10';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A2E] p-10 text-white shadow-2xl border border-white/5">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none bg-[#E8820C]" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-widest">
                            <Compass size={12} /> Credit & Reliability
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
                            onClick={() => setShowForm(true)}
                            className="bg-[#E8820C] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-[#E8820C]/20"
                        >
                            <Plus size={14} /> {isTreasurer ? 'New Registry Entry' : 'Request Loan'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon size={20} />
                            </div>
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
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-left border-b border-black/5 whitespace-nowrap">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Entry Ref</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Borrower</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Loan Amount</th>
                                <th className="px-6 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Balance</th>
                                <th className="px-8 py-5 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Execute Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 whitespace-nowrap">
                            {filteredLoans.map((loan) => (
                                <tr
                                    key={loan._id}
                                    onClick={() => setSelectedLoan(loan)}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center text-[#1A1A2E] group-hover:bg-[#1A1A2E] group-hover:text-white transition-all">
                                                <History size={14} />
                                            </div>
                                            <span className="text-xs font-mono font-bold text-black/40">#LON-{String(loan._id).slice(-4)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-[#1A1A2E]">{loan.member}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${getStatusStyle(loan.status)}`}>
                                            {loan.status.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right font-bold text-black/40 text-xs">
                                        {formatNaira(loan.amount)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`text-sm font-black ${(loan.balance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {formatNaira(loan.balance)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-bold text-black/30 text-xs">
                                        {dayjs(loan.createdAt).format('DD MMM YYYY')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowForm(false)} />
                    <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-1">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]">{isTreasurer ? 'New Loan Registry' : 'Apply for Credit'}</h3>
                                <p className="text-xs text-black/30 font-medium tracking-wide flex items-center gap-1.5 uppercase">
                                    <CreditCard size={12} className="text-[#E8820C]" /> Formal Registry Entry
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Borrower/Member</label>
                                    <input
                                        required
                                        disabled={isMemberOnly}
                                        value={form.member}
                                        onChange={(e) => setForm({ ...form, member: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all disabled:opacity-50"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Principal Amount</label>
                                    <input
                                        required
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all"
                                        placeholder="Min: 1000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Repayment Plan</label>
                                <textarea
                                    required
                                    value={form.plan}
                                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-[2rem] px-6 py-5 text-xs font-bold outline-none transition-all resize-none leading-relaxed"
                                    rows={3}
                                    placeholder="Detail how you will repay..."
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-[#1A1A2E] shadow-xl shadow-[#1A1A2E]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                    Commit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => { setSelectedLoan(null); setShowRepayForm(false); }} />
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-1">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]">Financial Audit</h3>
                                <p className="text-xs text-black/30 font-medium tracking-wide flex items-center gap-1.5 uppercase">
                                    <History size={12} className="text-blue-500" /> Reference #LON-{String(selectedLoan._id).slice(-4)}
                                </p>
                            </div>
                            <button onClick={() => { setSelectedLoan(null); setShowRepayForm(false); }} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-gray-50 p-6 rounded-[2rem] border border-black/[0.03] space-y-4">
                                <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Registry Metadata</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-black/40">Status:</span>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${getStatusStyle(selectedLoan.status)}`}>
                                            {selectedLoan.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-black/40">Borrower:</span>
                                        <span className="text-xs font-black text-[#1A1A2E]">{selectedLoan.member}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#1A1A2E] p-6 rounded-[2rem] text-white flex flex-col justify-center items-center text-center space-y-2 relative overflow-hidden">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Outstanding Balance</p>
                                <h2 className="text-3xl font-serif font-black">{formatNaira(selectedLoan.balance)}</h2>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Principal: {formatNaira(selectedLoan.amount)}</p>
                            </div>
                        </div>

                        {showRepayForm ? (
                            <form onSubmit={handleRepaySubmission} className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 space-y-4 mb-4 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-800/20 text-xs">₦</span>
                                    <input
                                        required
                                        type="number"
                                        value={repayAmt}
                                        onChange={(e) => setRepayAmt(e.target.value)}
                                        className="w-full bg-white border-2 border-emerald-200 focus:border-emerald-500 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold outline-none transition-all shadow-inner"
                                        placeholder="Enter amount repaid"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                    Formalize Payment
                                </button>
                            </form>
                        ) : selectedLoan.status === 'active' && (isTreasurer || isLeader) ? (
                            <button
                                onClick={() => setShowRepayForm(true)}
                                className="w-full py-5 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#1A1A2E]/20 flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 mb-4"
                            >
                                <CreditCard size={16} /> Record Repayment
                            </button>
                        ) : null}

                        <div className="flex gap-4 pt-4 border-t border-black/5">
                            <button
                                onClick={() => { setSelectedLoan(null); setShowRepayForm(false); }}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Close Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
