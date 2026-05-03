import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, X, Loader2, Clock, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, CreditCard, MessageSquare } from 'lucide-react';
import dayjs from 'dayjs';
import { fetchLoans, addLoan, leaderLoanAction, treasurerLoanAction, recordRepayment, memberNegotiateLoan } from '../api/loans';
import { useAuth } from '../context/AuthContext';

const fmt = v => `₦${Number(v||0).toLocaleString('en-NG')}`;

const STATUS_STYLE = {
  pending:         { label:'Awaiting Leader',   cls:'bg-amber-50 text-amber-600 ring-amber-600/10',   icon:Clock },
  negotiating:     { label:'Negotiating',        cls:'bg-blue-50 text-blue-600 ring-blue-600/10',     icon:MessageSquare },
  leader_approved: { label:'At Treasurer',       cls:'bg-indigo-50 text-indigo-600 ring-indigo-600/10', icon:Clock },
  active:          { label:'Active',             cls:'bg-emerald-50 text-emerald-600 ring-emerald-600/10', icon:CheckCircle2 },
  disbursed_cash:  { label:'Disbursed (Cash)',   cls:'bg-teal-50 text-teal-600 ring-teal-600/10',     icon:CheckCircle2 },
  repaid:          { label:'Repaid',             cls:'bg-gray-50 text-gray-500 ring-gray-500/10',      icon:CheckCircle2 },
  declined:        { label:'Declined',           cls:'bg-red-50 text-red-600 ring-red-600/10',         icon:XCircle },
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

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#E8820C]" size={40}/>
      <p className="text-xs font-black uppercase tracking-widest text-black/30">Loading Loan Registry...</p>
    </div>
  );

  const myLoans = loans.filter(l => String(l.user?._id||l.user)===String(user?.id));
  const visible = (isLeader||isTreasurer||isAdmin) ? loans : myLoans;
  const leaderQueue    = loans.filter(l => ['pending','negotiating'].includes(l.status));
  const treasurerQueue = loans.filter(l => l.status==='leader_approved');

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A2E] p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-[#E8820C] pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight">Loan Registry</h1>
            <p className="text-white/40 text-sm">Member → Group Leader → Treasurer</p>
            <div className="flex gap-4 pt-2">
              {[['Vault',fmt(vault),'text-emerald-400'],['Active',loans.filter(l=>l.status==='active').length,'text-blue-400'],['Pending',leaderQueue.length,'text-amber-400']].map(([l,v,c])=>(
                <div key={l} className="bg-white/5 rounded-xl px-4 py-2 border border-white/10 text-center">
                  <p className={`text-xl font-black ${c}`}>{v}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>setShowForm(true)}
            className="bg-[#E8820C] text-white px-7 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all">
            <Plus size={16}/> Request Loan
          </button>
        </div>
      </div>

      {/* Leader Queue */}
      {isLeader && leaderQueue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 space-y-4">
          <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest">Group Leader Queue ({leaderQueue.length})</h3>
          {leaderQueue.map(l => (
            <div key={l._id||l.id} className="bg-white rounded-2xl p-5 border border-amber-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-[#1A1A2E]">{l.member} — <span className="font-normal text-black/50">{l.purpose}</span></p>
                  <p className="text-sm font-black text-[#E8820C] mt-1">{fmt(l.amount)} · {l.duration} months · via {l.disbursementMethod}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${STATUS_STYLE[l.status]?.cls}`}>{STATUS_STYLE[l.status]?.label}</span>
              </div>
              <textarea value={negotiationNotes} onChange={e=>setNegotiationNotes(e.target.value)} rows={2} placeholder="Negotiation notes / agreed terms (optional)"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 rounded-xl px-4 py-3 text-xs font-medium outline-none resize-none"/>
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
        <div className="bg-indigo-50 border border-indigo-200 rounded-[2rem] p-6 space-y-4">
          <h3 className="text-sm font-black text-indigo-800 uppercase tracking-widest">Treasurer Queue ({treasurerQueue.length})</h3>
          {treasurerQueue.map(l => (
            <div key={l._id||l.id} className="bg-white rounded-2xl p-5 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-[#1A1A2E]">{l.member} — <span className="font-normal text-black/50">{l.purpose}</span></p>
                  <p className="text-sm font-black text-[#E8820C] mt-1">{fmt(l.amount)} · via {l.disbursementMethod}</p>
                  {l.negotiationNotes && <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5 mt-2">📋 {l.negotiationNotes}</p>}
                </div>
              </div>
              {Number(l.amount) > vault && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                  <AlertTriangle size={14} className="text-red-600"/><p className="text-xs font-bold text-red-700">Vault insufficient: {fmt(vault)} available</p>
                </div>
              )}
              <div className="flex gap-3">
                <input value={declineReason} onChange={e=>setDeclineReason(e.target.value)} placeholder="Decline reason (if declining)"
                  className="flex-1 bg-gray-50 border-2 border-transparent focus:border-red-400 rounded-xl px-4 py-3 text-xs font-medium outline-none"/>
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
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h3 className="text-lg font-serif font-bold text-[#1A1A2E]">All Loans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                {['Borrower','Purpose','Status','Amount','Balance','Date'].map(h=>(
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {visible.map(l=>{
                const st=STATUS_STYLE[l.status]||STATUS_STYLE.pending;
                return (
                  <tr key={l._id||l.id} onClick={()=>setSelected(l)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-[#1A1A2E]">{l.member}</td>
                    <td className="px-6 py-4 text-xs text-black/50 max-w-[180px] truncate">{l.purpose}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${st.cls}`}>
                        <st.icon size={9}/> {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-black/50">{fmt(l.amount)}</td>
                    <td className="px-6 py-4 text-sm font-black text-[#1A1A2E]">{fmt(l.balance)}</td>
                    <td className="px-6 py-4 text-xs text-black/30">{dayjs(l.createdAt).format('DD MMM YY')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length===0 && (
            <div className="py-16 text-center"><p className="text-xs font-black uppercase tracking-widest text-black/20">No loans found</p></div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl" onClick={()=>!busy&&setShowForm(false)}/>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">Loan Request</h3>
              <button onClick={()=>setShowForm(false)} className="p-3 bg-gray-50 rounded-2xl text-black/20 hover:text-black"><X size={20}/></button>
            </div>
            {Number(form.amount)>vault && form.amount && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle size={14} className="text-red-600 shrink-0"/>
                <p className="text-xs font-bold text-red-700">Amount exceeds vault: {fmt(vault)} available</p>
              </div>
            )}
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/20">₦</span>
                    <input required type="number" min="1" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-9 pr-4 py-4 font-bold outline-none" placeholder="0"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Duration (months)</label>
                  <input type="number" min="1" max="24" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-4 font-bold outline-none"/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Receive via</label>
                <div className="flex gap-3">
                  {['wallet','cash'].map(m=>(
                    <button type="button" key={m} onClick={()=>setForm({...form,disbursementMethod:m})}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.disbursementMethod===m?'bg-[#1A1A2E] text-white':'bg-gray-50 text-black/40'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Purpose & Repayment Plan</label>
                <textarea required value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} rows={3}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-5 py-4 text-sm font-medium outline-none resize-none"
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
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-black text-[#1A1A2E]">Loan Detail</h3>
              <button onClick={()=>{setSelected(null);setShowRepay(false);}} className="p-3 bg-gray-50 rounded-2xl text-black/20 hover:text-black"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">Borrower</p>
                <p className="font-black text-[#1A1A2E]">{selected.member}</p>
              </div>
              <div className="bg-[#1A1A2E] p-4 rounded-2xl text-white space-y-1">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Balance</p>
                <p className="text-2xl font-black">{fmt(selected.balance)}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl mb-6">
              <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mb-1">Purpose</p>
              <p className="text-sm font-medium text-black/70">{selected.purpose}</p>
              {selected.negotiationNotes && <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 mt-2">📋 {selected.negotiationNotes}</p>}
              {selected.declineReason && <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 mt-2">❌ {selected.declineReason}</p>}
            </div>
            {/* Repayment */}
            {['active','disbursed_cash'].includes(selected.status) && (isTreasurer||isAdmin) && (
              showRepay ? (
                <form onSubmit={doRepay} className="space-y-3 mb-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/20">₦</span>
                    <input required type="number" min="1" autoFocus value={repayAmt} onChange={e=>setRepayAmt(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl pl-9 pr-4 py-4 font-bold outline-none" placeholder="Repayment amount"/>
                  </div>
                  <button type="submit" disabled={busy} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                    {busy?<Loader2 size={14} className="animate-spin"/>:null} Record Repayment
                  </button>
                </form>
              ) : (
                <button onClick={()=>setShowRepay(true)} className="w-full py-4 bg-[#1A1A2E] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-4">
                  <CreditCard size={16}/> Record Repayment
                </button>
              )
            )}
            
            {/* Negotiation Reply for Borrower */}
            {selected.status === 'negotiating' && String(selected.user?._id||selected.user) === String(user?.id||user?._id) && (
              <form onSubmit={replyNegotiation} className="space-y-3 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Reply to Leader's Notes</p>
                <textarea required value={replyNotes} onChange={e=>setReplyNotes(e.target.value)} rows={2}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-xl px-4 py-3 text-xs font-medium outline-none resize-none" placeholder="Your response..."/>
                <button type="submit" disabled={busy} className="w-full py-4 bg-[#E8820C] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy?<Loader2 size={14} className="animate-spin"/>:null} Send Response
                </button>
              </form>
            )}

            <button onClick={()=>{setSelected(null);setShowRepay(false);setReplyNotes('');}} className="w-full py-4 bg-gray-100 text-black/40 rounded-2xl font-black text-xs uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
