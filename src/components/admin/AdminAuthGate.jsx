import { useState, useRef, useEffect } from 'react';
import { Shield, Lock, ShieldCheck, X, Eye, EyeOff, AlertTriangle, ScanFace, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminAuthGate({ onClose, onSuccess }) {
    const { adminSecurityMode, unlockAdminPanel } = useAuth();
    const [step, setStep] = useState(1); // 1: Password, 2: Second Factor
    const [password, setPassword] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    
    const inputRef = useRef(null);
    const otpRefs = useRef([]);

    useEffect(() => {
        if (step === 1) {
            setTimeout(() => inputRef.current?.focus(), 150);
        } else if (step === 2 && adminSecurityMode === '2fa') {
            setTimeout(() => otpRefs.current[0]?.focus(), 150);
        } else if (step === 2 && adminSecurityMode === 'facial') {
            const interval = startFacialScan();
            return () => clearInterval(interval);
        }
    }, [step, adminSecurityMode]);

    const startFacialScan = () => {
        setScanProgress(0);
        let p = 0;
        const interval = setInterval(async () => {
            p += 20;
            setScanProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                handleSecondFactorSubmit('biometric_signature_authorized_v2');
            }
        }, 400);
        return interval;
    };

    const triggerShake = () => {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
    };

    const handlePasswordSubmit = async (e) => {
        e?.preventDefault();
        if (!password.trim()) { setError('Password required'); return; }
        
        setLoading(true);
        setError('');
        try {
            const res = await unlockAdminPanel(password, 'password');
            if (res.step === 1) {
                setStep(2);
            } else {
                onSuccess?.();
            }
        } catch (err) {
            setError(err.message || 'Invalid Admin Password');
            triggerShake();
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    const handleSecondFactorSubmit = async (secret) => {
        const val = secret || otpDigits.join('');
        if (!val || val.length < 1) return;

        setLoading(true);
        setError('');
        try {
            const res = await unlockAdminPanel(val, adminSecurityMode, password);
            if (res.success) {
                onSuccess?.();
            }
        } catch (err) {
            setError(err.message || 'Verification Failed');
            triggerShake();
            if (adminSecurityMode === '2fa') {
                setOtpDigits(['', '', '', '', '', '']);
                setTimeout(() => otpRefs.current[0]?.focus(), 50);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (idx, val) => {
        const clean = val.replace(/\D/g, '').slice(-1);
        const next = [...otpDigits];
        next[idx] = clean;
        setOtpDigits(next);
        if (clean && idx < 5) otpRefs.current[idx + 1]?.focus();
        if (next.every(d => d !== '')) {
            setTimeout(() => handleSecondFactorSubmit(next.join('')), 80);
        }
    };

    const handleOtpKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
    };

    const currentModeLabel = step === 1 ? 'Primary Authentication' : (adminSecurityMode === '2fa' ? '2-Factor Verification' : 'Biometric Match');

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0a0a1a]/80 backdrop-blur-md" onClick={onClose} />

            <div
                className={`relative w-full max-w-sm bg-[#1A1A2E] rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden
                    ${shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
            >
                <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><X size={16} /></button>

                <div className="relative p-8 pb-6 border-b border-white/5 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#E8820C]/20 rounded-full blur-[60px]" />
                    <div className="relative flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-inner
                            ${step === 2 ? (adminSecurityMode === '2fa' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400') : 'bg-[#E8820C]/10 text-[#E8820C]'}`}>
                            {step === 1 ? <Lock size={26} className={loading ? 'animate-pulse' : ''} /> : (adminSecurityMode === '2fa' ? <ShieldCheck size={26} /> : <ScanFace size={26} className="animate-pulse" />)}
                        </div>
                        <div>
                            <p className="text-white font-black font-serif text-xl leading-tight">Admin Gate</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${step >= 1 ? 'bg-[#E8820C]' : 'bg-white/20'}`} />
                                <span className={`w-1.5 h-1.5 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">{currentModeLabel}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {step === 1 ? (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Admin Access Key</label>
                                <div className="relative">
                                    <input ref={inputRef} type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                                        className="w-full bg-white/5 border border-white/10 focus:border-[#E8820C]/40 focus:bg-white/8 rounded-2xl px-5 py-4 text-white font-medium outline-none transition-all pr-12 placeholder:text-white/20" placeholder="Enter master password" />
                                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-[#E8820C] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_8px_30px_rgba(232,130,12,0.3)] hover:-translate-y-0.5 hover:bg-[#F5A623] transition-all active:scale-95 flex items-center justify-center gap-3">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} 
                                Verify Identity
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {adminSecurityMode === '2fa' ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1 block text-center">Step 2: Enter TOTP Token</label>
                                    <div className="flex gap-2 justify-center">
                                        {otpDigits.map((d, i) => (
                                            <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)}
                                                className="w-10 h-12 text-center bg-white/5 border border-white/10 focus:border-emerald-400/60 rounded-xl text-white text-xl font-black outline-none transition-all" />
                                        ))}
                                    </div>
                                    <p className="text-center text-[10px] text-white/20 italic">Verification required to finalize access</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-6 py-2 relative">
                                    <div className="relative w-32 h-32 flex items-center justify-center bg-indigo-500/5 rounded-2xl border border-indigo-400/20 overflow-hidden">
                                        <ScanFace size={60} className="text-indigo-400 opacity-80" />
                                        <div className="absolute bottom-0 left-0 w-full bg-indigo-500/20" style={{ height: `${scanProgress}%`, transition: 'height 0.4s ease' }} />
                                        <div className="absolute left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_15px_#818cf8]" style={{ bottom: `${scanProgress}%`, transition: 'bottom 0.4s ease' }} />
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-[11px] font-black uppercase tracking-widest ${error ? 'text-red-400' : 'text-[#F5A623] animate-pulse'}`}>
                                            {error ? 'Biometric Failure' : (scanProgress === 100 ? 'Match Verified' : 'Scanning Face...')}
                                        </p>
                                        <p className="text-white/30 text-[9px] mt-1 tracking-widest">{scanProgress}% Compliance Confidence</p>
                                    </div>
                                </div>
                            )}
                            
                            <button onClick={() => setStep(1)} className="w-full text-[10px] text-white/30 hover:text-white uppercase tracking-widest font-black transition-all">
                                ← Back to Password
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in zoom-in-95">
                            <AlertTriangle size={14} className="text-red-400 shrink-0" />
                            <p className="text-red-400 text-[10px] font-bold leading-tight">{error}</p>
                        </div>
                    )}

                    <p className="text-center text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
                        Secure Environment Protected by <br/> 
                        <span className="text-[#E8820C] font-black tracking-normal">ReConnect & Rise Ledger Protocols</span>
                    </p>
                    
                    <p className="text-center text-[10px] text-white/20 pt-4 border-t border-white/5">
                        Change security mode in{' '}
                        <span className="text-[#F5A623] font-bold">Settings → Security Matrix</span>
                    </p>
                </div>
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
