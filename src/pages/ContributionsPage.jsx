import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    CheckCircle2, Clock, Wallet, Calendar, Save, Search,
    Loader2, AlertCircle, TrendingUp, ShieldCheck, Plus, X,
    ArrowDownCircle, CreditCard, Users, Fingerprint, Lock,
    ChevronRight, Info, Filter, MoreHorizontal, Download,
    Shield
} from 'lucide-react';
import dayjs from 'dayjs';
import { fetchWeeklyStatus, markMemberPaid, payViaWallet, recordGeneralContribution, recordBatchContributions, fetchWeeks, recordHistoricalData } from '../api/contributions';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import { apiSetTransactionPin, apiGetProfile } from '../api/auth';

const fmt = (v) => `₦${Number(v || 0).toLocaleString('en-NG')}`;

function DeadlineCountdown({ deadline }) {
    const [diff, setDiff] = useState('');
    useEffect(() => {
        const tick = () => {
            const ms = new Date(deadline) - new Date();
            if (ms <= 0) { setDiff('CLOSED'); return; }
            const h = Math.floor(ms / 3600000);
            const m = Math.floor((ms % 3600000) / 60000);
            const s = Math.floor((ms % 60000) / 1000);
            setDiff(`${h}h ${m}m ${s}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [deadline]);
    const isUrgent = new Date(deadline) - new Date() < 3600000 * 6;
    return (
        <div className="flex items-center gap-2">
            <Clock size={12} className={isUrgent ? 'text-red-500 animate-pulse' : 'text-[#E8820C]'} />
            <span className={`font-mono font-black text-sm ${isUrgent ? 'text-red-500 animate-pulse' : 'text-[#E8820C]'}`}>
                {diff}
            </span>
        </div>
    );
}

export default function ContributionsPage() {
    const { hasRole, user, ROLES, userProfile, setUserProfile } = useAuth();
    const { config } = usePageConfig('contributions');
    const isTreasurer = hasRole(ROLES.TREASURER);
    const isAdmin = hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPER_ADMIN);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // memberId being processed
    const [weekData, setWeekData] = useState(null);
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState('');
    const [search, setSearch] = useState('');
    const [showGeneralForm, setShowGeneralForm] = useState(false);
    const [genForm, setGenForm] = useState({ amount: '', pin: '', note: '', reference: '' });
    const [payingWallet, setPayingWallet] = useState(false);
    const [payPin, setPayPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);
    const [showHistoryForm, setShowHistoryForm] = useState(false);
    const [historyForm, setHistoryForm] = useState({ memberIds: [], weekId: '', amount: '', paymentChannel: 'cash', date: dayjs().format('YYYY-MM-DD'), note: '' });

    // PIN Setup State
    const [contribSetupPin, setContribSetupPin] = useState('');
    const [contribSetupConfirm, setContribSetupConfirm] = useState('');
    const [settingContribPin, setSettingContribPin] = useState(false);

    const handleContribPinSetup = async (targetField) => {
        if (contribSetupPin !== contribSetupConfirm) return toast.error('PINs do not match');
        if (contribSetupPin.length !== 4) return toast.error('PIN must be 4 digits');
        setSettingContribPin(true);
        try {
            await apiSetTransactionPin(contribSetupPin);
            toast.success('Transaction PIN configured successfully');
            const updatedProfile = await apiGetProfile();
            setUserProfile(updatedProfile);
            if (targetField === 'weekly') setPayPin(contribSetupPin);
            if (targetField === 'general') setGenForm(prev => ({ ...prev, pin: contribSetupPin }));
            setContribSetupPin('');
            setContribSetupConfirm('');
        } catch (err) { toast.error(err.message); }
        finally { setSettingContribPin(false); }
    };

    const loadData = async (weekId) => {
        setLoading(true);
        try {
            const data = await fetchWeeklyStatus(weekId || selectedWeek);
            setWeekData(data);
            if (!selectedWeek) setSelectedWeek(data.weekId);
            
            const weeks = await fetchWeeks();
            setAvailableWeeks(weeks);
        } catch (err) {
            toast.error('Failed to synchronize financial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [selectedWeek]);

    const handleMarkPaid = async (memberId, memberName, paymentChannel = 'cash') => {
        setActionLoading(memberId);
        try {
            await markMemberPaid({ memberId, weekId: selectedWeek, paymentChannel, amount: weekData?.baseAmount });
            toast.success(`${memberName} marked as paid (${paymentChannel})`);
            loadData(selectedWeek);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleWalletPay = async () => {
        setPayingWallet(true);
        try {
            const res = await payViaWallet(payPin);
            toast.success(`₦${weekData?.baseAmount} contribution paid from your wallet! New balance: ${fmt(res.newWalletBalance)}`);
            loadData(selectedWeek);
            setPayPin('');
            setShowPinInput(false);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPayingWallet(false);
        }
    };

    const handleGeneralContribution = async (e) => {
        e.preventDefault();
        if (genForm.pin.length !== 4) return toast.error('Valid 4-digit PIN required');
        
        setPayingWallet(true);
        try {
            await recordGeneralContribution({ 
                amount: Number(genForm.amount), 
                paymentChannel: 'wallet', 
                pin: genForm.pin,
                note: genForm.note, 
                reference: genForm.reference 
            });
            toast.success('General pool contribution synchronized from wallet!');
            setShowGeneralForm(false);
            setGenForm({ amount: '', pin: '', note: '', reference: '' });
            loadData(selectedWeek);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPayingWallet(false);
        }
    };

    const toggleMemberSelection = (memberId) => {
        setHistoryForm(prev => {
            const exists = prev.memberIds.includes(memberId);
            return {
                ...prev,
                memberIds: exists 
                    ? prev.memberIds.filter(id => id !== memberId)
                    : [...prev.memberIds, memberId]
            };
        });
    };

    const handleRecordHistory = async (e) => {
        e.preventDefault();
        if (historyForm.memberIds.length === 0) return toast.error('Selection required');
        setPayingWallet(true);
        try {
            await recordHistoricalData({ 
                memberIds: historyForm.memberIds, 
                weekId: historyForm.weekId, 
                amount: historyForm.amount || weekData?.baseAmount,
                paymentChannel: historyForm.paymentChannel,
                date: historyForm.date,
                note: historyForm.note
            });
            toast.success('Historical entries synchronized');
            setShowHistoryForm(false);
            setHistoryForm({ memberIds: [], weekId: '', amount: '', paymentChannel: 'cash', date: dayjs().format('YYYY-MM-DD'), note: '' });
            loadData(selectedWeek);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPayingWallet(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <Loader2 className="animate-spin text-[#E8820C]" size={48} />
                <div className="absolute inset-0 blur-xl bg-[#E8820C]/20 rounded-full animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 animate-pulse">Initializing Financial Core...</p>
        </div>
    );

    const members = weekData?.memberStatus || [];
    const filtered = members.filter(m => m.memberName?.toLowerCase().includes(search.toLowerCase()));
    const paidCount = members.filter(m => m.paid).length;
    const myRecord = members.find(m => String(m.memberId) === String(user?.id || user?._id));
    const myPaid = myRecord?.paid || false;
    const baseAmount = weekData?.baseAmount || 100;

    return (
        <div className="max-w-7xl mx-auto pb-32 space-y-8 md:space-y-16 px-3 md:px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {/* Header: Tactical Financial HUD - Optimized Size */}
            <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[4rem] bg-[#1A1A2E] dark:bg-[#0F172A] p-6 md:p-16 text-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-white/5">
                <div className="absolute top-0 right-0 p-12 md:p-24 text-white/5 rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
                    <ShieldCheck size={200} md:size={400} />
                </div>
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, #E8820C 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
 
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-16">
                    <div className="space-y-4 md:space-y-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 md:gap-5">
                                <span className="px-3 py-1 md:px-5 md:py-2 bg-[#E8820C] text-black text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] rounded-lg shadow-lg">Operational</span>
                                <span className="h-px w-8 md:w-20 bg-white/20" />
                                <span className="text-[8px] md:text-[11px] font-mono text-[#E8820C] uppercase tracking-[0.3em] md:tracking-[0.5em] font-black">{weekData?.weekId}</span>
                            </div>
                            <h1 className="text-3xl md:text-8xl font-black font-serif tracking-tighter leading-[0.9] italic uppercase">
                                {config.pageHeadline || 'Consolidated Vault'}
                            </h1>
                        </div>
                        <p className="text-white/40 text-xs md:text-xl font-serif max-w-xl leading-relaxed italic border-l-2 md:border-l-4 border-[#E8820C]/30 pl-4 md:pl-10">
                            {config.pageSubtitle || 'Strategic resource consolidation. Growth through mutual commitment.'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 md:gap-10 pt-2 md:pt-6">
                            <div className="space-y-1.5 md:space-y-3">
                                <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/20">Temporal Window</p>
                                <div className="bg-white/5 backdrop-blur-xl px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-2xl border border-white/10">
                                    <DeadlineCountdown deadline={weekData?.deadline} />
                                </div>
                            </div>
                            <div className="h-10 md:h-16 w-px bg-white/10 hidden sm:block" />
                            <div className="space-y-1.5 md:space-y-3">
                                <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/20">System Status</p>
                                {weekData?.weekOpen ? (
                                    <div className="flex items-center gap-2 md:gap-3 text-emerald-400 bg-emerald-500/5 px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-2xl border border-emerald-500/10">
                                        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                        <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em]">Active Intake</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 md:gap-3 text-red-400 bg-red-500/5 px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-2xl border border-red-500/10">
                                        <Lock size={12} md:size={16} />
                                        <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em]">Cycle Locked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
 
                    <div className="grid grid-cols-2 lg:flex lg:flex-col gap-3 md:gap-6 w-full lg:w-auto">
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-10 border border-white/10 hover:bg-white/10 transition-all group/card shadow-2xl flex-1">
                            <div className="flex justify-between items-start mb-1 md:mb-4">
                                <Users size={14} md:size={24} className="text-[#E8820C]" />
                                <span className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">Compliance</span>
                            </div>
                            <p className="text-2xl md:text-6xl font-black font-serif italic text-white leading-none">{Math.round((paidCount / (members.length || 1)) * 100)}%</p>
                            <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1 md:mt-4">{paidCount} of {members.length} Paid</p>
                        </div>
                        <div className="bg-[#E8820C] rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-10 shadow-xl hover:scale-[1.02] transition-transform duration-700 flex-1">
                            <div className="flex justify-between items-start mb-1 md:mb-4 text-black/40">
                                <TrendingUp size={14} md:size={24} />
                                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">Intake</span>
                            </div>
                            <p className="text-xl md:text-5xl font-black font-serif italic text-black leading-none">{fmt(weekData?.totalCollected)}</p>
                            <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/60 mt-1 md:mt-4">Aggregate Value</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MEMBER (basic) self-service panel — General Contribution Only */}
            {(user?.role === 'member') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-[2rem] md:rounded-[3rem] border border-black/5 dark:border-white/10 shadow-xl p-6 md:p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8820C]/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                        <div className="relative z-10 space-y-6 md:space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-serif font-black text-[#1A1A2E] dark:text-white uppercase tracking-tighter">General Contribution</h3>
                                    <p className="text-[8px] md:text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest italic">Voluntary Pool Deposits</p>
                                </div>
                                <div className="px-4 py-1.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                    Open
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50/50 dark:bg-blue-950/10 rounded-[2rem] border-2 border-blue-100 dark:border-blue-900/30 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-blue-500 text-white">
                                        <ArrowDownCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Contribution Type</p>
                                        <p className="font-black text-sm text-blue-600">General Pool — Any Amount</p>
                                    </div>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-black/5 dark:border-white/5">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">Your Role</p>
                                    <p className="text-sm font-black dark:text-white">New Member — Weekly contributions unlock after promotion to Official Member</p>
                                </div>
                            </div>

                            <button onClick={() => setShowGeneralForm(true)}
                                className="w-full flex items-center justify-center gap-4 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] px-8 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group">
                                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                Make General Contribution
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#1A1A2E] dark:bg-[#0F172A] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12"><Info size={150} /></div>
                            <div className="relative z-10 space-y-8">
                                <h3 className="text-xl font-black font-serif uppercase tracking-tighter italic">Member Info</h3>
                                <div className="space-y-6">
                                    {[
                                        "As a new member, you can contribute to the General Pool.",
                                        "Weekly contributions are available to Official Members only.",
                                        "You will be eligible for promotion after 3 days.",
                                        "All contributions are non-refundable once confirmed."
                                    ].map((rule, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-6 h-6 rounded-lg bg-[#E8820C] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 text-black">0{i+1}</div>
                                            <p className="text-sm font-serif italic text-white/60 leading-relaxed">{rule}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OFFICIAL MEMBER self-service panel — Weekly Contribution */}
            {(!isTreasurer && !isAdmin && user?.role !== 'member') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-[2rem] md:rounded-[3rem] border border-black/5 dark:border-white/10 shadow-xl p-6 md:p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E8820C]/5 rounded-full -mr-24 -mt-24 blur-3xl" />
                        <div className="relative z-10 space-y-6 md:space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-serif font-black text-[#1A1A2E] dark:text-white uppercase tracking-tighter">My Contribution</h3>
                                    <p className="text-[8px] md:text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest italic">{weekData?.weekId} Status</p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest ${myPaid ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'}`}>
                                    {myPaid ? 'Cleared ✓' : 'Pending'}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all duration-500 flex flex-col gap-4 ${myPaid ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/5 shadow-lg' : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 shadow-amber-500/5 shadow-lg'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${myPaid ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                            {myPaid ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Status</p>
                                            <p className={`font-black text-sm ${myPaid ? 'text-emerald-600' : 'text-amber-600'}`}>{myPaid ? 'Cleared & Recorded' : 'Pending Transaction'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-3 border-t border-black/5 dark:border-white/5">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">Mandatory Weekly Input</p>
                                        <p className="text-2xl font-serif font-black dark:text-white">{fmt(baseAmount)}</p>
                                        {myRecord?.bonus > 0 && <p className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">+{fmt(myRecord.bonus)} Contribution Bonus</p>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {!myPaid && weekData?.weekOpen ? (
                                        <div className="bg-gray-50 dark:bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-black/5 dark:border-white/10 flex flex-col justify-center h-full">
                                            {showPinInput ? (
                                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                    {!userProfile?.hasTransactionPin ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-[#E8820C]/10 rounded-xl flex items-center justify-center text-[#E8820C]"><ShieldCheck size={20} /></div>
                                                                <div>
                                                                    <p className="text-xs font-black text-[#1A1A2E] dark:text-white">Security Initialization</p>
                                                                    <p className="text-[9px] text-black/40 dark:text-white/40">Set a 4-digit PIN before your first payment</p>
                                                                </div>
                                                            </div>
                                                            <input type="password" maxLength={4} value={contribSetupPin} onChange={e => setContribSetupPin(e.target.value.replace(/\D/g, ''))}
                                                                className="w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-5 text-center text-3xl font-black tracking-[0.6em] outline-none transition-all" placeholder="New PIN" autoFocus />
                                                            <input type="password" maxLength={4} value={contribSetupConfirm} onChange={e => setContribSetupConfirm(e.target.value.replace(/\D/g, ''))}
                                                                className="w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-5 text-center text-3xl font-black tracking-[0.6em] outline-none transition-all" placeholder="Confirm PIN" />
                                                            <div className="flex gap-3">
                                                                <button type="button" disabled={settingContribPin || contribSetupPin.length !== 4 || contribSetupConfirm.length !== 4} onClick={() => handleContribPinSetup('weekly')}
                                                                    className="flex-1 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all shadow-xl">
                                                                    {settingContribPin ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Configure PIN'}
                                                                </button>
                                                                <button onClick={() => { setShowPinInput(false); setContribSetupPin(''); setContribSetupConfirm(''); }}
                                                                    className="px-6 bg-red-500/10 text-red-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/10 hover:bg-red-500/20 transition-all">
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="text-center space-y-2">
                                                                <Fingerprint size={32} className="mx-auto text-[#E8820C] mb-2" />
                                                                <h4 className="text-sm font-black uppercase tracking-widest dark:text-white">Secure Authorization</h4>
                                                                <p className="text-[10px] text-black/40 dark:text-white/40 italic">Enter your 4-digit Transaction PIN</p>
                                                            </div>
                                                            <input 
                                                                type="password" 
                                                                maxLength="4" 
                                                                value={payPin} 
                                                                onChange={(e) => setPayPin(e.target.value.replace(/\D/g, ''))}
                                                                className="w-full bg-white dark:bg-black/20 border-2 border-black/5 dark:border-white/10 rounded-2xl px-4 py-5 text-center text-3xl font-black tracking-[0.6em] outline-none focus:border-[#E8820C] transition-all"
                                                                placeholder="••••"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-3">
                                                                <button 
                                                                    onClick={handleWalletPay} 
                                                                    disabled={payingWallet || payPin.length !== 4}
                                                                    className="flex-1 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-[#1A1A2E]/20 dark:shadow-white/5"
                                                                >
                                                                    {payingWallet ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm Payment'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => { setShowPinInput(false); setPayPin(''); }}
                                                                    className="px-6 bg-red-500/10 text-red-500 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/10 hover:bg-red-500/20 transition-all"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-8">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 text-center italic">Ready to settle?</p>
                                                        <button onClick={() => setShowPinInput(true)} disabled={payingWallet}
                                                            className="w-full flex items-center justify-center gap-4 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] px-8 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 group">
                                                            <Wallet size={20} className="group-hover:rotate-12 transition-transform" /> 
                                                            Pay From Vault
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="text-[9px] text-center text-black/20 dark:text-white/20 uppercase font-bold tracking-widest">
                                                        Automated deduction from personal wallet balance
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-8 border border-black/5 dark:border-white/10 flex flex-col items-center justify-center h-full text-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <Shield size={32} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Ledger Entry Locked</p>
                                                <p className="text-xs font-serif italic text-black/30 dark:text-white/30 mt-2 px-6">
                                                    {myPaid ? "You have fulfilled your weekly duty. The treasury acknowledges your commitment." : "Intake window closed. Contact the Treasurer for manual reconciliation."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#1A1A2E] dark:bg-[#0F172A] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                            <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12"><Info size={150} /></div>
                            <div className="relative z-10 space-y-8">
                                <h3 className="text-xl font-black font-serif uppercase tracking-tighter italic">Protocols</h3>
                                <div className="space-y-6">
                                    {[
                                        "Contribution window closes Sunday 23:49.",
                                        "Wallet contributions require valid transaction PIN.",
                                        "All payments are non-refundable once confirmed.",
                                        "Consolidated funds are allocated by executive vote."
                                    ].map((rule, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-6 h-6 rounded-lg bg-[#E8820C] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 text-black">0{i+1}</div>
                                            <p className="text-sm font-serif italic text-white/60 leading-relaxed">{rule}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setShowGeneralForm(true)}
                                    className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    <Plus size={16} /> Voluntary Pool Input
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OFFICIAL MEMBERS / ADMINS — weekly ledger table */}
            {(user?.role !== 'member') && (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-serif font-black text-[#1A1A2E] dark:text-white uppercase tracking-tighter">Strategic Ledger</h2>
                            <p className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">{selectedWeek} Compliance Audit</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group">
                                <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#E8820C]" />
                                <select 
                                    value={selectedWeek} 
                                    onChange={e => setSelectedWeek(e.target.value)}
                                    className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 focus:border-[#E8820C] rounded-2xl pl-12 pr-10 py-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all w-full sm:w-48 shadow-xl shadow-black/5 dark:shadow-none dark:text-white"
                                >
                                    {availableWeeks.map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative group">
                                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20 group-focus-within:text-[#E8820C] transition-colors" />
                                <input 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                    placeholder="SEARCH MEMBERS..."
                                    className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 focus:border-[#E8820C] rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all w-full sm:w-56 shadow-xl shadow-black/5 dark:shadow-none dark:text-white" 
                                />
                            </div>
                            {isTreasurer && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowHistoryForm(true)}
                                        className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-2xl hover:bg-emerald-500/20 transition-all"
                                        title="Record Historical Data">
                                        <Calendar size={20} />
                                    </button>
                                    <button onClick={() => setShowGeneralForm(true)}
                                        className="p-4 bg-[#E8820C]/10 text-[#E8820C] border border-[#E8820C]/10 rounded-2xl hover:bg-[#E8820C]/20 transition-all"
                                        title="General Contribution">
                                        <Plus size={20} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const headers = ['Member', 'Email', 'Role', 'Status', 'Amount', 'Channel', 'Date'];
                                            const rows = filtered.map(m => [m.memberName, m.memberEmail, m.role, m.paid ? 'Paid' : 'Pending', m.amount, m.paymentChannel, m.paidAt]);
                                            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
                                            const blob = new Blob([csv], { type: 'text/csv' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `Ledger-${selectedWeek}.csv`;
                                            a.click();
                                        }}
                                        className="p-4 bg-[#1A1A2E]/5 dark:bg-white/5 text-[#1A1A2E] dark:text-white border border-black/5 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                                        <Download size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden">
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em] text-left">Member Profile</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em] text-left">Designation</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em] text-center">Status</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em] text-center">Input Value</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em] text-center">Gateway</th>
                                        {isTreasurer && <th className="px-10 py-6 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.3em] text-right">Verification</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                    {filtered.map(m => (
                                        <tr key={m.memberId} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] flex items-center justify-center text-sm font-black text-white shadow-lg group-hover:scale-110 transition-transform duration-500 uppercase">
                                                        {m.memberName?.[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-[#1A1A2E] dark:text-white uppercase tracking-tight">{m.memberName}</span>
                                                        <span className="text-[10px] text-black/30 dark:text-white/30 font-medium italic">{m.memberEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">{m.role?.replace(/[-_]/g, ' ')}</span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {m.paid
                                                        ? <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/10 shadow-sm"><CheckCircle2 size={12} />Cleared</span>
                                                        : <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-500/10 shadow-sm"><Clock size={12} />Awaiting</span>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-black text-[#1A1A2E] dark:text-white">{m.paid ? fmt(m.amount) : '—'}</span>
                                                    {m.bonus > 0 && <span className="text-[8px] text-emerald-600 font-bold uppercase mt-0.5">+{fmt(m.bonus)} Premium</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex items-center justify-center">
                                                    {m.paymentChannel ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">{m.paymentChannel}</span>
                                                            <span className="text-[8px] text-black/20 dark:text-white/20 font-bold">{dayjs(m.paidAt).format('DD MMM, HH:mm')}</span>
                                                        </div>
                                                    ) : <span className="text-black/10 dark:text-white/10">—</span>}
                                                </div>
                                            </td>
                                            {isTreasurer && (
                                                <td className="px-10 py-6 text-right">
                                                    {!m.paid && weekData?.weekOpen ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'cash')} disabled={actionLoading === m.memberId}
                                                                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                                                                {actionLoading === m.memberId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Cash Verify
                                                            </button>
                                                            <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'wallet')} disabled={actionLoading === m.memberId}
                                                                className="px-4 py-2.5 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-black/20 disabled:opacity-50">
                                                                {actionLoading === m.memberId ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />} Vault Force
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end">
                                                            {m.paid ? (
                                                                <button className="p-3 text-black/20 dark:text-white/20 hover:text-[#E8820C] transition-colors"><MoreHorizontal size={20} /></button>
                                                            ) : (
                                                                <span className="text-[9px] text-red-500/40 font-black uppercase tracking-widest border border-red-500/10 px-3 py-1 rounded-lg">Deadline Breach</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="lg:hidden divide-y divide-black/5 dark:divide-white/5">
                            {filtered.map(m => (
                                <div key={m.memberId} className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] flex items-center justify-center text-sm font-black text-white shadow-lg uppercase">
                                                {m.memberName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1A1A2E] dark:text-white uppercase tracking-tight">{m.memberName}</p>
                                                <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[8px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">{m.role?.replace(/[-_]/g, ' ')}</span>
                                            </div>
                                        </div>
                                        {m.paid
                                            ? <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            : <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                                        }
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Value</p>
                                            <p className="text-sm font-black text-[#1A1A2E] dark:text-white">{m.paid ? fmt(m.amount) : '—'}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mb-1">Gateway</p>
                                            <p className="text-[9px] font-black text-black/40 dark:text-white/40 uppercase truncate">{m.paymentChannel || 'PENDING'}</p>
                                        </div>
                                    </div>

                                    {isTreasurer && !m.paid && weekData?.weekOpen && (
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'cash')} disabled={actionLoading === m.memberId}
                                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                                                {actionLoading === m.memberId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Cash Verify
                                            </button>
                                            <button onClick={() => handleMarkPaid(m.memberId, m.memberName, 'wallet')} disabled={actionLoading === m.memberId}
                                                className="w-full py-4 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                                                {actionLoading === m.memberId ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />} Vault
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="py-24 text-center">
                                <Users size={64} className="mx-auto text-black/5 dark:text-white/5 mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 dark:text-white/20">Zero Records Found In Current Grid</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* General Contribution Modal - Updated to Wallet Only */}
            {showGeneralForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/80 backdrop-blur-2xl" onClick={() => setShowGeneralForm(false)} />
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-500 border border-white/5">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-serif font-black text-[#1A1A2E] dark:text-white uppercase tracking-tighter italic">Voluntary Input</h3>
                                <p className="text-[10px] text-[#E8820C] font-black uppercase tracking-[0.2em] italic">Vault Auto-Deduction</p>
                            </div>
                            <button onClick={() => setShowGeneralForm(false)} className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-black/20 dark:text-white/20 hover:text-red-500 transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleGeneralContribution} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em] ml-2 italic">Contribution Magnitude</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-serif font-black text-2xl text-black/20 dark:text-white/20 group-focus-within:text-[#E8820C] transition-colors">₦</span>
                                    <input 
                                        required 
                                        type="number" 
                                        min="1" 
                                        value={genForm.amount} 
                                        onChange={e => setGenForm({ ...genForm, amount: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-3xl pl-14 pr-8 py-6 text-2xl font-black font-serif italic outline-none dark:text-white transition-all" 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                            
                            {!userProfile?.hasTransactionPin ? (
                                <div className="rounded-3xl border-2 border-dashed border-[#E8820C]/30 bg-[#E8820C]/5 p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#E8820C]/10 rounded-xl flex items-center justify-center text-[#E8820C]"><ShieldCheck size={20} /></div>
                                        <div>
                                            <p className="text-xs font-black text-[#1A1A2E] dark:text-white">Security Initialization Required</p>
                                            <p className="text-[9px] text-black/40 dark:text-white/40">Configure a 4-digit PIN before your first contribution</p>
                                        </div>
                                    </div>
                                    <input type="password" maxLength={4} value={contribSetupPin} onChange={e => setContribSetupPin(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-white dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-5 text-center text-2xl tracking-[0.8em] font-black outline-none" placeholder="New PIN" />
                                    <input type="password" maxLength={4} value={contribSetupConfirm} onChange={e => setContribSetupConfirm(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-white dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-5 text-center text-2xl tracking-[0.8em] font-black outline-none" placeholder="Confirm PIN" />
                                    <button type="button" disabled={settingContribPin || contribSetupPin.length !== 4 || contribSetupConfirm.length !== 4} onClick={() => handleContribPinSetup('general')}
                                        className="w-full py-4 bg-[#1A1A2E] dark:bg-[#E8820C] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50">
                                        {settingContribPin ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Configure Security PIN
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em] ml-2 italic">Security Authorization</label>
                                    <div className="relative group">
                                        <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E8820C]" size={24} />
                                        <input 
                                            required 
                                            type="password" 
                                            maxLength="4" 
                                            value={genForm.pin} 
                                            onChange={e => setGenForm({ ...genForm, pin: e.target.value.replace(/\D/g, '') })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-3xl pl-16 pr-8 py-6 text-2xl font-black tracking-[0.5em] outline-none dark:text-white transition-all" 
                                            placeholder="••••" 
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-black/20 dark:text-white/20 uppercase tracking-widest text-center">Funds will be deduced from your institutional vault balance</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em] ml-2 italic">Annotations</label>
                                <textarea 
                                    value={genForm.note} 
                                    onChange={e => setGenForm({ ...genForm, note: e.target.value })}
                                    rows="2"
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-3xl px-8 py-5 text-xs font-bold outline-none dark:text-white resize-none" 
                                    placeholder="Intention or directive..." 
                                />
                            </div>

                            <button type="submit" disabled={payingWallet || genForm.pin.length !== 4 || !userProfile?.hasTransactionPin}
                                className="w-full py-6 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                {payingWallet ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                                Commit To Vault
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* History Contribution Modal - Redesigned to 'Payment Ticket' Aesthetic */}
            {showHistoryForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1A1A2E]/80 backdrop-blur-2xl" onClick={() => setShowHistoryForm(false)} />
                    <div className="bg-white dark:bg-[#0F172A] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 border border-white/5">
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left Side: Ticket Detail */}
                            <div className="bg-emerald-600 p-8 md:p-12 text-white w-full md:w-5/12 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 -mr-10 -mt-10">
                                    <Save size={200} />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div>
                                        <h3 className="text-3xl font-serif font-black italic uppercase tracking-tighter leading-none">Ledger Backfill</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 mt-2">Historical Restoration</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Calendar size={20} /></div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-200">Temporal Stamp</p>
                                                <p className="text-sm font-black font-mono tracking-widest">{historyForm.weekId || 'YYYY-WXX'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Wallet size={20} /></div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-200">Magnitude</p>
                                                <p className="text-xl font-black font-serif italic">{fmt(historyForm.amount || weekData?.baseAmount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-10 border-t border-white/10">
                                    <p className="text-[9px] font-serif italic text-emerald-100 opacity-60 leading-relaxed">
                                        This operation will modify the permanent institutional ledger. Ensure all artifacts are verified.
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Inputs */}
                            <div className="p-8 md:p-12 flex-1 space-y-8 bg-white dark:bg-[#0F172A]">
                                <div className="flex justify-end">
                                    <button onClick={() => setShowHistoryForm(false)} className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-black/20 dark:text-white/20 hover:text-red-500 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleRecordHistory} className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-2">
                                            <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] italic">Institutional Subjects</label>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{historyForm.memberIds.length} SELECTED</span>
                                        </div>
                                        <div className="max-h-56 overflow-y-auto bg-gray-50 dark:bg-white/5 rounded-3xl p-4 border-2 border-transparent focus-within:border-emerald-500 transition-all space-y-2 custom-scrollbar">
                                            <div className="grid grid-cols-1 gap-2">
                                                {members.map(m => (
                                                    <button 
                                                        key={m.memberId}
                                                        type="button"
                                                        onClick={() => toggleMemberSelection(m.memberId)}
                                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                                            historyForm.memberIds.includes(m.memberId)
                                                                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 translate-x-1'
                                                                : 'bg-white dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-white/80 dark:hover:bg-white/10'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${
                                                                historyForm.memberIds.includes(m.memberId) ? 'bg-white text-emerald-600' : 'bg-black/5 dark:bg-white/5'
                                                            }`}>
                                                                {m.memberName?.[0]}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-[11px] font-black uppercase tracking-tight leading-none">{m.memberName}</p>
                                                                <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1.5">{m.role?.replace(/[-_]/g, ' ')}</p>
                                                            </div>
                                                        </div>
                                                        {historyForm.memberIds.includes(m.memberId) ? (
                                                            <CheckCircle2 size={18} className="text-white animate-in zoom-in duration-300" />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-black/5 dark:border-white/10" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2 italic">Week ID</label>
                                            <input required value={historyForm.weekId} onChange={e => setHistoryForm({ ...historyForm, weekId: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 text-sm font-mono outline-none dark:text-white transition-all" placeholder="2026-WXX" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2 italic">Payment Date</label>
                                            <input required type="date" value={historyForm.date} onChange={e => setHistoryForm({ ...historyForm, date: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 text-sm font-black outline-none dark:text-white transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2 italic">Value (₦)</label>
                                            <input required type="number" min="1" value={historyForm.amount} onChange={e => setHistoryForm({ ...historyForm, amount: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 text-sm font-black outline-none dark:text-white transition-all" placeholder={weekData?.baseAmount} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2 italic">Gateway Channel</label>
                                            <select value={historyForm.paymentChannel} onChange={e => setHistoryForm({ ...historyForm, paymentChannel: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none dark:text-white appearance-none cursor-pointer">
                                                <option value="cash" className="text-black">PHYSICAL CASH</option>
                                                <option value="wallet" className="text-black">INSTITUTIONAL VAULT</option>
                                                <option value="bank_transfer" className="text-black">BANK TRANSFER</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2 italic">Backfill Annotations</label>
                                        <textarea value={historyForm.note} onChange={e => setHistoryForm({ ...historyForm, note: e.target.value })}
                                            rows="2"
                                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-6 py-4 text-xs font-bold outline-none dark:text-white resize-none transition-all" placeholder="Justification for manual override..." />
                                    </div>

                                    <button type="submit" disabled={payingWallet}
                                        className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-emerald-600/20">
                                        {payingWallet ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                                        Record Transaction
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

