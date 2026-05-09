import { useState } from 'react';
import { Database, Users, ShieldCheck, Layers, Fingerprint, ActivitySquare, Crown, CheckCircle2, TrendingUp, BadgeCheck, UserPlus, UserMinus, Clock, ArrowUpRight, ArrowDownLeft, Wallet, PiggyBank, HandCoins, Target, BarChart3 } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';
import DetailModal, { DetailRow, DetailBigNumber, DetailGrid, DetailGridItem } from './DetailModal';
import dayjs from 'dayjs';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function SuperAdminDash({ data: d, user, userProfile, config, role }) {
  const [modal, setModal] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const isSA = role === 'super_admin';
  const toll = d.treasuryToll || {};
  const stats = d.stats || {};
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
                <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 mt-3 leading-relaxed font-serif">Welcome, {isSA ? 'Supreme Administrator' : 'Administrator'} {user?.name?.split(' ')[0] || ''}.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div onClick={() => setModal('system')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#34d399]" /> Core</p>
              <p className="text-xl font-serif font-black">Optimized</p>
            </div>
            <div onClick={() => setModal('system')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50 flex items-center gap-2"><Fingerprint size={12} className="text-[#3B82F6]" /> Security</p>
              <p className="text-xl font-serif font-black text-[#3B82F6]">Class A</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Global Treasury" value={fmt(d.poolBalance)} color="#3B82F6" onClick={() => setModal('treasury')} />
        <StatCard icon={TrendingUp} label="Goal Velocity" value={`${goalPct}%`} sub="of Target" color="#F5A623" trend={goalPct > 50 ? +8 : -3} onClick={() => setModal('goal')} />
        <StatCard icon={CheckCircle2} label="Paid / Total" value={`${d.totalPaid || 0} / ${d.totalMembers || 0}`} color="#10B981" onClick={() => setModal('collection')} />
        <StatCard icon={Layers} label="Unpaid Risk" value={d.totalUnpaid || 0} sub="Delinquent" color="#F43F5E" onClick={() => setModal('collection')} />
      </div>

      {/* Role Breakdown */}
      {isSA && d.roleBreakdown && (
        <div onClick={() => setModal('roles')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
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
              <div key={i} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center hover:scale-[1.03] transition-transform">
                <p className="text-2xl font-black" style={{ color: r.color }}>{r.count}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member Status */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={UserPlus} label="Active" value={d.activeMembers || 0} color="#10B981" onClick={() => setModal('members')} />
        <StatCard icon={Clock} label="Pending" value={d.pendingMembers || 0} color="#F59E0B" onClick={() => setModal('members')} />
        <StatCard icon={UserMinus} label="Suspended" value={d.suspendedMembers || 0} color="#F43F5E" onClick={() => setModal('members')} />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3"><FlowChart data={d.monthlyChart || []} title="System Liquidity Matrix" subtitle="Annual Inflow vs Outflow" inflowColor="#3B82F6" gradientId="adminFlow" /></div>
        <div className="lg:col-span-2"><ActivityFeed transactions={d.recentTransactions || []} title="Real-time Relay" accentColor="#3B82F6" onSelect={(tx) => setSelectedTx(tx)} /></div>
      </div>

      <TreasuryToll toll={d.treasuryToll} accentColor="#3B82F6" />

      {/* Top Contributors */}
      {d.topContributors?.length > 0 && (
        <div onClick={() => setModal('contributors')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm cursor-pointer hover:shadow-md transition-all">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><BadgeCheck size={16} className="text-[#F5A623]" /> Top Contributors</h3>
          <div className="space-y-2">
            {d.topContributors.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ backgroundColor: i === 0 ? '#FEF3C7' : '#F3F4F6', color: i === 0 ? '#D97706' : '#6B7280' }}>#{i + 1}</div>
                <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 flex-1 truncate">{c.name}</p>
                <p className="text-xs font-black text-emerald-600">{fmt(c.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MODALS ═══ */}
      {modal === 'treasury' && (
        <DetailModal title="Treasury Audit" subtitle="Full Financial Breakdown" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-4">
            <DetailBigNumber value={fmt(d.poolBalance)} label="Net Pool Balance" color="#3B82F6" />
            <DetailGrid>
              <DetailGridItem value={fmt(toll.totalInflow)} label="Total Inflow" color="#10B981" />
              <DetailGridItem value={fmt(toll.totalOutflow)} label="Total Outflow" color="#F43F5E" />
            </DetailGrid>
            <div className="space-y-2">
              <DetailRow icon={ArrowUpRight} label="Contributions Received" value={fmt(toll.totalInflow)} color="#10B981" />
              <DetailRow icon={HandCoins} label="Loan Repayments" value={fmt(toll.totalRepaymentsIn)} color="#3B82F6" />
              <DetailRow icon={ArrowDownLeft} label="Loans Disbursed" value={fmt(toll.totalLoansOutflow)} color="#F59E0B" />
              <DetailRow icon={Wallet} label="Other Disbursements" value={fmt(toll.totalDisbursementsOutflow)} color="#F43F5E" />
              <DetailRow icon={PiggyBank} label="Active Loans" value={`${toll.activeLoansCount || 0} (${fmt(toll.activeLoansAmount)})`} color="#8B5CF6" />
            </div>
          </div>
        </DetailModal>
      )}

      {modal === 'goal' && (
        <DetailModal title="Goal Trajectory" subtitle="Savings Target Analysis" onClose={() => setModal(null)} accentColor="#F5A623">
          <div className="space-y-5">
            <DetailGrid>
              <DetailGridItem value={fmt(d.poolBalance)} label="Collected" color="#10B981" />
              <DetailGridItem value={fmt(config.savingsGoal || d.savingsGoal)} label="Target" color="#F5A623" />
            </DetailGrid>
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Progress</p>
              <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${goalPct}%`, background: 'linear-gradient(90deg, #F5A623, #FCD34D)' }} />
              </div>
              <p className="text-center text-2xl font-black text-[#F5A623]">{goalPct}%</p>
            </div>
            <DetailRow icon={Target} label="Monthly Inflow" value={fmt(toll.monthlyInflow)} color="#10B981" sub="This month's contributions" />
            <DetailRow icon={BarChart3} label="Weekly Dues" value={fmt(stats.weeklyContributionAmount)} color="#3B82F6" sub="Per member contribution" />
          </div>
        </DetailModal>
      )}

      {modal === 'collection' && (
        <DetailModal title="Collection Status" subtitle="Member Payment Analysis" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={d.totalPaid || 0} label="Paid This Month" color="#10B981" />
              <DetailGridItem value={d.totalUnpaid || 0} label="Unpaid" color="#F43F5E" />
            </DetailGrid>
            <DetailBigNumber value={`${toll.collectionRate || 0}%`} label="Collection Rate" color={toll.collectionRate >= 70 ? '#10B981' : '#F43F5E'} />
            <DetailRow icon={Users} label="Total Members" value={d.totalMembers || 0} color="#3B82F6" />
            <DetailRow icon={Wallet} label="Weekly Amount" value={fmt(stats.weeklyContributionAmount)} color="#F5A623" sub="Required per member" />
          </div>
        </DetailModal>
      )}

      {modal === 'roles' && (
        <DetailModal title="Network Roster" subtitle="Complete Role Distribution" onClose={() => setModal(null)} accentColor="#E8820C">
          <div className="space-y-2">
            {[
              { label: 'Super Admins', count: d.roleBreakdown?.super_admin || 0, color: '#E8820C', icon: Crown },
              { label: 'Admins', count: d.roleBreakdown?.admin || 0, color: '#E8820C', icon: ShieldCheck },
              { label: 'Group Leaders', count: d.roleBreakdown?.group_leader || 0, color: '#8B5CF6', icon: Crown },
              { label: 'Treasurers', count: d.roleBreakdown?.treasurer || 0, color: '#10B981', icon: Database },
              { label: 'Welfare Officers', count: d.roleBreakdown?.welfare || 0, color: '#EC4899', icon: Users },
              { label: 'Special Advisers', count: d.roleBreakdown?.special_advicer || 0, color: '#F59E0B', icon: Users },
              { label: 'Official Members', count: d.roleBreakdown?.official_member || 0, color: '#3B82F6', icon: Users },
              { label: 'New Members', count: d.roleBreakdown?.member || 0, color: '#6B7280', icon: Users },
            ].map((r, i) => (
              <DetailRow key={i} icon={r.icon} label={r.label} value={r.count} color={r.color} />
            ))}
          </div>
        </DetailModal>
      )}

      {modal === 'members' && (
        <DetailModal title="Member Status" subtitle="Membership Analysis" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={d.activeMembers || 0} label="Active" color="#10B981" />
              <DetailGridItem value={d.pendingMembers || 0} label="Pending" color="#F59E0B" />
              <DetailGridItem value={d.suspendedMembers || 0} label="Suspended" color="#F43F5E" />
              <DetailGridItem value={d.totalMembers || 0} label="Total" color="#3B82F6" />
            </DetailGrid>
            {d.recentMembers?.length > 0 && <>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 pt-2">Recent Registrations</p>
              {d.recentMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 text-xs font-black">{m.name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 truncate">{m.name}</p>
                    <p className="text-[8px] uppercase tracking-widest text-black/40 dark:text-white/40">{m.role?.replace('_', ' ')}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'}`}>{m.status}</span>
                </div>
              ))}
            </>}
          </div>
        </DetailModal>
      )}

      {modal === 'system' && (
        <DetailModal title="System Health" subtitle="Infrastructure Status" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-2">
            <DetailRow icon={Database} label="Total Transactions" value={stats.totalTxCount || 0} color="#3B82F6" />
            <DetailRow icon={ShieldCheck} label="Audit Logs" value={stats.auditLogsCount || 0} color="#10B981" />
            <DetailRow icon={Users} label="Total Members" value={d.totalMembers || 0} color="#8B5CF6" />
            <DetailRow icon={HandCoins} label="Active Loans" value={stats.activeLoans || 0} color="#F59E0B" />
            <DetailRow icon={Wallet} label="Pending Disbursements" value={stats.pendingDisbursementCount || 0} color="#F43F5E" />
          </div>
        </DetailModal>
      )}

      {modal === 'contributors' && (
        <DetailModal title="Top Contributors" subtitle="Highest Contributing Members" onClose={() => setModal(null)} accentColor="#F5A623">
          <div className="space-y-2">
            {(d.topContributors || []).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-black/[0.03] dark:border-white/5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ backgroundColor: i === 0 ? '#FEF3C7' : i === 1 ? '#F3F4F6' : '#FFF7ED', color: i === 0 ? '#D97706' : '#6B7280' }}>#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A1A2E] dark:text-white/90 truncate">{c.name}</p>
                  <p className="text-[8px] text-black/30 dark:text-white/30">{c.count} transactions</p>
                </div>
                <p className="text-sm font-black text-emerald-600">{fmt(c.total)}</p>
              </div>
            ))}
          </div>
        </DetailModal>
      )}

      {selectedTx && (
        <DetailModal title="Transaction Detail" subtitle={selectedTx.type === 'contribution' ? 'Inward Transfer' : 'Outward Transfer'} onClose={() => setSelectedTx(null)} accentColor={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'}>
          <div className="space-y-5">
            <DetailBigNumber value={fmt(selectedTx.amount)} label={selectedTx.type?.replace('_', ' ')} color={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'} />
            <div className="space-y-2">
              <DetailRow icon={Users} label="Member" value={selectedTx.member} color="#3B82F6" />
              <DetailRow icon={Clock} label="Date" value={dayjs(selectedTx.date).format('DD MMM YYYY • HH:mm')} color="#F5A623" />
              {selectedTx.note && <DetailRow icon={Layers} label="Note" value={selectedTx.note} color="#6B7280" />}
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
}
