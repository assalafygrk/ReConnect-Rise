import { useNavigate } from 'react-router-dom';
import { Heart, HeartHandshake, HandHelping, Gift, CheckCircle2, XCircle, Clock, Users, ArrowRight, AlertCircle, Gem, BadgeCheck, ShieldCheck, Activity } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function WelfareDash({ data: d, user, config }) {
  const nav = useNavigate();
  const stats = d.stats || {};
  const my = d.myStats || {};

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6 px-4">
      {/* Hero */}
      <div className="relative bg-white dark:bg-[#4C0519] rounded-[2rem] p-7 md:p-12 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden group transition-all duration-500">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#F43F5E] rounded-full blur-[150px] opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-1000" />
        <div className="absolute top-1/2 -translate-y-1/2 right-10 text-black/[0.01] dark:text-white/[0.02] pointer-events-none"><Heart size={300} /></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#FB7185] backdrop-blur-md">
              <Heart size={12} className="animate-pulse" /> Humanitarian Support
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-none">Welfare Council</h1>
            <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 leading-relaxed font-serif">"Your well-being is our shared responsibility. Every brother matters."</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div onClick={() => nav('/welfare')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50 flex items-center gap-2"><AlertCircle size={10} className="text-amber-500" /> Pending</p>
              <p className="text-xl font-serif font-black text-amber-500">{stats.pendingRequests || 0} Requests</p>
            </div>
            <div onClick={() => nav('/disbursements')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Total Grants</p>
              <p className="text-xl font-serif font-black">{fmt(stats.totalWelfareGrants)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HeartHandshake} label="Welfare Pool" value={fmt(stats.welfareBalance)} color="#F43F5E" onClick={() => nav('/welfare')} />
        <StatCard icon={HandHelping} label="Pending Review" value={stats.pendingRequests || 0} color="#FB7185" sub="Awaiting Your Action" onClick={() => nav('/welfare')} />
        <StatCard icon={Gift} label="Grants Disbursed" value={fmt(stats.totalWelfareGrants)} color="#EC4899" onClick={() => nav('/disbursements')} />
        <StatCard icon={CheckCircle2} label="Approved Total" value={stats.totalApprovedRequests || 0} color="#10B981" sub={`${stats.totalDeclinedRequests || 0} declined`} onClick={() => nav('/welfare')} />
      </div>

      {/* Pipeline Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => nav('/welfare')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600"><Clock size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Stage 1: New Requests</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Members awaiting your review</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-serif font-black text-amber-600">{stats.pendingRequests || 0}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
        <div onClick={() => nav('/welfare')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600"><ShieldCheck size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Stage 2: At Group Leader</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">You approved, forwarded to leader</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-serif font-black text-purple-600">{stats.welfareApprovedRequests || 0}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
        <div onClick={() => nav('/welfare')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"><BadgeCheck size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Stage 3: At Treasurer</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Leader approved, pending disburse</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-serif font-black text-emerald-600">{stats.leaderApprovedRequests || 0}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
      </div>

      {/* My Own Stats */}
      <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><Gem size={16} className="text-[#F43F5E]" /> My Personal Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div onClick={() => nav('/contributions')} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center cursor-pointer hover:scale-[1.03] transition-transform">
            <p className="text-xl font-black text-[#F43F5E]">{fmt(my.totalContributions)}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">My Contributions</p>
          </div>
          <div onClick={() => nav('/loans')} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center cursor-pointer hover:scale-[1.03] transition-transform">
            <p className="text-xl font-black text-blue-600">{my.activeLoan > 0 ? fmt(my.activeLoan) : 'None'}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">Active Loan</p>
          </div>
          <div onClick={() => nav('/profile')} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center cursor-pointer hover:scale-[1.03] transition-transform">
            <p className="text-xl font-black text-emerald-600">{my.seniorityDays || 0}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">Days Served</p>
          </div>
          <div onClick={() => nav('/contributions')} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center cursor-pointer hover:scale-[1.03] transition-transform">
            <p className="text-xl font-black" style={{ color: my.paidThisMonth ? '#10B981' : '#F43F5E' }}>{my.paidThisMonth ? '✓ Paid' : '✗ Due'}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">This Month</p>
          </div>
        </div>
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 cursor-pointer" onClick={() => nav('/welfare')}>
          <FlowChart data={d.monthlyChart || []} title="Welfare Distribution" subtitle="Monthly Support Velocity" inflowColor="#F43F5E" outflowColor="#EC4899" gradientId="welfareFlow" />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed transactions={d.recentTransactions || []} title="Latest Grants" accentColor="#F43F5E" onSelect={() => nav('/wallet')} />
        </div>
      </div>

      {/* Treasury Toll */}
      <TreasuryToll toll={d.treasuryToll} accentColor="#F43F5E" />
    </div>
  );
}
