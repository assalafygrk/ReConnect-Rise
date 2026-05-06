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
import { usePageConfig } from '../context/PageConfigContext';

const BLANK_FORM = {
    firstName: '', lastName: '', middleName: '',
    email: '', phone: '', password: '',
    role: 'member', occupation: '', residentialAddress: '', dateOfBirth: ''
};

export default function MembersPage() {
    const { hasRole, user: currentUser, ROLES, ROLE_CLASSES } = useAuth();
    const { config } = usePageConfig('members');
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
        // Hide super_admin from the registry widget
        if (m.role === ROLES.SUPER_ADMIN) return false;

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
        } catch (err) {
            toast.error(err.message || 'Failed to update member status');
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

    const isOnline = (lastSeen) => {
        if (!lastSeen) return false;
        const diff = Date.now() - new Date(lastSeen).getTime();
        return diff < 5 * 60 * 1000; // 5 minutes threshold
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-[#E8820C]/5 border-t-[#E8820C] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[#E8820C]">
                    <Zap size={32} className="animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1A1A2E] dark:text-white/40 italic">Synchronizing Registry...</p>
                <div className="h-1 w-48 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-[#E8820C] w-1/2 animate-[progress_3s_ease-in-out_infinite]" />
                </div>
            </div>
        </div>
    );

    const activeCount = members.filter(m => isOnline(m.lastSeen)).length;

    return (
        <div className="max-w-7xl mx-auto pb-32 space-y-8 md:space-y-16 px-3 md:px-4 animate-in fade-in duration-1000">
            {/* Serious Tactical Header - Reduced Height */}
            <div className="relative bg-[#1A1A2E] dark:bg-[#0F172A] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 overflow-hidden shadow-2xl group border border-white/5">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-[#E8820C] to-[#F5A623] rounded-full blur-[150px] md:blur-[200px] opacity-[0.08] group-hover:opacity-15 transition-opacity duration-1000" />
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, #E8820C 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 md:gap-20">
                    <div className="space-y-6 md:space-y-10">
                        <div className="inline-flex items-center gap-3 md:gap-5 px-5 py-2 md:px-8 md:py-3 rounded-full bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[#E8820C]">
                            <Activity size={14} className="animate-pulse md:size-[16px]" /> Node Registry Status: Operational
                        </div>
                        <h2 className="text-4xl md:text-8xl font-black font-serif text-white leading-[0.9] tracking-tighter uppercase italic">
                            Brotherhood<br />Registry
                        </h2>
                        <p className="text-white/40 text-base md:text-xl font-serif italic max-w-2xl leading-relaxed border-l-2 md:border-l-4 border-[#E8820C]/20 pl-6 md:pl-10">
                            {config?.pageSubtitle || '"The strength of the chain is in every link. Maintaining the integrity of our registry is the first step toward sovereignty."'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4 md:gap-6 w-full lg:w-auto">
                        <div className="bg-white/5 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center group/stat">
                            <p className="text-4xl md:text-6xl font-black text-white italic group-hover:text-[#E8820C] transition-colors">{members.length}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/30 mt-2 md:mt-4">Total Active Nodes</p>
                        </div>
                        <div className="bg-[#E8820C] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-[#E8820C]/20 flex flex-col items-center text-center group/stat hover:-translate-y-2 transition-all">
                            <p className="text-4xl md:text-6xl font-black text-white italic">{activeCount}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/50 mt-2 md:mt-4">Live Uplinks</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Bar - Reduced Padding and Sizes */}
            <div className="bg-white dark:bg-[#111827]/95 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 shadow-2xl border border-black/5 dark:border-white/10 flex flex-col lg:flex-row items-center gap-4 md:gap-8 relative z-40 -mt-10 mx-2 md:mx-10 ring-1 ring-white/5">
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 group-focus-within:text-[#E8820C] transition-all duration-500" size={18} />
                    <input
                        type="text"
                        placeholder="SCAN NODES..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C]/30 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white dark:bg-[#111827] focus:shadow-2xl transition-all shadow-inner dark:text-white"
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative group/select flex-1">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E8820C]" size={16} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C]/30 rounded-2xl pl-12 pr-8 py-4 text-[9px] font-black uppercase tracking-widest text-[#1A1A2E] dark:text-white outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">ALL NODES</option>
                            {Object.entries(ROLE_CLASSES).map(([role, { label }]) => (
                                <option key={role} value={role}>{label.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {canManage && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-4 bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 group/btn"
                        >
                            <UserPlus size={16} className="group-hover/btn:rotate-12 transition-transform" /> Induct
                        </button>
                    )}
                </div>
            </div>

            {/* Member Grid - Optimized for Mobile */}
            {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 px-2 md:px-4">
                    {filteredMembers.map((member, idx) => {
                        const badge = ROLE_CLASSES[member.role] || ROLE_CLASSES.member;
                        const Icon = badge.icon;
                        const initials = (member.name || 'RR').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        const isActive = member.status === 'active';
                        const online = isOnline(member.lastSeen);
                        const isSelf = member._id === currentUser?.id || member.id === currentUser?.id;

                        return (
                            <div
                                key={member.id}
                                onClick={() => setViewMember(member)}
                                className="group bg-white dark:bg-[#111827] rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 border border-black/5 dark:border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden cursor-pointer"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-[3] transition-transform duration-700" />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-4 md:space-y-6">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-white text-lg font-serif font-black shadow-xl relative group-hover:scale-105 transition-transform duration-500 ring-4 ring-black/5 dark:ring-white/5"
                                        style={{ background: `linear-gradient(135deg, #1A1A2E, #2D2D4E)` }}>
                                        {member.facialUpload ? (
                                            <img src={member.facialUpload} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C] to-transparent opacity-40" />
                                                <span className="relative z-10 italic text-sm md:text-base">{initials}</span>
                                            </>
                                        )}
                                        {/* Real-time Online Indicator */}
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 md:border-4 border-white dark:border-[#111827] shadow-lg transition-all duration-500 ${online ? 'bg-emerald-500 shadow-emerald-500/50 scale-110 animate-pulse' : 'bg-gray-400'}`} />
                                    </div>

                                    <div className="space-y-1.5 w-full">
                                        <h3 className="text-sm md:text-base font-serif font-black text-[#1A1A2E] dark:text-white leading-tight italic truncate group-hover:text-[#E8820C] transition-colors">{member.name}</h3>
                                        <div className="flex justify-center">
                                            <span
                                                className="inline-flex items-center gap-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm"
                                                style={{ backgroundColor: `${badge.color}10`, color: badge.color, borderColor: `${badge.color}20` }}
                                            >
                                                <Icon size={10} /> {badge.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full pt-4 border-t border-black/5 dark:border-white/10 space-y-2">
                                        <div className="flex items-center gap-3 text-[8px] md:text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">
                                            <Phone size={12} className="text-black/20 dark:text-white/20 shrink-0" />
                                            <span className="truncate">{member.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[8px] md:text-[9px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">
                                            <Mail size={12} className="text-black/20 dark:text-white/20 shrink-0" />
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                    </div>

                                    {/* Action Sector */}
                                    {canManage && !isSelf && (
                                        <div className="flex items-center gap-2 w-full pt-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleToggleStatus(member)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-90 shadow-lg ${isActive ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'}`}
                                            >
                                                {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                {isActive ? 'Susp' : 'Actv'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(member)}
                                                className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-red-500/5"
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
                <div className="flex flex-col items-center justify-center py-48 bg-white dark:bg-[#111827] rounded-[4rem] border-4 border-dashed border-black/5 dark:border-white/10 space-y-8 text-center animate-in zoom-in duration-700">
                    <div className="w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-[3.5rem] flex items-center justify-center text-black/10 dark:text-white/10 shadow-inner">
                        <Users size={64} />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-4xl font-serif font-black text-[#1A1A2E] dark:text-white italic uppercase tracking-tighter">Node Isolation</h3>
                        <p className="text-lg text-black/30 dark:text-white/30 font-serif italic">"No entities detected within the current spectral parameters."</p>
                    </div>
                    <button
                        onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
                        className="px-12 py-5 bg-[#E8820C] text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Reset Scanning Parameters
                    </button>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-[#070B14]/98 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setConfirmDelete(null)} />
                    <div className="relative bg-white dark:bg-[#111827] w-full max-w-md rounded-[4rem] p-12 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300 space-y-10 text-center">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center mx-auto shadow-inner">
                            <Trash2 size={48} className="text-red-500 animate-bounce" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-serif font-black text-[#1A1A2E] dark:text-white italic">Permanent Deletion</h3>
                            <p className="text-sm text-black/50 dark:text-white/40 font-serif italic leading-relaxed px-6">"Are you certain of this administrative action? Removing <strong>{confirmDelete.name}</strong> is an irreversible protocol."</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all active:scale-95 shadow-2xl shadow-red-600/30">Confirm Removal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Info Modal */}
            {viewMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setViewMember(null)} />
                    <div className="relative bg-white dark:bg-[#0B1221] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setViewMember(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-black/30 dark:text-white/40">
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
                                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#E8820C]">
                                    {ROLE_CLASSES[viewMember.role]?.label || 'Member'}
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
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/20 dark:text-white/30">
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
                                            className="flex-1 py-3 rounded-xl bg-white dark:bg-[#111827]/10 text-[9px] font-black uppercase tracking-widest text-[#1A1A2E] dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-all border border-black/5 dark:border-white/10"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white dark:bg-[#0B1221] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white dark:bg-[#0B1221] z-10 py-1">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1A2E] dark:text-white">Brother Induction</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Formal Registry Entry</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl transition-colors text-black/30 dark:text-white/40">
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
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 focus:bg-white dark:focus:bg-[#111827] transition-all outline-none"
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
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-[#1A1A2E] dark:text-white focus:ring-4 focus:ring-[#E8820C]/10 outline-none transition-all dark:placeholder:text-white/10"
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
