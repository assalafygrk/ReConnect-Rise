import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Phone, Mail, CheckCircle, XCircle, Edit, ShieldCheck, User, Calendar,
    Camera, Briefcase, AlertTriangle, Loader2, MapPin, Home, Users
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import IdCard from '../components/IdCard';
import { fetchProfile, updateProfile } from '../api/auth';
import { fetchMyContributions } from '../api/wallet';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

export default function ProfilePage() {
    const { user, updateUser, activeRole, ROLE_HIERARCHY } = useAuth();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        stateOfOrigin: '',
        residentialAddress: '',
        occupation: '',
        nextOfKinName: '',
        nextOfKinPhone: '',
        nextOfKinRelation: '',
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [profile, ledger] = await Promise.all([
                fetchProfile(),
                fetchMyContributions()
            ]);
            
            const userData = profile || user;
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                middleName: userData.middleName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('YYYY-MM-DD') : '',
                stateOfOrigin: userData.stateOfOrigin || '',
                residentialAddress: userData.residentialAddress || '',
                occupation: userData.occupation || '',
                nextOfKinName: userData.nextOfKinName || '',
                nextOfKinPhone: userData.nextOfKinPhone || '',
                nextOfKinRelation: userData.nextOfKinRelation || '',
            });
            setPreviewImage(userData.facialUpload || null);
            setContributions(ledger || []);
        } catch (err) {
            console.error('Failed to load profile:', err);
            toast.error('Failed to synchronize profile data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const roleDetails = ROLE_HIERARCHY[activeRole] || { class: 'Unknown', label: activeRole };

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
        try {
            const updated = await updateProfile({ ...formData, facialUpload: previewImage });
            updateUser(updated);
            setIsEditing(false);
            toast.success('Profile Details Saved Successfully');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-[#E8820C]" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Synchronizing Identity...</p>
            </div>
        );
    }

    const fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
            {/* Header Section */}
            <div className="relative bg-[#1A1A2E] rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#E8820C]/10 rounded-full blur-[150px]"></div>
                <div className="relative group shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white/5 border-[6px] border-white/10 shadow-xl flex items-center justify-center text-4xl font-black text-white overflow-hidden backdrop-blur-md">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="text-white/20" />
                        )}
                    </div>
                    {isEditing && (
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-[#E8820C]/80 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                            <Camera size={28} />
                            <span className="text-[10px] font-bold uppercase mt-2">Upload Photo</span>
                        </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
                <div className="flex-1 text-center md:text-left space-y-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-white font-serif">{fullName || 'Member Profile'}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <span className="px-4 py-2 rounded-xl bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                            Class {roleDetails.class} — {roleDetails.label}
                        </span>
                        <span className="px-4 py-2 flex items-center gap-2 rounded-xl bg-emerald-500/10 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            <CheckCircle size={12} /> Account Active
                        </span>
                    </div>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className={`w-full md:w-auto px-8 py-5 rounded-3xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isEditing ? 'bg-red-500/10 text-red-500' : 'bg-[#E8820C] text-white'}`}>
                    {isEditing ? <XCircle size={18} /> : <Edit size={18} />}
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-xl border border-black/5">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5">
                    <h3 className="text-2xl md:text-3xl font-black font-serif text-[#1A1A2E]">Personal Information</h3>
                    <Lock size={20} className="text-black/10" />
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'First Name', key: 'firstName', icon: User },
                                { label: 'Last Name', key: 'lastName', icon: User },
                                { label: 'Middle Name', key: 'middleName', icon: User },
                                { label: 'Email', key: 'email', icon: Mail, type: 'email' },
                                { label: 'Phone', key: 'phone', icon: Phone, type: 'tel' },
                                { label: 'Date of Birth', key: 'dateOfBirth', icon: Calendar, type: 'date' },
                                { label: 'Occupation', key: 'occupation', icon: Briefcase },
                            ].map((field) => (
                                <div key={field.key} className="space-y-3">
                                    <label className="text-[11px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-2"><field.icon size={14} className="text-[#E8820C]" /> {field.label}</label>
                                    <input type={field.type || 'text'} value={formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all" />
                                </div>
                            ))}
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[11px] font-bold text-black/40 uppercase tracking-widest flex items-center gap-2"><Home size={14} className="text-[#E8820C]" /> Residential Address</label>
                                <textarea value={formData.residentialAddress} onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all resize-none" rows={2} />
                            </div>
                        </div>
                        <button type="submit" disabled={saving} className="w-full py-6 rounded-[2rem] bg-[#1A1A2E] text-white font-bold text-[12px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                            {saving ? <Loader2 size={18} className="animate-spin text-[#E8820C]" /> : <CheckCircle size={18} className="text-[#E8820C]" />}
                            {saving ? 'Saving Records...' : 'Save Profile Changes'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-12">
                        <div className="flex flex-col items-center bg-gray-50 rounded-[2rem] p-8 border border-black/5">
                            <h4 className="text-[12px] font-bold text-[#E8820C] uppercase tracking-widest mb-6">Official ID Card</h4>
                            <IdCard member={{
                                name: fullName,
                                photo: previewImage,
                                occupation: formData.occupation,
                                idNo: user?.memberId || 'RR-MEM-0000',
                                role: activeRole?.replace('_', ' ') || 'Official Member'
                            }} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { label: 'Email', value: formData.email, icon: Mail },
                                { label: 'Phone', value: formData.phone, icon: Phone },
                                { label: 'DOB', value: formData.dateOfBirth, icon: Calendar },
                                { label: 'Occupation', value: formData.occupation, icon: Briefcase },
                                { label: 'Address', value: formData.residentialAddress, icon: Home },
                            ].map((info, i) => (
                                <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-black/5">
                                    <p className="text-[10px] font-bold text-[#E8820C] uppercase tracking-widest mb-2 flex items-center gap-2"><info.icon size={12} /> {info.label}</p>
                                    <p className="text-base font-bold text-[#1A1A2E] truncate">{info.value || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-black/5 overflow-hidden">
                <div className="p-10 border-b border-black/5">
                    <h3 className="text-2xl font-black font-serif text-[#1A1A2E]">Contribution Ledger</h3>
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">Personal financial compliance history</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-[10px] font-bold uppercase text-black/40 tracking-widest">Date</th>
                                <th className="px-10 py-6 text-[10px] font-bold uppercase text-black/40 tracking-widest text-center">Status</th>
                                <th className="px-10 py-6 text-[10px] font-bold uppercase text-black/40 tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {contributions.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-10 py-6 text-sm font-bold text-[#1A1A2E]">{dayjs(row.createdAt).format('MMMM D, YYYY')}</td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${row.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right font-black text-[#1A1A2E]">{formatNaira(row.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
