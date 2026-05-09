import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useBrand } from '../context/BrandContext';
import { 
    ShieldCheck, 
    ArrowRight, 
    Smartphone, 
    Wifi, 
    Zap, 
    Tv, 
    ChevronRight,
    CreditCard,
    History,
    CheckCircle2,
    Users
} from 'lucide-react';

export default function HomePage() {
    const { brand } = useBrand();
    const services = [
        { 
            id: 'airtime', 
            name: 'Airtime Top-up', 
            icon: <Smartphone size={32} />, 
            desc: "Instantly recharge your mobile lines with zero delays. Supports all major networks with exclusive bonus offers on every top-up.",
            value: "1% - 5% Cashback on every recharge"
        },
        { 
            id: 'data', 
            name: 'Data Bundles', 
            icon: <Wifi size={32} />, 
            desc: "High-speed 4G/5G data plans for all networks. Choose from daily, weekly, or monthly bundles at the most affordable rates in Nigeria.",
            value: "Cheapest rates starting from ₦250/GB"
        },
        { 
            id: 'electricity', 
            name: 'Electricity Bills', 
            icon: <Zap size={32} />, 
            desc: "Pay your electricity bills for all distribution companies (IKEDC, EKEDC, PHED, etc.) and get your token instantly via SMS.",
            value: "Instant Token generation 24/7"
        },
        { 
            id: 'cable', 
            name: 'Cable TV', 
            icon: <Tv size={32} />, 
            desc: "Renew your DSTV, GOtv, and StarTimes subscriptions effortlessly. Automatic activation ensures you never miss your favorite shows.",
            value: "Zero convenience fee on renewals"
        },
        { 
            id: 'exam', 
            name: 'Exam Pins', 
            icon: <CheckCircle2 size={32} />, 
            desc: "Get your WAEC, NECO, and NABTEB result checker pins instantly. Reliable and authenticated pins delivered to your dashboard.",
            value: "Bulk purchase available for schools"
        },
        { 
            id: 'bulk_sms', 
            name: 'Bulk SMS', 
            icon: <History size={32} />, 
            desc: "Send customized SMS to multiple recipients with your own Sender ID. High delivery rate to all networks including DND numbers.",
            value: "Starting from ₦2.50 per unit"
        }
    ];

    const [selectedService, setSelectedService] = useState(services[0]);
    const [showAllPlans, setShowAllPlans] = useState(false);
    const [focusedPlan, setFocusedPlan] = useState(null);
    const [activeFooterLink, setActiveFooterLink] = useState(null);

    const footerContent = {
        'about': {
            title: 'About ReConnect & Rise VTU',
            content: 'ReConnect & Rise VTU is Nigeria\'s premier digital distribution platform for airtime, data, and utility payments. Founded with the mission to provide seamless connectivity, we bridge the gap between service providers and consumers with high-speed automated systems.',
            extra: 'Our infrastructure handles over 100,000 transactions daily with a 99.9% success rate.'
        },
        'terms': {
            title: 'Terms of Service',
            content: 'By using our platform, you agree to our automated processing terms. All VTU transactions are final once delivered. We ensure bank-grade security for all payment data. Users are responsible for providing accurate phone numbers and meter details.',
            extra: 'Last Updated: May 2026'
        },
        'support': {
            title: 'Contact Support',
            content: 'Our dedicated support team is available 24/7 to assist you with any transaction issues or inquiries.',
            extra: 'Email: risereconnect@gmail.com \nPhone: +234 9160048633'
        },
        'api': {
            title: 'API Documentation',
            content: 'Integrate our robust VTU engine into your own applications. Our RESTful API supports instant recharge, balance checks, and transaction status queries.',
            extra: 'Base URL: https://api.reconnectrise.com/v1 \nAuth: Bearer Token Required'
        },
        'help': {
            title: 'Help Center & FAQ',
            content: 'Common questions: \n1. How fast is delivery? (Instant) \n2. What if a transaction fails? (Auto-refund to wallet) \n3. How do I become a merchant? (Register via the Sign Up button).',
            extra: 'Need more help? Use our Contact Support option.'
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1221] text-white selection:bg-[#3B82F6]/30 selection:text-white">
            
            {/* --- Footer Modal Overlay --- */}
            {activeFooterLink && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setActiveFooterLink(null)}
                    ></div>
                    <div className="relative w-full max-w-2xl bg-[#1A2235] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setActiveFooterLink(null)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <div className="space-y-6">
                            <div className="inline-flex p-3 rounded-2xl bg-[#3B82F6]/20 text-[#3B82F6]">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-3xl font-black font-serif">{footerContent[activeFooterLink].title}</h2>
                            <p className="text-white/60 leading-relaxed text-lg font-serif italic">
                                {footerContent[activeFooterLink].content}
                            </p>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[#3B82F6] font-mono text-sm whitespace-pre-line leading-loose">
                                    {footerContent[activeFooterLink].extra}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- Navbar --- */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-white/5 shrink-0">
                                <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-lg sm:text-xl font-black font-serif tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                                {brand.orgName}
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        <Link to="/mock-login" className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                            Login
                        </Link>
                        <Link 
                            to="/mock-register" 
                            className="bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#2563EB] transition-all active:scale-95 shadow-lg shadow-[#3B82F6]/20"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- Hero & Services Grid --- */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#3B82F6] rounded-full blur-[150px] opacity-10 pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[#F5A623] rounded-full blur-[150px] opacity-10 pointer-events-none animate-pulse"></div>

                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left: Text Content */}
                    <div className="lg:col-span-6 space-y-8 pt-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#3B82F6] text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <Zap size={14} className="animate-pulse" />
                            Premium Utility Network
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] font-serif tracking-tight">
                            Smart <span className="text-[#3B82F6]">Solutions</span> <br className="hidden sm:block" /> 
                            For Your Daily Needs.
                        </h1>
                        <p className="text-white/50 text-lg sm:text-xl max-w-xl leading-relaxed font-serif">
                            Experience the future of utility payments. Secure, fast, and automated services tailored for the modern consumer.
                        </p>
                        
                        {/* Service Detail Display */}
                        <div className="mt-12 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-[#3B82F6]/20 text-[#3B82F6]">
                                    {selectedService.icon}
                                </div>
                                <h3 className="text-2xl font-black font-serif">{selectedService.name}</h3>
                            </div>
                            <p className="text-white/60 mb-6 leading-relaxed italic font-serif">"{selectedService.desc}"</p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold uppercase tracking-widest border border-[#3B82F6]/20">
                                <ArrowRight size={14} /> {selectedService.value}
                            </div>
                        </div>
                    </div>

                    {/* Right: Service Widget Grid */}
                    <div className="lg:col-span-6 relative">
                        <div className="bg-[#1A2235]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#3B82F6] to-[#F5A623]"></div>
                            
                            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                                <ChevronRight className="text-[#3B82F6]" size={20} /> Select a Service
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {services.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedService(s)}
                                        className={`flex flex-col items-center justify-center gap-4 aspect-square rounded-[2rem] transition-all relative overflow-hidden border ${
                                            selectedService.id === s.id 
                                            ? 'bg-[#3B82F6] border-white/20 scale-105 shadow-2xl shadow-[#3B82F6]/30' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-[1.02]'
                                        }`}
                                    >
                                        <div className={`${selectedService.id === s.id ? 'text-white' : 'text-[#3B82F6]'}`}>
                                            {s.icon}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest text-center px-2 ${selectedService.id === s.id ? 'text-white' : 'text-white/60'}`}>
                                            {s.name}
                                        </span>
                                        {selectedService.id === s.id && (
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Link 
                                    to="/mock-register"
                                    className="w-full py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border border-white/10"
                                >
                                    Access Full Dashboard <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Removed Live Transactions Ticker --- */}


            {/* --- Trusted By Section --- */}
            <section className="py-20 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-12">Powering Transactions Across Major Networks & Banks</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Mock Logos for Realism */}
                        <div className="text-2xl font-black font-serif italic tracking-tighter">ZENITH</div>
                        <div className="text-2xl font-black font-serif italic tracking-tighter">ACCESS</div>
                        <div className="text-2xl font-black font-serif italic tracking-tighter">GTBank</div>
                        <div className="text-2xl font-black font-serif italic tracking-tighter">UBA</div>
                        <div className="text-2xl font-black font-serif italic tracking-tighter">Kuda.</div>
                        <div className="text-2xl font-black font-serif italic tracking-tighter">Opay</div>
                    </div>
                </div>
            </section>

            {/* --- How It Works --- */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black font-serif">Three Simple Steps</h2>
                        <p className="text-white/40 font-medium max-w-lg mx-auto">Get started in minutes with our streamlined onboarding process.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Create Account", desc: "Sign up for free as a regular user or apply for a Merchant account to get better rates." },
                            { step: "02", title: "Fund Wallet", desc: "Add funds to your secure digital wallet via Bank Transfer or Debit Card instantly." },
                            { step: "03", title: "Start Transacting", desc: "Recharge phones, pay bills, and manage your utilities with one-click automation." }
                        ].map((item, i) => (
                            <div key={i} className="relative p-12 rounded-[3rem] bg-white/[0.03] border border-white/10 group hover:border-[#3B82F6]/50 transition-all">
                                <div className="text-6xl font-black text-[#3B82F6]/20 absolute top-8 right-10 group-hover:text-[#3B82F6]/40 transition-colors font-serif">{item.step}</div>
                                <h3 className="text-2xl font-black mb-4 mt-8 font-serif">{item.title}</h3>
                                <p className="text-white/40 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Testimonials --- */}
            <section className="py-32 px-6 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 text-[#3B82F6] font-black text-[10px] uppercase tracking-widest">
                                <Users size={16} /> Community Feedback
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black font-serif">What Our <br /> Users Say.</h2>
                        </div>
                        <p className="text-white/40 max-w-sm font-medium leading-relaxed italic">"Joining ReConnect & Rise transformed how I handle my utility expenses. The speed is unmatched."</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { 
                                name: "Chidi Okafor", 
                                role: "Retail Merchant", 
                                text: "The API integration was seamless. My retail shop now handles over 200 recharges daily without a single failure.",
                                img: "CO"
                            },
                            { 
                                name: "Aisha Bello", 
                                role: "Corporate User", 
                                text: "I love the scheduled payments feature. My electricity bill is always paid on time, and the token arrives instantly.",
                                img: "AB"
                            },
                            { 
                                name: "Tunde Ednut", 
                                role: "Financial Analyst", 
                                text: "Security was my biggest concern, but their bank-grade encryption and 2FA give me total peace of mind.",
                                img: "TE"
                            }
                        ].map((user, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] bg-[#1A2235]/60 border border-white/10 hover:-translate-y-2 transition-all">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center font-black text-white text-sm">
                                        {user.img}
                                    </div>
                                    <div>
                                        <div className="font-black text-white">{user.name}</div>
                                        <div className="text-[10px] font-black uppercase text-[#3B82F6] tracking-widest">{user.role}</div>
                                    </div>
                                </div>
                                <p className="text-white/60 leading-relaxed italic font-serif">"{user.text}"</p>
                                <div className="flex gap-1 mt-6">
                                    {[1, 2, 3, 4, 5].map(star => <Zap key={star} size={12} className="text-yellow-400 fill-yellow-400" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- App Download CTA --- */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto rounded-[2.5rem] sm:rounded-[4rem] bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] p-8 sm:p-12 md:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 sm:gap-16 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="space-y-6 sm:space-y-8 relative z-10 text-center lg:text-left">
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-serif leading-tight">Ready to Rise? <br className="hidden sm:block" /> Download the App.</h2>
                        <p className="text-white/80 text-lg sm:text-xl max-w-xl leading-relaxed">Take your VTU business anywhere. Available now for iOS and Android with exclusive mobile-only bonuses.</p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <button 
                                onClick={() => toast.success("Mobile App Coming Soon!", { icon: '🚀' })}
                                className="bg-black text-white px-8 py-4 rounded-2xl flex items-center gap-4 hover:scale-105 transition-all shadow-xl"
                            >
                                <Smartphone size={24} />
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-black opacity-50 tracking-widest">Get it on</div>
                                    <div className="text-lg font-black leading-none">Google Play</div>
                                </div>
                            </button>
                            <button 
                                onClick={() => toast.success("Mobile App Coming Soon!", { icon: '🚀' })}
                                className="bg-white text-black px-8 py-4 rounded-2xl flex items-center gap-4 hover:scale-105 transition-all shadow-xl"
                            >
                                <ShieldCheck size={24} />
                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-black opacity-50 tracking-widest">Download on</div>
                                    <div className="text-lg font-black leading-none">App Store</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="relative z-10 hidden lg:block">
                        <div className="w-64 h-[500px] bg-[#0B1221] rounded-[3rem] border-[8px] border-black shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl"></div>
                            <div className="p-4 pt-12 space-y-4">
                                <div className="w-full h-8 bg-white/5 rounded-lg animate-pulse"></div>
                                <div className="w-3/4 h-8 bg-white/5 rounded-lg animate-pulse"></div>
                                <div className="grid grid-cols-2 gap-4 pt-8">
                                    <div className="aspect-square bg-[#3B82F6]/20 rounded-xl animate-pulse"></div>
                                    <div className="aspect-square bg-white/5 rounded-xl animate-pulse"></div>
                                    <div className="aspect-square bg-white/5 rounded-xl animate-pulse"></div>
                                    <div className="aspect-square bg-[#F5A623]/20 rounded-xl animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Mock Pricing / Data Plans --- */}
            <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black font-serif mb-2">Popular Bundles</h2>
                            <p className="text-white/40 font-medium">Get the most value for your money with our top-selling plans.</p>
                        </div>
                        <button 
                            onClick={() => setShowAllPlans(!showAllPlans)}
                            className="hidden sm:flex items-center gap-2 text-[#3B82F6] font-black text-sm uppercase tracking-widest hover:underline"
                        >
                            {showAllPlans ? 'Hide All Plans' : 'View All Plans'} <ChevronRight size={16} className={showAllPlans ? 'rotate-90' : ''} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(showAllPlans ? [
                            { network: 'MTN', data: '1GB', price: '300', duration: '30 Days', desc: 'MTN SME Data - High speed and reliable.' },
                            { network: 'Airtel', data: '2.5GB', price: '600', duration: '30 Days', desc: 'Airtel Corporate - Best for streaming.' },
                            { network: 'Glo', data: '5GB', price: '1,200', duration: '30 Days', desc: 'Glo Gifting - Maximum data for less.' },
                            { network: '9mobile', data: '1.5GB', price: '500', duration: '30 Days', desc: '9mobile Special - Premium connectivity.' },
                            { network: 'MTN', data: '10GB', price: '2,500', duration: '30 Days', desc: 'MTN Monthly - For heavy users.' },
                            { network: 'Airtel', data: '5GB', price: '1,100', duration: '30 Days', desc: 'Airtel Weekly - Fast and flexible.' },
                            { network: 'Glo', data: '10GB', price: '2,000', duration: '30 Days', desc: 'Glo Mega - Never run out of data.' },
                            { network: '9mobile', data: '10GB', price: '3,000', duration: '30 Days', desc: '9mobile Pro - Uninterrupted speed.' }
                        ] : [
                            { network: 'MTN', data: '1GB', price: '300', duration: '30 Days', desc: 'MTN SME Data - High speed and reliable.' },
                            { network: 'Airtel', data: '2.5GB', price: '600', duration: '30 Days', desc: 'Airtel Corporate - Best for streaming.' },
                            { network: 'Glo', data: '5GB', price: '1,200', duration: '30 Days', desc: 'Glo Gifting - Maximum data for less.' },
                            { network: '9mobile', data: '1.5GB', price: '500', duration: '30 Days', desc: '9mobile Special - Premium connectivity.' }
                        ]).map((plan, i) => (
                            <div 
                                key={i} 
                                onClick={() => setFocusedPlan(focusedPlan === i ? null : i)}
                                className="p-8 rounded-3xl bg-[#1A2235]/60 border border-white/10 hover:border-[#3B82F6]/50 transition-all group relative overflow-hidden cursor-pointer h-[240px] flex flex-col justify-between"
                            >
                                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-[#3B82F6] rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                
                                {focusedPlan === i ? (
                                    <div className="animate-in fade-in zoom-in duration-300 h-full flex flex-col justify-center text-center">
                                        <p className="text-white/80 text-sm font-medium leading-relaxed">{plan.desc}</p>
                                        <p className="text-[#3B82F6] text-[10px] font-black uppercase mt-4 tracking-widest">Click to dismiss</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3B82F6] mb-4">{plan.network} SPECIAL</div>
                                            <div className="text-4xl font-black mb-2">{plan.data}</div>
                                            <div className="text-white/40 text-xs mb-8">{plan.duration}</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-black">₦{plan.price}</div>
                                            <button className="p-3 rounded-2xl bg-white/5 text-white group-hover:bg-[#3B82F6] transition-all">
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Contact Us Section --- */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 text-[#FCD34D] font-black text-[10px] uppercase tracking-widest">
                            <ShieldCheck size={16} /> Support Center
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black font-serif">Get in <span className="text-[#3B82F6]">Touch</span>.</h2>
                        <p className="text-white/40 text-lg leading-relaxed max-w-md">Have questions about our API or Merchant partnership? Our team is ready to help you rise.</p>
                        
                        <div className="space-y-6 pt-8">
                            <div className="flex items-center gap-6 group cursor-pointer" onClick={() => setActiveFooterLink('support')}>
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Phone Support</div>
                                    <div className="text-xl font-black">+234 9160048633</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 group cursor-pointer" onClick={() => setActiveFooterLink('support')}>
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Email Inquiry</div>
                                    <div className="text-xl font-black">risereconnect@gmail.com</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1A2235]/60 backdrop-blur-3xl p-10 md:p-16 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6] rounded-full blur-[80px] opacity-10"></div>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#3B82F6] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Email</label>
                                    <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#3B82F6] transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Subject</label>
                                <select className="w-full px-6 py-4 rounded-2xl bg-[#0B1221] border border-white/10 text-white outline-none focus:border-[#3B82F6] transition-all">
                                    <option>General Inquiry</option>
                                    <option>Merchant Partnership</option>
                                    <option>Technical API Support</option>
                                    <option>Transaction Issue</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Message</label>
                                <textarea rows="4" placeholder="How can we help you?" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#3B82F6] transition-all resize-none"></textarea>
                            </div>
                            <button className="w-full py-5 rounded-2xl bg-[#3B82F6] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[#3B82F6]/20 hover:bg-[#2563EB] transition-all active:scale-95">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-20 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 p-1">
                                <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-black font-serif">{brand.orgName}</span>
                        </div>
                        <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em]">{brand.orgSlogan}</p>
                    </div>

                    <div className="flex gap-12 text-center md:text-left">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Company</h4>
                            <ul className="space-y-2 text-sm text-white/60 font-medium">
                                <li onClick={() => setActiveFooterLink('about')} className="hover:text-white transition-colors cursor-pointer">About Us</li>
                                <li onClick={() => setActiveFooterLink('terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Help</h4>
                            <ul className="space-y-2 text-sm text-white/60 font-medium">
                                <li onClick={() => setActiveFooterLink('support')} className="hover:text-white transition-colors cursor-pointer">Contact Support</li>
                                <li onClick={() => setActiveFooterLink('api')} className="hover:text-white transition-colors cursor-pointer">API Documentation</li>
                                <li onClick={() => setActiveFooterLink('help')} className="hover:text-white transition-colors cursor-pointer">Help Center</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} {brand.orgName} VTU. All Rights Reserved.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Support: risereconnect@gmail.com</span>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">+234 9160048633</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
