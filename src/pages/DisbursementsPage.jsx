import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, X, Loader2, CheckCircle2, XCircle, Clock, 
  Search, Building2, Wallet, ShieldCheck, Save, Send, Lock, 
  ArrowRight, Info, Filter, TrendingUp, ChevronRight
} from 'lucide-react';
import dayjs from 'dayjs';
import { fetchDisbursements, addDisbursement, treasurerDisbursementAction, markDisbursementCompleted } from '../api/disbursements';
import { fetchMembers } from '../api/members';
import { apiSetTransactionPin, apiGetProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const fmt = v => `₦${Number(v || 0).toLocaleString('en-NG')}`;

const STATUS_STYLE = {
  pending: { label: 'Awaiting Treasurer', cls: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 ring-amber-600/10', icon: Clock },
  approved: { label: 'Approved', cls: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 ring-emerald-600/10', icon: CheckCircle2 },
  completed: { label: 'Completed', cls: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 ring-blue-600/10', icon: CheckCircle2 },
  declined: { label: 'Declined', cls: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 ring-red-600/10', icon: XCircle },
};

export default function DisbursementsPage() {
  const { hasRole, ROLES, userProfile, setUserProfile } = useAuth();
  const isLeader = hasRole(ROLES.GROUP_LEADER);
  const isTreasurer = hasRole(ROLES.TREASURER);
  const isAdmin = hasRole(ROLES.ADMIN, ROLES.SUPER_ADMIN);

  const [disbursements, setDisbursements] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [search, setSearch] = useState('');
  
  // New State
  const [memberSearch, setMemberSearch] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinForm, setPinForm] = useState({ pin: '', confirm: '' });
  
  const [form, setForm] = useState({
    memberId: '', amount: '', reason: '', otherReason: '', type: 'general',
    method: 'wallet', bankAccountNumber: '', bankName: '', bankAccountName: '',
    password: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const [d, m] = await Promise.all([fetchDisbursements(), fetchMembers().catch(() => [])]);
      setDisbursements(Array.isArray(d) ? d : []);
      setMembers(Array.isArray(m) ? m : []);
    } catch { toast.error('Failed to load disbursements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOpenForm = () => {
    if (!userProfile?.hasTransactionPin) {
      setShowPinSetup(true);
    } else {
      setShowForm(true);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (pinForm.pin !== pinForm.confirm) return toast.error('PINs do not match');
    if (pinForm.pin.length !== 4) return toast.error('PIN must be 4 digits');
    
    setBusy(true);
    try {
      await apiSetTransactionPin(pinForm.pin);
      toast.success('Transaction PIN configured successfully');
      const updatedProfile = await apiGetProfile();
      setUserProfile(updatedProfile);
      setShowPinSetup(false);
      setShowForm(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.memberId) { toast.error('Select a beneficiary'); return; }
    if (!form.password) { toast.error('Password verification required'); return; }
    
    setBusy(true);
    try {
      const payload = {
        ...form,
        reason: form.type === 'other' ? `OTHER: ${form.otherReason}` : form.reason
      };
      const r = await addDisbursement(payload);
      setDisbursements(p => [r, ...p]);
      toast.success('Disbursement request broadcasted to Treasurer');
      setShowForm(false);
      setForm({ 
        memberId: '', amount: '', reason: '', otherReason: '', type: 'general', 
        method: 'wallet', bankAccountNumber: '', bankName: '', bankAccountName: '',
        password: '' 
      });
      setMemberSearch('');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const act = async (id, action) => {
    if (action === 'decline' && !declineReason.trim()) { toast.error('Enter decline reason'); return; }
    setBusy(true);
    try {
      const r = await treasurerDisbursementAction(id, { action, declineReason });
      setDisbursements(p => p.map(d => (d._id || d.id) === id ? r : d));
      if ((selected?._id || selected?.id) === id) setSelected(r);
      toast.success(action === 'approve' ? 'Disbursement approved!' : 'Disbursement declined');
      setDeclineReason('');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const complete = async (id) => {
    setBusy(true);
    try {
      const r = await markDisbursementCompleted(id);
      setDisbursements(p => p.map(d => (d._id || d.id) === id ? r : d));
      if ((selected?._id || selected?.id) === id) setSelected(r);
      toast.success('Marked as completed');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-[#E8820C]" size={48} />
        <div className="absolute inset-0 blur-xl bg-[#E8820C]/20 rounded-full animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 animate-pulse">Initializing Disbursement Core...</p>
    </div>
  );

  const pendingQueue = disbursements.filter(d => d.status === 'pending');
  const filtered = disbursements.filter(d =>
    d.member?.toLowerCase().includes(search.toLowerCase()) ||
    d.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.role?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-32 space-y-12 px-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-[#111827] p-8 sm:p-14 text-white shadow-2xl border border-white/5 group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 bg-[#E8820C] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-px bg-[#E8820C]" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C]">Disbursement Protocol</p>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight leading-none">Strategic Distributions</h1>
            <p className="text-white/40 text-sm max-w-md font-medium">Authoritative distribution of institutional assets. Group Leaders initiate, Treasurers finalize.</p>
            <div className="flex flex-wrap gap-4 pt-4">
              {[['Pending', pendingQueue.length, 'text-amber-400'], ['Total', disbursements.length, 'text-white'], ['Completed', disbursements.filter(d => d.status === 'completed').length, 'text-emerald-400']].map(([l, v, c]) => (
                <div key={l} className="bg-white/5 rounded-2xl px-6 py-4 border border-white/5 flex flex-col items-center min-w-[100px] backdrop-blur-sm">
                  <p className={`text-2xl font-black ${c}`}>{v}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
          {(isLeader || isAdmin) && (
            <button onClick={handleOpenForm}
              className="group/btn bg-[#E8820C] text-white px-10 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(232,130,12,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(232,130,12,0.5)] active:scale-95 transition-all">
              <Plus size={18} className="group-hover/btn:rotate-90 transition-transform duration-300" /> New Disbursement
            </button>
          )}
        </div>
      </div>

      {/* Treasurer pending queue */}
      {isTreasurer && pendingQueue.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-[3rem] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-800 uppercase tracking-[0.3em]">Pending Verification ({pendingQueue.length})</h3>
            <div className="p-2 bg-amber-500/10 rounded-lg"><Info size={16} className="text-amber-700" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingQueue.map(d => (
              <div key={d._id || d.id} className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-amber-100 dark:border-amber-500/10 shadow-sm space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center font-black text-amber-700">{d.member?.[0]}</div>
                    <div>
                      <p className="font-black text-[#1A1A2E] dark:text-white uppercase tracking-tight">{d.member}</p>
                      <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest">{d.type}</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-[#1A1A2E] dark:text-white">{fmt(d.amount)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest mb-1">Stated Reason</p>
                  <p className="text-xs text-black/60 dark:text-white/60 font-medium leading-relaxed">{d.reason}</p>
                </div>
                {d.method === 'bank_transfer' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 flex items-center gap-3">
                    <Building2 size={16} className="text-blue-600" />
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">{d.bankName}</p>
                      <p className="text-[11px] font-mono font-bold text-black/60 dark:text-white/60 mt-1">{d.bankAccountNumber}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <input value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="ENTER DECLINE REASON..."
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-red-400 rounded-2xl px-5 py-3 text-[10px] font-black outline-none dark:text-white" />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => act(d._id || d.id, 'approve')} disabled={busy}
                      className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                      {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} AUTHORIZE
                    </button>
                    <button onClick={() => act(d._id || d.id, 'decline')} disabled={busy}
                      className="py-4 bg-red-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                      <XCircle size={12} /> DECLINE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-[#0B1221] rounded-[3rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden">
        <div className="p-8 md:p-12 border-b border-black/5 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-black/20">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">Transaction Ledger</h3>
            <p className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">Verified Historical Records</p>
          </div>
          <div className="relative group">
            <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH AUDIT LOGS..."
              className="w-full md:w-64 bg-white dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-[2rem] pl-12 pr-6 py-4 text-[10px] font-black outline-none dark:text-white shadow-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5">
                {['Beneficiary', 'Audit Trail', 'Taxonomy', 'Mechanism', 'Status', 'Magnitude', 'Chronology'].map(h => (
                  <th key={h} className="px-8 py-6 text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em] text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filtered.map(d => {
                const st = STATUS_STYLE[d.status] || STATUS_STYLE.pending;
                return (
                  <tr key={d._id || d.id} onClick={() => setSelected(d)} className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] font-black">{d.member?.[0]}</div>
                        <span className="text-[11px] font-black text-[#1A1A2E] dark:text-white uppercase tracking-tight">{d.member}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] text-black/50 dark:text-white/40 font-medium max-w-[200px] truncate">{d.reason}</td>
                    <td className="px-8 py-6 text-[9px] font-black uppercase text-black/40 dark:text-white/40 tracking-widest">{d.type}</td>
                    <td className="px-8 py-6">
                      <span className="flex items-center gap-2 text-[9px] font-black uppercase text-black/40 dark:text-white/40">
                        {d.method === 'wallet' ? <Wallet size={12} /> : <Building2 size={12} />} {d.method?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${st.cls}`}>
                        <st.icon size={10} /> {st.label}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[13px] font-black text-[#E8820C]">{fmt(d.amount)}</td>
                    <td className="px-8 py-6 text-[10px] font-mono text-black/30 dark:text-white/30">{dayjs(d.createdAt).format('DD MMM YYYY')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Filter size={32} className="text-black/10 dark:text-white/10" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20 dark:text-white/20">No matching audit records found</p>
          </div>
        )}
      </div>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/5">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-[#E8820C]/10 rounded-2xl flex items-center justify-center mx-auto text-[#E8820C]">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">Security Initialization</h3>
              <p className="text-xs text-black/40 dark:text-white/40 leading-relaxed">To perform institutional disbursements, you must first configure a 4-digit Transaction PIN. This PIN will be required for all future magnitude shifts.</p>
            </div>
            <form onSubmit={handleSetPin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Define PIN</label>
                <input required type="password" maxLength={4} pattern="\d{4}" value={pinForm.pin} onChange={e => setPinForm({ ...pinForm, pin: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] font-black outline-none" placeholder="****" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Confirm PIN</label>
                <input required type="password" maxLength={4} pattern="\d{4}" value={pinForm.confirm} onChange={e => setPinForm({ ...pinForm, confirm: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] font-black outline-none" placeholder="****" />
              </div>
              <button type="submit" disabled={busy} className="w-full py-5 bg-[#1A1A2E] dark:bg-[#E8820C] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:opacity-90 transition-all disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Configure Security PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-2xl" onClick={() => !busy && setShowForm(false)} />
          <div className="bg-white dark:bg-[#111827] w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar border border-white/5">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-3xl font-serif font-black text-[#1A1A2E] dark:text-white">New Disbursement</h3>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Authorized Session</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-black/20 dark:text-white/20 hover:text-red-500 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={submit} className="space-y-8">
              {/* Beneficiary Search with Avatars */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Search Beneficiary</label>
                <div className="relative">
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" />
                  <input type="text" value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-12 pr-6 py-4 text-xs font-black outline-none" placeholder="FILTER BY NAME OR ROLE..." />
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredMembers.map(m => (
                    <button type="button" key={m._id} onClick={() => setForm({ ...form, memberId: m._id })}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${form.memberId === m._id ? 'bg-[#E8820C] text-white shadow-lg' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                      <div className="flex items-center gap-3">
                        {m.facialUpload ? (
                          <img src={m.facialUpload} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20" alt="" />
                        ) : (
                          <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center font-black text-xs uppercase">{m.name?.[0]}</div>
                        )}
                        <div className="text-left">
                          <p className="text-[11px] font-black uppercase tracking-tight">{m.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-tighter ${form.memberId === m._id ? 'text-white/70' : 'text-black/30 dark:text-white/30'}`}>{m.role?.replace(/[-_]/g, ' ')}</p>
                        </div>
                      </div>
                      {form.memberId === m._id && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Magnitude (₦)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-black/20">₦</span>
                    <input required type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl pl-10 pr-6 py-5 text-lg font-black outline-none" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Taxonomy</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-5 text-xs font-black uppercase outline-none cursor-pointer appearance-none">
                    {['general', 'welfare', 'loan', 'other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {form.type === 'other' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Specify Taxonomy</label>
                  <input required value={form.otherReason} onChange={e => setForm({ ...form, otherReason: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-5 text-xs font-black uppercase outline-none" placeholder="DESCRIBE CATEGORY..." />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Distribution Channel</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'wallet', label: 'INSTITUTIONAL VAULT', icon: Wallet },
                    { id: 'bank_transfer', label: 'MANUAL BANKING', icon: Building2 }
                  ].map(m => (
                    <button type="button" key={m.id} onClick={() => setForm({ ...form, method: m.id })}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl transition-all border-2 ${form.method === m.id ? 'bg-[#1A1A2E] border-[#1A1A2E] text-white shadow-xl' : 'bg-gray-50 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40'}`}>
                      <m.icon size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.method === 'bank_transfer' && (
                <div className="space-y-4 bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-black/5 dark:border-white/5 animate-in slide-in-from-top-4">
                  <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest text-center mb-2">Banking Metadata</p>
                  <input required value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} placeholder="BANK NAME"
                    className="w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none" />
                  <input required value={form.bankAccountNumber} onChange={e => setForm({ ...form, bankAccountNumber: e.target.value })} placeholder="ACCOUNT NUMBER"
                    className="w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none" />
                  <input required value={form.bankAccountName} onChange={e => setForm({ ...form, bankAccountName: e.target.value })} placeholder="ACCOUNT NAME"
                    className="w-full bg-white dark:bg-black/20 border-2 border-transparent focus:border-[#E8820C] rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none" />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Reasoning & Artifacts</label>
                <textarea required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3}
                  className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] rounded-[2rem] px-6 py-6 text-sm font-medium outline-none resize-none"
                  placeholder="PROVIDE DETAILED JUSTIFICATION FOR THIS DISBURSEMENT..." />
              </div>

              <div className="space-y-3 pt-4 border-t border-black/5 dark:border-white/5">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                  <Lock size={12} /> Authority Verification
                </label>
                <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-red-500/5 border-2 border-transparent focus:border-red-500 rounded-2xl px-6 py-5 text-sm font-black outline-none" placeholder="ENTER YOUR ACCOUNT PASSWORD TO BROADCAST..." />
              </div>

              <button type="submit" disabled={busy}
                className="w-full py-6 bg-[#1A1A2E] dark:bg-[#E8820C] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                {busy ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} Push Disbursement Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelected(null)} />
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">Audit Detail</h3>
                <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest">{selected.status}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-black/20 hover:text-red-500 transition-all"><X size={20} /></button>
            </div>
            <div className="space-y-4 mb-10">
              {[
                ['Subject', selected.member], 
                ['Magnitude', fmt(selected.amount)], 
                ['Mechanism', selected.method?.replace('_', ' ')], 
                ['Taxonomy', selected.type], 
                ['Chronology', dayjs(selected.createdAt).format('DD MMMM YYYY HH:mm')]
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-center py-3 border-b border-black/5 dark:border-white/5">
                  <span className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">{l}</span>
                  <span className="text-[11px] font-black text-[#1A1A2E] dark:text-white uppercase">{v}</span>
                </div>
              ))}
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 mt-4">
                <p className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest mb-2">Justification Artifact</p>
                <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed italic">"{selected.reason}"</p>
              </div>
              {selected.declineReason && (
                <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10 flex items-center gap-3">
                  <XCircle size={16} className="text-red-600" />
                  <p className="text-xs font-bold text-red-700">DECLINED: {selected.declineReason}</p>
                </div>
              )}
            </div>
            {selected.status === 'approved' && selected.method !== 'wallet' && (isTreasurer || isAdmin) && (
              <button onClick={() => complete(selected._id || selected.id)} disabled={busy}
                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-700 transition-all mb-4">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Mark as Completed
              </button>
            )}
            <button onClick={() => setSelected(null)} className="w-full py-5 bg-gray-100 dark:bg-white/5 text-black/40 dark:text-white/40 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-all">Close Entry</button>
          </div>
        </div>
      )}
    </div>
  );
}
