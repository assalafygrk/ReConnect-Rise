import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, sub, color, onClick, trend }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-4 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-xl transition-colors duration-300" style={{ backgroundColor: `${color}10`, color }}>
          <Icon size={20} className="stroke-[2.5]" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'}`}>
            {trend > 0 ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] sm:text-xs font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">{label}</p>
        <h4 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A2E] dark:text-white/90 tracking-tight">{value}</h4>
        {sub && <p className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest pt-3 border-t border-black/5 dark:border-white/5 mt-3">{sub}</p>}
      </div>
    </div>
  );
}
