import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationPopover from './NotificationPopover';

export default function Navbar({ onMenuToggle, pageTitle }) {
    const { user, userProfile } = useAuth();
    const { unreadCount } = useNotifications();
    const { theme, toggleTheme } = useTheme();
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.slice(0, 2).toUpperCase() || 'RR';

    return (
        <header
            className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-16 transition-all duration-300
                       bg-[rgba(255,248,240,0.85)] dark:bg-[#0B1221]/80 
                       backdrop-blur-xl border-b border-[#1A1A2E]/5 dark:border-white/5"
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[#1A1A2E] dark:text-white"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} />
                </button>
                <h1
                    className="text-lg font-semibold text-[#1A1A2E] dark:text-white transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    {pageTitle}
                </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 relative">
                
                {/* Theme Toggle */}
                {/* <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[#1A1A2E] dark:text-white"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`relative p-2 rounded-lg transition-colors ${isNotifOpen ? 'bg-black/5 dark:bg-white/5 text-[#E8820C] dark:text-[#3B82F6]' : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A2E] dark:text-white'}`}
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FFF8F0] dark:border-[#0B1221]"></span>
                    )}
                </button> */}

                <NotificationPopover
                    isOpen={isNotifOpen}
                    onClose={() => setIsNotifOpen(false)}
                />

                <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1"></div>

                {/* Avatar */}
                <Link to="/profile" className="flex items-center gap-2 group hover:opacity-80 transition-all">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md group-hover:scale-110 transition-transform overflow-hidden bg-gradient-to-br from-[#E8820C] to-[#F5A623] dark:from-[#3B82F6] dark:to-[#1D4ED8]"
                    >
                        {userProfile?.facialUpload ? (
                            <img src={userProfile.facialUpload} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium leading-tight group-hover:text-[#E8820C] dark:group-hover:text-[#3B82F6] transition-colors text-[#1A1A2E] dark:text-white">
                            {user?.name || user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs capitalize text-[#1A1A2E]/50 dark:text-white/40">
                            {user?.role?.replace(/[-_]/g, ' ')}
                        </p>
                    </div>
                </Link>
            </div>
        </header>
    );
}
