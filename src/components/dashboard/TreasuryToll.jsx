import { useState } from 'react';
import {
  Landmark, ArrowUpRight, ArrowDownLeft, Eye, EyeOff,
  TrendingUp, Users, ShieldCheck, Wallet, PiggyBank,
  Scale, HandCoins, ChevronDown, ChevronUp, Activity
} from 'lucide-react';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function TreasuryToll({ toll, accentColor = '#E8820C' }) {
  const [expanded, setExpanded] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  if (!toll) return null;

  const items = [
    { icon: ArrowUpRight, label: 'Total Inflow', value: fmt(toll.totalInflow), color: '#10B981' },
    { icon: ArrowDownLeft, label: 'Total Outflow', value: fmt(toll.totalOutflow), color: '#F43F5E' },
    { icon: HandCoins, label: 'Loan Repayments', value: fmt(toll.totalRepaymentsIn), color: '#3B82F6' },
    { icon: PiggyBank, label: 'Active Loans', value: `${toll.activeLoansCount} (${fmt(toll.activeLoansAmount)})`, color: '#F59E0B' },
    { icon: Scale, label: 'Welfare Grants', value: fmt(toll.welfareGrantsTotal), color: '#EC4899' },
    { icon: Wallet, label: 'Pending Disbursements', value: `${toll.pendingDisbursementCount} (${fmt(toll.pendingDisbursementAmount)})`, color: '#8B5CF6' },
  ];

  return (
    <div className="relative rounded-[1.5rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      {/* Header with glassmorphism */}
      <div className="relative p-6 sm:p-8" style={{ background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}03)` }}>
        <div className="absolute inset-0 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <Landmark size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#1A1A2E] dark:text-white/90">Treasury Toll</h3>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 flex items-center gap-1.5">
                  <Activity size={8} className="animate-pulse" style={{ color: accentColor }} /> Transparency Ledger • Live
                </p>
              </div>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black/40 dark:text-white/40">
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          {/* Main Balance */}
          <div className="text-center py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">Community Pool Balance</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#1A1A2E] dark:text-white/90 transition-all">
              {showBalance ? fmt(toll.totalPoolBalance) : '₦••••••'}
            </h2>
          </div>

          {/* Goal Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">
              <span>Goal Progress</span>
              <span style={{ color: accentColor }}>{toll.goalProgress}%</span>
            </div>
            <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${toll.goalProgress}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)` }} />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-black/30 dark:text-white/30">
              <span>{fmt(toll.totalPoolBalance)}</span>
              <span>Target: {fmt(toll.savingsGoal)}</span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="text-center p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-500/10">
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{toll.collectionRate}%</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">Collection</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-500/10">
              <p className="text-lg font-black text-blue-700 dark:text-blue-400">{toll.paidThisMonth}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-blue-600/60 dark:text-blue-400/60">Paid</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-500/10">
              <p className="text-lg font-black text-rose-700 dark:text-rose-400">{toll.unpaidThisMonth}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-rose-600/60 dark:text-rose-400/60">Unpaid</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Detail Section */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-2 py-3 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors border-t border-black/5 dark:border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
        <ShieldCheck size={10} /> Full Transparency Breakdown {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="p-5 sm:p-6 space-y-3 bg-white dark:bg-[#111827] animate-in slide-in-from-top-2 duration-300">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}12`, color: item.color }}>
                <item.icon size={14} strokeWidth={2.5} />
              </div>
              <p className="text-xs font-bold text-black/60 dark:text-white/60 flex-1">{item.label}</p>
              <p className="text-xs font-black text-[#1A1A2E] dark:text-white/90">{showBalance ? item.value : '•••'}</p>
            </div>
          ))}
          <p className="text-[8px] text-center font-bold text-black/25 dark:text-white/25 uppercase tracking-widest pt-2">
            Last synced: {new Date(toll.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
