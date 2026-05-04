import { CheckCircle2, Clock, Share2, FileBarChart, Users, Wallet, CheckSquare, ChevronRight, Loader2, Zap } from 'lucide-react';
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
    const isClosed = vote.status === 'closed' || (vote.deadline && new Date(vote.deadline) < new Date());

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

    const winner = isClosed ? Object.entries(vote.results || {}).reduce((a, b) => (b[1] > (a[1] || 0) ? b : a), [null, 0])[0] : null;
    const winnerData = winner && vote.type === 'election' ? vote.candidates?.find(c => c.name === winner) : null;

    const Icon = () => {
        switch (vote.type) {
            case 'election': return <Users size={16} className="text-blue-600" />;
            case 'budget': return <Wallet size={16} className="text-emerald-600" />;
            default: return <CheckSquare size={16} className="text-amber-600" />;
        }
    };

    return (
        <div className="group relative bg-white dark:bg-[#0B1221] rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-none border border-black/5 dark:border-white/10 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <Icon />
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isClosed ? 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                            }`}>
                            {isClosed ? <CheckCircle2 size={10} /> : <Clock size={10} className="animate-pulse" />}
                            {vote.type?.replace('_', ' ') || 'Decision'} • {vote.status}
                        </span>
                        {vote.type === 'budget' && vote.amount && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                ₦{Number(vote.amount).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#1A1A2E] dark:text-white leading-tight">
                        {vote.question}
                    </h3>

                    {vote.description && (
                        <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed max-w-2xl">
                            {vote.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-black/30 dark:text-white/30 pt-1">
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
                            className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-xl transition-all uppercase tracking-wider">
                            End Vote
                        </button>
                    )}

                    {totalVotes > 0 && vote.showResults !== false ? (
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
                                <span className="text-lg font-bold text-[#1A1A2E] dark:text-white">{Math.round((totalVotes / vote.totalEligible) * 100)}%</span>
                                <span className="text-[8px] text-black/40 dark:text-white/40 font-bold uppercase">Turnout</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-32 h-32 flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 rounded-full border border-dashed border-black/10 dark:border-white/10 p-4 text-center">
                            <Users size={20} className="text-black/20 dark:text-white/20 mb-1" />
                            <p className="text-[7px] font-bold text-black/30 dark:text-white/30 uppercase tracking-tighter">Vote to unlock insights</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Voting Interaction Zone */}
            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10">
                {!vote.myVote && !isClosed ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {vote.type === 'election' ? (
                            vote.candidates?.map((candidate) => (
                                <button
                                    key={candidate._id}
                                    onClick={() => onVote(vote.id, candidate.name)}
                                    disabled={casting[vote.id]}
                                    className="group/btn relative p-4 rounded-3xl bg-gray-50 dark:bg-white/5 hover:bg-[#1A1A2E] dark:hover:bg-white text-[#1A1A2E] dark:text-white hover:text-white dark:hover:text-[#1A1A2E] transition-all duration-300 flex flex-col items-center gap-3 border border-black/5 dark:border-white/10"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden border-2 border-transparent group-hover/btn:border-[#E8820C] transition-all">
                                        {candidate.facialUpload ? (
                                            <img src={candidate.facialUpload} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-xl">{candidate.name?.[0] || '?'}</div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black tracking-tight">{candidate.name}</p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Candidate</p>
                                    </div>
                                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                </button>
                            ))
                        ) : vote.options?.length > 0 ? (
                            vote.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => onVote(vote.id, option)}
                                    disabled={casting[vote.id]}
                                    className="group/btn relative px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-[#1A1A2E] dark:hover:bg-white text-[#1A1A2E] dark:text-white hover:text-white dark:hover:text-[#1A1A2E] transition-all duration-300 font-medium text-sm text-center"
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
                                    className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${choice === 'yes' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500' :
                                        choice === 'no' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500' :
                                            'bg-gray-50 dark:bg-white/10 text-black/40 dark:text-white/40 hover:bg-[#1A1A2E] dark:hover:bg-white hover:text-white dark:hover:text-[#1A1A2E]'
                                        } ${casting[vote.id] ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-sm'}`}
                                >
                                    {casting[vote.id] ? <Loader2 size={12} className="animate-spin" /> : null}
                                    {casting[vote.id] ? 'Registering...' : choice}
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isClosed ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                {isClosed ? <Zap size={24} /> : <CheckCircle2 size={24} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">
                                    {isClosed ? 'Final Result' : 'Position Recorded'}
                                </p>
                                <p className="text-lg font-black text-[#1A1A2E] dark:text-white flex items-center gap-2">
                                    {isClosed ? (
                                        <>
                                            Winner: <span className="text-[#E8820C]">{winner || 'No Decision'}</span>
                                        </>
                                    ) : (
                                        <>Your Choice: <span className="capitalize">{vote.myVote}</span></>
                                    )}
                                </p>
                            </div>
                        </div>

                        {isClosed && winnerData && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-500/20">
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400">
                                    <img src={winnerData.facialUpload} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">Victor Recognized</span>
                            </div>
                        )}

                        {isClosed && (
                            <div className="flex gap-2">
                                <button onClick={() => onShare(vote)}
                                    className="p-3 rounded-xl bg-[#1A1A2E] dark:bg-white text-white dark:text-[#1A1A2E] hover:opacity-90 transition-all">
                                    <Share2 size={16} />
                                </button>
                                <button onClick={() => onReport(vote)}
                                    className="p-3 rounded-xl border border-[#1A1A2E]/10 dark:border-white/10 text-[#1A1A2E] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                    <FileBarChart size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
