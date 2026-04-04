import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user, activeRole } = useAuth();
    const [notifications, setNotifications] = useState([]);

    // Mock initial notifications based on role
    useEffect(() => {
        if (!user) return;

        const role = activeRole || user.role;
        const baseNotifications = [
            { id: 1, title: 'Welcome to the Portal', message: 'Assalamu Alaikum! Explore your new brotherhood home.', type: 'info', date: new Date().toISOString(), read: false },
        ];

        if (role === 'treasurer' || role === 'admin') {
            baseNotifications.push({
                id: 2,
                title: 'New Loan Request',
                message: 'Brother Ola has requested a loan of ₦10,000.',
                type: 'warning',
                date: new Date().toISOString(),
                read: false,
                link: '/requests'
            });
        }

        if (role === 'group_leader' || role === 'admin') {
            baseNotifications.push({
                id: 3,
                title: 'Meeting Scheduled',
                message: 'A new emergency meeting is set for Friday.',
                type: 'urgent',
                date: new Date().toISOString(),
                read: false,
                link: '/meetings'
            });
        }

        setNotifications(baseNotifications);
    }, [user, activeRole]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
