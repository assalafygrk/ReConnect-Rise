import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import {
    Send, User, Users, Search, MoreVertical, Paperclip, Smile, Menu, X,
    CheckCircle2, MessageSquare, Image, Video, Mic, MapPin, UserPlus,
    FileText, BarChart3, Calendar, Camera, Plus, Play, Pause, Download, ExternalLink,
    ShieldAlert, Loader2, Zap, Signal, Fingerprint, Lock, Info
} from 'lucide-react';
import { fetchMessages, sendMessage } from '../api/chat';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import { fetchMembers } from '../api/members';

export default function ChatPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { config } = usePageConfig('chat');
    const [activeTab, setActiveTab] = useState('public'); // 'public' or brotherId
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Mobile default hidden
    const scrollRef = useRef();

    const [brothers, setBrothers] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [pinnedChats, setPinnedChats] = useState(['public']);
    const [showMedia, setShowMedia] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const fileInputRef = useRef(null);
    const [attachmentType, setAttachmentType] = useState(null);

    // Real Online Status Checker
    const isOnline = (lastSeen) => {
        if (!lastSeen) return false;
        const diff = dayjs().diff(dayjs(lastSeen), 'minute');
        return diff < 5; // Online if active in last 5 mins
    };

    useEffect(() => {
        setLoading(true);
        const roomId = activeTab === 'public' ? 'public' : [user?.id, activeTab].sort().join('_');
        fetchMessages(roomId)
            .then(setMessages)
            .finally(() => setLoading(false));
    }, [activeTab, user]);

    useEffect(() => {
        const loadBrothers = () => {
            fetchMembers()
                .then(data => {
                    const membersList = data
                        .filter(m => m._id !== user?.id && m.id !== user?.id && m.role !== 'super_admin')
                        .map(m => ({
                            id: m._id || m.id,
                            name: m.name,
                            role: m.role,
                            facialUpload: m.facialUpload,
                            lastSeen: m.lastSeen,
                            status: m.status, // membership status
                            lastMsg: 'Tap to view conversation'
                        }));
                    setBrothers(membersList);
                })
                .catch(err => {
                    console.error('Failed to load brotherhood registry:', err);
                });
        };
        loadBrothers();
        const interval = setInterval(loadBrothers, 30000); // Poll every 30s for online status
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (scrollRef.current && !isSearchOpen) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isSearchOpen]);

    const handleSend = async (e, type = 'text', content = null) => {
        if (e) e.preventDefault();

        let msgContent = content || inputText;
        if (type === 'text' && !msgContent.trim()) return;

        setSending(true);
        try {
            const roomId = activeTab === 'public' ? 'public' : [user?.id, activeTab].sort().join('_');
            const newMsg = await sendMessage(roomId, msgContent, type);
            // Simulate transmission delay for "Serious" feel
            await new Promise(r => setTimeout(r, 600));
            setMessages([...messages, newMsg]);
            setInputText('');
            setShowAttachments(false);
        } catch (err) {
            toast.error('Transmission Failure');
        } finally {
            setSending(false);
        }
    };

    const handleAttachmentClick = (type) => {
        toast.success(`Initializing ${type.toUpperCase()} Protocol...`);
        let contentData = null;

        if (['image', 'video', 'document', 'audio', 'voice'].includes(type)) {
            setAttachmentType(type);
            fileInputRef.current?.click();
            return;
        } else if (type === 'location') {
            const address = prompt('Enter Location Address:');
            if (address) contentData = { type: 'location', text: 'Coordinate Sync', address };
        } else if (type === 'poll') {
            const question = prompt('Enter Poll Question:');
            const opts = prompt('Enter Options (comma separated):');
            if (question && opts) {
                const optionsArray = opts.split(',').map(o => o.trim());
                contentData = { type: 'poll', text: question, options: optionsArray, votes: new Array(optionsArray.length).fill(0) };
            }
        } else if (type === 'event') {
            const title = prompt('Enter Event Title:');
            const date = prompt('Enter Event Date (YYYY-MM-DD):');
            if (title && date) contentData = { type: 'event', text: title, eventDate: date, location: 'TBD' };
        } else {
            toast.error('Protocol not recognized');
        }

        if (contentData) {
            handleSend(null, contentData.type, contentData);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Url = reader.result;
            let contentData = null;
            if (attachmentType === 'image') {
                contentData = { type: 'image', text: file.name, url: base64Url };
            } else if (attachmentType === 'video') {
                contentData = { type: 'video', text: file.name, url: base64Url, duration: '0:00' };
            } else if (attachmentType === 'document') {
                contentData = { type: 'document', text: file.name, url: base64Url, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' };
            } else if (attachmentType === 'audio' || attachmentType === 'voice') {
                contentData = { type: 'voice', text: file.name, url: base64Url, duration: '0:00' };
            }

            if (contentData) {
                handleSend(null, contentData.type, contentData);
            }
            // reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const togglePin = (id) => {
        setPinnedChats(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        toast.success(pinnedChats.includes(id) ? 'Node unpinned' : 'Node pinned to favorites');
    };

    const filteredMessages = searchQuery
        ? messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
        : messages;

    const currentBrother = brothers.find(b => b.id === activeTab);

    return (
        <div className="flex h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#0B1221] dark:to-[#070B14] relative mx-2 md:mx-0">

            {/* Sidebar Toggle Overlay (Mobile) */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Chat Sidebar: Node Registry */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 border-r border-black/5 dark:border-white/10 flex flex-col bg-gray-50 dark:bg-[#0B1221]/95 backdrop-blur-3xl transition-all duration-700 md:relative md:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#0B1221]/50">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black font-serif text-[#1A1A2E] dark:text-white leading-none italic">{config.channelName || 'Registry'}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C] animate-pulse">Active Relay Nodes</p>
                        </div>
                        <button onClick={() => setShowSidebar(false)} className="md:hidden p-3 bg-white/10 rounded-2xl text-white/40"><X size={20} /></button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 group-focus-within:text-[#E8820C] transition-all duration-500" size={18} />
                        <input className="w-full bg-gray-100 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C]/20 rounded-[1.5rem] pl-14 pr-6 py-5 text-[10px] dark:text-white outline-none transition-all font-black uppercase tracking-[0.3em] placeholder:text-black/10 dark:placeholder:text-white/10" placeholder="Locate Brother..." />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-8 scrollbar-hide px-4 space-y-10">
                    {/* Configured Announcement */}
                    {config.pinnedAnnouncement && (
                        <div className="px-2">
                            <div className="bg-[#E8820C]/5 border border-[#E8820C]/20 p-5 rounded-[2rem] flex items-start gap-4">
                                <ShieldAlert size={18} className="text-[#E8820C] shrink-0 mt-0.5" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#E8820C] leading-relaxed">{config.pinnedAnnouncement}</p>
                            </div>
                        </div>
                    )}

                    {/* Pinned Section */}
                    {pinnedChats.length > 0 && (
                        <div>
                            <p className="px-6 text-[9px] uppercase font-black text-[#E8820C] tracking-[0.5em] mb-6 flex items-center gap-3">
                                <Zap size={14} className="fill-[#E8820C]" /> Priority Links
                            </p>
                            <div className="space-y-3">
                                {pinnedChats.map(id => {
                                    const b = brothers.find(br => br.id === id);
                                    const isPublic = id === 'public';
                                    const online = isPublic || isOnline(b?.lastSeen);
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => { setActiveTab(id); setShowSidebar(false); }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative group ${activeTab === id ? 'bg-white dark:bg-[#1A1A2E] shadow-xl border border-black/5 dark:border-white/10' : 'hover:bg-white/5 opacity-50'}`}
                                        >
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-all overflow-hidden ${activeTab === id ? 'bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] shadow-lg ring-1 ring-[#E8820C]/20' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                                                    {isPublic ? <Signal size={18} className="text-[#E8820C]" /> : (b?.facialUpload ? <img src={b.facialUpload} alt={b.name} className="w-full h-full object-cover" /> : b?.name.split(' ').map(n => n[0]).join(''))}
                                                </div>
                                                <div className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-gray-50 dark:border-[#0B1221] rounded-full transition-colors ${online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-500'}`}></div>
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-xs font-black text-[#1A1A2E] dark:text-white truncate tracking-tight uppercase italic">{isPublic ? 'The Brotherhood' : b?.name}</p>
                                                <p className="text-[7px] text-[#E8820C] font-black uppercase tracking-[0.2em] mt-0.5">{online ? 'Secure Uplink' : 'Dormant'}</p>
                                            </div>
                                            {activeTab === id && <div className="w-1.5 h-1.5 rounded-full bg-[#E8820C] animate-ping"></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="px-6 text-[9px] uppercase font-black text-black/20 dark:text-white/20 tracking-[0.5em] mb-6">Recent Frequency</p>
                        <div className="space-y-2">
                            {brothers.filter(b => !pinnedChats.includes(b.id)).map(b => {
                                const online = isOnline(b.lastSeen);
                                return (
                                    <button
                                        key={b.id}
                                        onClick={() => { setActiveTab(b.id); setShowSidebar(false); }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative group ${activeTab === b.id ? 'bg-white dark:bg-[#1A1A2E] shadow-xl border border-black/5 dark:border-white/10' : 'hover:bg-white/5 opacity-50'}`}
                                    >
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-all overflow-hidden ${activeTab === b.id ? 'bg-[#E8820C] text-white shadow-lg' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                                                {b.facialUpload ? <img src={b.facialUpload} alt={b.name} className="w-full h-full object-cover" /> : b.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-gray-50 dark:border-[#0B1221] rounded-full transition-colors ${online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-500'}`}></div>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-xs font-black text-[#1A1A2E] dark:text-white truncate tracking-tight uppercase italic">{b.name}</p>
                                            <p className="text-[9px] text-black/30 dark:text-white/30 truncate font-medium italic mt-0.5 leading-tight">{b.lastMsg}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area: Tactical Interface */}
            <div className="flex-1 flex flex-col bg-white dark:bg-transparent relative overflow-hidden">
                {/* Chat Header: Current Focus - Optimized Height */}
                <div className="h-16 md:h-20 px-4 md:px-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-[#0B1221]/60 backdrop-blur-3xl z-20">
                    <div className="flex items-center gap-3 md:gap-5 min-w-0">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="md:hidden p-2 bg-gray-100 dark:bg-white/5 rounded-xl text-[#1A1A2E] dark:text-white hover:bg-[#E8820C] transition-all"
                        >
                            <Menu size={16} />
                        </button>

                        <div className="relative group">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#1A1A2E] dark:bg-white flex items-center justify-center text-white dark:text-[#1A1A2E] shadow-2xl relative z-10 transition-transform overflow-hidden group-hover:scale-105 duration-700">
                                {activeTab === 'public' ? <Signal size={20} className="text-[#E8820C]" /> : (currentBrother?.facialUpload ? <img src={currentBrother.facialUpload} alt={currentBrother.name} className="w-full h-full object-cover" /> : <User size={20} />)}
                            </div>
                            <div className="absolute -inset-1.5 bg-[#E8820C] dark:bg-[#E8820C]/30 rounded-2xl blur-md opacity-20 group-hover:opacity-60 transition-opacity duration-1000"></div>
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base md:text-xl font-black text-[#1A1A2E] dark:text-white tracking-tighter truncate font-serif uppercase italic leading-none">
                                    {activeTab === 'public' ? 'Strategic Room' : currentBrother?.name}
                                </h3>
                                <button onClick={() => togglePin(activeTab)} className={`p-1 rounded-lg transition-all ${pinnedChats.includes(activeTab) ? 'text-[#E8820C] bg-[#E8820C]/10' : 'text-white/10 hover:text-white/30'}`}>
                                    <ShieldAlert size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'public' || isOnline(currentBrother?.lastSeen) ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                <p className={`text-[8px] font-black uppercase tracking-widest ${activeTab === 'public' || isOnline(currentBrother?.lastSeen) ? 'text-emerald-500' : 'text-gray-500'}`}>
                                    {activeTab === 'public' || isOnline(currentBrother?.lastSeen) ? 'Connected' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        <div className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/10">
                            <button className="px-5 py-2 rounded-xl bg-white dark:bg-[#1A1A2E] text-[8px] font-black uppercase tracking-widest text-[#E8820C] shadow-lg">Relay</button>
                            <button className="px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors">Files</button>
                        </div>
                        
                        <div className="group relative">
                            <button
                                onClick={() => setShowMedia(!showMedia)}
                                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border border-black/5 dark:border-white/10 transition-all ${showMedia ? 'bg-[#E8820C] text-white shadow-xl scale-105' : 'text-white/20 hover:text-white/60 bg-white/5'}`}
                            >
                                <MoreVertical size={18} />
                            </button>
                            
                            {/* Tactical Dropdown */}
                            <div className="absolute right-0 top-full mt-4 w-64 bg-[#1A1A2E]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden translate-y-2 group-hover:translate-y-0">
                                <div className="p-2 space-y-1">
                                    <button 
                                        onClick={() => navigate('/documentary')}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 text-white/60 hover:text-[#E8820C] transition-all text-sm font-black uppercase tracking-widest"
                                    >
                                        <FileText size={18} />
                                        Shared Archive
                                    </button>
                                    <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 text-white/60 hover:text-[#E8820C] transition-all text-sm font-black uppercase tracking-widest">
                                        <Users size={18} />
                                        Group Protocol
                                    </button>
                                    <div className="h-px bg-white/5 mx-4 my-2" />
                                    <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all text-sm font-black uppercase tracking-widest">
                                        <Info size={18} />
                                        Clear History
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Container: The Relay */}
                <div className="flex-1 flex overflow-hidden relative">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-20 space-y-10 md:space-y-16 bg-gray-100 dark:bg-transparent scroll-smooth relative z-10 scrollbar-hide">

                        {loading ? (
                            <div className="flex h-full items-center justify-center flex-col gap-8 animate-pulse">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-[#E8820C]/5 border-t-[#E8820C] rounded-full animate-spin"></div>
                                    <Fingerprint size={40} className="absolute inset-0 m-auto text-[#E8820C]" />
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-[0.6em] text-[#E8820C]">Establishing Uplink...</p>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            filteredMessages.map((msg, i) => {
                                const showAvatar = !msg.isMe && activeTab === 'public' && (i === 0 || filteredMessages[i - 1]?.sender !== msg.sender);
                                return (
                                    <div key={msg.id} className={`flex items-end gap-4 md:gap-8 ${msg.isMe ? 'justify-end' : 'justify-start'} ${!showAvatar && !msg.isMe ? 'ml-16 md:ml-24' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                        {showAvatar && (
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] flex items-center justify-center text-xs font-black shadow-2xl mb-8 shrink-0 ring-4 ring-black/5 dark:ring-white/5 overflow-hidden">
                                                {msg.senderAvatar ? <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" /> : (msg.role === 'super_admin' ? 'SA' : msg.senderName?.split(' ').map(n => n[0]).join(''))}
                                            </div>
                                        )}

                                        <div className={`max-w-[85%] md:max-w-2xl flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            {showAvatar && <p className="text-[10px] font-black text-[#E8820C] mb-3 uppercase tracking-[0.4em] ml-2 italic">{msg.role === 'super_admin' ? 'System Architecture' : msg.senderName}</p>}

                                            <div className={`p-6 md:p-10 text-sm md:text-lg leading-relaxed shadow-2xl transition-all relative overflow-hidden group/bubble ${msg.isMe
                                                ? 'bg-[#1A1A2E] dark:bg-[#1E293B] text-white rounded-[2.5rem] md:rounded-[3.5rem] rounded-br-none border border-white/10'
                                                : 'bg-white dark:bg-[#111827]/80 dark:backdrop-blur-3xl border border-black/5 dark:border-white/10 text-[#1A1A2E] dark:text-white rounded-[2.5rem] md:rounded-[3.5rem] rounded-bl-none'
                                                }`}>

                                                {msg.isMe && <Fingerprint size={120} className="absolute -right-8 -bottom-8 text-white/[0.03] group-hover/bubble:text-white/[0.08] transition-all duration-1000 rotate-12" />}

                                                {/* Render content based on type */}
                                                {!msg.type || msg.type === 'text' ? (
                                                    <p className="relative z-10 font-serif italic leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                ) : msg.type === 'image' ? (
                                                    <div className="space-y-6 relative z-10">
                                                        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group-hover/bubble:scale-[1.02] transition-transform duration-1000">
                                                            <img src={msg.content?.url} alt="Shared" className="w-full h-auto max-h-[500px] object-cover" />
                                                        </div>
                                                        {msg.text && <p className="text-[13px] opacity-60 italic font-serif leading-relaxed px-2">{msg.text}</p>}
                                                    </div>
                                                ) : msg.type === 'voice' ? (
                                                    <div className="flex items-center gap-6 min-w-[250px] relative z-10">
                                                        <button className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all active:scale-90 ${msg.isMe ? 'bg-white text-[#1A1A2E]' : 'bg-[#E8820C] text-white'}`}>
                                                            <Play size={28} fill="currentColor" />
                                                        </button>
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex items-center gap-1.5 h-8">
                                                                {[1, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.3, 0.6, 0.4].map((h, k) => (
                                                                    <div key={k} className={`flex-1 rounded-full animate-pulse ${msg.isMe ? 'bg-white/20' : 'bg-[#E8820C]/20'}`} style={{ height: `${h * 100}%`, animationDelay: `${k * 100}ms` }}></div>
                                                                ))}
                                                            </div>
                                                            <div className="flex justify-between items-center px-1">
                                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 italic">Secure Encryption Node</p>
                                                                <p className="text-[9px] font-black text-[#E8820C]">{msg.content?.duration || '0:00'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : msg.type === 'poll' ? (
                                                    <div className="space-y-8 relative z-10 min-w-[300px]">
                                                        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                                            <div className="p-3 bg-[#E8820C]/10 rounded-2xl text-[#E8820C]"><BarChart3 size={24} /></div>
                                                            <p className="font-black text-xl font-serif italic tracking-tight">{msg.text}</p>
                                                        </div>

                                                        <div className="space-y-4">
                                                            {msg.content?.options?.map((opt, idx) => {
                                                                const votes = msg.content?.votes?.[idx] || 0;
                                                                const total = msg.content?.votes?.reduce((a, b) => a + b, 0) || 1;
                                                                const pct = Math.round((votes / total) * 100);
                                                                return (
                                                                    <div key={idx} className="space-y-3 group/poll cursor-pointer">
                                                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] opacity-60 px-2 italic">
                                                                            <span>{opt}</span>
                                                                            <span>{pct}% <span className="opacity-40 ml-2">({votes} Votes)</span></span>
                                                                        </div>
                                                                        <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden border border-white/5 ring-1 ring-white/5">
                                                                            <div className="h-full bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(232,130,12,0.4)]" style={{ width: `${pct}%` }}></div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                        <p className="text-[9px] opacity-20 italic font-black uppercase tracking-[0.5em] text-center border-t border-white/5 pt-6">Biometric Ballot Protocol</p>
                                                    </div>
                                                ) : msg.type === 'document' ? (
                                                    <div className="flex items-center gap-8 p-6 bg-white/5 rounded-[3rem] border border-white/10 relative z-10 group/file">
                                                        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center ${msg.isMe ? 'bg-white text-[#1A1A2E]' : 'bg-[#E8820C] text-white'} shadow-2xl`}>
                                                            <FileText size={40} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-lg font-black truncate tracking-tight italic">{msg.content?.text}</p>
                                                            <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.3em] mt-2 italic">{msg.content?.size} • Verified Archive</p>
                                                        </div>
                                                        <button 
                                                            className="w-16 h-16 flex items-center justify-center bg-white/5 hover:bg-[#E8820C] text-white rounded-[1.5rem] transition-all hover:-translate-y-1 active:scale-90"
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                link.href = msg.content?.url;
                                                                link.download = msg.content?.text || 'download';
                                                                link.click();
                                                            }}
                                                        >
                                                            <Download size={28} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="relative z-10 font-serif italic leading-relaxed">{msg.text}</p>
                                                )}
                                            </div>

                                            <div className={`flex items-center gap-4 mt-5 ${msg.isMe ? 'mr-6' : 'ml-6'}`}>
                                                <p className="text-[10px] text-black/20 dark:text-white/20 font-black uppercase tracking-[0.5em] italic">{dayjs(msg.createdAt).format('HH:mm')}</p>
                                                {msg.isMe && <div className="text-emerald-500 flex items-center gap-2">
                                                    <CheckCircle2 size={14} strokeWidth={4} />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Relayed</span>
                                                </div>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-12 max-w-md mx-auto opacity-40 scale-110">
                                <div className="w-32 h-32 rounded-[3.5rem] bg-[#1A1A2E] dark:bg-white flex items-center justify-center text-[#E8820C] shadow-2xl relative group">
                                    <MessageSquare size={56} className="group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute -inset-6 bg-[#E8820C] dark:bg-[#E8820C]/30 rounded-[4.5rem] blur-2xl animate-pulse"></div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="font-serif text-4xl font-black text-[#1A1A2E] dark:text-white italic tracking-tighter uppercase">Tactical Void</h4>
                                    <p className="text-sm font-black uppercase tracking-[0.3em] leading-relaxed text-[#1A1A2E] dark:text-white/40 border-t border-[#E8820C]/20 pt-8 italic">
                                        "Collective intelligence is the bedrock of strategic sovereignty. Establish a frequency."
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Media Archive Sidebar Overlay */}
                    {showMedia && (
                        <div className="absolute inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-[#0B1221] p-12 animate-in slide-in-from-right-full duration-700 z-50 shadow-[-50px_0_100px_rgba(0,0,0,0.5)] border-l border-white/5 overflow-y-auto">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-[#E8820C]/10 rounded-2xl text-[#E8820C]"><HardDrive size={24} /></div>
                                    <div>
                                        <h4 className="text-2xl font-black font-serif text-[#1A1A2E] dark:text-white uppercase italic tracking-tighter">Shared Archive</h4>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C] mt-1">Uplink Repository</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowMedia(false)} className="p-4 bg-white/5 rounded-2xl text-white/20 hover:text-red-500 transition-colors"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-16">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-square bg-white/5 rounded-[2.5rem] border-2 border-transparent hover:border-[#E8820C]/50 overflow-hidden flex flex-col items-center justify-center gap-4 text-white/5 hover:text-[#E8820C] transition-all duration-700 cursor-pointer shadow-2xl group relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Lock size={40} className="relative z-10 group-hover:rotate-12 transition-transform duration-700" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] relative z-10 opacity-0 group-hover:opacity-40 transition-opacity">Node {i}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-10 bg-gradient-to-br from-[#1A1A2E] to-[#0F172A] rounded-[3.5rem] text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group border border-white/10">
                                <Fingerprint size={120} className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-20 transition-opacity duration-1000 rotate-12" />
                                <div className="relative z-10 space-y-6">
                                    <div className="w-12 h-1 bg-[#E8820C]" />
                                    <h5 className="text-[12px] font-black uppercase tracking-[0.5em] text-[#E8820C]">Encryption v4.2</h5>
                                    <p className="text-sm text-white/40 leading-relaxed font-serif italic">
                                        "All transmissions within this registry are secured via end-to-end brotherhood verification keys. Digital sovereignty is non-negotiable."
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Message Input: Transmission Uplink */}
                <div className="p-6 md:p-12 bg-white dark:bg-[#0B1221] border-t border-black/5 dark:border-white/10 relative z-30">

                    {/* Multi-functional Attachment Menu Overlay */}
                    {showAttachments && (
                        <div className="absolute bottom-[100%] left-6 right-6 md:left-12 md:right-12 mb-8 p-10 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-3xl rounded-[3rem] md:rounded-[4.5rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.6)] border border-black/5 dark:border-white/10 animate-in slide-in-from-bottom-20 duration-500 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-6 z-50">
                            {[
                                { id: 'voice', icon: Mic, label: 'Vocal', color: '#E8820C' },
                                { id: 'image', icon: Image, label: 'Visual', color: '#1A1A2E' },
                                { id: 'video', icon: Video, label: 'Motion', color: '#1A1A2E' },
                                { id: 'document', icon: FileText, label: 'Ledger', color: '#1A1A2E' },
                                { id: 'camera', icon: Camera, label: 'Optic', color: '#1A1A2E' },
                                { id: 'location', icon: MapPin, label: 'Coords', color: '#1A1A2E' },
                                { id: 'contact', icon: UserPlus, label: 'Relay', color: '#1A1A2E' },
                                { id: 'audio', icon: Play, label: 'Audio', color: '#1A1A2E' },
                                { id: 'poll', icon: BarChart3, label: 'Ballot', color: '#1A1A2E' },
                                { id: 'event', icon: Calendar, label: 'Summit', color: '#1A1A2E' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleAttachmentClick(item.id)}
                                    className="flex flex-col items-center gap-4 p-5 rounded-[2.5rem] hover:bg-white dark:hover:bg-white/10 transition-all group/item hover:shadow-2xl hover:-translate-y-3 duration-500"
                                >
                                    <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-all dark:bg-white/5 border border-white/10 group-hover/item:scale-110" style={{ background: item.color === '#E8820C' ? item.color : '' }}>
                                        <item.icon size={30} className={item.color !== '#E8820C' ? 'text-[#E8820C]' : ''} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 group-hover/item:text-[#E8820C] italic">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={(e) => handleSend(e)} className="relative group max-w-7xl mx-auto">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-[3.5rem] blur-xl opacity-0 group-focus-within:opacity-20 transition duration-1000"></div>
                        <div className="relative bg-gray-50 dark:bg-[#1E293B]/60 dark:backdrop-blur-3xl border-2 border-white/5 focus-within:border-[#E8820C]/30 rounded-[2.5rem] md:rounded-[4rem] p-3 md:p-5 flex items-end gap-3 md:gap-5 transition-all focus-within:bg-white dark:focus-within:bg-[#1E293B]/80 focus-within:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:ring-white/5">
                            <button
                                type="button"
                                onClick={() => setShowAttachments(!showAttachments)}
                                className={`w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl active:scale-90 mb-1 ${showAttachments ? 'bg-red-500 text-white rotate-45' : 'bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] hover:scale-105'}`}
                            >
                                <Plus size={28} className="md:size-10" />
                            </button>

                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[14px] md:text-2xl font-serif italic py-4 md:py-7 px-4 md:px-8 text-[#1A1A2E] dark:text-white placeholder:text-black/10 dark:placeholder:text-white/10 resize-none max-h-48 scrollbar-hide"
                                placeholder={activeTab === 'public' ? "Draft strategy..." : `Uplink with ${currentBrother?.name?.split(' ')[0]}...`}
                            />

                            <button
                                type="submit"
                                disabled={!inputText.trim() || sending}
                                className={`w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#E8820C] text-white shadow-2xl shadow-[#E8820C]/30 hover:bg-[#F5A623] hover:-translate-y-2 active:scale-95 transition-all disabled:opacity-10 flex items-center justify-center mb-1`}
                            >
                                {sending ? <Loader2 size={24} className="animate-spin md:size-10" /> : <Send size={24} strokeWidth={3} className="md:size-10" />}
                            </button>
                        </div>
                    </form>
                    
                    <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} />
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 mt-10">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-black/20 dark:text-white/20 italic">
                            <Lock size={12} className="text-[#E8820C]" /> E2E Encryption v4.2
                        </div>
                        <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/5"></div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-black/20 dark:text-white/20 italic">
                            <Zap size={12} className="text-[#E8820C]" /> 12ms Relay Latency
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
