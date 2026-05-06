import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import {
    Upload, FileText, Image as ImageIcon, Plus, X, Search,
    Download, ExternalLink, Filter, MoreVertical, Grid, List,
    Calendar, User, Tag, Info, ChevronLeft, ChevronRight, Maximize2,
    Database, ShieldCheck, HardDrive, Archive, Loader2, Fingerprint,
    Video, Play, File, Trash2
} from 'lucide-react';
import { usePageConfig } from '../context/PageConfigContext';
import { useAuth } from '../context/AuthContext';
import { fetchArchives, uploadArchive, deleteArchive } from '../api/archives';

export default function DocumentaryPage() {
    const { user } = useAuth();
    const { config } = usePageConfig('documentary');
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('files');
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const [galleryData, setGalleryData] = useState([]);
    const [filesData, setFilesData] = useState([]);

    const fileInputRef = useRef(null);

    // Upload Form State
    const [uploadForm, setUploadForm] = useState({
        title: '',
        fileType: 'image',
        url: '',
        thumbnail: ''
    });

    const canUpload = ['super_admin', 'group_leader'].includes(user?.role);

    const categories = [
        { id: 'all', label: 'All Artifacts', icon: <Database size={14} /> },
        { id: 'image', label: 'Visuals', icon: <ImageIcon size={14} /> },
        { id: 'video', label: 'Kinetic', icon: <Video size={14} /> },
        { id: 'pdf', label: 'Documents', icon: <FileText size={14} /> },
        { id: 'other', label: 'Archives', icon: <Archive size={14} /> },
    ];

    useEffect(() => {
        loadArchives();
    }, []);

    const loadArchives = async () => {
        setIsInitialLoading(true);
        try {
            const data = await fetchArchives();
            setGalleryData(data.gallery || []);
            setFilesData(data.files || []);
        } catch (err) {
            // Keep empty on error
        } finally {
            setIsInitialLoading(false);
        }
    };

    const filteredFiles = filesData.filter(item => 
        (activeCategory === 'all' || item.fileType === activeCategory) &&
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGallery = galleryData.filter(item => 
        (activeCategory === 'all' || item.fileType === activeCategory) &&
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadForm({
                ...uploadForm,
                url: reader.result,
                title: uploadForm.title || file.name,
                fileType: getFileTypeFromMime(file.type)
            });
        };
        reader.readAsDataURL(file);
    };

    const getFileTypeFromMime = (mime) => {
        if (mime.startsWith('image/')) return 'image';
        if (mime.startsWith('video/')) return 'video';
        if (mime.includes('pdf')) return 'pdf';
        if (mime.includes('presentation') || mime.includes('powerpoint')) return 'pptx';
        if (mime.includes('sheet') || mime.includes('excel')) return 'xlsx';
        if (mime.includes('word')) return 'docx';
        return 'file';
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!canUpload) return toast.error('Access Denied: Administrative Clearance Required');
        if (!uploadForm.url) return toast.error('Selection Protocol Incomplete: No File Detected');
        
        setUploading(true);
        try {
            await uploadArchive({
                title: uploadForm.title,
                type: activeTab === 'gallery' ? 'gallery' : 'file',
                fileType: uploadForm.fileType,
                url: uploadForm.url,
                thumbnail: uploadForm.thumbnail
            });
            toast.success('Archive Material Synchronized');
            setShowUploadModal(false);
            setUploadForm({ title: '', fileType: 'image', url: '', thumbnail: '' });
            loadArchives();
        } catch (err) {
            toast.error('System Synchronization Failure');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you certain you wish to purge this archive from the registry? This action is irreversible.')) return;
        
        setDeletingId(id);
        try {
            await deleteArchive(id);
            toast.success('Archive Material Purged');
            if (selectedMedia?._id === id) setSelectedMedia(null);
            loadArchives();
        } catch (err) {
            toast.error(err.message || 'Purge Protocol Failure');
        } finally {
            setDeletingId(null);
        }
    };

    const renderMediaPreview = (item) => {
        if (item.fileType === 'image') {
            return <img src={item.url} alt="" className="w-full h-full object-contain animate-in zoom-in duration-1000" />;
        }
        if (item.fileType === 'video') {
            return (
                <video controls className="w-full h-full max-h-[70vh] rounded-[2rem] outline-none shadow-2xl bg-black" poster={item.thumbnail}>
                    <source src={item.url} />
                    Your browser does not support the video tag.
                </video>
            );
        }
        if (item.fileType === 'pdf') {
            return (
                <iframe src={item.url} className="w-full h-full min-h-[70vh] rounded-[2rem] bg-white shadow-2xl border-none" title="PDF Preview" />
            );
        }
        return (
            <div className="flex flex-col items-center gap-6 md:gap-10 text-white/20 p-6 md:p-12 text-center">
                <div className="relative group/icon">
                    <div className="absolute -inset-8 bg-[#E8820C]/20 blur-3xl rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-1000" />
                    {item.fileType === 'pptx' ? <Database size={100} className="relative z-10 text-[#E8820C] md:size-[160px]" /> : <FileText size={100} className="relative z-10 md:size-[160px]" />}
                </div>
                <div className="space-y-4 md:space-y-6">
                    <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] md:tracking-[0.8em] text-[#E8820C]">Strategic Resource Node</p>
                    <p className="text-lg md:text-xl font-serif italic text-white/40 max-w-md">"This asset requires local decryption for full verification."</p>
                    <a href={item.url} download={item.title} className="px-8 py-4 md:px-12 md:py-6 bg-[#E8820C] text-white rounded-[1.5rem] md:rounded-[2rem] hover:bg-[#F5A623] transition-all flex items-center justify-center gap-4 mt-8 md:mt-12 font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl">
                        <Download size={18} /> Secure Download
                    </a>
                </div>
            </div>
        );
    };

    if (isInitialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-pulse p-4">
                <div className="relative">
                    <div className="w-24 h-24 md:w-40 md:h-40 border-4 border-[#E8820C]/5 border-t-[#E8820C] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[#E8820C]">
                        <Fingerprint size={40} className="md:size-[64px]" />
                    </div>
                </div>
                <div className="text-center space-y-3">
                    <p className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[#1A1A2E] dark:text-white/40 italic px-4">Decrypting Institutional Vaults...</p>
                    <div className="h-1.5 w-48 md:w-64 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-[#E8820C] w-1/2 animate-[progress_3s_ease-in-out_infinite]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 p-2 md:p-8 pb-32">
            {/* Serious System Header - Optimized Size */}
            <div className="relative bg-[#1A1A2E] dark:bg-[#0F172A] rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden shadow-2xl group border border-white/5">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-[#E8820C] to-[#F5A623] rounded-full blur-[80px] md:blur-[120px] opacity-[0.08] group-hover:opacity-15 transition-opacity duration-1000" />
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, #E8820C 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-12">
                    <div className="space-y-3 md:space-y-6">
                        <div className="inline-flex items-center gap-3 md:gap-4 px-4 py-1.5 md:px-5 md:py-2.5 rounded-full bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#E8820C]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#E8820C] animate-ping" />
                            Registry v4.2
                        </div>
                        <h2 className="text-3xl md:text-6xl font-black font-serif text-white leading-[0.9] tracking-tighter uppercase italic">
                            {config.pageHeadline || 'Secure Archives'}
                        </h2>
                        <p className="text-white/40 text-xs md:text-base font-serif italic max-w-xl leading-relaxed border-l-2 md:border-l-4 border-[#E8820C]/20 pl-4 md:pl-6">
                            {config.pageSubtitle || '"Digital memory is the anchor of institutional sovereignty."'}
                        </p>
                    </div>
                    {canUpload && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="group relative px-6 py-4 md:px-10 md:py-6 rounded-2xl md:rounded-[2rem] bg-[#E8820C] text-white text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl hover:bg-[#F5A623] hover:-translate-y-1 transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                            <Plus size={18} strokeWidth={4} className="relative z-10" /> 
                            <span className="relative z-10">Institutional Deposit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tactical Control Bar - Optimized for Mobile */}
            <div className="bg-white dark:bg-[#111827]/95 backdrop-blur-3xl rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-8 shadow-2xl border border-black/5 dark:border-white/10 flex flex-col lg:flex-row items-center gap-4 md:gap-8 relative z-40 -mt-8 md:-mt-16 mx-2 md:mx-12 ring-1 ring-white/5">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1.5 rounded-[1.5rem] md:rounded-[2.5rem] w-full lg:w-auto shadow-inner overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 md:gap-4 px-6 md:px-10 py-3 md:py-5 rounded-[1.2rem] md:rounded-[2rem] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all whitespace-nowrap ${activeTab === 'files' ? 'bg-white dark:bg-[#1A1A2E] text-[#1A1A2E] dark:text-white shadow-xl ring-1 ring-black/5' : 'text-black/30 dark:text-white/30 hover:text-[#E8820C]'}`}
                    >
                        <FileText size={14} /> Repository
                    </button>
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 md:gap-4 px-6 md:px-10 py-3 md:py-5 rounded-[1.2rem] md:rounded-[2rem] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all whitespace-nowrap ${activeTab === 'gallery' ? 'bg-white dark:bg-[#1A1A2E] text-[#1A1A2E] dark:text-white shadow-xl ring-1 ring-black/5' : 'text-black/30 dark:text-white/30 hover:text-[#E8820C]'}`}
                    >
                        <ImageIcon size={14} /> Visuals
                    </button>
                </div>

                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 group-focus-within:text-[#E8820C] transition-all duration-500" size={18} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SCAN NODES..."
                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C]/30 rounded-[1.5rem] md:rounded-[2.5rem] pl-14 md:pl-20 pr-6 md:pr-10 py-4 md:py-6 text-[10px] md:text-[12px] font-black uppercase tracking-widest outline-none focus:bg-white dark:focus:bg-[#111827] focus:shadow-2xl transition-all shadow-inner dark:text-white"
                    />
                </div>
            </div>

            {/* Category Filter - New */}
            <div className="flex items-center gap-3 md:gap-6 overflow-x-auto scrollbar-hide px-2 md:px-4">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id ? 'bg-[#E8820C] text-white border-[#E8820C] shadow-lg shadow-[#E8820C]/20' : 'bg-white dark:bg-white/5 text-black/40 dark:text-white/40 border-black/5 dark:border-white/10 hover:border-[#E8820C]/30'}`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Vault Display Area - Optimized Grid */}
            {(activeTab === 'files' ? filteredFiles : filteredGallery).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 px-2 md:px-4">
                    {(activeTab === 'files' ? filteredFiles : filteredGallery).map((item, idx) => (
                        <div
                            key={item._id || item.id}
                            onClick={() => setSelectedMedia(item)}
                            className="group bg-white dark:bg-[#111827] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer p-4 md:p-6 relative"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="aspect-[4/5] relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] mb-4 md:mb-6 bg-gray-50 dark:bg-black/60 flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                                {item.fileType === 'image' ? (
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                                ) : item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                                ) : (
                                    <div className="text-black/[0.03] dark:text-white/[0.03] group-hover:text-[#E8820C]/10 transition-all duration-1000 scale-[1.5] flex flex-col items-center">
                                        {item.fileType === 'video' ? <Video size={60} /> : item.fileType === 'pdf' ? <FileText size={60} /> : item.fileType === 'pptx' ? <Database size={60} /> : <Archive size={60} />}
                                        <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-40">{item.fileType || 'Asset'}</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-6 group-hover:translate-y-0">
                                    <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                                        <Play size={24} className="text-white fill-white" />
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 flex gap-2">
                                    {(canUpload || user?._id === item.uploader?._id || user?._id === item.uploader) && (
                                        <button 
                                            onClick={(e) => handleDelete(item._id || item.id, e)}
                                            disabled={deletingId === (item._id || item.id)}
                                            className="p-2 bg-red-500/80 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 active:scale-90"
                                        >
                                            {deletingId === (item._id || item.id) ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                        </button>
                                    )}
                                    <div className="px-3 py-1 bg-black/80 backdrop-blur-xl rounded-full text-[8px] font-black uppercase text-white tracking-widest border border-white/10 shadow-2xl">
                                        {item.fileType || 'Asset'}
                                    </div>
                                </div>
                            </div>

                            <div className="px-2 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-black text-[#1A1A2E] dark:text-white font-serif text-sm md:text-base group-hover:text-[#E8820C] transition-colors leading-tight italic italic truncate">{item.title}</h4>
                                    <div className="h-0.5 w-8 bg-[#E8820C]/20 group-hover:w-full transition-all duration-700 rounded-full" />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl overflow-hidden border border-white dark:border-white/10 shadow-lg ring-2 ring-black/5">
                                            {item.uploaderAvatar ? <img src={item.uploaderAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#1A1A2E] text-[#E8820C] flex items-center justify-center text-[10px] font-black">{item.uploaderName?.[0]}</div>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-[#1A1A2E] dark:text-white uppercase tracking-widest italic">{item.uploaderName}</span>
                                            <span className="text-[7px] text-black/30 dark:text-white/40 font-bold uppercase tracking-tighter">{dayjs(item.createdAt).format('DD MMM YYYY')}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            upvoteArchive(item._id || item.id);
                                            loadArchives();
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all group/upvote"
                                    >
                                        <div className="text-[10px] font-black">{item.upvotes || 0}</div>
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white dark:bg-[#111827] rounded-[3rem] border border-dashed border-black/10 dark:border-white/10 mx-4">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-black/10 dark:text-white/10">
                        <Archive size={48} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-widest text-black/40 dark:text-white/40">Registry Vacuum Detected</h3>
                        <p className="text-sm font-serif italic text-black/20 dark:text-white/20">"No artifacts have been synchronized with this node yet."</p>
                    </div>
                </div>
            )}

            {/* Media Viewer Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-20 lg:p-32">
                    <div className="absolute inset-0 bg-[#0B1221]/98 backdrop-blur-3xl animate-in fade-in duration-1000" onClick={() => setSelectedMedia(null)} />
                    <div className="relative bg-[#111827] rounded-[5rem] w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_150px_rgba(232,130,12,0.2)] border border-white/10 animate-in zoom-in-95 duration-1000">
                        <div className="relative flex-1 bg-black/60 flex items-center justify-center overflow-hidden min-h-[450px] p-8">
                            {renderMediaPreview(selectedMedia)}
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="absolute top-12 left-12 w-20 h-20 bg-white/5 backdrop-blur-3xl text-white rounded-3xl hover:bg-red-500 transition-all z-20 border border-white/10 flex items-center justify-center group shadow-2xl"
                            >
                                <ChevronLeft size={40} className="group-hover:-translate-x-2 transition-transform" />
                            </button>
                        </div>
                        <div className="w-full lg:w-[500px] p-16 md:p-20 space-y-16 overflow-y-auto bg-gradient-to-b from-[#0F172A] to-[#070B14] border-l border-white/5 scrollbar-hide">
                            <div className="space-y-10">
                                <div className="inline-flex items-center gap-4 text-[#E8820C] text-[11px] font-black uppercase tracking-[0.5em]">
                                    <ShieldCheck size={20} /> Verified Archive
                                </div>
                                <h3 className="text-5xl md:text-6xl font-black font-serif text-white tracking-tighter italic leading-tight">{selectedMedia.title}</h3>
                                <div className="flex items-center gap-8 p-8 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner group hover:bg-white/10 transition-all">
                                    <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-2xl ring-4 ring-[#E8820C]/20 transition-transform group-hover:scale-110 duration-700">
                                        {selectedMedia.uploaderAvatar ? <img src={selectedMedia.uploaderAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white text-[#1A1A2E] flex items-center justify-center text-3xl font-black italic">{selectedMedia.uploaderName?.[0]}</div>}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase text-[#E8820C] tracking-[0.3em] mb-2 italic">Institutional Archivist</p>
                                        <p className="text-2xl font-black text-white">{selectedMedia.uploaderName}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-8">
                                <p className="text-[11px] font-black uppercase text-white/30 tracking-[0.5em] ml-4 italic">Material Metadata</p>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all shadow-lg">
                                        <div className="flex items-center gap-5">
                                            <Calendar className="text-[#E8820C]" size={24} />
                                            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Entry Epoch</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{dayjs(selectedMedia.createdAt).format('DD MMMM YYYY')}</span>
                                    </div>
                                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all shadow-lg">
                                        <div className="flex items-center gap-5">
                                            <Database className="text-[#E8820C]" size={24} />
                                            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Data Morphology</span>
                                        </div>
                                        <span className="text-lg font-black text-[#E8820C] uppercase italic">{selectedMedia.fileType || 'Unclassified'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 space-y-6">
                                <a href={selectedMedia.url} target="_blank" rel="noopener noreferrer" className="w-full py-8 bg-white text-[#1A1A2E] rounded-[3rem] font-black uppercase tracking-[0.4em] text-[14px] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.1)] hover:scale-[1.05] active:scale-95 transition-all duration-500 flex items-center justify-center gap-6">
                                    <ExternalLink size={24} /> Decrypt Resource
                                </a>
                                {(canUpload || user?._id === selectedMedia.uploader?._id || user?._id === selectedMedia.uploader) && (
                                    <button 
                                        onClick={() => handleDelete(selectedMedia._id || selectedMedia.id)}
                                        disabled={deletingId === (selectedMedia._id || selectedMedia.id)}
                                        className="w-full py-6 bg-red-500/10 text-red-500 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-4"
                                    >
                                        {deletingId === (selectedMedia._id || selectedMedia.id) ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        Purge From Registry
                                    </button>
                                )}
                                <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.8em]">Security Layer: Quantum-Resistant AES</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal - Redesigned for Simplicity */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#070B14]/90 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="absolute inset-0" onClick={() => !uploading && setShowUploadModal(false)} />
                    <div className="relative bg-white dark:bg-[#111827] rounded-[2rem] w-full max-w-lg p-8 md:p-10 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-500 ring-1 ring-white/5 overflow-hidden">
                        
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8820C]/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black font-serif text-[#1A1A2E] dark:text-white uppercase italic tracking-tight">New Deposit</h3>
                                <p className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">Institutional Archiving System</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-black/40 dark:text-white/40 hover:text-red-500 transition-all hover:scale-110"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleUpload} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-[#E8820C] tracking-widest ml-4">Artifact Designation</label>
                                <input 
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E8820C]/30 rounded-2xl px-6 py-4 text-lg font-serif italic text-black dark:text-white outline-none transition-all placeholder:text-black/20 dark:placeholder:text-white/20 focus:bg-white dark:focus:bg-[#1A1A2E]/50"
                                    placeholder="Enter nomenclature..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-[#E8820C] tracking-widest ml-4">Resource Node</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full h-32 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group/upload ${uploadForm.url ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-black/10 dark:border-white/10 hover:border-[#E8820C]/50 bg-black/5 dark:bg-white/5'}`}
                                >
                                    {uploadForm.url ? (
                                        <>
                                            <ShieldCheck size={32} className="text-emerald-500 animate-pulse" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Asset Ready for Ingestion</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={32} className="text-[#E8820C]/50 group-hover/upload:scale-110 transition-transform" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 group-hover/upload:text-[#E8820C] transition-colors">Select Artifact File</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-black/30 dark:text-white/30 tracking-widest ml-4">Morphology</label>
                                    <div className="relative">
                                        <select 
                                            value={uploadForm.fileType}
                                            onChange={(e) => setUploadForm({...uploadForm, fileType: e.target.value})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E8820C]/30 rounded-xl px-4 py-3 text-black dark:text-white outline-none appearance-none font-bold text-[10px] uppercase tracking-wider"
                                        >
                                            <option value="image" className="dark:bg-[#111827]">Visual (IMG)</option>
                                            <option value="video" className="dark:bg-[#111827]">Kinetic (MP4)</option>
                                            <option value="pdf" className="dark:bg-[#111827]">Document (PDF)</option>
                                            <option value="pptx" className="dark:bg-[#111827]">Brief (PPTX)</option>
                                            <option value="xlsx" className="dark:bg-[#111827]">Fiscal (XLSX)</option>
                                        </select>
                                        <Grid size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#E8820C]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-black/30 dark:text-white/30 tracking-widest ml-4">Destination</label>
                                    <div className="relative">
                                        <select 
                                            value={activeTab}
                                            onChange={(e) => setActiveTab(e.target.value)}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#E8820C]/30 rounded-xl px-4 py-3 text-black dark:text-white outline-none appearance-none font-bold text-[10px] uppercase tracking-wider"
                                        >
                                            <option value="files" className="dark:bg-[#111827]">Repository</option>
                                            <option value="gallery" className="dark:bg-[#111827]">Visuals</option>
                                        </select>
                                        <HardDrive size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#E8820C]" />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={uploading || !uploadForm.url}
                                className="w-full py-5 bg-[#E8820C] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] shadow-xl hover:bg-[#F5A623] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20"
                            >
                                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                                Synchronize Artifact
                            </button>
                            
                            <p className="text-center text-[8px] font-bold text-black/20 dark:text-white/20 uppercase tracking-[0.4em]">Administrative Access Restricted</p>
                        </form>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
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


// Add dayjs dependency if missing, or use a native alternative if needed. 
// For now styling with dayjs as it was in the source.
