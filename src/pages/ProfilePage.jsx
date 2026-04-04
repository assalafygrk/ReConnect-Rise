import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Phone, Mail, CheckCircle, XCircle, Edit, ShieldCheck, User, Calendar,
    Camera, Briefcase, MessageCircle, AlertTriangle,
    ExternalLink, Globe, Save, Database, Loader2, Award,
    ChevronRight, MapPin, Fingerprint, Lock
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

const MOCK_DATA = {
    totalContributions: 5200,
    totalBonus: 400,
    totalLoans: 0,
    joinedYear: 2023,
    history: [
        { week: '2024-03-24', paid: true, bonus: 100, amount: 200 },
        { week: '2024-03-17', paid: true, bonus: 0, amount: 100 },
        { week: '2024-03-10', paid: false, bonus: 0, amount: 0 },
        { week: '2024-03-03', paid: true, bonus: 100, amount: 200 },
    ]
};

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.photoURL || null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '08030000000',
        bio: user?.bio || 'Dedicated brother of the ReConnect & Rise community.',
        occupation: user?.occupation || 'Software Engineer',
        whatsapp: user?.whatsapp || '08030000000',
        linkedin: user?.linkedin || '',
        website: user?.website || '',
        emergencyContact: user?.emergencyContact || 'Jane Doe (08012345678)',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                toast.success('Biometric profile updated');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        updateUser({ ...formData, photoURL: previewImage });
        setIsEditing(false);
        setSaving(false);
        toast.success('Dossier Synchronized Successfully');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
            {/* Header Section: The Identity */}
            <div className="relative bg-[#1A1A2E] rounded-[3.5rem] p-8 md:p-16 overflow-hidden shadow-2xl group border border-white/5">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-[#E8820C] to-[#F5A623] rounded-full blur-[150px] opacity-5 group-hover:opacity-10 transition-opacity duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]"></div>

                <div className="relative flex flex-col md:flex-row items-center gap-12">
                    {/* Biometric Avatar */}
                    <div className="relative group/avatar">
                        <div className="w-48 h-48 rounded-[3rem] bg-white/5 border-[10px] border-white/10 shadow-2xl flex items-center justify-center text-6xl font-black font-serif text-white overflow-hidden backdrop-blur-md">
                            {previewImage ? (
                                <img src={previewImage} alt="Dossier Profile" className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-700" />
                            ) : (
                                (user?.name || '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || <Fingerprint size={64} className="text-white/20" />
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-[#E8820C]/80 backdrop-blur-sm rounded-[3rem] flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 shadow-2xl"
                            >
                                <Camera size={32} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] mt-3">Refit Biometrics</span>
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        <div className="absolute -bottom-4 -right-4 p-4 bg-[#E8820C] text-white rounded-2xl shadow-xl border-4 border-[#1A1A2E]">
                            <Award size={20} />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-end gap-5">
                                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter font-serif leading-none">
                                    {formData.name || 'Registry Member'}
                                </h1>
                                <span className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#F5A623] backdrop-blur-md mb-1">
                                    {user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-xl text-white/40 font-serif italic leading-relaxed max-w-2xl">
                                "{formData.bio}"
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-8">
                            {[
                                { icon: Mail, label: formData.email },
                                { icon: Briefcase, label: formData.occupation },
                                { icon: Calendar, label: `Enrolled ${MOCK_DATA.joinedYear}` },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                                    <item.icon size={16} className="text-[#E8820C]" /> {item.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-10 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 ${isEditing ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-[#E8820C] text-white hover:bg-[#F5A623]'
                            }`}
                    >
                        {isEditing ? <XCircle size={20} /> : <Edit size={20} />}
                        {isEditing ? 'Cancel Deployment' : 'Edit Dossier'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-12">
                    {/* The Dossier Form/Info */}
                    <div className="bg-white rounded-[3.5rem] p-12 shadow-xl border border-black/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 text-black/[0.02]">
                            <Fingerprint size={160} />
                        </div>

                        <div className="flex items-center justify-between mb-12 border-b border-black/5 pb-8">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black font-serif text-[#1A1A2E]">Authentication Data</h3>
                                <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-[0.3em]">Official Member Record</p>
                            </div>
                            <Lock size={20} className="text-black/10" />
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em] mb-3 block">Professional Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-3xl px-8 py-6 text-sm font-medium outline-none transition-all resize-none shadow-inner"
                                        rows={3}
                                    />
                                </div>
                                {[
                                    { label: 'Official Identity', key: 'name', icon: User },
                                    { label: 'Current Designation', key: 'occupation', icon: Briefcase },
                                    { label: 'Direct Comms (WA)', key: 'whatsapp', icon: MessageCircle },
                                    { label: 'Professional Link', key: 'linkedin', icon: ExternalLink },
                                    { label: 'Digital Domain', key: 'website', icon: Globe },
                                    { label: 'Emergency Protocol', key: 'emergencyContact', icon: AlertTriangle },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-3">
                                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <field.icon size={12} className="text-[#E8820C]" /> {field.label}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData[field.key]}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-6 py-4 text-sm font-black outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                ))}
                                <div className="md:col-span-2 pt-8">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-6 rounded-[2rem] bg-[#1A1A2E] text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:shadow-[#1A1A2E]/20 transition-all flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin text-[#E8820C]" /> : <Save size={18} className="group-hover:translate-x-1 transition-transform" />}
                                        {saving ? 'Synchronizing Archive...' : 'Commit Dossier Updates'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: 'Primary Transmission', value: formData.phone, icon: Phone },
                                    { label: 'Secure Comms', value: formData.whatsapp, icon: MessageCircle },
                                    { label: 'Digital Ledger', value: formData.linkedin || 'Not linked', icon: ExternalLink },
                                    { label: 'Operational Hub', value: formData.website || 'No site listed', icon: Globe },
                                    { label: 'Protocol Override', value: formData.emergencyContact, icon: AlertTriangle },
                                    { label: 'Registry Token', value: user?.id ? `ARCH-RR-${user.id.toString().padStart(6, '0')}` : 'ARCH-RR-000000', icon: ShieldCheck },
                                ].map((info, i) => (
                                    <div key={i} className="group p-8 bg-gray-50/50 rounded-[2.5rem] border border-black/5 hover:bg-white hover:shadow-2xl transition-all duration-500">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-[#E8820C] uppercase tracking-[0.3em] mb-3">
                                            <info.icon size={12} className="group-hover:rotate-12 transition-transform" /> {info.label}
                                        </div>
                                        <p className="text-sm font-black text-[#1A1A2E] truncate leading-tight">{info.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Financial History Section */}
                    <div className="bg-white rounded-[3.5rem] shadow-xl border border-black/5 overflow-hidden">
                        <div className="p-10 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black font-serif text-[#1A1A2E]">Financial Sovereignty</h3>
                                <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mt-1">Audit of personal brotherhood equity</p>
                            </div>
                            <button className="px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-[#E8820C] border-2 border-[#E8820C]/10 hover:bg-[#E8820C]/5 transition-all flex items-center gap-3">
                                <Database size={14} /> Download Ledger Statement
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-black/30 tracking-[0.4em]">Cycle</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-black/30 tracking-[0.4em] text-center">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-black/30 tracking-[0.4em] text-center">Dividend</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase text-black/30 tracking-[0.4em] text-right">Contribution</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {MOCK_DATA.history.map((row, i) => (
                                        <tr key={i} className="hover:bg-[#E8820C]/[0.02] transition-colors group">
                                            <td className="px-10 py-8">
                                                <p className="text-sm font-black text-[#1A1A2E]">{dayjs(row.week).format('MMMM D, YYYY')}</p>
                                                <p className="text-[9px] text-[#E8820C] font-black uppercase tracking-widest mt-1">Registry Record #{8291 - i}</p>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                {row.paid ? (
                                                    <span className="px-5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-[0.3em] border border-emerald-100 shadow-sm">
                                                        Authenticated
                                                    </span>
                                                ) : (
                                                    <span className="px-5 py-2 rounded-xl bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-[0.3em] border border-rose-100 shadow-sm">
                                                        Data Fetching
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 text-center font-black text-sm text-[#F5A623]">
                                                {row.bonus > 0 ? `+${formatNaira(row.bonus)}` : '0.00'}
                                            </td>
                                            <td className="px-10 py-8 text-right font-black text-lg text-[#1A1A2E]">
                                                {formatNaira(row.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Analytics & Presence */}
                <div className="space-y-12">
                    {/* Equity Card */}
                    <div className="bg-[#1A1A2E] rounded-[3.5rem] p-10 text-white space-y-12 shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-56 h-56 bg-[#E8820C]/10 rounded-full blur-[60px] group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-white/30">Registry Equity</h3>
                            <div className="p-3 bg-white/5 rounded-2xl text-[#E8820C]">
                                <Database size={20} />
                            </div>
                        </div>

                        <div className="space-y-12 relative z-10">
                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em]">Aggregate Balance</p>
                                <p className="text-6xl font-black text-[#F5A623] tracking-tighter font-serif">
                                    {formatNaira(MOCK_DATA.totalContributions)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                                <div className="space-y-2">
                                    <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Growth</p>
                                    <p className="text-2xl font-black text-emerald-400 font-serif leading-none">+{formatNaira(MOCK_DATA.totalBonus)}</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Leverage</p>
                                    <p className="text-2xl font-black text-rose-400 font-serif leading-none">{formatNaira(MOCK_DATA.totalLoans)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social/Digital Nexus */}
                    <div className="bg-white rounded-[3.5rem] p-10 shadow-xl border border-black/5 space-y-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black font-serif text-[#1A1A2E]">Digital Nexus</h3>
                            <Globe size={20} className="text-[#E8820C]" />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {[
                                { icon: ExternalLink, label: 'LinkedIn', color: '#0077b5', href: formData.linkedin },
                                { icon: MessageCircle, label: 'WhatsApp', color: '#25D366', href: `https://wa.me/${formData.whatsapp}` },
                                { icon: Globe, label: 'Website', color: '#1A1A2E', href: formData.website },
                                { icon: Mail, label: 'Outlook', color: '#EA4335', href: `mailto:${formData.email}` },
                            ].map((social, i) => (
                                <button
                                    key={i}
                                    onClick={() => social.href && window.open(social.href, '_blank')}
                                    disabled={!social.href}
                                    className={`group flex flex-col items-center gap-3 p-5 rounded-3xl transition-all hover:-translate-y-2 active:scale-95 disabled:opacity-20 disabled:grayscale disabled:hover:translate-y-0 border border-black/5 hover:border-[#E8820C]/30 hover:shadow-xl`}
                                >
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all" style={{ background: social.color }}>
                                        <social.icon size={24} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-black/30 group-hover:text-[#1A1A2E]">{social.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-black/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Award size={48} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E8820C] mb-3">Institutional Note</p>
                            <p className="text-[11px] text-[#1A1A2E]/60 font-medium leading-relaxed italic">
                                Professional identities are verified and cataloged for strategic inter-brotherhood networking.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
