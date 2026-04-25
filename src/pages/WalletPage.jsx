import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Wallet, ArrowUpRight, ArrowDownLeft, Send, History, Heart, X, Search, Zap, Loader2 } from 'lucide-react';
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
    const [filter, setFilter] = useState('all');
    const [searchRecipient, setSearchRecipient] = useState('');
    const [transferForm, setTransferForm] = useState({ toId: '', toName: '', amount: '', note: '' });
    const [sending, setSending] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [walletData, membersData] = await Promise.all([
                fetchWallet(),
                fetchMembers()
            ]);
            setData(walletData);
            setMembers(membersData?.filter(m => m._id !== user?._id) || []);
        } catch (err) {
            console.error('Wallet load failure:', err);
            toast.error('Financial systems offline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?._id]);

    const filteredTransactions = useMemo(() => {
        if (!data?.recentTransactions) return [];
        let txs = data.recentTransactions;
        if (filter === 'sent') return txs.filter(tx => tx.type === 'debit');
        if (filter === 'received') return txs.filter(tx => tx.type === 'credit');
        return txs;
    }, [data, filter]);

    const recipientResults = useMemo(() => {
        if (!searchRecipient) return [];
        return members.filter(m =>
            m.name.toLowerCase().includes(searchRecipient.toLowerCase()) ||
            m.phone?.includes(searchRecipient)
        ).slice(0, 5);
    }, [members, searchRecipient]);

    const handleTransfer = async (e) => {
        if (e) e.preventDefault();
        if (!transferForm.toId) return toast.error('Identify recipient');
        const amt = Number(transferForm.amount);
        if (amt > (data?.balance || 0)) return toast.error('Insufficient vault balance');
        
        setSending(true);
        try {
            await transferFunds(transferForm.toId, amt, transferForm.note);
            toast.success(`₦${amt} transferred to ${transferForm.toName}`);
            setShowTransfer(false);
            setTransferForm({ toId: '', toName: '', amount: '', note: '' });
            loadData(); // Refresh wallet
        } catch (err) {
            toast.error(err.message || 'Transfer failed');
        } finally {
            setSending(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="animate-spin text-[#E8820C]" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Securing Vault Access...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
            <div className="relative overflow-hidden rounded-[3.5rem] p-12 text-white shadow-2xl bg-[#1A1A2E]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8820C]/10 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-4 text-center md:text-left">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em]">Treasury Account Balance</p>
                        <h2 className="text-7xl font-black font-serif text-white tracking-tighter">{formatNaira(data.balance)}</h2>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-white/60 uppercase tracking-widest">Vault ID: {user?.memberId || 'RR-ID-8820'}</div>
                            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</div>
                        </div>
                    </div>
                    <button onClick={() => setShowTransfer(true)} className="px-10 py-6 rounded-[2rem] bg-[#E8820C] hover:bg-[#F5A623] text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center gap-4">
                        <Send size={24} /> Gift a Brother
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#1A1A2E] border border-black/5"><History size={24} /></div>
                            <h3 className="text-2xl font-black font-serif text-[#1A1A2E]">Activity Ledger</h3>
                        </div>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-black/5">
                            {['all', 'sent', 'received'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-[#1A1A2E] shadow-md' : 'text-black/30 hover:text-black/60'}`}>{f}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredTransactions.length > 0 ? filteredTransactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-7 rounded-[2.5rem] bg-white border border-black/5 hover:border-[#E8820C]/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {tx.type === 'credit' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-[#1A1A2E]">{tx.note || (tx.type === 'credit' ? 'Inward Resource' : 'Outward Gift')}</p>
                                        <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest mt-1">{dayjs(tx.date).format('MMM D, YYYY HH:mm')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>{tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                        <Zap size={10} className="text-[#E8820C]" />
                                        <p className="text-[8px] font-black uppercase text-black/20">Verified</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-black/5">
                                <History size={40} className="mx-auto text-black/10 mb-4" />
                                <p className="text-[10px] font-black uppercase text-black/20 tracking-widest">No Activity Records Found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="rounded-[3rem] bg-white p-10 border border-black/5 shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Wealth Awareness</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><span className="text-xs font-bold text-black/40">Total Outflow</span><span className="text-sm font-black text-[#1A1A2E]">{formatNaira(data.recentTransactions?.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0) || 0)}</span></div>
                            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden"><div className="h-full bg-[#E8820C] w-1/3"></div></div>
                            <p className="text-[9px] font-bold text-emerald-600 italic uppercase tracking-widest bg-emerald-50 p-4 rounded-2xl border border-emerald-100">System maintains 100% solvency and liquidity for all members.</p>
                        </div>
                    </div>
                    <div className="rounded-[3rem] bg-[#1A1A2E] p-10 text-white shadow-xl space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#F5A623]"><Heart size={24} /></div>
                        <h4 className="text-xl font-black font-serif">Brotherhood Trust</h4>
                        <p className="text-[10px] text-white/30 font-black uppercase leading-relaxed tracking-widest">Financial support strengthens the bonds of our collective sovereignty.</p>
                    </div>
                </div>
            </div>

            {showTransfer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
                    <div className="w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl relative border border-black/5">
                        <button onClick={() => setShowTransfer(false)} className="absolute top-8 right-8 text-black/20 hover:text-black/60"><X size={24} /></button>
                        <h3 className="text-3xl font-black font-serif text-[#1A1A2E] mb-8">Gift a Brother</h3>
                        <form onSubmit={handleTransfer} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/20 mb-3 block">Locate Brother</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                                    <input value={searchRecipient} onChange={e => setSearchRecipient(e.target.value)} className="w-full bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-5 text-sm font-bold outline-none" placeholder="Name or Phone..." />
                                    {recipientResults.length > 0 && (
                                        <div className="absolute z-[110] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden">
                                            {recipientResults.map(m => (
                                                <button key={m._id} type="button" onClick={() => { setTransferForm({ ...transferForm, toId: m._id, toName: m.name }); setSearchRecipient(''); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 text-left border-b border-black/5 last:border-0">
                                                    <div className="w-10 h-10 rounded-xl bg-[#E8820C] text-white flex items-center justify-center font-black text-xs">{m.name[0]}</div>
                                                    <div><p className="text-sm font-bold text-[#1A1A2E]">{m.name}</p><p className="text-[10px] text-black/30">{m.role}</p></div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {transferForm.toId && <div className="mt-4 p-4 bg-[#E8820C]/5 border border-[#E8820C]/20 rounded-2xl flex justify-between items-center"><span className="text-sm font-black text-[#E8820C]">Recipient: {transferForm.toName}</span><button type="button" onClick={() => setTransferForm({...transferForm, toId: ''})} className="text-[10px] font-black uppercase text-[#E8820C]">Change</button></div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black uppercase text-black/20 mb-3 block">Amount (₦)</label><input type="number" required value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-5 text-xl font-black outline-none" placeholder="0" /></div>
                                <div className="bg-[#1A1A2E] rounded-2xl p-4 flex flex-col justify-center text-center"><p className="text-[8px] font-black text-white/40 uppercase mb-1">Available</p><p className="text-sm font-black text-[#F5A623]">{formatNaira(data.balance)}</p></div>
                            </div>
                            <button type="submit" disabled={sending || !transferForm.toId} className="w-full py-6 rounded-[2rem] bg-[#E8820C] text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-30">{sending ? 'Processing...' : 'Finalize Gift'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
