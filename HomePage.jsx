import { Link } from 'react-router-dom';
import { useBrand } from '../context/BrandContext';
import { 
    ShieldCheck, 
    ArrowRight, 
    Users, 
    Wallet, 
    HandHeart, 
    Scale, 
    Globe, 
    ChevronRight,
    Zap,
    Lock
} from 'lucide-react';

export default function HomePage() {
    const { brand } = useBrand();

    return (
        <div className="min-h-screen bg-[#0B1221] text-white selection:bg-[#3B82F6]/30 selection:text-white">
            
            {/* --- Navbar --- */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-white/5">
                            <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-black font-serif tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hidden sm:block">
                            {brand.orgName}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        <Link to="/login" className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                            Portal Login
                        </Link>
                        <Link 
                            to="/register" 
                            className="bg-white text-[#0B1221] px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#FCD34D] transition-all active:scale-95 shadow-lg shadow-white/5"
                        >
                            Join Now
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <section className="relative pt-44 pb-32 px-6 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#3B82F6] rounded-full blur-[150px] opacity-10 pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[#F5A623] rounded-full blur-[150px] opacity-10 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#FCD34D] text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <ShieldCheck size={14} className="animate-pulse" />
                            {brand.orgSlogan}
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] font-serif tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            Empowering <br /> 
                            <span className="text-[#3B82F6]">Brotherhood</span> Through <br />
                            Digital Unity.
                        </h1>
                        <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-serif animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                            Welcome to {brand.orgName}. A secure network built on trust, financial empowerment, and collective growth. Access resources, manage wealth, and connect with your community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                            <Link 
                                to="/register" 
                                className="group bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#3B82F6]/20 active:scale-95"
                            >
                                Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                to="/login" 
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center transition-all backdrop-blur-md active:scale-95"
                            >
                                Access Portal
                            </Link>
                        </div>
                    </div>

                    <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-500">
                        <div className="relative z-10 w-full aspect-square max-w-[500px] mx-auto bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl rounded-[3rem] border border-white/20 p-8 shadow-2xl flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#3B82F6]/5 rounded-[3rem] blur-3xl"></div>
                            <div className="grid grid-cols-2 gap-6 w-full">
                                {[
                                    { icon: <Users size={32} />, label: "Community", val: "1k+" },
                                    { icon: <Wallet size={32} />, label: "Wealth", val: "$2.5M" },
                                    { icon: <HandHeart size={32} />, label: "Support", val: "Active" },
                                    { icon: <Lock size={32} />, label: "Security", val: "Military" }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group">
                                        <div className="text-[#3B82F6] mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                                        <div className="text-2xl font-black text-white">{item.val}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Features Grid --- */}
            <section className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-4xl md:text-5xl font-black font-serif">Core Pillars</h2>
                        <p className="text-white/40 max-w-lg mx-auto font-medium">The foundation of our brotherhood, designed for modern cooperative success.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: <Wallet size={40} />, 
                                title: "Financial Hub", 
                                desc: "Unified contribution engine, micro-loans, and automated wallet management for every member." 
                            },
                            { 
                                icon: <Scale size={40} />, 
                                title: "Transparent Governance", 
                                desc: "Dynamic voting systems and real-time project oversight to ensure every voice is heard." 
                            },
                            { 
                                icon: <Zap size={40} />, 
                                title: "Digital Identity", 
                                desc: "High-security biometric verification and ID card generation for institutional recognition." 
                            },
                            { 
                                icon: <HandHeart size={40} />, 
                                title: "Welfare & Support", 
                                desc: "Emergency funds, welfare requests, and community support networks for those in need." 
                            },
                            { 
                                icon: <Globe size={40} />, 
                                title: "Advice & Growth", 
                                desc: "Real-time chat rooms and expert advice corridors for shared knowledge and mentoring." 
                            },
                            { 
                                icon: <ShieldCheck size={40} />, 
                                title: "Secure Archives", 
                                desc: "Permanent, immutable record-keeping of all community milestones and historical documents." 
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <div className="text-[#3B82F6] mb-8 group-hover:-translate-y-1 transition-transform">{feature.icon}</div>
                                <h3 className="text-2xl font-black mb-4 font-serif">{feature.title}</h3>
                                <p className="text-white/40 leading-relaxed mb-8">{feature.desc}</p>
                                <div className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all text-sm cursor-pointer">
                                    Explore <ChevronRight size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Mission Section --- */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto text-center space-y-12 bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-16 rounded-[3rem] relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#F5A623] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
                    
                    <h2 className="text-4xl md:text-6xl font-black font-serif tracking-tight leading-[1.1]">
                        Our Mission: Building <br /> <span className="text-[#FCD34D]">Legacies</span> That Last.
                    </h2>
                    <p className="text-white/60 text-xl font-serif leading-relaxed max-w-3xl mx-auto italic">
                        "To reconnect brothers across the globe, foster financial independence, and rise together as a formidable community of impact and integrity."
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/register" className="bg-[#3B82F6] text-white px-10 py-5 rounded-2xl font-black hover:bg-[#2563EB] transition-all shadow-xl shadow-[#3B82F6]/20">
                            Apply for Membership
                        </Link>
                        <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-widest text-xs">
                            <Lock size={14} className="text-green-500" /> End-to-End Encryption Enabled
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-20 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/20">
                                <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-black font-serif">{brand.orgName}</span>
                        </div>
                        <p className="text-white/30 max-w-sm font-medium leading-relaxed">
                            {brand.orgSlogan} — A premier digital platform for community growth, financial inclusion, and collective prosperity.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Quick Access</h4>
                        <ul className="space-y-4">
                            <li><Link to="/login" className="text-white/60 hover:text-white transition-colors font-medium">Member Portal</Link></li>
                            <li><Link to="/register" className="text-white/60 hover:text-white transition-colors font-medium">Registration</Link></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors font-medium">System Status</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Support</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors font-medium">Privacy Policy</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors font-medium">Member Handbook</a></li>
                            <li><a href="#" className="text-white/60 hover:text-white transition-colors font-medium">Technical Support</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:row justify-between items-center gap-6">
                    <p className="text-white/20 text-xs font-black uppercase tracking-widest">
                        © {new Date().getFullYear()} {brand.orgName}. All Rights Reserved.
                    </p>
                    <div className="flex gap-8">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors cursor-pointer">
                            <ChevronRight size={14} />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors cursor-pointer">
                            <ChevronRight size={14} />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors cursor-pointer">
                            <ChevronRight size={14} />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
