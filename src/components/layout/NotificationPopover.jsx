import { Bell, X, Check, Info, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationPopover({ isOpen, onClose }) {
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-0 mt-4 w-80 md:w-96 bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
            {/* Header */}
            <div className="p-6 border-b border-black/5 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell size={20} className="text-[#1A1A2E]" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E8820C] text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <h3 className="font-black text-[#1A1A2E] text-sm tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Notifications
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={clearAll} className="text-[9px] font-black uppercase tracking-widest text-black/20 hover:text-[#E8820C] transition-colors">Clear All</button>
                    <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-xl transition-colors"><X size={16} /></button>
                </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto py-2">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`px-6 py-5 flex items-start gap-4 transition-all hover:bg-gray-50 cursor-pointer border-b border-black/5 last:border-0 relative ${!n.read ? 'bg-[#E8820C]/5' : ''}`}
                        >
                            {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#E8820C]"></div>}

                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'warning' ? 'bg-orange-50 text-orange-600' :
                                    n.type === 'urgent' ? 'bg-red-50 text-red-600' :
                                        'bg-blue-50 text-blue-600'
                                }`}>
                                {n.type === 'warning' ? <AlertTriangle size={18} /> :
                                    n.type === 'urgent' ? <Zap size={18} /> :
                                        <Info size={18} />}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="font-black text-xs text-[#1A1A2E] tracking-tight truncate">{n.title}</p>
                                    <span className="text-[9px] text-black/20 font-bold whitespace-nowrap">{dayjs(n.date).fromNow()}</span>
                                </div>
                                <p className="text-[11px] text-black/50 leading-relaxed line-clamp-2">{n.message}</p>

                                {n.link && (
                                    <Link
                                        to={n.link}
                                        onClick={onClose}
                                        className="inline-flex items-center gap-1.5 mt-3 text-[9px] font-black uppercase tracking-widest text-[#E8820C] hover:underline"
                                    >
                                        Take Action <ExternalLink size={10} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-8 opacity-20">
                        <Bell size={40} className="mb-4" />
                        <p className="text-sm font-black uppercase tracking-[0.2em]">Silence is Peace</p>
                        <p className="text-[10px] font-medium mt-1">You're all caught up with the brotherhood.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50/50 border-t border-black/5 text-center">
                <button className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1A1A2E]/30 hover:text-[#E8820C] transition-colors">
                    See All Activity History
                </button>
            </div>
        </div>
    );
}
