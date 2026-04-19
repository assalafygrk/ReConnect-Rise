import { useState, useRef, useEffect } from 'react';
import { Shield, Lock, ShieldCheck, X, Eye, EyeOff, AlertTriangle, ScanFace } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminAuthGate({ onClose, onSuccess }) {
    const { adminSecurityMode, unlockAdminPanel } = useAuth();
    const [input, setInput] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [scanProgress, setScanProgress] = useState(0);
    const inputRef = useRef(null);
    const otpRefs = useRef([]);

    useEffect(() => {
        setTimeout(() => {
            if (adminSecurityMode === 'password') inputRef.current?.focus();
            else if (adminSecurityMode === '2fa') otpRefs.current[0]?.focus();
            else if (adminSecurityMode === 'facial') {
                setScanProgress(0);
                let p = 0;
                const interval = setInterval(() => {
                    p += 20;
                    setScanProgress(p);
                    if (p >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            if (unlockAdminPanel('mock-face-scan-success')) {
                                onSuccess?.();
                            }
                        }, 400);
                    }
                }, 400);
                return () => clearInterval(interval);
            }
        }, 150);
    }, [adminSecurityMode, unlockAdminPanel, onSuccess]);

    const triggerShake = () => {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        const secret = adminSecurityMode === '2fa' ? otpDigits.join('') : input;
        if (!secret.trim()) { setError('Enter credentials to proceed.'); return; }

        const ok = unlockAdminPanel(secret);
        if (ok) {
            onSuccess?.();
        } else {
            const next = attempts + 1;
            setAttempts(next);
            setError(next >= 3
                ? 'Multiple failed attempts detected. Verify your credentials.'
                : 'Invalid credentials. Access denied.');
            triggerShake();
            if (adminSecurityMode === 'password') setInput('');
            else setOtpDigits(['', '', '', '', '', '']);
        }
    };

    const handleOtpChange = (idx, val) => {
        const clean = val.replace(/\D/g, '').slice(-1);
        const next = [...otpDigits];
        next[idx] = clean;
        setOtpDigits(next);
        if (clean && idx < 5) otpRefs.current[idx + 1]?.focus();
        if (next.every(d => d !== '')) {
            // auto submit when all 6 filled
            setTimeout(() => {
                const secret = next.join('');
                const ok = unlockAdminPanel(secret);
                if (ok) {
                    onSuccess?.();
                } else {
                    setAttempts(a => a + 1);
                    setError('Invalid 2FA code. Access denied.');
                    triggerShake();
                    setOtpDigits(['', '', '', '', '', '']);
                    setTimeout(() => otpRefs.current[0]?.focus(), 50);
                }
            }, 80);
        }
    };

    const handleOtpKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0a0a1a]/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`relative w-full max-w-sm bg-[#1A1A2E] rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden
                    ${shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                style={{ animation: shaking ? 'shake 0.4s ease-in-out' : undefined }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                    <X size={16} />
                </button>

                {/* Header glow */}
                <div className="relative p-8 pb-6 border-b border-white/5 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#E8820C]/20 rounded-full blur-[60px]" />
                    <div className="relative flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-inner
                            ${adminSecurityMode === '2fa' ? 'bg-emerald-500/10 text-emerald-400' : adminSecurityMode === 'facial' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-[#E8820C]/10 text-[#E8820C]'}`}>
                            {adminSecurityMode === '2fa' ? <ShieldCheck size={26} /> : adminSecurityMode === 'facial' ? <ScanFace size={26} className="animate-pulse" /> : <Lock size={26} className="animate-pulse" />}
                        </div>
                        <div>
                            <p className="text-white font-black font-serif text-xl leading-tight">Admin Control</p>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-0.5">
                                {adminSecurityMode === '2fa' ? '2-Factor Verification' : adminSecurityMode === 'facial' ? 'Biometric Face ID' : 'Password Required'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form area */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {adminSecurityMode === 'password' ? (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">
                                Admin Panel Password
                            </label>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type={showPw ? 'text' : 'password'}
                                    value={input}
                                    onChange={e => { setInput(e.target.value); setError(''); }}
                                    className="w-full bg-white/5 border border-white/10 focus:border-[#E8820C]/40 focus:bg-white/8 rounded-2xl px-5 py-4 text-white font-medium outline-none transition-all pr-12 placeholder:text-white/20"
                                    placeholder="Enter admin password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ) : adminSecurityMode === '2fa' ? (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1 block text-center">
                                Enter 6-Digit 2FA Code
                            </label>
                            <div className="flex gap-2 justify-center">
                                {otpDigits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => otpRefs.current[i] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={d}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        className="w-10 h-12 text-center bg-white/5 border border-white/10 focus:border-emerald-400/60 rounded-xl text-white text-xl font-black outline-none transition-all"
                                    />
                                ))}
                            </div>
                            <p className="text-center text-[10px] text-white/20 italic">
                                Use your Authenticator app code
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-6 py-6 font-mono relative">
                            <div className="relative w-32 h-32 flex items-center justify-center bg-indigo-500/5 rounded-2xl border border-indigo-400/20 overflow-hidden">
                                <ScanFace size={60} className="text-indigo-400 opacity-80" />
                                <div className="absolute bottom-0 left-0 w-full bg-indigo-500/20" style={{ height: `${scanProgress}%`, transition: 'height 0.4s ease' }} />
                                <div className="absolute left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_15px_#818cf8]" style={{ bottom: `${scanProgress}%`, transition: 'bottom 0.4s ease' }} />
                                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-500"></div>
                                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-500"></div>
                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-500"></div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-500"></div>
                            </div>
                            <div className="text-center">
                                <p className="text-[#F5A623] text-[11px] font-black uppercase tracking-widest animate-pulse">
                                    {scanProgress === 100 ? 'Access Granted' : 'Running Scan...'}
                                </p>
                                <p className="text-white/30 text-[9px] mt-1 tracking-widest">{scanProgress}% Match Confidence</p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <AlertTriangle size={14} className="text-red-400 shrink-0" />
                            <p className="text-red-400 text-[11px] font-bold">{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    {adminSecurityMode === 'password' && (
                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#E8820C] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_8px_30px_rgba(232,130,12,0.3)] hover:-translate-y-0.5 hover:bg-[#F5A623] transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Shield size={16} /> Authenticate & Enter
                        </button>
                    )}

                    <p className="text-center text-[10px] text-white/20">
                        Change security mode in{' '}
                        <span className="text-[#F5A623] font-bold">Settings → Personal Config</span>
                    </p>
                </form>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    );
}
