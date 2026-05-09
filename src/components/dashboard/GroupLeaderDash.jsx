import { Users, Crown, Target, CheckCircle2, ShieldCheck, HeartHandshake, HandCoins, AlertCircle, UserPlus } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function GroupLeaderDash({ data: d, user, config }) {
  const stats = d.stats || {};
  const goalPct = Math.min(100, Math.round(((d.poolBalance || 0) / (config.savingsGoal || d.savingsGoal || 1000000)) * 100));

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6 px-4">
      {/* Hero */}
      <div className="relative bg-white dark:bg-[#2E1065] rounded-[2rem] p-7 md:p-12 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden group transition-all duration-500">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#8B5CF6] rounded-full blur-[150px] opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.15] transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA] backdrop-blur-md">
              <Crown size={12} className="animate-pulse" /> Operational Command
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-none">Group Leader</h1>
            <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 leading-relaxed font-serif italic">"Governing with integrity, leading with vision."</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Active Base</p>
              <p className="text-xl font-serif font-black">{d.totalPaid || 0}/{d.totalMembers || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Welfare Queue</p>
              <p className="text-xl font-serif font-black text-amber-500">{stats.welfareApprovedRequests || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Members" value={d.totalMembers || 0} color="#8B5CF6" />
        <StatCard icon={Target} label="Goal Progress" value={`${goalPct}%`} color="#C084FC" sub={fmt(d.poolBalance)} trend={goalPct > 50 ? +5 : -2} />
        <StatCard icon={CheckCircle2} label="Paid This Month" value={d.totalPaid || 0} color="#10B981" sub={`${d.totalUnpaid || 0} unpaid`} />
        <StatCard icon={ShieldCheck} label="Pending Requests" value={(stats.pendingRequests || 0) + (stats.welfareApprovedRequests || 0)} color="#F5A623" sub="Welfare + Loans" />
      </div>

      {/* Pending Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600"><HeartHandshake size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Welfare Awaiting Review</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.welfareApprovedRequests || 0}</p>
          <p className="text-[9px] text-black/30 dark:text-white/30 mt-1">Forwarded by Welfare Officer</p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600"><HandCoins size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Loan Requests</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.pendingLoansCount || 0}</p>
          <p className="text-[9px] text-black/30 dark:text-white/30 mt-1">Awaiting your decision</p>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"><UserPlus size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">New Members</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{d.pendingMembers || 0}</p>
          <p className="text-[9px] text-black/30 dark:text-white/30 mt-1">Pending approval</p>
        </div>
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <FlowChart data={d.monthlyChart || []} title="Group Growth Matrix" subtitle="Contribution & Participation" inflowColor="#8B5CF6" outflowColor="#EC4899" gradientId="glFlow" />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed transactions={d.recentTransactions || []} title="Member Activity" accentColor="#8B5CF6" />
        </div>
      </div>

      {/* Treasury Toll */}
      <TreasuryToll toll={d.treasuryToll} accentColor="#8B5CF6" />

      {/* Recent Members */}
      {d.recentMembers?.length > 0 && (
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><Users size={16} className="text-[#8B5CF6]" /> Latest Members</h3>
          <div className="space-y-2">
            {d.recentMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 text-xs font-black">{m.name?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 truncate">{m.name}</p>
                  <p className="text-[8px] uppercase tracking-widest text-black/40 dark:text-white/40">{m.role?.replace('_', ' ')}</p>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'}`}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
