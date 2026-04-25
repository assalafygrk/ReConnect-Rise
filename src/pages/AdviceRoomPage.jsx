import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus, X, Search, ThumbsUp, Sparkles, Zap, Users as UsersIcon, Target, ShieldCheck, Loader2, Compass, Fingerprint, Mic, Square
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import { fetchVisions, createVision, upvoteVision } from '../api/visions';

const CATEGORIES = [
    { id: 'all', label: 'Universal Visions', icon: Sparkles },
    { id: 'finance', label: 'Fiscal Strategy', icon: Zap },
    { id: 'community', label: 'Social Impact', icon: UsersIcon },
    { id: 'operations', label: 'Operational Excellence', icon: Target },
    { id: 'security', label: 'Institutional Trust', icon: ShieldCheck },
];

export default function AdviceRoomPage() {
    const { user } = useAuth();
    const { config } = usePageConfig('advice');

    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSubmissionCategory, setActiveSubmissionCategory] = useState('community');
    const [isRecording, setIsRecording] = useState(false);

    const loadIdeas = async () => {
        setLoading(true);
        try {
            const data = await fetchVisions();
            setIdeas(data);
        } catch (err) {
            toast.error('Failed to access oracle');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIdeas();
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;
        setSubmitting(true);
        try {
            await createVision(inputText, activeSubmissionCategory);
            toast.success('Vision transmitted for verification.');
            setShowProposalModal(false);
            setInputText('');
            loadIdeas();
        } catch (err) {
            toast.error('Submission failure');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = async (id) => {
        try {
            const data = await upvoteVision(id);
            setIdeas(ideas.map(idea => idea._id === id ? { ...idea, upvotes: data.upvotes } : idea));
            toast.success('Vision supported');
        } catch (err) {
            toast.error(err.message || 'Failed to support vision');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <Loader2 size={48} className="animate-spin text-[#E8820C]" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1A1A2E]/40">Accessing Oracle...</p>
            </div>
        );
    }

    const filteredIdeas = ideas.filter(idea => 
        (idea.content || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'all' || idea.category === selectedCategory)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-16 pb-24 p-4 md:p-8">
            <div className="relative min-h-[300px] flex items-center justify-center text-center p-12 rounded-[3rem] md:rounded-[4.5rem] bg-[#1A1A2E] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C]/10 to-transparent"></div>
                <div className="relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.5em] text-[#E8820C]"><Compass size={14} /> The Consultative Oracle</div>
                    <h2 className="text-4xl md:text-7xl font-black font-serif text-white">{config.pageHeadline || 'Strategic Consensus'}</h2>
                    <p className="text-white/40 text-xl font-serif italic max-w-2xl mx-auto">"Institutional wisdom arises from collective consultation."</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-8 space-y-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-6 py-3.5 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-[#E8820C] text-white shadow-xl' : 'bg-white text-black/40 border border-black/5'}`}>{cat.label}</button>
                            ))}
                        </div>
                        <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={18} />
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search visions..." className="w-full bg-white border-0 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase outline-none shadow-xl shadow-black/5" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {filteredIdeas.length === 0 ? (
                            <div className="py-32 text-center opacity-40">
                                <Sparkles size={48} className="mx-auto mb-4 text-[#1A1A2E]" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]">No synchronized visions found</p>
                            </div>
                        ) : (
                            filteredIdeas.map((idea, idx) => (
                                <div key={idx} className="bg-white rounded-[3rem] p-12 shadow-xl border border-black/5">
                                    <p className="text-2xl font-serif italic text-black/70 leading-relaxed mb-8">"{idea.content}"</p>
                                    <div className="flex justify-between items-center pt-8 border-t border-black/5">
                                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#1A1A2E] text-[#F5A623] flex items-center justify-center font-serif">{idea.author[0]}</div><span className="text-xs font-black text-[#1A1A2E]">{idea.author}</span></div>
                                        <button onClick={() => handleUpvote(idea._id)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-50 text-[#E8820C] font-black"><ThumbsUp size={18} /> {idea.upvotes}</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <button onClick={() => setShowProposalModal(true)} className="w-full py-8 rounded-[2.5rem] bg-[#E8820C] text-white font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-[#F5A623] transition-all flex items-center justify-center gap-4"><Plus size={24} /> New Vision</button>
                    <div className="bg-[#1A1A2E] rounded-[3rem] p-10 text-white shadow-2xl space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-white/5 pb-4">Institutional Protocol</h4>
                        <p className="text-white/60 italic font-serif leading-relaxed">"Every vision contributes to the grand architecture of our shared sovereignty."</p>
                    </div>
                </div>
            </div>

            {showProposalModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
                    <div className="relative bg-white rounded-[3rem] w-full max-w-2xl p-10 md:p-16 shadow-2xl">
                        <button onClick={() => setShowProposalModal(false)} className="absolute top-10 right-10 text-black/20 hover:text-black/60"><X size={24} /></button>
                        <h3 className="text-3xl font-black font-serif text-[#1A1A2E] mb-12">Submit Proposal</h3>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                    <button key={cat.id} type="button" onClick={() => setActiveSubmissionCategory(cat.id)} className={`px-5 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 transition-all ${activeSubmissionCategory === cat.id ? 'bg-[#1A1A2E] text-[#F5A623] border-[#1A1A2E]' : 'bg-gray-50 text-black/30 border-transparent'}`}>{cat.label}</button>
                                ))}
                            </div>
                            <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Draft your vision statement..." className="w-full bg-gray-50 border-0 rounded-3xl px-8 py-8 text-xl font-serif italic outline-none min-h-[200px]" required />
                            <div className="bg-gray-50 rounded-[2rem] p-6 flex items-center justify-between text-black/20 italic"><Fingerprint size={20} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Hold Mic for Voice Encryption</span><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#E8820C] border border-black/5"><Mic size={24} /></div></div>
                            <button type="submit" disabled={submitting} className="w-full py-6 rounded-[2rem] bg-[#1A1A2E] text-white font-black text-xs uppercase tracking-[0.4em] shadow-xl flex justify-center items-center gap-4">
                                {submitting ? <Loader2 className="animate-spin" /> : 'Broadcast Vision'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
