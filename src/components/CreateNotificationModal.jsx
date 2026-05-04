import { useState } from 'react';
import { X, Send, Users, Shield, Zap, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function CreateNotificationModal({ isOpen, onClose }) {
    const { sendNotification } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        targetType: 'role', // 'role', 'user', 'global'
        role: 'member',
        recipientEmail: '',
        link: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                link: formData.link,
            };

            if (formData.targetType === 'global') {
                payload.isGlobal = true;
            } else if (formData.targetType === 'role') {
                payload.role = formData.role;
            } else if (formData.targetType === 'user') {
                // We'll need to find the user ID by email or handle it differently
                // For now, let's assume we might need a user selection or just email for lookup on backend
                // But our backend expects recipient ID. Let's simplify to role/global for now
                // or add email support to backend if needed.
                setError('Individual user notification by email not yet implemented in backend. Use Role or Global.');
                setLoading(false);
                return;
            }

            await sendNotification(payload);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-[#0B1221] rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden">
                <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h2 className="text-xl font-black text-[#1A1A2E] dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Broadcast Notification
                        </h2>
                        <p className="text-xs text-black/40 dark:text-white/40 mt-1 font-medium">Send a secure update to the brotherhood</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors">
                        <X size={20} className="text-[#1A1A2E] dark:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 ml-1">Target Type</label>
                            <select
                                value={formData.targetType}
                                onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border-none text-sm font-bold focus:ring-2 ring-[#E8820C] transition-all"
                            >
                                <option value="role">Specific Role</option>
                                <option value="global">Everybody (Global)</option>
                                <option value="user">Specific User (Email)</option>
                            </select>
                        </div>

                        {formData.targetType === 'role' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 ml-1">Select Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border-none text-sm font-bold focus:ring-2 ring-[#E8820C] transition-all"
                                >
                                    <option value="member">Member</option>
                                    <option value="group_leader">Group Leader</option>
                                    <option value="treasurer">Treasurer</option>
                                    <option value="welfare_officer">Welfare Officer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 ml-1">Notification Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Emergency Meeting Update"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border-none text-sm font-bold placeholder:text-black/20 dark:placeholder:text-white/20 focus:ring-2 ring-[#E8820C] transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 ml-1">Message Content</label>
                        <textarea
                            required
                            rows="3"
                            placeholder="Type your message here..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-4 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl border-none text-sm font-medium placeholder:text-black/20 dark:placeholder:text-white/20 focus:ring-2 ring-[#E8820C] transition-all resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 ml-1">Urgency Level</label>
                            <div className="flex gap-2">
                                {['info', 'warning', 'urgent'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: t })}
                                        className={`flex-1 py-2 rounded-xl flex items-center justify-center transition-all ${formData.type === t ? 'bg-[#E8820C] text-white shadow-lg shadow-[#E8820C]/20 scale-105' : 'bg-gray-50 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/10'}`}
                                    >
                                        {t === 'info' && <Info size={16} />}
                                        {t === 'warning' && <AlertTriangle size={16} />}
                                        {t === 'urgent' && <Zap size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 ml-1">Action Link (Optional)</label>
                            <input
                                type="text"
                                placeholder="/meetings, /loans..."
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-2xl border-none text-sm font-bold placeholder:text-black/20 dark:placeholder:text-white/20 focus:ring-2 ring-[#E8820C] transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#1A1A2E] to-[#2A2A4E] dark:from-[#3B82F6] dark:to-[#1D4ED8] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? 'Sending Security Broadcast...' : (
                                <>
                                    Dispatch Notification
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
