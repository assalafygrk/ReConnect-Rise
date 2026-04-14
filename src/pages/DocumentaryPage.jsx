import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import {
    Upload, FileText, Image as ImageIcon, Plus, X, Search,
    Download, ExternalLink, Filter, MoreVertical, Grid, List,
    Calendar, User, Tag, Info, ChevronLeft, ChevronRight, Maximize2,
    Database, ShieldCheck, HardDrive, Archive, Loader2, Fingerprint
} from 'lucide-react';

const MOCK_GALLERY = [
    {
        id: 1,
        title: 'Strategic Summit - Q1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1523240715630-971c469b71f9?q=80&w=1200',
        date: '2026-03-15',
        author: 'Admin',
        tags: ['Strategy', 'Garki'],
        description: 'Quarterly objective alignment and resource optimization summit.'
    },
    {
        id: 2,
        title: 'Community Empowerment Initiative',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200',
        date: '2026-02-28',
        author: 'Ola Fashola',
        tags: ['Outreach', 'Philanthropy'],
        description: 'Operationalizing support for local socio-economic development.'
    },
    {
        id: 3,
        title: 'Brotherhood Convocation 2025',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200',
        date: '2025-12-20',
        author: 'Super Admin',
        tags: ['Convention', 'Legacy'],
        description: 'Annual assembly documenting our collective trajectory and sovereignty.'
    },
    {
        id: 4,
        title: 'Infrastructure Launch Phase 1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200',
        date: '2026-01-05',
        author: 'Kola Ayoola',
        tags: ['Infrastructure', 'Operations'],
        description: 'Deployment of phase 1 strategic assets for community empowerment.'
    },
];

const MOCK_FILES = [
    { id: 1, title: 'Strategic_Fiscal_Policy_2026.pdf', type: 'pdf', size: '2.4 MB', date: '2026-01-10', author: 'Treasurer' },
    { id: 2, title: 'Constitutional_Charter_v3.docx', type: 'doc', size: '1.1 MB', date: '2025-11-05', author: 'Admin' },
    { id: 3, title: 'Q2_Expansion_Proposal.pptx', type: 'presentation', size: '5.8 MB', date: '2026-03-01', author: 'Leader' },
    { id: 4, title: 'Audited_Ledger_Archive.xlsx', type: 'sheet', size: '3.2 MB', date: '2026-02-15', author: 'Treasurer' },
];

export default function DocumentaryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    const [activeTab, setActiveTab] = useState('gallery'); // gallery, files
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredGallery = MOCK_GALLERY.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredFiles = MOCK_FILES.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('Archive Material Synchronized');
            setShowUploadModal(false);
        } catch (err) {
            toast.error('System Synchronization Failure');
        } finally {
            setUploading(false);
        }
    };

    if (isInitialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-[#E8820C]/10 border-t-[#E8820C] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[#E8820C]">
                        <HardDrive size={32} className="animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1A1A2E]/40">Accessing Vaults...</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#E8820C]">Encryption Level: Institutional</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-4 md:p-8">
            {/* Serious System Header */}
            <div className="relative bg-[#1A1A2E] rounded-[3.5rem] p-10 md:p-16 overflow-hidden shadow-2xl group border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E8820C] to-[#F5A623] rounded-full blur-[150px] opacity-5 group-hover:opacity-15 transition-opacity duration-1000"></div>
                <div className="absolute -bottom-20 -left-20 text-white/[0.02] -rotate-12 select-none group-hover:text-white/[0.05] transition-colors duration-1000">
                    <Fingerprint size={400} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C]">
                            <Archive size={14} /> Institutional Memory Node
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black font-serif text-white leading-tight tracking-tight">Archives & <br />Documentation</h2>
                        <p className="text-white/40 text-xl font-serif italic max-w-2xl leading-relaxed">
                            "Preserving our collective journey is the prerequisite for strategic sovereignty. This vault documents the evolution of our brotherhood."
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="w-full md:w-auto px-10 py-5 rounded-[2rem] bg-[#E8820C] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#E8820C]/20 hover:bg-[#F5A623] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            <Plus size={24} strokeWidth={3} /> Catalog New Entry
                        </button>
                        <div className="flex items-center gap-4 justify-center md:justify-start px-2">
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                                <ShieldCheck size={12} className="text-emerald-500" /> Secure Vault
                            </div>
                            <div className="w-1 h-1 rounded-full bg-white/10"></div>
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                                <Database size={12} className="text-[#E8820C]" /> 1.2 PB Distributed
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Control Bar */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-6 shadow-2xl border border-black/5 flex flex-col lg:flex-row items-center gap-8 relative z-40 relative top-4">
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-[2rem] w-full lg:w-auto shadow-inner">
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'gallery' ? 'bg-white text-[#1A1A2E] shadow-xl' : 'text-black/30 hover:text-black/60'}`}
                    >
                        <ImageIcon size={16} /> Visual Assets
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'files' ? 'bg-white text-[#1A1A2E] shadow-xl' : 'text-black/30 hover:text-black/60'}`}
                    >
                        <FileText size={16} /> Tactical Repository
                    </button>
                </div>

                <div className="flex-1 w-full lg:max-w-2xl relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" size={20} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search vaults by title, author, or strategic tags..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/20 rounded-[2rem] pl-16 pr-8 py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:bg-white focus:shadow-2xl focus:shadow-black/5 transition-all placeholder:text-black/10 shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <div className="hidden sm:flex items-center gap-2 bg-gray-100 p-2 rounded-[1.5rem] shadow-inner">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-[#E8820C] shadow-lg' : 'text-black/20 hover:text-black/40'}`}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-[#E8820C] shadow-lg' : 'text-black/20 hover:text-black/40'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <button className="p-5 bg-gray-100 rounded-[1.5rem] text-black/40 hover:bg-[#1A1A2E] hover:text-[#F5A623] transition-all shadow-inner group">
                        <Filter size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Vault Display Area */}
            {activeTab === 'gallery' ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {filteredGallery.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedMedia(item)}
                                className="group bg-white rounded-[3rem] overflow-hidden border border-black/5 shadow-lg hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-4 transition-all duration-700 cursor-pointer p-3"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="aspect-[4/5] relative overflow-hidden rounded-[2.5rem] mb-6">
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover grayscale brightness-75 contrast-125 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 group-hover:scale-110 transition-all duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700"></div>
                                    <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedMedia(item); }}
                                                className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl text-white hover:bg-[#E8820C] transition-all flex items-center justify-center shadow-2xl"
                                            >
                                                <Maximize2 size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl text-white hover:bg-[#E8820C] transition-all flex items-center justify-center shadow-2xl"
                                            >
                                                <Download size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-6 right-6">
                                        <span className="px-4 py-1.5 bg-black/40 backdrop-blur-xl text-[9px] font-black uppercase tracking-[0.3em] text-white border border-white/10 rounded-full shadow-2xl">
                                            Vault Item {item.id}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 space-y-6">
                                    <div className="space-y-2">
                                        <h4 className="font-black text-[#1A1A2E] leading-tight font-serif text-2xl group-hover:text-[#E8820C] transition-colors duration-500">{item.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-black/20 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={12} className="text-[#E8820C]" /> {dayjs(item.date).format('MMMM D, YYYY')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.tags?.map(tag => (
                                            <span key={tag} className="px-3 py-1.5 bg-gray-50 border border-black/5 text-[9px] font-black uppercase tracking-widest text-black/40 rounded-xl hover:bg-[#1A1A2E] hover:text-[#F5A623] hover:border-[#F5A623]/20 transition-all cursor-default">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3.5rem] border border-black/5 shadow-2xl p-4 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="whitespace-nowrap">
                                <tr className="border-b-2 border-black/5">
                                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-black/20">Archive Meta</th>
                                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-black/20">Strategic Narrative</th>
                                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-black/20">Catalog Agent</th>
                                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-black/20 text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 whitespace-nowrap md:whitespace-normal">
                                {filteredGallery.map(item => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedMedia(item)}
                                        className="hover:bg-gray-50/50 transition-all duration-500 group/row cursor-pointer"
                                    >
                                        <td className="px-10 py-10">
                                            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative rotate-3 group-hover/row:rotate-0 transition-transform duration-700">
                                                <img src={item.url} alt="" className="w-full h-full object-cover grayscale group-hover/row:grayscale-0 transition-all duration-1000" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                    <Maximize2 size={24} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 max-w-xl">
                                            <h4 className="font-black text-[#1A1A2E] text-xl font-serif leading-tight group-hover/row:text-[#E8820C] transition-colors">{item.title}</h4>
                                            <p className="text-[13px] text-black/40 mt-3 italic line-clamp-2 leading-relaxed font-serif">"{item.description}"</p>
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] text-[#F5A623] flex items-center justify-center text-[12px] font-black shadow-lg">
                                                    {item.author[0]}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-[#1A1A2E] tracking-tight">{item.author}</span>
                                                    <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mt-0.5">Authorized User</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover/row:translate-x-0 group-hover/row:opacity-100 transition-all duration-700">
                                                <button
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-12 h-12 bg-white border border-black/5 text-[#E8820C] hover:bg-[#E8820C] hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-xl hover:shadow-[#E8820C]/30"
                                                >
                                                    <Download size={20} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toast('Accessing External Relay...'); }}
                                                    className="w-12 h-12 bg-white border border-black/5 text-black/20 hover:text-[#1A1A2E] hover:border-[#1A1A2E] rounded-2xl transition-all flex items-center justify-center shadow-xl"
                                                >
                                                    <ExternalLink size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {filteredFiles.map((file, idx) => (
                        <div
                            key={file.id}
                            onClick={() => setSelectedMedia({ ...file, url: null, description: 'Internal document recorded in the brotherhood institutional treasury.' })}
                            className="group bg-white p-10 rounded-[3.5rem] border border-black/5 shadow-lg hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-700 cursor-pointer relative overflow-hidden"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="absolute top-0 right-0 p-10 text-black/[0.02] group-hover:text-[#E8820C]/5 group-hover:scale-150 transition-all duration-1000">
                                <Archive size={120} />
                            </div>
                            <div className="flex items-start justify-between mb-10 relative z-10">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden ${file.type === 'pdf' ? 'bg-red-50 text-red-500' :
                                    file.type === 'presentation' ? 'bg-[#E8820C]/10 text-[#E8820C]' :
                                        file.type === 'sheet' ? 'bg-emerald-50 text-emerald-500' : 'bg-[#1A1A2E]/5 text-[#1A1A2E]'
                                    }`}>
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-30 transition-opacity"></div>
                                    <FileText size={40} className="relative z-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="px-5 py-2 bg-gray-50 border border-black/5 rounded-full text-[9px] font-black text-black/30 uppercase tracking-[0.3em] group-hover:text-black/60 transition-colors shadow-inner">{file.type}</span>
                            </div>
                            <div className="space-y-8 relative z-10">
                                <div className="space-y-3">
                                    <h4 className="font-black text-[#1A1A2E] text-2xl font-serif leading-tight group-hover:text-[#E8820C] transition-colors duration-500">{file.title}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] text-black/20 font-black uppercase tracking-[0.2em]">{file.size} Strategic Data</span>
                                        <div className="w-1 h-1 rounded-full bg-black/10"></div>
                                        <span className="text-[10px] text-black/20 font-black uppercase tracking-[0.2em]">{dayjs(file.date).format('MM/YYYY')}</span>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#1A1A2E] text-[#F5A623] flex items-center justify-center text-[11px] font-black shadow-lg">
                                            {file.author[0]}
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-black text-[#1A1A2E] tracking-tight">{file.author}</span>
                                            <p className="text-[8px] text-black/30 font-black uppercase tracking-widest">Authorized Source</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-14 h-14 bg-gray-100 text-black/20 hover:text-white hover:bg-[#E8820C] rounded-2xl transition-all flex items-center justify-center shadow-inner hover:shadow-2xl hover:shadow-[#E8820C]/30"
                                    >
                                        <Download size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty States: Tactical Zero */}
            {((activeTab === 'gallery' && filteredGallery.length === 0) || (activeTab === 'files' && filteredFiles.length === 0)) && (
                <div className="py-48 text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative w-48 h-48 bg-gray-50 rounded-[4rem] flex items-center justify-center mx-auto text-black/[0.02] shadow-inner group">
                        <ImageIcon size={100} className="relative z-10 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#E8820C]/10 to-transparent animate-pulse rounded-[4rem]"></div>
                        <Search size={40} className="absolute -bottom-4 -right-4 text-black/10 group-hover:text-[#E8820C] transition-colors" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-4xl font-serif font-black text-[#1A1A2E]">Archives Silent</h3>
                        <p className="text-black/40 max-w-md mx-auto text-xl leading-relaxed italic font-serif leading-relaxed">
                            "The tactical search query returned zero nodes. The requested intelligence has not yet been documented in this specific vault."
                        </p>
                    </div>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="text-[11px] font-black uppercase tracking-[0.5em] text-[#E8820C] border-b-4 border-[#E8820C]/20 pb-2 hover:text-[#1A1A2E] hover:border-[#1A1A2E] transition-all"
                    >
                        Reset Protocol Parameters
                    </button>
                </div>
            )}

            {/* Media Viewer Modal: Professional Insight */}
            {selectedMedia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[#1A1A2E]/98 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setSelectedMedia(null)}></div>
                    <div className="relative bg-white rounded-[4rem] w-full max-w-7xl h-full max-h-[85vh] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-12 duration-700">
                        <div className="relative flex-1 bg-black flex items-center justify-center group/viewer overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>
                            {selectedMedia.url ? (
                                <img src={selectedMedia.url} alt="" className="w-full h-full object-contain group-hover/viewer:scale-[1.02] transition-transform duration-2000" />
                            ) : (
                                <div className="flex flex-col items-center gap-8 text-white/10">
                                    <FileText size={160} className="animate-pulse" />
                                    <p className="text-[12px] font-black uppercase tracking-[1em]">Tactical Data Node</p>
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="absolute top-10 left-10 p-5 bg-white/5 backdrop-blur-2xl text-white rounded-[1.5rem] hover:bg-[#E8820C] hover:rotate-12 transition-all z-20 border border-white/10 shadow-2xl group/close"
                            >
                                <ChevronLeft size={28} className="group-hover/close:-translate-x-1 transition-transform" />
                            </button>
                            <div className="absolute bottom-10 inset-x-10 p-8 bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 text-white/50 text-[10px] uppercase font-black tracking-[0.5em] flex justify-between items-center translate-y-24 group-hover/viewer:translate-y-0 transition-transform duration-700">
                                <span>Vault Node: {selectedMedia.id}</span>
                                <div className="flex items-center gap-4">
                                    <Maximize2 size={16} />
                                    <Info size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[450px] p-6 md:p-16 bg-white space-y-12 overflow-y-auto">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-2">
                                    <span className="px-5 py-2 bg-[#E8820C]/10 text-[#E8820C] text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-[#E8820C]/20 shadow-inner">Entry #{selectedMedia.id}</span>
                                    <button onClick={() => setSelectedMedia(null)} className="p-4 bg-gray-50 text-black/20 hover:text-red-500 rounded-2xl transition-all hover:rotate-90 group/x">
                                        <X size={24} strokeWidth={3} />
                                    </button>
                                </div>
                                <h3 className="text-4xl font-black font-serif text-[#1A1A2E] leading-tight tracking-tight">{selectedMedia.title}</h3>
                                <div className="grid grid-cols-2 gap-6 py-8 border-y-2 border-black/5">
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-black/20 font-black uppercase tracking-widest">Cataloged Agent</p>
                                        <p className="text-base font-black text-[#1A1A2E] flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div> {selectedMedia.author}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-black/20 font-black uppercase tracking-widest">Catalog Date</p>
                                        <p className="text-base font-black text-[#1A1A2E] tracking-tight">{dayjs(selectedMedia.date).format('DD MMM YYYY')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C]">Strategic Narrative</h5>
                                    <p className="text-xl font-serif italic text-black/50 leading-relaxed bg-gray-50 p-6 rounded-[2rem] border-l-4 border-[#E8820C]">
                                        "{selectedMedia.description}"
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Metadata Tags</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMedia.tags?.map(tag => (
                                            <span key={tag} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-black/5 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] rounded-2xl shadow-sm hover:border-[#E8820C]/30 transition-all cursor-default">
                                                <Tag size={12} className="text-[#E8820C]" /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 space-y-4">
                                <button className="w-full py-6 rounded-[2rem] bg-[#1A1A2E] text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-[#252545] hover:-translate-y-2 active:scale-95 transition-all flex items-center justify-center gap-4 group">
                                    <Download size={24} className="group-hover:bounce" /> Synchronize Local Mirror
                                </button>
                                <button className="w-full py-6 rounded-[2rem] border-2 border-black/5 text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:bg-gray-50 hover:text-[#1A1A2E] transition-all flex items-center justify-center gap-3">
                                    <ExternalLink size={20} /> Request High-Level Access
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Deposit Modal: Institutional Asset Entry */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-[#1A1A2E]/90 overflow-hidden">
                    <div className="absolute inset-0" onClick={() => !uploading && setShowUploadModal(false)}></div>
                    <div className="relative bg-white rounded-[4.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-16 shadow-[0_0_150px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
                        <div className="flex items-center justify-between mb-8 md:mb-12 sticky top-0 bg-white z-20 py-2">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#E8820C]/10 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-[#E8820C]">
                                    <Upload size={10} /> Inbound Relay
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black font-serif text-[#1A1A2E] leading-none">Material Deposit</h3>
                                <p className="text-[10px] text-black/20 uppercase tracking-[0.4em] font-black italic mt-2">Documenting the trajectory</p>
                            </div>
                            <button onClick={() => !uploading && setShowUploadModal(false)} className="p-4 md:p-5 bg-gray-50 text-black/20 hover:text-red-500 rounded-3xl transition-all hover:rotate-90 group">
                                <X size={24} strokeWidth={4} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-10">
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-2 bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-[3.5rem] blur opacity-10 group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative border-2 border-dashed border-black/10 bg-gray-50/50 rounded-[3rem] p-16 text-center space-y-8 hover:bg-white hover:border-[#E8820C]/30 transition-all duration-700">
                                    <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mx-auto text-[#E8820C] shadow-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-1000 relative">
                                        <div className="absolute inset-0 bg-[#E8820C]/5 rounded-3xl animate-ping"></div>
                                        {uploading ? <Loader2 size={48} className="animate-spin" /> : <Upload size={48} />}
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-2xl font-black text-[#1A1A2E] font-serif uppercase tracking-tight">Stage Intellectual Assets</p>
                                        <div className="flex items-center justify-center gap-4 text-[10px] text-black/30 font-black uppercase tracking-widest italic">
                                            <span>Max Pulse: 1.2 GB</span>
                                            <div className="w-1 h-1 rounded-full bg-black/10"></div>
                                            <span>Encrypted Uplink</span>
                                        </div>
                                    </div>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer disabled:hidden" disabled={uploading} />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C] ml-6 flex items-center gap-2">
                                        <Tag size={12} /> Narrative Descriptor
                                    </label>
                                    <input
                                        type="text"
                                        disabled={uploading}
                                        placeholder="Identify the material archive entry..."
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/20 rounded-[2rem] px-8 py-5 text-base font-serif italic outline-none focus:bg-white focus:shadow-2xl transition-all disabled:opacity-50"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 ml-6">Archive Vault</label>
                                        <div className="relative">
                                            <select disabled={uploading} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/20 rounded-[1.5rem] px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] outline-none cursor-pointer appearance-none disabled:opacity-50">
                                                <option>Visual Archive</option>
                                                <option>Operational Manuals</option>
                                                <option>Fiscal Reports</option>
                                                <option>Field Recordings</option>
                                            </select>
                                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-black/20 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 ml-6">Event Synchronization</label>
                                        <input
                                            type="date"
                                            disabled={uploading}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C]/20 rounded-[1.5rem] px-8 py-5 text-[11px] font-black outline-none disabled:opacity-50"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-6">
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] text-black/30 border-2 border-black/5 hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-[2] py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-[#1A1A2E]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #1A1A2E, #252545)' }}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        <>
                                            <Database size={24} />
                                            Deposit Material
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add dayjs dependency if missing, or use a native alternative if needed. 
// For now styling with dayjs as it was in the source.
