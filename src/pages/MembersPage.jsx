import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    UserCircle, Phone, Mail, Crown, ShieldCheck, Plus, X, Users,
    Search, Filter, Trash2, ToggleLeft, ToggleRight, UserPlus,
    Activity, Shield, Star, Zap, KeyRound, MapPin, Briefcase,
    Landmark, Scale
} from 'lucide-react';
import { fetchMembers, createMember, updateMemberStatus, deleteMember } from '../api/members';
import { useAuth } from '../context/AuthContext';

const roleBadge = {
    super_admin: { label: 'Supreme Admin', icon: Crown, color: '#E8820C' },
    admin: { label: 'Admin', icon: ShieldCheck, color: '#3B82F6' },
    group_leader: { label: 'Group Leader', icon: Crown, color: '#F5A623' },
    groupleader: { label: 'Group Leader', icon: Crown, color: '#F5A623' },
    'financial-secretary': { label: 'Financial Secretary', icon: Landmark, color: '#10B981' },
    financial_secretary: { label: 'Financial Secretary', icon: Landmark, color: '#10B981' },
    treasurer: { label: 'Treasurer', icon: ShieldCheck, color: '#10B981' },
    auditor: { label: 'Auditor', icon: Scale, color: '#F5A623' },
    welfare: { label: 'Welfare Officer', icon: Shield, color: '#14B8A6' },
    'special-advisor': { label: 'Special Advisor', icon: Star, color: '#8B5CF6' },
    special_advisor: { label: 'Special Advisor', icon: Star, color: '#8B5CF6' },
    'meeting-organizer': { label: 'Meeting Organizer', icon: Activity, color: '#F43F5E' },
    meeting_organizer: { label: 'Meeting Organizer', icon: Activity, color: '#F43F5E' },
    'official-member': { label: 'Official Member', icon: UserCircle, color: '#6B7280' },
    official_member: { label: 'Official Member', icon: UserCircle, color: '#6B7280' },
    member: { label: 'Member', icon: UserCircle, color: '#9CA3AF' },
};

const BLANK_FORM = {
    firstName: '', lastName: '', middleName: '',
    email: '', phone: '', password: '',
    role: 'member', occupation: '', residentialAddress: '', dateOfBirth: ''
};

export default function MembersPage() {
    const { hasRole, user: currentUser, ROLES, ROLE_CLASSES } = useAuth();
    const canManage = hasRole('admin', 'super_admin', 'group_leader');

    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [newMember, setNewMember] = useState(BLANK_FORM);
    const [viewMember, setViewMember] = useState(null);

    useEffect(() => { loadMembers(); }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await fetchMembers();
            setMembers(data.map(m => ({ ...m, id: m._id || m.id })));
        } catch {
            toast.error('Failed to load member registry');
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m => {
        const q = searchTerm.toLowerCase();
        const matchSearch = (m.name || '').toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q) ||
            (m.phone || '').includes(q);
        const matchRole = roleFilter === 'all' || m.role === roleFilter;
        return matchSearch && matchRole;
    });

    const handleAddMember = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const created = await createMember(newMember);
            toast.success(`Brother ${created.name} inducted into the registry!`);
            setMembers(prev => [{ ...created, id: created._id }, ...prev]);
            setShowAddModal(false);
            setNewMember(BLANK_FORM);
        } catch (err) {
            toast.error(err.message || 'Failed to induct member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (member) => {
        const nextStatus = member.status === 'active' ? 'suspended' : 'active';
        try {
            const updated = await updateMemberStatus(member.id, nextStatus);
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: updated.status } : m));
            toast.success(`${member.name} has been ${nextStatus === 'active' ? 'activated' : 'deactivated'}`);
        } catch {
            toast.error('Failed to update member status');
        }
    };

    const handleDelete = async (member) => {
        try {
            await deleteMember(member.id);
            setMembers(prev => prev.filter(m => m.id !== member.id));
            toast.success(`${member.name} permanently removed from registry`);
            setConfirmDelete(null);
        } catch {
            toast.error('Failed to remove member');
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Zap className="animate-pulse text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest">Synchronizing Brotherhood Registry...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#E8820C] uppercase tracking-[0.3em] mb-2">
                        <Users size={14} /> Brotherhood Directory ({filteredMembers.length} {filteredMembers.length !== members.length ? `/ ${members.length}` : 'members'})
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#1A1A2E] dark:text-white tracking-tight">Brotherhood Registry</h1>
                    <p className="text-sm text-black/40 dark:text-white/40 font-medium">Complete brotherhood directory with real-time status management</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="group relative px-8 py-4 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E8820C] to-[#F5A623] opacity-0 group-hover:opacity-10 transition-opacity" />
                        <span className="relative flex items-center gap-3"><UserPlus size={18} /> Induct New Brother</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 group-focus-within:text-[#E8820C] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold text-[#1A1A2E] dark:text-white shadow-sm outline-none focus:ring-4 focus:ring-[#E8820C]/10 focus:border-[#E8820C]/30 transition-all placeholder:text-black/20 dark:placeholder:text-white/20"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20" size={18} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.5rem] pl-14 pr-6 py-5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] dark:text-white shadow-sm outline-none focus:ring-4 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Roles</option>
                        {Object.entries(roleBadge).map(([role, { label }]) => (
                            <option key={role} value={role}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Member Grid */}
            {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.map((member) => {
                        const badge = roleBadge[member.role] || roleBadge.member;
                        const Icon = badge.icon;
                        const initials = (member.name || 'RR').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const isActive = member.status === 'active';
                        const isSelf = member._id === currentUser?.id || member.id === currentUser?.id;

                        return (
                            <div
                                key={member.id}
                                onClick={() => setViewMember(member)}
                                className="group bg-white dark:bg-white/5 rounded-[2.5rem] p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                    {/* Avatar */}
                                    <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-xl font-serif font-black shadow-xl relative overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, #1A1A2E, #2D2D4E)` }}>
                                        {member.facialUpload ? (
                                            <img src={member.facialUpload} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C] to-transparent opacity-20" />
                                                <span className="relative z-10">{initials}</span>
                                            </>
                                        )}
                                        {/* Status dot */}
                                        <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-colors ${isActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-gray-400'}`} />
                                    </div>

                                    <div className="space-y-1 w-full">
                                        <h3 className="text-base font-serif font-black text-[#1A1A2E] dark:text-white leading-tight truncate">{member.name}</h3>
                                        <span
                                            className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                                            style={{ backgroundColor: `${badge.color}15`, color: badge.color, borderColor: `${badge.color}25` }}
                                        >
                                            <Icon size={10} /> {badge.label}
                                        </span>
                                    </div>

                                    <div className="w-full pt-4 border-t border-black/5 dark:border-white/10 space-y-2.5">
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-black/40 dark:text-white/40">
                                            <div className="w-7 h-7 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                <Phone size={13} className="text-black/20 dark:text-white/20" />
                                            </div>
                                            <span className="truncate">{member.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-black/40 dark:text-white/40">
                                            <div className="w-7 h-7 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                <Mail size={13} className="text-black/20 dark:text-white/20" />
                                            </div>
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <div className={`w-full text-center py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                        {member.status || 'active'}
                                    </div>

                                    {/* Action buttons */}
                                    {canManage && !isSelf && (
                                        <div className="flex items-center gap-2 w-full pt-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleToggleStatus(member)}
                                                title={isActive ? 'Deactivate' : 'Activate'}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${isActive ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100'}`}
                                            >
                                                {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                {isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(member)}
                                                title="Remove Member"
                                                className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-black/5 dark:border-white/10 space-y-6 text-center">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center text-black/10 dark:text-white/10">
                        <Users size={48} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-serif font-black text-[#1A1A2E] dark:text-white">No Members Found</h3>
                        <p className="text-sm text-black/30 dark:text-white/30 font-medium">No brothers match the current filters.</p>
                    </div>
                    <button
                        onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-[#E8820C] hover:bg-[#E8820C]/10 rounded-xl transition-all"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
                    <div className="relative bg-white dark:bg-[#0B1221] w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-200 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
                            <Trash2 size={28} className="text-red-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-serif font-black text-[#1A1A2E] dark:text-white">Confirm Removal</h3>
                            <p className="text-sm text-black/50 dark:text-white/50">Are you sure you want to permanently remove <strong>{confirmDelete.name}</strong> from the registry? This cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl text-sm font-bold text-black/50 dark:text-white/50 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/30">Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Info Modal */}
            {viewMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setViewMember(null)} />
                    <div className="relative bg-white dark:bg-[#0B1221] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setViewMember(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-black/30">
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-28 h-28 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10">
                                {viewMember.facialUpload ? (
                                    <img src={viewMember.facialUpload} alt={viewMember.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#1A1A2E] flex items-center justify-center text-white text-3xl font-serif font-black">
                                        {(viewMember.name || 'RR').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="text-center space-y-1">
                                <h3 className="text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">{viewMember.name}</h3>
                                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 text-[#E8820C]">
                                    {roleBadge[viewMember.role]?.label || 'Member'}
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                {[
                                    { icon: Mail, label: 'Email', value: viewMember.email },
                                    { icon: Phone, label: 'Phone', value: viewMember.phone || 'N/A' },
                                    { icon: Briefcase, label: 'Occupation', value: viewMember.occupation || 'Not specified' },
                                    { icon: MapPin, label: 'Address', value: viewMember.residentialAddress || 'Not specified' },
                                    { icon: Activity, label: 'Status', value: viewMember.status, color: viewMember.status === 'active' ? 'text-emerald-500' : 'text-amber-500' }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/20 dark:text-white/20">
                                            <item.icon size={12} /> {item.label}
                                        </div>
                                        <p className={`text-xs font-bold truncate ${item.color || 'text-[#1A1A2E] dark:text-white'}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {canManage && (
                                <div className="w-full p-4 rounded-2xl bg-[#FFF8F0] dark:bg-[#E8820C]/10 border border-[#E8820C]/10">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#E8820C] mb-2">
                                        <ShieldCheck size={14} /> Administrative Actions
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { handleToggleStatus(viewMember); setViewMember(null); }}
                                            className="flex-1 py-3 rounded-xl bg-white dark:bg-white/10 text-[9px] font-black uppercase tracking-widest text-[#1A1A2E] dark:text-white shadow-sm hover:bg-gray-50 transition-all border border-black/5"
                                        >
                                            {viewMember.status === 'active' ? 'Deactivate Member' : 'Activate Member'}
                                        </button>
                                        <button
                                            onClick={() => { setConfirmDelete(viewMember); setViewMember(null); }}
                                            className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white dark:bg-[#0B1221] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white dark:bg-[#0B1221] z-10 py-1">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">Brother Induction</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Formal Registry Entry</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl transition-colors text-black/30 dark:text-white/30">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {[['First Name', 'firstName', 'text'], ['Last Name', 'lastName', 'text']].map(([label, key, type]) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest ml-1">{label} *</label>
                                        <input type={type} required value={newMember[key]} maxLength={100}
                                            onChange={e => setNewMember({ ...newMember, [key]: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 focus:bg-white dark:focus:bg-white/10 transition-all outline-none"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest ml-1">Middle Name</label>
                                <input type="text" value={newMember.middleName} maxLength={100}
                                    onChange={e => setNewMember({ ...newMember, middleName: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 outline-none transition-all"
                                />
                            </div>

                            {[
                                ['Email Address', 'email', 'email', true],
                                ['Phone Number', 'phone', 'tel', true],
                            ].map(([label, key, type, req]) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest ml-1">{label}{req ? ' *' : ''}</label>
                                    <input type={type} required={req} value={newMember[key]} maxLength={100}
                                        onChange={e => setNewMember({ ...newMember, [key]: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 outline-none transition-all"
                                    />
                                </div>
                            ))}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest ml-1 flex items-center gap-1.5"><KeyRound size={12} /> Password *</label>
                                <input type="password" required minLength={8} maxLength={64} value={newMember.password}
                                    onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                                    placeholder="Min 8 characters"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest ml-1">Role</label>
                                <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {Object.entries(ROLES).map(([key, value]) => (
                                        <option key={value} value={value}>
                                            {ROLE_CLASSES[value]?.label || value.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Briefcase size={12} /> Occupation</label>
                                <input type="text" value={newMember.occupation} maxLength={100}
                                    onChange={e => setNewMember({ ...newMember, occupation: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest ml-1 flex items-center gap-1.5"><MapPin size={12} /> Address</label>
                                <input type="text" value={newMember.residentialAddress} maxLength={200}
                                    onChange={e => setNewMember({ ...newMember, residentialAddress: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 outline-none transition-all"
                                />
                            </div>

                            <div className="p-5 rounded-2xl bg-[#FFF8F0] dark:bg-[#E8820C]/10 border border-[#E8820C]/10 space-y-1">
                                <h5 className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Security Protocol</h5>
                                <p className="text-[10px] text-black/50 dark:text-white/40 leading-relaxed font-bold">Inducting a new brother is a sacred administrative act. Ensure the identity is verified before finalizing.</p>
                            </div>

                            <button type="submit" disabled={submitting}
                                className="w-full py-5 rounded-2xl bg-[#1A1A2E] dark:bg-[#3B82F6] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Processing...' : 'Finalize Registry Entry'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
