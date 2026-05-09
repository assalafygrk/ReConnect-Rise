import { useState } from 'react';
import { Heart, HeartHandshake, HandHelping, Gift, CheckCircle2, XCircle, Clock, Users, AlertCircle, Gem, BadgeCheck, ShieldCheck, Activity, Wallet, Layers, ArrowUpRight, ArrowDownLeft, Scale, HandCoins } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';
import DetailModal, { DetailRow, DetailBigNumber, DetailGrid, DetailGridItem } from './DetailModal';
import dayjs from 'dayjs';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function WelfareDash({ data: d, user, config }) {
  const [modal, setModal] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const stats = d.stats || {};
  const my = d.myStats || {};
  const toll = d.treasuryToll || {};

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
            <div onClick={() => setModal('pending')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50 flex items-center gap-2"><AlertCircle size={10} className="text-amber-500" /> Pending</p>
              <p className="text-xl font-serif font-black text-amber-500">{stats.pendingRequests || 0} Requests</p>
            </div>
            <div onClick={() => setModal('grants')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Total Grants</p>
              <p className="text-xl font-serif font-black">{fmt(stats.totalWelfareGrants)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HeartHandshake} label="Welfare Pool" value={fmt(stats.welfareBalance)} color="#F43F5E" onClick={() => setModal('pool')} />
        <StatCard icon={HandHelping} label="Pending Review" value={stats.pendingRequests || 0} color="#FB7185" sub="Awaiting Your Action" onClick={() => setModal('pending')} />
        <StatCard icon={Gift} label="Grants Disbursed" value={fmt(stats.totalWelfareGrants)} color="#EC4899" onClick={() => setModal('grants')} />
        <StatCard icon={CheckCircle2} label="Approved Total" value={stats.totalApprovedRequests || 0} color="#10B981" sub={`${stats.totalDeclinedRequests || 0} declined`} onClick={() => setModal('outcomes')} />
      </div>

      {/* Pipeline Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => setModal('stage1')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600"><Clock size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Stage 1: New Requests</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Members awaiting your review</p>
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-amber-600">{stats.pendingRequests || 0}</p>
        </div>
        <div onClick={() => setModal('stage2')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600"><ShieldCheck size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Stage 2: At Group Leader</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">You approved, forwarded to leader</p>
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-purple-600">{stats.welfareApprovedRequests || 0}</p>
        </div>
        <div onClick={() => setModal('stage3')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"><BadgeCheck size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Stage 3: At Treasurer</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Leader approved, pending disburse</p>
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-emerald-600">{stats.leaderApprovedRequests || 0}</p>
        </div>
      </div>

      {/* My Personal Stats */}
      <div onClick={() => setModal('mystats')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm cursor-pointer hover:shadow-md transition-all">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><Gem size={16} className="text-[#F43F5E]" /> My Personal Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
            <p className="text-xl font-black text-[#F43F5E]">{fmt(my.totalContributions)}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">My Contributions</p>
          </div>
          <div className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
            <p className="text-xl font-black text-blue-600">{my.activeLoan > 0 ? fmt(my.activeLoan) : 'None'}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">Active Loan</p>
          </div>
          <div className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
            <p className="text-xl font-black text-emerald-600">{my.seniorityDays || 0}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">Days Served</p>
          </div>
          <div className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
            <p className="text-xl font-black" style={{ color: my.paidThisMonth ? '#10B981' : '#F43F5E' }}>{my.paidThisMonth ? '✓ Paid' : '✗ Due'}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">This Month</p>
          </div>
        </div>
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3"><FlowChart data={d.monthlyChart || []} title="Welfare Distribution" subtitle="Monthly Support Velocity" inflowColor="#F43F5E" outflowColor="#EC4899" gradientId="welfareFlow" /></div>
        <div className="lg:col-span-2"><ActivityFeed transactions={d.recentTransactions || []} title="Latest Grants" accentColor="#F43F5E" onSelect={(tx) => setSelectedTx(tx)} /></div>
      </div>

      <TreasuryToll toll={d.treasuryToll} accentColor="#F43F5E" />

      {/* ═══ MODALS ═══ */}
      {modal === 'pool' && (
        <DetailModal title="Welfare Pool" subtitle="Humanitarian Fund Status" onClose={() => setModal(null)} accentColor="#F43F5E">
          <div className="space-y-4">
            <DetailBigNumber value={fmt(stats.welfareBalance)} label="Welfare Fund Target" color="#F43F5E" />
            <DetailRow icon={Gift} label="Total Grants Given" value={fmt(stats.totalWelfareGrants)} color="#EC4899" sub="To members in need" />
            <DetailRow icon={HeartHandshake} label="Total Pool Balance" value={fmt(d.poolBalance)} color="#10B981" sub="Community-wide" />
            <DetailRow icon={ArrowUpRight} label="Monthly Inflow" value={fmt(toll.monthlyInflow)} color="#3B82F6" />
          </div>
        </DetailModal>
      )}
      {modal === 'pending' && (
        <DetailModal title="Pending Review" subtitle="Requests Awaiting Your Action" onClose={() => setModal(null)} accentColor="#FB7185">
          <div className="space-y-4">
            <DetailBigNumber value={stats.pendingRequests || 0} label="Awaiting Your Review" color="#F59E0B" />
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20">
              These are welfare requests submitted by members in need. As the Welfare Officer, you are the <strong>first line of review</strong>. After your approval, requests move to the Group Leader for final authorization.
            </p>
            <DetailRow icon={Clock} label="New Requests" value={stats.pendingRequests || 0} color="#F59E0B" />
            <DetailRow icon={ShieldCheck} label="At Group Leader" value={stats.welfareApprovedRequests || 0} color="#8B5CF6" />
            <DetailRow icon={BadgeCheck} label="At Treasurer" value={stats.leaderApprovedRequests || 0} color="#10B981" />
          </div>
        </DetailModal>
      )}
      {modal === 'grants' && (
        <DetailModal title="Grants Disbursed" subtitle="Welfare Fund Distribution" onClose={() => setModal(null)} accentColor="#EC4899">
          <div className="space-y-4">
            <DetailBigNumber value={fmt(stats.totalWelfareGrants)} label="Total Welfare Grants" color="#EC4899" />
            <DetailGrid>
              <DetailGridItem value={stats.totalApprovedRequests || 0} label="Approved" color="#10B981" />
              <DetailGridItem value={stats.totalDeclinedRequests || 0} label="Declined" color="#F43F5E" />
            </DetailGrid>
          </div>
        </DetailModal>
      )}
      {modal === 'outcomes' && (
        <DetailModal title="Request Outcomes" subtitle="Approval & Decline Breakdown" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={stats.totalApprovedRequests || 0} label="Approved" color="#10B981" />
              <DetailGridItem value={stats.totalDeclinedRequests || 0} label="Declined" color="#F43F5E" />
              <DetailGridItem value={stats.welfareApprovedRequests || 0} label="In Progress" color="#F59E0B" />
              <DetailGridItem value={(stats.pendingRequests || 0) + (stats.welfareApprovedRequests || 0) + (stats.leaderApprovedRequests || 0)} label="Total Pipeline" color="#8B5CF6" />
            </DetailGrid>
          </div>
        </DetailModal>
      )}
      {modal === 'stage1' && (
        <DetailModal title="Stage 1: New Requests" subtitle="Awaiting Your Initial Review" onClose={() => setModal(null)} accentColor="#F59E0B">
          <div className="space-y-4">
            <DetailBigNumber value={stats.pendingRequests || 0} label="New Requests" color="#F59E0B" />
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20">
              Members have submitted welfare assistance requests. Review each case, then <strong>approve</strong> (forwards to Group Leader) or <strong>decline</strong> with reason.
            </p>
          </div>
        </DetailModal>
      )}
      {modal === 'stage2' && (
        <DetailModal title="Stage 2: At Group Leader" subtitle="Awaiting Leader Decision" onClose={() => setModal(null)} accentColor="#8B5CF6">
          <div className="space-y-4">
            <DetailBigNumber value={stats.welfareApprovedRequests || 0} label="At Group Leader" color="#8B5CF6" />
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/20">
              You have reviewed and approved these requests. They are now with the Group Leader for final authorization before treasury disbursement.
            </p>
          </div>
        </DetailModal>
      )}
      {modal === 'stage3' && (
        <DetailModal title="Stage 3: At Treasurer" subtitle="Pending Fund Disbursement" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailBigNumber value={stats.leaderApprovedRequests || 0} label="Awaiting Disbursement" color="#10B981" />
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20">
              Both you and the Group Leader have approved. The Treasurer will now disburse the funds to the requesting member.
            </p>
          </div>
        </DetailModal>
      )}
      {modal === 'mystats' && (
        <DetailModal title="My Profile" subtitle="Personal Financial Summary" onClose={() => setModal(null)} accentColor="#F43F5E">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={fmt(my.totalContributions)} label="Contributions" color="#F43F5E" />
              <DetailGridItem value={`${my.trustScore || 0}%`} label="Trust Score" color="#3B82F6" />
              <DetailGridItem value={`${my.seniorityDays || 0}d`} label="Seniority" color="#10B981" />
              <DetailGridItem value={my.paidThisMonth ? 'Paid' : 'Due'} label="This Month" color={my.paidThisMonth ? '#10B981' : '#F43F5E'} />
            </DetailGrid>
            <DetailRow icon={HandCoins} label="Active Loan" value={my.activeLoan > 0 ? fmt(my.activeLoan) : 'None'} color="#8B5CF6" />
            <DetailRow icon={Activity} label="Join Date" value={dayjs(my.joinDate).format('DD MMM YYYY')} color="#F5A623" />
          </div>
        </DetailModal>
      )}
      {selectedTx && (
        <DetailModal title="Transaction Detail" subtitle={selectedTx.type === 'contribution' ? 'Inward Transfer' : 'Outward Transfer'} onClose={() => setSelectedTx(null)} accentColor={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'}>
          <div className="space-y-5">
            <DetailBigNumber value={fmt(selectedTx.amount)} label={selectedTx.type?.replace('_', ' ')} color={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'} />
            <DetailRow icon={Users} label="Member" value={selectedTx.member} color="#F43F5E" />
            <DetailRow icon={Clock} label="Date" value={dayjs(selectedTx.date).format('DD MMM YYYY • HH:mm')} color="#F5A623" />
          </div>
        </DetailModal>
      )}
    </div>
  );
}
