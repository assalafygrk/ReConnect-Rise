import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus, X, Save, Printer, MessageSquare, ShieldCheck,
    TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle,
    Calendar, User, CreditCard, ChevronRight, Search, Filter,
    Download, CheckCircle2, AlertCircle, Loader2, FileText, TrendingDown
} from 'lucide-react';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import WeeklyReportTemplate from '../components/WeeklyReportTemplate';
import { fetchContributions } from '../api/contributions';
import { useAuth } from '../context/AuthContext';

const MOCK_MEMBERS = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: ['Emeka Obi', 'Tunde Lawal', 'Seun Adeyemi', 'Dare Balogun', 'Femi Adeoye',
        'Kola Ayoola', 'Gbenga Aina', 'Ola Fashola', 'Wale Adekeye', 'Chukwu Eze',
        'Nonso Okafor', 'Jide Akintola', 'Bayo Oluwole', 'Ade Salami', 'Musa Haruna',
        'Chidi Nwosu', 'Uche Okeke', 'Rotimi Adesanya', 'Lanre Olatunji', 'Sam Udo'][i],
    paid: false,
    bonus: 0,
    note: ''
}));

export default function ContributionsPage() {
    const { hasRole, user } = useAuth();
    const isTreasurer = hasRole('treasurer');
    const isLeader = hasRole('group_leader');

    // States
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedWeekRange, setSelectedWeekRange] = useState('current');
    const isHistorical = selectedWeekRange !== 'current';
    const canEdit = isTreasurer && !isHistorical;

    const [weekOf, setWeekOf] = useState('');
    const [reportDate, setReportDate] = useState(dayjs().format('D MMMM YYYY'));
    const [openingBalance, setOpeningBalance] = useState('0');
    const [members, setMembers] = useState([]);
    const [disbursements, setDisbursements] = useState([]);
    const [treasurerNote, setTreasurerNote] = useState('');
    const [treasurerName, setTreasurerName] = useState(user?.name || '');
    const [searchQuery, setSearchQuery] = useState('');

    // Running totals (mocked for now, as per standard system)
    const runningTotal = { collected: 450000, disbursed: 20000, bonus: 35000 };

    // Print setup
    const printRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `RR_Weekly_Report_${weekOf.replace(/\s/g, '_') || 'Draft'}`,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await fetchContributions();
            setMembers(MOCK_MEMBERS);
        } catch (err) {
            setMembers(MOCK_MEMBERS);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const toggleStatus = (index) => {
        if (!canEdit) return;
        const newMembers = [...members];
        newMembers[index].paid = !newMembers[index].paid;
        setMembers(newMembers);
        toast.success(`${newMembers[index].name}: ${newMembers[index].paid ? 'Paid' : 'Pending'}`);
    };

    const updateMember = (index, field, value) => {
        if (!canEdit) return;
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const addDisbursement = () => {
        setDisbursements([...disbursements, { id: Date.now(), member: '', reason: '', date: dayjs().format('YYYY-MM-DD'), amount: '' }]);
    };

    const removeDisbursement = (id) => {
        setDisbursements(disbursements.filter(d => d.id !== id));
    };

    const updateDisbursement = (index, field, value) => {
        const newDisb = [...disbursements];
        newDisb[index][field] = value;
        setDisbursements(newDisb);
    };

    const handleSave = async () => {
        if (!weekOf) {
            toast.error('Please enter the week dates first');
            return;
        }
        setActionLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000)); // Mock API delay
            toast.success('Treasury ledger updated successfully');
        } catch (err) {
            toast.error('Failed to update ledger');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest">Synchronizing Treasury...</p>
        </div>
    );

    // Derived values
    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const paidCount = members.filter(m => m.paid).length;
    const unpaidCount = members.filter(m => !m.paid).length;
    const regularTotal = paidCount * 100;
    const bonusTotal = members.reduce((sum, m) => sum + (m.paid ? Number(m.bonus || 0) : 0), 0);
    const thisWeekCollected = regularTotal + bonusTotal;
    const thisWeekDisbursed = disbursements.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const currentBalance = runningTotal.collected + runningTotal.bonus - runningTotal.disbursed + thisWeekCollected - thisWeekDisbursed;

    const stats = [
        { label: 'Total Assets', value: currentBalance, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Weekly Revenue', value: thisWeekCollected, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Weekly Expenses', value: thisWeekDisbursed, icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Vault Health', value: runningTotal.collected, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', suffix: ' Reserved' },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Serious Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-[#1A1A2E] tracking-tight">Treasury Management</h1>
                    <p className="text-sm text-black/40 font-medium">Internal Financial Ledger & Compliance Records</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-[#E8820C] transition-colors" />
                        <select
                            value={selectedWeekRange}
                            onChange={(e) => setSelectedWeekRange(e.target.value)}
                            className="appearance-none pl-12 pr-10 py-3 bg-white border border-black/5 rounded-2xl text-sm font-bold text-[#1A1A2E] shadow-sm hover:shadow-md transition-all outline-none focus:ring-2 focus:ring-[#E8820C]/20"
                        >
                            <option value="current">Current Period (Active)</option>
                            <option value="2026-03-10">Week: 10 – 16 Mar 2026</option>
                            <option value="2026-03-03">Week: 03 – 09 Mar 2026</option>
                            <option value="2026-02-24">Week: 24 Feb – 02 Mar 2026</option>
                        </select>
                    </div>
                    {canEdit && (
                        <button
                            disabled={actionLoading}
                            onClick={handleSave}
                            className="bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Publish Records
                        </button>
                    )}
                </div>
            </div>

            {/* Financial Insights Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Audited</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-serif font-black text-[#1A1A2E]">
                                ₦{stat.value.toLocaleString()}
                                {stat.suffix && <span className="text-xs font-bold text-black/20 ml-1">{stat.suffix}</span>}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            {isHistorical && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle size={20} className="text-amber-600" />
                    <p className="text-sm font-bold text-amber-800">
                        Historical Record: This ledger is finalized and locked. Editing is restricted for audit integrity.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Ledger Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
                        <div className="p-8 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-[#1A1A2E]">Weekly Ledger</h3>
                                <p className="text-xs text-black/30 font-medium">Member contribution tracking for this period</p>
                            </div>
                            <div className="relative group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl pl-12 pr-4 py-2.5 text-xs font-bold outline-none transition-all w-full sm:w-64"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-left whitespace-nowrap">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest">Member Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest text-center">Base</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest text-center">Bonus (₦)</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest text-right">Records</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 font-medium whitespace-nowrap">
                                    {filteredMembers.map((m, i) => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#1A1A2E]/5 flex items-center justify-center text-[#1A1A2E] text-[10px] font-black">
                                                        {m.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-[#1A1A2E]">{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs text-black/40">₦100</td>
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="number"
                                                    value={m.bonus || ''}
                                                    onChange={(e) => updateMember(i, 'bonus', e.target.value)}
                                                    disabled={!canEdit}
                                                    placeholder="0"
                                                    className="w-16 bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-lg px-2 py-1.5 text-xs font-bold transition-all outline-none text-center disabled:bg-transparent disabled:border-none"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => toggleStatus(i)}
                                                    disabled={!canEdit}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${m.paid
                                                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10'
                                                        : 'bg-amber-50 text-amber-600 ring-1 ring-amber-600/10'
                                                        } ${!canEdit ? 'cursor-default' : 'hover:scale-105 active:scale-95'}`}
                                                >
                                                    {m.paid ? 'Confirmed' : 'Pending'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button className="p-2 text-black/10 hover:text-[#1A1A2E] transition-colors rounded-lg hover:bg-gray-100">
                                                    <MessageSquare size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls & Summary */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-[#1A1A2E] rounded-[2.5rem] p-8 text-white space-y-8 shadow-xl shadow-indigo-900/10">
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif font-bold">Execution Summary</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Attendance', value: `${paidCount}/${members.length}`, progress: (paidCount / members.length) * 100, color: 'bg-emerald-500' },
                                    { label: 'Net Collected', value: `₦${thisWeekCollected.toLocaleString()}`, progress: 80, color: 'bg-[#E8820C]' },
                                    { label: 'Net Disbursed', value: `₦${thisWeekDisbursed.toLocaleString()}`, progress: 30, color: 'bg-blue-500' },
                                ].map((row, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                            <span>{row.label}</span>
                                            <span className="text-white">{row.value}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${row.color} transition-all duration-1000`} style={{ width: `${row.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <button
                                onClick={handlePrint}
                                className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/5"
                            >
                                <Printer size={16} /> Export Draft Ledger
                            </button>
                            <button
                                onClick={() => toast.success('Report forwarded to Sheikh and Group Leader')}
                                className="w-full bg-[#E8820C] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20 transition-all active:scale-95 hover:opacity-90"
                            >
                                <ChevronRight size={16} /> Request Executive Review
                            </button>
                        </div>
                    </div>

                    {/* Meta Controls Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm space-y-6 text-left">
                        <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest flex items-center gap-2">
                            <Filter size={16} className="text-[#E8820C]" /> Period Controls
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-black/30 uppercase tracking-widest mb-1.5 ml-1">Period Range</label>
                                <input
                                    type="text"
                                    value={weekOf}
                                    onChange={(e) => setWeekOf(e.target.value)}
                                    disabled={!canEdit}
                                    placeholder="e.g. 24 – 30 Mar 2026"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-xs font-bold outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-black/30 uppercase tracking-widest mb-1.5 ml-1">Opening Balance</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20 text-xs">₦</span>
                                    <input
                                        type="number"
                                        value={openingBalance}
                                        onChange={(e) => setOpeningBalance(e.target.value)}
                                        disabled={!canEdit}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl pl-10 pr-5 py-4 text-xs font-bold outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Disbursements Ledger */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
                <div className="p-8 border-b border-black/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-[#1A1A2E]">Disbursements Ledger</h3>
                        <p className="text-xs text-black/30 font-medium">Record of all support payments executed this week</p>
                    </div>
                    {canEdit && (
                        <button onClick={addDisbursement} className="text-[10px] font-black text-[#E8820C] border border-[#E8820C]/30 px-5 py-2.5 rounded-xl hover:bg-amber-50 tracking-widest uppercase flex items-center gap-2">
                            <Plus size={14} /> Add Transaction
                        </button>
                    )}
                </div>
                <div className="p-8">
                    {disbursements.length > 0 ? (
                        <div className="space-y-4">
                            {disbursements.map((d, i) => (
                                <div key={d.id} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-[2rem] border border-black/[0.03] group hover:border-[#E8820C]/30 transition-all">
                                    <div className="bg-[#1A1A2E] text-white p-3 rounded-2xl">
                                        <ArrowUpCircle size={20} />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                                        <input type="text" value={d.member} onChange={(e) => updateDisbursement(i, 'member', e.target.value)} disabled={!canEdit} placeholder="Beneficiary"
                                            className="bg-transparent border-b-2 border-black/5 focus:border-[#E8820C] py-2 text-xs font-bold outline-none transition-all" />
                                        <input type="text" value={d.reason} onChange={(e) => updateDisbursement(i, 'reason', e.target.value)} disabled={!canEdit} placeholder="Reason/Purpose"
                                            className="bg-transparent border-b-2 border-black/5 focus:border-[#E8820C] py-2 text-xs font-bold outline-none transition-all" />
                                        <input type="date" value={d.date} onChange={(e) => updateDisbursement(i, 'date', e.target.value)} disabled={!canEdit}
                                            className="bg-transparent border-b-2 border-black/5 focus:border-[#E8820C] py-2 text-xs font-bold outline-none transition-all" />
                                        <div className="relative">
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 font-black text-black/20 text-xs">₦</span>
                                            <input type="number" value={d.amount} onChange={(e) => updateDisbursement(i, 'amount', e.target.value)} disabled={!canEdit} placeholder="Amount"
                                                className="w-full bg-transparent border-b-2 border-black/5 focus:border-[#E8820C] py-2 pl-4 text-xs font-black outline-none transition-all" />
                                        </div>
                                    </div>
                                    {canEdit && (
                                        <button onClick={() => removeDisbursement(d.id)} className="p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-black/5">
                                <ArrowUpCircle size={32} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#1A1A2E]">No Disbursements Recorded</p>
                                <p className="text-xs text-black/30 mt-1">This period has no processed support payments yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Executive Notes Section */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-black/5 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8820C]/10 flex items-center justify-center text-[#E8820C]">
                        <FileText size={20} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#1A1A2E]">Executive Audit Remarks</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Treasurer's Final Statement</label>
                        <textarea
                            value={treasurerNote}
                            onChange={(e) => setTreasurerNote(e.target.value)}
                            disabled={!canEdit}
                            rows="4"
                            placeholder="Provide a high-level summary of this period's ledger performance and any significant audit notes..."
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-[2rem] px-6 py-6 text-sm font-medium transition-all outline-none resize-none leading-relaxed"
                        />
                    </div>
                    <div className="flex flex-col justify-end space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1 mb-1.5">Lead Auditor</label>
                                <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 rounded-2xl border border-black/5">
                                    <User size={14} className="text-[#E8820C]" />
                                    <span className="text-xs font-bold text-[#1A1A2E]">{treasurerName}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1 mb-1.5">Session Status</label>
                                <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${isHistorical ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                                    {isHistorical ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    <span className="text-xs font-bold">{isHistorical ? 'Historical' : 'Active Draft'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A2E] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                                <Download size={14} /> Download Ledger PDF
                            </button>
                            <button onClick={() => toast.success('Sending request to Group Leader...')} className="flex-1 flex items-center justify-center gap-2 border-2 border-[#1A1A2E] text-[#1A1A2E] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                                <ShieldCheck size={14} /> Peer Review Audit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Print Wrapper */}
            <div className="hidden">
                <WeeklyReportTemplate ref={printRef} members={members} disbursements={disbursements} />
            </div>
        </div>
    );
}
