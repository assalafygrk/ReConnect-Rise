import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    UserCircle, Phone, Mail, Crown, ShieldCheck, Plus, X, Users,
    Search, Filter, ChevronRight, UserPlus, Shield, Activity, Zap, Star
} from 'lucide-react';
import { fetchMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

const roleBadge = {
    admin: { label: 'Administrator', icon: Crown, color: '#DC2626', bg: 'bg-red-50' },
    group_leader: { label: 'Group Leader', icon: Crown, color: '#F5A623', bg: 'bg-[#F5A623]10' },
    treasurer: { label: 'Treasurer', icon: ShieldCheck, color: '#E8820C', bg: 'bg-[#E8820C]10' },
    welfare_officer: { label: 'Welfare Officer', icon: Shield, color: '#10B981', bg: 'bg-[#10B981]10' },
    meeting_organiser: { label: 'Meeting Organiser', icon: Activity, color: '#1A1A2E', bg: 'bg-[#1A1A2E]10' },
    member: { label: 'Official Member', icon: UserCircle, color: '#6B7280', bg: 'bg-[#6B7280]10' },
};

export default function MembersPage() {
    const { hasRole, ROLES } = useAuth();
    const { config } = usePageConfig('members');
    const isAdmin = hasRole('admin');
    const canManage = hasRole(ROLES.GROUP_LEADER, ROLES.ADMIN);

    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMember, setNewMember] = useState({ firstName: '', middleName: '', lastName: '', email: '', phone: '', password: 'Password123' });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await fetchMembers();
            setMembers(data);
        } catch (err) {
            toast.error('Registry synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member => {
        const name = member.name || '';
        const email = member.email || '';
        const phone = member.phone || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.includes(searchTerm);
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleAddMember = async (e) => {
        e.preventDefault();
        // Since we don't have a direct "admin create member" API, we might use apiRegister 
        // but that's for the user themselves. Let's assume for now this is a conceptual induction.
        toast.error('Direct Induction API not yet implemented. Use Registration portal.');
        setShowAddModal(false);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Zap className="animate-pulse text-[#E8820C]" size={40} />
            <p className="text-sm font-black text-black/40 uppercase tracking-widest px-4 text-center">Synchronizing Brotherhood Registry...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-12 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-[#E8820C] uppercase tracking-[0.4em]">
                        <Users size={16} /> Brotherhood Registry
                    </div>
                    <h1 className="text-5xl font-serif font-black text-[#1A1A2E] tracking-tight">{config.pageHeadline}</h1>
                    <p className="text-sm text-black/40 font-medium max-w-xl">{config.pageSubtitle}</p>
                </div>

                {canManage && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="group px-10 py-5 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:-translate-y-1 active:scale-95 transition-all"
                    >
                        <span className="flex items-center gap-3">
                            <UserPlus size={18} /> Induct Brother
                        </span>
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search the archive..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold text-[#1A1A2E] shadow-sm outline-none focus:ring-4 focus:ring-[#E8820C]/10 focus:border-[#E8820C]/30 transition-all placeholder:text-black/10 placeholder:uppercase"
                    />
                </div>
                <div className="relative min-w-[240px]">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-[1.5rem] pl-14 pr-6 py-5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] shadow-sm outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">Global Search</option>
                        {Object.keys(roleBadge).map(role => (
                            <option key={role} value={role}>{roleBadge[role].label.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredMembers.map((member) => {
                    const badge = roleBadge[member.role] || roleBadge.member;
                    const Icon = badge.icon;
                    return (
                        <div
                            key={member._id}
                            className="group bg-white rounded-[2.5rem] p-10 border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="w-24 h-24 mx-auto rounded-[2rem] bg-[#1A1A2E] flex items-center justify-center text-white text-3xl font-serif font-black shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C] to-transparent opacity-20" />
                                    {(member.name || 'U').charAt(0)}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-serif font-black text-[#1A1A2E] leading-tight truncate">
                                        {member.name}
                                    </h3>
                                    <div className="flex justify-center">
                                        <span
                                            className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border shadow-inner"
                                            style={{ backgroundColor: `${badge.color}10`, color: badge.color, borderColor: `${badge.color}20` }}
                                        >
                                            <Icon size={12} /> {badge.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-black/5">
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">Communication</p>
                                        <p className="text-xs font-bold text-[#1A1A2E]">{member.phone || 'NO SECURE LINE'}</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">Electronic Mail</p>
                                        <p className="text-xs font-bold text-black/40 truncate w-full px-4">{member.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/80 backdrop-blur-xl">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-serif font-black text-[#1A1A2E]">Induction</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Authorized Registry Entry</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-4 bg-gray-50 rounded-2xl text-black/20 hover:text-black transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm font-medium text-black/40 mb-8 leading-relaxed">
                            To maintain the integrity of the Brotherhood Registry, all new inductions must be processed through the secure registration portal by the member themselves.
                        </p>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="w-full py-6 rounded-2xl bg-[#1A1A2E] text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
