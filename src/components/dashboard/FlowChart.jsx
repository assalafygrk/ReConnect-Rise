import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export default function FlowChart({ data, title, subtitle, inflowColor = '#10B981', outflowColor = '#F43F5E', gradientId = 'flowG', showOutflow = true }) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90 tracking-wide">{title}</h2>
          <p className="text-[10px] uppercase font-black text-black/40 dark:text-white/40 tracking-[0.3em]">{subtitle}</p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ backgroundColor: `${inflowColor}12`, color: inflowColor }}>
          <Activity size={10} className="animate-pulse" /> Live
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`${gradientId}In`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={inflowColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={inflowColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`${gradientId}Out`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={outflowColor} stopOpacity={0.1} />
                <stop offset="95%" stopColor={outflowColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: 'inherit' }} itemStyle={{ fontWeight: 600 }} />
            <Area type="monotone" dataKey="contributions" stroke={inflowColor} fill={`url(#${gradientId}In)`} strokeWidth={3} name="Inflow" />
            {showOutflow && <Area type="monotone" dataKey="disbursements" stroke={outflowColor} fill={`url(#${gradientId}Out)`} strokeWidth={3} name="Outflow" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
