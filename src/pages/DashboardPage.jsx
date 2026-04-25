import { useState, useEffect } from 'react';
import {
    Wallet, Users, TrendingUp, CheckCircle2,
    ArrowUpRight, ArrowDownLeft, X, Clock,
    Calendar, ShieldCheck, TrendingDown,
    Activity, ArrowUpCircle,
    Zap, Gem, BadgeCheck, Fingerprint,
    Database, ActivitySquare, ServerCrash, Crown, Landmark, CircleDollarSign, Target, BarChart3,
    Heart, TrendingUp as TrendingUpIcon
} from 'lucide-react';
import dayjs from 'dayjs';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { fetchDashboard } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

function formatNaira(amount) {
    return `₦${Number(amount || 0).toLocaleString('en-NG')}`;
}

export default function DashboardPage() {
    const { user, activeRole } = useAuth();
    const { config } = usePageConfig('dashboard');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);

    const effectiveRole = activeRole || user?.role || 'member';
    const isAdmin = effectiveRole === 'admin';
    const isTreasurer = effectiveRole === 'treasurer';
    const isGroupLeader = effectiveRole === 'groupleader';
    const isWelfare = effectiveRole === 'welfare';
    const isOfficialMember = effectiveRole === 'official-member';
    const isAdvisor = effectiveRole === 'special-advisor';
    const isOrganizer = effectiveRole === 'meeting-organizer';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const dashboardData = await fetchDashboard();
            setData(dashboardData);
        } catch (err) {
            console.error('Dashboard load failed:', err);
            // On failure, we keep data as null or set an error state
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Zap className="animate-pulse text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest px-4 text-center">Intelligence Engine Synchronizing...</p>
        </div>
    );

    // Fallback empty data structure if API fails or returns nothing
    const d = data || {
        poolBalance: 0,
        savingsGoal: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        totalMembers: 0,
        recentTransactions: [],
        monthlyChart: [],
        myStats: { totalContributions: 0, activeLoan: 0 }
    };

    const goalPct = d.savingsGoal > 0 ? Math.min(100, Math.round((d.poolBalance / d.savingsGoal) * 100)) : 0;

    const txIcon = (type) => {
        if (type === 'contribution') return <ArrowUpCircle size={16} className="text-emerald-500" />;
        return <ArrowDownLeft size={16} className="text-rose-500" />;
    };

    const Modal = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl p-6 sm:p-10 shadow-2xl relative bg-white`}>
                <div className={`flex items-center justify-between mb-8 sticky top-0 z-10 py-1 bg-white`}>
                    <h3 className={`text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]`}>{title}</h3>
                    <button onClick={onClose} className={`p-3 rounded-2xl transition-colors hover:bg-gray-100 text-black/20 hover:text-black`}>
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
            {/* Dynamic Header based on Role */}
            <div className={`relative rounded-[3rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden border group ${isAdmin ? 'bg-[#050510] border-indigo-500/20' : 'bg-[#1A1A2E] border-white/5'}`}>
                <div className={`absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000 ${isAdmin ? 'bg-indigo-600' : 'bg-[#E8820C]'}`}></div>
                <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] ${isAdmin ? 'text-indigo-400' : 'text-[#E8820C]'}`}>
                            {isAdmin ? <ShieldCheck size={14} /> : <Crown size={14} />} {isAdmin ? 'Global System Authority' : 'Member Command'}
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                {isAdmin ? 'Executive Command' : 'Strategic Overview'}
                            </h1>
                            <p className="text-lg md:text-xl font-medium text-white/50 mt-4 leading-relaxed font-serif">
                                Welcome, {user?.name?.split(' ')[0] || 'Brother'}. Tracking the collective prosperity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 relative overflow-hidden group cursor-pointer hover:border-[#E8820C]/30 transition-all shadow-xl" onClick={() => setSelectedWidget('balance')}>
                    <div className="relative z-10 space-y-5">
                        <div className="w-12 h-12 bg-[#E8820C]/10 rounded-2xl flex items-center justify-center text-[#E8820C] border border-[#E8820C]/20"><Wallet size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">Treasury Pool</p>
                            <p className="text-3xl font-serif font-black text-[#1A1A2E] tracking-tight">{formatNaira(d.poolBalance)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 relative overflow-hidden group cursor-pointer hover:border-[#E8820C]/30 transition-all shadow-xl" onClick={() => setSelectedWidget('goal')}>
                    <div className="relative z-10 space-y-5">
                        <div className="w-12 h-12 bg-[#E8820C]/10 rounded-2xl flex items-center justify-center text-[#E8820C] border border-[#E8820C]/20"><TrendingUp size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">Target Progression</p>
                            <p className="text-3xl font-serif font-black text-[#1A1A2E] tracking-tight">{goalPct}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all shadow-xl">
                    <div className="relative z-10 space-y-5">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20"><Users size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">Active Brothers</p>
                            <p className="text-3xl font-serif font-black text-[#1A1A2E] tracking-tight">{d.totalMembers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-all shadow-xl">
                    <div className="relative z-10 space-y-5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20"><Gem size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">My Contribution</p>
                            <p className="text-3xl font-serif font-black text-[#1A1A2E] tracking-tight">{formatNaira(d.myStats?.totalContributions)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-black/5 shadow-xl space-y-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Liquidity Cycle</h2>
                            <p className="text-[10px] uppercase font-black text-[#E8820C] tracking-[0.3em]">Historical Analysis</p>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={d.monthlyChart}>
                                <defs>
                                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E8820C" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#E8820C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A1A2E40' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#1A1A2E40' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="contributions" stroke="#E8820C" fill="url(#colorInflow)" strokeWidth={3} name="Total Influx" />
                                <Area type="monotone" dataKey="disbursements" stroke="#fb7185" fill="none" strokeWidth={3} name="Outflow" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-black/5 shadow-xl space-y-8 flex flex-col">
                    <div className="space-y-2 border-b border-black/5 pb-6">
                        <h2 className="text-xl font-serif font-black text-[#1A1A2E] flex items-center gap-3"><Clock size={18} className="text-[#E8820C]" /> Latest Updates</h2>
                        <p className="text-[10px] uppercase font-black text-black/20 tracking-[0.3em]">Registry Logs</p>
                    </div>
                    <div className="space-y-4 flex-1">
                        {d.recentTransactions?.length > 0 ? d.recentTransactions.slice(0, 5).map((tx) => (
                            <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group flex flex-col gap-3 p-5 rounded-[1.5rem] bg-gray-50 hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-black/5">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm`}>
                                            {txIcon(tx.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1A1A2E] tracking-tight">{tx.member}</p>
                                            <p className="text-[9px] text-black/30 font-bold uppercase tracking-widest">{tx.note}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-black/10">
                                <Database size={48} />
                                <p className="text-[10px] font-black uppercase tracking-widest mt-4">No recent logs</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedWidget === 'balance' && (
                <Modal title="Treasury Audit" onClose={() => setSelectedWidget(null)}>
                    <div className="space-y-6 text-center">
                        <div className="p-10 bg-[#FFF8F0] rounded-3xl border border-[#E8820C]/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C] mb-2">Liquid Pool</p>
                            <h4 className="text-5xl font-serif font-black text-[#1A1A2E]">{formatNaira(d.poolBalance)}</h4>
                        </div>
                    </div>
                </Modal>
            )}

            {selectedTx && (
                <Modal title="Transaction Protocol" onClose={() => setSelectedTx(null)}>
                    <div className="space-y-8 p-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1A1A2E]">
                                {selectedTx.type === 'contribution' ? <ArrowUpRight size={40} /> : <ArrowDownLeft size={40} />}
                            </div>
                            <h4 className="text-4xl font-serif font-black">{formatNaira(selectedTx.amount)}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/30">{selectedTx.type.replace('_', ' ')}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-black/5">
                            <div>
                                <p className="text-[10px] font-black text-black/20 uppercase">Member</p>
                                <p className="font-black">{selectedTx.member}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-black/20 uppercase">Date</p>
                                <p className="font-black">{dayjs(selectedTx.date).format('DD MMM YYYY')}</p>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
