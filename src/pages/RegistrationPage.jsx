import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, ArrowRight, UserPlus, Upload, ArrowLeft, Camera, CheckCircle2, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { usePageConfig } from '../context/PageConfigContext';
import { apiRegister } from '../api/auth';
import LiveFacialCapture from '../components/LiveFacialCapture';
import IdCard from '../components/IdCard';

export default function RegistrationPage() {
    const navigate = useNavigate();
    const { login, isPageEnabled } = useAuth();
    const { brand } = useBrand();
    const { config } = usePageConfig('register');

    if (!isPageEnabled('register') || config.registrationOpen === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1221] text-white space-y-4 px-4 text-center">
                <ShieldCheck size={48} className="text-[#3B82F6]" />
                <h1 className="text-3xl font-black font-serif">Registration Closed</h1>
                <p className="text-white/50 text-sm max-w-md">{config.closedNotice || 'We are not accepting new members at this time.'}</p>
                <Link to="/login" className="px-6 py-3 bg-[#3B82F6] rounded-xl font-bold mt-4 hover:bg-[#2563EB] transition-colors">Return to Login</Link>
            </div>
        );
    }

    // Multi-step
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        facialUpload: null, 
        occupation: '',
        residentialAddress: '',
        dateOfBirth: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredMember, setRegisteredMember] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
            toast.error('Please fill in First Name, Last Name, Email, Phone, and Password fields');
            return;
        }
        setStep(2);
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation for Step 2
        if (!formData.facialUpload || !formData.residentialAddress || !formData.dateOfBirth || !formData.occupation) {
            toast.error('Please complete all required fields on this step (including Biometric Capture)');
            return;
        }

        setLoading(true);
        try {
            const data = await apiRegister(formData);
            login(data.token);

            setShowSuccessModal(true);
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const finishRegistration = () => {
        toast.success('Identity Secured. Welcome!');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden bg-[#0B1221]">
            
            {/* Background Blur Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
            <div className="absolute top-[20%] right-[10%] text-white/[0.02] -rotate-12 pointer-events-none">
                <Fingerprint size={300} />
            </div>

            <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center z-10">

                {/* Left Side: Branding */}
                <div className="hidden lg:block space-y-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#FCD34D] text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <ShieldCheck size={14} className="animate-pulse" />
                            {config.badgeText}
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] font-serif tracking-tight">
                            {config.pageHeadline}
                        </h1>
                        <p className="text-white/60 text-xl max-w-md leading-relaxed font-serif">
                            {config.pageSubtitle}
                        </p>
                    </div>

                    <div className="flex gap-4 items-center pt-8 border-t border-white/10">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0B1221] bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 text-xs font-bold shadow-sm">
                                    <UserPlus size={16} />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm font-medium text-white/50">
                            Join over <span className="text-white font-bold">1,000+</span> brothers.
                        </div>
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="relative w-full max-w-lg mx-auto">
                    <div className="bg-[#1A2235]/60 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 relative overflow-hidden">
                        
                        {/* Step Indicator Line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#F5A623] transition-all duration-700"
                                style={{ width: step === 1 ? '50%' : '100%' }}
                            />
                        </div>

                        <div className="text-center mb-10 mt-4">
                            <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner mb-6">
                                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl">
                                    <img src={brand.logoUrl} alt={brand.orgName + ' Logo'} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-3 font-serif tracking-wide">
                                {step === 1 ? 'Join the Brotherhood' : 'Biometric Verification'}
                            </h2>
                            <p className="text-white/40 text-sm font-medium">
                                {step === 1 ? config.step1Label : config.step2Label}
                            </p>
                        </div>

                        {/* Registration Closed Banner */}
                        {config.registrationOpen === false && (
                            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center flex items-center justify-center gap-2">
                                <ShieldCheck size={16} /> {config.closedNotice}
                            </div>
                        )}

                        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-5">

                            {/* STEP 1 FIELDS */}
                            {step === 1 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Enter first name"
                                                className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                                maxLength={100}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Enter last name"
                                                className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                                maxLength={100}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Middle Name (Optional)</label>
                                        <input
                                            type="text"
                                            name="middleName"
                                            value={formData.middleName}
                                            onChange={handleChange}
                                            placeholder="Enter middle name"
                                            className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="brother@example.com"
                                            className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="e.g., 08012345678"
                                            className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                            maxLength={11}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Secure Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
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
                                        className="group relative w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 overflow-hidden shadow-lg mt-8 active:scale-[0.98] border border-white/10"
                                        style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative flex items-center justify-center gap-2 text-sm tracking-wide">
                                            Continue to Verification <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* STEP 2 FIELDS */}
                            {step === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                            <Fingerprint size={12} className="text-[#3B82F6]" /> Biometric Facial Capture
                                        </label>

                                        {isCameraActive ? (
                                            <LiveFacialCapture
                                                onCapture={(dataUrl) => {
                                                    setFormData({ ...formData, facialUpload: dataUrl });
                                                    setIsCameraActive(false);
                                                }}
                                                onCancel={() => setIsCameraActive(false)}
                                            />
                                        ) : (
                                            <div
                                                className="w-full p-6 border border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#3B82F6]/50 transition-all bg-white/5 group relative overflow-hidden"
                                                onClick={() => setIsCameraActive(true)}
                                            >
                                                <div className="absolute inset-0 bg-[#3B82F6]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                {formData.facialUpload ? (
                                                    <div className="flex flex-col items-center relative z-10">
                                                        <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl mb-4 border-[3px] border-[#3B82F6]">
                                                            <img src={formData.facialUpload} alt="Face captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                                                            <div className="absolute inset-0 bg-[#3B82F6]/20 mix-blend-overlay"></div>
                                                        </div>
                                                        <p className="text-[#3B82F6] text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Camera size={12} /> Retake Biometrics</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center relative z-10 space-y-3 py-4">
                                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-inner text-[#3B82F6]">
                                                            <Fingerprint size={32} />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-white/80 text-sm font-bold">Initialize Scanner</p>
                                                            <p className="text-white/40 text-[10px] mt-1">Required for secure identity verification</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Occupation / Profession</label>
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleChange}
                                            placeholder="Current occupation"
                                            className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3.5 rounded-2xl text-white outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm"
                                            style={{ colorScheme: 'dark' }}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Residential Address</label>
                                        <textarea
                                            name="residentialAddress"
                                            value={formData.residentialAddress}
                                            onChange={handleChange}
                                            placeholder="Full residential street address"
                                            rows="2"
                                            className="w-full px-5 py-3.5 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]/50 bg-white/5 border border-white/10 text-sm resize-none"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="px-5 py-4 rounded-2xl font-bold text-white/50 hover:text-white transition-colors bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center active:scale-95"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group flex-1 relative py-4 rounded-2xl font-bold text-white transition-all duration-300 overflow-hidden shadow-lg active:scale-[0.98] disabled:opacity-50 border border-white/10"
                                            style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <span className="relative flex items-center justify-center gap-2 text-sm tracking-wide">
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                        Securing Identity...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Finalize Registration
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {step === 1 && (
                            <div className="mt-8 text-center">
                                <p className="text-white/40 text-xs font-medium">
                                    Already a member?{' '}
                                    <Link to="/login" className="text-[#FCD34D] hover:text-white font-bold transition-colors">
                                        Access Dashboard
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SUCCESS MODAL Overlay */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#0B1221]/90 backdrop-blur-xl transition-all">
                    <div className="max-w-md w-full bg-[#1A2235] rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-10 animate-in zoom-in-95 duration-500 flex flex-col items-center relative overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                        <div className="relative z-10 w-20 h-20 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center mb-6 border border-[#3B82F6]/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                            <CheckCircle2 size={40} className="animate-in fade-in zoom-in duration-700 delay-150" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 text-center font-serif">
                            Identity Secured
                        </h2>
                        <p className="text-white/50 text-center text-sm mb-10 leading-relaxed">
                            Your biometric data and profile have been successfully registered to the network. Welcome to the Brotherhood.
                        </p>

                        <button
                            onClick={finishRegistration}
                            className="w-full py-4 rounded-2xl font-bold text-white transition-all bg-[#3B82F6] hover:bg-[#2563EB] shadow-[0_8px_20px_rgba(59,130,246,0.3)] active:scale-95 flex items-center justify-center gap-2 border border-white/10"
                        >
                            Access Dashboard <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
