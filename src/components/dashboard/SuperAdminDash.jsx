import { Database, Users, ShieldCheck, Layers, Fingerprint, ActivitySquare, Crown, AlertCircle, CheckCircle2, TrendingUp, Wallet, BadgeCheck, UserPlus, UserMinus, Clock } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function SuperAdminDash({ data: d, user, userProfile, config, role }) {
  const isSA = role === 'super_admin';
  const goalPct = Math.min(100, Math.round(((d.poolBalance || 0) / (config.savingsGoal || d.savingsGoal || 1000000)) * 100));

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6 px-4">
      {/* Hero Banner */}
      <div className="relative bg-white dark:bg-[#0A2540] rounded-[2rem] p-7 md:p-12 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden group transition-all duration-500">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-1000" />
        <div className="absolute top-1/2 -translate-y-1/2 right-10 text-black/[0.01] dark:text-white/[0.02] pointer-events-none"><ShieldCheck size={300} /></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B82F6] backdrop-blur-md">
              <ActivitySquare size={12} className="animate-pulse" /> {isSA ? 'Supreme Authority' : 'System Authority'}
            </div>
            <div className="flex items-center gap-4">
              {userProfile?.facialUpload && <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-black/5 dark:border-white/10 shadow-xl shrink-0"><img src={userProfile.facialUpload} alt="" className="w-full h-full object-cover" /></div>}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-none">{isSA ? 'Supreme Command' : 'Executive Command'}</h1>
                <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 mt-3 leading-relaxed font-serif">
                  Welcome, {isSA ? 'Supreme Administrator' : 'Administrator'} {user?.name?.split(' ')[0] || ''}.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#34d399]" /> Core</p>
              <p className="text-xl font-serif font-black">Optimized</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50 flex items-center gap-2"><Fingerprint size={12} className="text-[#3B82F6]" /> Security</p>
              <p className="text-xl font-serif font-black text-[#3B82F6]">Class A</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Global Treasury" value={fmt(d.poolBalance)} color="#3B82F6" />
        <StatCard icon={TrendingUp} label="Goal Velocity" value={`${goalPct}%`} sub="of Target" color="#F5A623" trend={goalPct > 50 ? +8 : -3} />
        <StatCard icon={CheckCircle2} label="Paid / Total" value={`${d.totalPaid || 0} / ${d.totalMembers || 0}`} color="#10B981" />
        <StatCard icon={Layers} label="Unpaid Risk" value={d.totalUnpaid || 0} sub="Delinquent" color="#F43F5E" />
      </div>

      {/* Role Breakdown (super_admin exclusive) */}
      {isSA && d.roleBreakdown && (
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><Crown size={16} className="text-[#E8820C]" /> Network Roster Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Admins', count: (d.roleBreakdown.super_admin || 0) + (d.roleBreakdown.admin || 0), color: '#E8820C' },
              { label: 'Leaders', count: d.roleBreakdown.group_leader || 0, color: '#8B5CF6' },
              { label: 'Treasury', count: d.roleBreakdown.treasurer || 0, color: '#10B981' },
              { label: 'Officials', count: d.roleBreakdown.official_member || 0, color: '#3B82F6' },
              { label: 'Welfare', count: d.roleBreakdown.welfare || 0, color: '#EC4899' },
              { label: 'Advisors', count: d.roleBreakdown.special_advicer || 0, color: '#F59E0B' },
              { label: 'Members', count: d.roleBreakdown.member || 0, color: '#6B7280' },
              { label: 'Total', count: d.totalMembers || 0, color: '#1A1A2E' },
            ].map((r, i) => (
              <div key={i} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
                <p className="text-2xl font-black" style={{ color: r.color }}>{r.count}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Status */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={UserPlus} label="Active" value={d.activeMembers || 0} color="#10B981" />
        <StatCard icon={Clock} label="Pending" value={d.pendingMembers || 0} color="#F59E0B" />
        <StatCard icon={UserMinus} label="Suspended" value={d.suspendedMembers || 0} color="#F43F5E" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <FlowChart data={d.monthlyChart || []} title="System Liquidity Matrix" subtitle="Annual Inflow vs Outflow" inflowColor="#3B82F6" gradientId="adminFlow" />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed transactions={d.recentTransactions || []} title="Real-time Relay" accentColor="#3B82F6" />
        </div>
      </div>

      {/* Treasury Toll */}
      <TreasuryToll toll={d.treasuryToll} accentColor="#3B82F6" />

      {/* Recent Members */}
      {d.recentMembers?.length > 0 && (
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><Users size={16} className="text-[#3B82F6]" /> Recent Registrations</h3>
          <div className="space-y-2">
            {d.recentMembers.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                {m.avatar ? <img src={m.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" /> : <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 text-xs font-black">{m.name?.[0]}</div>}
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

      {/* Top Contributors */}
      {d.topContributors?.length > 0 && (
        <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><BadgeCheck size={16} className="text-[#F5A623]" /> Top Contributors</h3>
          <div className="space-y-2">
            {d.topContributors.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ backgroundColor: i === 0 ? '#FEF3C7' : '#F3F4F6', color: i === 0 ? '#D97706' : '#6B7280' }}>#{i + 1}</div>
                <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 flex-1 truncate">{c.name}</p>
                <p className="text-xs font-black text-emerald-600">{fmt(c.total)}</p>
                <p className="text-[8px] font-bold text-black/30 dark:text-white/30">{c.count} txns</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
