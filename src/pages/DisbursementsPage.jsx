import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, X, Loader2, CheckCircle2, XCircle, Clock, Search, Building2, Wallet } from 'lucide-react';
import dayjs from 'dayjs';
import { fetchDisbursements, addDisbursement, treasurerDisbursementAction, markDisbursementCompleted } from '../api/disbursements';
import { fetchMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';

const fmt = v => `₦${Number(v||0).toLocaleString('en-NG')}`;

const STATUS_STYLE = {
  pending:   { label:'Awaiting Treasurer', cls:'bg-amber-50 text-amber-600 ring-amber-600/10',   icon:Clock },
  approved:  { label:'Approved',           cls:'bg-emerald-50 text-emerald-600 ring-emerald-600/10', icon:CheckCircle2 },
  completed: { label:'Completed',          cls:'bg-blue-50 text-blue-600 ring-blue-600/10',       icon:CheckCircle2 },
  declined:  { label:'Declined',           cls:'bg-red-50 text-red-600 ring-red-600/10',           icon:XCircle },
};

export default function DisbursementsPage() {
  const { hasRole, ROLES } = useAuth();
  const isLeader    = hasRole(ROLES.GROUP_LEADER);
  const isTreasurer = hasRole(ROLES.TREASURER);
  const isAdmin     = hasRole(ROLES.ADMIN, ROLES.SUPER_ADMIN);

  const [disbursements, setDisbursements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    memberId:'', amount:'', reason:'', type:'general',
    method:'wallet', bankAccountNumber:'', bankName:'', bankAccountName:''
  });

  const load = async () => {
    setLoading(true);
    try {
      const [d, m] = await Promise.all([fetchDisbursements(), fetchMembers().catch(()=>[])]);
      setDisbursements(Array.isArray(d) ? d : []);
      setMembers(Array.isArray(m) ? m : []);
    } catch { toast.error('Failed to load disbursements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.memberId) { toast.error('Select a member'); return; }
    setBusy(true);
    try {
      const r = await addDisbursement(form);
      setDisbursements(p => [r, ...p]);
      toast.success('Disbursement request sent to Treasurer');
      setShowForm(false);
      setForm({ memberId:'', amount:'', reason:'', type:'general', method:'wallet', bankAccountNumber:'', bankName:'', bankAccountName:'' });
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const act = async (id, action) => {
    if (action==='decline' && !declineReason.trim()) { toast.error('Enter decline reason'); return; }
    setBusy(true);
    try {
      const r = await treasurerDisbursementAction(id, { action, declineReason });
      setDisbursements(p => p.map(d => (d._id||d.id)===id ? r : d));
      if ((selected?._id||selected?.id)===id) setSelected(r);
      toast.success(action==='approve' ? 'Disbursement approved!' : 'Disbursement declined');
      setDeclineReason('');
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const complete = async (id) => {
    setBusy(true);
    try {
      const r = await markDisbursementCompleted(id);
      setDisbursements(p => p.map(d => (d._id||d.id)===id ? r : d));
      if ((selected?._id||selected?.id)===id) setSelected(r);
      toast.success('Marked as completed');
    } catch(err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#E8820C]" size={40}/>
      <p className="text-xs font-black uppercase tracking-widest text-black/30">Loading Disbursements...</p>
    </div>
  );

  const pendingQueue = disbursements.filter(d => d.status==='pending');
  const filtered = disbursements.filter(d =>
    d.member?.toLowerCase().includes(search.toLowerCase()) ||
    d.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1A1A2E] p-10 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-[#E8820C] pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight">Disbursements</h1>
            <p className="text-white/40 text-sm">Group Leader creates · Treasurer approves</p>
            <div className="flex gap-4 pt-2">
              {[['Pending',pendingQueue.length,'text-amber-400'],['Total',disbursements.length,'text-white'],['Completed',disbursements.filter(d=>d.status==='completed').length,'text-emerald-400']].map(([l,v,c])=>(
                <div key={l} className="bg-white/5 rounded-xl px-4 py-2 border border-white/10 text-center">
                  <p className={`text-xl font-black ${c}`}>{v}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{l}</p>
                </div>
              ))}
            </div>
          </div>
          {(isLeader||isAdmin) && (
            <button onClick={()=>setShowForm(true)}
              className="bg-[#E8820C] text-white px-7 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all">
              <Plus size={16}/> New Disbursement
            </button>
          )}
        </div>
      </div>

      {/* Treasurer pending queue */}
      {isTreasurer && pendingQueue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 space-y-4">
          <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest">Pending Approval ({pendingQueue.length})</h3>
          {pendingQueue.map(d => (
            <div key={d._id||d.id} className="bg-white rounded-2xl p-5 border border-amber-100 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-[#1A1A2E]">{d.member}</p>
                  <p className="text-xs text-black/50 mt-0.5">{d.reason}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-sm font-black text-[#E8820C]">{fmt(d.amount)}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/30 bg-gray-50 px-2 py-1 rounded-lg">{d.method}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/30 bg-gray-50 px-2 py-1 rounded-lg">{d.type}</span>
                  </div>
                  {d.method==='bank_transfer' && d.bankName && (
                    <p className="text-xs text-black/40 mt-1">🏦 {d.bankName} · {d.bankAccountNumber} · {d.bankAccountName}</p>
                  )}
                </div>
                <p className="text-[10px] text-black/30 shrink-0">{dayjs(d.createdAt).format('DD MMM YY')}</p>
              </div>
              <div className="flex items-center gap-3">
                <input value={declineReason} onChange={e=>setDeclineReason(e.target.value)} placeholder="Decline reason (if declining)"
                  className="flex-1 bg-gray-50 border-2 border-transparent focus:border-red-400 rounded-xl px-4 py-2.5 text-xs font-medium outline-none"/>
                <button onClick={()=>act(d._id||d.id,'approve')} disabled={busy}
                  className="py-2.5 px-5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1">
                  {busy?<Loader2 size={11} className="animate-spin"/>:null} Approve
                </button>
                <button onClick={()=>act(d._id||d.id,'decline')} disabled={busy}
                  className="py-2.5 px-4 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All disbursements table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between gap-4">
          <h3 className="text-lg font-serif font-bold text-[#1A1A2E]">All Disbursements</h3>
          <div className="relative">
            <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
              className="bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none w-48"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                {['Member','Reason','Type','Method','Status','Amount','Date'].map(h=>(
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-black/30 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(d => {
                const st = STATUS_STYLE[d.status]||STATUS_STYLE.pending;
                return (
                  <tr key={d._id||d.id} onClick={()=>setSelected(d)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-[#1A1A2E]">{d.member}</td>
                    <td className="px-6 py-4 text-xs text-black/50 max-w-[160px] truncate">{d.reason}</td>
                    <td className="px-6 py-4 text-[10px] font-black uppercase text-black/40">{d.type}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-black/40">
                        {d.method==='wallet'?<Wallet size={11}/>:<Building2 size={11}/>} {d.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ${st.cls}`}>
                        <st.icon size={9}/> {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-[#E8820C]">{fmt(d.amount)}</td>
                    <td className="px-6 py-4 text-xs text-black/30">{dayjs(d.createdAt).format('DD MMM YY')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0 && (
            <div className="py-16 text-center"><p className="text-xs font-black uppercase tracking-widest text-black/20">No disbursements</p></div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-xl" onClick={()=>!busy&&setShowForm(false)}/>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">New Disbursement</h3>
              <button onClick={()=>setShowForm(false)} className="p-3 bg-gray-50 rounded-2xl text-black/20 hover:text-black"><X size={20}/></button>
            </div>
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Beneficiary</label>
                <select required value={form.memberId} onChange={e=>setForm({...form,memberId:e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-4 font-bold outline-none">
                  <option value="">Select member...</option>
                  {members.map(m=><option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
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
                  <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Type</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-4 py-4 font-bold outline-none">
                    {['general','welfare','loan','other'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Payment Method</label>
                <div className="flex gap-3">
                  {['wallet','bank_transfer','cash'].map(m=>(
                    <button type="button" key={m} onClick={()=>setForm({...form,method:m})}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${form.method===m?'bg-[#1A1A2E] text-white':'bg-gray-50 text-black/40'}`}>
                      {m.replace('_',' ')}
                    </button>
                  ))}
                </div>
              </div>
              {form.method==='bank_transfer' && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
                  <input value={form.bankName} onChange={e=>setForm({...form,bankName:e.target.value})} placeholder="Bank name"
                    className="w-full bg-white border-2 border-transparent focus:border-[#E8820C] rounded-xl px-4 py-3 text-xs font-bold outline-none"/>
                  <input value={form.bankAccountNumber} onChange={e=>setForm({...form,bankAccountNumber:e.target.value})} placeholder="Account number"
                    className="w-full bg-white border-2 border-transparent focus:border-[#E8820C] rounded-xl px-4 py-3 text-xs font-bold outline-none"/>
                  <input value={form.bankAccountName} onChange={e=>setForm({...form,bankAccountName:e.target.value})} placeholder="Account name"
                    className="w-full bg-white border-2 border-transparent focus:border-[#E8820C] rounded-xl px-4 py-3 text-xs font-bold outline-none"/>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 uppercase tracking-widest">Reason</label>
                <textarea required value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={2}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-5 py-4 text-sm font-medium outline-none resize-none"
                  placeholder="State reason for disbursement..."/>
              </div>
              <button type="submit" disabled={busy}
                className="w-full py-5 bg-[#1A1A2E] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                {busy?<Loader2 size={18} className="animate-spin"/>:null} Send to Treasurer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={()=>setSelected(null)}/>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-black text-[#1A1A2E]">Disbursement Detail</h3>
              <button onClick={()=>setSelected(null)} className="p-3 bg-gray-50 rounded-2xl text-black/20 hover:text-black"><X size={20}/></button>
            </div>
            <div className="space-y-3 mb-6">
              {[['Beneficiary',selected.member],['Amount',fmt(selected.amount)],['Method',selected.method],['Type',selected.type],['Reason',selected.reason],selected.bankName&&['Bank',`${selected.bankName} · ${selected.bankAccountNumber}`]].filter(Boolean).map(([l,v])=>(
                <div key={l} className="flex justify-between items-start py-2 border-b border-black/5">
                  <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">{l}</span>
                  <span className="text-xs font-bold text-[#1A1A2E] text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              {selected.declineReason && <p className="text-xs text-red-700 bg-red-50 rounded-xl px-4 py-3">❌ {selected.declineReason}</p>}
            </div>
            {/* Mark complete for approved bank/cash */}
            {selected.status==='approved' && selected.method!=='wallet' && (isTreasurer||isAdmin) && (
              <button onClick={()=>complete(selected._id||selected.id)} disabled={busy}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-3 disabled:opacity-50">
                {busy?<Loader2 size={14} className="animate-spin"/>:null} Mark as Completed
              </button>
            )}
            <button onClick={()=>setSelected(null)} className="w-full py-4 bg-gray-100 text-black/40 rounded-2xl font-black text-xs uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
