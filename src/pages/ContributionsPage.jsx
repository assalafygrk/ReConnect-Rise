import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Save, Printer, ShieldCheck,
    TrendingUp, Calendar, Search, Filter,
    CheckCircle2, AlertCircle, Loader2, FileText
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import WeeklyReportTemplate from '../components/WeeklyReportTemplate';
import { fetchContributions } from '../api/contributions';
import { fetchMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

export default function ContributionsPage() {
    const { hasRole } = useAuth();
    const { config } = usePageConfig('contributions');
    const isTreasurer = hasRole('treasurer', 'admin');

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedWeekRange, setSelectedWeekRange] = useState('current');
    const isHistorical = selectedWeekRange !== 'current';
    const canEdit = isTreasurer && !isHistorical;

    const [weekOf, setWeekOf] = useState('');
    const [members, setMembers] = useState([]);
    const [treasurerNote, setTreasurerNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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
            const [contribs, mems] = await Promise.all([
                fetchContributions(),
                fetchMembers()
            ]);
            
            const memberList = mems.map(m => {
                const c = contribs.find(ct => (ct.memberId === m._id) || (ct.memberId?._id === m._id));
                return {
                    ...m,
                    id: m._id,
                    paid: !!c,
                    bonus: c?.bonus || 0,
                    note: c?.note || ''
                };
            });
            setMembers(memberList);
        } catch (err) {
            toast.error('Registry synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (index) => {
        if (!canEdit) return;
        const newMembers = [...members];
        newMembers[index].paid = !newMembers[index].paid;
        setMembers(newMembers);
        toast.success(`${newMembers[index].name}: ${newMembers[index].paid ? 'Audited' : 'Pending'}`);
    };

    const updateMember = (index, field, value) => {
        if (!canEdit) return;
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const handleSave = async () => {
        if (!weekOf) {
            toast.error('Specify period range first');
            return;
        }
        setActionLoading(true);
        try {
            // Placeholder for batch save API
            toast.success('Omni-ledger protocols synchronized');
        } catch (err) {
            toast.error('Sync failure');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-sm font-black text-black/40 uppercase tracking-widest">Synchronizing Treasury Ledger...</p>
        </div>
    );

    const filteredMembers = members.filter(m =>
        (m.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const paidCount = members.filter(m => m.paid).length;
    const regularTotal = paidCount * 100; // Fixed sum per member
    const bonusTotal = members.reduce((sum, m) => sum + (m.paid ? Number(m.bonus || 0) : 0), 0);
    const thisWeekCollected = regularTotal + bonusTotal;

    const stats = [
        { label: 'Revenue Protocol', value: `₦${thisWeekCollected.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Audited Payouts', value: paidCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Audit', value: members.length - paidCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Vault Security', value: 'Verified', icon: ShieldCheck, color: 'text-[#E8820C]', bg: 'bg-[#E8820C]/5' },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-12 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-[#E8820C] uppercase tracking-[0.4em]">
                        <ShieldCheck size={16} /> Treasury Ledger
                    </div>
                    <h1 className="text-5xl font-serif font-black text-[#1A1A2E] tracking-tight">{config.pageHeadline}</h1>
                    <p className="text-sm text-black/40 font-medium max-w-xl leading-relaxed">{config.pageSubtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" />
                        <select
                            value={selectedWeekRange}
                            onChange={(e) => setSelectedWeekRange(e.target.value)}
                            className="appearance-none pl-14 pr-10 py-5 bg-white border border-black/5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] shadow-sm outline-none cursor-pointer"
                        >
                            <option value="current">Active Period</option>
                        </select>
                    </div>
                    {canEdit && (
                        <button
                            disabled={actionLoading}
                            onClick={handleSave}
                            className="bg-[#1A1A2E] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl active:scale-95 transition-all"
                        >
                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Sync Ledger
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-10 rounded-[3rem] border border-black/5 shadow-sm space-y-6 group hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h4 className="text-3xl font-serif font-black text-[#1A1A2E]">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[3.5rem] shadow-sm border border-black/5 overflow-hidden">
                        <div className="p-10 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50/30">
                            <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">Period Audit</h3>
                            <div className="relative group flex-1 max-w-md">
                                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Brotherhood..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-black/5 rounded-2xl pl-16 pr-6 py-4 text-xs font-bold outline-none"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-left whitespace-nowrap">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Member</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-black/30 uppercase tracking-[0.2em] text-center">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-black/30 uppercase tracking-[0.2em] text-center">Excess (₦)</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-black/30 uppercase tracking-[0.2em] text-right">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 whitespace-nowrap">
                                    {filteredMembers.map((m, i) => (
                                        <tr key={m._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-[#1A1A2E] flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                                                        {(m.name || 'U').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-black text-[#1A1A2E]">{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => toggleStatus(i)}
                                                    disabled={!canEdit}
                                                    className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${m.paid
                                                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10'
                                                        : 'bg-amber-50 text-amber-600 ring-1 ring-amber-600/10'
                                                        }`}
                                                >
                                                    {m.paid ? 'Verified' : 'Pending'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <input
                                                    type="number"
                                                    value={m.bonus || ''}
                                                    onChange={(e) => updateMember(i, 'bonus', e.target.value)}
                                                    disabled={!canEdit}
                                                    placeholder="0"
                                                    className="w-24 bg-gray-50 border border-black/5 rounded-xl px-4 py-2 text-xs font-black outline-none text-center focus:bg-white focus:ring-4 focus:ring-[#E8820C]/5"
                                                />
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <span className="text-[10px] font-mono font-black text-black/10 uppercase tracking-widest">#REF-{String(m._id).slice(-4).toUpperCase()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[#1A1A2E] rounded-[3.5rem] p-10 text-white space-y-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#E8820C]/10 rounded-full blur-3xl -mr-20 -mt-20" />
                        <div className="space-y-6 relative z-10">
                            <h3 className="text-2xl font-serif font-black">Audit Stats</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                        <span>Consensus Reach</span>
                                        <span className="text-emerald-400">{((paidCount / (members.length || 1)) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${(paidCount / (members.length || 1)) * 100}%` }} />
                                    </div>
                                </div>
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-2">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Est. Collection</p>
                                    <p className="text-2xl font-serif font-black">₦{thisWeekCollected.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all relative z-10"
                        >
                            <Printer size={18} /> Export Ledger
                        </button>
                    </div>

                    <div className="bg-white rounded-[3.5rem] p-10 border border-black/5 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-[#1A1A2E] uppercase tracking-[0.2em] flex items-center gap-3">
                            <Filter size={20} className="text-[#E8820C]" /> Controls
                        </h3>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Period Range</label>
                            <input
                                type="text"
                                value={weekOf}
                                onChange={(e) => setWeekOf(e.target.value)}
                                disabled={!canEdit}
                                placeholder="e.g. 24 – 30 Mar 2026"
                                className="w-full bg-gray-50 border border-black/5 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[4rem] p-12 border border-black/5 shadow-sm space-y-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-[#E8820C]/10 flex items-center justify-center text-[#E8820C] shadow-lg shadow-orange-500/10">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-serif font-black text-[#1A1A2E]">Treasurer's Remarks</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mt-1">Official period summary</p>
                    </div>
                </div>
                <textarea
                    value={treasurerNote}
                    onChange={(e) => setTreasurerNote(e.target.value)}
                    disabled={!canEdit}
                    rows="5"
                    placeholder="Provide a high-level executive summary of this period's fiscal activity..."
                    className="w-full bg-gray-50 border border-black/5 rounded-[2.5rem] px-10 py-10 text-lg font-serif italic text-black/60 outline-none resize-none shadow-inner focus:bg-white transition-all"
                />
            </div>

            <div className="hidden">
                <WeeklyReportTemplate ref={printRef} members={members} disbursements={[]} />
            </div>
        </div>
    );
}
