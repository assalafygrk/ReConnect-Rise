import { useState } from 'react';
import { X, Plus, Trash2, Info, CheckCircle2, Users, Wallet, CheckSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMembers } from '../api/members';
import { useEffect } from 'react';


const VOTE_TYPES = [
    { id: 'decision', name: 'Decision', icon: CheckSquare, desc: 'Standard Yes/No/Abstain poll' },
    { id: 'election', name: 'Election', icon: Users, desc: 'Vote for candidates or leaders' },
    { id: 'budget', name: 'Budget Approval', icon: Wallet, desc: 'Approve specific financial requests' },
    { id: 'multiple_choice', name: 'Multiple Choice', icon: CheckCircle2, desc: 'Custom options to choose from' },
];

export default function CreateVoteModal({ isOpen, onClose, onCreate }) {
    const { hasRole, ROLES } = useAuth();
    const isGroupLeader = hasRole(ROLES.GROUP_LEADER);
    const isAdmin = hasRole(ROLES.ADMIN);

    const allowedTypes = VOTE_TYPES.filter(type => {
        if (isAdmin) return true;
        if (isGroupLeader) {
            return ['decision', 'budget', 'multiple_choice'].includes(type.id);
        }
        return false;
    });

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        type: allowedTypes[0]?.id || 'decision',

        question: '',
        description: '',
        deadline: '',
        amount: '',
        options: ['', ''],
        candidates: [], // Member IDs
        totalEligible: 20
    });
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMembers().then(setMembers).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddOption = () => {
        setForm(prev => ({ ...prev, options: [...prev.options, ''] }));
    };

    const handleRemoveOption = (index) => {
        setForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...form.options];
        newOptions[index] = value;
        setForm(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form };
            if (form.type !== 'election' && form.type !== 'multiple_choice') {
                delete payload.options;
            }
            if (form.type === 'election') {
                // For elections, options are the member names, but we also send candidates IDs
                payload.candidates = form.candidates;
                payload.options = form.candidates.map(id => members.find(m => m._id === id)?.name).filter(Boolean);
            }
            if (form.type !== 'budget') {
                delete payload.amount;
            }
            await onCreate(payload);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-8 bg-[#1A1A2E]/60 dark:bg-black/80 backdrop-blur-md overflow-hidden">
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300 my-auto border border-black/5 dark:border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-black/5 dark:border-white/10 sticky top-0 bg-white dark:bg-[#111827] z-10 py-4">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-[#1A1A2E] dark:text-white">Launch New Vote</h3>
                        <p className="text-sm text-black/40 dark:text-white/40 mt-1">Step {step} of 2: {step === 1 ? 'Choose Vote Type' : 'Configure Details'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 sm:p-8 space-y-6">
                        {step === 1 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {allowedTypes.map((type) => (
                                    <button

                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, type: type.id }));
                                            setStep(2);
                                        }}
                                        className={`flex flex-col items-start p-6 rounded-3xl border-2 text-left transition-all duration-300 group ${form.type === type.id
                                            ? 'border-[#E8820C] bg-[#E8820C]/5 ring-4 ring-[#E8820C]/10'
                                            : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-2xl mb-4 transition-colors ${form.type === type.id ? 'bg-[#E8820C] text-white' : 'bg-gray-100 dark:bg-white/5 text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60'
                                            }`}>
                                            <type.icon size={20} />
                                        </div>
                                        <h4 className="font-bold text-[#1A1A2E] dark:text-white">{type.name}</h4>
                                        <p className="text-xs text-black/40 dark:text-white/40 mt-1 leading-relaxed">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-2">Vote Title / Question</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={form.question}
                                        onChange={(e) => setForm({ ...form, question: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] focus:bg-white dark:focus:bg-[#1A1A2E] rounded-2xl px-5 py-4 text-sm font-medium dark:text-white transition-all outline-none resize-none"
                                        placeholder="What are we voting on today?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-2">Detailed Description (Optional)</label>
                                    <textarea
                                        rows="3"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] focus:bg-white dark:focus:bg-[#1A1A2E] rounded-2xl px-5 py-4 text-sm font-medium dark:text-white transition-all outline-none resize-none"
                                        placeholder="Provide more context for voters..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-2">Deadline</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.deadline}
                                            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] focus:bg-white dark:focus:bg-[#1A1A2E] rounded-2xl px-5 py-4 text-sm font-medium dark:text-white transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-2">Eligible Voters</label>
                                        <input
                                            type="number"
                                            required
                                            value={form.totalEligible}
                                            onChange={(e) => setForm({ ...form, totalEligible: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] focus:bg-white dark:focus:bg-[#1A1A2E] rounded-2xl px-5 py-4 text-sm font-medium dark:text-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {form.type === 'budget' && (
                                    <div className="animate-in slide-in-from-top-4 duration-300">
                                        <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest mb-2">Amount (₦)</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-black/30 dark:text-white/30">₦</span>
                                            <input
                                                type="number"
                                                required
                                                value={form.amount}
                                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] focus:bg-white dark:focus:bg-[#1A1A2E] rounded-2xl pl-10 pr-5 py-4 text-sm font-bold dark:text-white transition-all outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}

                                {form.type === 'election' ? (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Select Candidates</label>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Search members..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] focus:bg-white dark:focus:bg-[#1A1A2E] rounded-xl px-4 py-3 text-sm font-medium dark:text-white transition-all outline-none"
                                            />
                                            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10">
                                                {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                                                    <button
                                                        key={m._id}
                                                        type="button"
                                                        onClick={() => {
                                                            const exists = form.candidates.includes(m._id);
                                                            if (exists) {
                                                                setForm({ ...form, candidates: form.candidates.filter(id => id !== m._id) });
                                                            } else {
                                                                setForm({ ...form, candidates: [...form.candidates, m._id] });
                                                            }
                                                        }}
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${form.candidates.includes(m._id) ? 'bg-[#E8820C] text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                                                {m.facialUpload ? <img src={m.facialUpload} alt="" className="w-full h-full object-cover" /> : m.name[0]}
                                                            </div>
                                                            <span className="text-sm font-bold">{m.name}</span>
                                                        </div>
                                                        {form.candidates.includes(m._id) && <CheckCircle2 size={16} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {form.candidates.map(id => {
                                                const m = members.find(mem => mem._id === id);
                                                return m ? (
                                                    <div key={id} className="flex items-center gap-2 px-3 py-1 bg-[#E8820C]/10 text-[#E8820C] rounded-full text-xs font-bold border border-[#E8820C]/20">
                                                        {m.name}
                                                        <button type="button" onClick={() => setForm({ ...form, candidates: form.candidates.filter(cid => cid !== id) })}>
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                ) : (form.type === 'multiple_choice') && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Options</label>
                                            <button
                                                type="button"
                                                onClick={handleAddOption}
                                                className="text-[10px] font-bold text-[#E8820C] hover:text-[#E8820C]/80 flex items-center gap-1 uppercase tracking-widest"
                                            >
                                                <Plus size={12} /> Add Option
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {form.options.map((option, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        required
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                        className="flex-1 bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-[#E8820C] focus:bg-white dark:focus:bg-[#1A1A2E] rounded-xl px-4 py-3 text-sm font-medium dark:text-white transition-all outline-none"
                                                        placeholder={`Enter option description...`}
                                                    />
                                                    {form.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOption(index)}
                                                            className="p-3 text-red-400 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 sm:p-8 bg-gray-50 dark:bg-[#1A1A2E]/50 rounded-b-[2rem] flex gap-3 sticky bottom-0 z-10 border-t border-black/5 dark:border-white/10">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 px-6 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 font-bold text-[10px] uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type={step === 1 ? 'button' : 'submit'}
                            disabled={loading}
                            onClick={step === 1 ? () => setStep(2) : undefined}
                            className="flex-[2] py-4 px-6 rounded-2xl bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin text-[#E8820C]" /> : null}
                            {loading ? 'Processing Registry...' : step === 1 ? 'Configure Authority' : 'Authorize Ballot'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
