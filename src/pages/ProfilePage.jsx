import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Phone, Mail, CheckCircle, XCircle, Edit, ShieldCheck, User, Calendar,
    Camera, Briefcase, AlertTriangle, Database, Loader2, MapPin, Fingerprint, Lock, Home, Users,
    KeyRound, Eye, EyeOff, LogOut, ChevronRight, Bookmark, Settings
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import IdCard from '../components/IdCard';
import { apiUpdateProfile, apiUpdatePassword, apiGetProfile } from '../api/auth';
import { fetchUserContributions } from '../api/contributions';
import { fetchSettings } from '../api/settings';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

export default function ProfilePage() {
    const { user, updateUser, activeRole, logout } = useAuth();
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.photoURL || user?.facialUpload || null);
    const [saving, setSaving] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const [ledger, setLedger] = useState([]);
    const [loadingLedger, setLoadingLedger] = useState(true);
    const [settings, setSettings] = useState(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        middleName: user?.middleName || '',
        dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth).format('YYYY-MM-DD') : '',
        stateOfOrigin: user?.stateOfOrigin || '',
        residentialAddress: user?.residentialAddress || '',
        occupation: user?.occupation || '',
        nextOfKinName: user?.nextOfKinName || '',
        nextOfKinPhone: user?.nextOfKinPhone || '',
        nextOfKinRelation: user?.nextOfKinRelation || '',
    });

    useEffect(() => {
        // Fetch Settings for granular controls
        fetchSettings().then(setSettings).catch(() => {});

        // Fetch Full Profile for all fields (JWT only has basic info)
        apiGetProfile()
            .then(data => {
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    middleName: data.middleName || '',
                    dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth).format('YYYY-MM-DD') : '',
                    stateOfOrigin: data.stateOfOrigin || '',
                    residentialAddress: data.residentialAddress || '',
                    occupation: data.occupation || '',
                    nextOfKinName: data.nextOfKinName || '',
                    nextOfKinPhone: data.nextOfKinPhone || '',
                    nextOfKinRelation: data.nextOfKinRelation || '',
                });
                setPreviewImage(data.facialUpload || null);
            })
            .catch(err => toast.error('Failed to synchronize profile data'));
    }, []);

    useEffect(() => {
        if (user?._id || user?.id) {
            setLoadingLedger(true);
            fetchUserContributions(user._id || user.id)
                .then(data => setLedger(data))
                .catch(() => setLedger([]))
                .finally(() => setLoadingLedger(false));
        }
    }, [user]);

    // Password State
    const [showPasswords, setShowPasswords] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    const roleDetails = {
        class: activeRole === 'super_admin' ? 'A' : activeRole === 'admin' ? 'B' : 'C',
        label: activeRole?.replace('_', ' ').toUpperCase() || 'OFFICIAL MEMBER'
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                toast.success('Visual credentials captured. Update profile to persist.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await apiUpdateProfile({ ...formData, facialUpload: previewImage });
            updateUser({ ...updated, photoURL: previewImage });
            setIsEditing(false);
            toast.success('Professional Profile Synchronized');
        } catch (err) {
            toast.error(err.message || 'Synchronization Failed');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error('Passwords do not match');
        }
        setSaving(true);
        try {
            await apiUpdatePassword(passwords.new);
            toast.success('Security Credentials Updated');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            toast.error(err.message || 'Security Update Failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">
            
            {/* Master Header Card */}
            <div className="relative bg-[#0F172A] rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl border border-white/5 flex flex-col lg:flex-row items-center lg:items-end gap-10">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600 rounded-full blur-[200px] opacity-10 pointer-events-none"></div>
                
                {/* Profile Photo - Serious Frame */}
                <div className="relative group shrink-0">
                    <div className="w-40 h-40 md:w-52 md:h-52 rounded-[3rem] bg-white/5 border-[8px] border-white/10 shadow-2xl flex items-center justify-center text-4xl font-black text-white overflow-hidden backdrop-blur-xl group-hover:border-indigo-500/30 transition-all duration-500">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 opacity-20">
                                <User size={64} />
                                <span className="text-[10px] uppercase font-black tracking-widest">No Bio</span>
                            </div>
                        )}
                    </div>
                    {(settings?.allowProfilePhotoChange || activeRole === 'admin' || activeRole === 'super_admin') && (
                        <>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-500 hover:scale-110 transition-all active:scale-95"
                            >
                                <Camera size={24} />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </>
                    )}
                </div>

                <div className="flex-1 text-center lg:text-left space-y-6">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                            <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md border border-indigo-500/20">
                                {roleDetails.label}
                            </span>
                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md border border-emerald-500/20 flex items-center gap-2">
                                <ShieldCheck size={12} /> Active Status
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight leading-none">
                            {formData.name || 'Member Profile'}
                        </h1>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 text-white/60">
                            <Mail size={18} className="text-indigo-400" />
                            <span className="text-sm font-bold">{formData.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                            <Phone size={18} className="text-indigo-400" />
                            <span className="text-sm font-bold">{formData.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                            <Database size={18} className="text-indigo-400" />
                            <span className="text-sm font-bold">RR-MEM-{String(user?.id || '0').padStart(6, '0')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl
                            ${isEditing ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'}`}
                    >
                        {isEditing ? <XCircle size={18} /> : <Edit size={18} />}
                        {isEditing ? 'Discard Changes' : 'Modify Credentials'}
                    </button>
                    <button
                        onClick={logout}
                        className="px-8 py-5 rounded-2xl bg-white/5 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 border border-white/5 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        <LogOut size={18} /> Exit Console
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Sidebar - Navigation & Quick Stats */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
                    
                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-[2.5rem] p-4 shadow-xl border border-black/5 space-y-2">
                        {[
                            { id: 'personal', label: 'Personal Intelligence', icon: Fingerprint },
                            { id: 'identity', label: 'Member Identity', icon: Bookmark },
                            { id: 'security', label: 'Security & Access', icon: Lock },
                            { id: 'history', label: 'Financial Compliance', icon: Database },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-300 group
                                    ${activeTab === tab.id ? 'bg-[#0F172A] text-white shadow-xl translate-x-2' : 'hover:bg-gray-50 text-black/40 hover:text-black'}`}
                            >
                                <tab.icon size={20} className={activeTab === tab.id ? 'text-indigo-400' : 'text-gray-300 group-hover:text-indigo-500'} />
                                <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{tab.label}</span>
                                <ChevronRight size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                            </button>
                        ))}
                    </div>

                    {/* Mini Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Paid</p>
                            <h4 className="text-3xl font-serif font-black">{formatNaira(ledger.reduce((acc, c) => acc + (c.status === 'confirmed' ? c.amount : 0), 0))}</h4>
                        </div>
                        <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Dividends</p>
                            <h4 className="text-3xl font-serif font-black">{formatNaira(ledger.reduce((acc, c) => acc + (c.bonus || 0), 0))}</h4>
                        </div>
                    </div>

                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-black/5 min-h-[600px] relative overflow-hidden transition-all duration-500">
                        
                        {activeTab === 'personal' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                                <div className="flex items-center justify-between border-b border-black/5 pb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-serif font-black text-[#1A1A2E]">Personal Intelligence</h2>
                                        <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Confidential Member Dossier</p>
                                    </div>
                                    <Fingerprint size={32} className="text-black/5" />
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleUpdate} className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {[
                                                { label: 'Full Display Name', key: 'name', icon: User, type: 'text' },
                                                { label: 'Official Phone', key: 'phone', icon: Phone, type: 'tel' },
                                                { label: 'Temporal Marker (DOB)', key: 'dateOfBirth', icon: Calendar, type: 'date' },
                                                { label: 'Geo-Origin', key: 'stateOfOrigin', icon: MapPin, type: 'text' },
                                                { label: 'Professional Designation', key: 'occupation', icon: Briefcase, type: 'text' },
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-3 group">
                                                    <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                                                        <field.icon size={14} className="text-indigo-400" /> {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        value={formData[field.key]}
                                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Home size={14} className="text-indigo-400" /> Primary Residence
                                            </label>
                                            <textarea
                                                value={formData.residentialAddress}
                                                onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all resize-none"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="pt-8 border-t border-black/5">
                                            <div className="flex items-center gap-3 mb-8">
                                                <Users size={20} className="text-indigo-600" />
                                                <h3 className="text-xl font-serif font-black">Succession & Next of Kin</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-black/40 uppercase">Full Name</label>
                                                    <input type="text" value={formData.nextOfKinName} onChange={(e) => setFormData({ ...formData, nextOfKinName: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-black/40 uppercase">Phone</label>
                                                    <input type="tel" value={formData.nextOfKinPhone} onChange={(e) => setFormData({ ...formData, nextOfKinPhone: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-black/40 uppercase">Kin Relation</label>
                                                    <input type="text" value={formData.nextOfKinRelation} onChange={(e) => setFormData({ ...formData, nextOfKinRelation: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full py-6 rounded-3xl bg-[#0F172A] text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={20} className="animate-spin text-indigo-400" /> : <ShieldCheck size={20} className="text-indigo-400" />}
                                            {saving ? 'Synchronizing Data...' : 'Confirm Profile Update'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'Display Name', value: formData.name, icon: User },
                                            { label: 'Temporal Marker', value: dayjs(formData.dateOfBirth).format('MMMM DD, YYYY'), icon: Calendar },
                                            { label: 'Professional Designation', value: formData.occupation, icon: Briefcase },
                                            { label: 'Geo-Origin', value: formData.stateOfOrigin, icon: MapPin },
                                        ].map((info, i) => (
                                            <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-black/5 hover:bg-white hover:shadow-xl transition-all duration-300">
                                                <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">
                                                    <info.icon size={16} /> {info.label}
                                                </div>
                                                <p className="text-xl font-black text-[#1A1A2E]">{info.value || 'Not Registered'}</p>
                                            </div>
                                        ))}
                                        <div className="md:col-span-2 p-8 bg-gray-50 rounded-[2.5rem] border border-black/5">
                                            <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">
                                                <Home size={16} /> Primary Residence
                                            </div>
                                            <p className="text-lg font-bold text-[#1A1A2E] leading-relaxed">
                                                {formData.residentialAddress || 'No residency registered.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'identity' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                                <div className="flex items-center justify-between border-b border-black/5 pb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-serif font-black text-[#1A1A2E]">Official Identity</h2>
                                        <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Authorized Credentials</p>
                                    </div>
                                    <Bookmark size={32} className="text-black/5" />
                                </div>

                                <div className="flex flex-col items-center bg-[#F8FAFC] rounded-[3rem] p-6 md:p-10 border border-black/5 shadow-inner">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-12 text-center">Digital Brotherhood Pass</p>
                                    <div className="w-full overflow-x-auto pb-8 scrollbar-hide">
                                        <div className="min-w-[400px] flex justify-center py-4">
                                            <div className="transform scale-[0.8] sm:scale-100 lg:scale-110 origin-center transition-transform">
                                                <IdCard member={{
                                                    name: formData.name,
                                                    photo: previewImage,
                                                    occupation: formData.occupation,
                                                    idNo: user?.id ? `RR-MEM-${String(user.id).padStart(4, '0')}` : 'RR-MEM-0000',
                                                    role: user?.role?.replace('_', ' ') || 'Official Member'
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-16 flex gap-4">
                                        <button className="px-8 py-4 rounded-xl bg-white border border-black/5 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95">Download PDF</button>
                                        <button className="px-8 py-4 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">Verify Identity</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                                <div className="flex items-center justify-between border-b border-black/5 pb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-serif font-black text-[#1A1A2E]">Security & Access</h2>
                                        <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Credential Protection Protocol</p>
                                    </div>
                                    <Lock size={32} className="text-black/5" />
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-10 max-w-lg">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest flex items-center justify-between">
                                                <span>Master Credentials</span>
                                                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                    {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
                                                    {showPasswords ? 'Shield' : 'Reveal'}
                                                </button>
                                            </label>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                                                    <input
                                                        type={showPasswords ? 'text' : 'password'}
                                                        placeholder="New Security Key"
                                                        value={passwords.new}
                                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl pl-16 pr-6 py-5 text-sm font-bold outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <CheckCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                                                    <input
                                                        type={showPasswords ? 'text' : 'password'}
                                                        placeholder="Repeat New Key"
                                                        value={passwords.confirm}
                                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl pl-16 pr-6 py-5 text-sm font-bold outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-4">
                                        <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-amber-900 uppercase">Warning Protocol</p>
                                            <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                                Updating your master key will revoke all active sessions. Ensure you have memorized your new credentials before committing.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving || !passwords.new}
                                        className="w-full py-6 rounded-3xl bg-[#1A1A2E] text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                                        Update Access Key
                                    </button>
                                </form>

                                <div className="pt-12 border-t border-black/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">Two-Factor Protocols</h3>
                                            <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Multi-Layer Defense</p>
                                        </div>
                                        <ShieldCheck size={28} className={twoFactorEnabled ? "text-emerald-500" : "text-black/10"} />
                                    </div>

                                    <div className={`p-8 rounded-[2.5rem] border transition-all ${twoFactorEnabled ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-black/5'}`}>
                                        <div className="flex items-center justify-between gap-6 flex-col sm:flex-row text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${twoFactorEnabled ? 'bg-white text-emerald-600' : 'bg-white text-black/20'}`}>
                                                    <Fingerprint size={28} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#1A1A2E]">Biometric Authenticator</p>
                                                    <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-1">
                                                        {twoFactorEnabled ? 'Active Protection' : 'Protection Disabled'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setTwoFactorEnabled(!twoFactorEnabled);
                                                    toast.success(`2FA Protocol ${!twoFactorEnabled ? 'Activated' : 'Revoked'}`);
                                                }}
                                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${twoFactorEnabled ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white border border-black/10 text-[#1A1A2E]'}`}
                                            >
                                                {twoFactorEnabled ? 'Disable' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12">
                                <div className="flex items-center justify-between border-b border-black/5 pb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-serif font-black text-[#1A1A2E]">Financial Compliance</h2>
                                        <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Master Ledger Sync</p>
                                    </div>
                                    <Database size={32} className="text-black/5" />
                                </div>

                                <div className="overflow-hidden border border-black/5 rounded-[2.5rem]">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-black/5">
                                                <th className="px-8 py-5 text-[10px] font-black uppercase text-black/40 tracking-widest">Temporal Point</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase text-black/40 tracking-widest text-center">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase text-black/40 tracking-widest text-right">Contribution</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5">
                                            {loadingLedger ? (
                                                <tr><td colSpan={3} className="px-8 py-20 text-center text-[10px] font-black uppercase text-black/20 tracking-widest">Synchronizing Ledger Data...</td></tr>
                                            ) : ledger.length === 0 ? (
                                                <tr><td colSpan={3} className="px-8 py-20 text-center text-[10px] font-black uppercase text-black/20 tracking-widest">No Compliance Records Found.</td></tr>
                                            ) : ledger.map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-black/20 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                                                                <Calendar size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-[#1A1A2E]">{row.weekId ? `Cycle Week ${row.weekId}` : 'Special Outlay'}</p>
                                                                <p className="text-[10px] font-bold text-black/30 uppercase">{dayjs(row.createdAt).format('DD MMM YYYY')}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${row.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                            {row.status === 'confirmed' ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <p className="text-lg font-black text-[#1A1A2E]">{formatNaira(row.amount)}</p>
                                                        {row.bonus > 0 && <p className="text-[10px] font-black text-emerald-500 uppercase">+ {formatNaira(row.bonus)} Dividend</p>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
