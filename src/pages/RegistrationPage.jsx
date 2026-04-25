import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, ArrowRight, UserPlus, ArrowLeft, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { usePageConfig } from '../context/PageConfigContext';
import { apiRegister } from '../api/auth';
import LiveFacialCapture from '../components/LiveFacialCapture';

export default function RegistrationPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { brand } = useBrand();
    const { config } = usePageConfig('register');

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
        dateOfBirth: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
            toast.error('Complete all required fields');
            return;
        }
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.facialUpload || !formData.residentialAddress || !formData.dateOfBirth || !formData.occupation) {
            toast.error('Verification data missing');
            return;
        }

        setLoading(true);
        try {
            const data = await apiRegister(formData);
            login(data);
            setShowSuccessModal(true);
        } catch (err) {
            toast.error(err.message || 'Registration failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#1A1A2E]">
            <div className="fixed inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-[#E8820C] to-transparent"></div>
            
            <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
                <div className="hidden lg:block space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F5A623] text-[10px] font-black uppercase tracking-[0.3em]">
                        <ShieldCheck size={14} /> {config.badgeText || 'Secured Portal'}
                    </div>
                    <h1 className="text-6xl font-black text-white font-serif leading-tight">{config.pageHeadline || 'Join the Brotherhood'}</h1>
                    <p className="text-white/40 text-lg italic font-serif leading-relaxed">{config.pageSubtitle || 'A shared journey of growth and sovereignty.'}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl space-y-8">
                    <div className="text-center space-y-4">
                        <img src={brand.logoUrl} className="w-20 h-20 mx-auto rounded-2xl shadow-2xl" alt="Logo" />
                        <h2 className="text-2xl font-black text-white font-serif">{step === 1 ? 'Primary Identity' : 'Sovereign Verification'}</h2>
                    </div>

                    <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-6">
                        {step === 1 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50" required />
                                    <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50" required />
                                </div>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Strategic Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50" required />
                                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Mobile Line" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50" required />
                                <div className="relative">
                                    <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Security Key" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                <button type="submit" className="w-full py-5 rounded-2xl bg-[#E8820C] hover:bg-[#F5A623] text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all">Proceed to Verification</button>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Facial Capture</label>
                                    {isCameraActive ? (
                                        <LiveFacialCapture onCapture={url => { setFormData({...formData, facialUpload: url}); setIsCameraActive(false); }} onCancel={() => setIsCameraActive(false)} />
                                    ) : (
                                        <div onClick={() => setIsCameraActive(true)} className="w-full aspect-video rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5 cursor-pointer hover:border-[#E8820C]/50">
                                            {formData.facialUpload ? <img src={formData.facialUpload} className="w-full h-full object-cover rounded-[1.4rem]" /> : <><Camera className="text-[#E8820C] mb-2" /><span className="text-[10px] text-white/40 uppercase">Initialize Biometric Scan</span></>}
                                        </div>
                                    )}
                                </div>
                                <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50" required />
                                <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50" required />
                                <textarea name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} placeholder="Residential Address" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#E8820C]/50 resize-none" rows={2} required />
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 rounded-2xl bg-white/5 border border-white/10 text-white"><ArrowLeft size={20} /></button>
                                    <button type="submit" disabled={loading} className="flex-1 py-5 rounded-2xl bg-[#E8820C] text-white font-black text-xs uppercase tracking-widest shadow-xl flex justify-center items-center gap-3">
                                        {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} /> Complete Onboarding</>}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                    <div className="text-center"><Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-[#F5A623] hover:text-white transition-colors">Already registered? Access Vault</Link></div>
                </div>
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-[#1A1A2E] rounded-[3rem] p-12 border border-white/10 shadow-2xl text-center space-y-8 max-w-sm">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500"><CheckCircle2 size={48} /></div>
                        <h2 className="text-3xl font-black text-white font-serif">Onboarding Complete</h2>
                        <p className="text-white/40 text-sm italic">Welcome to the brotherhood. Your identity is now secured within our ledger.</p>
                        <button onClick={() => navigate('/dashboard')} className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">Enter Dashboard <ArrowRight size={20} /></button>
                    </div>
                </div>
            )}
        </div>
    );
}
