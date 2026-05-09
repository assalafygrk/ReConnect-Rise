import { X } from 'lucide-react';

export default function DetailModal({ title, subtitle, onClose, accentColor = '#3B82F6', children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10">
        {/* Accent bar */}
        <div className="h-1 w-full rounded-t-[2rem]" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66)` }} />
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E] dark:text-white/90">{title}</h3>
              {subtitle && <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>
          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}

export function DetailRow({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-black/[0.03] dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
      {Icon && (
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color || '#3B82F6'}12`, color: color || '#3B82F6' }}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-black/60 dark:text-white/60">{label}</p>
        {sub && <p className="text-[8px] text-black/30 dark:text-white/30 mt-0.5">{sub}</p>}
      </div>
      <p className="text-sm font-black text-[#1A1A2E] dark:text-white/90 shrink-0">{value}</p>
    </div>
  );
}

export function DetailBigNumber({ value, label, color }) {
  return (
    <div className="p-6 sm:p-8 rounded-2xl text-center border border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] shadow-inner">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40 mb-2">{label}</p>
      <h4 className="text-3xl sm:text-4xl font-serif font-black tracking-tight" style={{ color: color || '#1A1A2E' }}>{value}</h4>
    </div>
  );
}

export function DetailGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

export function DetailGridItem({ value, label, color }) {
  return (
    <div className="p-4 rounded-xl border border-black/[0.03] dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-center">
      <p className="text-xl font-black" style={{ color: color || '#1A1A2E' }}>{value}</p>
      <p className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 mt-1">{label}</p>
    </div>
  );
}
