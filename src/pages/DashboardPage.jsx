import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Wallet, Users, TrendingUp, CheckCircle2, XCircle,
    ArrowUpRight, ArrowDownLeft, X, PieChart, Clock,
    ArrowRight, Calendar, Bell, ShieldCheck, TrendingDown,
    Activity, ArrowUpCircle, MoreHorizontal, Layers,
    Zap, Gem, FileText, BadgeCheck, Fingerprint, Lock
} from 'lucide-react';
import dayjs from 'dayjs';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { fetchDashboard } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';

function formatNaira(amount) {
    return `₦${Number(amount || 0).toLocaleString('en-NG')}`;
}

const StatCard = ({ icon: Icon, label, value, sub, color, onClick, trend }) => (
    <div
        onClick={onClick}
        className={`bg-white p-7 rounded-[2.5rem] border border-black/5 shadow-sm space-y-4 group transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-95' : ''}`}
    >
        <div className="flex items-center justify-between">
            <div className={`p-4 rounded-2xl transition-colors duration-300`} style={{ backgroundColor: `${color}10`, color: color }}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] mb-1 group-hover:text-black/50 transition-colors">{label}</p>
            <h4 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-tight">{value}</h4>
            {sub && <p className="text-[10px] font-bold text-black/40 mt-1 uppercase tracking-wider">{sub}</p>}
        </div>
    </div>
);

const MOCK = {
    poolBalance: 142500,
    savingsGoal: 250000,
    totalPaid: 14,
    totalUnpaid: 6,
    totalMembers: 20,
    recentTransactions: [
        { id: 1, type: 'contribution', member: 'Emeka Obi', amount: 100, date: '2026-03-24', note: 'Weekly contribution' },
        { id: 2, type: 'disbursement', member: 'Seun Adeyemi', amount: 5000, date: '2026-03-22', note: 'Medical support' },
        { id: 3, type: 'contribution', member: 'Tunde Lawal', amount: 100, date: '2026-03-21', note: 'Weekly contribution' },
        { id: 4, type: 'loan_repayment', member: 'Dare Balogun', amount: 10000, date: '2026-03-20', note: 'Loan repayment' },
        { id: 5, type: 'contribution', member: 'Femi Adeoye', amount: 200, date: '2026-03-18', note: 'Weekly + bonus' },
    ],
    monthlyChart: [
        { month: 'Nov', contributions: 8800, disbursements: 2000 },
        { month: 'Dec', contributions: 9200, disbursements: 5000 },
        { month: 'Jan', contributions: 9600, disbursements: 3500 },
        { month: 'Feb', contributions: 9800, disbursements: 8000 },
        { month: 'Mar', contributions: 10400, disbursements: 5000 },
    ],
    myStats: {
        totalContributions: 5200,
        activeLoan: 0,
        nextMeeting: '15 Apr 2026',
    }
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const dashboardData = await fetchDashboard();
            setData(dashboardData);
        } catch (err) {
            setData(MOCK);
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

    const d = data || MOCK;
    const goalPct = Math.min(100, Math.round((d.poolBalance / d.savingsGoal) * 100));

    const txIcon = (type) => {
        if (type === 'contribution') return <ArrowUpCircle size={16} className="text-emerald-500" />;
        return <ArrowDownLeft size={16} className="text-rose-500" />;
    };

    const Modal = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">{title}</h3>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Header / Hero Section */}
            <div className="relative bg-[#1A1A2E] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-center">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-4 max-w-md">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 backdrop-blur-sm">
                            <ShieldCheck size={12} /> Secure Executive Portal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
                            Ahlan wa Sahlan, <br />
                            <span className="text-[#F5A623]">{user?.name?.split(' ')[0] || 'Brother'}</span>.
                        </h1>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            Welcome to the Brotherhood Ledger. Your executive dashboard provides real-time oversight of treasury operations and community growth.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12 pb-2">
                        <div className="space-y-1">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">My Trust Sum</p>
                            <p className="text-2xl font-serif font-black">{formatNaira(d.myStats.totalContributions)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Active Loan</p>
                            <p className="text-2xl font-serif font-black text-[#F5A623]">
                                {d.myStats.activeLoan > 0 ? formatNaira(d.myStats.activeLoan) : 'None'}
                            </p>
                        </div>
                        <div className="space-y-1 col-span-2 sm:col-span-1 border-t border-white/10 pt-4 sm:border-0 sm:pt-0">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Next Majlis</p>
                            <p className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                                <Calendar size={16} /> {d.myStats.nextMeeting}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 pointer-events-none bg-[#E8820C]" />
                <div className="absolute bottom-[-20%] left-[10%] w-[300px] h-[300px] rounded-full blur-[80px] opacity-5 pointer-events-none bg-blue-500" />
                <div className="absolute -bottom-20 -right-20 text-white/[0.02] -rotate-12 select-none group-hover:text-white/[0.05] transition-colors duration-1000">
                    <Fingerprint size={400} />
                </div>
                <Activity className="absolute top-10 left-10 text-white/5" size={150} strokeWidth={1} />
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard icon={Wallet} label="Treasury Balance" value={formatNaira(d.poolBalance)} color="#E8820C" trend={+4.2}
                    onClick={() => setSelectedWidget('balance')} />
                <StatCard icon={Gem} label="Milestone Rank" value={formatNaira(d.savingsGoal)} color="#F5A623" sub={`${goalPct}% of Goal Achieved`} trend={+12}
                    onClick={() => setSelectedWidget('goal')} />
                <StatCard icon={CheckCircle2} label="Weekly Payers" value={`${d.totalPaid} / ${d.totalMembers}`} color="#10B981" sub="Verified Payments"
                    onClick={() => setSelectedWidget('attendance')} />
                <StatCard icon={Layers} label="Awaiting Dues" value={d.totalUnpaid} color="#F43F5E" sub="Pending Verification"
                    onClick={() => setSelectedWidget('attendance')} />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Analytics */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-black/5 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E]">Fiscal Trajectory</h2>
                            <p className="text-xs text-black/30 font-medium uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={12} className="text-emerald-500" /> 6-Month Growth Analysis
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-2 flex gap-1 shadow-inner">
                            <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter bg-white shadow-sm rounded-xl text-[#1A1A2E]">Area</button>
                            <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter text-black/30 hover:text-black/50 transition-colors">Line</button>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={d.monthlyChart}>
                                <defs>
                                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E8820C" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#E8820C" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1A1A2E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1A1A2E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }}
                                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                    labelStyle={{ fontWeight: 900, color: '#1A1A2E', marginBottom: '8px', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="contributions" stroke="#E8820C" fill="url(#cg)" strokeWidth={3} name="Inflow" />
                                <Area type="monotone" dataKey="disbursements" stroke="#1A1A2E" fill="url(#dg)" strokeWidth={3} name="Outflow" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Goal Progress Sub-widget */}
                    <div className="pt-8 border-t border-black/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Community Goal Engine</h3>
                            <span className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest">{goalPct}% Complete</span>
                        </div>
                        <div className="relative w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-black/[0.03]">
                            <div
                                className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 shadow-lg"
                                style={{ width: `${goalPct}%`, background: 'linear-gradient(90deg, #E8820C, #F5A623)' }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-black/40">COLLECTED: {formatNaira(d.poolBalance)}</span>
                            <span className="text-black/40">TARGET: {formatNaira(d.savingsGoal)}</span>
                        </div>
                    </div>
                </div>

                {/* Audit Log / Recent Transactions */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-black/5 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E]">Registry Audit</h2>
                            <p className="text-xs text-black/30 font-medium uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} className="text-blue-500" /> Recent Monetary Events
                            </p>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#E8820C] hover:underline flex items-center gap-1">
                            Full Registry <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {(d.recentTransactions || []).map((tx) => (
                            <div key={tx.id}
                                onClick={() => setSelectedTx(tx)}
                                className="group flex items-center gap-4 p-4 rounded-3xl border border-black/[0.02] hover:bg-gray-50 hover:border-black/5 transition-all cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${tx.type === 'contribution' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {txIcon(tx.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#1A1A2E] leading-snug group-hover:text-[#E8820C] transition-colors">{tx.member}</p>
                                    <p className="text-[10px] text-black/30 font-medium uppercase tracking-wide truncate">{tx.note}</p>
                                </div>
                                <div className="text-right flex-shrink-0 space-y-1">
                                    <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}
                                    </p>
                                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">{dayjs(tx.date).format('D MMM YYYY')}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <div className="p-6 rounded-[2rem] bg-[#1A1A2E] text-white flex items-center justify-between relative overflow-hidden group shadow-xl">
                            <div className="relative z-10 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">System Notification</p>
                                <h4 className="text-sm font-bold text-[#F5A623]">Audit Report Ready</h4>
                                <p className="text-[10px] text-white/30 font-medium">Weekly treasury consolidation file generated.</p>
                            </div>
                            <button className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 text-white">
                                <FileText size={18} />
                            </button>
                            <Activity className="absolute -right-4 -bottom-4 text-white/5 rotate-12 transition-transform duration-700 group-hover:scale-125" size={100} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Widget Details Modals */}
            {selectedWidget === 'balance' && (
                <Modal title="Registry Balance Audit" onClose={() => setSelectedWidget(null)}>
                    <div className="space-y-8">
                        <div className="p-8 rounded-[2rem] bg-[#FFF8F0] border border-[#E8820C]/10 text-center space-y-2">
                            <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest">Liquid Pool Status</p>
                            <h4 className="text-5xl font-serif font-black text-[#1A1A2E] tracking-tight">{formatNaira(d.poolBalance)}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 flex flex-col items-center gap-2">
                                <ArrowUpRight className="text-emerald-500" size={24} />
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Gross Inflows</p>
                                    <p className="text-lg font-black text-emerald-900">₦185,400</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-[1.5rem] bg-rose-50/50 border border-rose-100 flex flex-col items-center gap-2">
                                <ArrowDownLeft className="text-rose-500" size={24} />
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Gross Outflows</p>
                                    <p className="text-lg font-black text-rose-900">₦42,900</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-gray-50 text-center space-y-2 border border-black/5">
                            <h5 className="text-[10px] font-black text-black/30 uppercase tracking-widest flex items-center justify-center gap-2">
                                <ShieldCheck size={14} className="text-blue-500" /> Administrative Notice
                            </h5>
                            <p className="text-xs text-black/50 leading-relaxed font-bold">
                                The pool balance represents the audited liquid capital available for community support. All figures are verified daily by the Secretariat.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {selectedWidget === 'goal' && (
                <Modal title="Goal Trajectory Analysis" onClose={() => setSelectedWidget(null)}>
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Mission Target</p>
                                <p className="text-3xl font-serif font-black text-[#1A1A2E]">{formatNaira(d.savingsGoal)}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Progression</p>
                                <p className="text-3xl font-serif font-black text-[#E8820C]">{goalPct}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-8 rounded-[2rem] bg-[#1A1A2E] text-white border border-white/10 shadow-xl overflow-hidden relative">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-[#F5A623] flex items-center justify-center text-[#1A1A2E] relative z-10 shadow-lg">
                                <Clock size={32} strokeWidth={2.5} />
                            </div>
                            <div className="relative z-10 space-y-1">
                                <p className="text-sm font-black font-serif text-[#F5A623]">Strategic Milestone</p>
                                <p className="text-xs text-white/50 font-medium leading-relaxed tracking-wide">
                                    Based on the current velocity, <br /> 100% target achievement expected by end of Q3 2026.
                                </p>
                            </div>
                            <TrendingUp className="absolute right-[-20px] bottom-[-20px] text-white/5" size={150} />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 ml-2">Active Strategic Directives</h4>
                            <div className="space-y-3">
                                {[
                                    { text: 'Incentivize bulk quarterly contributions', icon: Zap },
                                    { text: 'Transition to automated weekly direct debit', icon: Activity },
                                    { text: 'Increase membership cap by 15%', icon: Users }
                                ].map((item, id) => (
                                    <div key={id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-black/[0.03] group hover:bg-white hover:border-[#1A1A2E]/10 transition-all cursor-default">
                                        <div className="p-2 rounded-xl bg-white shadow-sm text-[#1A1A2E] group-hover:text-[#E8820C] transition-colors">
                                            <item.icon size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-[#1A1A2E]/70 group-hover:text-[#1A1A2E] transition-colors">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {selectedWidget === 'attendance' && (
                <Modal title="Collection Status: Week 12" onClose={() => setSelectedWidget(null)}>
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-center space-y-1 shadow-sm">
                                <p className="text-5xl font-serif font-black text-emerald-700">{d.totalPaid}</p>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Dues</p>
                            </div>
                            <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100 text-center space-y-1 shadow-sm">
                                <p className="text-5xl font-serif font-black text-rose-700">{d.totalUnpaid}</p>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Awaiting Commit</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Priority Ledger</h4>
                                <button className="text-[10px] font-black uppercase text-[#E8820C] hover:underline">Full Registry</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['Seun A.', 'Ola F.', 'Kola Y.', 'Emeka O.', 'Tunde L.', 'Dare B.'].map(name => (
                                    <div key={name} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-black/[0.03] hover:border-emerald-200 transition-all group">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] group-hover:scale-125 transition-transform duration-300"></div>
                                        <span className="text-xs font-black text-[#1A1A2E]/60 uppercase tracking-tight">{name}</span>
                                        <CheckCircle2 size={12} className="ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            className="w-full py-5 rounded-[1.5rem] bg-[#1A1A2E] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Bell size={14} /> Send Audit Reminder to Pending
                        </button>
                    </div>
                </Modal>
            )}

            {selectedTx && (
                <Modal title="Registry Entry Protocol" onClose={() => setSelectedTx(null)}>
                    <div className="space-y-8">
                        <div className="flex flex-col items-center text-center space-y-4 pb-8 border-b border-black/5 relative overflow-hidden p-6">
                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-6 ${selectedTx.type === 'contribution' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {selectedTx.type === 'contribution' ? <ArrowUpRight size={48} strokeWidth={2.5} /> : <ArrowDownLeft size={48} strokeWidth={2.5} />}
                            </div>
                            <div className="relative z-10 space-y-1">
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em]">{selectedTx.type.replace('_', ' ')}</p>
                                <h4 className="text-4xl font-serif font-black text-[#1A1A2E] tracking-tight">{formatNaira(selectedTx.amount)}</h4>
                            </div>
                            <Activity className="absolute bottom-[-20%] right-[-10%] text-black/5" size={150} />
                        </div>
                        <div className="grid grid-cols-2 gap-8 px-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Protocol Entity</p>
                                <p className="text-sm font-black text-[#1A1A2E] flex items-center gap-2">
                                    <Users size={14} className="text-[#E8820C]" /> {selectedTx.member}
                                </p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Temporal Marker</p>
                                <p className="text-sm font-black text-[#1A1A2E] flex items-center gap-2 justify-end">
                                    {dayjs(selectedTx.date).format('DD MMMM YYYY')} <Calendar size={14} className="text-[#E8820C]" />
                                </p>
                            </div>
                            <div className="col-span-2 p-6 rounded-[1.5rem] bg-gray-50 border border-black/5 space-y-2">
                                <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Registry Narrative</p>
                                <p className="text-xs font-bold text-[#1A1A2E]/70 leading-relaxed italic">"{selectedTx.note}"</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-5 rounded-[1.5rem] bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                            <BadgeCheck size={18} /> Protocol Integrity Verified by Blockchain Registry
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 py-4 rounded-xl border-2 border-[#1A1A2E] text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <PieChart size={14} /> Full Analytics
                            </button>
                            <button className="flex-1 py-4 rounded-xl bg-[#1A1A2E] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#1A1A2E]/20 hover:-translate-y-0.5 transition-all active:scale-95">
                                Download Entry
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
