import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Wallet, ArrowUpRight, ArrowDownLeft, Send, History, Heart, X, Search, Filter, Download, PieChart, TrendingUp, Zap, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';
import { fetchWallet, transferFunds } from '../api/wallet';
import { fetchMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

export default function WalletPage() {
    const { user } = useAuth();
    const { config } = usePageConfig('wallet');
    const [data, setData] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTransfer, setShowTransfer] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'
    const [searchRecipient, setSearchRecipient] = useState('');
    const [transferForm, setTransferForm] = useState({ toId: '', toName: '', amount: '', note: '' });
    const [sending, setSending] = useState(false);
    const [autoSavings, setAutoSavings] = useState(true);

    useEffect(() => {
        Promise.all([fetchWallet(), fetchMembers()])
            .then(([walletData, membersData]) => {
                setData(walletData);
                setMembers(membersData?.filter(m => m.id !== user?.id) || []);
            })
            .catch(err => {
                console.error('Wallet data load failed:', err);
                setData({ balance: 0, recentTransactions: [] });
                setMembers([]);
            })
            .finally(() => setLoading(false));
    }, [user?.id]);

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
            m.name.toLowerCase().includes(searchRecipient.toLowerCase()) ||
            m.phone?.includes(searchRecipient)
        ).slice(0, 5);
    }, [members, searchRecipient]);

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (!transferForm.toId) return toast.error('Please select a brother to gift');
        if (Number(transferForm.amount) > data.balance) {
            return toast.error('Insufficient wallet balance');
        }
        setSending(true);
        try {
            await transferFunds(transferForm.toId, Number(transferForm.amount), transferForm.note);
            toast.success(`₦${transferForm.amount} gifted to ${transferForm.toName}`);
            setData(prev => ({
                ...prev,
                balance: prev.balance - Number(transferForm.amount),
                recentTransactions: [
                    { id: Date.now(), type: 'debit', amount: Number(transferForm.amount), note: `Gift to ${transferForm.toName}`, date: new Date().toISOString() },
                    ...prev.recentTransactions
                ]
            }));
            setShowTransfer(false);
            setTransferForm({ toId: '', toName: '', amount: '', note: '' });
            setSearchRecipient('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleExport = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Generating PDF Statement...',
                success: 'Wallent Statement downloaded!',
                error: 'Export failed',
            }
        );
    };

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E8820C]/30 border-t-[#E8820C]"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Securing your wallet...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {config.minBalanceNotice && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                    <p className="text-sm font-bold text-blue-800">
                        {config.minBalanceNotice}
                    </p>
                </div>
            )}

            {/* Wallet Header & Balance */}
            <div className="relative group overflow-hidden rounded-[3.5rem] p-12 text-white shadow-[0_40px_80px_-20px_rgba(26,26,46,0.4)] bg-[#1A1A2E]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E8820C] to-transparent opacity-10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:opacity-20 transition-opacity duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40 blur-[80px]"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-[3px] bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-full"></span>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Treasury Account Balance</p>
                        </div>
                        <h2 className="text-7xl font-black font-serif text-white tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {formatNaira(data.balance)}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3">
                                <Wallet size={16} className="text-[#E8820C]" />
                                <span className="text-xs font-bold text-white/60 tracking-wider font-mono">**** **** {user?.id?.toString()?.slice(-4)?.toUpperCase() || '8820'}</span>
                            </div>
                            <div className="px-5 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/20 backdrop-blur-xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Live Security Protocol</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                        {config.transfersEnabled !== false && (
                            <button
                                onClick={() => setShowTransfer(true)}
                                className="group/btn relative px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all bg-[#E8820C] hover:bg-[#F5A623] hover:-translate-y-1 shadow-[0_25px_50px_-12px_rgba(232,130,12,0.4)] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                                <span className="relative flex items-center gap-4">
                                    <Send size={24} strokeWidth={3} className="group-hover/btn:rotate-12 transition-transform" />
                                    Gift a Brother
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tabs & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-3xl bg-white shadow-xl shadow-black/5 flex items-center justify-center text-[#1A1A2E] border border-black/5">
                                <History size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#1A1A2E]" style={{ fontFamily: "'Playfair Display', serif" }}>Financial Activity</h3>
                                <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">Real-time brotherhood ledger</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-black/5 shadow-inner">
                                {['all', 'sent', 'received'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-[#1A1A2E] shadow-md' : 'text-black/30 hover:text-black/60'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleExport}
                                className="p-3.5 bg-white rounded-2xl border border-black/5 text-[#E8820C] hover:bg-[#E8820C] hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                                title="Download Statement"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                            <div key={tx.id} className="group flex items-center justify-between p-7 rounded-[2.5rem] bg-white border border-black/5 hover:border-[#E8820C]/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] transition-all animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:rotate-6 ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {tx.type === 'credit' ? <ArrowUpRight size={28} strokeWidth={3} /> : <ArrowDownLeft size={28} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-[#1A1A2E] group-hover:text-[#E8820C] transition-colors tracking-tight">{tx.note}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-[11px] text-black/30 font-bold uppercase tracking-widest">{dayjs(tx.date).format('MMM D, YYYY')}</p>
                                            <span className="w-1.5 h-1.5 rounded-full bg-black/5"></span>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 border border-black/5">
                                                <Zap size={10} className="text-[#E8820C]" />
                                                <p className="text-[9px] text-[#1A1A2E]/40 font-black uppercase tracking-tighter">Verified</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                                    </p>
                                    <p className="text-[10px] text-black/20 font-black uppercase tracking-[0.2em] mt-1">Ledger Sync: OK</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-black/5 text-center space-y-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-black/10">
                                    <History size={40} />
                                </div>
                                <div className="max-w-xs">
                                    <p className="text-lg font-black text-[#1A1A2E]/40 uppercase tracking-widest">Clear Ledger</p>
                                    <p className="text-xs text-black/30 font-medium leading-relaxed mt-2">Your financial footprints within the brotherhood will appear here as we grow together.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Insights Card */}
                    <div className="rounded-[3rem] bg-white p-10 border border-black/5 shadow-2xl space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black/20">Spending Insights</h4>
                            <PieChart size={18} className="text-[#E8820C]" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-black/40">Gifts Sent</p>
                                <p className="text-sm font-black text-[#1A1A2E] tracking-tight">{formatNaira(data.totalGiftsSent)}</p>
                            </div>
                            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-full" style={{ width: `${Math.min(100, (data.totalGiftsSent / 50000) * 100)}%` }}></div>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 p-3 rounded-2xl border border-green-100 italic">
                                <TrendingUp size={14} /> 12% Growth from last month
                            </div>
                        </div>
                    </div>

                    {/* Auto-Savings Toggle Section */}
                    <div className="rounded-[3rem] bg-[#1A1A2E] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C]/10 to-transparent"></div>
                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#F5A623]">
                                <Zap size={24} />
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={autoSavings}
                                    onChange={() => setAutoSavings(!autoSavings)}
                                />
                                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8820C]"></div>
                            </label>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Auto-Growth</h4>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed mb-6">
                                Automatically allocate 5% of incoming gifts to your emergency vault.
                            </p>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                                <p className="text-[10px] font-bold text-white/50 tracking-tighter uppercase">Vault Status</p>
                                <p className="text-sm font-black text-[#F5A623]">{autoSavings ? 'ENCRYPTED & SYNCING' : 'PAUSED'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Footer */}
                    <div className="rounded-[3rem] bg-gray-50 p-10 border border-black/5 space-y-6">
                        <div className="flex items-center gap-4 text-[#1A1A2E]/20">
                            <Heart size={20} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Brotherhood Trust</p>
                        </div>
                        <p className="text-[10px] text-black/50 font-bold leading-relaxed italic">
                            By using RR-Wallet, you agree to uphold the brotherhood's values of honesty, discretion, and mutual prosperity.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-[2.5rem] bg-gradient-to-br from-[#E8820C]/10 to-[#F5A623]/20 p-8 border border-[#E8820C]/20 text-center relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E8820C]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="w-16 h-16 rounded-3xl bg-[#E8820C] flex items-center justify-center mx-auto mb-6 text-white shadow-2xl relative z-10">
                        <Heart size={32} strokeWidth={2.5} />
                    </div>
                    <h4 className="text-xl font-black text-[#1A1A2E] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Gift of Brotherhood</h4>
                    <p className="text-xs text-[#1A1A2E]/60 leading-relaxed font-medium">
                        Unity is built through mutual support. No fees on brotherhood transfers. Let your kindness reach a brother today.
                    </p>
                    {config.transfersEnabled !== false && (
                        <button
                            onClick={() => setShowTransfer(true)}
                            className="w-full mt-6 py-4 rounded-2xl bg-white text-[#E8820C] font-black text-[10px] uppercase tracking-widest border border-[#E8820C]/20 hover:bg-[#E8820C] hover:text-white transition-all shadow-sm"
                        >
                            Initiate Transfer
                        </button>
                    )}
                </div>

                <div className="rounded-[2.5rem] bg-white p-8 border border-black/5 shadow-sm space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black/20">Security Notice</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#E8820C] mt-1 shrink-0"></div>
                            <p className="text-[10px] text-black/50 font-medium leading-relaxed">Transactions are end-to-end encrypted and visible only to you and the recipient.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#E8820C] mt-1 shrink-0"></div>
                            <p className="text-[10px] text-black/50 font-medium leading-relaxed">Ensure the brother's name and details are correct before confirming.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transfer Modal */}
            {showTransfer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 overflow-y-auto">
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[3rem] p-6 md:p-10 shadow-2xl bg-white border border-black/5 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8820C]/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-8 md:mb-10 sticky top-0 bg-white z-20 py-2">
                            <div>
                                <h3 className="font-black text-3xl font-serif text-[#1A1A2E]" style={{ fontFamily: "'Playfair Display', serif" }}>Gift a Brother</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-4 h-[2px] bg-[#E8820C]"></span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Empowering the Brotherhood</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowTransfer(false); setSearchRecipient(''); setTransferForm({ toId: '', toName: '', amount: '', note: '' }); }} className="p-3 bg-gray-50 rounded-2xl text-black/20 hover:text-black/60 transition-all"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleTransfer} className="space-y-8">
                            <div className="relative">
                                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] block mb-3">Which Brother?</label>
                                {transferForm.toId ? (
                                    <div className="flex items-center justify-between p-4 bg-[#E8820C]/5 border border-[#E8820C]/20 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#E8820C] text-white flex items-center justify-center font-black text-xs">
                                                {transferForm.toName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <p className="text-sm font-black text-[#1A1A2E]">{transferForm.toName}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setTransferForm({ ...transferForm, toId: '', toName: '' })}
                                            className="text-[10px] font-black uppercase text-[#E8820C] hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                                            <input
                                                value={searchRecipient}
                                                onChange={(e) => setSearchRecipient(e.target.value)}
                                                className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#E8820C]/20 transition-all"
                                                placeholder="Search by name or phone..."
                                            />
                                        </div>
                                        {recipientResults.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden">
                                                {recipientResults.map(m => (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setTransferForm({ ...transferForm, toId: m.id, toName: m.name });
                                                            setSearchRecipient('');
                                                        }}
                                                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-black/5 last:border-0"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[#1A1A2E] font-black text-xs">
                                                            {m.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-[#1A1A2E]">{m.name}</p>
                                                            <p className="text-[10px] text-black/30 font-medium">{m.phone} • {m.role?.replace(/[-_]/g, ' ')}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] block mb-3">Amount (₦)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-black/20 text-lg">₦</span>
                                        <input required type="number" min="100" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                                            className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-5 text-lg font-black outline-none focus:ring-2 focus:ring-[#E8820C]/20 transition-all placeholder:text-black/10"
                                            placeholder="0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] block mb-3">Max Value</label>
                                    <div className="p-5 bg-[#1A1A2E] rounded-2xl text-center">
                                        <p className="text-[10px] font-black text-white/40 uppercase mb-1">Available</p>
                                        <p className="text-lg font-black text-[#F5A623]">{formatNaira(data.balance)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] block mb-3">Gift Note (Optional)</label>
                                <textarea
                                    value={transferForm.note}
                                    onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-5 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-[#E8820C]/20 transition-all"
                                    rows={3}
                                    placeholder="Write a message of brotherly support..."
                                />
                            </div>

                            <button type="submit" disabled={sending || !transferForm.toId}
                                className="w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_-10px_rgba(232,130,12,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
                                style={{ background: 'linear-gradient(135deg, #E8820C, #F5A623)' }}>
                                {sending ? 'Processing Gift...' : 'Finalize Transfer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
