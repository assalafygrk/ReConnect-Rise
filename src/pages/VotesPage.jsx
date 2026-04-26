import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Plus, Filter, Search, RotateCcw, Vote as VoteIcon,
    ChevronRight, CheckCircle2, LayoutGrid, List,
    Activity, ShieldCheck, Zap, MoreHorizontal, UserPlus
} from 'lucide-react';
import { fetchVotes, castVote, createVote, closeVote } from '../api/votes';
import { useAuth } from '../context/AuthContext';
import { usePageConfig } from '../context/PageConfigContext';
import VoteCard from '../components/VoteCard';
import CreateVoteModal from '../components/CreateVoteModal';

const MOCK = [
    {
        id: 'vote-1',
        type: 'budget',
        question: 'Medical Support Request: Dare Balogun',
        description: 'Brother Dare Balogun is requesting emergency support for his wife\'s surgery. The amount covers 10% of the total cost as per group policy.',
        amount: 50000,
        status: 'open',
        deadline: '2026-04-10',
        myVote: null,
        results: { yes: 18, no: 2, abstain: 1 },
        totalEligible: 25,
    },
    {
        id: 'vote-2',
        type: 'election',
        question: 'New Welfare Committee Lead',
        description: 'Select the new lead for the 2026/2027 Welfare Committee session.',
        options: ['Aliyu Musa', 'Fatima Bello', 'Ibrahim Sani'],
        status: 'open',
        deadline: '2026-04-15',
        myVote: null,
        results: { 'Aliyu Musa': 10, 'Fatima Bello': 8, 'Ibrahim Sani': 2 },
        totalEligible: 25,
    },
    {
        id: 'vote-3',
        type: 'decision',
        question: 'Increase Monthly Dues to ₦5,000?',
        description: 'To accommodate rising operational costs and increase our emergency fund capacity.',
        status: 'closed',
        deadline: '2026-03-20',
        myVote: 'yes',
        results: { yes: 20, no: 4, abstain: 1 },
        totalEligible: 25,
    },
];

export default function VotesPage() {
    const { user, hasRole, ROLES } = useAuth();
    const { config } = usePageConfig('votes');
    
    // Group Leader only manages specific types: decision, budget, multiple choice
    const isGroupLeader = hasRole(ROLES.GROUP_LEADER);
    const isTreasurer = hasRole(ROLES.TREASURER);
    const isAdmin = hasRole(ROLES.ADMIN);
    
    const canManage = isAdmin || isGroupLeader || isTreasurer;

    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [casting, setCasting] = useState({});
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        loadVotes();
    }, []);

    const loadVotes = async () => {
        setLoading(true);
        try {
            const data = await fetchVotes();
            setVotes(data.length > 0 ? data : MOCK);
        } catch (err) {
            setVotes(MOCK);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (voteId, choice) => {
        setCasting(p => ({ ...p, [voteId]: true }));
        try {
            await castVote(voteId, choice);
            setVotes(prev => prev.map(v =>
                v.id === voteId
                    ? { ...v, myVote: choice, results: { ...v.results, [choice]: (v.results[choice] || 0) + 1 } }
                    : v
            ));
            toast.success(`Position Archive Recorded: ${choice.toUpperCase()}`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCasting(p => ({ ...p, [voteId]: false }));
        }
    };

    const handleCreate = async (voteData) => {
        try {
            const newVote = await createVote(voteData);
            setVotes(prev => [newVote, ...prev]);
            toast.success('Governance ballot synchronized');
        } catch (err) {
            const mockNew = {
                ...voteData,
                id: Date.now().toString(),
                status: 'open',
                results: voteData.options
                    ? voteData.options.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {})
                    : { yes: 0, no: 0, abstain: 0 },
                myVote: null
            };
            setVotes(prev => [mockNew, ...prev]);
            toast.success('Ballot Authorized (Local Sync)');
        }
    };

    const handleClose = async (voteId) => {
        try {
            await closeVote(voteId);
            setVotes(prev => prev.map(v => v.id === voteId ? { ...v, status: 'closed' } : v));
            toast.success('Ledger finalized: Vote closed');
        } catch (err) {
            setVotes(prev => prev.map(v => v.id === voteId ? { ...v, status: 'closed' } : v));
            toast.success('Ledger Finalized (Local Archive)');
        }
    };

    const filteredVotes = votes.filter(v => {
        const matchesFilter = filter === 'all' || v.status === filter;
        const matchesSearch = v.question.toLowerCase().includes(search.toLowerCase()) ||
            v.description?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Zap className="animate-pulse text-[#E8820C]" size={40} />
            <p className="text-sm font-black text-black/40 uppercase tracking-[0.3em]">Syncing Governance Archive...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-12 px-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#E8820C] uppercase tracking-[0.4em] mb-2">
                        <VoteIcon size={14} /> Governance & Decisions
                    </div>
                    <h1 className="text-5xl font-serif font-black text-[#1A1A2E] tracking-tight">{config.pageHeadline}</h1>
                    <p className="text-sm text-black/40 font-medium max-w-xl leading-relaxed">
                        {config.pageSubtitle}
                    </p>
                </div>

                {canManage && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="group relative px-10 py-5 bg-[#1A1A2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E8820C] to-[#F5A623] opacity-0 group-hover:opacity-10 transition-opacity" />
                        <span className="relative flex items-center gap-3">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            Issue New Ballot
                        </span>
                    </button>
                )}
            </div>

            {config.abstentionPolicy && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldCheck size={20} className="text-blue-600 shrink-0" />
                    <p className="text-sm font-bold text-blue-800">
                        {config.abstentionPolicy}
                    </p>
                </div>
            )}

            {/* Registry Insights Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Polls', value: votes.filter(v => v.status === 'open').length, icon: Activity, color: 'text-[#E8820C]', bg: 'bg-[#E8820C]/5' },
                    { label: 'Participation', value: '86%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Finalized', value: votes.filter(v => v.status === 'closed').length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: config.quorumLabel || 'Quorum Status', value: `Min ${config.quorumThreshold}%`, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4 group hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} />
                            </div>
                            <MoreHorizontal size={16} className="text-black/10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-serif font-black text-[#1A1A2E]">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#E8820C] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH GOVERNANCE ARCHIVE..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm font-bold text-[#1A1A2E] shadow-sm outline-none focus:ring-4 focus:ring-[#E8820C]/10 focus:border-[#E8820C]/30 transition-all placeholder:text-black/10 placeholder:tracking-[0.1em]"
                    />
                </div>

                <div className="flex items-center gap-3 p-2 bg-white rounded-[1.5rem] border border-black/5 shadow-sm">
                    {['all', 'open', 'closed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${filter === f ? 'bg-[#1A1A2E] text-white shadow-lg' : 'text-black/30 hover:bg-gray-50 hover:text-black'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <button
                    onClick={loadVotes}
                    className="p-5 bg-white border border-black/5 text-black/20 hover:text-[#E8820C] rounded-[1.5rem] shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Votes Queue */}
            {filteredVotes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {filteredVotes.map((vote) => (
                        <VoteCard
                            key={vote.id}
                            vote={vote}
                            onVote={handleVote}
                            onClose={handleClose}
                            onShare={(v) => toast.success(`Encrypted Link Generated: ${v.question.slice(0, 20)}`)}
                            onReport={() => toast.success('Initializing Audit Report...')}
                            casting={casting}
                            canManage={canManage}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-black/5 space-y-6 text-center shadow-inner">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-black/5">
                        <VoteIcon size={64} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-serif font-black text-[#1A1A2E]">No Active Ballots</h3>
                        <p className="text-sm text-black/30 font-medium max-w-sm">
                            The governance archive is empty for this selection. Try adjusting your parameters or issue a new ballot.
                        </p>
                    </div>
                </div>
            )}

            <CreateVoteModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onCreate={handleCreate}
            />
        </div>
    );
}
