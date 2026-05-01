import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { PageConfigProvider } from '../../context/PageConfigContext';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/contributions': 'Contributions',
    '/members': 'Members',
    '/disbursements': 'Disbursements',
    '/loans': 'Loans',
    '/requests': 'Support Requests',
    '/votes': 'Votes',
    '/meetings': 'Meetings',
    '/settings': 'Settings',
    '/documentary': 'Documentary',
    '/advice': 'Advice Room',
};

export default function AppLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
    const location = useLocation();

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
        }
    }, [location.pathname]);

    const path = '/' + location.pathname.split('/')[1];
    const pageTitle = pageTitles[path] || 'Reconnect & Rise';

    return (
        <PageConfigProvider>
            <div className="flex h-screen overflow-hidden bg-[#FFF8F0] dark:bg-[#0B1221] transition-colors duration-500 relative">
                
                {/* Dark Mode Ambient Blurs (only visible in dark mode) */}
                <div className="hidden dark:block absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.03] pointer-events-none"></div>
                <div className="hidden dark:block absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F5A623] rounded-full blur-[150px] opacity-[0.03] pointer-events-none"></div>

                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed((p) => !p)}
                />

                {/* Main area */}
                <div
                    className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10
                    ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
                >
                    <Navbar
                        onMenuToggle={() => setSidebarCollapsed((p) => !p)}
                        pageTitle={pageTitle}
                    />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 text-[#1A1A2E] dark:text-white">
                        <Outlet />
                    </main>
                </div>
            </div>
        </PageConfigProvider>
    );
}
