import { Menu, Bell } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPopover from './NotificationPopover';

export default function Navbar({ onMenuToggle, pageTitle }) {
    const { user } = useAuth();
    const { unreadCount } = useNotifications();
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.slice(0, 2).toUpperCase() || 'RR';

    return (
        <header
            className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-16"
            style={{
                background: 'rgba(255,248,240,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(26,26,46,0.08)',
            }}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="p-2 rounded-lg hover:bg-black/5 transition-colors text-navy"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} style={{ color: '#1A1A2E' }} />
                </button>
                <h1
                    className="text-lg font-semibold"
                    style={{ fontFamily: "'Playfair Display', serif", color: '#1A1A2E' }}
                >
                    {pageTitle}
                </h1>
            </div>

            <div className="flex items-center gap-3 relative">
                <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2 rounded-lg transition-colors ${isNotifOpen ? 'bg-black/5 text-[#E8820C]' : 'hover:bg-black/5 text-[#1A1A2E]'}`}
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FFF8F0]"></span>
                    )}
                </button>

                <NotificationPopover
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                />

                {/* Avatar */}
                <Link to="/profile" className="flex items-center gap-2 group hover:opacity-80 transition-all">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md group-hover:scale-110 transition-transform overflow-hidden bg-gradient-to-br from-[#E8820C] to-[#F5A623]"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium leading-tight group-hover:text-[#E8820C] transition-colors" style={{ color: '#1A1A2E' }}>
                            {user?.name || user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs capitalize" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                            {user?.role?.replace('_', ' ')}
                        </p>
                    </div>
                </Link>
            </div>
        </header>
    );
}
