import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Send, Mic, Square, Play, Pause, Trash2, ThumbsUp,
    MessageSquare, User, Calendar, Plus, X, Search, ChevronRight,
    Volume2, CheckCircle2, History, TrendingUp, Sparkles, Filter,
    Lightbulb, Target, Users as UsersIcon, ShieldCheck, Zap, Info,
    MoreVertical, Loader2, Fingerprint, Lock, Compass
} from 'lucide-react';
import dayjs from 'dayjs';

const MOCK_CATEGORIES = [
    { id: 'all', label: 'Universal Visions', icon: Sparkles },
    { id: 'finance', label: 'Fiscal Strategy', icon: Zap },
    { id: 'community', label: 'Social Impact', icon: UsersIcon },
    { id: 'operations', label: 'Operational Excellence', icon: Target },
    { id: 'security', label: 'Institutional Trust', icon: ShieldCheck },
    { id: 'others', label: 'General Directives', icon: MoreVertical },
];

const MOCK_IDEAS = [
    {
        id: 1,
        author: 'Ola Fashola',
        content: 'We should synchronize a monthly community service initiative to optimize our group\'s external impact and brand sovereignty.',
        type: 'text',
        category: 'community',
        upvotes: 24,
        date: '2026-03-28'
    },
    {
        id: 2,
        author: 'Seun Adeyemi',
        content: 'Proposed an educational endowment fund for the brotherhood lineage to ensure intergenerational prosperity.',
        audioUrl: '#',
        type: 'voice',
        category: 'finance',
        duration: '0:45',
        upvotes: 42,
        date: '2026-03-25'
    },
    {
        id: 3,
        author: 'Kola Ayoola',
        content: 'Automated fiscal reminder protocols for contributions to maintain 100% operational liquidity.',
        type: 'text',
        category: 'operations',
        upvotes: 15,
        date: '2026-03-20'
    },
];

export default function AdviceRoomPage() {
    const [ideas, setIdeas] = useState(MOCK_IDEAS);
    const [inputText, setInputText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // WhatsApp-style Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [slideDistance, setSlideDistance] = useState(0);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const [recordedAudio, setRecordedAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSubmissionCategory, setActiveSubmissionCategory] = useState('community');

    const timerRef = useRef(null);
    const startXRef = useRef(0);

    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = (idea.content?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (idea.author.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const trendingIdeas = [...ideas].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setRecordingDuration(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartRecording = (e) => {
        if (e) {
            startXRef.current = e.clientX || e.touches?.[0].clientX || 0;
        }
        setIsRecording(true);
        setIsHolding(true);
        setSlideDistance(0);
        setIsLocked(false);
        setRecordedAudio(null);
    };

    const handleMouseMove = (e) => {
        if (!isHolding || isLocked) return;
        const currentX = e.clientX || e.touches?.[0].clientX || 0;
        const diff = startXRef.current - currentX;
        setSlideDistance(Math.max(0, diff));

        if (diff > 150) {
            cancelRecording();
        }
    };

    const cancelRecording = () => {
        setIsRecording(false);
        setIsHolding(false);
        setIsLocked(false);
        setSlideDistance(0);
        setRecordingDuration(0);
        toast.error('Voice Capture Aborted');
    };

    const handleStopRecording = () => {
        if (!isRecording) return;
        setIsRecording(false);
        setIsHolding(false);
        setIsLocked(false);
        setSlideDistance(0);

        if (recordingDuration < 1) {
            toast.error('Duration Insufficient');
            setRecordingDuration(0);
            return;
        }

        setRecordedAudio({
            url: '#',
            duration: formatDuration(recordingDuration)
        });
        toast.success('Voice Vision Encrypted');
    };

    const toggleLock = () => {
        setIsLocked(true);
        setIsHolding(false);
        setSlideDistance(0);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim() && !recordedAudio) return;

        setSubmitting(true);
        try {
            await new Promise(r => setTimeout(r, 1500)); // Simulate processing
            const newIdea = {
                id: Date.now(),
                author: 'Institutional Admin',
                content: inputText || null,
                audioUrl: recordedAudio?.url || null,
                duration: recordedAudio?.duration || null,
                type: recordedAudio ? 'voice' : 'text',
                category: activeSubmissionCategory,
                upvotes: 0,
                date: dayjs().format('YYYY-MM-DD')
            };

            setIdeas([newIdea, ...ideas]);
            setInputText('');
            setRecordedAudio(null);
            setShowProposalModal(false);
            toast.success('Vision Synchronized to Oracle');
        } catch (err) {
            toast.error('Synchronizing Failure');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = (id) => {
        setIdeas(prev => prev.map(idea =>
            idea.id === id ? { ...idea, upvotes: idea.upvotes + 1 } : idea
        ));
        toast.success('Alignment Registered');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-4 md:p-8">
            {/* Serious System Header */}
            <div className="relative h-[500px] md:h-[450px] flex items-center justify-center text-center p-12 rounded-[4.5rem] overflow-hidden bg-[#1A1A2E] shadow-2xl group border border-white/5">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 scale-110 group-hover:scale-100 transition-transform duration-[3s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/60 to-transparent"></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#E8820C] to-[#F5A623] rounded-full blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>

                <div className="relative z-10 space-y-8 max-w-4xl">
                    <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 text-[10px] font-black uppercase tracking-[0.5em] text-[#E8820C]">
                        <Compass size={14} className="animate-spin-slow" /> The Consultative Oracle
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black font-serif text-white leading-tight tracking-tighter">Strategic <br /> <span className="text-[#F5A623]">Consensus.</span></h2>
                    <p className="text-white/40 text-xl font-serif italic max-w-2xl mx-auto leading-relaxed">
                        "Institutional wisdom arises from collective consultation. Every vision statement here contributes to the grand architecture of our sovereignty."
                    </p>

                    <div className="flex items-center justify-center gap-16 pt-8">
                        <div className="text-center group/stat cursor-default">
                            <p className="text-4xl font-black text-white group-hover:text-[#F5A623] transition-colors">{ideas.length}</p>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 group-hover:text-white/50 transition-colors mt-2">Draft Visions</p>
                        </div>
                        <div className="w-px h-14 bg-white/10 hidden sm:block"></div>
                        <div className="text-center group/stat cursor-default">
                            <p className="text-4xl font-black text-white group-hover:text-[#F5A623] transition-colors">128</p>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 group-hover:text-white/50 transition-colors mt-2">Consensus Units</p>
                        </div>
                        <div className="w-px h-14 bg-white/10 hidden sm:block"></div>
                        <div className="text-center group/stat cursor-default">
                            <p className="text-4xl font-black text-white group-hover:text-[#F5A623] transition-colors">95%</p>
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 group-hover:text-white/50 transition-colors mt-2">Implementation</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* Main Content (Left) */}
                <div className="lg:col-span-8 space-y-16">

                    {/* Propose Vision FAB: Institutional Uplink */}
                    <button
                        onClick={() => setShowProposalModal(true)}
                        className="fixed bottom-12 right-12 w-24 h-24 bg-[#E8820C] text-white rounded-full shadow-[0_30px_70px_rgba(232,130,12,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white"
                    >
                        <Plus size={40} className="group-hover:rotate-90 transition-transform duration-700" strokeWidth={4} />
                        <div className="absolute right-full mr-10 py-4 px-8 bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl translate-x-10 group-hover:translate-x-0">
                            Initialize New Proposal
                        </div>
                    </button>

                    {/* Proposal Modal: The Drafting Chamber */}
                    {showProposalModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                            <div className="absolute inset-0 bg-[#1A1A2E]/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => !isRecording && !submitting && setShowProposalModal(false)}></div>
                            <div
                                className="relative bg-white rounded-[4.5rem] w-full max-w-3xl overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-12 duration-700"
                                onMouseMove={handleMouseMove}
                                onTouchMove={handleMouseMove}
                                onMouseUp={() => isHolding && !isLocked && handleStopRecording()}
                                onTouchEnd={() => isHolding && !isLocked && handleStopRecording()}
                            >
                                <div className="p-12 md:p-16 space-y-12">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-[2rem] bg-orange-50 flex items-center justify-center text-[#E8820C] shadow-inner relative group/icon">
                                                <div className="absolute inset-2 bg-[#E8820C]/10 rounded-2xl animate-pulse"></div>
                                                <Lightbulb size={36} className="relative z-10 group-hover/icon:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-[#1A1A2E] font-serif tracking-tight">Institutional Proposal</h3>
                                                <p className="text-[11px] text-[#E8820C] font-black uppercase tracking-[0.4em] mt-1 italic">Contribution to the Group Architecture</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowProposalModal(false)}
                                            className="w-14 h-14 bg-gray-50 text-black/20 hover:text-red-500 rounded-2xl transition-all flex items-center justify-center hover:rotate-90"
                                            disabled={isRecording || submitting}
                                        >
                                            <X size={28} strokeWidth={4} />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-10">
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 ml-6">Target Strategic Domain</p>
                                            <div className="flex flex-wrap gap-3">
                                                {MOCK_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() => setActiveSubmissionCategory(cat.id)}
                                                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${activeSubmissionCategory === cat.id ? 'bg-[#1A1A2E] text-[#F5A623] border-[#F5A623]/30 shadow-2xl' : 'bg-gray-50 text-black/30 border-transparent hover:border-black/5 hover:text-black/60 shadow-inner'}`}
                                                    >
                                                        <cat.icon size={14} /> {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative group/field">
                                            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-[3.5rem] blur opacity-0 group-focus-within/field:opacity-10 transition-opacity"></div>
                                            <textarea
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                disabled={isRecording || submitting}
                                                placeholder="Draft your formal vision statement here... Use the cryptographic voice uplink for complex narratives."
                                                className="relative w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/30 rounded-[3rem] px-12 py-10 text-2xl font-serif italic outline-none focus:bg-white focus:shadow-2xl transition-all min-h-[220px] resize-none shadow-inner"
                                            />
                                        </div>

                                        {/* WhatsApp Style Voice Recorder: Tactical Uplink */}
                                        <div className="relative h-24 flex items-center bg-[#1A1A2E]/5 rounded-[3rem] px-6 border-2 border-transparent focus-within:border-[#E8820C]/20 overflow-hidden shadow-inner transition-all">
                                            {isRecording ? (
                                                <div className="flex items-center w-full px-6 gap-8 animate-in slide-in-from-right-8 duration-500">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-3.5 h-3.5 bg-red-600 rounded-full animate-ping"></div>
                                                        <span className="text-[13px] font-black text-red-600 w-16 tabular-nums">{formatDuration(recordingDuration)}</span>
                                                    </div>

                                                    {!isLocked ? (
                                                        <div className="flex-1 flex items-center justify-center gap-6 text-[#1A1A2E]/20">
                                                            <div
                                                                className="flex items-center gap-3 transition-transform duration-300"
                                                                style={{ transform: `translateX(-${slideDistance}px)` }}
                                                            >
                                                                <ChevronRight size={18} className="rotate-180" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Abort Transmission</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 flex items-center gap-6 px-4">
                                                            <div className="flex gap-1.5 h-10 flex-1 items-center">
                                                                {[...Array(25)].map((_, i) => (
                                                                    <div key={i} className="flex-1 bg-red-500 rounded-full" style={{ height: `${30 + Math.random() * 70}%`, opacity: 0.3 + Math.random() * 0.7 }}></div>
                                                                ))}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={cancelRecording}
                                                                className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 hover:bg-red-50 px-5 py-3 rounded-2xl transition-all"
                                                            >
                                                                Purge
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : recordedAudio ? (
                                                <div className="flex items-center gap-6 w-full px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="flex items-center gap-6 bg-white px-8 py-3 rounded-[2rem] shadow-xl border border-black/5 flex-1 relative group/aud">
                                                        <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover/aud:opacity-10 transition-opacity"><Volume2 size={40} /></div>
                                                        <button type="button" className="w-10 h-10 bg-[#E8820C] text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"><Play size={18} fill="currentColor" className="ml-1" /></button>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] text-black/20">
                                                                <span>Voice Proposal Artifact</span>
                                                                <span className="text-[#E8820C]">{recordedAudio.duration}</span>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-black/5">
                                                                <div className="h-full bg-gradient-to-r from-[#1A1A2E] to-[#E8820C] w-[60%] rounded-full shadow-[0_0_10px_rgba(232,130,12,0.3)]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecordedAudio(null)}
                                                        className="w-14 h-14 flex items-center justify-center bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group/del"
                                                    >
                                                        <Trash2 size={24} className="group-hover/del:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between w-full px-8 text-black/20">
                                                    <div className="flex items-center gap-3">
                                                        <Fingerprint size={16} />
                                                        <span className="text-[11px] font-black uppercase tracking-[0.3em] font-serif italic">Hold for secure voice encryption, release to stage</span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                disabled={submitting}
                                                onMouseDown={handleStartRecording}
                                                onTouchStart={handleStartRecording}
                                                className={`absolute right-3 w-18 h-18 rounded-[1.5rem] flex items-center justify-center transition-all z-20 ${isRecording ? 'bg-red-600 text-white scale-125 shadow-2xl shadow-red-500/40' :
                                                    recordedAudio ? 'bg-[#1A1A2E] text-white hover:bg-black shadow-xl group/final' : 'bg-white text-[#E8820C] border border-black/10 shadow-lg hover:shadow-2xl'
                                                    }`}
                                            >
                                                {isRecording ? <Square size={28} /> : recordedAudio ? <Send size={24} className="group-hover/final:translate-x-1 group-hover/final:-translate-y-1 transition-transform" onClick={handleSubmit} /> : <Mic size={28} />}
                                            </button>

                                            {/* Lock Protocol Area */}
                                            {isRecording && !isLocked && (
                                                <div
                                                    className="absolute top-[-140px] right-3 w-18 h-32 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white flex flex-col items-center justify-start p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 group/lock"
                                                    onMouseOver={toggleLock}
                                                >
                                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center text-[#E8820C] group-hover/lock:scale-110 transition-transform">
                                                        <Lock size={20} />
                                                    </div>
                                                    <div className="mt-4 flex flex-col items-center gap-1 opacity-20">
                                                        <ChevronRight size={16} className="-rotate-90 animate-bounce" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-6 pt-6">
                                            <button
                                                type="submit"
                                                disabled={(!inputText.trim() && !recordedAudio) || isRecording || submitting}
                                                className="flex-1 py-6 rounded-[2.5rem] bg-[#1A1A2E] text-white text-[12px] font-black uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(26,26,46,0.2)] hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4 group"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 size={24} className="animate-spin text-[#F5A623]" />
                                                        Synchronizing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Broadcast Vision <Sparkles size={20} className="text-[#F5A623] group-hover:scale-125 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feed Controls: Tactical Sorters */}
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl border border-black/5 text-[#1A1A2E] flex items-center justify-center shadow-inner group/his">
                                    <History size={24} className="group-hover/his:rotate-[-45deg] transition-transform duration-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#1A1A2E] font-serif leading-none tracking-tight">Visions & Consensus</h3>
                                    <p className="text-[10px] text-black/30 font-black uppercase tracking-[0.4em] mt-2">Active Intelligence Cycle</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full md:max-w-xl relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" size={20} />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Analyze historical consensus data..."
                                    className="w-full bg-white border-2 border-transparent focus:border-[#E8820C]/20 rounded-[2rem] pl-16 pr-8 py-5 text-[11px] font-black uppercase tracking-widest outline-none shadow-2xl shadow-black/[0.03] transition-all placeholder:text-black/10"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pb-4 overflow-x-auto scrollbar-hide">
                            {MOCK_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-3 px-8 py-4.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 ${selectedCategory === cat.id ? 'bg-[#E8820C] text-white shadow-2xl shadow-[#E8820C]/30 border-transparent' : 'bg-white text-black/40 border border-black/5 hover:border-black/20 hover:text-black/70 shadow-xl shadow-black/[0.02]'}`}
                                >
                                    <cat.icon size={16} /> {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ideas List: The Ledger of Minds */}
                    <div className="space-y-12">
                        {filteredIdeas.map((idea, idx) => (
                            <div
                                key={idea.id}
                                className="group bg-white rounded-[4rem] p-12 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-black/5 relative flex flex-col hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-700 overflow-hidden"
                                style={{ animationDelay: `${idx * 200}ms` }}
                            >
                                <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-[#E8820C] to-[#1A1A2E] opacity-[0.05] group-hover:opacity-100 transition-opacity duration-1000"></div>
                                <div className="absolute top-0 right-0 p-16 text-black/[0.01] group-hover:text-black/[0.03] translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-all duration-1000 rotate-12">
                                    <Sparkles size={250} />
                                </div>

                                <div className="flex flex-col sm:flex-row items-start justify-between gap-10 mb-12 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group/prof">
                                            <div className="w-20 h-20 rounded-[2rem] bg-[#1A1A2E] text-[#F5A623] flex items-center justify-center text-2xl font-serif italic shadow-2xl relative z-10 group-hover/prof:scale-105 transition-transform">
                                                {idea.author.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="absolute -inset-3 bg-[#E8820C]/10 rounded-[2.5rem] blur opacity-0 group-hover/prof:opacity-100 transition-opacity"></div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg z-20">
                                                <ShieldCheck size={14} className="text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black text-[#1A1A2E] font-serif tracking-tight leading-none group-hover:text-[#E8820C] transition-colors">{idea.author}</h4>
                                            <div className="flex items-center gap-4 mt-3">
                                                <p className="text-[10px] text-black/30 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <Calendar size={14} className="text-[#E8820C]" /> {dayjs(idea.date).format('DD MMM YYYY')}
                                                </p>
                                                <div className="w-1 h-1 rounded-full bg-black/10"></div>
                                                <p className="text-[10px] text-black/30 font-black uppercase tracking-[0.3em]">Institutional ID: {idea.id.toString().slice(-4)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-black/5 bg-gray-50 text-black/50 shadow-inner">
                                            {MOCK_CATEGORIES.find(c => c.id === idea.category)?.label}
                                        </div>
                                        <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 ${idea.type === 'voice' ? 'bg-[#E8820C]/10 border-[#E8820C]/20 text-[#E8820C]' : 'bg-[#1A1A2E]/5 border-[#1A1A2E]/10 text-[#1A1A2E]/40'}`}>
                                            {idea.type === 'voice' ? 'Audio Encryption' : 'Formal Script'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 mb-16 relative z-10">
                                    {idea.type === 'text' ? (
                                        <div className="relative pl-12">
                                            <span className="absolute left-0 top-0 text-9xl text-[#E8820C]/5 font-serif -translate-y-8 select-none">"</span>
                                            <p className="text-3xl font-serif italic text-black/70 leading-[1.6] relative z-10 group-hover:text-[#1A1A2E] transition-colors duration-500">
                                                {idea.content}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-10 bg-gray-50/50 p-10 rounded-[3.5rem] border-2 border-black/5 group/player relative overflow-hidden shadow-inner hover:bg-white hover:border-[#E8820C]/20 transition-all duration-700">
                                                <div className="absolute top-0 right-0 p-10 opacity-[0.02] -rotate-12 translate-x-5 -translate-y-5 transition-all duration-1000 group-hover/player:translate-x-0 group-hover/player:translate-y-0"><Volume2 size={200} /></div>
                                                <button
                                                    onClick={() => setIsPlaying(isPlaying === idea.id ? null : idea.id)}
                                                    className="w-24 h-24 rounded-[2rem] bg-[#1A1A2E] text-white flex items-center justify-center shadow-[0_20px_40px_rgba(26,26,46,0.3)] hover:scale-105 active:scale-95 transition-all shrink-0 z-10 relative overflow-hidden group/btn"
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-br from-[#E8820C] to-[#F5A623] transition-opacity duration-700 ${isPlaying === idea.id ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                                                    {isPlaying === idea.id ? <Pause size={40} fill="currentColor" className="relative z-10" /> : <Play size={40} className="ml-1.5 relative z-10" fill="currentColor" />}
                                                </button>
                                                <div className="flex-1 space-y-5 z-10">
                                                    <div className="flex justify-between items-center px-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${isPlaying === idea.id ? 'bg-[#E8820C] animate-ping' : 'bg-black/10'}`}></div>
                                                            <span className={`text-[12px] uppercase font-black tracking-[0.4em] ${isPlaying === idea.id ? 'text-[#1A1A2E]' : 'text-black/20'}`}>{isPlaying === idea.id ? 'Projecting Vision Narrative...' : 'Stored Cryptographic Voice'}</span>
                                                        </div>
                                                        <span className="text-[12px] font-black text-black/30 bg-white px-5 py-2 rounded-2xl border border-black/5 shadow-xl">{idea.duration} Archive Total</span>
                                                    </div>
                                                    <div className="flex gap-1.5 h-16 items-center px-2">
                                                        {[...Array(45)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`flex-1 rounded-full transition-all duration-1000 shadow-sm ${isPlaying === idea.id ? 'bg-[#E8820C]' : 'bg-gray-200'} ${i % 4 === 0 ? 'h-6' : i % 3 === 0 ? 'h-10' : i % 2 === 0 ? 'h-14' : 'h-16'}`}
                                                                style={{
                                                                    animation: isPlaying === idea.id ? `pulse 1.5s infinite ${i * 0.05}s` : 'none',
                                                                    opacity: isPlaying === idea.id ? 0.3 + (i / 45) * 0.7 : 0.2
                                                                }}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {idea.content && (
                                                <div className="relative pl-10 border-l-4 border-[#E8820C]/20">
                                                    <p className="text-lg font-serif italic text-black/40 leading-relaxed font-medium">"{idea.content}"</p>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E8820C] mt-3">Synthesized Summary</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-12 border-t-2 border-black/5 mt-auto relative z-10">
                                    <button
                                        onClick={() => handleUpvote(idea.id)}
                                        className="flex items-center gap-6 px-12 py-5 rounded-[2.5rem] transition-all group/vote relative overflow-hidden w-full md:w-auto"
                                    >
                                        <div className="absolute inset-x-0 bottom-0 top-0 bg-gray-50 border-2 border-transparent group-hover/vote:bg-[#E8820C]/10 group-hover/vote:border-[#E8820C]/20 transition-all"></div>
                                        <ThumbsUp size={24} className="relative z-10 text-black/20 group-hover/vote:text-[#E8820C] group-hover/vote:scale-125 transition-all duration-500" strokeWidth={3} />
                                        <div className="relative z-10 text-left">
                                            <p className="text-xl font-black text-[#1A1A2E] leading-none">{idea.upvotes}</p>
                                            <p className="text-[9px] uppercase font-black tracking-[0.3em] text-black/30 mt-1">Consensus Alignments</p>
                                        </div>
                                    </button>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button
                                            onClick={() => toast('Discussion thread accessing...')}
                                            className="flex-1 md:flex-none px-10 py-5 bg-gray-50 text-[11px] font-black uppercase tracking-[0.3em] text-black/40 rounded-[2rem] hover:bg-[#1A1A2E] hover:text-white transition-all border-2 border-transparent hover:border-white/10 shadow-inner group/msg"
                                        >
                                            Interrogate Node <span className="text-[#F5A623] ml-2 group-hover:scale-110">(12)</span>
                                        </button>
                                        <button
                                            onClick={() => toast('Contextual analysis initializing...')}
                                            className="p-5 bg-gray-50 text-black/10 hover:text-[#E8820C] hover:bg-white rounded-[2rem] transition-all border-2 border-black/5 hover:border-[#E8820C]/20 shadow-inner group/ser"
                                        >
                                            <Search size={22} className="group-hover/ser:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredIdeas.length === 0 && (
                        <div className="py-48 text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
                            <div className="relative w-48 h-48 bg-gray-50 rounded-[4rem] flex items-center justify-center mx-auto text-black/[0.02] shadow-inner group">
                                <Lightbulb size={100} className="relative z-10 group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C]/10 to-transparent animate-pulse rounded-[4rem]"></div>
                                <Search size={40} className="absolute -bottom-4 -right-4 text-black/10" />
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-4xl font-serif font-black text-[#1A1A2E]">Archives Silent</h3>
                                <p className="text-black/40 max-w-md mx-auto text-xl italic font-serif leading-relaxed">
                                    "The oracle has not recorded any visions matching these parameters. Initiate the consultation phase to generate new collective intelligence."
                                </p>
                            </div>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                                className="text-[12px] font-black uppercase tracking-[0.6em] text-[#E8820C] border-b-4 border-[#E8820C]/20 pb-2 hover:text-[#1A1A2E] hover:border-[#1A1A2E] transition-all"
                            >
                                Reset Analysis Protocol
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar (Right): Strategic Context */}
                <div className="lg:col-span-4 space-y-12 sticky top-4">
                    {/* High-Impact Visionary Sidebar */}
                    <div className="bg-[#1A1A2E] rounded-[4rem] p-12 shadow-[0_50px_100px_-20px_rgba(26,26,46,0.5)] text-white relative overflow-hidden group border border-white/5">
                        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#E8820C] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                        <div className="absolute bottom-0 right-0 p-10 text-white/[0.02] rotate-12 transition-all duration-1000 group-hover:text-white/[0.05]"><Target size={200} /></div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-5 border-b border-white/10 pb-8">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 text-[#F5A623] flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-[0.3em]">Trending Consensus</h3>
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">High Intensity Alignment</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                {trendingIdeas.map((idea, idx) => (
                                    <div key={idea.id} className="relative pl-10 group/item cursor-pointer">
                                        <span className="absolute left-0 top-0 text-4xl font-serif italic text-white/5 group-hover/item:text-[#F5A623]/20 transition-colors duration-500">0{idx + 1}</span>
                                        <div className="space-y-3">
                                            <p className="text-sm font-black text-white/80 group-hover/item:text-white transition-colors leading-relaxed line-clamp-2 italic font-serif">"{idea.content || 'Spoken Cryptographic Artifact from ' + idea.author}"</p>
                                            <div className="flex items-center gap-5 mt-4">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#F5A623] flex items-center gap-2">
                                                    <ThumbsUp size={12} fill="currentColor" /> {idea.upvotes} Consensus
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{idea.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => toast('Intellectual Leaderboard Accessing...')}
                                className="w-full py-6 rounded-[2rem] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-[#1A1A2E] transition-all shadow-2xl"
                            >
                                Visionary Leaderboard
                            </button>
                        </div>
                    </div>

                    {/* Meta Stats: Institutional Momentum */}
                    <div className="bg-white rounded-[4rem] p-12 shadow-2xl border border-black/5 space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-black/[0.01] transition-all duration-1000 group-hover:text-[#E8820C]/5"><UsersIcon size={120} /></div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20 border-b-2 border-black/5 pb-6">Institutional Momentum</h3>
                        <div className="space-y-10 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-end justify-between px-2">
                                    <div className="space-y-1">
                                        <p className="text-4xl font-black text-[#1A1A2E] tracking-tighter">84%</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C]">Strategic Execution</p>
                                    </div>
                                    <Zap size={24} className="text-[#E8820C] mb-2 animate-pulse" />
                                </div>
                                <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden border border-black/5 p-0.5">
                                    <div className="h-full bg-gradient-to-r from-[#1A1A2E] to-[#E8820C] rounded-full shadow-[0_0_10px_rgba(232,130,12,0.4)] transition-all duration-[2s]" style={{ width: '84%' }}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-black/5">
                                <div className="space-y-2">
                                    <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">1.2k</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Total Visions</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">3.5k</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Brotherhood Votes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Directives: The Code */}
                    <div className="bg-gray-50/50 backdrop-blur-xl rounded-[4rem] p-12 border-2 border-black/5 space-y-8 relative group">
                        <div className="flex items-center gap-4 text-[#1A1A2E]/30 mb-4 px-2">
                            <ShieldCheck size={24} />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.4em]">Operational Directives</h4>
                        </div>
                        <ul className="space-y-6">
                            {[
                                "Consensus must be derived from respectful discourse.",
                                "Voice visions must be clear for cryptographic summary.",
                                "Collaboration is the prerequisite for institutional growth.",
                                "Integrity in voting maintains the brotherhood trust."
                            ].map((rule, k) => (
                                <li key={k} className="text-[12px] font-bold text-black/50 flex items-start gap-4 italic font-serif leading-relaxed translate-x-2 group-hover:translate-x-0 transition-transform duration-500" style={{ transitionDelay: `${k * 100}ms` }}>
                                    <span className="w-6 h-6 rounded-lg bg-[#E8820C]/10 text-[#E8820C] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">0{k + 1}</span>
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.4); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
