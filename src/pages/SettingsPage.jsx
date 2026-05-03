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
    ChevronDown, UserCheck, ShieldAlert as AlertIcon, Copy
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { fetchMembers } from '../api/members';
import {
    fetchSettings, updateSettings,
    changePassword, updateNotifications,
    updateAdminSecurity, updateUserRole, updateUserStatus,
    updateTransactionPin,
    setup2FA, verify2FA, disable2FA
} from '../api/settings';
import { useAuth } from '../context/AuthContext';
import { getLogs, addLog, clearLogs, exportLogsCSV } from '../api/auditLog';
import AdminAuthGate from '../components/admin/AdminAuthGate';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
    const navigate = useNavigate();
    const {
        user: currentUser,
        hasRole,
        adminPanelUnlocked,
        unlockAdminPanel,
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
    const [showFullLedger, setShowFullLedger] = useState(false);

    // Form states
    const [pwForm, setPwForm] = useState({ current: '', next: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pinDigits, setPinDigits] = useState(['', '', '', '']);
    const [pinSaving, setPinSaving] = useState(false);

    // 2FA State
    const [twoFactorData, setTwoFactorData] = useState({ secret: '', otpauth: '', enabled: false });
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [otpSaving, setOtpSaving] = useState(false);

    const refreshLogs = useCallback(() => setAuditLogs(getLogs()), []);

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
                refreshLogs();
            } catch (err) {
                toast.error("Protocol synchronization failure");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [refreshLogs]);

    const handleSaveProtocols = async () => {
        setSaving(true);
        try {
            await updateSettings(settings);
            addLog(currentUser?.name || 'Admin', 'Settings Updated', 'System-wide protocols updated', 'admin');
            refreshLogs();
            toast.success('Omni-system Protocols Synchronized');
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
            addLog(currentUser?.name || 'Admin', 'Role Updated', `User ${id} role changed to ${newRole}`, 'admin');
            refreshLogs();
            toast.success('Member Access Level Updated');
        } catch (err) {
            toast.error(err.message || 'Role update failed');
        }
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
        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const confirm2FA = async () => {
        const token = otpDigits.join('');
        if (token.length !== 6) return toast.error('Enter 6-digit code');
        setOtpSaving(true);
        try {
            await verify2FA(token);
            toast.success('2FA Protocol Activated');
            setActiveModal(null);
            setOtpDigits(['', '', '', '', '', '']);
        } catch (err) {
            toast.error(err.message || 'Verification failed');
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
        const pin = pinDigits.join('');
        if (pin.length !== 4) return toast.error('PIN must be 4 digits');
        setPinSaving(true);
        try {
            await updateTransactionPin(pin);
            toast.success('Transaction PIN Locked');
            setActiveModal(null);
            setPinDigits(['', '', '', '']);
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
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1A1A2E]/40">Accessing Protocols...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-12">
            
            <div className="bg-[#1A1A2E] rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8820C] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
                <div className="space-y-4 text-center lg:text-left">
                    <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight">System Control Panel</h1>
                    <p className="text-white/40 text-lg font-serif italic max-w-xl leading-relaxed">Universal configuration of brotherhood operational protocols and security parameters.</p>
                </div>
                <button
                    onClick={handleSaveProtocols}
                    disabled={saving}
                    className="w-full lg:w-auto flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] bg-[#E8820C] text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#F5A623] transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Synchronizing...' : 'Save All Protocols'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {isAdmin && (
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-lg border border-black/5">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black font-serif text-[#1A1A2E]">Executive Council Registry</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Institutional Access Management</p>
                                </div>
                                <Users size={24} className="text-black/10" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {members.map(member => (
                                    <button
                                        key={member._id || member.id}
                                        onClick={() => setSelectedMember(member)}
                                        className="aspect-square bg-gray-50 rounded-[2rem] border border-black/5 p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center text-lg font-black text-[#1A1A2E] group-hover:bg-[#E8820C] group-hover:text-white transition-all shadow-sm">
                                            {(member.name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1A1A2E] line-clamp-1">{member.name}</p>
                                            <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">{(member.role || 'Member').replace(/[-_]/g, ' ')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isTreasurer && (
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-lg border border-black/5">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black font-serif text-[#1A1A2E]">Monetary Statutes</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Financial Guardrails & Compliance</p>
                                </div>
                                <Database size={24} className="text-black/10" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 ml-4">Monthly Savings Target</label>
                                    <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-black/5">
                                        <span className="text-xl font-black font-serif text-black/20">₦</span>
                                        <input
                                            type="number"
                                            value={settings.monthlySavingsTarget}
                                            onChange={e => setSettings({ ...settings, monthlySavingsTarget: e.target.value })}
                                            className="w-full bg-transparent text-2xl font-black font-serif outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 ml-4">Loan Interest Rate (%)</label>
                                    <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl border border-black/5">
                                        <input
                                            type="number"
                                            value={settings.loanInterestRate}
                                            onChange={e => setSettings({ ...settings, loanInterestRate: e.target.value })}
                                            className="w-full bg-transparent text-2xl font-black font-serif outline-none text-right"
                                        />
                                        <span className="text-xl font-black font-serif text-black/20">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#1A1A2E] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5 space-y-8">
                        <div className="border-b border-white/10 pb-6">
                            <h3 className="text-2xl font-black font-serif">Security & Access</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Credential Protection Protocols</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 'password', label: 'Update Access Key', icon: Lock, action: () => setActiveModal('password') },
                                { id: '2fa', label: '2FA Configuration', icon: ShieldCheck, action: initiate2FA },
                                { id: 'pin', label: 'Transaction PIN', icon: Wallet, action: () => setActiveModal('pin') },
                                { id: 'notifications', label: 'Notification Matrix', icon: Bell, action: () => setActiveModal('notifications') },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={item.action}
                                    className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon size={18} className="text-[#E8820C] group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                        {isAdmin && (
                            <div className="pt-8 border-t border-white/10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black uppercase tracking-widest">Bio-Image Updates</p>
                                        <p className="text-[10px] text-white/30 uppercase">Member permission</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, allowProfilePhotoChange: !settings.allowProfilePhotoChange })}
                                        className={`w-12 h-7 rounded-full p-1 transition-all ${settings.allowProfilePhotoChange ? 'bg-[#E8820C]' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-xl transform transition-transform ${settings.allowProfilePhotoChange ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-lg border border-black/5 space-y-6">
                            <div className="flex items-center justify-between border-b border-black/5 pb-6">
                                <h3 className="text-xl font-black font-serif text-[#1A1A2E]">Audit Ledger</h3>
                                <Fingerprint size={20} className="text-black/10" />
                            </div>
                            <div className="space-y-4">
                                {auditLogs.slice(0, 4).map(log => (
                                    <div key={log.id} className="p-4 bg-gray-50 rounded-2xl border border-black/5 space-y-1">
                                        <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest">{log.category}</p>
                                        <p className="text-xs font-black text-[#1A1A2E] line-clamp-1">{log.action}</p>
                                        <p className="text-[9px] font-bold text-black/20 italic">{log.timeDisplay}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowFullLedger(true)} className="w-full py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] transition-all active:scale-95">Open Full Manifest</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedMember && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#1A1A2E]/90 backdrop-blur-md" onClick={() => setSelectedMember(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="bg-[#1A1A2E] p-10 relative overflow-hidden">
                            <button onClick={() => setSelectedMember(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-all"><X size={24} /></button>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center text-2xl font-black text-[#1A1A2E]">
                                    {(selectedMember.name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white font-serif">{selectedMember.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] mt-1">Council Member Records</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 space-y-8 bg-gray-50/50">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-4">Access Level (Role)</label>
                                <select
                                    value={selectedMember.role || 'member'}
                                    onChange={(e) => handleRoleUpdate(selectedMember._id || selectedMember.id, e.target.value)}
                                    className="w-full bg-white border-2 border-black/5 focus:border-[#E8820C]/30 rounded-[2rem] px-8 py-5 text-sm font-black outline-none shadow-sm appearance-none cursor-pointer"
                                >
                                    {Object.entries(ROLES).map(([key, value]) => (
                                        <option key={value} value={value}>
                                            {ROLE_CLASSES[value]?.label || value.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-8 bg-white border border-black/5 rounded-[2.5rem] space-y-4">
                                <div className="flex items-center gap-3"><Mail size={14} className="text-[#E8820C]" /><p className="text-sm font-black text-[#1A1A2E]">{selectedMember.email}</p></div>
                                <div className="flex items-center gap-3"><UserCheck size={14} className="text-[#E8820C]" /><p className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">{selectedMember.status || 'Active'}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#1A1A2E]/95 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="bg-[#1A1A2E] p-10 flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#E8820C]">
                                {activeModal === 'password' && <Lock size={28} />}
                                {activeModal === '2fa' && <ShieldCheck size={28} />}
                                {activeModal === 'pin' && <Wallet size={28} />}
                                {activeModal === 'notifications' && <Bell size={28} />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white font-serif capitalize">{activeModal.replace('-', ' ')}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] mt-1">Institutional Security Protocol</p>
                            </div>
                        </div>

                        <div className="p-10 bg-gray-50/50">
                            {activeModal === '2fa' && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest text-center">Step 1: Synchronize Authenticator</h4>
                                        <div className="mx-auto w-48 h-48 bg-white p-4 rounded-3xl border border-black/10 shadow-2xl flex items-center justify-center relative overflow-hidden">
                                            {twoFactorData.otpauth && (
                                                <QRCodeCanvas 
                                                    value={twoFactorData.otpauth} 
                                                    size={160}
                                                    level="H"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-[10px] font-black uppercase text-black/30 tracking-widest">Secret Key</p>
                                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-black/5">
                                                <code className="text-xs font-black text-[#1A1A2E]">{twoFactorData.secret}</code>
                                                <button onClick={() => { navigator.clipboard.writeText(twoFactorData.secret); toast.success('Secret key copied'); }} className="text-[#E8820C] hover:scale-110 transition-transform"><Copy size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-8 border-t border-black/5">
                                        <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest text-center">Step 2: Verify Access Code</h4>
                                        <div className="flex gap-2 justify-center">
                                            {otpDigits.map((d, i) => (
                                                <input
                                                    key={i}
                                                    id={`otp-${i}`}
                                                    type="text"
                                                    maxLength="1"
                                                    value={d}
                                                    onChange={e => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                                    className="w-10 h-14 text-center bg-white border-2 border-black/5 rounded-xl text-xl font-black outline-none focus:border-[#E8820C]"
                                                    placeholder="-"
                                                />
                                            ))}
                                        </div>
                                        <button 
                                            onClick={confirm2FA}
                                            disabled={otpSaving}
                                            className="w-full py-6 rounded-[2rem] bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                                        >
                                            {otpSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Biometric Link'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'password' && (
                                <form onSubmit={handlePwChange} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-black/30 ml-4">Current Master Key</label>
                                        <input type="password" required value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} className="w-full bg-white border-2 border-black/5 rounded-[2rem] px-8 py-5 text-sm font-bold outline-none focus:border-[#E8820C]/30 shadow-sm" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-black/30 ml-4">New Encrypted Key</label>
                                        <input type="password" required value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} className="w-full bg-white border-2 border-black/5 rounded-[2rem] px-8 py-5 text-sm font-bold outline-none focus:border-[#E8820C]/30 shadow-sm" placeholder="Min. 8 characters" />
                                    </div>
                                    <button type="submit" disabled={pwSaving} className="w-full py-6 rounded-[2.5rem] bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all">
                                        {pwSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Synchronize Master Key'}
                                    </button>
                                </form>
                            )}

                            {activeModal === 'pin' && (
                                <form onSubmit={handlePinSubmit} className="space-y-8">
                                    <div className="flex gap-4 justify-center">
                                        {pinDigits.map((d, i) => (
                                            <input key={i} id={`pin-modal-${i}`} type="password" maxLength="1" required value={d} onChange={e => {
                                                const val = e.target.value.slice(-1);
                                                const newPin = [...pinDigits];
                                                newPin[i] = val;
                                                setPinDigits(newPin);
                                                if (val && i < 3) document.getElementById(`pin-modal-${i + 1}`)?.focus();
                                            }} className="w-16 h-20 text-center bg-white border-2 border-black/5 rounded-2xl text-3xl font-black outline-none focus:border-[#E8820C]/30" placeholder="-" />
                                        ))}
                                    </div>
                                    <button type="submit" disabled={pinSaving} className="w-full py-6 rounded-[2.5rem] bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all">
                                        {pinSaving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Lock Transaction Vault'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
