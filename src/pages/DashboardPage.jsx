import { useState, useEffect } from 'react';
import {
    Wallet, Users, TrendingUp, CheckCircle2, XCircle,
    ArrowUpRight, ArrowDownLeft, X, PieChart, Clock,
    ArrowRight, Calendar, Bell, ShieldCheck, TrendingDown,
    Activity, ArrowUpCircle, MoreHorizontal, Layers,
    Zap, Gem, FileText, BadgeCheck, Fingerprint, Lock,
    Database, ActivitySquare, ServerCrash
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

// eslint-disable-next-line no-unused-vars
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
    const { user, hasRole } = useAuth();
    const { config } = usePageConfig('dashboard');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);

    const isAdmin = hasRole('admin');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const dashboardData = await fetchDashboard();
            setData(dashboardData);
        } catch {
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
    const goalPct = Math.min(100, Math.round((d.poolBalance / (config.savingsGoal || d.savingsGoal)) * 100));

    const txIcon = (type) => {
        if (type === 'contribution') return <ArrowUpCircle size={16} className={isAdmin ? 'text-emerald-400' : 'text-emerald-500'} />;
        return <ArrowDownLeft size={16} className={isAdmin ? 'text-rose-400' : 'text-rose-500'} />;
    };

    const Modal = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 ${isAdmin ? 'bg-[#0f172a] text-white border border-slate-800' : 'bg-white'}`}>
                <div className={`flex items-center justify-between mb-8 sticky top-0 z-10 py-1 ${isAdmin ? 'bg-[#0f172a]' : 'bg-white'}`}>
                    <h3 className={`text-xl sm:text-2xl font-serif font-black ${isAdmin ? 'text-white' : 'text-[#1A1A2E]'}`}>{title}</h3>
                    <button onClick={onClose} className={`p-3 rounded-2xl transition-colors ${isAdmin ? 'hover:bg-slate-800 text-slate-500 hover:text-white' : 'hover:bg-gray-100 text-black/20 hover:text-black'}`}>
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    const renderModals = () => {
        return (
            <>
                {selectedWidget === 'balance' && (
                    <Modal title="Registry Balance Audit" onClose={() => setSelectedWidget(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className={`p-6 sm:p-8 rounded-[2rem] text-center space-y-2 border ${isAdmin ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-[#FFF8F0] border-[#E8820C]/10'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-indigo-400' : 'text-[#E8820C]'}`}>Liquid Pool Status</p>
                                <h4 className={`text-4xl sm:text-5xl font-serif font-black tracking-tight ${isAdmin ? 'text-white' : 'text-[#1A1A2E]'}`}>{formatNaira(d.poolBalance)}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-6 rounded-[1.5rem] flex flex-col items-center gap-2 border ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-100'}`}>
                                    <ArrowUpRight className={isAdmin ? 'text-emerald-400' : 'text-emerald-500'} size={24} />
                                    <div className="text-center">
                                        <p className={`text-[10px] font-black uppercase mb-1 ${isAdmin ? 'text-emerald-400' : 'text-emerald-600'}`}>Gross Inflows</p>
                                        <p className={`text-lg font-black ${isAdmin ? 'text-emerald-50' : 'text-emerald-900'}`}>₦185,400</p>
                                    </div>
                                </div>
                                <div className={`p-6 rounded-[1.5rem] flex flex-col items-center gap-2 border ${isAdmin ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50/50 border-rose-100'}`}>
                                    <ArrowDownLeft className={isAdmin ? 'text-rose-400' : 'text-rose-500'} size={24} />
                                    <div className="text-center">
                                        <p className={`text-[10px] font-black uppercase mb-1 ${isAdmin ? 'text-rose-400' : 'text-rose-600'}`}>Gross Outflows</p>
                                        <p className={`text-lg font-black ${isAdmin ? 'text-rose-50' : 'text-rose-900'}`}>₦42,900</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {selectedWidget === 'goal' && (
                    <Modal title="Goal Trajectory Analysis" onClose={() => setSelectedWidget(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className="flex items-center justify-between p-2">
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-slate-400' : 'text-black/30'}`}>Mission Target</p>
                                    <p className={`text-2xl sm:text-3xl font-serif font-black ${isAdmin ? 'text-white' : 'text-[#1A1A2E]'}`}>{formatNaira(config.savingsGoal || d.savingsGoal)}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-slate-400' : 'text-black/30'}`}>Progression</p>
                                    <p className={`text-2xl sm:text-3xl font-serif font-black ${isAdmin ? 'text-indigo-400' : 'text-[#E8820C]'}`}>{goalPct}%</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-[2rem] border shadow-xl overflow-hidden relative ${isAdmin ? 'bg-[#0a0f1c] border-slate-800 text-slate-300' : 'bg-[#1A1A2E] text-white border-white/10'}`}>
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center relative z-10 shadow-lg ${isAdmin ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-[#F5A623] text-[#1A1A2E]'}`}>
                                    <Clock size={32} strokeWidth={2.5} />
                                </div>
                                <div className="relative z-10 space-y-1">
                                    <p className={`text-sm font-black font-serif ${isAdmin ? 'text-indigo-400' : 'text-[#F5A623]'}`}>Strategic Milestone</p>
                                    <p className={`text-xs font-medium leading-relaxed tracking-wide ${isAdmin ? 'text-slate-400' : 'text-white/50'}`}>
                                        Based on the current velocity, <br /> 100% target achievement expected by end of Q3 2026.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {selectedWidget === 'attendance' && (
                    <Modal title="Collection Status: Week 12" onClose={() => setSelectedWidget(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className={`p-6 sm:p-8 rounded-[2rem] border text-center space-y-1 shadow-sm ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <p className={`text-4xl sm:text-5xl font-serif font-black ${isAdmin ? 'text-emerald-400' : 'text-emerald-700'}`}>{d.totalPaid}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-emerald-500/70' : 'text-emerald-600'}`}>Verified Dues</p>
                                </div>
                                <div className={`p-8 rounded-[2rem] border text-center space-y-1 shadow-sm ${isAdmin ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                                    <p className={`text-5xl font-serif font-black ${isAdmin ? 'text-rose-400' : 'text-rose-700'}`}>{d.totalUnpaid}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-rose-500/70' : 'text-rose-600'}`}>Awaiting Commit</p>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {selectedTx && (
                    <Modal title="Registry Entry Protocol" onClose={() => setSelectedTx(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className={`flex flex-col items-center text-center space-y-4 pb-6 sm:pb-8 border-b relative overflow-hidden p-4 sm:p-6 ${isAdmin ? 'border-slate-800' : 'border-black/5'}`}>
                                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-6 
                                    ${selectedTx.type === 'contribution'
                                        ? (isAdmin ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600')
                                        : (isAdmin ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-600')}`}>
                                    {selectedTx.type === 'contribution' ? <ArrowUpRight size={40} strokeWidth={2.5} className="sm:w-12 sm:h-12" /> : <ArrowDownLeft size={40} strokeWidth={2.5} className="sm:w-12 sm:h-12" />}
                                </div>
                                <div className="relative z-10 space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isAdmin ? 'text-slate-500' : 'text-black/30'}`}>{selectedTx.type.replace('_', ' ')}</p>
                                    <h4 className={`text-3xl sm:text-4xl font-serif font-black tracking-tight ${isAdmin ? 'text-white' : 'text-[#1A1A2E]'}`}>{formatNaira(selectedTx.amount)}</h4>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 px-2">
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-slate-500' : 'text-black/30'}`}>Protocol Entity</p>
                                    <p className={`text-sm font-black flex items-center gap-2 ${isAdmin ? 'text-white' : 'text-[#1A1A2E]'}`}>
                                        <Users size={14} className={isAdmin ? 'text-indigo-400' : 'text-[#E8820C]'} /> {selectedTx.member}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-slate-500' : 'text-black/30'}`}>Temporal Marker</p>
                                    <p className={`text-sm font-black flex items-center gap-2 justify-end ${isAdmin ? 'text-white' : 'text-[#1A1A2E]'}`}>
                                        {dayjs(selectedTx.date).format('DD MMMM YYYY')} <Calendar size={14} className={isAdmin ? 'text-indigo-400' : 'text-[#E8820C]'} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </>
        );
    };

    if (isAdmin) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                {/* Ultra Premium Admin Header */}
                <div className="relative bg-[#050510] rounded-[3rem] p-8 md:p-14 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden border border-indigo-500/20 group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-600 rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-10 text-white/[0.01] pointer-events-none">
                        <ShieldCheck size={350} />
                    </div>

                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 backdrop-blur-md shadow-inner">
                                <ActivitySquare size={14} className="animate-pulse" /> Global System Authority
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white lg:leading-tight">
                                    Executive Command
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/50 mt-4 leading-relaxed font-serif">
                                    Welcome back, Administrator {user?.name?.split(' ')[0] || ''}. You are governing the entire brotherhood network infrastructure.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-[#0f172a]/80 p-6 rounded-[2rem] border border-slate-700/50 space-y-2 backdrop-blur-xl shadow-xl flex flex-col justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></div> Network Core</p>
                                <p className="text-2xl font-serif font-black text-white">Optimized</p>
                            </div>
                            <div className="bg-[#0f172a]/80 p-6 rounded-[2rem] border border-slate-700/50 space-y-2 backdrop-blur-xl shadow-xl flex flex-col justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Fingerprint size={12} className="text-indigo-400" /> Security Tier</p>
                                <p className="text-2xl font-serif font-black text-indigo-400">Class A</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Admin Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]" onClick={() => setSelectedWidget('balance')}>
                        <div className="absolute top-0 right-0 p-4 text-white/[0.02] group-hover:scale-110 transition-transform duration-500"><Database size={100} /></div>
                        <div className="relative z-10 space-y-5">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20"><Wallet size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Global Treasury</p>
                                <p className="text-3xl font-serif font-black text-white tracking-tight">{formatNaira(d.poolBalance)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-[#E8820C]/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]" onClick={() => setSelectedWidget('goal')}>
                        <div className="absolute top-0 right-0 p-4 text-white/[0.02] group-hover:scale-110 transition-transform duration-500"><TrendingUp size={100} /></div>
                        <div className="relative z-10 space-y-5">
                            <div className="w-12 h-12 bg-[#E8820C]/10 rounded-2xl flex items-center justify-center text-[#E8820C] border border-[#E8820C]/20"><Gem size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Target Velocity</p>
                                <p className="text-3xl font-serif font-black text-[#E8820C] tracking-tight">{goalPct}% <span className="text-xs font-bold text-slate-500 ml-1">of Limit</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]" onClick={() => setSelectedWidget('attendance')}>
                        <div className="absolute top-0 right-0 p-4 text-white/[0.02] group-hover:scale-110 transition-transform duration-500"><Users size={100} /></div>
                        <div className="relative z-10 space-y-5">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Verified Base</p>
                                <p className="text-3xl font-serif font-black text-white tracking-tight">{d.totalPaid} <span className="text-xs font-bold text-slate-500 ml-1">/ {d.totalMembers}</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden group cursor-pointer hover:border-rose-500/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]" onClick={() => setSelectedWidget('attendance')}>
                        <div className="absolute top-0 right-0 p-4 text-white/[0.02] group-hover:scale-110 transition-transform duration-500"><Layers size={100} /></div>
                        <div className="relative z-10 space-y-5">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 border border-rose-500/20"><ServerCrash size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">System Risk</p>
                                <p className="text-3xl font-serif font-black text-rose-400 tracking-tight">{d.totalUnpaid} <span className="text-xs font-bold text-slate-500 ml-1">Delinquent</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dark Analytics Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-[#0a0f1c] rounded-[2.5rem] p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-10 group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-serif font-black text-white tracking-wide">System Liquidity Matrix</h2>
                                <p className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.3em]">6-Month Autonomous Trajectory</p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="animate-pulse" /> Live Stream
                            </div>
                        </div>

                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="adminInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="adminOutflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff' }} itemStyle={{ color: '#fff' }} cursor={{ stroke: '#334155' }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#818cf8" fill="url(#adminInflow)" strokeWidth={3} name="Total Influx" />
                                    <Area type="monotone" dataKey="disbursements" stroke="#fb7185" fill="url(#adminOutflow)" strokeWidth={3} name="Resource Output" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-[#0a0f1c] rounded-[2.5rem] p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-8 flex flex-col">
                        <div className="space-y-2 border-b border-slate-800 pb-6">
                            <h2 className="text-xl font-serif font-black text-white flex items-center gap-3"><Clock size={18} className="text-indigo-400" /> Real-time Relay</h2>
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em]">Latest Node Activity</p>
                        </div>
                        <div className="space-y-4 flex-1">
                            {(d.recentTransactions || []).slice(0, 5).map((tx) => (
                                <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group flex flex-col gap-3 p-5 rounded-[1.5rem] border border-slate-800/50 bg-[#0f172a]/50 hover:bg-[#0f172a] hover:border-indigo-500/30 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3 items-center">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'contribution' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                {txIcon(tx.type)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white tracking-wide">{tx.member}</p>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{tx.note}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
                                        <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-400' : 'text-rose-400'}`}>{tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}</p>
                                        <p className="text-[9px] font-black text-slate-600 font-mono tracking-widest">{dayjs(tx.date).format('DD MMM HH:mm')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {renderModals()}
            </div>
        );
    }

    // ========== STANDARD USER DASHBOARD ==========
    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Header / Hero Section */}
            <div className="relative bg-[#1A1A2E] rounded-[2.5rem] p-6 sm:p-8 md:p-12 text-white shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-center">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-4 max-w-md">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 backdrop-blur-sm">
                            <ShieldCheck size={12} /> {config.heroBadgeText}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
                            {config.heroGreeting}, <br />
                            <span className="text-[#F5A623]">{user?.name?.split(' ')[0] || 'Brother'}</span>.
                        </h1>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            {config.heroSubtitle}
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
                <StatCard icon={Gem} label="Milestone Rank" value={formatNaira(config.savingsGoal || d.savingsGoal)} color="#F5A623" sub={`${goalPct}% of Goal Achieved`} trend={+12}
                    onClick={() => setSelectedWidget('goal')} />
                <StatCard icon={CheckCircle2} label="Weekly Payers" value={`${d.totalPaid} / ${d.totalMembers}`} color="#10B981" sub="Verified Payments"
                    onClick={() => setSelectedWidget('attendance')} />
                <StatCard icon={Layers} label="Awaiting Dues" value={d.totalUnpaid} color="#F43F5E" sub="Pending Verification"
                    onClick={() => setSelectedWidget('attendance')} />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Analytics */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-black/5 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg sm:text-xl font-serif font-black text-[#1A1A2E]">Fiscal Trajectory</h2>
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
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }} labelStyle={{ fontWeight: 900, color: '#1A1A2E', marginBottom: '8px', fontSize: '12px' }} />
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
                            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${goalPct}%`, background: 'linear-gradient(90deg, #E8820C, #F5A623)' }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-black/40">COLLECTED: {formatNaira(d.poolBalance)}</span>
                            <span className="text-black/40">TARGET: {formatNaira(config.savingsGoal || d.savingsGoal)}</span>
                        </div>
                    </div>
                </div>

                {/* Audit Log / Recent Transactions */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-black/5 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg sm:text-xl font-serif font-black text-[#1A1A2E]">Registry Audit</h2>
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
                            <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group flex items-center gap-4 p-4 rounded-3xl border border-black/[0.02] hover:bg-gray-50 hover:border-black/5 transition-all cursor-pointer">
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
                                <h4 className="text-sm font-bold text-[#F5A623]">{config.systemNoticeTitle}</h4>
                                <p className="text-[10px] text-white/30 font-medium">{config.systemNoticeBody}</p>
                            </div>
                            <button className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 text-white">
                                <FileText size={18} />
                            </button>
                            <Activity className="absolute -right-4 -bottom-4 text-white/5 rotate-12 transition-transform duration-700 group-hover:scale-125" size={100} />
                        </div>
                    </div>
                </div>
            </div>

            {renderModals()}
        </div>
    );
}
