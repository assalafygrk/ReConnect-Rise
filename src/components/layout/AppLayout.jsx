import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

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

    const path = '/' + location.pathname.split('/')[1];
    const pageTitle = pageTitles[path] || 'Reconnect & Rise';

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#FFF8F0' }}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((p) => !p)}
            />

            {/* Main area */}
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300
                    ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
            >
                <Navbar
                    onMenuToggle={() => setSidebarCollapsed((p) => !p)}
                    pageTitle={pageTitle}
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
