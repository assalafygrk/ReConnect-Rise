import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiVerifyEmail } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Validating your credentials...');

    useEffect(() => {
        const verify = async () => {
            try {
                const data = await apiVerifyEmail(token);
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
                
                // Automatically login after a delay
                setTimeout(() => {
                    login(data.token);
                    navigate('/dashboard');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token, login, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1221] text-white p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#3B82F6] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md bg-[#1A2235]/60 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl text-center">
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#FCD34D] text-[10px] font-black uppercase tracking-[0.3em]">
                        <ShieldCheck size={14} /> Security Protocol
                    </div>
                </div>

                {status === 'verifying' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-center">
                            <Loader2 size={64} className="text-[#3B82F6] animate-spin" />
                        </div>
                        <h1 className="text-2xl font-black font-serif">Verifying Email</h1>
                        <p className="text-white/50 text-sm">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                                <CheckCircle2 size={40} />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black font-serif text-white">Verification Complete</h1>
                        <p className="text-white/50 text-sm leading-relaxed">{message}</p>
                        <p className="text-white/30 text-xs italic">Redirecting you to the dashboard...</p>
                        
                        <div className="pt-4">
                            <Link 
                                to="/dashboard" 
                                className="inline-flex items-center gap-2 text-[#3B82F6] font-bold hover:underline"
                            >
                                Take me there now <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                                <XCircle size={40} />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black font-serif text-white">Verification Failed</h1>
                        <p className="text-white/50 text-sm leading-relaxed">{message}</p>
                        
                        <div className="flex flex-col gap-3 pt-4">
                            <Link 
                                to="/login" 
                                className="w-full py-4 rounded-2xl font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-lg active:scale-95"
                            >
                                Return to Login
                            </Link>
                            <Link 
                                to="/register" 
                                className="text-white/40 hover:text-white text-sm font-medium transition-colors"
                            >
                                Need a new link? Register again
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
