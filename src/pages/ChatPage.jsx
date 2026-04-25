import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    Send, User, Search, MoreVertical, Paperclip, X,
    CheckCircle2, MessageSquare, Image, Video, Mic, MapPin, UserPlus,
    FileText, BarChart3, Calendar, Camera, Plus, Play, Pause, Download,
    Loader2, Zap, Signal, Fingerprint, Lock, Menu
} from 'lucide-react';
import { fetchMessages, sendMessage, fetchChatBrothers } from '../api/chat';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';

export default function ChatPage() {
    const { user } = useAuth();
    const { config } = usePageConfig('chat');
    const [activeTab, setActiveTab] = useState('public');
    const [messages, setMessages] = useState([]);
    const [brothers, setBrothers] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [pinnedChats, setPinnedChats] = useState(['public']);
    const [showMedia, setShowMedia] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        const loadBrothers = async () => {
            try {
                const data = await fetchChatBrothers();
                setBrothers(data);
            } catch (err) {
                console.error('Failed to load brothers:', err);
            }
        };
        loadBrothers();
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchMessages(activeTab)
            .then(setMessages)
            .catch(() => setMessages([]))
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
            setMessages(prev => [...prev, newMsg]);
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
    };

    const togglePin = (id) => {
        setPinnedChats(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredMessages = searchQuery
        ? messages.filter(m => (m.text || '').toLowerCase().includes(searchQuery.toLowerCase()))
        : messages;

    const currentBrother = brothers.find(b => b._id === activeTab);

    return (
        <div className="flex h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border border-black/5 bg-white relative mx-2 md:mx-0">
            {showSidebar && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setShowSidebar(false)} />
            )}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 border-r border-black/5 flex flex-col bg-gray-50/50 backdrop-blur-xl transition-all duration-500 md:relative md:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-black/5 bg-white/80">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black font-serif text-[#1A1A2E] leading-none">{config.channelName || 'Registry'}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E8820C] mt-2">Active Comms Nodes</p>
                        </div>
                        <button onClick={() => setShowSidebar(false)} className="md:hidden text-black/20 hover:text-black/60"><X size={20} /></button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C]" size={16} />
                        <input className="w-full bg-gray-100 border-2 border-transparent focus:border-[#E8820C]/20 rounded-2xl pl-12 pr-4 py-4 text-[10px] outline-none font-black uppercase tracking-widest placeholder:text-black/10" placeholder="Locate Brother..." />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="mb-8">
                        <p className="px-4 text-[9px] uppercase font-black text-[#E8820C] tracking-[0.4em] mb-4">Strategic Locks</p>
                        <button onClick={() => { setActiveTab('public'); setShowSidebar(false); }} className={`w-full flex items-center gap-5 p-5 rounded-[2.5rem] transition-all relative ${activeTab === 'public' ? 'bg-white shadow-xl' : 'hover:bg-white/50 opacity-60'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${activeTab === 'public' ? 'bg-[#1A1A2E] text-white shadow-lg' : 'bg-white text-black/20 border border-black/5'}`}>
                                <Signal size={24} className="text-[#E8820C]" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-sm font-black text-[#1A1A2E]">Brotherhood Core</p>
                                <p className="text-[9px] text-[#E8820C] font-black uppercase tracking-widest mt-1">High Bandwidth</p>
                            </div>
                        </button>
                    </div>
                    <div className="mb-6">
                        <p className="px-4 text-[9px] uppercase font-black text-black/20 tracking-[0.4em] mb-4">Relay History</p>
                        <div className="space-y-2">
                            {brothers.map(b => (
                                <button key={b._id} onClick={() => { setActiveTab(b._id); setShowSidebar(false); }} className={`w-full flex items-center gap-5 p-5 rounded-[2.5rem] transition-all relative ${activeTab === b._id ? 'bg-white shadow-xl' : 'hover:bg-white/50 opacity-60'}`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${activeTab === b._id ? 'bg-[#E8820C] text-white' : 'bg-white text-black/20 border border-black/5'}`}>
                                        {b.name?.[0]}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-black text-[#1A1A2E] truncate tracking-tight">{b.name}</p>
                                        <p className="text-[10px] text-black/30 truncate mt-1 leading-tight">{b.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white relative">
                <div className="h-20 md:h-28 px-4 md:px-10 border-b border-black/5 flex items-center justify-between bg-white/90 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={() => setShowSidebar(true)} className="md:hidden p-2.5 bg-gray-100 rounded-xl"><Menu size={18} /></button>
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-[#1A1A2E] flex items-center justify-center text-white relative z-10">
                            {activeTab === 'public' ? <Signal size={24} className="text-[#E8820C]" /> : <User size={24} />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base md:text-2xl font-black text-[#1A1A2E] truncate font-serif">
                                {activeTab === 'public' ? 'Strategic Room' : currentBrother?.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                <p className="text-[8px] md:text-[10px] text-emerald-600 font-black uppercase tracking-widest">Synchronized</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setShowMedia(!showMedia)} className={`p-4 rounded-2xl border border-black/5 transition-all shadow-sm ${showMedia ? 'bg-[#1A1A2E] text-[#F5A623]' : 'text-black/20'}`}>
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden relative">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-16 space-y-8 bg-gray-50/20 scroll-smooth relative z-10">
                        {loading ? (
                            <div className="flex h-full items-center justify-center flex-col gap-6">
                                <Loader2 size={32} className="animate-spin text-[#E8820C]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1A1A2E]/30">Establishing Secure Relay...</p>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            filteredMessages.map((msg) => (
                                <div key={msg._id || msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 md:p-8 text-sm md:text-lg shadow-xl relative max-w-[85%] ${msg.isMe ? 'bg-[#1A1A2E] text-white rounded-[2rem] rounded-br-none' : 'bg-white text-[#1A1A2E] rounded-[2rem] rounded-bl-none border border-black/5'}`}>
                                        {!msg.isMe && <p className="text-[9px] font-black text-[#E8820C] mb-2 uppercase tracking-[0.4em]">{msg.senderName}</p>}
                                        <p className="font-serif leading-relaxed">{msg.text}</p>
                                    </div>
                                    <p className="text-[9px] text-black/20 font-black uppercase tracking-[0.4em] mt-3 mx-4">{(msg.createdAt || msg.time) ? dayjs(msg.createdAt || msg.time).format('HH:mm') : ''}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-40">
                                <MessageSquare size={48} className="text-[#1A1A2E]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px]">Establish communication. Collective intelligence is the bedrock of sovereignty.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 md:p-10 bg-white border-t border-black/5 relative z-30">
                    {showAttachments && (
                        <div className="absolute bottom-[100%] left-2 right-2 md:left-10 md:right-10 mb-4 p-8 bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-black/5 animate-in slide-in-from-bottom-12 grid grid-cols-5 gap-6 z-50">
                            {[
                                { id: 'voice', icon: Mic, label: 'Voice' },
                                { id: 'image', icon: Image, label: 'Visual' },
                                { id: 'document', icon: FileText, label: 'Ledger' },
                                { id: 'location', icon: MapPin, label: 'Coords' },
                                { id: 'poll', icon: BarChart3, label: 'Ballot' },
                            ].map(item => (
                                <button key={item.id} type="button" onClick={() => handleAttachmentClick(item.id)} className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-white transition-all group">
                                    <div className="w-14 h-14 rounded-2xl bg-[#1A1A2E] text-white flex items-center justify-center group-hover:rotate-12 transition-all"><item.icon size={24} /></div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 group-hover:text-[#1A1A2E]">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSend} className="relative max-w-6xl mx-auto flex items-center gap-4">
                        <button type="button" onClick={() => setShowAttachments(!showAttachments)} className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all ${showAttachments ? 'bg-red-500 text-white rotate-45' : 'bg-[#1A1A2E] text-white'}`}><Plus size={24} /></button>
                        <input value={inputText} onChange={(e) => setInputText(e.target.value)} className="flex-1 bg-gray-50 border-2 border-transparent focus-within:border-[#E8820C]/20 rounded-2xl py-4 px-6 text-lg font-serif italic outline-none" placeholder="Draft transmission..." />
                        <button type="submit" disabled={!inputText.trim() || sending} className="w-14 h-14 shrink-0 rounded-2xl bg-[#E8820C] text-white flex items-center justify-center shadow-xl disabled:opacity-20">
                            {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                        </button>
                    </form>
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-black/20 italic"><Lock size={10} /> End-to-End Encryption</div>
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em] text-black/20 italic"><Zap size={10} /> Secure Relay</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
