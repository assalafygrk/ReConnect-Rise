import { useState, useEffect } from 'react';
import {
    Wallet, Users, TrendingUp, CheckCircle2, XCircle,
    ArrowUpRight, ArrowDownLeft, X, PieChart, Clock,
    ArrowRight, Calendar, Bell, ShieldCheck, TrendingDown,
    Activity, ArrowUpCircle, MoreHorizontal, Layers,
    Zap, Gem, FileText, BadgeCheck, Fingerprint, Lock,
    Database, ActivitySquare, ServerCrash, Crown, Landmark, CircleDollarSign, Target, BarChart3,
    Heart, HandHelping, Gift, Trophy, Star, Scroll, Lightbulb, Scale, CalendarRange, Mic2, MapPin, HeartHandshake, Award
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

const StatCard = ({ icon: Icon, label, value, sub, color, onClick, trend }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-2xl p-6 sm:p-8 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1' : ''}`}
    >
        <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl transition-colors duration-300`} style={{ backgroundColor: `${color}10`, color: color }}>
                <Icon size={20} className="stroke-[2.5]" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend > 0 ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.2em]">{label}</p>
            <h4 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A2E] tracking-tight">{value}</h4>
            {sub && <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest pt-3 border-t border-black/5 mt-3">{sub}</p>}
        </div>
    </div>
);

const MOCK_NEW_MEMBER = {
    poolBalance: 0,
    savingsGoal: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalMembers: 0,
    recentTransactions: [],
    monthlyChart: [],
    myStats: {
        totalContributions: 0,
        activeLoan: 0,
        nextMeeting: 'N/A',
    }
};

const MOCK_TREASURER = {
    poolBalance: 0,
    savingsGoal: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalMembers: 0,
    liquidityRatio: 0,
    pendingDisbursements: 0,
    recentTransactions: [],
    monthlyChart: [],
    myStats: {
        totalContributions: 0,
        activeLoan: 0,
        nextMeeting: 'N/A',
    }
};

const MOCK_GROUP_LEADER = {
    poolBalance: 0,
    savingsGoal: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalMembers: 0,
    groupName: "Loading...",
    participationRate: 0,
    recentTransactions: [],
    monthlyChart: [],
    myStats: {
        totalContributions: 0,
        activeLoan: 0,
        nextMeeting: 'N/A',
    }
};

const MOCK_WELFARE = {
    totalWelfareFunds: 0,
    pendingRequests: 0,
    disbursedThisMonth: 0,
    totalMembers: 0,
    recentTransactions: [],
    monthlyChart: [],
    myStats: {
        totalContributions: 0,
        activeLoan: 0,
        nextMeeting: 'N/A',
    }
};

const MOCK_OFFICIAL_MEMBER = {
    poolBalance: 0,
    savingsGoal: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalMembers: 0,
    seniorityYears: 0,
    trustScore: 0,
    advocacyPoints: 0,
    recentTransactions: [],
    monthlyChart: [],
    myStats: {
        totalContributions: 0,
        activeLoan: 0,
        nextMeeting: 'N/A',
    }
};

const MOCK_ADVISOR = {
    activeAdviceRooms: 0,
    pendingPolicies: 0,
    communitySentiment: 0,
    totalMembers: 0,
    recentTransactions: [],
    monthlyChart: [],
    myStats: {
        totalContributions: 0,
        activeLoan: 0,
        nextMeeting: 'N/A',
    }
};

const MOCK_ORGANIZER = {
    upcomingEvents: 0,
    totalVenues: 0,
    avgAttendance: 0,
    totalMembers: 0,
    recentTransactions: [],
    monthlyChart: [],
    myStats: {
        totalContributions: 0,
        activeLoan: 0,
        nextMeeting: 'N/A',
    }
};

export default function DashboardPage() {
    const { user, activeRole } = useAuth();
    const { config } = usePageConfig('dashboard');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [selectedTx, setSelectedTx] = useState(null);

    const effectiveRole = activeRole || user?.role || 'member';
    const isSuperAdmin = effectiveRole === 'super_admin';
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

        // Role-specific base shape (keeps all UI-specific fields)
        const getRoleBase = () => {
            if (isSuperAdmin || isTreasurer || isAdmin) return MOCK_TREASURER;
            if (isGroupLeader) return MOCK_GROUP_LEADER;
            if (isWelfare) return MOCK_WELFARE;
            if (isOfficialMember) return MOCK_OFFICIAL_MEMBER;
            if (isAdvisor) return MOCK_ADVISOR;
            if (isOrganizer) return MOCK_ORGANIZER;
            return MOCK_NEW_MEMBER;
        };

        try {
            const apiData = await fetchDashboard();
            // Merge: real API values override mock defaults, keeping role UI fields intact
            setData({ ...getRoleBase(), ...apiData });
        } catch {
            // Backend unavailable — use full mock data for that role
            setData(getRoleBase());
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

    const getMockData = () => {
        if (isTreasurer) return MOCK_TREASURER;
        if (isGroupLeader) return MOCK_GROUP_LEADER;
        if (isWelfare) return MOCK_WELFARE;
        if (isOfficialMember) return MOCK_OFFICIAL_MEMBER;
        if (isAdvisor) return MOCK_ADVISOR;
        if (isOrganizer) return MOCK_ORGANIZER;
        return MOCK_NEW_MEMBER;
    };
    const d = data || getMockData();
    const goalPct = Math.min(100, Math.round((d.poolBalance / (config.savingsGoal || d.savingsGoal)) * 100));

    const txIcon = (type) => {
        if (type === 'contribution') return <ArrowUpCircle size={16} className={effectiveRole !== 'member' ? 'text-emerald-400' : 'text-emerald-500'} />;
        return <ArrowDownLeft size={16} className={effectiveRole !== 'member' ? 'text-rose-400' : 'text-rose-500'} />;
    };

    const Modal = ({ title, onClose, children }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
            <div className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)] relative animate-in zoom-in-95 duration-300 bg-white`}>
                <div className={`flex items-center justify-between mb-8 sticky top-0 z-10 py-1 bg-white`}>
                    <h3 className={`text-xl sm:text-2xl font-serif font-black text-[#1A1A2E]`}>{title}</h3>
                    <button onClick={onClose} className={`p-3 rounded-full transition-colors bg-gray-50 hover:bg-gray-100 text-black/40 hover:text-black`}>
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
                    <Modal title="Treasury Audit" onClose={() => setSelectedWidget(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className={`p-8 sm:p-10 rounded-2xl text-center space-y-3 border border-black/5 bg-gray-50/50 shadow-inner`}>
                                <p className={`text-[10px] font-black uppercase tracking-[0.3em] text-black/40`}>Liquid Pool Status</p>
                                <h4 className={`text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#1A1A2E]`}>{formatNaira(d.poolBalance)}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-6 rounded-2xl flex flex-col items-center gap-3 border border-emerald-100 bg-emerald-50/50`}>
                                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600"><ArrowUpRight size={24} strokeWidth={3} /></div>
                                    <div className="text-center">
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-emerald-600`}>Gross Inflows</p>
                                        <p className={`text-xl font-black text-emerald-950`}>₦185,400</p>
                                    </div>
                                </div>
                                <div className={`p-6 rounded-2xl flex flex-col items-center gap-3 border border-rose-100 bg-rose-50/50`}>
                                    <div className="p-3 rounded-xl bg-rose-100 text-rose-600"><ArrowDownLeft size={24} strokeWidth={3} /></div>
                                    <div className="text-center">
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 text-rose-600`}>Gross Outflows</p>
                                        <p className={`text-xl font-black text-rose-950`}>₦42,900</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {selectedWidget === 'goal' && (
                    <Modal title="Goal Trajectory" onClose={() => setSelectedWidget(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className="flex items-center justify-between p-2">
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-black/40`}>Mission Target</p>
                                    <p className={`text-2xl sm:text-3xl font-serif font-black text-[#1A1A2E]`}>{formatNaira(config.savingsGoal || d.savingsGoal)}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-black/40`}>Progression</p>
                                    <p className={`text-2xl sm:text-3xl font-serif font-black text-[#E8820C]`}>{goalPct}%</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-5 sm:gap-6 p-6 sm:p-8 rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden`}>
                                <div className="absolute right-0 top-0 w-32 h-32 bg-[#E8820C]/5 rounded-full blur-2xl"></div>
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center relative z-10 bg-[#E8820C]/10 text-[#E8820C]`}>
                                    <Clock size={28} strokeWidth={2.5} />
                                </div>
                                <div className="relative z-10 space-y-1.5 flex-1">
                                    <p className={`text-sm font-black font-serif text-[#E8820C]`}>Strategic Milestone</p>
                                    <p className={`text-xs font-medium leading-relaxed text-black/50`}>
                                        Based on current velocity, 100% target achievement expected by Q3 2026.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {selectedWidget === 'attendance' && (
                    <Modal title="Collection Status" onClose={() => setSelectedWidget(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className={`p-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 text-center space-y-2 shadow-sm`}>
                                    <p className={`text-5xl sm:text-6xl font-serif font-black text-emerald-700`}>{d.totalPaid}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-emerald-600`}>Verified Dues</p>
                                </div>
                                <div className={`p-8 rounded-2xl border border-rose-100 bg-rose-50/50 text-center space-y-2 shadow-sm`}>
                                    <p className={`text-5xl sm:text-6xl font-serif font-black text-rose-700`}>{d.totalUnpaid}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-rose-600`}>Awaiting Commit</p>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {selectedTx && (
                    <Modal title="Registry Entry" onClose={() => setSelectedTx(null)}>
                        <div className="space-y-6 sm:space-y-8">
                            <div className={`flex flex-col items-center text-center space-y-5 pb-8 sm:pb-10 border-b border-black/5 relative overflow-hidden p-4 sm:p-6`}>
                                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center relative z-10 transition-transform duration-500 hover:scale-105 shadow-xl
                                    ${selectedTx.type === 'contribution' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {selectedTx.type === 'contribution' ? <ArrowUpRight size={40} strokeWidth={3} className="sm:w-12 sm:h-12" /> : <ArrowDownLeft size={40} strokeWidth={3} className="sm:w-12 sm:h-12" />}
                                </div>
                                <div className="relative z-10 space-y-2">
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] text-black/40`}>{selectedTx.type.replace('_', ' ')}</p>
                                    <h4 className={`text-3xl sm:text-5xl font-serif font-black tracking-tight text-[#1A1A2E]`}>{formatNaira(selectedTx.amount)}</h4>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 px-4">
                                <div className="space-y-1.5">
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-black/40`}>Protocol Entity</p>
                                    <p className={`text-sm font-black flex items-center gap-2 text-[#1A1A2E]`}>
                                        <Users size={14} className="text-[#E8820C]" /> {selectedTx.member}
                                    </p>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <p className={`text-[10px] font-black uppercase tracking-widest text-black/40`}>Temporal Marker</p>
                                    <p className={`text-sm font-black flex items-center gap-2 justify-end text-[#1A1A2E]`}>
                                        {dayjs(selectedTx.date).format('DD MMM YYYY')} <Calendar size={14} className="text-[#E8820C]" />
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
                <div className="relative bg-[#0A2540] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-1000"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-10 text-white/[0.02] pointer-events-none">
                        <ShieldCheck size={350} />
                    </div>

                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B82F6] backdrop-blur-md">
                                <ActivitySquare size={12} className="animate-pulse" /> Global System Authority
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white lg:leading-tight">
                                    Executive Command
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif">
                                    Welcome back, Administrator {user?.name?.split(' ')[0] || ''}. You are governing the entire brotherhood network infrastructure.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md shadow-sm flex flex-col justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div> Network Core</p>
                                <p className="text-2xl font-serif font-black text-white">Optimized</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2 backdrop-blur-md shadow-sm flex flex-col justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center gap-2"><Fingerprint size={12} className="text-[#3B82F6]" /> Security Tier</p>
                                <p className="text-2xl font-serif font-black text-[#3B82F6]">Class A</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Admin Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={Database} label="Global Treasury" value={formatNaira(d.poolBalance)} color="#3B82F6" onClick={() => setSelectedWidget('balance')} />
                    <StatCard icon={TrendingUp} label="Target Velocity" value={`${goalPct}%`} sub="of Limit" color="#F5A623" onClick={() => setSelectedWidget('goal')} trend={+8} />
                    <StatCard icon={CheckCircle2} label="Verified Base" value={`${d.totalPaid} / ${d.totalMembers}`} color="#10B981" onClick={() => setSelectedWidget('attendance')} />
                    <StatCard icon={Layers} label="System Risk" value={d.totalUnpaid} sub="Delinquent" color="#F43F5E" onClick={() => setSelectedWidget('attendance')} />
                </div>

                {/* Analytics Matrix */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">System Liquidity Matrix</h2>
                                <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">6-Month Autonomous Trajectory</p>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="animate-pulse" /> Live Stream
                            </div>
                        </div>

                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="adminInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="adminOutflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#3B82F6" fill="url(#adminInflow)" strokeWidth={3} name="Total Influx" />
                                    <Area type="monotone" dataKey="disbursements" stroke="#F43F5E" fill="url(#adminOutflow)" strokeWidth={3} name="Resource Output" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 flex flex-col">
                        <div className="space-y-1 pb-4 border-b border-black/5">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E] flex items-center gap-3"><Clock size={18} className="text-[#3B82F6]" /> Real-time Relay</h2>
                            <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Latest Node Activity</p>
                        </div>
                        <div className="space-y-4 flex-1">
                            {(d.recentTransactions || []).slice(0, 5).map((tx) => (
                                <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group flex items-center gap-4 p-4 rounded-2xl border border-black/[0.03] hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'contribution' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {txIcon(tx.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#1A1A2E] truncate">{tx.member}</p>
                                        <p className="text-[9px] text-black/40 uppercase tracking-widest mt-0.5">{tx.note}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}</p>
                                        <p className="text-[9px] font-black text-black/30 font-mono tracking-widest mt-0.5">{dayjs(tx.date).format('HH:mm')}</p>
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

    if (isGroupLeader) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                {/* Governing Premium Header */}
                <div className="relative bg-[#2E1065] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#8B5CF6] rounded-full blur-[150px] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA] backdrop-blur-md">
                                <Crown size={12} className="animate-pulse" /> Operational Command
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                    {d.groupName || 'Alpha Vanguard'}
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif italic">
                                    "Governing with integrity, leading with vision."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Participation</p>
                                <p className="text-2xl font-serif font-black text-white">{d.participationRate}%</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Active Base</p>
                                <p className="text-2xl font-serif font-black text-white">{d.totalPaid}/{d.totalMembers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={Users} label="Group Strength" value={d.totalMembers} color="#8B5CF6" trend={+2} />
                    <StatCard icon={Target} label="Operational Goal" value={formatNaira(d.savingsGoal)} color="#C084FC" sub={`${goalPct}% Reached`} trend={+5} />
                    <StatCard icon={CheckCircle2} label="Verified Dues" value={d.totalPaid} color="#10B981" sub="Weekly Collection" />
                    <StatCard icon={ShieldCheck} label="Leadership Status" value="Elite" color="#F5A623" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Group Growth Matrix</h2>
                                <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Participation & Contribution Velocity</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="groupInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#8B5CF6" fill="url(#groupInflow)" strokeWidth={3} name="Group Inflow" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 flex flex-col">
                        <div className="space-y-1 pb-4 border-b border-black/5">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E] flex items-center gap-3"><Clock size={18} className="text-[#8B5CF6]" /> Recent Activity</h2>
                            <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Latest Member Entries</p>
                        </div>
                        <div className="space-y-4 flex-1">
                            {d.recentTransactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-black/[0.03] hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'contribution' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {txIcon(tx.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#1A1A2E] truncate">{tx.member}</p>
                                        <p className="text-[9px] text-black/40 uppercase tracking-widest mt-0.5">{tx.note}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}
                                        </p>
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

    if (isTreasurer) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                {/* Fiscal Stewardship Header */}
                <div className="relative bg-[#064E3B] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#10B981] rounded-full blur-[150px] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#34D399] backdrop-blur-md">
                                <Landmark size={12} className="animate-pulse" /> Fiscal Stewardship
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                    Treasury Master
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif">
                                    "Precision in every coin, transparency in every record."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Liquidity</p>
                                <p className="text-2xl font-serif font-black text-white">{(d.liquidityRatio * 100).toFixed(0)}%</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Pending</p>
                                <p className="text-2xl font-serif font-black text-white">{formatNaira(d.pendingDisbursements)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={CircleDollarSign} label="Total Liquid Pool" value={formatNaira(d.poolBalance)} color="#10B981" trend={+8} onClick={() => setSelectedWidget('balance')} />
                    <StatCard icon={BarChart3} label="Revenue Velocity" value="+₦1.2M" color="#F5A623" sub="Monthly Growth" trend={+12} />
                    <StatCard icon={Wallet} label="Expenditure" value={formatNaira(d.monthlyChart[d.monthlyChart.length - 1]?.disbursements || 0)} color="#F43F5E" sub="Recent Output" />
                    <StatCard icon={BadgeCheck} label="Audit Status" value="Verified" color="#34D399" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Financial Trajectory Analysis</h2>
                                <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Capital Inflow vs Strategic Expenditure</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="treasurerInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="treasurerOutflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#10B981" fill="url(#treasurerInflow)" strokeWidth={3} name="Total Influx" />
                                    <Area type="monotone" dataKey="disbursements" stroke="#F43F5E" fill="url(#treasurerOutflow)" strokeWidth={3} name="Resource Output" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 flex flex-col">
                        <div className="space-y-1 pb-4 border-b border-black/5">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E] flex items-center gap-3"><ArrowRight size={18} className="text-[#10B981]" /> Fiscal Relay</h2>
                            <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Recent Transactions</p>
                        </div>
                        <div className="space-y-4 flex-1">
                            {d.recentTransactions.slice(0, 5).map(tx => (
                                <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group flex items-center gap-4 p-4 rounded-2xl border border-black/[0.03] hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'contribution' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {txIcon(tx.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#1A1A2E] truncate">{tx.member}</p>
                                        <p className="text-[9px] text-black/40 uppercase tracking-widest mt-0.5">{tx.note}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}
                                        </p>
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

    if (isWelfare) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                <div className="relative bg-[#4C0519] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#F43F5E] rounded-full blur-[150px] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#FB7185] backdrop-blur-md">
                                <Heart size={12} className="animate-pulse" /> Humanitarian Support
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                    Welfare Council
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif">
                                    "Your well-being is our shared responsibility."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Requests</p>
                                <p className="text-2xl font-serif font-black text-white">{d.pendingRequests} Pending</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Spent</p>
                                <p className="text-2xl font-serif font-black text-white">{formatNaira(d.disbursedThisMonth)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={HeartHandshake} label="Welfare Pool" value={formatNaira(d.totalWelfareFunds)} color="#F43F5E" />
                    <StatCard icon={HandHelping} label="Active Support" value={d.pendingRequests} color="#FB7185" sub="Awaiting Review" />
                    <StatCard icon={Gift} label="Gift Grants" value="5" color="#EC4899" sub="This Month" />
                    <StatCard icon={BadgeCheck} label="Care Status" value="Active" color="#10B981" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Well-being Distribution</h2>
                                <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Monthly Support Velocity</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="welfareInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="disbursements" stroke="#F43F5E" fill="url(#welfareInflow)" strokeWidth={3} name="Welfare Output" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 flex flex-col">
                        <div className="space-y-1 pb-4 border-b border-black/5">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E] flex items-center gap-3"><Gift size={18} className="text-[#F43F5E]" /> Latest Grants</h2>
                            <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Recent Disbursements</p>
                        </div>
                        <div className="space-y-4 flex-1">
                            {d.recentTransactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-black/[0.03] hover:bg-gray-50 hover:shadow-sm transition-all">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600">
                                        <Heart size={16} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#1A1A2E] truncate">{tx.member}</p>
                                        <p className="text-[9px] text-black/40 uppercase tracking-widest mt-0.5">{tx.note}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-rose-600">{formatNaira(tx.amount)}</p>
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

    if (isOfficialMember) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                <div className="relative bg-[#0F172A] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#60A5FA] backdrop-blur-md">
                                <Award size={12} className="animate-pulse" /> Brotherhood Core
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">Official Member</h1>
                                <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif">Welcome back, Brother {user?.name?.split(' ')[0]}. You have served for {d.seniorityYears} years.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center shrink-0">
                            <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-inner">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">{d.trustScore}</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/50">Trust</p>
                                </div>
                            </div>
                            <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md h-full flex flex-col justify-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Advocacy Pool</p>
                                <p className="text-xl font-bold text-white flex items-center gap-2"><Star size={16} className="text-[#FCD34D]" /> {d.advocacyPoints} pts</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Trophy} label="Seniority Rank" value={`${d.seniorityYears} Years`} color="#64748B" sub="Active Status" />
                    <StatCard icon={ShieldCheck} label="Trust Score" value={`${d.trustScore}%`} color="#3B82F6" sub="Peer Verified" />
                    <StatCard icon={Gem} label="Total Contributions" value={formatNaira(d.myStats.totalContributions)} color="#F5A623" trend={+15} />
                    <StatCard icon={Activity} label="Participation" value="High" color="#10B981" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Accumulated Legacy</h2>
                                <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Steady Growth</p>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="legacyG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#3B82F6" fill="url(#legacyG)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
                        <div className="space-y-1 pb-4 border-b border-black/5">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E]">Member Advocacy Stats</h2>
                            <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Network Influence</p>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-black/[0.03] bg-gray-50/50 hover:bg-gray-50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">A</div>
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1A2E]">Advocacy Reach</p>
                                        <p className="text-[10px] text-black/40 uppercase tracking-widest mt-0.5">How many members you've influenced</p>
                                    </div>
                                </div>
                                <p className="text-lg font-black text-blue-600">85%</p>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-black/[0.03] bg-gray-50/50 hover:bg-gray-50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">V</div>
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1A2E]">Verification Speed</p>
                                        <p className="text-[10px] text-black/40 uppercase tracking-widest mt-0.5">Average time to verify dues</p>
                                    </div>
                                </div>
                                <p className="text-lg font-black text-emerald-600">Fast</p>
                            </div>
                        </div>
                    </div>
                </div>
                {renderModals()}
            </div>
        );
    }

    if (isAdvisor) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                <div className="relative bg-[#78350F] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#F5A623] rounded-full blur-[150px] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#FCD34D] backdrop-blur-md">
                                <Scroll size={12} className="animate-pulse" /> Eminent Council
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">Specially Appointed</h1>
                                <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif">"Wisdom in deliberation, justice in action."</p>
                            </div>
                        </div>
                        <div className="flex items-center shrink-0">
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-sm text-center space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Sentiment</p>
                                <p className="text-4xl font-serif font-black text-white">{d.communitySentiment}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard icon={Lightbulb} label="Advice Rooms" value={d.activeAdviceRooms} color="#F5A623" sub="Active Sessions" />
                    <StatCard icon={Scale} label="Pending Policies" value={d.pendingPolicies} color="#D97706" sub="Awaiting Review" />
                    <StatCard icon={Users} label="Council Reach" value="Global" color="#3B82F6" />
                </div>

                <div className="bg-white rounded-[2rem] p-8 sm:p-12 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Community Sentiment Pulse</h2>
                            <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Deliberation & Participation Metrics</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D97706]">
                                <div className="w-2 h-2 rounded-full bg-[#D97706]"></div> Sentiment
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]">
                                <div className="w-2 h-2 rounded-full bg-[#1A1A2E]"></div> Participation
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={d.monthlyChart}>
                                <defs>
                                    <linearGradient id="advisorG" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="advisorP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1A1A2E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1A1A2E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                <Area type="monotone" dataKey="contributions" stroke="#D97706" fill="url(#advisorG)" strokeWidth={3} name="Sentiment" />
                                <Area type="monotone" dataKey="disbursements" stroke="#1A1A2E" fill="url(#advisorP)" strokeWidth={3} name="Participation" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {renderModals()}
            </div>
        );
    }

    if (isOrganizer) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                <div className="relative bg-[#0F766E] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#14B8A6] rounded-full blur-[150px] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#5EEAD4] backdrop-blur-md">
                                <CalendarRange size={12} className="animate-pulse" /> Majlis Coordination
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">Meeting Organizer</h1>
                                <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif">"Orchestrating unity, facilitating brotherhood."</p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-sm space-y-1 text-center h-full flex flex-col justify-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Attendance Avg</p>
                                <p className="text-4xl font-serif font-black text-white">{d.avgAttendance}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Mic2} label="Upcoming Majlis" value={d.upcomingEvents} color="#14B8A6" sub="Next 30 Days" />
                    <StatCard icon={MapPin} label="Active Venues" value={d.totalVenues} color="#0D9488" />
                    <StatCard icon={Users} label="RSVP Count" value="1,240" color="#2DD4BF" trend={+10} />
                    <StatCard icon={Zap} label="Coordination" value="Optimized" color="#F5A623" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Event Attendance Trends</h2>
                                <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Historical Turnout</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="tealG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#14B8A6" fill="url(#tealG)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-[#0F766E] rounded-[2rem] p-8 sm:p-10 text-white shadow-xl space-y-6 flex flex-col">
                        <div className="space-y-1 pb-4 border-b border-white/10">
                            <h3 className="text-xl font-serif font-black flex items-center gap-3"><MapPin size={18} className="text-[#5EEAD4]" /> Venue Network</h3>
                            <p className="text-[10px] uppercase font-black text-white/50 tracking-[0.3em]">Approved Locations</p>
                        </div>
                        <div className="space-y-4 flex-1">
                            {['Grand Majlis Plaza', 'Royal Garden Hall', 'Unity Center', 'Brotherhood Lounge'].map((venue, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <p className="text-sm font-bold text-[#CCFBF1]">{venue}</p>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4] shadow-[0_0_8px_#5EEAD4]"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {renderModals()}
            </div>
        );
    }

    // ========== NEW MEMBER DASHBOARD (Rebranded) ==========
    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
            {/* Header / Hero Section */}
            <div className="relative bg-[#0B1221] rounded-[2rem] p-8 md:p-14 text-white shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-1000"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-[#FCD34D] text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 backdrop-blur-md">
                            <ShieldCheck size={12} className="animate-pulse" /> New Joiner Portal
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                Assalamu Alaikum, <br />
                                <span className="text-[#FCD34D]">{user?.name?.split(' ')[0] || 'Brother'}</span>.
                            </h1>
                            <p className="text-lg md:text-xl font-medium text-white/60 mt-4 leading-relaxed font-serif">
                                Welcome to the brotherhood. Your journey of growth and contribution starts here.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 shrink-0 pb-2">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">My Trust Sum</p>
                            <p className="text-2xl font-serif font-black text-white">{formatNaira(d.myStats.totalContributions)}</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm">
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Active Loan</p>
                            <p className="text-2xl font-serif font-black text-[#FCD34D]">
                                {d.myStats.activeLoan > 0 ? formatNaira(d.myStats.activeLoan) : 'None'}
                            </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-1 backdrop-blur-md shadow-sm col-span-2 sm:col-span-1">
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">Next Majlis</p>
                            <p className="text-lg font-bold text-[#34D399] flex items-center gap-2">
                                <Calendar size={16} /> {d.myStats.nextMeeting}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.05] pointer-events-none bg-[#F5A623]" />
                <div className="absolute bottom-[-20%] left-[10%] w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.03] pointer-events-none bg-[#3B82F6]" />
                <div className="absolute -bottom-20 -right-20 text-white/[0.01] -rotate-12 select-none group-hover:text-white/[0.03] transition-colors duration-1000">
                    <Fingerprint size={400} />
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard icon={Wallet} label="Treasury Balance" value={formatNaira(d.poolBalance)} color="#3B82F6" trend={+4.2} onClick={() => setSelectedWidget('balance')} />
                <StatCard icon={Gem} label="Milestone Rank" value={formatNaira(config.savingsGoal || d.savingsGoal)} color="#F5A623" sub={`${goalPct}% of Goal Achieved`} trend={+12} onClick={() => setSelectedWidget('goal')} />
                <StatCard icon={CheckCircle2} label="Weekly Payers" value={`${d.totalPaid} / ${d.totalMembers}`} color="#10B981" sub="Verified Payments" onClick={() => setSelectedWidget('attendance')} />
                <StatCard icon={Layers} label="Awaiting Dues" value={d.totalUnpaid} color="#F43F5E" sub="Pending Verification" onClick={() => setSelectedWidget('attendance')} />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Analytics */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-serif font-black text-[#1A1A2E] tracking-wide">Fiscal Trajectory</h2>
                            <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">6-Month Growth Analysis</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={d.monthlyChart}>
                                <defs>
                                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1A1A2E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1A1A2E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                                <Area type="monotone" dataKey="contributions" stroke="#F5A623" fill="url(#cg)" strokeWidth={3} name="Inflow" />
                                <Area type="monotone" dataKey="disbursements" stroke="#1A1A2E" fill="url(#dg)" strokeWidth={3} name="Outflow" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Goal Progress Sub-widget */}
                    <div className="pt-8 border-t border-black/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">Community Goal Engine</h3>
                            <span className="text-[10px] font-black text-[#F5A623] uppercase tracking-widest">{goalPct}% Complete</span>
                        </div>
                        <div className="relative w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-black/[0.03]">
                            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${goalPct}%`, background: 'linear-gradient(90deg, #F5A623, #FCD34D)' }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-black/40">COLLECTED: {formatNaira(d.poolBalance)}</span>
                            <span className="text-black/40">TARGET: {formatNaira(config.savingsGoal || d.savingsGoal)}</span>
                        </div>
                    </div>
                </div>

                {/* Audit Log / Recent Transactions */}
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 flex flex-col">
                    <div className="space-y-1 pb-4 border-b border-black/5">
                        <h2 className="text-xl font-serif font-black text-[#1A1A2E]">Registry Audit</h2>
                        <p className="text-[10px] uppercase font-black text-black/40 tracking-[0.3em]">Recent Monetary Events</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        {(d.recentTransactions || []).slice(0, 5).map((tx) => (
                            <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group flex items-center gap-4 p-4 rounded-2xl border border-black/[0.03] hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'contribution' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {txIcon(tx.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#1A1A2E] truncate group-hover:text-[#3B82F6] transition-colors">{tx.member}</p>
                                    <p className="text-[9px] text-black/40 uppercase tracking-widest mt-0.5">{tx.note}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}
                                    </p>
                                    <p className="text-[9px] font-black text-black/30 font-mono tracking-widest mt-0.5">{dayjs(tx.date).format('DD MMM')}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 mt-auto">
                        <div className="p-6 rounded-[1.5rem] bg-[#0F172A] text-white flex items-center justify-between relative overflow-hidden group shadow-xl border border-indigo-500/10">
                            <div className="relative z-10 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">System Notification</p>
                                <h4 className="text-sm font-bold text-[#60A5FA]">{config.systemNoticeTitle}</h4>
                                <p className="text-[10px] text-white/50 font-medium truncate max-w-[150px]">{config.systemNoticeBody}</p>
                            </div>
                            <button className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white">
                                <FileText size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {renderModals()}
        </div>
    );
}
