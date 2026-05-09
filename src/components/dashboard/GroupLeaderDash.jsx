import { useState } from 'react';
import { Users, Crown, Target, CheckCircle2, ShieldCheck, HeartHandshake, HandCoins, UserPlus, ArrowUpRight, ArrowDownLeft, Clock, Wallet, PiggyBank, Scale, Layers, BarChart3, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';
import DetailModal, { DetailRow, DetailBigNumber, DetailGrid, DetailGridItem } from './DetailModal';
import dayjs from 'dayjs';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function GroupLeaderDash({ data: d, user, config }) {
  const [modal, setModal] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const stats = d.stats || {};
  const toll = d.treasuryToll || {};
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
            <div onClick={() => setModal('collection')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Active Base</p>
              <p className="text-xl font-serif font-black">{d.totalPaid || 0}/{d.totalMembers || 0}</p>
            </div>
            <div onClick={() => setModal('welfare')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Welfare Queue</p>
              <p className="text-xl font-serif font-black text-amber-500">{stats.welfareApprovedRequests || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Members" value={d.totalMembers || 0} color="#8B5CF6" onClick={() => setModal('members')} />
        <StatCard icon={Target} label="Goal Progress" value={`${goalPct}%`} color="#C084FC" sub={fmt(d.poolBalance)} trend={goalPct > 50 ? +5 : -2} onClick={() => setModal('goal')} />
        <StatCard icon={CheckCircle2} label="Paid This Month" value={d.totalPaid || 0} color="#10B981" sub={`${d.totalUnpaid || 0} unpaid`} onClick={() => setModal('collection')} />
        <StatCard icon={ShieldCheck} label="Pending Requests" value={(stats.pendingRequests || 0) + (stats.welfareApprovedRequests || 0)} color="#F5A623" sub="Welfare + Loans" onClick={() => setModal('pending')} />
      </div>

      {/* Pending Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => setModal('welfare')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600"><HeartHandshake size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Welfare Awaiting Review</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.welfareApprovedRequests || 0}</p>
          <p className="text-[9px] text-black/30 dark:text-white/30 mt-1">Forwarded by Welfare Officer</p>
        </div>
        <div onClick={() => setModal('loans')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600"><HandCoins size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Loan Requests</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.pendingLoansCount || 0}</p>
          <p className="text-[9px] text-black/30 dark:text-white/30 mt-1">Awaiting your decision</p>
        </div>
        <div onClick={() => setModal('newmembers')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
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
        <div className="lg:col-span-3"><FlowChart data={d.monthlyChart || []} title="Group Growth Matrix" subtitle="Contribution & Participation" inflowColor="#8B5CF6" outflowColor="#EC4899" gradientId="glFlow" /></div>
        <div className="lg:col-span-2"><ActivityFeed transactions={d.recentTransactions || []} title="Member Activity" accentColor="#8B5CF6" onSelect={(tx) => setSelectedTx(tx)} /></div>
      </div>

      <TreasuryToll toll={d.treasuryToll} accentColor="#8B5CF6" />

      {/* ═══ MODALS ═══ */}
      {modal === 'members' && (
        <DetailModal title="Membership Overview" subtitle="Brotherhood Network" onClose={() => setModal(null)} accentColor="#8B5CF6">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={d.activeMembers || 0} label="Active" color="#10B981" />
              <DetailGridItem value={d.pendingMembers || 0} label="Pending" color="#F59E0B" />
              <DetailGridItem value={d.suspendedMembers || 0} label="Suspended" color="#F43F5E" />
              <DetailGridItem value={d.totalMembers || 0} label="Total" color="#8B5CF6" />
            </DetailGrid>
            {d.recentMembers?.length > 0 && <>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 pt-2">Latest Registrations</p>
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
            </>}
          </div>
        </DetailModal>
      )}
      {modal === 'goal' && (
        <DetailModal title="Goal Trajectory" subtitle="Community Savings Progress" onClose={() => setModal(null)} accentColor="#C084FC">
          <div className="space-y-5">
            <DetailGrid>
              <DetailGridItem value={fmt(d.poolBalance)} label="Collected" color="#10B981" />
              <DetailGridItem value={fmt(config.savingsGoal || d.savingsGoal)} label="Target" color="#C084FC" />
            </DetailGrid>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${goalPct}%`, background: 'linear-gradient(90deg, #8B5CF6, #C084FC)' }} />
              </div>
              <p className="text-center text-2xl font-black text-[#8B5CF6]">{goalPct}%</p>
            </div>
            <DetailRow icon={ArrowUpRight} label="Monthly Inflow" value={fmt(toll.monthlyInflow)} color="#10B981" />
            <DetailRow icon={BarChart3} label="Weekly Dues" value={fmt(stats.weeklyContributionAmount)} color="#3B82F6" />
          </div>
        </DetailModal>
      )}
      {modal === 'collection' && (
        <DetailModal title="Collection Status" subtitle="Monthly Payment Overview" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailBigNumber value={`${toll.collectionRate || 0}%`} label="Collection Rate" color={toll.collectionRate >= 70 ? '#10B981' : '#F43F5E'} />
            <DetailGrid>
              <DetailGridItem value={d.totalPaid || 0} label="Paid" color="#10B981" />
              <DetailGridItem value={d.totalUnpaid || 0} label="Unpaid" color="#F43F5E" />
            </DetailGrid>
            <DetailRow icon={Wallet} label="Weekly Amount" value={fmt(stats.weeklyContributionAmount)} color="#F5A623" sub="Required per member" />
          </div>
        </DetailModal>
      )}
      {modal === 'pending' && (
        <DetailModal title="Pending Actions" subtitle="Your Approval Queue" onClose={() => setModal(null)} accentColor="#F5A623">
          <div className="space-y-2">
            <DetailRow icon={HeartHandshake} label="Welfare Requests (Forwarded)" value={stats.welfareApprovedRequests || 0} color="#EC4899" sub="From welfare officer" />
            <DetailRow icon={AlertCircle} label="Welfare Requests (New)" value={stats.pendingRequests || 0} color="#F43F5E" sub="First-stage review" />
            <DetailRow icon={HandCoins} label="Loan Applications" value={stats.pendingLoansCount || 0} color="#8B5CF6" sub="Pending your decision" />
            <DetailRow icon={UserPlus} label="New Members" value={d.pendingMembers || 0} color="#10B981" sub="Awaiting approval" />
          </div>
        </DetailModal>
      )}
      {modal === 'welfare' && (
        <DetailModal title="Welfare Pipeline" subtitle="Request Approval Flow" onClose={() => setModal(null)} accentColor="#EC4899">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={stats.pendingRequests || 0} label="New Requests" color="#F59E0B" />
              <DetailGridItem value={stats.welfareApprovedRequests || 0} label="At Your Desk" color="#EC4899" />
              <DetailGridItem value={stats.leaderApprovedRequests || 0} label="At Treasurer" color="#8B5CF6" />
              <DetailGridItem value={stats.totalApprovedRequests || 0} label="Fully Approved" color="#10B981" />
            </DetailGrid>
            <DetailRow icon={Scale} label="Welfare Grants Total" value={fmt(stats.totalWelfareGrants)} color="#EC4899" />
            <DetailRow icon={Layers} label="Declined" value={stats.totalDeclinedRequests || 0} color="#F43F5E" />
          </div>
        </DetailModal>
      )}
      {modal === 'loans' && (
        <DetailModal title="Loan Requests" subtitle="Pending Your Decision" onClose={() => setModal(null)} accentColor="#8B5CF6">
          <div className="space-y-4">
            <DetailBigNumber value={stats.pendingLoansCount || 0} label="Pending Loan Applications" color="#8B5CF6" />
            <DetailRow icon={HandCoins} label="Active Loans" value={stats.activeLoans || 0} color="#3B82F6" sub={`${fmt(stats.totalLoansOut)} outstanding`} />
            <DetailRow icon={BarChart3} label="Max Loan Amount" value={fmt(stats.maxLoanAmount)} color="#F5A623" />
            <DetailRow icon={PiggyBank} label="Interest Rate" value={`${stats.loanInterestRate || 0}%`} color="#10B981" />
          </div>
        </DetailModal>
      )}
      {modal === 'newmembers' && (
        <DetailModal title="New Members" subtitle="Pending Approval" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailBigNumber value={d.pendingMembers || 0} label="Awaiting Activation" color="#F59E0B" />
            <DetailRow icon={Users} label="Total Active" value={d.activeMembers || 0} color="#10B981" />
            <DetailRow icon={Users} label="Total Suspended" value={d.suspendedMembers || 0} color="#F43F5E" />
            {d.recentMembers?.length > 0 && <>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 pt-2">Recent Registrations</p>
              {d.recentMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 text-xs font-black">{m.name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 truncate">{m.name}</p>
                    <p className="text-[8px] uppercase tracking-widest text-black/40 dark:text-white/40">{m.role?.replace('_', ' ')} • {dayjs(m.joinedAt).format('DD MMM')}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'}`}>{m.status}</span>
                </div>
              ))}
            </>}
          </div>
        </DetailModal>
      )}
      {selectedTx && (
        <DetailModal title="Transaction Detail" subtitle={selectedTx.type === 'contribution' ? 'Inward Transfer' : 'Outward Transfer'} onClose={() => setSelectedTx(null)} accentColor={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'}>
          <div className="space-y-5">
            <DetailBigNumber value={fmt(selectedTx.amount)} label={selectedTx.type?.replace('_', ' ')} color={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'} />
            <DetailRow icon={Users} label="Member" value={selectedTx.member} color="#8B5CF6" />
            <DetailRow icon={Clock} label="Date" value={dayjs(selectedTx.date).format('DD MMM YYYY • HH:mm')} color="#F5A623" />
          </div>
        </DetailModal>
      )}
    </div>
  );
}
