import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Phone, Mail, CheckCircle, XCircle, Edit, ShieldCheck, User, Calendar,
    Camera, Briefcase, AlertTriangle, Database, Loader2, MapPin, Fingerprint, Lock, Home, Users
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import IdCard from '../components/IdCard';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

const MOCK_LEDGER = [
    { week: '2024-03-24', paid: true, bonus: 100, amount: 200 },
    { week: '2024-03-17', paid: true, bonus: 0, amount: 100 },
    { week: '2024-03-10', paid: false, bonus: 0, amount: 0 },
    { week: '2024-03-03', paid: true, bonus: 100, amount: 200 },
];

export default function ProfilePage() {
    const { user, updateUser, switchActiveRole, activeRole, ROLE_HIERARCHY, ROLES } = useAuth();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.photoURL || null);
    const [saving, setSaving] = useState(false);

    // Get current role details from hierarchy
    const roleDetails = ROLE_HIERARCHY[activeRole] || { class: 'Unknown', label: activeRole };

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '08030000000',
        dateOfBirth: user?.dateOfBirth || '',
        stateOfOrigin: user?.stateOfOrigin || '',
        residentialAddress: user?.residentialAddress || '',
        occupation: user?.occupation || 'Software Engineer',
        nextOfKinName: user?.nextOfKinName || '',
        nextOfKinPhone: user?.nextOfKinPhone || '',
        nextOfKinRelation: user?.nextOfKinRelation || 'Sibling',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                toast.success('Profile photo updated.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        await new Promise(r => setTimeout(r, 1500));
        updateUser({ ...formData, photoURL: previewImage });
        setIsEditing(false);
        setSaving(false);
        toast.success('Profile Details Saved Successfully');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">

            {/* Header Section */}
            <div className="relative bg-[#1A1A2E] rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-[#E8820C] to-[transparent] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

                {/* Profile Photo */}
                <div className="relative group shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white/5 border-[6px] border-white/10 shadow-xl flex items-center justify-center text-4xl font-black text-white overflow-hidden backdrop-blur-md">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-all" />
                        ) : (
                            <User size={48} className="text-white/20" />
                        )}
                    </div>
                    {isEditing && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-[#E8820C]/80 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        >
                            <Camera size={28} />
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Upload Photo</span>
                        </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white font-serif">{formData.name || 'Member Profile'}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <span className="px-4 py-2 rounded-xl bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                            Class {roleDetails.class} — {roleDetails.label}
                        </span>
                        <span className="px-4 py-2 flex items-center gap-2 rounded-xl bg-emerald-500/10 text-[10px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
                            <CheckCircle size={12} /> Account Active
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`w-full md:w-auto justify-center px-8 py-5 mt-4 md:mt-0 rounded-3xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shrink-0
                        ${isEditing ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-[#E8820C] text-white hover:bg-[#F5A623]'}`}
                >
                    {isEditing ? <XCircle size={18} /> : <Edit size={18} />}
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
            </div>


            {/* Profile Forms / Viewer */}
            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-xl border border-black/5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-black/5">
                    <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-black font-serif text-[#1A1A2E]">Personal Information</h3>
                        <p className="text-[10px] md:text-[11px] font-bold text-black/40 uppercase tracking-widest">Confidential Member Records</p>
                    </div>

                    <Lock size={20} className="text-black/10" />
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'Full Name', key: 'name', icon: User, type: 'text' },
                                { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
                                { label: 'Phone Number', key: 'phone', icon: Phone, type: 'tel' },
                                { label: 'Date of Birth', key: 'dateOfBirth', icon: Calendar, type: 'date' },
                                { label: 'State of Origin', key: 'stateOfOrigin', icon: MapPin, type: 'text' },
                                { label: 'Occupation', key: 'occupation', icon: Briefcase, type: 'text' },
                            ].map((field) => (
                                <div key={field.key} className="space-y-3">
                                    <label className="text-[11px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
                                        <field.icon size={14} className="text-[#E8820C]" /> {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        value={formData[field.key]}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all"
                                    />
                                </div>
                            ))}
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[11px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-2">
                                    <Home size={14} className="text-[#E8820C]" /> Residential Address
                                </label>
                                <textarea
                                    value={formData.residentialAddress}
                                    onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all resize-none"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-black/5">
                            <h4 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-3">
                                <Users size={20} className="text-[#E8820C]" /> Next of Kin
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Full Name</label>
                                    <input type="text" value={formData.nextOfKinName} onChange={(e) => setFormData({ ...formData, nextOfKinName: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Phone Number</label>
                                    <input type="tel" value={formData.nextOfKinPhone} onChange={(e) => setFormData({ ...formData, nextOfKinPhone: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Relationship</label>
                                    <input type="text" value={formData.nextOfKinRelation} onChange={(e) => setFormData({ ...formData, nextOfKinRelation: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-6 rounded-[2rem] bg-[#1A1A2E] text-white font-bold text-[12px] uppercase tracking-[0.2em] shadow-xl hover:shadow-[#1A1A2E]/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin text-[#E8820C]" /> : <CheckCircle size={18} className="text-[#E8820C]" />}
                                {saving ? 'Saving Records...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-12">
                        {/* ID Card Section */}
                        <div className="flex flex-col items-center bg-gray-50 rounded-[2rem] p-4 md:p-8 border border-black/5 overflow-hidden">
                            <h4 className="text-[10px] md:text-[12px] font-bold text-[#E8820C] uppercase tracking-widest mb-6">Official Member ID Card</h4>
                            <div className="w-full overflow-x-auto pb-4 flex justify-center scrollbar-hide">
                                <div className="transform scale-[0.65] sm:scale-95 md:scale-100 origin-center min-w-[380px]">
                                    <IdCard member={{
                                        name: formData.name,
                                        photo: previewImage,
                                        occupation: formData.occupation,
                                        idNo: user?.id ? `RR-MEM-${user.id.toString().padStart(4, '0')}` : 'RR-MEM-0000',
                                        role: user?.role?.replace('_', ' ') || 'Official Member'
                                    }} />
                                </div>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { label: 'Email', value: formData.email || 'None Provided', icon: Mail },
                                { label: 'Phone', value: formData.phone || 'None Provided', icon: Phone },
                                { label: 'Date of Birth', value: formData.dateOfBirth || 'None Provided', icon: Calendar },
                                { label: 'State of Origin', value: formData.stateOfOrigin || 'None Provided', icon: MapPin },
                                { label: 'Occupation', value: formData.occupation || 'None Provided', icon: Briefcase },
                                { label: 'Account ID', value: user?.id ? `RR-MEM-${user.id.toString().padStart(6, '0')}` : 'RR-MEM-000000', icon: ShieldCheck },
                            ].map((info, i) => (
                                <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-black/5 hover:bg-white hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#E8820C] uppercase tracking-widest mb-2">
                                        <info.icon size={14} /> {info.label}
                                    </div>
                                    <p className="text-base font-bold text-[#1A1A2E] truncate">{info.value}</p>
                                </div>
                            ))}
                            <div className="sm:col-span-2 lg:col-span-3 p-6 bg-gray-50 rounded-[2rem] border border-black/5">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#E8820C] uppercase tracking-widest mb-2">
                                    <Home size={14} /> Residential Address
                                </div>
                                <p className="text-base font-bold text-[#1A1A2E] bg-white rounded-xl p-4 border border-black/5 min-h-[4rem]">
                                    {formData.residentialAddress || 'No address registered.'}
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-black/5">
                            <h4 className="text-[12px] font-bold text-black/40 tracking-widest uppercase mb-6 flex items-center gap-2">
                                <AlertTriangle size={16} /> Next of Kin Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Name</p>
                                    <p className="text-sm font-bold text-[#1A1A2E]">{formData.nextOfKinName || 'N/A'}</p>
                                </div>
                                <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Phone</p>
                                    <p className="text-sm font-bold text-[#1A1A2E]">{formData.nextOfKinPhone || 'N/A'}</p>
                                </div>
                                <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100">
                                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Relationship</p>
                                    <p className="text-sm font-bold text-[#1A1A2E]">{formData.nextOfKinRelation || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contribution Ledger */}
            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-black/5 overflow-hidden mt-8 md:mt-0">
                <div className="p-6 md:p-10 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black font-serif text-[#1A1A2E]">Contribution Ledger</h3>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">Personal financial compliance history</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="whitespace-nowrap">
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-[10px] font-bold uppercase text-black/40 tracking-widest">Cycle Date</th>
                                <th className="px-10 py-6 text-[10px] font-bold uppercase text-black/40 tracking-widest text-center">Status</th>
                                <th className="px-10 py-6 text-[10px] font-bold uppercase text-black/40 tracking-widest text-center">Dividends</th>
                                <th className="px-10 py-6 text-[10px] font-bold uppercase text-black/40 tracking-widest text-right">Contribution Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 whitespace-nowrap md:whitespace-normal">
                            {MOCK_LEDGER.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-10 py-6">
                                        <p className="text-sm font-bold text-[#1A1A2E]">{dayjs(row.week).format('MMMM D, YYYY')}</p>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        {row.paid ? (
                                            <span className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="px-4 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest border border-red-100">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-10 py-6 text-center font-bold text-sm text-[#F5A623]">
                                        {row.bonus > 0 ? `+${formatNaira(row.bonus)}` : '-'}
                                    </td>
                                    <td className="px-10 py-6 text-right font-black text-lg text-[#1A1A2E]">
                                        {formatNaira(row.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
