import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiGetNotifications, apiMarkAsRead, apiReadAll, apiSendNotification } from '../api/notifications';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const data = await apiGetNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Polling every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
        }
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await apiMarkAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Mark read error:', error);
        }
    };

    const clearAll = async () => {
        try {
            await apiReadAll();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Clear all error:', error);
        }
    };

    const sendNotification = async (notifData) => {
        try {
            const newNotif = await apiSendNotification(notifData);
            // If the user sent it to their own role or specifically to themselves, or globally,
            // we might want to refresh. But usually, the sender doesn't need to see their own notif immediately
            // unless they are also a recipient.
            fetchNotifications();
            return newNotif;
        } catch (error) {
            console.error('Send notification error:', error);
            throw error;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            markAsRead, 
            clearAll, 
            sendNotification, 
            refresh: fetchNotifications,
            loading 
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);

