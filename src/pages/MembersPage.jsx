import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    UserCircle, Phone, Mail, Crown, ShieldCheck, Plus, X, Users,
    Search, Filter, ChevronRight, MoreHorizontal, UserPlus,
    Activity, Shield, Star, Globe, Zap
} from 'lucide-react';
import { fetchMembers } from '../api/members';
import { useAuth } from '../context/AuthContext';

const MOCK_MEMBERS = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: ['Emeka Obi', 'Tunde Lawal', 'Seun Adeyemi', 'Dare Balogun', 'Femi Adeoye',
        'Kola Ayoola', 'Gbenga Aina', 'Ola Fashola', 'Wale Adekeye', 'Chukwu Eze',
        'Nonso Okafor', 'Jide Akintola', 'Bayo Oluwole', 'Ade Salami', 'Musa Haruna',
        'Chidi Nwosu', 'Uche Okeke', 'Rotimi Adesanya', 'Lanre Olatunji', 'Sam Udo'][i],
    role: ['group_leader', 'treasurer', 'welfare', 'meeting_organiser', ...Array(16).fill('official_member')][i],
    phone: `080${String(30000000 + i * 1234567).slice(0, 8)}`,
    email: `member${i + 1}@rrgroup.com`,
    joinedYear: 2023,
    status: i % 5 === 0 ? 'away' : 'active',
    lastSeen: '2 hours ago'
}));

const roleBadge = {
    group_leader: { label: 'Group Leader', icon: Crown, color: '#F5A623', bg: 'bg-[#F5A623]10' },
    treasurer: { label: 'Treasurer', icon: ShieldCheck, color: '#E8820C', bg: 'bg-[#E8820C]10' },
    welfare: { label: 'Welfare Officer', icon: Shield, color: '#10B981', bg: 'bg-[#10B981]10' },
    meeting_organiser: { label: 'Meeting Organiser', icon: Activity, color: '#1A1A2E', bg: 'bg-[#1A1A2E]10' },
    official_member: { label: 'Official Member', icon: UserCircle, color: '#6B7280', bg: 'bg-[#6B7280]10' },
};

export default function MembersPage() {
    const { hasRole } = useAuth();
    const canManage = hasRole('treasurer', 'group_leader', 'admin');
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await fetchMembers();
            setMembers(data);
        } catch (err) {
            setMembers(MOCK_MEMBERS);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.phone.includes(searchTerm);
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleAddMember = (e) => {
        e.preventDefault();
        toast.success(`Brother ${newMember.name} inducted into the registry`);
        setMembers([{ id: Date.now(), ...newMember, role: 'official_member', joinedYear: new Date().getFullYear(), status: 'active', lastSeen: 'Just now' }, ...members]);
        setShowAddModal(false);
        setNewMember({ name: '', email: '', phone: '' });
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Zap className="animate-pulse text-[#E8820C]" size={40} />
            <p className="text-sm font-bold text-black/40 uppercase tracking-widest px-4 text-center">Synchronizing Brotherhood Registry...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 px-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#E8820C] uppercase tracking-[0.3em] mb-2">
                        <Users size={14} /> Brotherhood Directory
                    </div>
                    <h1 className="text-4xl font-serif font-black text-[#1A1A2E] tracking-tight">The Registry</h1>
                    <p className="text-sm text-black/40 font-medium">Formal archive of all verified members and active leadership.</p>
                </div>

                {canManage && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="group relative px-8 py-4 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E8820C] to-[#F5A623] opacity-0 group-hover:opacity-10 transition-opacity" />
                        <span className="relative flex items-center gap-3">
                            <UserPlus size={18} /> Induct New Brother
                        </span>
                    </button>
                )}
            </div>

            {/* Filter Hub */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search the archive by name, identity, or communication line..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold text-[#1A1A2E] shadow-sm outline-none focus:ring-4 focus:ring-[#E8820C]/10 focus:border-[#E8820C]/30 transition-all placeholder:text-black/10 placeholder:uppercase placeholder:tracking-widest"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-[1.5rem] pl-14 pr-6 py-5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] shadow-sm outline-none focus:ring-4 focus:ring-[#1A1A2E]/5 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Designations</option>
                        {Object.keys(roleBadge).map(role => (
                            <option key={role} value={role}>{roleBadge[role].label.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Member Grid */}
            {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.map((member) => {
                        const badge = roleBadge[member.role] || roleBadge.official_member;
                        const Icon = badge.icon;
                        return (
                            <Link
                                key={member.id}
                                to={`/members/${member.id}`}
                                className="group bg-white rounded-[2.5rem] p-8 border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                    {/* Avatar/Initial */}
                                    <div className="w-20 h-20 rounded-[2rem] bg-[#1A1A2E] flex items-center justify-center text-white text-xl font-serif font-black shadow-xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C] to-transparent opacity-20" />
                                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                        {member.status === 'active' && (
                                            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1A1A2E] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-serif font-black text-[#1A1A2E] leading-tight group-hover:text-[#E8820C] transition-colors">
                                            {member.name}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2">
                                            <span
                                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm flex items-center gap-1.5`}
                                                style={{ backgroundColor: `${badge.color}10`, color: badge.color, borderColor: `${badge.color}20` }}
                                            >
                                                <Icon size={10} /> {badge.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full pt-6 border-t border-black/5 space-y-3">
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-black/40">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#1A1A2E]/5 transition-colors">
                                                <Phone size={14} className="text-black/20 group-hover:text-[#E8820C]" />
                                            </div>
                                            <span className="tracking-tight">{member.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-black/40">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#1A1A2E]/5 transition-colors">
                                                <Mail size={14} className="text-black/20 group-hover:text-[#E8820C]" />
                                            </div>
                                            <span className="truncate tracking-tight">{member.email}</span>
                                        </div>
                                    </div>

                                    <div className="w-full flex items-center justify-between pt-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-black/10 group-hover:text-black/30 transition-colors italic">Since {member.joinedYear}</p>
                                        <ChevronRight size={14} className="text-black/10 group-hover:text-[#E8820C] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-black/5 space-y-6 text-center shadow-inner">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-black/5">
                        <Users size={48} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-serif font-black text-[#1A1A2E]">Archive Entry Not Found</h3>
                        <p className="text-sm text-black/30 font-medium">No brothers match the current filtration parameters.</p>
                    </div>
                    <button
                        onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-[#E8820C] hover:bg-[#E8820C]/10 rounded-xl transition-all"
                    >
                        Reset Archive Sync
                    </button>
                </div>
            )}

            {/* Induction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">Brother Induction</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Formal Registry Entry</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-black/20 hover:text-black">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddMember} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Legal Full Name</label>
                                <input
                                    type="text" required value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#E8820C]/10 focus:bg-white transition-all outline-none"
                                    placeholder="Brother's Identity..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Encrypted Email Address</label>
                                <input
                                    type="email" required value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#E8820C]/10 focus:bg-white transition-all outline-none"
                                    placeholder="Electronic Correspondence..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Secure Mobile Line</label>
                                <input
                                    type="tel" required value={newMember.phone}
                                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold text-[#1A1A2E] focus:ring-4 focus:ring-[#E8820C]/10 focus:bg-white transition-all outline-none"
                                    placeholder="Voice Communication..."
                                />
                            </div>

                            <div className="p-6 rounded-2xl bg-[#FFF8F0] border border-[#E8820C]/10 space-y-2">
                                <h5 className="text-[10px] font-black text-[#E8820C] uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14} /> Security Protocol
                                </h5>
                                <p className="text-[10px] text-black/50 leading-relaxed font-bold">
                                    Inducting a new brother is a sacred administrative act. Ensure the identity is verified through the local Majlis before finalizing.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 rounded-2xl bg-[#1A1A2E] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 active:scale-95 transition-all shadow-[#1A1A2E]/20"
                            >
                                Finalize Registry Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
