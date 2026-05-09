import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, LogOut, ChevronRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountSwitcher({ isOpen, onClose }) {
  const { user, sessions, switchAccount, removeAccount, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[200] bg-black/20 dark:bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-20 right-4 sm:right-8 z-[201] w-80 bg-white dark:bg-[#1A2235] rounded-3xl shadow-2xl border border-navy/5 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-6 border-b border-navy/5 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-bold text-navy dark:text-white">Switch Account</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-navy/5 dark:hover:bg-white/5 transition-colors">
            <X size={18} className="text-navy/40 dark:text-white/40" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {sessions.map((session) => (
            <div 
              key={session.userId}
              className={`group flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                user?.id === session.userId 
                  ? 'bg-accent/5 border-accent/20 dark:bg-accent/10' 
                  : 'bg-transparent border-transparent hover:bg-navy/5 dark:hover:bg-white/5'
              }`}
            >
              <button 
                onClick={() => { switchAccount(session.userId); onClose(); }}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-white font-bold text-sm">
                  {session.name ? session.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-navy dark:text-white truncate">
                    {session.name || 'Unnamed User'}
                  </p>
                  <p className="text-[10px] text-navy/40 dark:text-white/40 truncate">
                    {session.email}
                  </p>
                </div>
                {user?.id === session.userId && (
                  <Check size={16} className="text-accent" />
                )}
              </button>
              
              {user?.id !== session.userId && (
                <button 
                  onClick={() => removeAccount(session.userId)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                  title="Remove account"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          <Link 
            to="/login?addAccount=true" 
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-navy/20 dark:border-white/20 hover:border-accent hover:text-accent transition-all text-navy/60 dark:text-white/60"
          >
            <div className="w-10 h-10 rounded-full bg-navy/5 dark:bg-white/5 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <span className="text-sm font-bold">Add Another Account</span>
            <ChevronRight size={16} className="ml-auto opacity-40" />
          </Link>
        </div>

        <div className="p-4 bg-navy/5 dark:bg-white/5">
          <button 
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-navy-light text-red-500 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <LogOut size={16} />
            Sign Out Current Account
          </button>
        </div>
      </div>
    </>
  );
}
