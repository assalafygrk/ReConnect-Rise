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

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, sub, color, onClick, trend }) => (
    <div
        onClick={onClick}
        className={`bg-white p-6 md:p-8 border border-black/10 shadow-[2px_2px_0px_rgba(0,0,0,0.05)] space-y-5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none' : ''}`}
    >
        <div className="flex items-center justify-between">
            <div className={`p-3 border transition-colors duration-300`} style={{ borderColor: `${color}30`, backgroundColor: `${color}05`, color: color }}>
                <Icon size={20} className="stroke-[2.5]" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] sm:text-xs font-black text-black/50 uppercase tracking-[0.25em]">{label}</p>
            <h4 className="text-3xl font-serif font-black text-[#1A1A2E] tracking-tight">{value}</h4>
            {sub && <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest pt-2 border-t border-black/5">{sub}</p>}
        </div>
    </div>
);

const MOCK_NEW_MEMBER = {
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

const MOCK_TREASURER = {
    poolBalance: 4250000,
    savingsGoal: 10000000,
    totalPaid: 185,
    totalUnpaid: 15,
    totalMembers: 200,
    liquidityRatio: 0.85,
    pendingDisbursements: 450000,
    recentTransactions: [
        { id: 1, type: 'disbursement', member: 'Community Project', amount: 450000, date: '2026-04-18', note: 'Bridge funding' },
        { id: 2, type: 'contribution', member: 'Group A Batch', amount: 125000, date: '2026-04-16', note: 'Weekly dues' },
        { id: 3, type: 'contribution', member: 'Group B Batch', amount: 95000, date: '2026-04-15', note: 'Weekly dues' },
        { id: 4, type: 'loan_repayment', member: 'Musa Bello', amount: 50000, date: '2026-04-14', note: 'Final repayment' },
        { id: 5, type: 'contribution', member: 'Group C Batch', amount: 110000, date: '2026-04-12', note: 'Weekly dues' },
    ],
    monthlyChart: [
        { month: 'Oct', contributions: 520000, disbursements: 80000 },
        { month: 'Nov', contributions: 680000, disbursements: 120000 },
        { month: 'Dec', contributions: 920000, disbursements: 450000 },
        { month: 'Jan', contributions: 860000, disbursements: 135000 },
        { month: 'Feb', contributions: 980000, disbursements: 180000 },
        { month: 'Mar', contributions: 1240000, disbursements: 500000 },
    ],
    myStats: {
        totalContributions: 25200,
        activeLoan: 0,
        nextMeeting: '15 Apr 2026',
    }
};

const MOCK_GROUP_LEADER = {
    poolBalance: 320000,
    savingsGoal: 500000,
    totalPaid: 42,
    totalUnpaid: 8,
    totalMembers: 50,
    groupName: "Unity Vanguard",
    participationRate: 84,
    recentTransactions: [
        { id: 1, type: 'contribution', member: 'Emeka Obi', amount: 5000, date: '2026-04-18', note: 'Weekly' },
        { id: 2, type: 'contribution', member: 'Tunde Lawal', amount: 5000, date: '2026-04-18', note: 'Weekly' },
        { id: 3, type: 'disbursement', member: 'Seun Adeyemi', amount: 15000, date: '2026-04-17', note: 'Welfare' },
        { id: 4, type: 'loan_repayment', member: 'Dare Balogun', amount: 10000, date: '2026-04-15', note: 'Repayment' },
        { id: 5, type: 'contribution', member: 'Femi Adeoye', amount: 5000, date: '2026-04-14', note: 'Weekly' },
    ],
    monthlyChart: [
        { month: 'Oct', contributions: 120000, disbursements: 20000 },
        { month: 'Nov', contributions: 135000, disbursements: 35000 },
        { month: 'Dec', contributions: 150000, disbursements: 80000 },
        { month: 'Jan', contributions: 145000, disbursements: 45000 },
        { month: 'Feb', contributions: 160000, disbursements: 60000 },
        { month: 'Mar', contributions: 185000, disbursements: 25000 },
    ],
    myStats: {
        totalContributions: 18200,
        activeLoan: 0,
        nextMeeting: '15 Apr 2026',
    }
};

const MOCK_WELFARE = {
    totalWelfareFunds: 850000,
    pendingRequests: 12,
    disbursedThisMonth: 145000,
    totalMembers: 200,
    recentTransactions: [
        { id: 1, type: 'disbursement', member: 'Bayo Ahmed', amount: 25000, date: '2026-04-19', note: 'Medical Support' },
        { id: 2, type: 'disbursement', member: 'Ibrahim Dan', amount: 15000, date: '2026-04-18', note: 'Bereavement' },
        { id: 3, type: 'contribution', member: 'Welfare Levy', amount: 50000, date: '2026-04-15', note: 'Monthly Levy' },
        { id: 4, type: 'disbursement', member: 'Janet Okafor', amount: 20000, date: '2026-04-12', note: 'Nuptial Gift' },
        { id: 5, type: 'disbursement', member: 'Abubakar Ali', amount: 10000, date: '2026-04-10', note: 'Emergency' },
    ],
    monthlyChart: [
        { month: 'Oct', contributions: 40000, disbursements: 35000 },
        { month: 'Nov', contributions: 45000, disbursements: 55000 },
        { month: 'Dec', contributions: 50000, disbursements: 95000 },
        { month: 'Jan', contributions: 55000, disbursements: 45000 },
        { month: 'Feb', contributions: 48000, disbursements: 65000 },
        { month: 'Mar', contributions: 60000, disbursements: 50000 },
    ],
    myStats: {
        totalContributions: 12500,
        activeLoan: 0,
        nextMeeting: '15 Apr 2026',
    }
};

const MOCK_OFFICIAL_MEMBER = {
    poolBalance: 4250000,
    savingsGoal: 10000000,
    totalPaid: 185,
    totalUnpaid: 15,
    totalMembers: 200,
    seniorityYears: 3,
    trustScore: 98,
    advocacyPoints: 450,
    recentTransactions: [
        { id: 1, type: 'contribution', member: 'Self', amount: 25000, date: '2026-04-18', note: 'Premium Dues' },
        { id: 2, type: 'loan_repayment', member: 'Self', amount: 50000, date: '2026-04-10', note: 'Loan Repayment' },
        { id: 3, type: 'contribution', member: 'Self', amount: 25000, date: '2026-03-18', note: 'Premium Dues' },
    ],
    monthlyChart: [
        { month: 'Oct', contributions: 20000, disbursements: 0 },
        { month: 'Nov', contributions: 25000, disbursements: 0 },
        { month: 'Dec', contributions: 30000, disbursements: 0 },
        { month: 'Jan', contributions: 25000, disbursements: 0 },
        { month: 'Feb', contributions: 25000, disbursements: 0 },
        { month: 'Mar', contributions: 35000, disbursements: 0 },
    ],
    myStats: {
        totalContributions: 850000,
        activeLoan: 150000,
        nextMeeting: '15 Apr 2026',
    }
};

const MOCK_ADVISOR = {
    activeAdviceRooms: 8,
    pendingPolicies: 3,
    communitySentiment: 92,
    totalMembers: 200,
    recentTransactions: [
        { id: 1, type: 'contribution', member: 'Board Dues', amount: 100000, date: '2026-04-15', note: 'Executive Dues' },
        { id: 2, type: 'disbursement', member: 'Policy Review', amount: 20000, date: '2026-04-10', note: 'Audit Expenses' },
    ],
    monthlyChart: [
        { month: 'Oct', contributions: 85, disbursements: 90 }, // Sentiment vs Participation
        { month: 'Nov', contributions: 88, disbursements: 85 },
        { month: 'Dec', contributions: 92, disbursements: 95 },
        { month: 'Jan', contributions: 90, disbursements: 88 },
        { month: 'Feb', contributions: 94, disbursements: 92 },
        { month: 'Mar', contributions: 96, disbursements: 94 },
    ],
    myStats: {
        totalContributions: 1250000,
        activeLoan: 0,
        nextMeeting: '15 Apr 2026',
    }
};

const MOCK_ORGANIZER = {
    upcomingEvents: 4,
    totalVenues: 12,
    avgAttendance: 145,
    totalMembers: 200,
    recentTransactions: [
        { id: 1, type: 'disbursement', member: 'Grand Majlis Plaza', amount: 150000, date: '2026-04-15', note: 'Venue Deposit' },
        { id: 2, type: 'disbursement', member: 'Catering Services', amount: 85000, date: '2026-04-12', note: 'Event Logistics' },
    ],
    monthlyChart: [
        { month: 'Oct', contributions: 120, disbursements: 110 }, // Attendance trends
        { month: 'Nov', contributions: 140, disbursements: 130 },
        { month: 'Dec', contributions: 200, disbursements: 180 },
        { month: 'Jan', contributions: 130, disbursements: 120 },
        { month: 'Feb', contributions: 155, disbursements: 140 },
        { month: 'Mar', contributions: 175, disbursements: 160 },
    ],
    myStats: {
        totalContributions: 45000,
        activeLoan: 0,
        nextMeeting: '15 Apr 2026',
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
        } catch {
            if (isTreasurer) setData(MOCK_TREASURER);
            else if (isGroupLeader) setData(MOCK_GROUP_LEADER);
            else if (isWelfare) setData(MOCK_WELFARE);
            else if (isOfficialMember) setData(MOCK_OFFICIAL_MEMBER);
            else if (isAdvisor) setData(MOCK_ADVISOR);
            else if (isOrganizer) setData(MOCK_ORGANIZER);
            else setData(MOCK_NEW_MEMBER);
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl p-6 sm:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 ${isAdmin ? 'bg-[#0f172a] text-white border border-slate-800' : 'bg-white'}`}>
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
                            <div className={`p-6 sm:p-8 rounded-lg text-center space-y-2 border ${isAdmin ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-[#FFF8F0] border-[#E8820C]/10'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-indigo-400' : 'text-[#E8820C]'}`}>Liquid Pool Status</p>
                                <h4 className={`text-4xl sm:text-5xl font-serif font-black tracking-tight ${isAdmin ? 'text-white' : 'text-[#1A1A2E]'}`}>{formatNaira(d.poolBalance)}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-6 rounded-lg flex flex-col items-center gap-2 border ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-100'}`}>
                                    <ArrowUpRight className={isAdmin ? 'text-emerald-400' : 'text-emerald-500'} size={24} />
                                    <div className="text-center">
                                        <p className={`text-[10px] font-black uppercase mb-1 ${isAdmin ? 'text-emerald-400' : 'text-emerald-600'}`}>Gross Inflows</p>
                                        <p className={`text-lg font-black ${isAdmin ? 'text-emerald-50' : 'text-emerald-900'}`}>₦185,400</p>
                                    </div>
                                </div>
                                <div className={`p-6 rounded-lg flex flex-col items-center gap-2 border ${isAdmin ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50/50 border-rose-100'}`}>
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
                            <div className={`flex items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-lg border shadow-xl overflow-hidden relative ${isAdmin ? 'bg-[#0a0f1c] border-slate-800 text-slate-300' : 'bg-[#1A1A2E] text-white border-white/10'}`}>
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center relative z-10 shadow-lg ${isAdmin ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-[#F5A623] text-[#1A1A2E]'}`}>
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
                                <div className={`p-6 sm:p-8 rounded-lg border text-center space-y-1 shadow-sm ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <p className={`text-4xl sm:text-5xl font-serif font-black ${isAdmin ? 'text-emerald-400' : 'text-emerald-700'}`}>{d.totalPaid}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-emerald-500/70' : 'text-emerald-600'}`}>Verified Dues</p>
                                </div>
                                <div className={`p-8 rounded-lg border text-center space-y-1 shadow-sm ${isAdmin ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
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
                                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-6 
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

    if (isGroupLeader) {
        return (
            <div className="max-w-7xl mx-auto pb-24 space-y-8 px-4">
                {/* Governing Premium Header */}
                <div className="relative bg-[#1e1b4b] rounded-xl p-8 md:p-14 text-white shadow-2xl overflow-hidden border border-indigo-500/20 group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-purple-600 rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 backdrop-blur-md">
                                <Crown size={14} className="animate-pulse" /> Operational Command
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                    {d.groupName || 'Alpha Vanguard'}
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/50 mt-4 leading-relaxed font-serif italic">
                                    "Governing with integrity, leading with vision."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-1 backdrop-blur-xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Participation</p>
                                <p className="text-2xl font-serif font-black text-white">{d.participationRate}%</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-1 backdrop-blur-xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Active Base</p>
                                <p className="text-2xl font-serif font-black text-white">{d.totalPaid}/{d.totalMembers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={Users} label="Group Strength" value={d.totalMembers} color="#818cf8" trend={+2} />
                    <StatCard icon={Target} label="Operational Goal" value={formatNaira(d.savingsGoal)} color="#c084fc" sub={`${goalPct}% Reached`} trend={+5} />
                    <StatCard icon={CheckCircle2} label="Verified Dues" value={d.totalPaid} color="#34d399" sub="Weekly Collection" />
                    <StatCard icon={ShieldCheck} label="Leadership Status" value="Elite" color="#f59e0b" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl p-8 sm:p-12 border border-black/5 shadow-xl space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-serif font-black text-[#1A1A2E]">Group Growth Matrix</h2>
                                <p className="text-[10px] uppercase font-black text-indigo-500 tracking-[0.3em]">Participation & Contribution Velocity</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="groupInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#818cf8" fill="url(#groupInflow)" strokeWidth={3} name="Group Inflow" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-black/5 shadow-xl space-y-8">
                        <h3 className="text-xl font-serif font-black flex items-center gap-2"><Clock size={20} className="text-indigo-500" /> Recent Activity</h3>
                        <div className="space-y-4">
                            {d.recentTransactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === 'contribution' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {txIcon(tx.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{tx.member}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{tx.note}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-black ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'contribution' ? '+' : '-'}{formatNaira(tx.amount)}
                                    </p>
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
                <div className="relative bg-[#064e3b] rounded-xl p-8 md:p-14 text-white shadow-2xl overflow-hidden border border-emerald-500/20 group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-gold-400 rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300 backdrop-blur-md">
                                <Landmark size={14} className="animate-pulse" /> Fiscal Stewardship
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                    Treasury Master
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/50 mt-4 leading-relaxed font-serif">
                                    "Precision in every coin, transparency in every record."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-1 backdrop-blur-xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Liquidity</p>
                                <p className="text-2xl font-serif font-black text-white">{(d.liquidityRatio * 100).toFixed(0)}%</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-1 backdrop-blur-xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">Pending</p>
                                <p className="text-2xl font-serif font-black text-white">{formatNaira(d.pendingDisbursements)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={CircleDollarSign} label="Total Liquid Pool" value={formatNaira(d.poolBalance)} color="#10b981" trend={+8} />
                    <StatCard icon={BarChart3} label="Revenue Velocity" value="+₦1.2M" color="#f59e0b" sub="Monthly Growth" trend={+12} />
                    <StatCard icon={Wallet} label="Expenditure" value={formatNaira(d.monthlyChart[d.monthlyChart.length-1].disbursements)} color="#f43f5e" sub="Recent Output" />
                    <StatCard icon={BadgeCheck} label="Audit Status" value="Verified" color="#34d399" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-[#022c22] rounded-xl p-8 sm:p-12 border border-emerald-900/50 shadow-2xl space-y-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-serif font-black text-white">Financial Trajectory Analysis</h2>
                                <p className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.3em]">Capital Inflow vs Strategic Expenditure</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="treasurerInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="treasurerOutflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#065f46" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#059669' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#059669' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #065f46', borderRadius: '16px', color: '#fff' }} />
                                    <Area type="monotone" dataKey="contributions" stroke="#10b981" fill="url(#treasurerInflow)" strokeWidth={3} name="Total Influx" />
                                    <Area type="monotone" dataKey="disbursements" stroke="#fb7185" fill="url(#treasurerOutflow)" strokeWidth={3} name="Resource Output" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-black/5 shadow-xl space-y-8 flex flex-col">
                        <h3 className="text-xl font-serif font-black flex items-center gap-2"><ArrowRight size={20} className="text-emerald-500" /> Fiscal Relay</h3>
                        <div className="space-y-4 flex-1">
                            {d.recentTransactions.map(tx => (
                                <div key={tx.id} className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className={`p-2 rounded-xl ${tx.type === 'contribution' ? 'bg-emerald-100 text-emerald-600' : 'bg-gold-100 text-gold-600'}`}>
                                                {txIcon(tx.type)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-emerald-900">{tx.member}</p>
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase">{tx.note}</p>
                                            </div>
                                        </div>
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
                <div className="relative bg-[#4c1d1b] rounded-xl p-8 md:p-14 text-white shadow-2xl overflow-hidden border border-rose-500/20 group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-rose-600 rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-rose-300 backdrop-blur-md">
                                <Heart size={14} className="animate-pulse" /> Humanitarian Support
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">
                                    Welfare Council
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-white/50 mt-4 leading-relaxed font-serif">
                                    "Your well-being is our shared responsibility."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 shrink-0">
                            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-1 backdrop-blur-xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">Requests</p>
                                <p className="text-2xl font-serif font-black text-white">{d.pendingRequests} Pending</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-1 backdrop-blur-xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">Spent</p>
                                <p className="text-2xl font-serif font-black text-white">{formatNaira(d.disbursedThisMonth)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard icon={HeartHandshake} label="Welfare Pool" value={formatNaira(d.totalWelfareFunds)} color="#f43f5e" />
                    <StatCard icon={HandHelping} label="Active Support" value={d.pendingRequests} color="#fb7185" sub="Awaiting Review" />
                    <StatCard icon={Gift} label="Gift Grants" value="5" color="#ec4899" sub="This Month" />
                    <StatCard icon={BadgeCheck} label="Care Status" value="Active" color="#34d399" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl p-8 sm:p-12 border border-black/5 shadow-xl space-y-10">
                        <h2 className="text-2xl font-serif font-black text-[#1A1A2E]">Well-being Distribution</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="welfareInflow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="disbursements" stroke="#f43f5e" fill="url(#welfareInflow)" strokeWidth={3} name="Welfare Output" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-black/5 shadow-xl space-y-8">
                        <h3 className="text-xl font-serif font-black flex items-center gap-2 text-rose-600"><Gift size={20} /> Latest Grants</h3>
                        <div className="space-y-4">
                            {d.recentTransactions.map(tx => (
                                <div key={tx.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-rose-900">{tx.member}</p>
                                        <p className="text-[10px] text-rose-500 uppercase">{tx.note}</p>
                                    </div>
                                    <p className="text-sm font-black text-rose-600">{formatNaira(tx.amount)}</p>
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
                <div className="relative bg-[#1e293b] rounded-xl p-8 md:p-14 text-white shadow-2xl overflow-hidden border border-slate-500/20 group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-slate-400 rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                                <Award size={14} className="text-indigo-400" /> Brotherhood Core
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-serif font-black">Official Member</h1>
                            <p className="text-lg text-slate-400 font-serif">Welcome back, Brother {user?.name?.split(' ')[0]}. You have served for {d.seniorityYears} years.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 backdrop-blur-md">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-indigo-400">{d.trustScore}</p>
                                    <p className="text-[8px] font-bold uppercase text-slate-400">Trust</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Advocacy Pool</p>
                                <p className="text-xl font-bold text-white flex items-center gap-2"><Star size={16} className="text-indigo-400" /> {d.advocacyPoints} pts</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Trophy} label="Seniority Rank" value={`${d.seniorityYears} Years`} color="#64748b" sub="Active Status" />
                    <StatCard icon={ShieldCheck} label="Trust Score" value={`${d.trustScore}%`} color="#818cf8" sub="Peer Verified" />
                    <StatCard icon={Gem} label="Total Contributions" value={formatNaira(d.myStats.totalContributions)} color="#fbbf24" trend={+15} />
                    <StatCard icon={Activity} label="Participation" value="High" color="#10b981" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl p-8 border border-black/5 shadow-xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-serif font-black text-[#1A1A2E]">Accumulated Legacy</h2>
                            <span className="px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Steady Growth</span>
                        </div>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="legacyG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="contributions" stroke="#818cf8" fill="url(#legacyG)" strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-8 border border-black/5 shadow-xl space-y-6">
                        <h2 className="text-xl font-serif font-black text-[#1A1A2E]">Member Advocacy Stats</h2>
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black">A</div>
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">Advocacy Reach</p>
                                        <p className="text-xs text-indigo-500">How many members you've influenced</p>
                                    </div>
                                </div>
                                <p className="text-lg font-black text-indigo-600">85%</p>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">V</div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900">Verification Speed</p>
                                        <p className="text-xs text-emerald-500">Average time to verify dues</p>
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
                <div className="relative bg-[#3b2a1a] rounded-xl p-8 md:p-14 text-white shadow-2xl overflow-hidden border border-amber-500/20 group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-amber-600 rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-amber-300">
                                <Scroll size={14} className="animate-pulse" /> Eminent Council
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">Specially Appointed</h1>
                                <p className="text-lg md:text-xl font-medium text-white/50 mt-4 leading-relaxed font-serif">"Wisdom in deliberation, justice in action."</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-8 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-center space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">Sentiment</p>
                                <p className="text-4xl font-serif font-black text-white">{d.communitySentiment}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard icon={Lightbulb} label="Advice Rooms" value={d.activeAdviceRooms} color="#fbbf24" sub="Active Sessions" />
                    <StatCard icon={Scale} label="Pending Policies" value={d.pendingPolicies} color="#d97706" sub="Awaiting Review" />
                    <StatCard icon={Users} label="Council Reach" value="Global" color="#818cf8" />
                </div>

                <div className="bg-white rounded-xl p-10 border border-black/5 shadow-xl space-y-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-serif font-black text-[#1A1A2E]">Community Sentiment Pulse</h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div> Sentiment
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]">
                                <div className="w-3 h-3 rounded-full bg-[#1A1A2E]"></div> Participation
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={d.monthlyChart}>
                                <Area type="monotone" dataKey="contributions" stroke="#d97706" fill="#fef3c7" strokeWidth={4} name="Sentiment" />
                                <Area type="monotone" dataKey="disbursements" stroke="#1A1A2E" fill="#f3f4f6" strokeWidth={4} name="Participation" />
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
                <div className="relative bg-[#134e4a] rounded-xl p-8 md:p-14 text-white shadow-2xl overflow-hidden border border-teal-500/20 group">
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-teal-600 rounded-full blur-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[10px] font-black uppercase tracking-[0.4em] text-teal-300">
                                <CalendarRange size={14} className="animate-pulse" /> Majlis Coordination
                            </div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-white">Meeting Organizer</h1>
                                <p className="text-lg md:text-xl font-medium text-white/50 mt-4 leading-relaxed font-serif">"Orchestrating unity, facilitating brotherhood."</p>
                            </div>
                        </div>
                        <div className="bg-white/5 p-8 rounded-xl border border-white/10 backdrop-blur-xl space-y-2 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-300">Attendance Avg</p>
                            <p className="text-4xl font-serif font-black text-white">{d.avgAttendance}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Mic2} label="Upcoming Majlis" value={d.upcomingEvents} color="#14b8a6" sub="Next 30 Days" />
                    <StatCard icon={MapPin} label="Active Venues" value={d.totalVenues} color="#0d9488" />
                    <StatCard icon={Users} label="RSVP Count" value="1,240" color="#2dd4bf" trend={+10} />
                    <StatCard icon={Zap} label="Coordination" value="Optimized" color="#f59e0b" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl p-10 border border-black/5 shadow-xl space-y-8">
                        <h2 className="text-2xl font-serif font-black text-[#1A1A2E]">Event Attendance Trends</h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={d.monthlyChart}>
                                    <defs>
                                        <linearGradient id="tealG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="contributions" stroke="#14b8a6" fill="url(#tealG)" strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-[#134e4a] rounded-xl p-8 text-white shadow-xl space-y-6">
                        <h3 className="text-xl font-serif font-black flex items-center gap-3"><MapPin size={22} className="text-teal-400" /> Venue Network</h3>
                        <div className="space-y-4 pt-4">
                            {['Grand Majlis Plaza', 'Royal Garden Hall', 'Unity Center', 'Brotherhood Lounge'].map((venue, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-sm font-bold text-teal-100">{venue}</p>
                                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
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
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Header / Hero Section */}
            <div className="relative bg-[#1A1A2E] rounded-xl p-6 sm:p-8 md:p-12 text-white shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-center">
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="space-y-4 max-w-md">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 backdrop-blur-sm">
                            <ShieldCheck size={12} /> New Joiner Portal
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
                            Assalamu Alaikum, <br />
                            <span className="text-[#F5A623]">{user?.name?.split(' ')[0] || 'Brother'}</span>.
                        </h1>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            Welcome to the brotherhood. Your journey of growth and contribution starts here. Explore the tools below to manage your membership.
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
                <div className="bg-white rounded-xl p-6 sm:p-10 border border-black/5 shadow-sm space-y-8">
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
                <div className="bg-white rounded-xl p-6 sm:p-10 border border-black/5 shadow-sm space-y-8">
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
                            <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group flex items-center gap-4 p-4 rounded-xl border border-black/[0.02] hover:bg-gray-50 hover:border-black/5 transition-all cursor-pointer">
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
                        <div className="p-6 rounded-lg bg-[#1A1A2E] text-white flex items-center justify-between relative overflow-hidden group shadow-xl">
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
