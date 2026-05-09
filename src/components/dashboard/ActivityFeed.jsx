import dayjs from 'dayjs';
import { ArrowUpCircle, ArrowDownLeft, Clock } from 'lucide-react';

function fmt(n) { return `₦${Number(n || 0).toLocaleString('en-NG')}`; }

export default function ActivityFeed({ transactions = [], title = 'Live Activity', accentColor = '#3B82F6', onSelect, limit = 6 }) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col">
      <div className="space-y-1 pb-4 border-b border-black/5 dark:border-white/5 mb-4">
        <h2 className="text-lg sm:text-xl font-serif font-black text-[#1A1A2E] dark:text-white/90 flex items-center gap-3">
          <Clock size={16} style={{ color: accentColor }} /> {title}
        </h2>
        <p className="text-[9px] uppercase font-black text-black/40 dark:text-white/40 tracking-[0.3em]">Recent Monetary Events</p>
      </div>
      <div className="space-y-2.5 flex-1">
        {transactions.slice(0, limit).map(tx => (
          <div key={tx.id} onClick={() => onSelect?.(tx)}
            className="group flex items-center gap-3 p-3 rounded-xl border border-black/[0.03] dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all cursor-pointer">
            {tx.avatar ? (
              <img src={tx.avatar} alt="" className="w-9 h-9 rounded-lg object-cover border border-black/5 dark:border-white/10 shrink-0" />
            ) : (
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'contribution' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'}`}>
                {tx.type === 'contribution' ? <ArrowUpCircle size={15} /> : <ArrowDownLeft size={15} />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1A1A2E] dark:text-white/90 truncate">{tx.member}</p>
              <p className="text-[8px] text-black/40 dark:text-white/40 uppercase tracking-widest mt-0.5">{tx.note}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-black ${tx.type === 'contribution' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {tx.type === 'contribution' ? '+' : '-'}{fmt(tx.amount)}
              </p>
              <p className="text-[8px] font-bold text-black/25 dark:text-white/25 font-mono mt-0.5">{dayjs(tx.date).format('DD MMM HH:mm')}</p>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-8 text-black/20 dark:text-white/20">
            <p className="text-xs font-bold">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
