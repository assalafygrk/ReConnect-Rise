import { useState } from 'react';
import { CircleDollarSign, BarChart3, Wallet, BadgeCheck, Landmark, AlertCircle, Clock, FileCheck, HandCoins, ArrowUpRight, ArrowDownLeft, CheckCircle2, Users, Target, PiggyBank, Scale, Layers } from 'lucide-react';
import StatCard from './StatCard';
import FlowChart from './FlowChart';
import TreasuryToll from './TreasuryToll';
import ActivityFeed from './ActivityFeed';
import DetailModal, { DetailRow, DetailBigNumber, DetailGrid, DetailGridItem } from './DetailModal';
import dayjs from 'dayjs';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function TreasurerDash({ data: d, user, config }) {
  const [modal, setModal] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const stats = d.stats || {};
  const toll = d.treasuryToll || {};

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
            <div onClick={() => setModal('liquidity')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Liquidity</p>
              <p className="text-xl font-serif font-black">{((d.liquidityRatio || 0) * 100).toFixed(0)}%</p>
            </div>
            <div onClick={() => setModal('pending')} className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1 backdrop-blur-md cursor-pointer hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/50">Pending</p>
              <p className="text-xl font-serif font-black">{fmt(stats.pendingDisbursementAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CircleDollarSign} label="Liquid Pool" value={fmt(d.poolBalance)} color="#10B981" trend={+8} onClick={() => setModal('pool')} />
        <StatCard icon={BarChart3} label="Monthly Inflow" value={fmt(toll.monthlyInflow)} color="#F5A623" sub="This Month" onClick={() => setModal('inflow')} />
        <StatCard icon={AlertCircle} label="Pending Queue" value={stats.pendingDisbursementCount || 0} color="#F43F5E" sub={`${fmt(stats.pendingDisbursementAmount)} total`} onClick={() => setModal('pending')} />
        <StatCard icon={BadgeCheck} label="Collection Rate" value={`${stats.payoutRate || 0}%`} color="#34D399" sub={`${d.totalPaid || 0} of ${d.totalMembers || 0}`} onClick={() => setModal('collection')} />
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => setModal('withdrawals')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600"><Clock size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Pending Withdrawals</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{fmt(stats.pendingWithdrawalAmount)}</p>
        </div>
        <div onClick={() => setModal('loans')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-600"><HandCoins size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Pending Loans</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.pendingLoansCount || 0}</p>
        </div>
        <div onClick={() => setModal('activeloans')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600"><FileCheck size={16} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Active Loans</p>
          </div>
          <p className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{stats.activeLoans || 0} <span className="text-sm text-black/30 dark:text-white/30">({fmt(stats.totalLoansOut)})</span></p>
        </div>
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3"><FlowChart data={d.monthlyChart || []} title="Financial Trajectory" subtitle="Capital Inflow vs Expenditure" inflowColor="#10B981" gradientId="treasFlow" /></div>
        <div className="lg:col-span-2"><ActivityFeed transactions={d.recentTransactions || []} title="Fiscal Relay" accentColor="#10B981" onSelect={(tx) => setSelectedTx(tx)} /></div>
      </div>

      <TreasuryToll toll={d.treasuryToll} accentColor="#10B981" />

      {d.topContributors?.length > 0 && (
        <div onClick={() => setModal('contributors')} className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 shadow-sm cursor-pointer hover:shadow-md transition-all">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90 mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-[#10B981]" /> Highest Contributors</h3>
          <div className="space-y-2">
            {d.topContributors.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ backgroundColor: i === 0 ? '#D1FAE5' : '#F3F4F6', color: i === 0 ? '#059669' : '#6B7280' }}>#{i + 1}</div>
                <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 flex-1 truncate">{c.name}</p>
                <p className="text-xs font-black text-emerald-600">{fmt(c.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MODALS ═══ */}
      {modal === 'pool' && (
        <DetailModal title="Pool Liquidity" subtitle="Full Treasury Breakdown" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailBigNumber value={fmt(d.poolBalance)} label="Net Available Balance" color="#10B981" />
            <div className="space-y-2">
              <DetailRow icon={ArrowUpRight} label="Total Contributions" value={fmt(toll.totalInflow)} color="#10B981" />
              <DetailRow icon={HandCoins} label="Loan Repayments" value={fmt(toll.totalRepaymentsIn)} color="#3B82F6" />
              <DetailRow icon={ArrowDownLeft} label="Loans Disbursed" value={fmt(toll.totalLoansOutflow)} color="#F59E0B" />
              <DetailRow icon={Wallet} label="Other Disbursements" value={fmt(toll.totalDisbursementsOutflow)} color="#F43F5E" />
              <DetailRow icon={Scale} label="Welfare Grants" value={fmt(toll.welfareGrantsTotal)} color="#EC4899" />
            </div>
          </div>
        </DetailModal>
      )}
      {modal === 'inflow' && (
        <DetailModal title="Monthly Inflow" subtitle="This Month's Revenue" onClose={() => setModal(null)} accentColor="#F5A623">
          <div className="space-y-4">
            <DetailBigNumber value={fmt(toll.monthlyInflow)} label="Inflow This Month" color="#F5A623" />
            <DetailRow icon={Users} label="Payers This Month" value={`${d.totalPaid || 0} of ${d.totalMembers || 0}`} color="#10B981" />
            <DetailRow icon={Wallet} label="Weekly Dues" value={fmt(stats.weeklyContributionAmount)} color="#3B82F6" sub="Per member" />
          </div>
        </DetailModal>
      )}
      {modal === 'pending' && (
        <DetailModal title="Pending Queue" subtitle="Awaiting Treasurer Action" onClose={() => setModal(null)} accentColor="#F43F5E">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={stats.pendingDisbursementCount || 0} label="Disbursements" color="#F43F5E" />
              <DetailGridItem value={stats.pendingLoansCount || 0} label="Loan Requests" color="#8B5CF6" />
            </DetailGrid>
            <DetailRow icon={Wallet} label="Total Pending Amount" value={fmt(stats.pendingDisbursementAmount)} color="#F43F5E" />
            <DetailRow icon={Clock} label="Withdrawal Requests" value={fmt(stats.pendingWithdrawalAmount)} color="#F59E0B" />
          </div>
        </DetailModal>
      )}
      {modal === 'collection' && (
        <DetailModal title="Collection Analysis" subtitle="Payment Status Breakdown" onClose={() => setModal(null)} accentColor="#34D399">
          <div className="space-y-4">
            <DetailBigNumber value={`${stats.payoutRate || 0}%`} label="Collection Rate" color={stats.payoutRate >= 70 ? '#10B981' : '#F43F5E'} />
            <DetailGrid>
              <DetailGridItem value={d.totalPaid || 0} label="Paid" color="#10B981" />
              <DetailGridItem value={d.totalUnpaid || 0} label="Unpaid" color="#F43F5E" />
            </DetailGrid>
          </div>
        </DetailModal>
      )}
      {modal === 'liquidity' && (
        <DetailModal title="Liquidity Ratio" subtitle="Financial Health Indicator" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-4">
            <DetailBigNumber value={`${((d.liquidityRatio || 0) * 100).toFixed(1)}%`} label="Liquidity Ratio" color="#10B981" />
            <DetailRow icon={CircleDollarSign} label="Pool Balance" value={fmt(d.poolBalance)} color="#10B981" />
            <DetailRow icon={Target} label="Savings Goal" value={fmt(d.savingsGoal)} color="#F5A623" />
            <DetailRow icon={PiggyBank} label="Active Exposure" value={fmt(stats.totalLoansOut)} color="#F43F5E" sub="Outstanding loans" />
          </div>
        </DetailModal>
      )}
      {modal === 'withdrawals' && (
        <DetailModal title="Pending Withdrawals" subtitle="Member Withdrawal Requests" onClose={() => setModal(null)} accentColor="#F59E0B">
          <div className="space-y-4">
            <DetailBigNumber value={fmt(stats.pendingWithdrawalAmount)} label="Total Pending Withdrawals" color="#F59E0B" />
            <DetailRow icon={AlertCircle} label="Action Required" value="Manual Approval" color="#F43F5E" sub="All withdrawals require treasurer sign-off" />
          </div>
        </DetailModal>
      )}
      {modal === 'loans' && (
        <DetailModal title="Pending Loan Requests" subtitle="Awaiting Disbursal" onClose={() => setModal(null)} accentColor="#8B5CF6">
          <div className="space-y-4">
            <DetailBigNumber value={stats.pendingLoansCount || 0} label="Pending Requests" color="#8B5CF6" />
            <DetailRow icon={HandCoins} label="Max Loan Amount" value={fmt(stats.maxLoanAmount)} color="#3B82F6" />
            <DetailRow icon={BarChart3} label="Interest Rate" value={`${stats.loanInterestRate || 0}%`} color="#F5A623" />
          </div>
        </DetailModal>
      )}
      {modal === 'activeloans' && (
        <DetailModal title="Active Loans" subtitle="Outstanding Loan Portfolio" onClose={() => setModal(null)} accentColor="#3B82F6">
          <div className="space-y-4">
            <DetailGrid>
              <DetailGridItem value={stats.activeLoans || 0} label="Active Count" color="#3B82F6" />
              <DetailGridItem value={fmt(stats.totalLoansOut)} label="Total Outstanding" color="#F43F5E" />
            </DetailGrid>
            <DetailRow icon={HandCoins} label="Repayments Received" value={fmt(toll.totalRepaymentsIn)} color="#10B981" />
          </div>
        </DetailModal>
      )}
      {modal === 'contributors' && (
        <DetailModal title="Top Contributors" subtitle="Highest Contributing Members" onClose={() => setModal(null)} accentColor="#10B981">
          <div className="space-y-2">
            {(d.topContributors || []).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-black/[0.03] dark:border-white/5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ backgroundColor: i === 0 ? '#D1FAE5' : '#F3F4F6', color: i === 0 ? '#059669' : '#6B7280' }}>#{i + 1}</div>
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
            <DetailRow icon={Users} label="Member" value={selectedTx.member} color="#3B82F6" />
            <DetailRow icon={Clock} label="Date" value={dayjs(selectedTx.date).format('DD MMM YYYY • HH:mm')} color="#F5A623" />
          </div>
        </DetailModal>
      )}
    </div>
  );
}
