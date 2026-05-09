import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { usePageConfig } from '../context/PageConfigContext';
import { apiLogin, apiVerifyLogin2FA, apiResendVerification } from '../api/auth';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isPageEnabled } = useAuth();
    const { brand } = useBrand();
    const { config } = usePageConfig('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // 2FA Flow
    const [twoFactorStep, setTwoFactorStep] = useState(false);
    const [preAuthToken, setPreAuthToken] = useState(null);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [unverifiedEmail, setUnverifiedEmail] = useState(null);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (twoFactorStep) {
            setTimeout(() => {
                document.getElementById('otp-0')?.focus();
            }, 100);
        }
    }, [twoFactorStep]);

    if (!isPageEnabled('login')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1221] text-white space-y-4 px-4 text-center">
                <ShieldCheck size={48} className="text-[#3B82F6]" />
                <h1 className="text-3xl font-black font-serif">Portal Locked</h1>
                <p className="text-white/50 text-sm max-w-md">The login portal is currently suspended. Please contact administration.</p>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const data = await apiLogin(email, password);
            
            if (data.twoFactorRequired) {
                setPreAuthToken(data.preAuthToken);
                setTwoFactorStep(true);
                toast.success('Identity Verified. 2FA Required.');
                return;
            }

            login(data.token);
            toast.success('Welcome back, brother!');
            navigate('/dashboard');
        } catch (err) {
            if (err.unverified) {
                setUnverifiedEmail(email);
                toast.error('Account unverified. We just sent a fresh link!');
            } else {
                toast.error(err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendLink = async () => {
        if (!unverifiedEmail) return;
        setResending(true);
        try {
            await apiResendVerification(unverifiedEmail);
            toast.success('Verification link sent! Please check your email.');
            setUnverifiedEmail(null);
        } catch (err) {
            toast.error(err.message || 'Failed to resend link');
        } finally {
            setResending(false);
        }
    };

    const handle2FASubmit = async (e, forcedToken = null) => {
        e?.preventDefault();
        const token = forcedToken || otpDigits.join('');
        if (token.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const data = await apiVerifyLogin2FA(token, preAuthToken);
            login(data.token);
            toast.success('Multifactor Authentication Successful');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || '2FA Verification failed');
            setOtpDigits(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        
        // Handle paste of full code
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split('');
            const newDigits = [...otpDigits];
            pastedCode.forEach((char, i) => {
                if (i < 6) newDigits[i] = char;
            });
            setOtpDigits(newDigits);
            
            // Auto-submit if full code
            if (newDigits.every(d => d !== '')) {
                handle2FASubmit(null, newDigits.join(''));
            }
            return;
        }

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1); // Ensure only one digit
        setOtpDigits(newDigits);

        // Auto-focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        // Auto-submit on last digit
        if (value && index === 5) {
            const finalCode = newDigits.join('');
            if (finalCode.length === 6) {
                handle2FASubmit(null, finalCode);
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasteData) {
            const newDigits = pasteData.split('');
            const updated = ['','','','','',''];
            newDigits.forEach((d, i) => { updated[i] = d; });
            setOtpDigits(updated);
            if (updated.every(d => d !== '')) {
                handle2FASubmit(null, updated.join(''));
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden bg-[#0B1221]">
            
            {/* Background Blur Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
            
            <div className="absolute top-[20%] right-[10%] text-white/[0.02] -rotate-12 pointer-events-none">
                <ShieldCheck size={300} />
            </div>

            <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center z-10">

                {/* Left Side: Branding */}
                <div className="hidden lg:block space-y-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#FCD34D] text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <ShieldCheck size={14} className="animate-pulse" />
                            {config.badgeText || "Secure Portal"}
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] font-serif tracking-tight">
                            {config.pageHeadline || "Shared Growth"}
                        </h1>
                        <p className="text-white/60 text-xl max-w-md leading-relaxed font-serif">
                            {config.pageSubtitle || "Access your digital vault and community dashboard."}
                        </p>
                    </div>

                    <div className="flex gap-4 items-center pt-8 border-t border-white/10">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0B1221] bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 text-xs font-bold shadow-sm">
                                    <UserCheck size={16} />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm font-medium text-white/50">
                            Securely connecting <span className="text-white font-bold">1,000+</span> brothers.
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="relative w-full max-w-lg mx-auto">
                    <div className="bg-[#1A2235]/60 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 relative overflow-hidden">
                        
                        {/* Header Line Decoration */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#3B82F6] to-[#F5A623]"></div>

                        {/* Mobile Header (Hidden on LG) */}
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/">
                                <h1 className="text-4xl font-black text-white mb-2 font-serif">{brand.orgName}</h1>
                                <p className="text-[#FCD34D] text-[10px] uppercase tracking-[0.3em] font-black">{brand.orgSlogan}</p>
                            </Link>
                        </div>

                        <div className="text-center mb-10 mt-4 hidden lg:block">
                            <Link to="/" className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner mb-6 hover:scale-105 transition-transform">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl">
                                    <img src={brand.logoUrl} alt={brand.orgName + ' Logo'} className="w-full h-full object-cover" />
                                </div>
                            </Link>
                            <h2 className="text-3xl font-black text-white mb-3 font-serif tracking-wide">
                                Welcome Back, Brother
                            </h2>
                            <p className="text-white/40 text-sm font-medium">
                                Secure access to your digital vault
                            </p>
                            {unverifiedEmail && (
                                <div className="mt-4 p-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-sm animate-in fade-in duration-300">
                                    <p className="text-white/60 mb-3">Check your inbox for a verification link sent to <span className="text-white font-bold">{unverifiedEmail}</span>.</p>
                                    <button 
                                        onClick={handleResendLink}
                                        disabled={resending}
                                        className="text-[#FCD34D] font-bold text-xs uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {resending ? 'Sending...' : 'Resend Verification Link'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {!twoFactorStep ? (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="brother@example.com"
                                    className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Secure Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all pr-12 focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                        minLength={8}
                                        maxLength={64}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-2"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 overflow-hidden shadow-lg mt-8 active:scale-[0.98] disabled:opacity-50 border border-white/10"
                                style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative flex items-center justify-center gap-2 text-sm tracking-wide">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Verifying Identity...
                                        </>
                                    ) : (
                                        <>
                                            Sign in to Portal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                        ) : (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white font-serif">Two-Factor Auth</h3>
                                <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed">Identity confirmed. Enter the code from your authenticator app.</p>
                            </div>

                            <div className="flex gap-2 justify-center">
                                {otpDigits.map((d, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength="1"
                                        value={d}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        onPaste={handlePaste}
                                        className="w-10 h-14 text-center bg-white/5 border-2 border-white/10 rounded-xl text-xl font-black text-white outline-none focus:border-[#F5A623] transition-all"
                                        placeholder="-"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handle2FASubmit}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl bg-[#F5A623] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Finalize Login'}
                            </button>

                            <button 
                                onClick={() => { setTwoFactorStep(false); setOtpDigits(['','','','','','']); }}
                                className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                            >
                                Back to Password
                            </button>
                        </div>
                        )}

                        {config.registrationEnabled !== false && (
                            <div className="mt-8 text-center">
                                <p className="text-white/40 text-xs font-medium">
                                    Need an identity?{' '}
                                    <Link to="/register" className="text-[#FCD34D] hover:text-white font-bold transition-colors">
                                        {config.registrationLinkText || "Join the Brotherhood"}
                                    </Link>
                                </p>
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="w-10 h-px bg-white/5"></span>
                            <ShieldCheck size={12} className="text-white/30" />
                            {config.footerNote || "Secured Protocol"}
                            <span className="w-10 h-px bg-white/5"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
