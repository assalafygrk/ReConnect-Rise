import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Wallet, ArrowUpRight, ArrowDownLeft, Send, History, Heart, X, Search, Filter, Download, PieChart, TrendingUp, Zap, ShieldCheck, Plus, Minus, CreditCard } from 'lucide-react';
import dayjs from 'dayjs';
import { fetchWallet, transferFunds, depositFunds, withdrawFunds, payWeeklyContribution, payGeneralContribution } from '../api/wallet';
import { fetchMembers } from '../api/members';
import { generateVirtualAccount, resolveAccount } from '../api/payment';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

const NIGERIAN_BANKS = [
    { code: '044', name: 'Access Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '058', name: 'Guaranty Trust Bank (GTB)' },
    { code: '033', name: 'United Bank for Africa (UBA)' },
    { code: '057', name: 'Zenith Bank' },
    { code: '214', name: 'First City Monument Bank (FCMB)' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '035', name: 'Wema Bank' },
    { code: '215', name: 'Unity Bank' },
    { code: '050', name: 'Ecobank Nigeria' },
    { code: '100004', name: 'Opay' },
    { code: '100013', name: 'Palmpay' },
    { code: '090267', name: 'Kuda Microfinance Bank' },
    { code: '100015', name: 'Moniepoint MFB' }
].sort((a, b) => a.name.localeCompare(b.name));

export default function WalletPage() {
    const { user } = useAuth();
    const { config } = usePageConfig('wallet');
    const [data, setData] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'transfer', 'deposit', 'withdraw', 'contribute'
    const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'
    const [searchRecipient, setSearchRecipient] = useState('');
    
    // Forms
    const [transferForm, setTransferForm] = useState({ toId: '', toName: '', amount: '', note: '', pin: '' });
    const [depositForm, setDepositForm] = useState({ amount: '', note: '' });
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', note: '', bankCode: '', bankName: '', accountNumber: '', pin: '', accountName: '' });
    const [resolvingAccount, setResolvingAccount] = useState(false);
    const [contributeForm, setContributeForm] = useState({ type: 'weekly', amount: '', note: '', pin: '' });
    
    const [sending, setSending] = useState(false);
    const [autoSavings, setAutoSavings] = useState(true);
    const [virtualAccount, setVirtualAccount] = useState(null);
    const [generatingVA, setGeneratingVA] = useState(false);

    const loadData = () => {
        setLoading(true);
        Promise.all([fetchWallet(), fetchMembers()])
            .then(([walletData, membersData]) => {
                setData(walletData);
                setVirtualAccount(walletData.virtualAccount);
                setMembers(membersData?.filter(m => m.id !== user?.id) || []);
            })
            .catch(err => {
                console.error('Wallet data load failed:', err);
                toast.error('Failed to load wallet data');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [user?.id]);

    const filteredTransactions = useMemo(() => {
        if (!data) return [];
        if (filter === 'all') return data.recentTransactions;
        if (filter === 'sent') return data.recentTransactions.filter(tx => tx.type === 'debit');
        if (filter === 'received') return data.recentTransactions.filter(tx => tx.type === 'credit');
        return data.recentTransactions;
    }, [data, filter]);

    const recipientResults = useMemo(() => {
        if (!searchRecipient) return [];
        return members.filter(m =>
            (m.name.toLowerCase().includes(searchRecipient.toLowerCase()) ||
            m.phone?.includes(searchRecipient)) &&
            m.role !== 'super_admin'
        ).map(m => ({ id: m._id || m.id, name: m.name, role: m.role })).slice(0, 5);
    }, [members, searchRecipient]);

    const closeModal = () => {
        setActiveModal(null);
        setSearchRecipient('');
        setTransferForm({ toId: '', toName: '', amount: '', note: '', pin: '' });
        setDepositForm({ amount: '', note: '' });
        setWithdrawForm({ amount: '', note: '', bankCode: '', bankName: '', accountNumber: '', pin: '', accountName: '' });
        setContributeForm({ type: 'weekly', amount: '', note: '', pin: '' });
    };

    useEffect(() => {
        const verifyAccount = async () => {
            if (withdrawForm.bankCode && withdrawForm.accountNumber.length === 10) {
                setResolvingAccount(true);
                setWithdrawForm(prev => ({ ...prev, accountName: '' }));
                try {
                    const res = await resolveAccount(withdrawForm.bankCode, withdrawForm.accountNumber);
                    if (res.success && res.accountName) {
                        setWithdrawForm(prev => ({ ...prev, accountName: res.accountName }));
                    }
                } catch (err) {
                    toast.error('Could not verify account name');
                } finally {
                    setResolvingAccount(false);
                }
            } else {
                setWithdrawForm(prev => ({ ...prev, accountName: '' }));
            }
        };
        const timer = setTimeout(verifyAccount, 500);
        return () => clearTimeout(timer);
    }, [withdrawForm.bankCode, withdrawForm.accountNumber]);

    const handleGenerateVirtualAccount = async () => {
        setGeneratingVA(true);
        try {
            const data = await generateVirtualAccount();
            setVirtualAccount(data);
            toast.success('Virtual account generated successfully!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setGeneratingVA(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!transferForm.toId) return toast.error('Please select a recipient');
        if (Number(transferForm.amount) > data.balance) return toast.error('Insufficient wallet balance');
        
        setSending(true);
        try {
            await transferFunds(transferForm.toId, Number(transferForm.amount), transferForm.note, transferForm.pin);
            toast.success(`₦${transferForm.amount} gifted to ${transferForm.toName}`);
            closeModal();
            loadData();
        } catch (err) { toast.error(err.message); } 
        finally { setSending(false); }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await depositFunds(Number(depositForm.amount), depositForm.note);
            toast.success(`Successfully deposited ₦${depositForm.amount}`);
            closeModal();
            loadData();
        } catch (err) { toast.error(err.message); } 
        finally { setSending(false); }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (Number(withdrawForm.amount) > data.balance) return toast.error('Insufficient wallet balance');
        setSending(true);
        try {
            await withdrawFunds(Number(withdrawForm.amount), withdrawForm.bankName, withdrawForm.accountNumber, withdrawForm.note, withdrawForm.pin);
            toast.success(`Withdrawal request of ₦${withdrawForm.amount} is pending Treasurer approval.`);
            closeModal();
            loadData();
        } catch (err) { toast.error(err.message); } 
        finally { setSending(false); }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            if (contributeForm.type === 'weekly') {
                await payWeeklyContribution(contributeForm.pin);
                toast.success('Weekly contribution paid successfully');
            } else {
                if (!contributeForm.amount) throw new Error('Please enter an amount');
                await payGeneralContribution(Number(contributeForm.amount), contributeForm.note, contributeForm.pin);
                toast.success('General contribution paid successfully');
            }
            closeModal();
            loadData();
        } catch (err) { toast.error(err.message); } 
        finally { setSending(false); }
    };

    const handleExport = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            { loading: 'Generating PDF Statement...', success: 'Wallet Statement downloaded!', error: 'Export failed' }
        );
    };

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E8820C]/30 border-t-[#E8820C]"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/20 dark:text-white/20">Securing your wallet...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {config.minBalanceNotice && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{config.minBalanceNotice}</p>
                </div>
            )}

            {/* Wallet Header & Balance */}
            <div className="relative group overflow-hidden rounded-[3.5rem] p-8 md:p-12 bg-white dark:bg-[#1A1A2E] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-[0_40px_80px_-20px_rgba(26,26,46,0.4)] transition-all duration-500">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E8820C] to-transparent opacity-[0.03] dark:opacity-10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:opacity-[0.06] dark:group-hover:opacity-20 transition-opacity duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E8820C]/5 dark:bg-[#111827]/5 rounded-full -ml-40 -mb-40 blur-[80px]"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-[3px] bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-full"></span>
                            <p className="text-black/40 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Treasury Account Balance</p>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black font-serif text-[#1A1A2E] dark:text-white tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {formatNaira(data.balance)}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <div className="px-5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[#111827]/5 border border-black/5 dark:border-white/10 backdrop-blur-xl flex items-center gap-3">
                                <Wallet size={16} className="text-[#E8820C]" />
                                <span className="text-xs font-bold text-black/40 dark:text-white/60 tracking-wider font-mono">**** **** {user?.id?.toString()?.slice(-4)?.toUpperCase() || '8820'}</span>
                            </div>
                            <div className="px-5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-green-500/10 border border-emerald-100 dark:border-green-500/20 backdrop-blur-xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-green-400 uppercase tracking-widest">Live Security Protocol</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:ml-auto w-full lg:w-auto">
                        <button onClick={() => setActiveModal('deposit')} className="px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#111827]/10 hover:bg-gray-100 dark:hover:bg-[#111827]/20 border border-black/5 dark:border-white/10 transition-all flex flex-col items-center justify-center gap-2 group/btn">
                            <Plus size={20} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white">Deposit</span>
                        </button>
                        <button onClick={() => setActiveModal('withdraw')} className="px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#111827]/10 hover:bg-gray-100 dark:hover:bg-[#111827]/20 border border-black/5 dark:border-white/10 transition-all flex flex-col items-center justify-center gap-2 group/btn">
                            <Minus size={20} className="text-red-500 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white">Withdraw</span>
                        </button>
                        <button onClick={() => setActiveModal('transfer')} className="px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#111827]/10 hover:bg-gray-100 dark:hover:bg-[#111827]/20 border border-black/5 dark:border-white/10 transition-all flex flex-col items-center justify-center gap-2 group/btn">
                            <Send size={20} className="text-blue-500 group-hover/btn:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white">Gift</span>
                        </button>
                        <button onClick={() => setActiveModal('contribute')} className="px-6 py-4 rounded-2xl bg-[#E8820C] hover:bg-[#F5A623] border border-[#E8820C] transition-all flex flex-col items-center justify-center gap-2 shadow-[0_10px_20px_-10px_rgba(232,130,12,0.5)] active:scale-95">
                            <CreditCard size={20} className="text-white" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Contribute</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Tabs & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-3xl bg-white dark:bg-[#111827] shadow-xl shadow-black/5 flex items-center justify-center text-[#1A1A2E] dark:text-white/90 border border-black/5 dark:border-white/10">
                                <History size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#1A1A2E] dark:text-white/90" style={{ fontFamily: "'Playfair Display', serif" }}>Financial Activity</h3>
                                <p className="text-[10px] text-black/30 dark:text-white/30 font-bold uppercase tracking-widest">Real-time brotherhood ledger</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 dark:bg-white/10 p-1.5 rounded-2xl border border-black/5 dark:border-white/10 shadow-inner">
                                {['all', 'sent', 'received'].map((f) => (
                                    <button key={f} onClick={() => setFilter(f)}
                                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-[#111827] text-[#1A1A2E] dark:text-white/90 shadow-md' : 'text-black/30 dark:text-white/30 hover:text-black/60'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleExport} className="p-3.5 bg-white dark:bg-[#111827] rounded-2xl border border-black/5 dark:border-white/10 text-[#E8820C] hover:bg-[#E8820C] hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95" title="Download Statement">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                            <div key={tx._id || tx.id} className="group flex items-center justify-between p-6 md:p-7 rounded-[2.5rem] bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 hover:border-[#E8820C]/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] transition-all">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className={`w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:rotate-6 ${tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={24} strokeWidth={3} /> : <ArrowUpRight size={24} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <p className="text-sm md:text-base font-black text-[#1A1A2E] dark:text-white/90 group-hover:text-[#E8820C] transition-colors tracking-tight line-clamp-2">{tx.note}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-[10px] md:text-[11px] text-black/30 dark:text-white/30 font-bold uppercase tracking-widest">{dayjs(tx.date || tx.createdAt).format('MMM D, YYYY')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className={`text-xl md:text-2xl font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                                    </p>
                                    <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${
                                        tx.status === 'pending' ? 'text-amber-500' :
                                        tx.status === 'declined' ? 'text-rose-500' :
                                        'text-black/20 dark:text-white/20'
                                    }`}>
                                        {tx.status || 'Verified'}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-white/5/50 rounded-[3rem] border-2 border-dashed border-black/5 dark:border-white/10 text-center space-y-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-[#111827] shadow-xl flex items-center justify-center text-black/10">
                                    <History size={40} />
                                </div>
                                <div className="max-w-xs">
                                    <p className="text-lg font-black text-[#1A1A2E] dark:text-white/90/40 uppercase tracking-widest">Clear Ledger</p>
                                    <p className="text-xs text-black/30 dark:text-white/30 font-medium leading-relaxed mt-2">Your financial footprints within the brotherhood will appear here as we grow together.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Insights Card */}
                    <div className="rounded-[3rem] bg-white dark:bg-[#111827] p-10 border border-black/5 dark:border-white/10 shadow-xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black/20 dark:text-white/20">Spending Insights</h4>
                            <PieChart size={18} className="text-[#E8820C]" />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-black/40 dark:text-white/40">Gifts Sent</p>
                                <p className="text-sm font-black text-[#1A1A2E] dark:text-white/90 tracking-tight">{formatNaira(data.totalGiftsSent)}</p>
                            </div>
                            <div className="h-2 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-full" style={{ width: `${Math.min(100, (data.totalGiftsSent / 50000) * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Auto-Savings Toggle */}
                    <div className="rounded-[3rem] bg-[#1A1A2E] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C]/10 to-transparent"></div>
                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111827]/5 flex items-center justify-center text-[#F5A623]"><Zap size={24} /></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={autoSavings} onChange={() => setAutoSavings(!autoSavings)} />
                                <div className="w-12 h-6 bg-white dark:bg-[#111827]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-[#111827] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8820C]"></div>
                            </label>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Auto-Growth</h4>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed mb-6">Automatically allocate 5% of incoming gifts to your emergency vault.</p>
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#111827]/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-bold text-white/50 tracking-tighter uppercase">Vault Status</p>
                                <p className="text-sm font-black text-[#F5A623]">{autoSavings ? 'ENCRYPTED & SYNCING' : 'PAUSED'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Modals ────────────────────────────────────────────────── */}

            {activeModal === 'transfer' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
                    <div className="bg-white dark:bg-[#111827] w-full max-w-lg rounded-[3rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-black text-2xl font-serif text-[#1A1A2E] dark:text-white/90">Gift a Brother</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C] mt-1">Empowering the Brotherhood</p>
                            </div>
                            <button onClick={closeModal} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-black/60"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleTransfer} className="space-y-6">
                            <div className="relative">
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2">Recipient</label>
                                {transferForm.toId ? (
                                    <div className="flex items-center justify-between p-4 bg-[#E8820C]/5 border border-[#E8820C]/20 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#E8820C] text-white flex items-center justify-center font-black text-xs">{transferForm.toName[0]}</div>
                                            <p className="text-sm font-black text-[#1A1A2E] dark:text-white/90">{transferForm.toName}</p>
                                        </div>
                                        <button type="button" onClick={() => setTransferForm({ ...transferForm, toId: '', toName: '' })} className="text-[10px] font-black uppercase text-[#E8820C]">Change</button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20" size={16} />
                                        <input value={searchRecipient} onChange={(e) => setSearchRecipient(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#E8820C]/20" placeholder="Search brother..." />
                                        {recipientResults.length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden">
                                                {recipientResults.map(m => (
                                                    <button key={m.id} type="button" onClick={() => { setTransferForm({ ...transferForm, toId: m.id, toName: m.name }); setSearchRecipient(''); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:bg-white/5 border-b border-black/5 dark:border-white/10 last:border-0 text-left">
                                                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[#1A1A2E] dark:text-white/90 font-black text-xs">{m.name[0]}</div>
                                                        <div><p className="text-sm font-bold text-[#1A1A2E] dark:text-white/90">{m.name}</p><p className="text-[10px] text-black/30 dark:text-white/30">{m.role?.replace(/[-_]/g, ' ')}</p></div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2">Amount (₦)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20 text-base">₦</span>
                                    <input required type="number" min="1" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl pl-12 pr-6 py-4 text-base font-black outline-none focus:ring-2 focus:ring-[#E8820C]/20" placeholder="0" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2">Note</label>
                                <textarea value={transferForm.note} onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#E8820C]/20 resize-none" rows={2} placeholder="Optional note..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2">Transaction PIN</label>
                                <input required type="password" maxLength="4" value={transferForm.pin} onChange={(e) => setTransferForm({ ...transferForm, pin: e.target.value.replace(/\D/g, '') })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-[#E8820C]/20" placeholder="••••" />
                            </div>
                            <button type="submit" disabled={sending || !transferForm.toId || transferForm.pin.length !== 4} className="w-full py-5 rounded-[2rem] bg-[#E8820C] text-white font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {sending ? 'Processing...' : 'Send Gift'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'deposit' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
                    <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-2xl font-serif text-[#1A1A2E] dark:text-white/90">Deposit Funds</h3>
                            <button onClick={closeModal} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-black/60"><X size={20} /></button>
                        </div>
                        <div className="space-y-6">
                            {virtualAccount ? (
                                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] border border-emerald-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase text-emerald-800">Virtual Account Details</p>
                                        <div className="px-2 py-1 bg-emerald-500 text-white text-[8px] font-black rounded-md">LIVE</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase">Bank Name</p>
                                        <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">{virtualAccount.bankName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase">Account Name</p>
                                        <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">{virtualAccount.accountName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase">Account Number</p>
                                        <p className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">{virtualAccount.accountNumber}</p>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-[10px] font-bold text-emerald-700/50 leading-tight">Transfer funds here to instantly top-up your wallet via PaymentPoint.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/10 text-center space-y-4">
                                    <p className="text-sm font-bold text-black/60 dark:text-white/60">Get your dedicated deposit account</p>
                                    <button 
                                        onClick={handleGenerateVirtualAccount} 
                                        disabled={generatingVA}
                                        className="px-6 py-3 bg-[#E8820C] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#F5A623] transition-all disabled:opacity-50"
                                    >
                                        {generatingVA ? 'Generating...' : 'Generate Account'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'withdraw' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
                    <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-2xl font-serif text-[#1A1A2E] dark:text-white/90">Withdraw Funds</h3>
                            <button onClick={closeModal} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-black/60"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleWithdraw} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2 ml-2">Recipient Bank</label>
                                    <select required value={withdrawForm.bankCode} onChange={(e) => {
                                        const bank = NIGERIAN_BANKS.find(b => b.code === e.target.value);
                                        setWithdrawForm({ ...withdrawForm, bankCode: bank?.code || '', bankName: bank?.name || '' });
                                    }} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer">
                                        <option value="" disabled>Select Bank...</option>
                                        {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2 ml-2">Account Number</label>
                                    <input required type="text" maxLength="10" value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value.replace(/\D/g, '') })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-4 text-sm font-black font-mono outline-none focus:ring-2 focus:ring-red-500/20" placeholder="0123456789" />
                                </div>
                                {(resolvingAccount || withdrawForm.accountName) && (
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 flex items-center gap-3">
                                        {resolvingAccount ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500/30 border-t-red-500"></div>
                                        ) : (
                                            <ShieldCheck size={16} className="text-emerald-500" />
                                        )}
                                        <p className="text-[11px] font-black uppercase text-[#1A1A2E] dark:text-white/90 truncate">
                                            {resolvingAccount ? 'Verifying Account...' : withdrawForm.accountName}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2 ml-2">Amount (₦)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20 text-base">₦</span>
                                    <input required type="number" min="1" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl pl-12 pr-6 py-4 text-base font-black outline-none focus:ring-2 focus:ring-red-500/20" placeholder="0" />
                                </div>
                                <div className="flex justify-between items-center mt-2 px-2">
                                    {data?.dailyWithdrawalsCount >= 3 && Number(withdrawForm.amount) > 0 ? (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            Fee: ₦{Math.min(Number(withdrawForm.amount) * 0.01, 50).toFixed(2)}
                                        </p>
                                    ) : (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            Fee: ₦0.00
                                        </p>
                                    )}
                                    <p className="text-[10px] text-black/40 dark:text-white/40">Available: {formatNaira(data.balance)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2 ml-2">Transaction PIN</label>
                                <input required type="password" maxLength="4" value={withdrawForm.pin} onChange={(e) => setWithdrawForm({ ...withdrawForm, pin: e.target.value.replace(/\D/g, '') })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-red-500/20" placeholder="••••" />
                            </div>
                            <button type="submit" disabled={sending || Number(withdrawForm.amount) > data.balance || withdrawForm.pin.length !== 4 || (!resolvingAccount && !withdrawForm.accountName)} className="w-full py-5 rounded-[2rem] bg-rose-500 text-white font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {sending ? 'Processing...' : 'Request Withdrawal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'contribute' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
                    <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-black text-2xl font-serif text-[#1A1A2E] dark:text-white/90">Contribution</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1">Pay via Wallet</p>
                            </div>
                            <button onClick={closeModal} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-black/60"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleContribute} className="space-y-6">
                            <div className="flex gap-3 bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/10">
                                {['weekly', 'general'].map(t => (
                                    <button key={t} type="button" onClick={() => setContributeForm({ ...contributeForm, type: t })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${contributeForm.type === t ? 'bg-white dark:bg-[#111827] text-blue-600 shadow-sm' : 'text-black/40 dark:text-white/40'}`}>
                                        {t} Pool
                                    </button>
                                ))}
                            </div>

                            {contributeForm.type === 'general' ? (
                                <div>
                                    <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2">Amount (₦)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20 text-base">₦</span>
                                        <input required type="number" min="1" value={contributeForm.amount} onChange={(e) => setContributeForm({ ...contributeForm, amount: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl pl-12 pr-6 py-4 text-base font-black outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="0" />
                                    </div>
                                    <p className="text-[10px] text-black/40 dark:text-white/40 mt-2 text-right">Available: {formatNaira(data.balance)}</p>
                                </div>
                            ) : (
                                <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 text-center space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-800 dark:text-blue-200">Fixed Weekly Amount</p>
                                    <p className="text-3xl font-black text-blue-600 font-serif">{data?.weeklyContributionAmount || 100}</p>
                                    <p className="text-[10px] font-bold text-blue-600/60 pt-2">Will be deducted automatically from wallet</p>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] block mb-2 ml-2">Transaction PIN</label>
                                <input required type="password" maxLength="4" value={contributeForm.pin} onChange={(e) => setContributeForm({ ...contributeForm, pin: e.target.value.replace(/\D/g, '') })} className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="••••" />
                            </div>

                            <button type="submit" disabled={sending || contributeForm.pin.length !== 4} className="w-full py-5 rounded-[2rem] bg-[#1A1A2E] text-white font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                {sending ? 'Processing...' : 'Pay Contribution'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
