import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    CheckCircle2
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

    return (
        <div className="min-h-screen bg-[#0B1221] text-white selection:bg-[#3B82F6]/30 selection:text-white">
            
            {/* --- Navbar --- */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-white/5">
                                <img src={brand.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xl font-black font-serif tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent hidden sm:block">
                                {brand.orgName}
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        <Link to="/mock-login" className="text-sm font-bold text-white/70 hover:text-white transition-colors">
                            Merchant Portal
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
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] font-serif tracking-tight">
                            Smart <span className="text-[#3B82F6]">Solutions</span> <br /> 
                            For Your Daily Needs.
                        </h1>
                        <p className="text-white/50 text-xl max-w-xl leading-relaxed font-serif">
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

            {/* --- Live Transactions Ticker --- */}
            <div className="bg-[#3B82F6]/5 border-y border-white/5 py-3 overflow-hidden whitespace-nowrap relative">
                <div className="flex animate-marquee gap-12 items-center">
                    {[
                        "MTN Airtime ₦2,000 sent to 0803***1234",
                        "Airtel Data 2.5GB sent to 0901***5678",
                        "Ikeja Electric ₦5,000 paid for 4501***9901",
                        "DSTV Premium renewed for 0123***4567",
                        "Glo Airtime ₦500 sent to 0705***8812",
                        "9mobile Data 1.5GB sent to 0809***4432"
                    ].map((text, i) => (
                        <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            {text}
                        </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {[
                        "MTN Airtime ₦2,000 sent to 0803***1234",
                        "Airtel Data 2.5GB sent to 0901***5678",
                        "Ikeja Electric ₦5,000 paid for 4501***9901",
                        "DSTV Premium renewed for 0123***4567",
                        "Glo Airtime ₦500 sent to 0705***8812",
                        "9mobile Data 1.5GB sent to 0809***4432"
                    ].map((text, i) => (
                        <div key={i + 10} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            {text}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Why Choose Us --- */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { 
                            icon: <Zap className="text-yellow-400" size={32} />, 
                            title: "Instant VTU", 
                            desc: "Automated delivery of airtime and data within 2 seconds of payment." 
                        },
                        { 
                            icon: <ShieldCheck className="text-green-400" size={32} />, 
                            title: "Safe & Secure", 
                            desc: "We use bank-grade encryption to protect your payments and personal data." 
                        },
                        { 
                            icon: <History className="text-[#3B82F6]" size={32} />, 
                            title: "Track History", 
                            desc: "Detailed logs of all your transactions for better personal financial management." 
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all">
                            <div className="mb-6">{feature.icon}</div>
                            <h3 className="text-2xl font-black mb-4 font-serif">{feature.title}</h3>
                            <p className="text-white/40 leading-relaxed text-sm">{feature.desc}</p>
                        </div>
                    ))}
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

            {/* --- Footer --- */}
            <footer className="py-20 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-12">
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
                                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Help</h4>
                            <ul className="space-y-2 text-sm text-white/60 font-medium">
                                <li className="hover:text-white transition-colors cursor-pointer">Contact Support</li>
                                <li className="hover:text-white transition-colors cursor-pointer">API Documentation</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} {brand.orgName} VTU. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
