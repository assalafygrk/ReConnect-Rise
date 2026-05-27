import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, X, Loader2, Clock, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, CreditCard, MessageSquare } from 'lucide-react';
import dayjs from 'dayjs';
import { fetchLoans, addLoan, leaderLoanAction, treasurerLoanAction, recordRepayment, memberNegotiateLoan, memberRepayWalletLoan } from '../api/loans';
import { useAuth } from '../context/AuthContext';

const fmt = v => `₦${Number(v||0).toLocaleString('en-NG')}`;

const STATUS_STYLE = {
  pending:         { label:'Awaiting Leader',   cls:'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 ring-amber-600/10',   icon:Clock },
  negotiating:     { label:'Negotiating',        cls:'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-600/10',     icon:MessageSquare },
  leader_approved: { label:'At Treasurer',       cls:'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 ring-indigo-600/10', icon:Clock },
  active:          { label:'Active',             cls:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 ring-emerald-600/10', icon:CheckCircle2 },
  disbursed_cash:  { label:'Disbursed (Cash)',   cls:'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 ring-teal-600/10',     icon:CheckCircle2 },
  repaid:          { label:'Repaid',             cls:'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 ring-gray-500/10',      icon:CheckCircle2 },
  declined:        { label:'Declined',           cls:'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-red-600/10',         icon:XCircle },
};

export default function LoansPage() {
  const { hasRole, user, ROLES } = useAuth();
  const isLeader    = hasRole(ROLES.GROUP_LEADER);
  const isTreasurer = hasRole(ROLES.TREASURER);
  const isAdmin     = hasRole(ROLES.ADMIN, ROLES.SUPER_ADMIN);

  const [loans, setLoans] = useState([]);
  const [vault, setVault] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount:'', purpose:'', duration:'6', disbursementMethod:'wallet' });
  const [repayAmt, setRepayAmt] = useState('');
  const [repayPin, setRepayPin] = useState('');
  const [showRepay, setShowRepay] = useState(false);
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [replyNotes, setReplyNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchLoans();
      setLoans(res.loans || res);
      if (res.vaultBalance !== undefined) setVault(res.vaultBalance);
    } catch { toast.error('Failed to load loans'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (Number(form.amount) > vault) { toast.error(`Insufficient vault funds. Available: ${fmt(vault)}`); return; }
    setBusy(true);
    try {
      const r = await addLoan({ amount:Number(form.amount), purpose:form.purpose, duration:Number(form.duration), disbursementMethod:form.disbursementMethod });
      setLoans(p => [r, ...p]);
      toast.success('Loan request submitted to Group Leader');
      setShowForm(false);
      setForm({ amount:'', purpose:'', duration:'6', disbursementMethod:'wallet' });
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const leaderAct = async (id, action) => {
    setBusy(true);
    try {
      const r = await leaderLoanAction(id, { action, negotiationNotes, declineReason });
      setLoans(p => p.map(l => (l._id||l.id)===id ? r : l));
      if ((selected?._id||selected?.id)===id) setSelected(r);
      toast.success(`Action: ${action}`);
      setNegotiationNotes(''); setDeclineReason('');
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const treasurerAct = async (id, action) => {
    if (action==='decline' && !declineReason.trim()) { toast.error('Enter decline reason'); return; }
    setBusy(true);
    try {
      const r = await treasurerLoanAction(id, { action, declineReason });
      setLoans(p => p.map(l => (l._id||l.id)===id ? r : l));
      if ((selected?._id||selected?.id)===id) setSelected(r);
      toast.success(action==='disburse' ? 'Loan disbursed!' : 'Loan declined');
      setDeclineReason('');
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const doRepay = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const id = selected?._id || selected?.id;
      const r = await recordRepayment(id, Number(repayAmt));
      setLoans(p => p.map(l => (l._id||l.id)===id ? r : l));
      setSelected(r); setShowRepay(false); setRepayAmt('');
      toast.success('Repayment recorded');
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const replyNegotiation = async (e) => {
    e.preventDefault();
    if (!replyNotes.trim()) { toast.error('Enter your response'); return; }
    setBusy(true);
    try {
      const id = selected?._id || selected?.id;
      const r = await memberNegotiateLoan(id, replyNotes);
      setLoans(p => p.map(l => (l._id||l.id)===id ? r : l));
      setSelected(r); setReplyNotes('');
      toast.success('Response sent back to Group Leader');
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const doWalletRepay = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const id = selected?._id || selected?.id;
      const r = await memberRepayWalletLoan(id, Number(repayAmt), repayPin);
      setLoans(p => p.map(l => (l._id||l.id)===id ? r : l));
      setSelected(r); setShowRepay(false); setRepayAmt(''); setRepayPin('');
      toast.success('Loan repaid successfully from your wallet');
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#E8820C]" size={40}/>
      <p className="text-xs font-black uppercase tracking-widest text-black/30 dark:text-white/30">Loading Loan Registry...</p>
    </div>
  );

  const myLoans = loans.filter(l => String(l.user?._id||l.user)===String(user?.id));
  const visible = (isLeader||isTreasurer||isAdmin) ? loans : myLoans;
  const leaderQueue    = loans.filter(l => ['pending','negotiating'].includes(l.status));
  const treasurerQueue = loans.filter(l => l.status==='leader_approved');

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111827] p-10 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-none border border-black/5 dark:border-white/10 transition-all duration-500">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-[0.05] dark:opacity-10 bg-[#E8820C] pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-[#1A1A2E] dark:text-white">Loan Registry</h1>
            <p className="text-black/40 dark:text-white/40 text-sm max-w-md font-medium">Empowering brotherhood through financial support and trust.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/10 text-center min-w-[160px]">
              <p className="text-2xl font-black text-[#E8820C]">{fmt(vault)}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mt-1">Available Vault</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="bg-[#1A1A2E] dark:bg-[#E8820C] text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl dark:shadow-none">
              <Plus size={18} strokeWidth={3} className={hasRole(ROLES.GROUP_LEADER) ? "text-[#E8820C] dark:text-white" : "text-[#E8820C] dark:text-white"} /> Apply for Loan
            </button>
          </div>
        </div>
      </div>

      {/* Leader Queue */}
      {isLeader && leaderQueue.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2rem] p-6 space-y-4">
          <h3 className="text-sm font-black text-amber-800 dark:text-amber-500 uppercase tracking-widest">Group Leader Queue ({leaderQueue.length})</h3>
          {leaderQueue.map(l => (
            <div key={l._id||l.id} className="bg-white dark:bg-[#0B1221] rounded-2xl p-5 border border-amber-100 dark:border-amber-500/10 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-[#1A1A2E] dark:text-white">{l.member} — <span className="font-normal text-black/50 dark:text-white/40">{l.purpose}</span></p>
                  <p className="text-sm font-black text-[#E8820C] mt-1">{fmt(l.amount)} · {l.duration} months · via {l.disbursementMethod}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${STATUS_STYLE[l.status]?.cls}`}>{STATUS_STYLE[l.status]?.label}</span>
              </div>
              <textarea value={negotiationNotes} onChange={e=>setNegotiationNotes(e.target.value)} rows={2} placeholder="Negotiation notes / agreed terms (optional)"
                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 py-3 text-xs font-medium outline-none resize-none dark:text-white" />
              <div className="flex gap-3">
                <button onClick={()=>leaderAct(l._id||l.id,'approve')} disabled={busy}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {busy?<Loader2 size={12} className="animate-spin"/>:<ShieldCheck size={12}/>} Approve → Treasurer
                </button>
                <button onClick={()=>leaderAct(l._id||l.id,'negotiate')} disabled={busy}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
                  Negotiate
                </button>
                <button onClick={()=>{ setDeclineReason(''); leaderAct(l._id||l.id,'decline'); }} disabled={busy}
                  className="py-3 px-5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Treasurer Queue */}
      {isTreasurer && treasurerQueue.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-[2rem] p-6 space-y-4">
          <h3 className="text-sm font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">Treasurer Queue ({treasurerQueue.length})</h3>
          {treasurerQueue.map(l => (
            <div key={l._id||l.id} className="bg-white dark:bg-[#0B1221] rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/10 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-[#1A1A2E] dark:text-white">{l.member} — <span className="font-normal text-black/50 dark:text-white/40">{l.purpose}</span></p>
                  <p className="text-sm font-black text-[#E8820C] mt-1">{fmt(l.amount)} · via {l.disbursementMethod}</p>
                  {l.negotiationNotes && <p className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg px-3 py-1.5 mt-2">📋 {l.negotiationNotes}</p>}
                </div>
              </div>
              {Number(l.amount) > vault && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                  <AlertTriangle size={14} className="text-red-600 dark:text-red-400"/><p className="text-xs font-bold text-red-700 dark:text-red-300">Vault insufficient: {fmt(vault)} available</p>
                </div>
              )}
              <div className="flex gap-3">
                <input value={declineReason} onChange={e=>setDeclineReason(e.target.value)} placeholder="Decline reason (if declining)"
                  className="flex-1 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-red-400 rounded-xl px-4 py-3 text-xs font-medium outline-none dark:text-white" />
                <button onClick={()=>treasurerAct(l._id||l.id,'disburse')} disabled={busy||Number(l.amount)>vault}
                  className="py-3 px-5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  {busy?<Loader2 size={12} className="animate-spin"/>:null} Disburse
                </button>
                <button onClick={()=>treasurerAct(l._id||l.id,'decline')} disabled={busy}
                  className="py-3 px-5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Loans Table */}
      <div className="bg-white dark:bg-[#0B1221] rounded-[2.5rem] shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/10">
          <h3 className="text-lg font-serif font-bold text-[#1A1A2E] dark:text-white">All Loans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/5 text-left">
              <tr>
                {['Borrower','Purpose','Status','Amount','Balance','Date'].map(h=>(
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {visible.map(l=>{
                const st=STATUS_STYLE[l.status]||STATUS_STYLE.pending;
                return (
                  <tr key={l._id||l.id} onClick={()=>setSelected(l)} className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-[#1A1A2E] dark:text-white">{l.member}</td>
                    <td className="px-6 py-4 text-xs text-black/50 dark:text-white/40 max-w-[180px] truncate">{l.purpose}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${st.cls}`}>
                        <st.icon size={9}/> {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-black/50 dark:text-white/40">{fmt(l.amount)}</td>
                    <td className="px-6 py-4 text-sm font-black text-[#1A1A2E] dark:text-white">{fmt(l.balance)}</td>
                    <td className="px-6 py-4 text-xs text-black/30 dark:text-white/30">{dayjs(l.createdAt).format('DD MMM YY')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length===0 && (
            <div className="py-16 text-center"><p className="text-xs font-black uppercase tracking-widest text-black/20 dark:text-white/20">No loans found</p></div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl" onClick={()=>!busy&&setShowForm(false)}/>
          <div className="bg-white dark:bg-[#0B1221] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">Loan Request</h3>
              <button onClick={()=>setShowForm(false)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/40 hover:text-black dark:hover:text-white"><X size={20}/></button>
            </div>
            {Number(form.amount)>vault && form.amount && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/20">
                <AlertTriangle size={14} className="text-red-600 dark:text-red-400 shrink-0"/>
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Amount exceeds vault: {fmt(vault)} available</p>
              </div>
            )}
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20">₦</span>
                    <input required type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-9 pr-4 py-4 font-bold outline-none dark:text-white" placeholder="0"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Duration (months)</label>
                  <input type="number" min="1" max="24" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-4 font-bold outline-none dark:text-white"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Receive via</label>
                <div className="flex gap-3">
                  {['wallet','cash'].map(m=>(
                    <button type="button" key={m} onClick={()=>setForm({...form,disbursementMethod:m})}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.disbursementMethod===m?'bg-[#1A1A2E] text-white':'bg-gray-50 dark:bg-white/5 text-black/40 dark:text-white/40'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">Purpose & Repayment Plan</label>
                <textarea required value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} rows={3}
                  className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-5 py-4 text-sm font-medium outline-none resize-none dark:text-white"
                  placeholder="State purpose and how you plan to repay..."/>
              </div>
              <button type="submit" disabled={busy||Number(form.amount)>vault}
                className="w-full py-5 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {busy?<Loader2 size={18} className="animate-spin"/>:<CreditCard size={18}/>} Submit to Group Leader
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Loan Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={()=>{setSelected(null);setShowRepay(false);}}/>
          <div className="bg-white dark:bg-[#0B1221] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-black text-[#1A1A2E] dark:text-white">Loan Detail</h3>
              <button onClick={()=>{setSelected(null);setShowRepay(false);}} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-black dark:hover:text-white"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">Borrower</p>
                <p className="font-black text-[#1A1A2E] dark:text-white">{selected?.member || 'Unknown'}</p>
              </div>
              <div className="bg-[#1A1A2E] dark:bg-white p-4 rounded-2xl text-white dark:text-[#1A1A2E] space-y-1">
                <p className="text-[9px] font-black text-white/30 dark:text-[#1A1A2E]/30 uppercase tracking-widest">Balance</p>
                <p className="text-2xl font-black">{fmt(selected?.balance)}</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl mb-6">
              <p className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest mb-1">Purpose</p>
              <p className="text-sm font-medium text-black/70 dark:text-white/70">{selected?.purpose}</p>
              {selected?.negotiationNotes && <p className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg px-3 py-2 mt-2">📋 {selected.negotiationNotes}</p>}
              {selected?.declineReason && <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 mt-2">❌ {selected.declineReason}</p>}
            </div>
            {/* Repayment */}
            {['active','disbursed_cash'].includes(selected?.status) && (isTreasurer||isAdmin) && (
              showRepay ? (
                <form onSubmit={doRepay} className="space-y-3 mb-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20">₦</span>
                    <input required type="number" min="1" autoFocus value={repayAmt} onChange={e=>setRepayAmt(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-9 pr-4 py-4 font-bold outline-none dark:text-white" placeholder="Repayment amount"/>
                  </div>
                  <button type="submit" disabled={busy} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                    {busy?<Loader2 size={14} className="animate-spin"/>:null} Record Repayment (Cash)
                  </button>
                </form>
              ) : (
                <button onClick={()=>setShowRepay(true)} className="w-full py-4 bg-[#1A1A2E] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-4">
                  <CreditCard size={16}/> Record Repayment
                </button>
              )
            )}

            {/* Member Wallet Repayment */}
            {['active','disbursed_cash'].includes(selected?.status) && String(selected?.user?._id||selected?.user) === String(user?.id||user?._id) && (
              showRepay ? (
                <form onSubmit={doWalletRepay} className="space-y-3 mb-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/20 dark:text-white/20">₦</span>
                    <input required type="number" min="1" max={selected.balance} autoFocus value={repayAmt} onChange={e=>setRepayAmt(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl pl-9 pr-4 py-4 font-bold outline-none dark:text-white" placeholder={`Amount (max: ${selected.balance})`}/>
                  </div>
                  <div className="relative">
                    <input required type="password" maxLength="4" value={repayPin} onChange={e=>setRepayPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500 rounded-2xl px-4 py-4 text-center text-xl font-black tracking-[0.5em] outline-none dark:text-white" placeholder="••••"/>
                  </div>
                  <button type="submit" disabled={busy || repayPin.length !== 4} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                    {busy?<Loader2 size={14} className="animate-spin"/>:null} Repay via Wallet
                  </button>
                </form>
              ) : (
                <button onClick={()=>setShowRepay(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-4">
                  <Wallet size={16}/> Repay via Wallet
                </button>
              )
            )}
            
            {/* Negotiation Reply for Borrower */}
            {selected?.status === 'negotiating' && String(selected?.user?._id||selected?.user) === String(user?.id||user?._id) && (
              <form onSubmit={replyNegotiation} className="space-y-3 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Reply to Leader's Notes</p>
                <textarea required value={replyNotes} onChange={e=>setReplyNotes(e.target.value)} rows={2}
                  className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-xl px-4 py-3 text-xs font-medium outline-none resize-none dark:text-white" placeholder="Your response..."/>
                <button type="submit" disabled={busy} className="w-full py-4 bg-[#E8820C] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy?<Loader2 size={14} className="animate-spin"/>:null} Send Response
                </button>
              </form>
            )}

            <button onClick={()=>{setSelected(null);setShowRepay(false);setReplyNotes('');}} className="w-full py-4 bg-gray-100 text-black/40 dark:text-white/40 rounded-2xl font-black text-xs uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
