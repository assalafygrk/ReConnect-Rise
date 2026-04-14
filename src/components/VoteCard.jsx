import { CheckCircle2, Clock, Share2, FileBarChart, Users, Wallet, CheckSquare, ChevronRight, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

const COLORS = {
    yes: '#15803D',
    no: '#B91C1C',
    abstain: '#6B7280',
    options: ['#1A1A2E', '#E8820C', '#15803D', '#4F46E5', '#9333EA', '#DB2777']
};

export default function VoteCard({ vote, onVote, onShare, onReport, casting, canManage, onClose }) {
    const totalVotes = Object.values(vote.results || {}).reduce((s, n) => s + n, 0);
    const isClosed = vote.status === 'closed';

    const getPieData = () => {
        if (vote.type === 'election' || vote.type === 'multiple_choice') {
            return Object.entries(vote.results || {}).map(([name, value], i) => ({
                name,
                value,
                fill: COLORS.options[i % COLORS.options.length]
            })).filter(d => d.value > 0);
        }
        return [
            { name: 'Yes', value: vote.results.yes || 0, fill: COLORS.yes },
            { name: 'No', value: vote.results.no || 0, fill: COLORS.no },
            { name: 'Abstain', value: vote.results.abstain || 0, fill: COLORS.abstain },
        ].filter(d => d.value > 0);
    };

    const pieData = getPieData();

    const Icon = () => {
        switch (vote.type) {
            case 'election': return <Users size={16} className="text-blue-600" />;
            case 'budget': return <Wallet size={16} className="text-emerald-600" />;
            default: return <CheckSquare size={16} className="text-amber-600" />;
        }
    };

    return (
        <div className="group relative bg-white rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 border border-black/5 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <Icon />
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isClosed ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'
                            }`}>
                            {isClosed ? <CheckCircle2 size={10} /> : <Clock size={10} className="animate-pulse" />}
                            {vote.type?.replace('_', ' ') || 'Decision'} • {vote.status}
                        </span>
                        {vote.type === 'budget' && vote.amount && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                                ₦{Number(vote.amount).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#1A1A2E] leading-tight">
                        {vote.question}
                    </h3>

                    {vote.description && (
                        <p className="text-sm text-black/50 leading-relaxed max-w-2xl">
                            {vote.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-black/30 pt-1">
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} /> Deadline: {new Date(vote.deadline).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users size={12} /> {totalVotes}/{vote.totalEligible} participants
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    {canManage && !isClosed && (
                        <button onClick={() => onClose(vote.id)}
                            className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all uppercase tracking-wider">
                            End Vote
                        </button>
                    )}

                    {totalVotes > 0 && (
                        <div className="relative w-32 h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={4} animationBegin={0} animationDuration={800}>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-lg font-bold text-[#1A1A2E]">{Math.round((totalVotes / vote.totalEligible) * 100)}%</span>
                                <span className="text-[8px] text-black/40 font-bold uppercase">Turnout</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Voting Interaction Zone */}
            <div className="mt-8 pt-6 border-t border-black/5">
                {!vote.myVote && !isClosed ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vote.options?.length > 0 ? (
                            vote.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => onVote(vote.id, option)}
                                    disabled={casting[vote.id]}
                                    className="group/btn relative px-4 py-3 rounded-2xl bg-gray-50 hover:bg-[#1A1A2E] text-[#1A1A2E] hover:text-white transition-all duration-300 font-medium text-sm text-center"
                                >
                                    <span className="relative z-10">{option}</span>
                                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                </button>
                            ))
                        ) : (
                            ['yes', 'no', 'abstain'].map((choice) => (
                                <button
                                    key={choice}
                                    onClick={() => onVote(vote.id, choice)}
                                    disabled={casting[vote.id]}
                                    className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${choice === 'yes' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white' :
                                        choice === 'no' ? 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white' :
                                            'bg-[#1A1A2E]/5 text-black/40 hover:bg-[#1A1A2E] hover:text-white'
                                        } ${casting[vote.id] ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-sm'}`}
                                >
                                    {casting[vote.id] ? <Loader2 size={12} className="animate-spin" /> : null}
                                    {casting[vote.id] ? 'Registering...' : choice}
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-black/30 uppercase tracking-widest">You Voted</p>
                                <p className="font-bold text-[#1A1A2E] capitalize">{vote.myVote}</p>
                            </div>
                        </div>

                        {isClosed && (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => onShare(vote)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1A1A2E] text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                                    <Share2 size={14} /> Share
                                </button>
                                <button onClick={() => onReport(vote)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-[#1A1A2E]/10 text-[#1A1A2E] text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
                                    <FileBarChart size={14} /> Report
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
