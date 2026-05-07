import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Smartphone, Lock, Eye, EyeOff } from 'lucide-react';
import { useBrand } from '../context/BrandContext';

export default function MockLoginPage() {
    const navigate = useNavigate();
    const { brand } = useBrand();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login success
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1221] px-4 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
            
            <div className="relative w-full max-w-md">
                <div className="bg-[#1A2235]/60 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3B82F6]"></div>
                    
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner mb-6 hover:scale-105 transition-transform">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl">
                                <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        </Link>
                        <h2 className="text-3xl font-black text-white mb-2 font-serif">Welcome Back</h2>
                        <p className="text-white/40 text-sm font-medium">Access your telecomms dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Email Address</label>
                            <div className="relative">
                                <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    type="email"
                                    placeholder="yourname@email.com"
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#3B82F6]/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-white/40 text-xs font-medium">
                            Don't have an account?{' '}
                            <Link to="/mock-register" className="text-[#3B82F6] font-bold hover:underline">
                                Register Now
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <ShieldCheck size={14} className="text-green-500" /> Secure SSL Connection
                    </div>
                </div>
            </div>
        </div>
    );
}
