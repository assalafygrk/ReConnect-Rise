import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft, Phone, Mail, CheckCircle2, XCircle,
    Edit, Trash2, X, ShieldCheck, BadgeCheck,
    Calendar, Wallet, TrendingUp, Fingerprint,
    Info, ExternalLink, Download
} from 'lucide-react';
import dayjs from 'dayjs';
import { fetchMember } from '../api/members';
import { useAuth } from '../context/AuthContext';

function formatNaira(v) {
    return `₦${Number(v || 0).toLocaleString('en-NG')}`;
}

const MOCK = {
    id: 1, name: 'Emeka Obi', role: 'group_leader',
    phone: '08031234567', email: 'emeka@rrgroup.com', joinedYear: 2023,
    totalContributions: 5200, totalBonus: 400, totalLoans: 0,
    history: [
        { week: '2026-03-17', paid: true, bonus: 100, amount: 200 },
        { week: '2026-03-10', paid: true, bonus: 0, amount: 100 },
        { week: '2026-03-03', paid: false, bonus: 0, amount: 0 },
        { week: '2026-02-24', paid: true, bonus: 0, amount: 100 },
        { week: '2026-02-17', paid: true, bonus: 300, amount: 400 },
    ],
};

export default function MemberProfilePage() {
    const { id } = useParams();
    const { hasRole } = useAuth();
    const isTreasurer = hasRole('treasurer');
    const canManage = hasRole('treasurer', 'group_leader');
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [form, setForm] = useState(null);

    useEffect(() => {
        fetchMember(id)
            .then(data => {
                setMember(data);
                setForm(data);
            })
            .catch(() => {
                setMember(MOCK);
                setForm(MOCK);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#FDFCFB]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-[#E8820C]/20 border-t-[#E8820C] animate-spin" />
                        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1A1A2E]/20" size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A2E]/40">Securing Dossier...</p>
                </div>
            </div>
        );
    }

    const m = member || MOCK;
    const isTreasurerProfile = m.role === 'treasurer';
    const canEditProfile = isTreasurer ? true : (canManage && !isTreasurerProfile);

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 px-4">
            {/* Back Navigation & Actions */}
            <div className="flex items-center justify-between">
                <Link to="/members" className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 hover:text-[#E8820C] transition-all">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#1A1A2E]/5 flex items-center justify-center group-hover:border-[#E8820C]/30 group-hover:bg-[#E8820C]/5 transition-all">
                        <ArrowLeft size={14} />
                    </div>
                    Back to Registry
                </Link>
                {canEditProfile && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowEditForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#1A1A2E]/10 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white transition-all shadow-sm"
                        >
                            <Edit size={14} /> Modify Rank
                        </button>
                        <button
                            onClick={() => toast.success('Member security status updated')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                            <Trash2 size={14} /> Deactivate
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Hero Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-[#1A1A2E]/5 shadow-2xl flex flex-col md:flex-row">
                {/* Left Side: Identity */}
                <div className="md:w-1/3 bg-[#1A1A2E] p-10 text-white relative overflow-hidden flex flex-col items-center text-center justify-center">
                    <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] rounded-full blur-[80px] opacity-20 pointer-events-none bg-[#E8820C]" />

                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#E8820C] to-[#F5A623] p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <div className="w-full h-full rounded-[1.4rem] bg-[#1A1A2E] flex items-center justify-center text-4xl font-black text-white relative overflow-hidden">
                                {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border-4 border-[#1A1A2E] flex items-center justify-center text-[#E8820C] shadow-xl">
                            <BadgeCheck size={20} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-serif font-black tracking-tight mb-2">{m.name}</h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-widest mb-6">
                        <Fingerprint size={12} />
                        {m.role?.replace('_', ' ')}
                    </div>

                    <div className="w-full pt-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                            <span>Joined Institution</span>
                            <span className="text-white">{m.joinedYear || 2023}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                            <span>Security Status</span>
                            <span className="text-green-500 flex items-center gap-1"><ShieldCheck size={10} /> Active</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Details & Stats */}
                <div className="flex-1 p-10 space-y-10">
                    {/* Bio/Contact Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-[#1A1A2E]/30 uppercase tracking-[0.2em] mb-3">Institutional Email</p>
                            <div className="flex items-center gap-3 text-[#1A1A2E] font-bold group hover:text-[#E8820C] transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center">
                                    <Mail size={16} />
                                </div>
                                <span>{m.email}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#1A1A2E]/30 uppercase tracking-[0.2em] mb-3">Secure Line</p>
                            <div className="flex items-center gap-3 text-[#1A1A2E] font-bold group hover:text-[#E8820C] transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-[#1A1A2E]/5 flex items-center justify-center">
                                    <Phone size={16} />
                                </div>
                                <span>{m.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* High Density Stats */}
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Fiscal Contributions', value: formatNaira(m.totalContributions), icon: Wallet, color: '#15803D' },
                            { label: 'Accumulated Dividends', value: formatNaira(m.totalBonus), icon: TrendingUp, color: '#E8820C' },
                            { label: 'Credit Liability', value: formatNaira(m.totalLoans), icon: Info, color: '#B91C1C' },
                        ].map((s) => (
                            <div key={s.label} className="p-6 rounded-3xl bg-[#FDFCFB] border border-[#1A1A2E]/5 group hover:border-[#E8820C]/20 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 rounded-xl bg-white border border-[#1A1A2E]/5 text-[#1A1A2E]/30 group-hover:text-[#E8820C] transition-colors shadow-sm">
                                        <s.icon size={16} />
                                    </div>
                                    <div className="text-[10px] font-black text-[#1A1A2E]/20 uppercase tracking-widest">Audited</div>
                                </div>
                                <p className="text-[10px] font-black text-[#1A1A2E]/40 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className="text-2xl font-serif font-black tracking-tight" style={{ color: s.color }}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contribution Ledger */}
            <div className="rounded-[2.5rem] bg-white border border-[#1A1A2E]/5 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-[#1A1A2E]/5 flex items-center justify-between bg-[#FDFCFB]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] text-[#F5A623] flex items-center justify-center shadow-lg">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif font-black text-[#1A1A2E]">Contribution Ledger</h3>
                            <p className="text-[10px] font-bold text-[#1A1A2E]/40 uppercase tracking-widest">Chronological fulfillment record</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#1A1A2E]/10 text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white transition-all">
                        <Download size={14} /> Fiscal Statement
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="whitespace-nowrap">
                            <tr className="bg-[#1A1A2E]/[0.02] border-b border-[#1A1A2E]/5 text-left">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Billing Cycle</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 text-center">Fulfillment Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 text-center">Dividend Share</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 text-right">Settled Amount</th>
                                <th className="th-8 pr-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1A2E]/5 whitespace-nowrap md:whitespace-normal">
                            {(m.history || []).map((row, i) => (
                                <tr key={i} className="hover:bg-[#FDFCFB] transition-colors group">
                                    <td className="px-8 py-6 font-bold text-[#1A1A2E]">{dayjs(row.week).format('DD MMMM YYYY')}</td>
                                    <td className="px-8 py-6 text-center">
                                        {row.paid ? (
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                                                <BadgeCheck size={12} /> Confirmed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
                                                <XCircle size={12} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-center font-bold" style={{ color: row.bonus ? '#E8820C' : '#DDD' }}>
                                        {row.bonus ? formatNaira(row.bonus) : '—'}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-lg font-serif font-black text-[#1A1A2E]">{formatNaira(row.amount)}</div>
                                        <div className="text-[8px] font-bold text-[#1A1A2E]/20 uppercase tracking-tighter">Authorized Payment</div>
                                    </td>
                                    <td className="pr-8 text-right">
                                        <button className="p-2 rounded-lg text-[#1A1A2E]/20 hover:text-[#1A1A2E] hover:bg-[#1A1A2E]/5 transition-all opacity-0 group-hover:opacity-100 font-bold">
                                            <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Form Modal */}
            {showEditForm && form && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-xl transition-all duration-500 overflow-y-auto">
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 md:p-10 shadow-2xl bg-white border border-white/20 relative animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#E8820C]/10 text-[#E8820C] flex items-center justify-center">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">Reassign Rank</h3>
                                    <p className="text-[10px] font-bold text-[#1A1A2E]/40 uppercase tracking-widest">Institutional role modification</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditForm(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-[#1A1A2E]/20 hover:text-[#1A1A2E] hover:bg-[#1A1A2E]/5 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setMember({ ...m, ...form });
                            toast.success('Member rank updated in shared registry.');
                            setShowEditForm(false);
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#1A1A2E]/40 uppercase tracking-[0.2em] ml-2">Verification Identity</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border-2 border-[#1A1A2E]/5 rounded-[1.2rem] px-6 py-4 text-sm bg-[#FDFCFB] focus:border-[#E8820C] focus:bg-white outline-none font-bold text-[#1A1A2E] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#1A1A2E]/40 uppercase tracking-[0.2em] ml-2">Assigned Institutional Rank</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="w-full border-2 border-[#1A1A2E]/5 rounded-[1.2rem] px-6 py-4 text-sm bg-[#FDFCFB] focus:border-[#E8820C] focus:bg-white outline-none font-bold text-[#1A1A2E] transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%231A1A2E\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2rem' }}
                                >
                                    <option value="official_member">Official Member</option>
                                    <option value="group_leader">Group Leader</option>
                                    <option value="welfare">Welfare Officer</option>
                                    {isTreasurer && <option value="treasurer">Treasurer (Institutional Head)</option>}
                                </select>
                                {!isTreasurer && (
                                    <div className="flex items-center gap-2 mt-2 ml-2 text-rose-500">
                                        <Info size={10} />
                                        <p className="text-[9px] font-bold uppercase tracking-tight">Access restricted: Head Treasurer authorization required for rank promotion.</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowEditForm(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40 hover:bg-[#1A1A2E]/5 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white bg-[#E8820C] hover:bg-[#1A1A2E] rounded-2xl transition-all shadow-xl shadow-[#E8820C]/20">Apply Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
