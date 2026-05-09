import { useNavigate } from 'react-router-dom';
import { Wallet, Gem, CheckCircle2, Layers, ShieldCheck, Fingerprint, Calendar, Award, Trophy, Star, Heart, HeartHandshake, HandHelping, Lightbulb, Scale, CalendarRange, Mic2, MapPin, Activity } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function MemberDash({ data: d, user, config, role }) {
  const nav = useNavigate();
  const stats = d.stats || {};
  const my = d.myStats || {};
  const goalPct = Math.min(100, Math.round(((d.poolBalance || 0) / (config.savingsGoal || d.savingsGoal || 1000000)) * 100));
  const isOfficial = role === 'official_member';
  const isWelfare = role === 'welfare';
  const isAdvisor = role === 'special_advicer';
  const isOrganizer = role === 'organizer' || role === 'meeting-organizer';

  const heroConfig = {
    welfare: { bg: 'dark:bg-[#4C0519]', glow: '#F43F5E', badge: 'Humanitarian Support', title: 'Welfare Council', quote: '"Your well-being is our shared responsibility."', icon: Heart },
    special_advicer: { bg: 'dark:bg-[#78350F]', glow: '#F5A623', badge: 'Eminent Council', title: 'Special Adviser', quote: '"Wisdom in deliberation, justice in action."', icon: Lightbulb },
    organizer: { bg: 'dark:bg-[#0F766E]', glow: '#14B8A6', badge: 'Majlis Coordination', title: 'Meeting Organizer', quote: '"Orchestrating unity, facilitating brotherhood."', icon: CalendarRange },
    'meeting-organizer': { bg: 'dark:bg-[#0F766E]', glow: '#14B8A6', badge: 'Majlis Coordination', title: 'Meeting Organizer', quote: '"Orchestrating unity."', icon: CalendarRange },
    official_member: { bg: 'dark:bg-[#0F172A]', glow: '#3B82F6', badge: 'Brotherhood Core', title: 'Official Member', quote: `Welcome, Brother ${user?.name?.split(' ')[0] || ''}. Trust Score: ${my.trustScore || 0}%`, icon: Award },
    member: { bg: 'dark:bg-[#0B1221]', glow: '#3B82F6', badge: 'New Joiner Portal', title: `Assalamu Alaikum, ${user?.name?.split(' ')[0] || 'Brother'}`, quote: 'Your journey of growth and contribution starts here.', icon: ShieldCheck },
  };
  const h = heroConfig[role] || heroConfig.member;
  const HeroIcon = h.icon;
  const accentColor = h.glow;

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6 px-4">
      {/* Hero */}
      <div className={`relative bg-white ${h.bg} rounded-[2rem] p-7 md:p-12 text-[#1A1A2E] dark:text-white shadow-xl shadow-black/5 dark:shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden group transition-all duration-500`}>
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full blur-[150px] opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-1000" style={{ backgroundColor: h.glow }} />
        <div className="absolute -bottom-20 -right-20 text-white/[0.01] -rotate-12 select-none pointer-events-none"><Fingerprint size={350} /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md" style={{ color: accentColor }}>
              <HeroIcon size={12} className="animate-pulse" /> {h.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-none">{h.title}</h1>
            <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 leading-relaxed font-serif">{h.quote}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div onClick={() => nav('/contributions')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">My Total</p>
              <p className="text-xl font-serif font-black">{fmt(my.totalContributions)}</p>
            </div>
            <div onClick={() => nav('/loans')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Active Loan</p>
              <p className="text-xl font-serif font-black" style={{ color: accentColor }}>{my.activeLoan > 0 ? fmt(my.activeLoan) : 'None'}</p>
            </div>
            <div onClick={() => nav('/contributions')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md col-span-2 sm:col-span-1 cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Status</p>
              <p className="text-lg font-bold flex items-center gap-2" style={{ color: my.paidThisMonth ? '#10B981' : '#F43F5E' }}>
                {my.paidThisMonth ? <><CheckCircle2 size={16} /> Paid</> : <><Layers size={16} /> Unpaid</>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isWelfare ? (<>
          <StatCard icon={HeartHandshake} label="Welfare Pool" value={fmt(stats.welfareBalance)} color="#F43F5E" onClick={() => nav('/welfare')} />
          <StatCard icon={HandHelping} label="Pending Requests" value={stats.pendingRequests || 0} color="#FB7185" sub="Awaiting Review" onClick={() => nav('/welfare')} />
          <StatCard icon={Heart} label="Grants Disbursed" value={fmt(stats.totalWelfareGrants)} color="#EC4899" onClick={() => nav('/disbursements')} />
          <StatCard icon={CheckCircle2} label="Approved" value={stats.totalApprovedRequests || 0} color="#10B981" onClick={() => nav('/welfare')} />
        </>) : isAdvisor ? (<>
          <StatCard icon={Lightbulb} label="Advice Rooms" value={stats.visionCount || 0} color="#F5A623" onClick={() => nav('/advice')} />
          <StatCard icon={Scale} label="Sentiment" value={`${Math.round(stats.avgSentiment || 0)}%`} color="#D97706" onClick={() => nav('/advice')} />
          <StatCard icon={Gem} label="My Contributions" value={fmt(my.totalContributions)} color="#3B82F6" onClick={() => nav('/contributions')} />
          <StatCard icon={Activity} label="Participation" value="Active" color="#10B981" onClick={() => nav('/profile')} />
        </>) : isOrganizer ? (<>
          <StatCard icon={Mic2} label="Upcoming Majlis" value={stats.upcomingMeetings || 0} color="#14B8A6" onClick={() => nav('/meetings')} />
          <StatCard icon={MapPin} label="Total Meetings" value={stats.totalMeetings || 0} color="#0D9488" onClick={() => nav('/meetings')} />
          <StatCard icon={Gem} label="Avg Attendance" value={stats.avgAttendance || 0} color="#2DD4BF" onClick={() => nav('/meetings')} />
          <StatCard icon={Activity} label="Status" value="Active" color="#F5A623" onClick={() => nav('/profile')} />
        </>) : isOfficial ? (<>
          <StatCard icon={Trophy} label="Seniority" value={`${my.seniorityDays || 0} days`} color="#64748B" onClick={() => nav('/profile')} />
          <StatCard icon={Star} label="Trust Score" value={`${my.trustScore || 0}%`} color="#3B82F6" onClick={() => nav('/profile')} />
          <StatCard icon={Gem} label="Contributions" value={fmt(my.totalContributions)} color="#F5A623" trend={+15} onClick={() => nav('/contributions')} />
          <StatCard icon={Activity} label="Participation" value="High" color="#10B981" onClick={() => nav('/contributions')} />
        </>) : (<>
          <StatCard icon={Wallet} label="Treasury" value={fmt(d.poolBalance)} color="#3B82F6" onClick={() => nav('/wallet')} />
          <StatCard icon={Gem} label="Goal" value={`${goalPct}%`} color="#F5A623" sub={fmt(config.savingsGoal || d.savingsGoal)} trend={goalPct > 50 ? +12 : null} onClick={() => nav('/contributions')} />
          <StatCard icon={CheckCircle2} label="Payers" value={`${d.totalPaid || 0} / ${d.totalMembers || 0}`} color="#10B981" onClick={() => nav('/contributions')} />
          <StatCard icon={Layers} label="Unpaid" value={d.totalUnpaid || 0} color="#F43F5E" onClick={() => nav('/contributions')} />
        </>)}
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 cursor-pointer" onClick={() => nav('/contributions')}>
          <FlowChart data={d.monthlyChart || []} title={isWelfare ? 'Welfare Distribution' : 'Fiscal Trajectory'} subtitle="Annual Growth Analysis" inflowColor={accentColor} gradientId={`${role}Flow`} showOutflow={!isAdvisor && !isOrganizer} />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed transactions={d.recentTransactions || []} title="Recent Activity" accentColor={accentColor} onSelect={() => nav('/wallet')} />
        </div>
      </div>

      {/* Goal Progress */}
      {!isWelfare && !isAdvisor && !isOrganizer && (
        <div onClick={() => nav('/contributions')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm space-y-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.3em]">Community Goal Engine</h3>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>{goalPct}% Complete</span>
          </div>
          <div className="relative w-full h-3 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-black/[0.03] dark:border-white/5">
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${goalPct}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-black/40 dark:text-white/40">
            <span>COLLECTED: {fmt(d.poolBalance)}</span>
            <span>TARGET: {fmt(config.savingsGoal || d.savingsGoal)}</span>
          </div>
        </div>
      )}

      {/* Treasury Toll */}
      <TreasuryToll toll={d.treasuryToll} accentColor={accentColor} />
    </div>
  );
}
