import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, ArrowRight, UserPlus, Upload, ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { usePageConfig } from '../context/PageConfigContext';
import { apiRegister } from '../api/auth';
import LiveFacialCapture from '../components/LiveFacialCapture';
import IdCard from '../components/IdCard';

export default function RegistrationPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { brand } = useBrand();
    const { config } = usePageConfig('register');

    // Multi-step
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        facialUpload: null, // Now holds Data URL
        occupation: '',
        residentialAddress: '',
        dateOfBirth: '',
        educationLevel: '',
        school: ''
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
            toast.error('Please complete all required fields on this step (including Photo and Occupation)');
            return;
        }

        if (formData.educationLevel && formData.educationLevel !== 'None' && !formData.school) {
            toast.error('Please select your school or institution');
            return;
        }

        setLoading(true);
        try {
            const data = await apiRegister(formData);
            login(data.token);

            // Build member object for ID Card
            const fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');
            setRegisteredMember({
                name: fullName,
                photo: formData.facialUpload,
                occupation: formData.occupation,
                idNo: 'RR-' + Math.floor(1000 + Math.random() * 9000), // Random ID for demo
                issueDate: new Date()
            });

            setShowSuccessModal(true);
        } catch (err) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const finishRegistration = () => {
        toast.success('Registration successful. Welcome, brother!');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4"
            style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #252545 50%, #1A1A2E 100%)' }}>

            {/* Background patterns */}
            <div className="fixed inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #E8820C 0%, transparent 50%), radial-gradient(circle at 75% 75%, #F5A623 0%, transparent 50%)' }} />

            <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Branding */}
                <div className="hidden lg:block space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8820C]/20 border border-[#E8820C]/30 text-[#F5A623] text-[10px] font-bold uppercase tracking-widest mb-4">
                            <ShieldCheck size={12} />
                            {config.badgeText}
                        </div>
                        <h1 className="text-6xl font-black text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {config.pageHeadline}
                        </h1>
                        <p className="text-white/50 text-lg max-w-md leading-relaxed">
                            {config.pageSubtitle}
                        </p>
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#E8820C] to-[#F5A623] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                    <div className="relative rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/10"
                        style={{ background: 'rgba(255,248,240,0.04)', backdropFilter: 'blur(40px)' }}>

                        <div className="text-center mb-10">
                            <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 shadow-inner mb-6">
                                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-2xl">
                                    <img src={brand.logoUrl} alt={brand.orgName + ' Logo'} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {step === 1 ? 'Join the Brotherhood' : 'Verification Details'}
                            </h2>
                            <p className="text-white/40 text-sm">
                                {step === 1 ? config.step1Label : config.step2Label}
                            </p>
                        </div>

                        {/* Registration Closed Banner */}
                        {config.registrationOpen === false && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium text-center">
                                {config.closedNotice}
                            </div>
                        )}

                        <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-6">

                            {/* STEP 1 FIELDS */}
                            {step === 1 && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="First"
                                                className="w-full px-4 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Last"
                                                className="w-full px-4 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Middle Name (Optional)</label>
                                        <input
                                            type="text"
                                            name="middleName"
                                            value={formData.middleName}
                                            onChange={handleChange}
                                            placeholder="Middle name"
                                            className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Secure Mobile Line</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Your phone number"
                                            className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Security Key (Password)</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all pr-14"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
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
                                        className="group relative w-full py-4.5 rounded-2xl font-bold text-white transition-all duration-300 overflow-hidden shadow-[0_10px_40px_-10px_rgba(232,130,12,0.5)] active:scale-[0.98] mt-4"
                                        style={{ background: 'linear-gradient(135deg, #E8820C, #F5A623)' }}>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative flex items-center justify-center gap-3">
                                            Continue to Step 2 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </button>
                                </>
                            )}

                            {/* STEP 2 FIELDS */}
                            {step === 2 && (
                                <>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Live Facial Capture</label>

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
                                                    className="w-full px-6 py-6 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#E8820C]/50 transition-colors bg-white/5"
                                                    onClick={() => setIsCameraActive(true)}
                                                >
                                                    {formData.facialUpload ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl mb-3 border-2 border-[#E8820C]">
                                                                <img src={formData.facialUpload} alt="Face captured" className="w-full h-full object-cover transform scale-x-[-1]" />
                                                            </div>
                                                            <p className="text-white/60 text-sm font-medium">Tap to retake photo</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Camera className="text-[#E8820C] mb-2" size={24} />
                                                            <p className="text-white/60 text-sm font-medium">
                                                                Tap to initialize camera capture
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Occupation</label>
                                            <input
                                                type="text"
                                                name="occupation"
                                                value={formData.occupation}
                                                onChange={handleChange}
                                                placeholder="Your current profession / job"
                                                className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 rounded-2xl text-white outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Residential Address</label>
                                            <textarea
                                                name="residentialAddress"
                                                value={formData.residentialAddress}
                                                onChange={handleChange}
                                                placeholder="Full street address"
                                                rows="2"
                                                className="w-full px-6 py-4 rounded-2xl text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50 resize-none"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Education Level (Optional)</label>
                                            <select
                                                name="educationLevel"
                                                value={formData.educationLevel}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 rounded-2xl text-white outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50 appearance-none cursor-pointer"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                            >
                                                <option value="" className="bg-[#252545]">Select Level (Optional)...</option>
                                                <option value="Primary" className="bg-[#252545]">Primary</option>
                                                <option value="Secondary" className="bg-[#252545]">Secondary</option>
                                                <option value="Undergraduate" className="bg-[#252545]">Undergraduate</option>
                                                <option value="Postgraduate" className="bg-[#252545]">Postgraduate</option>
                                                <option value="Other" className="bg-[#252545]">Other</option>
                                            </select>
                                        </div>

                                        {formData.educationLevel && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Select School</label>
                                                <select
                                                    name="school"
                                                    value={formData.school}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 rounded-2xl text-white outline-none transition-all focus:ring-2 focus:ring-[#E8820C]/50 appearance-none cursor-pointer"
                                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                >
                                                    <option value="" className="bg-[#252545]">Select Institution...</option>
                                                    <option value="University of Lagos" className="bg-[#252545]">University of Lagos</option>
                                                    <option value="Ahmadu Bello University" className="bg-[#252545]">Ahmadu Bello University</option>
                                                    <option value="University of Ibadan" className="bg-[#252545]">University of Ibadan</option>
                                                    <option value="Bayero University Kano" className="bg-[#252545]">Bayero University Kano</option>
                                                    <option value="Other" className="bg-[#252545]">Other Institution</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="px-6 py-4.5 rounded-2xl font-bold text-white/70 hover:text-white transition-colors bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group flex-1 relative py-4.5 rounded-2xl font-bold text-white transition-all duration-300 overflow-hidden shadow-[0_10px_40px_-10px_rgba(232,130,12,0.5)] active:scale-[0.98] disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, #E8820C, #F5A623)' }}>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <span className="relative flex items-center justify-center gap-3">
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                        </svg>
                                                        Registering...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus size={18} className="group-hover:-translate-y-1 transition-transform" /> Complete Registration
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>

                        {step === 1 && (
                            <div className="mt-8 text-center">
                                <p className="text-white/60 text-sm">
                                    Already a brother?{' '}
                                    <Link to="/login" className="text-[#F5A623] hover:text-white font-bold transition-colors">
                                        Login Document
                                    </Link>
                                </p>
                            </div>
                        )}

                        <div className="mt-10 flex items-center justify-center gap-4 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-10 h-px bg-white/10"></span>
                            <ShieldCheck size={14} /> {step === 1 ? 'Secured Form' : 'Identity Verification'}
                            <span className="w-10 h-px bg-white/10"></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUCCESS MODAL Overlay */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="max-w-md w-full bg-[#1A1A2E] rounded-[2rem] border border-white/10 shadow-2xl p-8 animate-in slide-in-from-bottom flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6 ring-4 ring-green-500/10">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Registration Successful!
                        </h2>
                        <p className="text-white/50 text-center text-sm mb-8">
                            Your identity has been secured. Welcome to the Brotherhood.
                        </p>

                        <button
                            onClick={finishRegistration}
                            className="w-full py-4 rounded-xl font-bold text-white transition-all bg-[#0A32B3] hover:bg-[#1A45CE] shadow-lg flex items-center justify-center gap-2"
                        >
                            Continue to Dashboard <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

