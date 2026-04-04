import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiLogin } from '../api/auth';
import TransactionReceipt from '../components/TransactionReceipt';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const mockReceipts = [
        { id: 1, name: 'Brother Ola Fashola', amount: 50000, date: '2024-03-20', type: 'disbursement', reason: 'Welfare Support' },
        { id: 2, name: 'Brother Seun Adeyemi', amount: 150000, date: '2024-03-15', type: 'loan', reason: 'Business Support' },
        { id: 3, name: 'Brother Kola Ayoola', amount: 25000, date: '2024-03-10', type: 'disbursement', reason: 'Emergency Medical' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const data = await apiLogin(email, password);
            login(data.token);
            toast.success('Welcome back, brother!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4"
            style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #252545 50%, #1A1A2E 100%)' }}>

            {/* Background patterns */}
            <div className="fixed inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #E8820C 0%, transparent 50%), radial-gradient(circle at 75% 75%, #F5A623 0%, transparent 50%)' }} />

            <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Branding & Transparency */}
                <div className="hidden lg:block space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8820C]/20 border border-[#E8820C]/30 text-[#F5A623] text-[10px] font-bold uppercase tracking-widest mb-4">
                            <ShieldCheck size={12} />
                            Secured Brotherhood Portal
                        </div>
                        <h1 className="text-6xl font-black text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Unity, Growth & <span className="text-[#E8820C]">Support.</span>
                        </h1>
                        <p className="text-white/50 text-lg max-w-md leading-relaxed">
                            A private space for the 20 brothers to manage contributions, support one another, and grow together in faith and prosperity.
                        </p>
                    </div>

                    {/* Transparency Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pr-4">
                            <h3 className="text-white/80 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                <span className="w-8 h-px bg-[#E8820C]"></span>
                                Recent Transparency Proofs
                            </h3>
                            <span className="text-[10px] text-white/30 font-medium">SCROLL TO VIEW RECEIPTS</span>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                            {mockReceipts.map(receipt => (
                                <div key={receipt.id} className="flex-shrink-0 w-80 snap-start active:cursor-grabbing">
                                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 origin-top">
                                        {/* Mini Receipt Preview */}
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-[#1A1A2E] text-white flex items-center justify-center font-bold text-[8px]">R&R</div>
                                                <span className="text-[10px] font-black text-[#1A1A2E] uppercase">Receipt Preview</span>
                                            </div>
                                            <span className="text-[8px] font-bold text-[#E8820C] uppercase tracking-tighter">REF #{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            <div>
                                                <p className="text-[8px] text-black/30 font-bold uppercase tracking-widest leading-none mb-1">Beneficiary</p>
                                                <p className="text-sm font-bold text-[#1A1A2E]">{receipt.name}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[8px] text-black/30 font-bold uppercase tracking-widest leading-none mb-1">Amount</p>
                                                    <p className="text-lg font-black text-[#1A1A2E]">₦{receipt.amount.toLocaleString()}</p>
                                                </div>
                                                <p className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter italic">Verified</p>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-gradient-to-r from-[#E8820C] to-[#F5A623]"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="relative group">
                    {/* Decorative glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/10"
                        style={{ background: 'rgba(255,248,240,0.04)', backdropFilter: 'blur(40px)' }}>

                        {/* Mobile Header (Hidden on LG) */}
                        <div className="lg:hidden text-center mb-10">
                            <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Reconnect & Rise</h1>
                            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Brotherhood Unity Portal</p>
                        </div>

                        <div className="text-center mb-10">
                            <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 shadow-inner mb-6">
                                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-2xl">
                                    <img src="/logo.jpg" alt="Reconnect & Rise Logo" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Welcome Back, Brother
                            </h2>
                            <p className="text-white/40 text-sm">Secure access to our shared growth</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Member Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Access Key</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all pr-14"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors p-2"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full py-4.5 rounded-2xl font-bold text-white transition-all duration-300 overflow-hidden shadow-[0_10px_40px_-10px_rgba(232,130,12,0.5)] active:scale-[0.98] disabled:opacity-50 mt-4"
                                style={{ background: 'linear-gradient(135deg, #E8820C, #F5A623)' }}>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Sign in to Portal <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-10 flex items-center justify-center gap-4 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-10 h-px bg-white/10"></span>
                            20 Brothers Only
                            <span className="w-10 h-px bg-white/10"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
