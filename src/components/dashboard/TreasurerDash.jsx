import { useNavigate } from 'react-router-dom';
import { CircleDollarSign, BarChart3, Wallet, BadgeCheck, Landmark, AlertCircle, Clock, FileCheck, HandCoins, ArrowUpRight, ArrowDownLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function TreasurerDash({ data: d, user, config }) {
  const nav = useNavigate();
  const stats = d.stats || {};
  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6 px-4">
      {/* Hero */}
      <div className="relative bg-white dark:bg-[#064E3B] rounded-[2rem] p-7 md:p-12 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden group transition-all duration-500">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#10B981] rounded-full blur-[150px] opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#34D399] backdrop-blur-md">
              <Landmark size={12} className="animate-pulse" /> Fiscal Stewardship
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-none">Treasury Master</h1>
            <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 leading-relaxed font-serif">"Precision in every coin, transparency in every record."</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div onClick={() => nav('/contributions')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Liquidity</p>
              <p className="text-xl font-serif font-black">{((d.liquidityRatio || 0) * 100).toFixed(0)}%</p>
            </div>
            <div onClick={() => nav('/disbursements')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Pending</p>
              <p className="text-xl font-serif font-black">{fmt(stats.pendingDisbursementAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CircleDollarSign} label="Liquid Pool" value={fmt(d.poolBalance)} color="#10B981" trend={+8} onClick={() => nav('/contributions')} />
        <StatCard icon={BarChart3} label="Monthly Inflow" value={fmt(d.treasuryToll?.monthlyInflow)} color="#F5A623" sub="This Month" onClick={() => nav('/contributions')} />
        <StatCard icon={AlertCircle} label="Pending Queue" value={stats.pendingDisbursementCount || 0} color="#F43F5E" sub={`${fmt(stats.pendingDisbursementAmount)} total`} onClick={() => nav('/disbursements')} />
        <StatCard icon={BadgeCheck} label="Collection Rate" value={`${stats.payoutRate || 0}%`} color="#34D399" sub={`${d.totalPaid || 0} of ${d.totalMembers || 0}`} onClick={() => nav('/members')} />
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => nav('/wallet')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600"><Clock size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Pending Withdrawals</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{fmt(stats.pendingWithdrawalAmount)}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
        <div onClick={() => nav('/loans')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600"><HandCoins size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Pending Loans</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.pendingLoansCount || 0}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
        <div onClick={() => nav('/loans')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600"><FileCheck size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Active Loans</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.activeLoans || 0} <span className="text-sm text-black/30 dark:text-white/30">({fmt(stats.totalLoansOut)})</span></p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 cursor-pointer" onClick={() => nav('/contributions')}>
          <FlowChart data={d.monthlyChart || []} title="Financial Trajectory" subtitle="Capital Inflow vs Expenditure" inflowColor="#10B981" gradientId="treasFlow" />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed transactions={d.recentTransactions || []} title="Fiscal Relay" accentColor="#10B981" onSelect={() => nav('/wallet')} />
        </div>
      </div>

      {/* Treasury Toll */}
      <TreasuryToll toll={d.treasuryToll} accentColor="#10B981" />

      {/* Top Contributors */}
      {d.topContributors?.length > 0 && (
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center justify-between"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#10B981]" /> Highest Contributors</span><button onClick={() => nav('/contributions')} className="text-[9px] font-black uppercase tracking-widest text-[#10B981] flex items-center gap-1 hover:underline">View All <ArrowRight size={10} /></button></h3>
          <div className="space-y-2">
            {d.topContributors.map((c, i) => (
              <div key={i} onClick={() => nav('/contributions')} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ backgroundColor: i === 0 ? '#D1FAE5' : '#F3F4F6', color: i === 0 ? '#059669' : '#6B7280' }}>#{i + 1}</div>
                <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 flex-1 truncate">{c.name}</p>
                <p className="text-xs font-black text-emerald-600">{fmt(c.total)}</p>
                <ArrowRight size={12} className="text-black/15 dark:text-white/15" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
