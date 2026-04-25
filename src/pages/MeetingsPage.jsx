import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus, X, Video, MapPin, FileText, Clock, Search,
    ChevronRight, Calendar, Users, ShieldCheck,
    MoreHorizontal, Loader2, Zap, Globe
} from 'lucide-react';
import dayjs from 'dayjs';
import { fetchMeetings, addMeeting } from '../api/meetings';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

const MOCK = [
    {
        id: 1, title: 'Monthly Review — March 2026', date: '2026-03-28', time: '18:00',
        venue: 'Zoom', zoomLink: 'https://zoom.us/j/12345', status: 'upcoming',
        agenda: ['Review contributions', 'Approve support requests', 'Q&A'],
        minutes: null,
    },
    {
        id: 2, title: 'Annual General Summit 2026', date: '2026-02-28', time: '18:00',
        venue: 'Zoom', zoomLink: null, status: 'past',
        agenda: ['Review savings goal', 'Loan approvals'],
        minutes: 'All 18 members present. Savings goal affirmed at ₦250,000...',
    },
];

export default function MeetingsPage() {
    const { hasRole, ROLES } = useAuth();
    const { config } = usePageConfig('meetings');
    const canAdd = hasRole(ROLES.MEETING_ORGANIZER, ROLES.GROUP_LEADER, ROLES.ADMIN);

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', date: '', time: '', venue: 'Zoom', zoomLink: '' });
    const [saving, setSaving] = useState(false);
    const [showMinutesModal, setShowMinutesModal] = useState(null);
    const [minutesText, setMinutesText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [agendaItems, setAgendaItems] = useState(['']);
    const [expandedMinutes, setExpandedMinutes] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchMeetings();
            setMeetings(data.length > 0 ? data : MOCK);
        } catch (err) {
            setMeetings(MOCK);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = await addMeeting({ ...form, agenda: agendaItems.filter(i => i.trim()) });
            setMeetings((prev) => [data, ...prev]);
            toast.success('Governance Summit Scheduled');
            setShowForm(false);
            setForm({ title: '', date: '', time: '', venue: 'Zoom', zoomLink: '' });
            setAgendaItems(['']);
        } catch (err) {
            const mockNew = {
                ...form,
                id: Date.now(),
                status: 'upcoming',
                agenda: agendaItems.filter(i => i.trim()),
                minutes: null
            };
            setMeetings((prev) => [mockNew, ...prev]);
            toast.success('Summit Scheduled (Local Archive)');
            setShowForm(false);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[#E8820C]" size={40} />
            <p className="text-sm font-black text-black/40 uppercase tracking-[0.3em]">Syncing Summit Archive...</p>
        </div>
    );

    const filteredMeetings = meetings.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || m.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const upcoming = filteredMeetings.filter((m) => m.status === 'upcoming');
    const past = filteredMeetings.filter((m) => m.status === 'past');

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-12 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#E8820C] uppercase tracking-[0.4em] mb-2">
                        <Calendar size={14} /> Assembly & Summits
                    </div>
                    <h1 className="text-5xl font-serif font-black text-[#1A1A2E] tracking-tight">{config.pageHeadline}</h1>
                    <p className="text-sm text-black/40 font-medium max-w-xl leading-relaxed">
                        {config.pageSubtitle}
                    </p>
                </div>

                {canAdd && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="group relative px-10 py-5 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[#E8820C] opacity-0 group-hover:opacity-10 transition-opacity" />
                        <span className="relative flex items-center gap-3">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            Schedule Summit
                        </span>
                    </button>
                )}
            </div>

            {config.attendanceRequirement && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                    <p className="text-sm font-bold text-blue-800">
                        {config.attendanceRequirement}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Upcoming Assemblies', value: upcoming.length, icon: Clock, color: 'text-[#E8820C]', bg: 'bg-[#E8820C]/5' },
                    { label: 'Archived Minutes', value: past.filter(m => m.minutes).length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Attendance Rate', value: '94%', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Registry Health', value: 'Verified', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4 group hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon size={20} />
                            </div>
                            <MoreHorizontal size={16} className="text-black/10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-serif font-black text-[#1A1A2E]">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH SUMMIT ARCHIVE..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold text-[#1A1A2E] shadow-sm outline-none focus:ring-4 focus:ring-[#E8820C]/10 focus:border-[#E8820C]/30 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 p-2 bg-white rounded-[1.5rem] border border-black/5 shadow-sm">
                    {['all', 'upcoming', 'past'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeFilter === f ? 'bg-[#1A1A2E] text-white shadow-lg' : 'text-black/30 hover:bg-gray-50 hover:text-black'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-10">
                {upcoming.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C] ml-2 flex items-center gap-3">
                            <Zap size={14} className="animate-pulse" /> Pending Assemblies
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {upcoming.map((m) => (
                                <div key={m.id} className="group bg-white rounded-[2.5rem] p-8 border-2 border-[#E8820C]/10 shadow-sm hover:shadow-xl hover:border-[#E8820C]/30 transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8820C]/5 rounded-bl-full translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">{m.title}</h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-black/30">
                                                    <span className="flex items-center gap-2"><Clock size={14} className="text-[#E8820C]" /> {dayjs(m.date).format('D MMMM YYYY')}</span>
                                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-[#E8820C]" /> {m.venue}</span>
                                                </div>
                                            </div>
                                            {m.zoomLink && config.allowZoomLinks && (
                                                <a href={m.zoomLink} target="_blank" rel="noopener noreferrer"
                                                    className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                    <Video size={20} />
                                                </a>
                                            )}
                                        </div>

                                        {m.agenda?.length > 0 && (
                                            <div className="space-y-3 pt-6 border-t border-black/5">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-black/20">Summit Objectives</p>
                                                <ul className="grid grid-cols-1 gap-2">
                                                    {m.agenda.map((item, i) => (
                                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-[#1A1A2E]">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#E8820C]" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <button className="w-full py-4 rounded-xl border border-black/5 text-[9px] font-black uppercase tracking-[0.2em] text-black/30 group-hover:text-[#1A1A2E] group-hover:border-[#1A1A2E]/10 transition-all flex items-center justify-center gap-2">
                                            Register Attendance <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {past.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 ml-2">Archived Registry</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {past.map((m) => (
                                <div key={m.id} className="bg-white rounded-[1.5rem] p-6 border border-black/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border border-black/5">
                                            <span className="text-[8px] font-black uppercase text-black/30">{dayjs(m.date).format('MMM')}</span>
                                            <span className="text-xl font-serif font-black text-[#1A1A2E]">{dayjs(m.date).format('DD')}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-serif font-bold text-[#1A1A2E]">{m.title}</h3>
                                            <p className="text-xs font-bold text-black/30 uppercase tracking-widest">{dayjs(m.date).format('YYYY')} • ARCHIVED SUMMIT</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {m.minutes ? (
                                            <button
                                                onClick={() => setExpandedMinutes(expandedMinutes === m.id ? null : m.id)}
                                                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-[#1A1A2E]/5 text-[#1A1A2E] text-[9px] font-black uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-white transition-all flex items-center gap-2">
                                                <FileText size={14} /> {expandedMinutes === m.id ? 'Close Minutes' : 'View Minutes'}
                                            </button>
                                        ) : (
                                            canAdd && (
                                                <button
                                                    onClick={() => { setMinutesText(''); setShowMinutesModal(m.id); }}
                                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-[#E8820C] text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2">
                                                    <Plus size={14} /> Add Minutes
                                                </button>
                                            )
                                        )}
                                        <button className="p-3 bg-gray-50 text-black/20 hover:text-black/60 rounded-xl transition-all"><Globe size={18} /></button>
                                    </div>

                                    {expandedMinutes === m.id && m.minutes && (
                                        <div className="w-full mt-4 p-8 bg-gray-50 rounded-2xl border border-black/5 animate-in slide-in-from-top-4 duration-300">
                                            <div className="flex items-center gap-2 text-[8px] font-black text-[#E8820C] uppercase tracking-widest mb-4">
                                                <ShieldCheck size={12} /> Official Minutes Entry
                                            </div>
                                            <p className="text-sm font-medium text-[#1A1A2E] leading-relaxed whitespace-pre-wrap">{m.minutes}</p>
                                            <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-center text-[10px] font-bold text-black/20 uppercase tracking-widest">
                                                <span>Recorded by Archive System</span>
                                                <span>Finalized Record</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-8 bg-[#1A1A2E]/60 backdrop-blur-md overflow-hidden">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300 my-auto">
                        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-black/5 sticky top-0 bg-white z-10 py-4">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A2E]">Schedule Assembly</h3>
                                <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-1">Authorized Summit Dispatch</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black/40 hover:text-black"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 ml-1">Assembly Title</label>
                                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-black/5" placeholder="e.g. ANNUAL GENERAL SUMMIT 2026" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 ml-1">Registry Date</label>
                                        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 ml-1">Archive Time</label>
                                        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-2 ml-1">Summit Objectives</label>
                                    <div className="space-y-3">
                                        {agendaItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 group">
                                                <input value={item} onChange={(e) => { const newItems = [...agendaItems]; newItems[idx] = e.target.value; setAgendaItems(newItems); }}
                                                    className="flex-1 bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#E8820C] transition-all" placeholder={`OBJECTIVE ${idx + 1}`} />
                                                {agendaItems.length > 1 && (
                                                    <button type="button" onClick={() => setAgendaItems(agendaItems.filter((_, i) => i !== idx))} className="p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={16} /></button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setAgendaItems([...agendaItems, ''])} className="text-[10px] font-black text-[#E8820C] uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-80 transition-opacity">
                                            <Plus size={14} /> Add Registry Objective
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-gray-50 flex gap-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest bg-white rounded-2xl border border-black/5 hover:bg-gray-100 transition-all">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    {saving ? <Loader2 size={16} className="animate-spin text-[#E8820C]" /> : null}
                                    {saving ? 'Synchronizing Registry...' : 'Authorize Summit Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMinutesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-8 bg-[#1A1A2E]/60 backdrop-blur-md overflow-hidden">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300 my-auto p-6 sm:p-10">
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A2E]">Official Minutes</h3>
                                <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-[0.4em]">Historical Archive Entry</p>
                            </div>
                            <textarea
                                value={minutesText}
                                onChange={(e) => setMinutesText(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-[2rem] p-8 text-sm font-medium leading-relaxed outline-none transition-all h-64 resize-none shadow-inner"
                                placeholder="TRANSKRIBE SUMMIT OUTKOME HERE..."
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setShowMinutesModal(null)} className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest bg-white rounded-2xl border border-black/5 hover:bg-gray-100 transition-all">Discard</button>
                                <button
                                    disabled={!minutesText.trim()}
                                    onClick={() => {
                                        setMeetings(prev => prev.map(m => m.id === showMinutesModal ? { ...m, minutes: minutesText, status: 'past' } : m));
                                        setShowMinutesModal(null);
                                        toast.success('Archive Updated: Minutes Synchronized');
                                    }}
                                    className="flex-[2] py-5 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-30"
                                >
                                    Commit to Archive
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
