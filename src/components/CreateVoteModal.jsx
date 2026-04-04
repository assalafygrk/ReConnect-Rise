import { X, Plus, Trash2, Info, CheckCircle2, Users, Wallet, CheckSquare, Loader2 } from 'lucide-react';

const VOTE_TYPES = [
    { id: 'decision', name: 'Decision', icon: CheckSquare, desc: 'Standard Yes/No/Abstain poll' },
    { id: 'election', name: 'Election', icon: Users, desc: 'Vote for candidates or leaders' },
    { id: 'budget', name: 'Budget Approval', icon: Wallet, desc: 'Approve specific financial requests' },
    { id: 'multiple_choice', name: 'Multiple Choice', icon: CheckCircle2, desc: 'Custom options to choose from' },
];

export default function CreateVoteModal({ isOpen, onClose, onCreate }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        type: 'decision',
        question: '',
        description: '',
        deadline: '',
        amount: '',
        options: ['', ''],
        totalEligible: 20
    });
    const [loading, setLoading] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in duration-300 my-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-black/5">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-[#1A1A2E]">Launch New Vote</h3>
                        <p className="text-sm text-black/40 mt-1">Step {step} of 2: {step === 1 ? 'Choose Vote Type' : 'Configure Details'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black/40 hover:text-black">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        {step === 1 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {VOTE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, type: type.id }));
                                            setStep(2);
                                        }}
                                        className={`flex flex-col items-start p-6 rounded-3xl border-2 text-left transition-all duration-300 group ${form.type === type.id
                                            ? 'border-[#E8820C] bg-[#E8820C]/5 ring-4 ring-[#E8820C]/10'
                                            : 'border-black/5 hover:border-black/10 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-2xl mb-4 transition-colors ${form.type === type.id ? 'bg-[#E8820C] text-white' : 'bg-gray-100 text-black/40 group-hover:text-black/60'
                                            }`}>
                                            <type.icon size={20} />
                                        </div>
                                        <h4 className="font-bold text-[#1A1A2E]">{type.name}</h4>
                                        <p className="text-xs text-black/40 mt-1 leading-relaxed">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Vote Title / Question</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={form.question}
                                        onChange={(e) => setForm({ ...form, question: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium transition-all outline-none resize-none"
                                        placeholder="What are we voting on today?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Detailed Description (Optional)</label>
                                    <textarea
                                        rows="3"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium transition-all outline-none resize-none"
                                        placeholder="Provide more context for voters..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Deadline</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.deadline}
                                            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Eligible Voters</label>
                                        <input
                                            type="number"
                                            required
                                            value={form.totalEligible}
                                            onChange={(e) => setForm({ ...form, totalEligible: parseInt(e.target.value) })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {form.type === 'budget' && (
                                    <div className="animate-in slide-in-from-top-4 duration-300">
                                        <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Amount (₦)</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-black/30">₦</span>
                                            <input
                                                type="number"
                                                required
                                                value={form.amount}
                                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-2xl pl-10 pr-5 py-4 text-sm font-bold transition-all outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                )}

                                {(form.type === 'election' || form.type === 'multiple_choice') && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-[10px] font-bold text-black/40 uppercase tracking-widest">
                                                {form.type === 'election' ? 'Candidates' : 'Options'}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAddOption}
                                                className="text-[10px] font-bold text-[#E8820C] hover:text-[#E8820C]/80 flex items-center gap-1 uppercase tracking-widest"
                                            >
                                                <Plus size={12} /> Add {form.type === 'election' ? 'Candidate' : 'Option'}
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
                                                        className="flex-1 bg-gray-50 border-2 border-transparent focus:border-[#E8820C] focus:bg-white rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none"
                                                        placeholder={`Enter ${form.type === 'election' ? 'candidate name' : 'option description'}...`}
                                                    />
                                                    {form.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOption(index)}
                                                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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

                    <div className="p-8 bg-gray-50 rounded-b-[2rem] flex gap-3">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 px-6 rounded-2xl bg-white border border-black/5 font-bold text-[10px] uppercase tracking-widest text-black/60 hover:bg-gray-100 transition-all"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type={step === 1 ? 'button' : 'submit'}
                            disabled={loading}
                            onClick={step === 1 ? () => setStep(2) : undefined}
                            className="flex-[2] py-4 px-6 rounded-2xl bg-[#1A1A2E] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
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
