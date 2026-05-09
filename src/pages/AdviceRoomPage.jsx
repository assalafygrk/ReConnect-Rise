import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Send, Mic, Square, Play, Pause, Trash2, ThumbsUp,
    MessageSquare, User, Calendar, Plus, X, Search, ChevronRight,
    Volume2, CheckCircle2, History, TrendingUp, Sparkles, Filter,
    Lightbulb, Target, Users as UsersIcon, ShieldCheck, Zap, Info,
    MoreVertical, Loader2, Fingerprint, Lock, Compass, HardDrive, Share2
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import { fetchArchives, uploadArchive, upvoteArchive } from '../api/archives';
import { fetchVisions, createVision, upvoteVision } from '../api/visions';


const MOCK_CATEGORIES = [
    { id: 'all', label: 'Universal Visions', icon: Sparkles },
    { id: 'finance', label: 'Fiscal Strategy', icon: Zap },
    { id: 'community', label: 'Social Impact', icon: UsersIcon },
    { id: 'operations', label: 'Operational Excellence', icon: Target },
    { id: 'security', label: 'Institutional Trust', icon: ShieldCheck },
    { id: 'others', label: 'General Directives', icon: MoreVertical },
];

const AdviceRoomPage = () => {
    const { user, ROLES } = useAuth();
    const { config } = usePageConfig('advice');
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('published');

    // Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [slideDistance, setSlideDistance] = useState(0);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(null); // Initialize as null and create in toggleAudio
    const [activeSubmissionCategory, setActiveSubmissionCategory] = useState('community');
    const [inputText, setInputText] = useState('');

    const timerRef = useRef(null);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        loadVisions();
    }, []);

    const loadVisions = async () => {
        setLoading(true);
        try {
            const data = await fetchArchives();
            // Use specific 'advice' array if backend provides it, otherwise filter all
            const adviceData = (data?.advice || []).concat((data?.files || []).filter(item => item.type === 'advice'));
            
            setIdeas(adviceData.map(d => ({
                id: d._id,
                author: d.uploaderName || 'Unknown',
                content: d.title || '',
                type: d.fileType === 'voice' ? 'voice' : 'text',
                category: d.category || 'others',
                upvotes: d.upvotes || 0,
                date: d.createdAt ? dayjs(d.createdAt).format('MMM DD, YYYY') : 'Recent',
                status: d.status || 'published',
                audioUrl: d.url || '',
                duration: d.fileType === 'voice' ? 'Voice Directive' : '',
                avatar: d.uploaderAvatar || null
            })));
        } catch (err) {
            setIdeas([]);
            toast.error('Failed to load advice');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            if (!isLocked) setRecordingDuration(0);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording, isLocked]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setRecordedAudio({ url: audioUrl, blob: audioBlob, duration: formatDuration(recordingDuration) });
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            toast.error('Microphone Access Denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleStartRecording = (e) => {
        e.preventDefault();
        startXRef.current = e.clientX || e.touches?.[0].clientX || 0;
        startYRef.current = e.clientY || e.touches?.[0].clientY || 0;
        setIsHolding(true);
        setSlideDistance(0);
        setIsLocked(false);
        startRecording();
    };

    const handleMouseMove = (e) => {
        if (!isHolding || isLocked) return;
        const currentX = e.clientX || e.touches?.[0].clientX || 0;
        const currentY = e.clientY || e.touches?.[0].clientY || 0;
        
        const diffX = startXRef.current - currentX;
        const diffY = startYRef.current - currentY;

        setSlideDistance(diffX);

        if (diffX > 150) { // Slide left to cancel
            cancelRecording();
        } else if (diffY > 100) { // Slide up to lock
            setIsLocked(true);
            setIsHolding(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setIsHolding(false);
        setIsLocked(false);
        setSlideDistance(0);
        setRecordingDuration(0);
        toast.error('Voice Capture Aborted');
    };

    const handleStopRecording = () => {
        if (!isHolding || isLocked) return;
        setIsHolding(false);
        stopRecording();
        // Short press handling
        if (recordingDuration < 1) {
            cancelRecording();
            toast.error('Duration Insufficient');
        }
    };

    const handleSendAdvice = async () => {
        setSubmitting(true);
        try {
            let finalUrl = '';
            
            // If there's a voice recording, convert to base64 for persistence
            if (recordedAudio?.blob instanceof Blob) {
                const reader = new FileReader();
                const base64Promise = new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                });
                reader.readAsDataURL(recordedAudio.blob);
                finalUrl = await base64Promise;
            }

            const formData = {
                title: inputText || `Voice Directive ${dayjs().format('DD/MM HH:mm')}`,
                type: 'advice',
                fileType: recordedAudio ? 'voice' : 'text',
                url: finalUrl || `https://via.placeholder.com/600?text=${encodeURIComponent(inputText || 'Strategic Vision')}`,
                category: activeSubmissionCategory
            };

            await uploadArchive(formData);
            toast.success('Directive Synchronized with Registry');
            setInputText('');
            setRecordedAudio(null);
            setShowProposalModal(false);
            loadVisions();
        } catch (err) {
            console.error('Upload error:', err);
            toast.error(err.message || 'Transmission Failure');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleAudio = (id, url) => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        
        if (playingId === id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            audioRef.current.src = url;
            audioRef.current.play().catch(e => console.error("Audio playback failed", e));
            setPlayingId(id);
            audioRef.current.onended = () => setPlayingId(null);
        }
    };

    const handleUpvote = async (id) => {
        try {
            await upvoteArchive(id);
            toast.success('Consensus Recorded');
            loadVisions();
        } catch (err) {
            toast.error(err.message || 'Verification Failure');
        }
    };

    const filteredIdeas = (ideas || []).filter(idea => 
        ((idea.content || '').toLowerCase().includes((searchTerm || '').toLowerCase())) &&
        (selectedCategory === 'all' || idea.category === selectedCategory)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-16 pb-20 animate-in fade-in duration-1000 p-3 md:p-8">
            {/* Serious System Header - Reduced Size */}
            <div className="relative bg-[#1A1A2E] dark:bg-[#0F172A] rounded-[2.5rem] md:rounded-[4.5rem] p-8 md:p-20 overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C]/10 to-transparent"></div>
                <div className="absolute -bottom-20 -left-20 text-white/[0.02] -rotate-12 select-none group-hover:text-white/[0.05] transition-colors duration-1000">
                    <Fingerprint size={400} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-[#111827]/5 border border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C] dark:text-[#F5A623]">
                            <Compass size={14} className="animate-pulse" /> Strategic Advisory Node
                        </div>
                        <h2 className="text-3xl md:text-7xl font-black font-serif text-white leading-tight tracking-tighter">
                            Brotherhood <br /> <span className="text-[#F5A623]">Consensus.</span>
                        </h2>
                        <p className="text-white/40 text-base md:text-xl font-serif italic max-w-xl leading-relaxed border-l-2 md:border-l-4 border-[#E8820C]/20 pl-6 md:pl-10">
                            "Institutional wisdom arises from collective consultation. Every vision here contributes to the grand architecture of our sovereignty."
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-10 w-full md:w-auto">
                        <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 text-center flex-1">
                            <p className="text-3xl md:text-5xl font-black text-white">{ideas.length}</p>
                            <p className="text-[8px] md:text-[9px] uppercase font-black tracking-widest text-white/30 mt-2">Draft Visions</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 text-center flex-1">
                            <p className="text-3xl md:text-5xl font-black text-[#F5A623]">95%</p>
                            <p className="text-[8px] md:text-[9px] uppercase font-black tracking-widest text-white/30 mt-2">Efficiency</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Submission Interface (Premium advice.jpg feel) */}
                    <div className="bg-white dark:bg-[#111827] rounded-[3.5rem] p-8 md:p-12 shadow-2xl border border-black/5 dark:border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 text-[#E8820C] opacity-[0.03] rotate-12"><Lightbulb size={200} /></div>
                        
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#E8820C] shadow-inner">
                                    <MessageSquare size={32} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-[#1A1A2E] dark:text-white font-serif">Propose Strategic Directive</h4>
                                    <p className="text-[10px] text-black/30 dark:text-white/30 font-black uppercase tracking-widest mt-1">Uplink to the Institutional Oracle</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {MOCK_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveSubmissionCategory(cat.id)}
                                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                            activeSubmissionCategory === cat.id 
                                            ? 'bg-[#E8820C] text-white' 
                                            : 'bg-gray-50 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-gray-100'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group/field">
                                <textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Enter your formal advice or strategic vision..."
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C]/20 rounded-[2.5rem] p-8 text-lg font-serif italic outline-none focus:bg-white dark:bg-[#111827] focus:shadow-2xl transition-all min-h-[180px] resize-none"
                                />
                            </div>



                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 w-full bg-gray-50 dark:bg-white/5 rounded-2xl md:rounded-[2rem] p-3 md:p-4 border border-black/5 dark:border-white/10 flex items-center gap-4 relative min-h-[64px]"
                                    onMouseMove={handleMouseMove}
                                    onTouchMove={handleMouseMove}
                                    onMouseUp={handleStopRecording}
                                    onTouchEnd={handleStopRecording}
                                >
                                    {isRecording ? (
                                        <div className="flex items-center gap-4 w-full px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                                                <span className="text-xs font-black text-red-600 tabular-nums">{formatDuration(recordingDuration)}</span>
                                            </div>
                                            <div className="flex-1 text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-black/20 animate-pulse">
                                                    {isLocked ? "Recording..." : "Slide to cancel"}
                                                </p>
                                            </div>
                                        </div>
                                    ) : recordedAudio ? (
                                        <div className="flex items-center gap-4 w-full animate-in fade-in px-2">
                                            <button className="w-8 h-8 bg-[#E8820C] text-white rounded-lg shadow-lg flex items-center justify-center"><Play size={14} fill="currentColor" className="ml-0.5" /></button>
                                            <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#E8820C] w-[60%]"></div>
                                            </div>
                                            <span className="text-[9px] font-black text-black/40">{recordedAudio.duration}</span>
                                            <button onClick={() => setRecordedAudio(null)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                                        </div>
                                    ) : (
                                        <p className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">Hold to record voice advice</p>
                                    )}

                                    <button
                                        onMouseDown={handleStartRecording}
                                        onTouchStart={handleStartRecording}
                                        className={`absolute right-1 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 text-white scale-110 shadow-2xl' : 'bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] hover:bg-[#E8820C] hover:text-white shadow-xl'}`}
                                    >
                                        <Mic size={20} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendAdvice}
                                    disabled={submitting || (!inputText && !recordedAudio)}
                                    className="w-full md:w-40 py-4 rounded-[1.5rem] md:rounded-[2rem] bg-[#E8820C] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#E8820C]/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Relay
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advice List - Optimized Density */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                            <div className="flex items-center gap-3">
                                <History className="text-[#E8820C]" size={20} />
                                <h3 className="text-xl font-black text-[#1A1A2E] dark:text-white font-serif">Visions Repository</h3>
                            </div>
                            <div className="relative w-full md:w-56">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={14} />
                                <input 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search directives..."
                                    className="w-full bg-white dark:bg-[#111827] border border-black/5 rounded-xl pl-10 pr-4 py-2.5 text-[9px] font-black uppercase outline-none focus:border-[#E8820C]/30"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredIdeas.map((idea, idx) => (
                                <div key={idea.id} className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 md:p-8 shadow-lg border border-black/5 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                {idea.avatar ? <img src={idea.avatar} alt="" className="w-full h-full object-cover" /> : <div className="text-lg font-black text-[#E8820C] font-serif italic">{idea.author[0]}</div>}
                                            </div>
                                            <div>
                                                <h5 className="text-base font-black text-[#1A1A2E] dark:text-white font-serif leading-none">{idea.author}</h5>
                                                <p className="text-[9px] text-black/30 dark:text-white/30 font-black uppercase tracking-widest mt-1.5">{dayjs(idea.date).format('DD MMM YYYY')}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-lg text-[7px] font-black uppercase tracking-widest text-[#E8820C]">
                                            {idea.type}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        {idea.type === 'voice' ? (
                                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-[1.5rem] flex items-center gap-4 border border-black/5">
                                                <button 
                                                    onClick={() => toggleAudio(idea.id, idea.audioUrl)}
                                                    className="w-10 h-10 bg-[#1A1A2E] dark:bg-[#F5A623] text-white rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-90"
                                                >
                                                    {playingId === idea.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                                                </button>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-[#E8820C] transition-all duration-300 ${playingId === idea.id ? 'w-full' : 'w-0'}`}></div>
                                                    </div>
                                                    <div className="flex justify-between text-[7px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest">
                                                        <span>{playingId === idea.id ? 'Playing...' : 'Voice Directive'}</span>
                                                        <span>{idea.duration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-lg md:text-xl font-serif italic text-[#1A1A2E] dark:text-white/80 leading-relaxed">
                                                "{idea.content}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-black/5">
                                        <button 
                                            onClick={() => handleUpvote(idea.id)}
                                            className="flex items-center gap-2 text-[#E8820C] hover:scale-110 transition-transform"
                                        >
                                            <ThumbsUp size={16} fill={idea.upvotes > 0 ? "currentColor" : "none"} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{idea.upvotes || 0} Consensus</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/advice/${idea.id}`);
                                                toast.success('Directive Link Copied');
                                            }}
                                            className="text-black/20 dark:text-white/20 hover:text-[#E8820C] transition-colors"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Category Filter */}
                    <div className="bg-white dark:bg-[#111827] rounded-[3rem] p-8 shadow-xl border border-black/5 dark:border-white/10">
                        <h3 className="text-lg font-black font-serif text-[#1A1A2E] dark:text-white mb-6 px-2 uppercase tracking-tighter">Filter by Domain</h3>
                        <div className="space-y-2">
                            {MOCK_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                        selectedCategory === cat.id 
                                        ? 'bg-[#E8820C] text-white shadow-lg shadow-[#E8820C]/20' 
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5 text-black/60 dark:text-white/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <cat.icon size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                    </div>
                                    <ChevronRight size={14} className={selectedCategory === cat.id ? 'opacity-100' : 'opacity-20'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1A1A2E] dark:bg-[#0F172A] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12"><TrendingUp size={150} /></div>
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-xl font-black font-serif uppercase tracking-tighter">Institutional Directives</h3>
                            <div className="space-y-6">
                                {[
                                    "Wisdom is collective, responsibility is individual.",
                                    "Visions must be clear for cryptographic summary.",
                                    "Collaboration is the prerequisite for growth."
                                ].map((rule, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-lg bg-[#E8820C] flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">0{i+1}</div>
                                        <p className="text-sm font-serif italic text-white/60 leading-relaxed">{rule}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.4); }
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

export default AdviceRoomPage;
