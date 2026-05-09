import { useState } from 'react';
import { Wallet, Gem, CheckCircle2, Layers, ShieldCheck, Fingerprint, Award, Trophy, Star, CalendarRange, Mic2, MapPin, Activity, Users, HandCoins, Clock, ArrowUpRight, ArrowDownLeft, Target, BarChart3, PiggyBank } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';
import DetailModal, { DetailRow, DetailBigNumber, DetailGrid, DetailGridItem } from './DetailModal';
import dayjs from 'dayjs';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function MemberDash({ data: d, user, config, role }) {
  const [modal, setModal] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const stats = d.stats || {};
  const my = d.myStats || {};
  const toll = d.treasuryToll || {};
  const goalPct = Math.min(100, Math.round(((d.poolBalance || 0) / (config.savingsGoal || d.savingsGoal || 1000000)) * 100));
  const isOfficial = role === 'official_member';
  const isOrganizer = role === 'organizer' || role === 'meeting-organizer';

  const heroConfig = {
    organizer: { bg: 'dark:bg-[#0F766E]', glow: '#14B8A6', badge: 'Majlis Coordination', title: 'Meeting Organizer', icon: CalendarRange },
    'meeting-organizer': { bg: 'dark:bg-[#0F766E]', glow: '#14B8A6', badge: 'Majlis Coordination', title: 'Meeting Organizer', icon: CalendarRange },
    official_member: { bg: 'dark:bg-[#0F172A]', glow: '#3B82F6', badge: 'Brotherhood Core', title: 'Official Member', icon: Award },
    member: { bg: 'dark:bg-[#0B1221]', glow: '#3B82F6', badge: 'New Joiner Portal', title: `Assalamu Alaikum, ${user?.name?.split(' ')[0] || 'Brother'}`, icon: ShieldCheck },
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
            <p className="text-base md:text-lg font-medium text-black/50 dark:text-white/60 leading-relaxed font-serif">
              {isOfficial ? `Welcome, Brother ${user?.name?.split(' ')[0] || ''}. Trust Score: ${my.trustScore || 0}%` : isOrganizer ? '"Orchestrating unity, facilitating brotherhood."' : 'Your journey of growth and contribution starts here.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div onClick={() => setModal('mystats')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">My Total</p>
              <p className="text-xl font-serif font-black">{fmt(my.totalContributions)}</p>
            </div>
            <div onClick={() => setModal('loan')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Active Loan</p>
              <p className="text-xl font-serif font-black" style={{ color: accentColor }}>{my.activeLoan > 0 ? fmt(my.activeLoan) : 'None'}</p>
            </div>
            <div onClick={() => setModal('status')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md col-span-2 sm:col-span-1 cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Status</p>
              <p className="text-lg font-bold flex items-center gap-2" style={{ color: my.paidThisMonth ? '#10B981' : '#F43F5E' }}>
                {my.paidThisMonth ? <><CheckCircle2 size={16} /> Paid</> : <><Layers size={16} /> Unpaid</>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isOrganizer ? (<>
          <StatCard icon={Mic2} label="Upcoming Majlis" value={stats.upcomingMeetings || 0} color="#14B8A6" onClick={() => setModal('meetings')} />
          <StatCard icon={MapPin} label="Total Meetings" value={stats.totalMeetings || 0} color="#0D9488" onClick={() => setModal('meetings')} />
          <StatCard icon={Gem} label="Avg Attendance" value={stats.avgAttendance || 0} color="#2DD4BF" onClick={() => setModal('meetings')} />
          <StatCard icon={Activity} label="My Contributions" value={fmt(my.totalContributions)} color="#F5A623" onClick={() => setModal('mystats')} />
        </>) : isOfficial ? (<>
          <StatCard icon={Trophy} label="Seniority" value={`${my.seniorityDays || 0} days`} color="#64748B" onClick={() => setModal('mystats')} />
          <StatCard icon={Star} label="Trust Score" value={`${my.trustScore || 0}%`} color="#3B82F6" onClick={() => setModal('trust')} />
          <StatCard icon={Gem} label="Contributions" value={fmt(my.totalContributions)} color="#F5A623" trend={+15} onClick={() => setModal('mystats')} />
          <StatCard icon={Activity} label="Pool Balance" value={fmt(d.poolBalance)} color="#10B981" onClick={() => setModal('treasury')} />
        </>) : (<>
          <StatCard icon={Wallet} label="Treasury" value={fmt(d.poolBalance)} color="#3B82F6" onClick={() => setModal('treasury')} />
          <StatCard icon={Gem} label="Goal" value={`${goalPct}%`} color="#F5A623" sub={fmt(config.savingsGoal || d.savingsGoal)} trend={goalPct > 50 ? +12 : null} onClick={() => setModal('goal')} />
          <StatCard icon={CheckCircle2} label="Payers" value={`${d.totalPaid || 0} / ${d.totalMembers || 0}`} color="#10B981" onClick={() => setModal('collection')} />
          <StatCard icon={Layers} label="Unpaid" value={d.totalUnpaid || 0} color="#F43F5E" onClick={() => setModal('collection')} />
        </>)}
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3"><FlowChart data={d.monthlyChart || []} title="Fiscal Trajectory" subtitle="Annual Growth Analysis" inflowColor={accentColor} gradientId={`${role}Flow`} showOutflow={!isOrganizer} /></div>
        <div className="lg:col-span-2"><ActivityFeed transactions={d.recentTransactions || []} title="Recent Activity" accentColor={accentColor} onSelect={(tx) => setSelectedTx(tx)} /></div>
      </div>

      {/* Goal Progress */}
      {!isOrganizer && (
        <div onClick={() => setModal('goal')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm space-y-4 cursor-pointer hover:shadow-md transition-all">
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

      <TreasuryToll toll={d.treasuryToll} accentColor={accentColor} />

      {/* ═══ MODALS ═══ */}
      {modal === 'mystats' && (
        <DetailModal title="My Financial Profile" subtitle="Personal Summary" onClose={() => setModal(null)} accentColor={accentColor}>
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={fmt(my.totalContributions)} label="Contributions" color={accentColor} />
              <DetailGridItem value={`${my.trustScore || 0}%`} label="Trust Score" color="#3B82F6" />
              <DetailGridItem value={`${my.seniorityDays || 0}d`} label="Seniority" color="#10B981" />
              <DetailGridItem value={my.paidThisMonth ? 'Paid' : 'Due'} label="This Month" color={my.paidThisMonth ? '#10B981' : '#F43F5E'} />
            </DetailGrid>
            <DetailRow icon={HandCoins} label="Active Loan" value={my.activeLoan > 0 ? fmt(my.activeLoan) : 'No active loan'} color="#8B5CF6" sub={my.activeLoanStatus || ''} />
            <DetailRow icon={PiggyBank} label="Pending Loan" value={my.pendingLoan > 0 ? fmt(my.pendingLoan) : 'None'} color="#F59E0B" />
            <DetailRow icon={Activity} label="Join Date" value={dayjs(my.joinDate).format('DD MMM YYYY')} color="#F5A623" />
          </div>
        </DetailModal>
      )}
      {modal === 'loan' && (
        <DetailModal title="Loan Status" subtitle="My Active Loan" onClose={() => setModal(null)} accentColor="#8B5CF6">
          <div className="space-y-4">
            <DetailBigNumber value={my.activeLoan > 0 ? fmt(my.activeLoan) : 'No Loan'} label={my.activeLoanStatus ? `Status: ${my.activeLoanStatus}` : 'No active loan'} color={my.activeLoan > 0 ? '#F43F5E' : '#10B981'} />
            <DetailRow icon={HandCoins} label="Max Loan Available" value={fmt(stats.maxLoanAmount)} color="#3B82F6" />
            <DetailRow icon={BarChart3} label="Interest Rate" value={`${stats.loanInterestRate || 0}%`} color="#F5A623" />
            {my.pendingLoan > 0 && <DetailRow icon={Clock} label="Pending Application" value={fmt(my.pendingLoan)} color="#F59E0B" sub="Under review" />}
          </div>
        </DetailModal>
      )}
      {modal === 'status' && (
        <DetailModal title="Payment Status" subtitle="This Month's Contribution" onClose={() => setModal(null)} accentColor={my.paidThisMonth ? '#10B981' : '#F43F5E'}>
          <div className="space-y-4">
            <DetailBigNumber value={my.paidThisMonth ? '✓ Paid' : '✗ Unpaid'} label="This Month" color={my.paidThisMonth ? '#10B981' : '#F43F5E'} />
            <DetailRow icon={Wallet} label="Weekly Dues" value={fmt(stats.weeklyContributionAmount)} color="#F5A623" sub="Required per week" />
            <DetailRow icon={Gem} label="My Total Contributions" value={fmt(my.totalContributions)} color={accentColor} />
          </div>
        </DetailModal>
      )}
      {modal === 'treasury' && (
        <DetailModal title="Community Treasury" subtitle="Pool Balance Overview" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-4">
            <DetailBigNumber value={fmt(d.poolBalance)} label="Net Pool Balance" color="#3B82F6" />
            <DetailGrid>
              <DetailGridItem value={fmt(toll.totalInflow)} label="Total Inflow" color="#10B981" />
              <DetailGridItem value={fmt(toll.totalOutflow)} label="Total Outflow" color="#F43F5E" />
            </DetailGrid>
            <DetailRow icon={Users} label="Collection Rate" value={`${toll.collectionRate || 0}%`} color="#10B981" />
            <DetailRow icon={ArrowUpRight} label="Monthly Inflow" value={fmt(toll.monthlyInflow)} color="#3B82F6" />
          </div>
        </DetailModal>
      )}
      {modal === 'goal' && (
        <DetailModal title="Goal Progress" subtitle="Community Savings Target" onClose={() => setModal(null)} accentColor="#F5A623">
          <div className="space-y-5">
            <DetailGrid>
              <DetailGridItem value={fmt(d.poolBalance)} label="Collected" color="#10B981" />
              <DetailGridItem value={fmt(config.savingsGoal || d.savingsGoal)} label="Target" color="#F5A623" />
            </DetailGrid>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${goalPct}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }} />
              </div>
              <p className="text-center text-2xl font-black" style={{ color: accentColor }}>{goalPct}%</p>
            </div>
            <DetailRow icon={Target} label="Monthly Inflow" value={fmt(toll.monthlyInflow)} color="#10B981" />
          </div>
        </DetailModal>
      )}
      {modal === 'collection' && (
        <DetailModal title="Collection Status" subtitle="Who Has Paid" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailBigNumber value={`${toll.collectionRate || 0}%`} label="Collection Rate" color={toll.collectionRate >= 70 ? '#10B981' : '#F43F5E'} />
            <DetailGrid>
              <DetailGridItem value={d.totalPaid || 0} label="Paid" color="#10B981" />
              <DetailGridItem value={d.totalUnpaid || 0} label="Unpaid" color="#F43F5E" />
            </DetailGrid>
          </div>
        </DetailModal>
      )}
      {modal === 'trust' && (
        <DetailModal title="Trust Score" subtitle="Reliability Metric" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-5">
            <DetailBigNumber value={`${my.trustScore || 0}%`} label="Your Trust Score" color="#3B82F6" />
            <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${my.trustScore || 0}%`, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)' }} />
            </div>
            <p className="text-xs text-black/50 dark:text-white/50 leading-relaxed p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20">
              Trust Score is calculated based on your <strong>seniority</strong> ({my.seniorityDays || 0} days), <strong>contribution history</strong>, and <strong>community engagement</strong>. A higher score improves your loan eligibility and standing.
            </p>
          </div>
        </DetailModal>
      )}
      {modal === 'meetings' && (
        <DetailModal title="Meetings & Majlis" subtitle="Gathering Overview" onClose={() => setModal(null)} accentColor="#14B8A6">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={stats.upcomingMeetings || 0} label="Upcoming" color="#14B8A6" />
              <DetailGridItem value={stats.totalMeetings || 0} label="Total Held" color="#0D9488" />
            </DetailGrid>
            <DetailRow icon={Users} label="Avg Attendance" value={stats.avgAttendance || 0} color="#2DD4BF" sub="Members per meeting" />
          </div>
        </DetailModal>
      )}
      {selectedTx && (
        <DetailModal title="Transaction Detail" subtitle={selectedTx.type === 'contribution' ? 'Inward Transfer' : 'Outward Transfer'} onClose={() => setSelectedTx(null)} accentColor={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'}>
          <div className="space-y-5">
            <DetailBigNumber value={fmt(selectedTx.amount)} label={selectedTx.type?.replace('_', ' ')} color={selectedTx.type === 'contribution' ? '#10B981' : '#F43F5E'} />
            <DetailRow icon={Users} label="Member" value={selectedTx.member} color={accentColor} />
            <DetailRow icon={Clock} label="Date" value={dayjs(selectedTx.date).format('DD MMM YYYY • HH:mm')} color="#F5A623" />
          </div>
        </DetailModal>
      )}
    </div>
  );
}
