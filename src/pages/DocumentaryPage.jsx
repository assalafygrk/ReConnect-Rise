import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Upload, X, Search, Plus, Archive, Loader2, Database, ImageIcon, FileText
} from 'lucide-react';
import { usePageConfig } from '../context/PageConfigContext';
import { fetchArchives, uploadArchive } from '../api/archives';

export default function DocumentaryPage() {
    const { config } = usePageConfig('documentary');
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeTab, setActiveTab] = useState('gallery');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [files, setFiles] = useState([]);

    const loadArchives = async () => {
        setLoading(true);
        try {
            const data = await fetchArchives();
            setGallery(data.gallery || []);
            setFiles(data.files || []);
        } catch (err) {
            toast.error('Failed to access archives');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArchives();
    }, []);

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        const title = e.target.title.value;
        setUploading(true);
        try {
            await uploadArchive(title, activeTab === 'gallery' ? 'gallery' : 'file');
            toast.success('Archive Material Synchronized');
            setShowUploadModal(false);
            loadArchives();
        } catch (err) {
            toast.error('System Synchronization Failure');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
                <Loader2 size={48} className="animate-spin text-[#E8820C]" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1A1A2E]/40">Accessing Institutional Memory...</p>
            </div>
        );
    }

    const currentItems = activeTab === 'gallery' ? gallery : files;
    const filteredItems = currentItems.filter(item => 
        (item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 p-4 md:p-8">
            <div className="relative bg-[#1A1A2E] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-16 overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E8820C]/5 rounded-full blur-[150px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#E8820C]">
                            <Archive size={14} /> Repository Node
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight">{config.pageHeadline || 'Brotherhood Archives'}</h2>
                        <p className="text-white/40 text-xl font-serif italic max-w-2xl">{config.pageSubtitle || '"Preserving our collective journey."¹'}</p>
                    </div>
                    <button onClick={() => setShowUploadModal(true)} className="px-10 py-5 rounded-[2rem] bg-[#E8820C] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-[#F5A623] transition-all flex items-center gap-4">
                        <Plus size={24} /> Catalog Material
                    </button>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-6 shadow-xl border border-black/5 flex flex-col lg:flex-row items-center gap-6">
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-[2rem] w-full lg:w-auto">
                    <button onClick={() => setActiveTab('gallery')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'gallery' ? 'bg-white text-[#1A1A2E] shadow-lg' : 'text-black/30'}`}>Visuals</button>
                    <button onClick={() => setActiveTab('files')} className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'files' ? 'bg-white text-[#1A1A2E] shadow-lg' : 'text-black/30'}`}>Documents</button>
                </div>
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" size={20} />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search records..." className="w-full bg-gray-50 border-0 rounded-[2rem] pl-16 pr-8 py-5 text-[11px] font-black uppercase outline-none" />
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="py-48 text-center space-y-8 opacity-40">
                    <Database size={60} className="mx-auto text-[#1A1A2E]" />
                    <div>
                        <h3 className="text-3xl font-serif font-black text-[#1A1A2E]">Archives Silent</h3>
                        <p className="text-[10px] uppercase tracking-[0.2em] mt-2">No data nodes synchronized in this vault segment.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item, idx) => (
                        <div key={idx} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-black/5 flex flex-col">
                            {item.type === 'gallery' ? (
                                <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-black/5">
                                    <ImageIcon size={40} className="text-black/20" />
                                </div>
                            ) : (
                                <div className="h-48 bg-blue-50 flex items-center justify-center border-b border-black/5">
                                    <FileText size={40} className="text-blue-200" />
                                </div>
                            )}
                            <div className="p-6">
                                <h4 className="text-lg font-black font-serif text-[#1A1A2E] mb-2">{item.title}</h4>
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-black/30">
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#E8820C] hover:underline">View</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
                    <div className="relative bg-white rounded-[3rem] w-full max-w-2xl p-10 md:p-16 shadow-2xl">
                        <button onClick={() => !uploading && setShowUploadModal(false)} className="absolute top-10 right-10 text-black/20 hover:text-black/60 transition-all"><X size={24} /></button>
                        <h3 className="text-3xl font-black font-serif text-[#1A1A2E] mb-12">Material Deposit</h3>
                        <form onSubmit={handleUpload} className="space-y-8">
                            <div className="bg-gray-50 border-2 border-dashed border-black/10 rounded-[2.5rem] p-12 text-center relative group">
                                <Upload size={40} className="mx-auto text-[#E8820C] mb-4 group-hover:-translate-y-1 transition-transform" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]/40">Select Archive Material</p>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            <input name="title" placeholder="Classification Title" className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold outline-none" required />
                            <button type="submit" disabled={uploading} className="w-full py-5 rounded-2xl bg-[#1A1A2E] text-white font-black text-xs uppercase tracking-widest shadow-xl flex justify-center items-center gap-3">
                                {uploading ? <Loader2 className="animate-spin" /> : <Database size={20} />} Catalog & Deposit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
