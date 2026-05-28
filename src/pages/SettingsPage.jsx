import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck, UserCog, Database, Bell, ChevronRight, Lock,
    Eye, EyeOff, LayoutDashboard, ListChecks, Users, Wallet, HandCoins,
    FileQuestion, Vote, CalendarDays, MessageSquare, UserCircle,
    Settings as SettingsIcon, Moon, Sun, Info, Save,
    Loader2, Zap, ShieldAlert, Cpu, Fingerprint, UserPlus,
    X, CheckCircle2, Smartphone, Key, QrCode, Mail,
    Search, Download, Trash2, Shield, ScanFace, Camera,
    ChevronDown, UserCheck, ShieldAlert as AlertIcon, Copy, AlertCircle
} from 'lucide-react';
import { SYSTEM_NAME } from '../constants/roles';
import { QRCodeCanvas } from 'qrcode.react';
import { fetchMembers } from '../api/members';
import {
    fetchSettings, updateSettings,
    changePassword, updateNotifications,
    updateAdminSecurity, updateUserRole, updateUserStatus,
    setup2FA, verify2FA, disable2FA
} from '../api/settings';
import {
    apiSetTransactionPin, apiGetProfile, apiChangeTransactionPin
} from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { getLogs, addLog, clearLogs, exportLogsCSV } from '../api/auditLog';
import AdminAuthGate from '../components/admin/AdminAuthGate';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
    const navigate = useNavigate();
    const {
        user: currentUser,
        userProfile,
        setUserProfile,
        hasRole,
        login: updateAuthToken,
        adminPanelUnlocked,
        unlockAdminPanel,
        adminSecurityMode,
        setAdminSecurityMode,
        ROLES,
        ROLE_CLASSES
    } = useAuth();
    const isAdmin = hasRole('admin') || hasRole('super_admin');
    const isTreasurer = hasRole('treasurer') || hasRole('admin') || hasRole('super_admin');
    const [showGate, setShowGate] = useState(false);

    useEffect(() => {
        if (isAdmin && !adminPanelUnlocked) {
            setShowGate(true);
        }
    }, [isAdmin, adminPanelUnlocked]);

    const [settings, setSettings] = useState({
        systemName: 'ReConnect & Rise',
        maintenanceMode: false,
        allowRegistration: true,
        monthlySavingsTarget: 250000,
        weeklyContributionAmount: 100,
        loanInterestRate: 0,
        groupAnnouncement: '',
        allowProfilePhotoChange: false,
    });
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    // Audit Ledger
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditTotal, setAuditTotal] = useState(0);
    const [auditPage, setAuditPage] = useState(1);
    const [auditPages, setAuditPages] = useState(1);
    const [showFullLedger, setShowFullLedger] = useState(false);
    const [ledgerSearch, setLedgerSearch] = useState('');
    const [ledgerCategory, setLedgerCategory] = useState('all');
    const [ledgerDateFrom, setLedgerDateFrom] = useState('');
    const [ledgerDateTo, setLedgerDateTo] = useState('');
    const [ledgerLoading, setLedgerLoading] = useState(false);

    const filteredLedger = auditLogs; // Server-side filtering now

    // Form states
    const [pwForm, setPwForm] = useState({ current: '', next: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pinForm, setPinForm] = useState({ old: '', new: '', confirm: '' });
    const [pinSaving, setPinSaving] = useState(false);

    // 2FA State
    const [twoFactorData, setTwoFactorData] = useState({ secret: '', otpauth: '', enabled: false });
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [otpSaving, setOtpSaving] = useState(false);

    const refreshLogs = useCallback(async (page = 1) => {
        setLedgerLoading(true);
        try {
            const data = await getLogs({
                page,
                limit: 15,
                category: ledgerCategory,
                search: ledgerSearch,
                from: ledgerDateFrom,
                to: ledgerDateTo
            });
            if (Array.isArray(data)) {
                setAuditLogs(data);
                setAuditTotal(data.length);
                setAuditPage(1);
                setAuditPages(1);
            } else {
                setAuditLogs(data.logs || []);
                setAuditTotal(data.total || 0);
                setAuditPage(data.page || 1);
                setAuditPages(data.pages || 1);
            }
        } catch (err) {
            console.error('Failed to sync logs:', err);
        } finally {
            setLedgerLoading(false);
        }
    }, [ledgerCategory, ledgerSearch, ledgerDateFrom, ledgerDateTo]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [s, m] = await Promise.all([
                    fetchSettings().catch(() => ({})),
                    fetchMembers().catch(() => [])
                ]);

                setSettings(prev => ({ ...prev, ...(s || {}) }));
                setMembers(m || []);
            } catch (err) {
                toast.error("Protocol synchronization failure");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        refreshLogs(1);
    }, [refreshLogs]);
    
    useEffect(() => {
        if (activeModal === '2fa') {
            setTimeout(() => {
                document.getElementById('otp-0')?.focus();
            }, 100);
        }
    }, [activeModal]);

    const handleSaveProtocols = async () => {
        setSaving(true);
        try {
            const updated = await updateSettings({
                ...settings,
                monthlySavingsTarget: Number(settings.monthlySavingsTarget),
                weeklyContributionAmount: Number(settings.weeklyContributionAmount),
                loanInterestRate: Number(settings.loanInterestRate)
            });
            setSettings(updated);
            addLog(currentUser?.role === 'super_admin' ? SYSTEM_NAME : (currentUser?.name || 'Admin'), 'Settings Updated', 'System-wide protocols updated', 'admin');
            refreshLogs();
            toast.success('Monetary Statutes Synchronized');
        } catch (err) {
            toast.error(err.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            await updateUserRole(id, newRole);
            setMembers(prev => prev.map(m => (m._id === id || m.id === id) ? { ...m, role: newRole } : m));
            addLog(currentUser?.role === 'super_admin' ? SYSTEM_NAME : (currentUser?.name || 'Admin'), 'Role Updated', `User ${id} role changed to ${newRole}`, 'admin');
            refreshLogs();
            toast.success('Member Access Level Updated');
        } catch (err) {
            toast.error(err.message || 'Role update failed');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateUserStatus(id, newStatus);
            setMembers(prev => prev.map(m => (m._id === id || m.id === id) ? { ...m, status: newStatus } : m));
            addLog(currentUser?.role === 'super_admin' ? SYSTEM_NAME : (currentUser?.name || 'Admin'), 'Status Updated', `User ${id} status changed to ${newStatus}`, 'admin');
            refreshLogs();
            toast.success(`Member Status Updated to ${newStatus}`);
        } catch (err) {
            toast.error(err.message || 'Status update failed');
        }
    };

    const findMemberByName = (name) => {
        if (!name) return null;
        return members.find(m => m.name && m.name.toLowerCase() === name.toLowerCase());
    };

    // 2FA Handlers
    const initiate2FA = async () => {
        try {
            const data = await setup2FA();
            setTwoFactorData({ ...data, enabled: false });
            setActiveModal('2fa');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        // Handle paste of full code
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split('');
            const newDigits = [...otpDigits];
            pastedCode.forEach((char, i) => {
                if (i < 6) newDigits[i] = char;
            });
            setOtpDigits(newDigits);
            
            // Auto-submit if full code
            if (newDigits.every(d => d !== '')) {
                confirm2FA(newDigits.join(''));
            }
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        // Auto-submit on last digit
        if (value && index === 5) {
            const finalCode = newDigits.join('');
            if (finalCode.length === 6) {
                confirm2FA(finalCode);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasteData) {
            const newDigits = pasteData.split('');
            const updated = ['','','','','',''];
            newDigits.forEach((d, i) => { updated[i] = d; });
            setOtpDigits(updated);
            if (updated.every(d => d !== '')) {
                confirm2FA(updated.join(''));
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const confirm2FA = async (forcedToken = null) => {
        const token = forcedToken || otpDigits.join('');
        if (token.length !== 6) return toast.error('Enter 6-digit code');
        setOtpSaving(true);
        try {
            const data = await verify2FA(token);
            if (data.token) updateAuthToken(data.token);
            toast.success('2FA Protocol Activated');
            setActiveModal(null);
            setOtpDigits(['', '', '', '', '', '']);
        } catch (err) {
            toast.error(err.message || 'Verification failed');
            setOtpDigits(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setOtpSaving(false);
        }
    };

    const handleDisable2FA = async () => {
        setOtpSaving(true);
        try {
            const data = await disable2FA();
            if (data.token) updateAuthToken(data.token);
            toast.success('2FA Protocol Revoked');
            setActiveModal(null);
        } catch (err) {
            toast.error(err.message || 'Revocation failed');
        } finally {
            setOtpSaving(false);
        }
    };

    const handlePwChange = async (e) => {
        e.preventDefault();
        setPwSaving(true);
        try {
            await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
            toast.success('Master Security Key Updated');
            setActiveModal(null);
            setPwForm({ current: '', next: '' });
        } catch (err) {
            toast.error(err.message || 'Password update failed');
        } finally {
            setPwSaving(false);
        }
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        if (pinForm.new !== pinForm.confirm) return toast.error('New PINs do not match');
        if (pinForm.new.length !== 4) return toast.error('PIN must be 4 digits');

        setPinSaving(true);
        try {
            if (userProfile?.hasTransactionPin) {
                await apiChangeTransactionPin(pinForm.old, pinForm.new);
            } else {
                await apiSetTransactionPin(pinForm.new);
            }
            toast.success('Transaction PIN Security Protocol Updated');

            // Refresh profile to update hasTransactionPin status
            const updatedProfile = await apiGetProfile();
            setUserProfile(updatedProfile);

            setActiveModal(null);
            setPinForm({ old: '', new: '', confirm: '' });
        } catch (err) {
            toast.error(err.message || 'PIN configuration failed');
        } finally {
            setPinSaving(false);
        }
    };

    if (showGate) {
        return (
            <AdminAuthGate
                onClose={() => navigate('/dashboard')}
                onSuccess={() => {
                    setShowGate(false);
                    toast.success('System Settings unlocked');
                }}
            />
        );
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
                <div className="w-12 h-12 border-4 border-[#E8820C]/10 border-t-[#E8820C] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1A1A2E] dark:text-white/90/40">Accessing Protocols...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-12 pt-12">

                <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0F172A] dark:from-[#0F172A] dark:to-[#070B14] rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8820C] dark:bg-[#F5A623] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
                    <div className="space-y-4 text-center lg:text-left">
                        <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight">System Control Panel</h1>
                        <p className="text-white/40 text-lg font-serif italic max-w-xl leading-relaxed">Universal configuration of brotherhood operational protocols and security parameters.</p>
                    </div>
                    <button
                        onClick={handleSaveProtocols}
                        disabled={saving}
                        className="w-full lg:w-auto flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] bg-[#E8820C] dark:bg-[#F5A623] text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#F5A623] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Synchronizing...' : 'Save All Protocols'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        {isAdmin && (
                            <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_1px_8px_rgba(0,0,0,0.02)] border border-black/[0.03] dark:border-white/10">
                                <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5 dark:border-white/10">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black font-serif text-[#1A1A2E] dark:text-white/90">Executive Council Registry</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">Institutional Access Management</p>
                                    </div>
                                    <Users size={24} className="text-black/10" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {members.filter(m => m.role !== ROLES.SUPER_ADMIN).map(member => (
                                        <button
                                            key={member._id || member.id}
                                            onClick={() => setSelectedMember(member)}
                                            className="aspect-square bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/10 p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-white dark:hover:bg-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all group"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 flex items-center justify-center text-lg font-black text-[#1A1A2E] dark:text-white/90 group-hover:bg-[#E8820C] group-hover:text-white transition-all shadow-sm">
                                                {(member.name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1A1A2E] dark:text-white/90 line-clamp-1">{member.name}</p>
                                                <p className="text-[9px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest mt-1">{(member.role || 'Member').replace(/[-_]/g, ' ')}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isTreasurer && (
                            <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_1px_8px_rgba(0,0,0,0.02)] border border-black/[0.03] dark:border-white/10">
                                <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5 dark:border-white/10">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black font-serif text-[#1A1A2E] dark:text-white/90">Monetary Statutes</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30">Financial Guardrails & Compliance</p>
                                    </div>
                                    <Database size={24} className="text-black/10" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 ml-4">Weekly Contribution Target</label>
                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/10 group focus-within:border-amber-500/50 transition-all">
                                            <span className="text-xl font-black font-serif text-black/20 dark:text-white/20">₦</span>
                                            <input
                                                type="number"
                                                value={settings.weeklyContributionAmount}
                                                onChange={e => setSettings({ ...settings, weeklyContributionAmount: Number(e.target.value) })}
                                                className="w-full bg-transparent text-2xl font-black font-serif outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 ml-4">Monthly Savings Target</label>
                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/10 group focus-within:border-amber-500/50 transition-all">
                                            <span className="text-xl font-black font-serif text-black/20 dark:text-white/20">₦</span>
                                            <input
                                                type="number"
                                                value={settings.monthlySavingsTarget}
                                                onChange={e => setSettings({ ...settings, monthlySavingsTarget: Number(e.target.value) })}
                                                className="w-full bg-transparent text-2xl font-black font-serif outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 ml-4">Loan Interest Rate (%)</label>
                                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/10 group focus-within:border-amber-500/50 transition-all">
                                            <input
                                                type="number"
                                                value={settings.loanInterestRate}
                                                onChange={e => setSettings({ ...settings, loanInterestRate: Number(e.target.value) })}
                                                className="w-full bg-transparent text-2xl font-black font-serif outline-none text-right"
                                            />
                                            <span className="text-xl font-black font-serif text-black/20 dark:text-white/20">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-gradient-to-b from-[#1A1A2E] to-[#0F172A] dark:from-[#0F172A] dark:to-[#070B14] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5 dark:border-white/10 space-y-8">
                            <div className="border-b border-white/10 pb-6">
                                <h3 className="text-2xl font-black font-serif">Security & Access</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Credential Protection Protocols</p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { id: 'password', label: 'Update Access Key', icon: Lock, action: () => setActiveModal('password') },
                                    {
                                        id: '2fa',
                                        label: currentUser?.twoFactorEnabled ? 'Revoke 2FA Protocol' : '2FA Configuration',
                                        icon: currentUser?.twoFactorEnabled ? ShieldAlert : ShieldCheck,
                                        action: currentUser?.twoFactorEnabled ? () => setActiveModal('disable-2fa') : initiate2FA
                                    },
                                    { id: 'pin', label: 'Transaction PIN', icon: Wallet, action: () => setActiveModal('pin') },
                                    { id: 'notifications', label: 'Notification Matrix', icon: Bell, action: () => setActiveModal('notifications') },
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={item.action}
                                        className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon size={18} className="text-[#E8820C] dark:text-[#F5A623] group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                            {currentUser?.role === 'super_admin' && (
                                <div className="pt-8 border-t border-white/10 space-y-6">
                                    <div className="space-y-1">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Admin Control Security Configuration</h4>
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Protocol for Administrative Portal Access</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'password', label: 'Password', sub: '(Master)', icon: Key, ready: true },
                                        { id: '2fa', label: '2FA Auth', sub: !currentUser?.twoFactorEnabled ? 'Set up first' : 'Ready', icon: Smartphone, ready: currentUser?.twoFactorEnabled },
                                        // { id: 'facial', label: 'Face ID', sub: !userProfile?.facialUpload ? 'Upload photo' : 'Ready', icon: ScanFace, ready: !!userProfile?.facialUpload },
                                    ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setAdminSecurityMode(mode.id)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-1 group relative
                                                ${adminSecurityMode === mode.id
                                                        ? 'bg-[#E8820C] border-[#E8820C] text-white shadow-[0_0_20px_rgba(232,130,12,0.4)]'
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                {!mode.ready && adminSecurityMode !== mode.id && (
                                                    <div className="absolute top-2 right-2 text-red-500/50">
                                                        <AlertCircle size={10} />
                                                    </div>
                                                )}
                                                <mode.icon size={18} className={adminSecurityMode === mode.id ? '' : 'group-hover:scale-110 transition-transform'} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{mode.label}</span>
                                                <span className={`text-[7px] uppercase tracking-widest opacity-40 font-bold`}>{mode.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="pt-8 border-t border-white/10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black uppercase tracking-widest">Bio-Image Updates</p>
                                            <p className="text-[10px] text-white/30 uppercase">Member permission</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, allowProfilePhotoChange: !settings.allowProfilePhotoChange })}
                                            className={`w-12 h-7 rounded-full p-1 transition-all ${settings.allowProfilePhotoChange ? 'bg-[#E8820C] dark:bg-[#F5A623]' : 'bg-white dark:bg-[#111827]/10'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full bg-white dark:bg-[#111827] shadow-xl transform transition-transform ${settings.allowProfilePhotoChange ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="bg-white dark:bg-[#111827] rounded-[2.5rem] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_1px_8px_rgba(0,0,0,0.02)] border border-black/[0.03] dark:border-white/10 space-y-6">
                                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-6">
                                    <h3 className="text-xl font-black font-serif text-[#1A1A2E] dark:text-white/90">Audit Ledger</h3>
                                    <Fingerprint size={20} className="text-black/10" />
                                </div>
                                <div className="space-y-4">
                                    {auditLogs.slice(0, 4).map(log => (
                                        <div key={log.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1">
                                            <p className="text-[10px] font-black text-[#E8820C] dark:text-[#F5A623] uppercase tracking-widest">{log.category}</p>
                                            <p className="text-xs font-black text-[#1A1A2E] dark:text-white/90 line-clamp-1">{log.action}</p>
                                            <p className="text-[9px] font-bold text-black/20 dark:text-white/20 italic">{log.timeDisplay}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setShowFullLedger(true)} className="w-full py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] dark:bg-[#0F172A] transition-all active:scale-95">Open Full Manifest</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modals */}
                {selectedMember && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-[#1A1A2E]/80 dark:bg-[#0F172A]/90 backdrop-blur-md" onClick={() => setSelectedMember(null)}></div>
                        <div className="relative bg-white dark:bg-[#0c101b] w-full max-w-lg rounded-[3rem] shadow-2xl border border-black/10 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-500">
                            <div className="bg-[#1A1A2E] dark:bg-[#0c101b] p-10 relative overflow-hidden border-b border-black/5 dark:border-white/5">
                                <button onClick={() => setSelectedMember(null)} className="absolute top-8 right-8 text-white/20 hover:text-white dark:text-white/40 dark:hover:text-white transition-all"><X size={24} /></button>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-[#151b2d] flex items-center justify-center text-2xl font-black text-[#1A1A2E] dark:text-white/90 shadow-inner">
                                        {(selectedMember.name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white dark:text-white font-serif">{selectedMember.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] dark:text-[#F5A623] mt-1">Council Member Records</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 space-y-8 bg-gray-50 dark:bg-[#070b12]">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 ml-4">Access Level (Role)</label>
                                    <select
                                        value={selectedMember.role || 'member'}
                                        onChange={(e) => handleRoleUpdate(selectedMember._id || selectedMember.id, e.target.value)}
                                        className="w-full bg-white dark:bg-[#151b2d] text-black dark:text-white border-2 border-black/5 dark:border-white/10 focus:border-[#E8820C]/30 rounded-[2rem] px-8 py-5 text-sm font-black outline-none shadow-sm appearance-none cursor-pointer"
                                    >
                                        {Object.entries(ROLES).filter(([key, value]) => value !== ROLES.SUPER_ADMIN).map(([key, value]) => (
                                            <option key={value} value={value} className="text-slate-900 bg-white">
                                                {ROLE_CLASSES[value]?.label || value.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="p-8 bg-white dark:bg-[#151b2d] border border-black/5 dark:border-white/10 rounded-[2.5rem] space-y-4">
                                    <div className="flex items-center gap-3"><Mail size={14} className="text-[#E8820C] dark:text-[#F5A623]" /><p className="text-sm font-black text-[#1A1A2E] dark:text-white/90">{selectedMember.email}</p></div>
                                    <div className="flex items-center gap-3"><UserCheck size={14} className="text-[#E8820C] dark:text-[#F5A623]" /><p className="text-sm font-black text-[#1A1A2E] dark:text-white/90 uppercase tracking-widest">{selectedMember.status || 'Active'}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-[#1A1A2E] dark:bg-[#0F172A]/95 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
                        <div className="relative bg-white dark:bg-[#111827] w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-500">
                            <div className="bg-[#1A1A2E] dark:bg-[#0F172A] p-10 flex items-center gap-6">
                                <div className="w-16 h-16 bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#E8820C] dark:text-[#F5A623]">
                                    {activeModal === 'password' && <Lock size={28} />}
                                    {activeModal === '2fa' && <ShieldCheck size={28} />}
                                    {activeModal === 'disable-2fa' && <ShieldAlert size={28} className="text-red-500" />}
                                    {activeModal === 'pin' && <Wallet size={28} />}
                                    {activeModal === 'notifications' && <Bell size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white font-serif capitalize">{activeModal.replace('-', ' ')}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] dark:text-[#F5A623] mt-1">Institutional Security Protocol</p>
                                </div>
                            </div>

                            <div className="p-10 bg-gray-50 dark:bg-gray-800">
                                {activeModal === '2fa' && (
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-[#1A1A2E] dark:text-white/90 uppercase tracking-widest text-center">Step 1: Synchronize Authenticator</h4>
                                            <div className="mx-auto w-48 h-48 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-black/10 shadow-2xl flex items-center justify-center relative overflow-hidden">
                                                {twoFactorData.otpauth && (
                                                    <QRCodeCanvas
                                                        value={twoFactorData.otpauth}
                                                        size={160}
                                                        level="H"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-[10px] font-black uppercase text-black/30 dark:text-white/30 tracking-widest">Secret Key</p>
                                                <div className="flex items-center gap-3 bg-white dark:bg-[#111827] px-4 py-2 rounded-xl border border-black/5 dark:border-white/10">
                                                    <code className="text-xs font-black text-[#1A1A2E] dark:text-white/90">{twoFactorData.secret}</code>
                                                    <button onClick={() => { navigator.clipboard.writeText(twoFactorData.secret); toast.success('Secret key copied'); }} className="text-[#E8820C] dark:text-[#F5A623] hover:scale-110 transition-transform"><Copy size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-8 border-t border-black/5 dark:border-white/10">
                                            <h4 className="text-sm font-black text-[#1A1A2E] dark:text-white/90 uppercase tracking-widest text-center">Step 2: Verify Access Code</h4>
                                            <div className="flex gap-2 justify-center">
                                                {otpDigits.map((d, i) => (
                                                    <input
                                                        key={i}
                                                        id={`otp-${i}`}
                                                        type="text"
                                                        maxLength="1"
                                                        value={d}
                                                        onChange={e => handleOtpChange(i, e.target.value)}
                                                        onPaste={handlePaste}
                                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                                        className="w-10 h-14 text-center bg-white dark:bg-[#111827] border-2 border-black/5 dark:border-white/10 rounded-xl text-xl font-black outline-none focus:border-[#E8820C]"
                                                        placeholder="-"
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                onClick={confirm2FA}
                                                disabled={otpSaving}
                                                className="w-full py-6 rounded-[2rem] bg-[#1A1A2E] dark:bg-[#0F172A] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                                            >
                                                {otpSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Biometric Link'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeModal === 'disable-2fa' && (
                                    <div className="space-y-8 text-center py-4">
                                        <div className="space-y-2">
                                            <p className="text-black/60 dark:text-white/60 font-medium">Are you sure you want to disable Two-Factor Authentication?</p>
                                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">This will significantly reduce your account security.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={() => setActiveModal(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-black dark:text-white font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
                                            <button onClick={handleDisable2FA} disabled={otpSaving} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                                                {otpSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Revoke Access'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeModal === 'password' && (
                                    <form onSubmit={handlePwChange} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-black/30 dark:text-white/30 ml-4">Current Master Key</label>
                                            <input type="password" required value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} className="w-full bg-white dark:bg-[#111827] border-2 border-black/5 dark:border-white/10 rounded-[2rem] px-8 py-5 text-sm font-bold outline-none focus:border-[#E8820C]/30 shadow-sm" placeholder="••••••••" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-black/30 dark:text-white/30 ml-4">New Encrypted Key</label>
                                            <input type="password" required value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} className="w-full bg-white dark:bg-[#111827] border-2 border-black/5 dark:border-white/10 rounded-[2rem] px-8 py-5 text-sm font-bold outline-none focus:border-[#E8820C]/30 shadow-sm" placeholder="Min. 8 characters" />
                                        </div>
                                        <button type="submit" disabled={pwSaving} className="w-full py-6 rounded-[2.5rem] bg-[#1A1A2E] dark:bg-[#0F172A] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all">
                                            {pwSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Synchronize Master Key'}
                                        </button>
                                    </form>
                                )}

                                {activeModal === 'pin' && (
                                    <form onSubmit={handlePinSubmit} className="space-y-6">
                                        <div className="text-center space-y-2 mb-6">
                                            <div className="w-12 h-12 bg-[#E8820C]/10 rounded-xl flex items-center justify-center mx-auto text-[#E8820C]">
                                                <Shield size={24} />
                                            </div>
                                            <p className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">
                                                {userProfile?.hasTransactionPin ? 'Rotate Security PIN' : 'Initialize Transaction PIN'}
                                            </p>
                                        </div>

                                        {userProfile?.hasTransactionPin && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Current PIN</label>
                                                <input required type="password" maxLength={4} pattern="\d{4}" value={pinForm.old} onChange={e => setPinForm({ ...pinForm, old: e.target.value })}
                                                    className="w-full bg-white dark:bg-[#111827] border-2 border-black/5 dark:border-white/10 focus:border-[#E8820C] rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] font-black outline-none" placeholder="****" />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">New Security PIN</label>
                                            <input required type="password" maxLength={4} pattern="\d{4}" value={pinForm.new} onChange={e => setPinForm({ ...pinForm, new: e.target.value })}
                                                className="w-full bg-white dark:bg-[#111827] border-2 border-black/5 dark:border-white/10 focus:border-[#E8820C] rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] font-black outline-none" placeholder="****" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-[0.2em] ml-2">Confirm New PIN</label>
                                            <input required type="password" maxLength={4} pattern="\d{4}" value={pinForm.confirm} onChange={e => setPinForm({ ...pinForm, confirm: e.target.value })}
                                                className="w-full bg-white dark:bg-[#111827] border-2 border-black/5 dark:border-white/10 focus:border-[#E8820C] rounded-2xl px-6 py-4 text-center text-2xl tracking-[1em] font-black outline-none" placeholder="****" />
                                        </div>

                                        <button type="submit" disabled={pinSaving} className="w-full py-6 mt-4 rounded-[2.5rem] bg-[#1A1A2E] dark:bg-[#0F172A] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                                            {pinSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Synchronize Security PIN'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showFullLedger && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-[#1A1A2E]/95 dark:bg-[#0F172A]/95 backdrop-blur-md" onClick={() => setShowFullLedger(false)}></div>
                        <div className="relative bg-white dark:bg-[#111827] w-full max-w-5xl rounded-[3rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="bg-[#1A1A2E] dark:bg-[#0F172A] p-10 flex items-center justify-between relative overflow-hidden">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#E8820C] dark:text-[#F5A623]">
                                        <Fingerprint size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white font-serif">Security Audit Ledger</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] dark:text-[#F5A623] mt-1">Universal System Manifest & Actions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={async () => {
                                            const csv = await exportLogsCSV();
                                            if (csv) toast.success("Ledger exported successfully");
                                            else toast.error("Nothing to export");
                                        }} 
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <Download size={14} /> Export CSV
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            if (window.confirm("Warning: This action will permanently erase the system security audit trail. Are you sure you want to proceed?")) {
                                                try {
                                                    await clearLogs();
                                                    toast.success("Audit ledger purged");
                                                    refreshLogs(1);
                                                    setShowFullLedger(false);
                                                } catch (err) {
                                                    toast.error(err.message || "Failed to purge ledger");
                                                }
                                            }
                                        }}
                                        className="px-6 py-3 bg-red-600/85 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
                                    >
                                        <Trash2 size={14} /> Purge Ledger
                                    </button>
                                    <button onClick={() => setShowFullLedger(false)} className="text-white/25 hover:text-white transition-all ml-4 cursor-pointer"><X size={24} /></button>
                                </div>
                            </div>

                            {/* Filters & Search */}
                            <div className="p-8 border-b border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-gray-850 flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative flex-1 w-full">
                                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" />
                                        <input 
                                            type="text" 
                                            placeholder="Filter by user, action, or details..."
                                            value={ledgerSearch}
                                            onChange={e => setLedgerSearch(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 rounded-2xl text-xs font-black outline-none focus:border-[#E8820C] dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                                        {['all', 'admin', 'security', 'system', 'member'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setLedgerCategory(cat)}
                                                className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer whitespace-nowrap ${
                                                    ledgerCategory === cat 
                                                        ? 'bg-black text-white dark:bg-white dark:text-[#0F172A] border-transparent' 
                                                        : 'bg-white dark:bg-[#111827] text-black/50 dark:text-white/50 border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-xs font-black">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest">From:</span>
                                        <input 
                                            type="date" 
                                            value={ledgerDateFrom} 
                                            onChange={e => setLedgerDateFrom(e.target.value)}
                                            className="px-4 py-2 rounded-xl bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 text-xs text-black dark:text-white outline-none focus:border-[#E8820C]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-black/40 dark:text-white/40 uppercase tracking-widest">To:</span>
                                        <input 
                                            type="date" 
                                            value={ledgerDateTo} 
                                            onChange={e => setLedgerDateTo(e.target.value)}
                                            className="px-4 py-2 rounded-xl bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 text-xs text-black dark:text-white outline-none focus:border-[#E8820C]"
                                        />
                                    </div>
                                    {(ledgerDateFrom || ledgerDateTo) && (
                                        <button 
                                            onClick={() => { setLedgerDateFrom(''); setLedgerDateTo(''); }}
                                            className="text-[9px] uppercase tracking-widest text-[#E8820C] hover:underline cursor-pointer"
                                        >
                                            Clear Dates
                                        </button>
                                    )}
                                    {ledgerLoading && (
                                        <span className="ml-auto text-[10px] text-[#E8820C] flex items-center gap-2 animate-pulse">
                                            <Loader2 size={12} className="animate-spin" /> Fetching manifest...
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Logs Table */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-[#111827]">
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Timestamp</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Category</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Initiator</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Action Protocols</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Specifications / Payload</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 text-right">Containment / Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs text-[#1A1A2E] dark:text-white/90">
                                            {filteredLedger.length > 0 ? (
                                                filteredLedger.map(log => {
                                                    const targetMember = findMemberByName(log.user);
                                                    return (
                                                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4 font-mono text-[10px] text-black/40 dark:text-white/40 whitespace-nowrap">
                                                                {new Date(log.timestamp || log.createdAt).toLocaleString('en-NG')}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                                    log.category === 'security' ? 'bg-red-500/10 text-red-500 border border-red-500/15' :
                                                                    log.category === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' :
                                                                    log.category === 'member' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/15' :
                                                                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
                                                                }`}>
                                                                    {log.category}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 font-black">{log.user}</td>
                                                            <td className="px-6 py-4 font-black text-black dark:text-white">{log.action}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-black/60 dark:text-white/60 font-medium">{log.detail}</span>
                                                                    <button 
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(log.detail);
                                                                            toast.success("Payload copied to clipboard");
                                                                        }}
                                                                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/35 dark:text-white/35 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                                                                        title="Copy Details"
                                                                    >
                                                                        <Copy size={12} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {targetMember && targetMember.role !== 'super_admin' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        {targetMember.status === 'suspended' ? (
                                                                            <button 
                                                                                onClick={() => handleStatusUpdate(targetMember._id || targetMember.id, 'active')}
                                                                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                                                            >
                                                                                Reactivate
                                                                            </button>
                                                                        ) : (
                                                                            <button 
                                                                                onClick={() => handleStatusUpdate(targetMember._id || targetMember.id, 'suspended')}
                                                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                                                            >
                                                                                Suspend
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="py-16 text-center text-black/30 dark:text-white/30 font-black uppercase tracking-widest">
                                                        No Audit Protocols Match Your Query
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            <div className="p-6 border-t border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-[#0F172A]/30 flex items-center justify-between text-xs">
                                <span className="text-black/50 dark:text-white/50 font-black uppercase tracking-wider">
                                    Total Logs: <span className="text-black dark:text-white font-serif">{auditTotal}</span>
                                </span>
                                <div className="flex items-center gap-4">
                                    <button 
                                        disabled={auditPage <= 1 || ledgerLoading}
                                        onClick={() => refreshLogs(auditPage - 1)}
                                        className="px-4 py-2 bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-black dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-black/60 dark:text-white/60 font-black uppercase tracking-widest">
                                        Page {auditPage} of {auditPages}
                                    </span>
                                    <button 
                                        disabled={auditPage >= auditPages || ledgerLoading}
                                        onClick={() => refreshLogs(auditPage + 1)}
                                        className="px-4 py-2 bg-white dark:bg-[#111827] border border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-black dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
