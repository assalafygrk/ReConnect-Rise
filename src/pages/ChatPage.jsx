import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import {
    Send, User, Users, Search, MoreVertical, Paperclip, Smile, Menu, X,
    CheckCircle2, MessageSquare, Image, Video, Mic, MapPin, UserPlus,
    FileText, BarChart3, Calendar, Camera, Plus, Play, Pause, Download, ExternalLink,
    ShieldLock, Loader2, Zap, Signal, Fingerprint, Lock
} from 'lucide-react';
import { fetchMessages, sendMessage } from '../api/chat';
import { useAuth } from '../context/AuthContext';

export default function ChatPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('public'); // 'public' or brotherId
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false); // Mobile default hidden
    const scrollRef = useRef();

    const brothers = [
        { id: '1', name: 'Ola Fashola', role: 'Official Member', lastMsg: 'Strategic agenda synchronized.' },
        { id: '2', name: 'Seun Adeyemi', role: 'Official Member', lastMsg: 'Gratitude for the resource.' },
        { id: '3', name: 'Kola Ayoola', role: 'Treasurer', lastMsg: 'Fiscal ledger verified.' },
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [pinnedChats, setPinnedChats] = useState(['public']);
    const [showMedia, setShowMedia] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchMessages(activeTab)
            .then(setMessages)
            .finally(() => setLoading(false));
    }, [activeTab]);

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
            const newMsg = await sendMessage(activeTab, msgContent, type);
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
        // Simulate sending an attachment for demo
        const mockAttachments = {
            image: { type: 'image', text: 'Encrypted Visual Data', url: 'https://images.unsplash.com/photo-1523240715630-971c469b71f9?q=80&w=400' },
            video: { type: 'video', text: 'Secure Video Feed', url: '#', duration: '0:45' },
            voice: { type: 'voice', text: 'Voice Directive', duration: '0:12' },
            location: { type: 'location', text: 'Coordinate Sync', address: '123 Brotherhood Way, Lagos' },
            poll: { type: 'poll', text: 'Ballot: Strategic Direction?', options: ['Tier 1', 'Tier 2', 'Tier 3'], votes: [5, 2, 1] },
            event: { type: 'event', text: 'Summit Invitation', eventDate: '2026-04-05', location: 'Command Hall' },
            document: { type: 'document', text: 'Operational_Briefing.pdf', size: '3.1 MB' },
        };

        if (mockAttachments[type]) {
            const data = mockAttachments[type];
            handleSend(null, data.type, data);
        }
    };

    const togglePin = (id) => {
        setPinnedChats(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        toast.success(pinnedChats.includes(id) ? 'Node unpinned' : 'Node pinned to favorites');
    };

    const filteredMessages = searchQuery
        ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
        : messages;

    const currentBrother = brothers.find(b => b.id === activeTab);

    return (
        <div className="flex h-[calc(100vh-140px)] rounded-[3.5rem] overflow-hidden shadow-2xl border border-black/5 bg-white relative">
            {/* Sidebar Toggle Overlay (Mobile) */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Chat Sidebar: Node Registry */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 border-r border-black/5 flex flex-col bg-gray-50/50 backdrop-blur-xl transition-all duration-500 md:relative md:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-black/5 bg-white/80">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black font-serif text-[#1A1A2E] leading-none">Registry</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] mt-2">Active Comms Nodes</p>
                        </div>
                        <button onClick={() => setShowSidebar(false)} className="md:hidden text-black/20 hover:text-black/60"><X size={20} /></button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" size={16} />
                        <input className="w-full bg-gray-100 border-2 border-transparent focus:border-[#E8820C]/20 rounded-2xl pl-12 pr-4 py-4 text-[10px] outline-none transition-all font-black uppercase tracking-widest placeholder:text-black/10" placeholder="Locate Brother..." />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 scrollbar-hide px-4">
                    {/* Pinned Section */}
                    {pinnedChats.length > 0 && (
                        <div className="mb-8">
                            <p className="px-4 text-[9px] uppercase font-black text-[#E8820C] tracking-[0.4em] mb-4 flex items-center gap-2">
                                <ShieldLock size={12} /> Strategic Locks
                            </p>
                            <div className="space-y-2">
                                {pinnedChats.map(id => {
                                    const b = brothers.find(br => br.id === id);
                                    const isPublic = id === 'public';
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => { setActiveTab(id); setShowSidebar(false); }}
                                            className={`w-full flex items-center gap-5 p-5 rounded-[2.5rem] transition-all relative ${activeTab === id ? 'bg-white shadow-2xl shadow-black/10 border border-black/5' : 'hover:bg-white/50 opacity-60'}`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${activeTab === id ? 'bg-[#1A1A2E] text-white shadow-lg' : 'bg-white text-black/20 border border-black/5'}`}>
                                                {isPublic ? <Signal size={24} className="text-[#E8820C]" /> : b?.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="text-sm font-black text-[#1A1A2E] truncate tracking-tight">{isPublic ? 'Brotherhood Core' : b?.name}</p>
                                                <p className="text-[9px] text-[#E8820C] font-black uppercase tracking-widest mt-1">High Bandwidth</p>
                                            </div>
                                            {activeTab === id && <div className="w-2 h-2 rounded-full bg-[#E8820C] animate-pulse shadow-[0_0_10px_#E8820C]"></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="px-4 text-[9px] uppercase font-black text-black/20 tracking-[0.4em] mb-4">Relay History</p>
                        <div className="space-y-2">
                            {brothers.filter(b => !pinnedChats.includes(b.id)).map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => { setActiveTab(b.id); setShowSidebar(false); }}
                                    className={`w-full flex items-center gap-5 p-5 rounded-[2.5rem] transition-all relative ${activeTab === b.id ? 'bg-white shadow-2xl shadow-black/10 border border-black/5' : 'hover:bg-white/50 opacity-60 group'}`}
                                >
                                    <div className="relative">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${activeTab === b.id ? 'bg-[#E8820C] text-white' : 'bg-white text-black/20 border border-black/5'}`}>
                                            {b.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-black text-[#1A1A2E] truncate tracking-tight">{b.name}</p>
                                        <p className="text-[10px] text-black/30 truncate font-medium italic mt-1 leading-tight">{b.lastMsg}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area: Tactical Interface */}
            <div className="flex-1 flex flex-col bg-white relative">
                {/* Chat Header: Current Focus */}
                <div className="h-28 px-10 border-b border-black/5 flex items-center justify-between bg-white/90 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="md:hidden p-4 -ml-4 bg-gray-100 rounded-2xl text-[#1A1A2E] hover:bg-[#E8820C] hover:text-white transition-all shadow-sm"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative group">
                            <div className="w-16 h-16 rounded-[2rem] bg-[#1A1A2E] flex items-center justify-center text-white shadow-2xl relative z-10 group-hover:scale-105 transition-transform">
                                {activeTab === 'public' ? <Signal size={32} className="text-[#E8820C]" /> : <User size={32} />}
                            </div>
                            <div className="absolute -inset-3 bg-[#E8820C]/10 rounded-[2.5rem] blur opacity-50 group-hover:opacity-80 transition-opacity"></div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tight truncate font-serif">
                                    {activeTab === 'public' ? 'Strategic Room' : currentBrother?.name}
                                </h3>
                                <button onClick={() => togglePin(activeTab)} className={`p-1.5 rounded-xl transition-all ${pinnedChats.includes(activeTab) ? 'text-[#E8820C] bg-[#E8820C]/10 shadow-inner' : 'text-black/10 hover:text-black/30'}`}>
                                    <ShieldLock size={16} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.25em]">Channel Synchronized</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isSearchOpen ? (
                            <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-black/5 shadow-inner animate-in slide-in-from-right-8 w-64">
                                <Search size={16} className="text-[#E8820C]" />
                                <input
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search archive..."
                                    className="bg-transparent border-0 outline-none text-[10px] font-black uppercase tracking-widest w-full"
                                />
                                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-1 hover:bg-black/5 rounded-lg"><X size={14} /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="hidden sm:flex p-4 rounded-2xl border border-black/5 text-black/20 hover:text-[#1A1A2E] hover:bg-gray-50 transition-all font-black text-[10px] uppercase tracking-[0.4em] gap-3"
                            >
                                <Search size={18} /> Archive
                            </button>
                        )}
                        <button
                            onClick={() => setShowMedia(!showMedia)}
                            className={`p-4 rounded-2xl border border-black/5 transition-all shadow-sm ${showMedia ? 'bg-[#1A1A2E] text-[#F5A623] border-[#F5A623]/20' : 'text-black/20 hover:text-[#1A1A2E]'}`}
                        >
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Container: The Relay */}
                <div className="flex-1 flex overflow-hidden relative">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-16 space-y-12 bg-gray-50/20 scroll-smooth relative z-10">
                        {loading ? (
                            <div className="flex h-full items-center justify-center flex-col gap-6">
                                <div className="w-16 h-16 border-4 border-[#E8820C]/10 border-t-[#E8820C] rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1A1A2E]/30 animate-pulse">Establishing Secure Relay...</p>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            filteredMessages.map((msg, i) => {
                                const showAvatar = !msg.isMe && activeTab === 'public' && (i === 0 || filteredMessages[i - 1].sender !== msg.sender);
                                return (
                                    <div key={msg.id} className={`flex items-end gap-5 ${msg.isMe ? 'justify-end' : 'justify-start'} ${!showAvatar && !msg.isMe ? 'ml-19' : ''}`}>
                                        {showAvatar && (
                                            <div className="w-14 h-14 rounded-2xl bg-[#1A1A2E] text-white flex items-center justify-center text-[12px] font-black shadow-2xl mb-8 shrink-0 border-2 border-white">
                                                {msg.sender.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] sm:max-w-xl flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            {showAvatar && <p className="text-[9px] font-black text-[#E8820C] mb-3 uppercase tracking-[0.4em] ml-2">{msg.sender}</p>}

                                            <div className={`p-6 md:p-8 text-sm leading-relaxed shadow-xl transition-all hover:shadow-2xl relative overflow-hidden group/bubble ${msg.isMe
                                                ? 'bg-[#1A1A2E] text-white rounded-[3rem] rounded-br-none border border-white/5'
                                                : 'bg-white border border-black/5 text-[#1A1A2E] rounded-[3rem] rounded-bl-none'
                                                }`}>

                                                {msg.isMe && <div className="absolute top-0 right-0 p-8 text-white/[0.03] group-hover/bubble:text-white/10 transition-colors"><Fingerprint size={100} /></div>}

                                                {/* Render content based on type */}
                                                {!msg.type || msg.type === 'text' ? (
                                                    <p className="relative z-10 font-serif text-lg leading-relaxed">{msg.text}</p>
                                                ) : msg.type === 'image' ? (
                                                    <div className="space-y-4 relative z-10">
                                                        <img src={msg.content?.url} alt="Shared" className="rounded-[2.5rem] w-full h-auto max-h-80 object-cover shadow-2xl border border-white/10 group-hover/bubble:scale-[1.02] transition-transform duration-700" />
                                                        <p className="text-[11px] opacity-60 italic font-serif">{msg.text}</p>
                                                    </div>
                                                ) : msg.type === 'voice' ? (
                                                    <div className="flex items-center gap-5 min-w-[200px] relative z-10">
                                                        <button className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${msg.isMe ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#E8820C] text-white hover:bg-[#F5A623]'}`}>
                                                            <Play size={24} fill="currentColor" />
                                                        </button>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-1">
                                                                {[1, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7, 0.3].map((h, k) => (
                                                                    <div key={k} className={`flex-1 rounded-full transition-all duration-1000 ${msg.isMe ? 'bg-white/20' : 'bg-[#1A1A2E]/5'}`} style={{ height: `${h * 16}px` }}></div>
                                                                ))}
                                                            </div>
                                                            <p className="text-[9px] font-black uppercase opacity-40 tracking-[0.3em]">{msg.content?.duration || '0:00'} Secure Recording</p>
                                                        </div>
                                                    </div>
                                                ) : msg.type === 'poll' ? (
                                                    <div className="space-y-6 relative z-10 min-w-[250px]">
                                                        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-2">
                                                            <BarChart3 size={20} className="text-[#E8820C]" />
                                                            <p className="font-black text-lg font-serif">{msg.text}</p>
                                                        </div>
                                                        {msg.content?.options.map((opt, idx) => {
                                                            const votes = msg.content.votes[idx];
                                                            const total = msg.content.votes.reduce((a, b) => a + b, 0);
                                                            const pct = Math.round((votes / total) * 100);
                                                            return (
                                                                <div key={idx} className="space-y-2 cursor-pointer group/poll relative">
                                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-60 px-2">
                                                                        <span>{opt}</span>
                                                                        <span>{pct}%</span>
                                                                    </div>
                                                                    <div className={`h-3 w-full rounded-full ${msg.isMe ? 'bg-white/10' : 'bg-gray-50'} overflow-hidden border border-white/5`}>
                                                                        <div className="h-full bg-[#E8820C] rounded-full transition-all duration-1000 shadow-[0_0_15px_#E8820C]" style={{ width: `${pct}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                        <p className="text-[9px] opacity-30 italic font-black uppercase tracking-widest text-center">Protocol: Single Vote Authorization</p>
                                                    </div>
                                                ) : msg.type === 'document' ? (
                                                    <div className="flex items-center gap-6 p-4 bg-white/5 rounded-[2.5rem] border border-white/10 relative z-10">
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${msg.isMe ? 'bg-white/10' : 'bg-[#1A1A2E]/5'} text-[#E8820C] shadow-inner`}>
                                                            <FileText size={32} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black truncate tracking-tight">{msg.content?.text}</p>
                                                            <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mt-1">{msg.content?.size} • Verified</p>
                                                        </div>
                                                        <button className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                                                            <Download size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="relative z-10 font-serif text-lg leading-relaxed">{msg.text}</p>
                                                )}
                                            </div>

                                            <div className={`flex items-center gap-3 mt-4 ${msg.isMe ? 'mr-4' : 'ml-4'}`}>
                                                <p className="text-[9px] text-black/20 font-black uppercase tracking-[0.4em]">{msg.time}</p>
                                                {msg.isMe && <div className="text-emerald-500 flex items-center gap-1">
                                                    <CheckCircle2 size={12} strokeWidth={4} />
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Relayed</span>
                                                </div>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 max-w-sm mx-auto opacity-40">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-[#1A1A2E] flex items-center justify-center text-[#E8820C] shadow-2xl relative">
                                    <MessageSquare size={48} />
                                    <div className="absolute -inset-4 bg-[#E8820C]/10 rounded-[3rem] blur animate-pulse"></div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-serif text-3xl font-black text-[#1A1A2E]">Tactical Silence</h4>
                                    <p className="text-sm font-black uppercase tracking-[0.2em] leading-relaxed text-[#1A1A2E]/60">
                                        Establish communication. Collective intelligence is the bedrock of sovereignty.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Media Archive Sidebar */}
                    {showMedia && (
                        <div className="w-96 border-l border-black/5 bg-white p-10 animate-in slide-in-from-right-16 hidden lg:block overflow-y-auto z-20 shadow-2xl relative">
                            <div className="flex items-center gap-4 mb-10 border-b border-black/5 pb-6">
                                <Image size={24} className="text-[#E8820C]" />
                                <h4 className="text-xl font-black font-serif text-[#1A1A2E]">Shared Archive</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-5 mb-10">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-[#E8820C]/30 overflow-hidden flex items-center justify-center text-black/5 hover:text-[#E8820C] transition-all cursor-pointer shadow-sm group">
                                        <Lock size={32} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-[#1A1A2E] rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                                    <ShieldLock size={80} />
                                </div>
                                <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F5A623] mb-4">Encryption Protocol v4</h5>
                                <p className="text-[11px] text-white/50 leading-relaxed font-serif italic">
                                    All transmissions within this registry are secured via end-to-end brotherhood verification keys. No data leaks, no compromise.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Message Input: Transmission Uplink */}
                <div className="p-10 bg-white border-t border-black/5 relative z-30">
                    {/* Multi-functional Attachment Menu */}
                    {showAttachments && (
                        <div className="absolute bottom-[100%] left-10 right-10 mb-8 p-8 bg-white/90 backdrop-blur-2xl rounded-[4rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.3)] border border-black/5 animate-in slide-in-from-bottom-12 grid grid-cols-5 md:grid-cols-10 gap-6 z-50">
                            {[
                                { id: 'voice', icon: Mic, label: 'Voice', color: '#E8820C' },
                                { id: 'image', icon: Image, label: 'Visual', color: '#1A1A2E' },
                                { id: 'video', icon: Video, label: 'Stream', color: '#1A1A2E' },
                                { id: 'document', icon: FileText, label: 'Ledger', color: '#1A1A2E' },
                                { id: 'camera', icon: Camera, label: 'Optic', color: '#1A1A2E' },
                                { id: 'location', icon: MapPin, label: 'Coords', color: '#1A1A2E' },
                                { id: 'contact', icon: UserPlus, label: 'Node', color: '#1A1A2E' },
                                { id: 'audio', icon: Play, label: 'Audio', color: '#1A1A2E' },
                                { id: 'poll', icon: BarChart3, label: 'Ballot', color: '#1A1A2E' },
                                { id: 'event', icon: Calendar, label: 'Summit', color: '#1A1A2E' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleAttachmentClick(item.id)}
                                    className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-white transition-all group/item hover:shadow-2xl hover:-translate-y-2"
                                >
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover/item:rotate-12 transition-all" style={{ background: item.color }}>
                                        <item.icon size={24} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 group-hover/item:text-[#1A1A2E]">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={(e) => handleSend(e)} className="relative group max-w-6xl mx-auto">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-[3rem] blur opacity-5 group-focus-within:opacity-20 transition duration-700"></div>
                        <div className="relative bg-gray-50 border-2 border-transparent focus-within:border-[#E8820C]/20 rounded-[2.5rem] p-3 flex items-center gap-2 transition-all focus-within:bg-white focus-within:shadow-2xl">
                            <button
                                type="button"
                                onClick={() => setShowAttachments(!showAttachments)}
                                className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all shadow-lg active:scale-90 ${showAttachments ? 'bg-red-500 text-white rotate-45' : 'bg-[#1A1A2E] text-white hover:bg-[#252545]'}`}
                            >
                                <Plus size={28} />
                            </button>

                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-1 bg-transparent border-0 outline-none text-lg font-serif italic py-4 px-6 text-[#1A1A2E] placeholder:text-black/10"
                                placeholder={activeTab === 'public' ? "Draft strategy for the room..." : `Private uplink with Brother ${currentBrother?.name.split(' ')[0]}...`}
                            />

                            <button
                                type="submit"
                                disabled={!inputText.trim() || sending}
                                className="w-16 h-16 rounded-[1.5rem] bg-[#E8820C] text-white shadow-2xl shadow-[#E8820C]/40 hover:bg-[#F5A623] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 disabled:shadow-none flex items-center justify-center"
                            >
                                {sending ? <Loader2 size={28} className="animate-spin" /> : <Send size={28} strokeWidth={3} />}
                            </button>
                        </div>
                    </form>
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-black/20 italic">
                            <Lock size={10} /> End-to-End Encryption Active
                        </div>
                        <div className="w-1 h-1 rounded-full bg-black/10"></div>
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-black/20 italic">
                            <Zap size={10} /> Ultra-low Latency Uplink
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
