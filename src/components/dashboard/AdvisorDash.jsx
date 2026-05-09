import { useState } from 'react';
import { Lightbulb, Scale, Users, Scroll, MessageSquare, ThumbsUp, Eye, Gem, CheckCircle2, Activity, Star, BookOpen, Trophy, Wallet, HandCoins, Clock, Layers, BarChart3 } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';
import DetailModal, { DetailRow, DetailBigNumber, DetailGrid, DetailGridItem } from './DetailModal';
import dayjs from 'dayjs';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function AdvisorDash({ data: d, user, config }) {
  const [modal, setModal] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const stats = d.stats || {};
  const my = d.myStats || {};
  const toll = d.treasuryToll || {};

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6 px-4">
      {/* Hero */}
      <div className="relative bg-white dark:bg-[#78350F] rounded-[2rem] p-7 md:p-12 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden group transition-all duration-500">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#F5A623] rounded-full blur-[150px] opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-1000" />
        <div className="absolute top-1/2 -translate-y-1/2 right-10 text-black/[0.01] dark:text-white/[0.02] pointer-events-none"><Scroll size={300} /></div>
        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#FCD34D] backdrop-blur-md">
              <Scroll size={12} className="animate-pulse" /> Eminent Council
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-none">Special Adviser</h1>
            <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 leading-relaxed font-serif">"Wisdom in deliberation, justice in action. Your counsel shapes the brotherhood."</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div onClick={() => setModal('sentiment')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Sentiment</p>
              <p className="text-2xl font-serif font-black text-[#FCD34D]">{Math.round(stats.avgSentiment || 0)}%</p>
            </div>
            <div onClick={() => setModal('directives')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Directives</p>
              <p className="text-2xl font-serif font-black">{stats.visionCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Lightbulb} label="Advice Rooms" value={stats.visionCount || 0} color="#F5A623" sub="Active Sessions" onClick={() => setModal('directives')} />
        <StatCard icon={Scale} label="Community Sentiment" value={`${Math.round(stats.avgSentiment || 0)}%`} color="#D97706" sub="Peer Approval" onClick={() => setModal('sentiment')} />
        <StatCard icon={Users} label="Total Members" value={d.totalMembers || 0} color="#3B82F6" sub="Brotherhood Network" onClick={() => setModal('network')} />
        <StatCard icon={Activity} label="Meetings" value={stats.upcomingMeetings || 0} color="#10B981" sub="Upcoming Events" onClick={() => setModal('meetings')} />
      </div>

      {/* Advisory Influence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => setModal('directives')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600"><MessageSquare size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Policy Directives</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Your issued counsel</p>
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-amber-600">{stats.visionCount || 0}</p>
        </div>
        <div onClick={() => setModal('governance')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600"><ThumbsUp size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Governance Votes</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Elections & resolutions</p>
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-blue-600">{stats.totalApprovedRequests || 0}</p>
        </div>
        <div onClick={() => setModal('audit')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600"><BookOpen size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Documentary</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Institutional records</p>
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-purple-600">{stats.auditLogsCount || 0}</p>
        </div>
      </div>

      {/* My Personal Stats */}
      <div onClick={() => setModal('mystats')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm cursor-pointer hover:shadow-md transition-all">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><Star size={16} className="text-[#FCD34D]" /> My Advisory Profile</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
            <p className="text-xl font-black text-[#F5A623]">{fmt(my.totalContributions)}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">My Contributions</p>
          </div>
          <div className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
            <p className="text-xl font-black text-blue-600">{my.trustScore || 0}%</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">Trust Score</p>
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
        <div className="lg:col-span-3"><FlowChart data={d.monthlyChart || []} title="Community Sentiment Pulse" subtitle="Deliberation & Participation" inflowColor="#D97706" outflowColor="#1A1A2E" gradientId="advisorFlow" /></div>
        <div className="lg:col-span-2"><ActivityFeed transactions={d.recentTransactions || []} title="Recent Activity" accentColor="#D97706" onSelect={(tx) => setSelectedTx(tx)} /></div>
      </div>

      <TreasuryToll toll={d.treasuryToll} accentColor="#D97706" />

      {/* ═══ MODALS ═══ */}
      {modal === 'directives' && (
        <DetailModal title="Policy Directives" subtitle="Advisory Counsel Record" onClose={() => setModal(null)} accentColor="#F5A623">
          <div className="space-y-4">
            <DetailBigNumber value={stats.visionCount || 0} label="Total Directives Issued" color="#F5A623" />
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20">
              As Special Adviser, your counsel guides the brotherhood's direction. Each directive represents your wisdom shared with the community through the Advice Room.
            </p>
            <DetailRow icon={MessageSquare} label="Active Sessions" value={stats.visionCount || 0} color="#F5A623" />
            <DetailRow icon={ThumbsUp} label="Community Sentiment" value={`${Math.round(stats.avgSentiment || 0)}%`} color="#10B981" sub="Average peer approval" />
          </div>
        </DetailModal>
      )}
      {modal === 'sentiment' && (
        <DetailModal title="Community Sentiment" subtitle="Peer Approval Analysis" onClose={() => setModal(null)} accentColor="#D97706">
          <div className="space-y-5">
            <DetailBigNumber value={`${Math.round(stats.avgSentiment || 0)}%`} label="Average Sentiment Score" color={stats.avgSentiment >= 50 ? '#10B981' : '#F59E0B'} />
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Approval Gauge</p>
              <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round(stats.avgSentiment || 0)}%`, background: 'linear-gradient(90deg, #D97706, #FCD34D)' }} />
              </div>
            </div>
            <DetailRow icon={Lightbulb} label="Directives Issued" value={stats.visionCount || 0} color="#F5A623" />
            <DetailRow icon={Users} label="Members Engaging" value={d.totalMembers || 0} color="#3B82F6" />
          </div>
        </DetailModal>
      )}
      {modal === 'network' && (
        <DetailModal title="Brotherhood Network" subtitle="Community Overview" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={d.activeMembers || 0} label="Active" color="#10B981" />
              <DetailGridItem value={d.pendingMembers || 0} label="Pending" color="#F59E0B" />
              <DetailGridItem value={d.suspendedMembers || 0} label="Suspended" color="#F43F5E" />
              <DetailGridItem value={d.totalMembers || 0} label="Total" color="#3B82F6" />
            </DetailGrid>
            <DetailRow icon={Wallet} label="Pool Balance" value={fmt(d.poolBalance)} color="#10B981" />
            <DetailRow icon={BarChart3} label="Collection Rate" value={`${toll.collectionRate || 0}%`} color="#F5A623" />
          </div>
        </DetailModal>
      )}
      {modal === 'meetings' && (
        <DetailModal title="Meetings & Majlis" subtitle="Gathering Schedule" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={stats.upcomingMeetings || 0} label="Upcoming" color="#10B981" />
              <DetailGridItem value={stats.totalMeetings || 0} label="Total Held" color="#3B82F6" />
            </DetailGrid>
            <DetailRow icon={Users} label="Avg Attendance" value={stats.avgAttendance || 0} color="#8B5CF6" sub="Members per meeting" />
          </div>
        </DetailModal>
      )}
      {modal === 'governance' && (
        <DetailModal title="Governance & Votes" subtitle="Democratic Participation" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-4">
            <DetailBigNumber value={stats.totalApprovedRequests || 0} label="Resolutions Passed" color="#3B82F6" />
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20">
              Governance decisions are made through community voting. As Special Adviser, your input carries advisory weight in shaping these outcomes.
            </p>
            <DetailRow icon={ThumbsUp} label="Welfare Approved" value={stats.totalApprovedRequests || 0} color="#10B981" />
            <DetailRow icon={Layers} label="Declined" value={stats.totalDeclinedRequests || 0} color="#F43F5E" />
          </div>
        </DetailModal>
      )}
      {modal === 'audit' && (
        <DetailModal title="Documentary Records" subtitle="Institutional Audit Trail" onClose={() => setModal(null)} accentColor="#8B5CF6">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={stats.auditLogsCount || 0} label="Audit Logs" color="#8B5CF6" />
              <DetailGridItem value={stats.totalTxCount || 0} label="Transactions" color="#3B82F6" />
            </DetailGrid>
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/20">
              Every administrative action is logged for transparency. This includes role changes, fund movements, approvals, and system configuration updates.
            </p>
          </div>
        </DetailModal>
      )}
      {modal === 'mystats' && (
        <DetailModal title="Advisory Profile" subtitle="Personal Financial Summary" onClose={() => setModal(null)} accentColor="#F5A623">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={fmt(my.totalContributions)} label="Contributions" color="#F5A623" />
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
            <DetailRow icon={Users} label="Member" value={selectedTx.member} color="#D97706" />
            <DetailRow icon={Clock} label="Date" value={dayjs(selectedTx.date).format('DD MMM YYYY • HH:mm')} color="#F5A623" />
          </div>
        </DetailModal>
      )}
    </div>
  );
}
