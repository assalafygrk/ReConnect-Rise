import { useNavigate } from 'react-router-dom';
import { Lightbulb, Scale, Users, Scroll, MessageSquare, ThumbsUp, Eye, Gem, CheckCircle2, Activity, Star, BookOpen, ArrowRight, Trophy } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function AdvisorDash({ data: d, user, config }) {
  const nav = useNavigate();
  const stats = d.stats || {};
  const my = d.myStats || {};

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
            <div onClick={() => nav('/advice')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Sentiment</p>
              <p className="text-2xl font-serif font-black text-[#FCD34D]">{Math.round(stats.avgSentiment || 0)}%</p>
            </div>
            <div onClick={() => nav('/advice')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Directives</p>
              <p className="text-2xl font-serif font-black">{stats.visionCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Lightbulb} label="Advice Rooms" value={stats.visionCount || 0} color="#F5A623" sub="Active Sessions" onClick={() => nav('/advice')} />
        <StatCard icon={Scale} label="Community Sentiment" value={`${Math.round(stats.avgSentiment || 0)}%`} color="#D97706" sub="Peer Approval" onClick={() => nav('/advice')} />
        <StatCard icon={Users} label="Total Members" value={d.totalMembers || 0} color="#3B82F6" sub="Brotherhood Network" onClick={() => nav('/members')} />
        <StatCard icon={Activity} label="Meetings" value={stats.upcomingMeetings || 0} color="#10B981" sub="Upcoming Events" onClick={() => nav('/meetings')} />
      </div>

      {/* Advisory Influence & Governance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => nav('/advice')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600"><MessageSquare size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Policy Directives</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Your issued counsel</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-serif font-black text-amber-600">{stats.visionCount || 0}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
        <div onClick={() => nav('/votes')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600"><ThumbsUp size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Governance Votes</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Elections & resolutions</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-serif font-black text-blue-600">{stats.totalApprovedRequests || 0}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
        <div onClick={() => nav('/documentary')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600"><BookOpen size={18} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Documentary</p>
              <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">Institutional records</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-serif font-black text-purple-600">{stats.auditLogsCount || 0}</p>
            <ArrowRight size={14} className="text-black/15 dark:text-white/15" />
          </div>
        </div>
      </div>

      {/* My Personal Stats */}
      <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><Star size={16} className="text-[#FCD34D]" /> My Advisory Profile</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div onClick={() => nav('/contributions')} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center cursor-pointer hover:scale-[1.03] transition-transform">
            <p className="text-xl font-black text-[#F5A623]">{fmt(my.totalContributions)}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">My Contributions</p>
          </div>
          <div onClick={() => nav('/profile')} className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center cursor-pointer hover:scale-[1.03] transition-transform">
            <p className="text-xl font-black text-blue-600">{my.trustScore || 0}%</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">Trust Score</p>
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
        <div className="lg:col-span-3 cursor-pointer" onClick={() => nav('/advice')}>
          <FlowChart data={d.monthlyChart || []} title="Community Sentiment Pulse" subtitle="Deliberation & Participation Metrics" inflowColor="#D97706" outflowColor="#1A1A2E" gradientId="advisorFlow" />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed transactions={d.recentTransactions || []} title="Recent Activity" accentColor="#D97706" onSelect={() => nav('/wallet')} />
        </div>
      </div>

      {/* Treasury Toll */}
      <TreasuryToll toll={d.treasuryToll} accentColor="#D97706" />
    </div>
  );
}
