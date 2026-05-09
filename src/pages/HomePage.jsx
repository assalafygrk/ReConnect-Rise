import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  MessageSquare, 
  Globe, 
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Target,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function HomePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Join a network of like-minded individuals focused on collective growth and mutual support."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Secure & Transparent",
      description: "Enterprise-grade security ensuring your data and financial contributions are always protected."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Processing",
      description: "Fast disbursements and real-time wallet updates for a seamless experience."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Growth Focused",
      description: "Tools and resources designed to help members achieve their personal and professional goals."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Active Dialogue",
      description: "Engage in meaningful conversations through our integrated chat and advice rooms."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Connecting communities across boundaries to create a larger impact together."
    }
  ];

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0B1221] transition-colors duration-500 overflow-x-hidden selection:bg-accent selection:text-white">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/80 dark:bg-[#0B1221]/80 backdrop-blur-xl py-3 border-navy/5 dark:border-white/5 shadow-lg' 
            : 'bg-transparent py-6 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-gold flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
              <Zap className="text-white w-6 h-6" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-navy dark:text-white font-heading">
              ReConnect <span className="text-accent">&</span> Rise
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-navy/70 dark:text-white/70 hover:text-accent dark:hover:text-gold transition-colors font-medium">Features</a>
            <Link to="/about" className="text-navy/70 dark:text-white/70 hover:text-accent dark:hover:text-gold transition-colors font-medium">About</Link>
            <a href="#community" className="text-navy/70 dark:text-white/70 hover:text-accent dark:hover:text-gold transition-colors font-medium">Community</a>
            {user ? (
              <Link 
                to="/dashboard" 
                className="bg-navy dark:bg-white text-white dark:text-navy px-6 py-2.5 rounded-full font-semibold hover:bg-accent dark:hover:bg-gold hover:text-white dark:hover:text-navy transition-all shadow-md active:scale-95"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-navy dark:text-white font-semibold hover:text-accent transition-colors">Log In</Link>
                <Link 
                  to="/register" 
                  className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold hover:bg-accent/90 transition-all shadow-md hover:shadow-accent/20 active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-navy dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0B1221] border-b border-navy/5 dark:border-white/5 py-6 px-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col gap-6 items-center">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Features</a>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">About</Link>
              <a href="#community" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium">Community</a>
              {user ? (
                <Link to="/dashboard" className="w-full text-center bg-navy dark:bg-white text-white dark:text-navy py-3 rounded-xl font-bold">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-xl font-semibold">Log In</Link>
                  <Link to="/register" className="w-full text-center bg-accent text-white py-3 rounded-xl font-bold">Join Now</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-accent/10 dark:bg-accent/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-gold/10 dark:bg-gold/5 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/10 dark:bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-bold mb-6 animate-fade-in">
                <Award size={16} />
                <span>Empowering Over 5,000+ Members</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold font-heading text-navy dark:text-white leading-[1.1] mb-8">
                Reconnect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-gold">Your Purpose</span>, Rise Together.
              </h1>
              <p className="text-lg lg:text-xl text-navy/60 dark:text-white/60 mb-10 max-w-2xl mx-auto lg:mx-0">
                A unified platform for community growth, secure financial empowerment, and professional networking. Build your future with a community that cares.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto bg-navy dark:bg-white text-white dark:text-navy px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 group hover:bg-accent dark:hover:bg-gold hover:text-white dark:hover:text-navy transition-all shadow-xl hover:-translate-y-1"
                >
                  Get Started Today
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg border-2 border-navy/10 dark:border-white/10 hover:border-accent dark:hover:border-gold transition-all flex items-center justify-center gap-2"
                >
                  Member Login
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap justify-center lg:justify-start items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={24} />
                  <span className="font-bold">Secure SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={24} />
                  <span className="font-bold">Verified Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={24} />
                  <span className="font-bold">Result Driven</span>
                </div>
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-gold/20 rounded-3xl blur-3xl -rotate-6 scale-95"></div>
              <img 
                src="/hero.png" 
                alt="Community Unity" 
                className="relative z-10 w-full rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 object-cover"
              />
              
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white dark:bg-navy-light p-4 rounded-2xl shadow-xl border border-navy/5 dark:border-white/5 animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-navy/50 dark:text-white/50">Total Contributions</p>
                    <p className="text-lg font-bold text-navy dark:text-white">$1,240,500</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 z-20 bg-white dark:bg-navy-light p-4 rounded-2xl shadow-xl border border-navy/5 dark:border-white/5 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-navy/50 dark:text-white/50">Active Members</p>
                    <p className="text-lg font-bold text-navy dark:text-white">5,842</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-navy dark:bg-navy-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src="/pattern.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { label: "Active Members", value: "5,800+" },
              { label: "Total Distributed", value: "$4.2M" },
              { label: "Community Projects", value: "150+" },
              { label: "Countries Served", value: "12+" }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl lg:text-5xl font-bold text-accent mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-white/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-accent font-bold tracking-widest uppercase text-sm mb-4">Core Ecosystem</h2>
            <h3 className="text-4xl lg:text-5xl font-bold font-heading text-navy dark:text-white mb-6">Built for Modern Communities</h3>
            <p className="text-navy/60 dark:text-white/60 max-w-2xl mx-auto">
              Everything you need to manage, grow, and empower your community in one secure and intuitive dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl hover:border-accent/30 transition-all group hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-navy dark:text-white mb-4">{feature.title}</h4>
                <p className="text-navy/60 dark:text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Feature Section */}
      <section className="py-24 bg-navy-light/5 dark:bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-3xl"></div>
                <img 
                  src="/features.png" 
                  alt="Secure Transactions" 
                  className="relative z-10 w-full rounded-3xl shadow-2xl border border-navy/5 dark:border-white/5"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-bold font-heading text-navy dark:text-white mb-8">
                Financial Empowerment, <span className="text-accent">Redefined.</span>
              </h2>
              <div className="space-y-8">
                {[
                  {
                    title: "Automated Wallet Systems",
                    desc: "Manage your contributions and withdrawals with our secure automated system. No manual intervention required."
                  },
                  {
                    title: "Democratic Governance",
                    desc: "Every member has a voice. Participate in community decisions through our transparent voting modules."
                  },
                  {
                    title: "Peer-to-Peer Support",
                    desc: "Request welfare or apply for loans directly from the community fund with fair, member-approved terms."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-navy dark:text-white mb-2">{item.title}</h5>
                      <p className="text-navy/60 dark:text-white/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 text-accent font-bold hover:gap-4 transition-all"
                >
                  Explore Financial Modules <ChevronRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Community CTA */}
      <section id="community" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none">
          <img src="/pattern.png" alt="" className="w-full h-full object-cover scale-150 rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="bg-navy dark:bg-navy-dark rounded-[40px] p-8 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
            
            <h2 className="text-4xl lg:text-6xl font-bold font-heading text-white mb-8">Ready to Rise with Us?</h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Join thousands of professionals and community leaders who are already leveraging ReConnect & Rise to transform their future.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-accent text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gold transition-all shadow-xl hover:-translate-y-1"
              >
                Create Free Account
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-bold text-xl backdrop-blur-md transition-all border border-white/20"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#050912] pt-20 pb-10 border-t border-navy/5 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Zap className="text-white w-5 h-5" fill="currentColor" />
                </div>
                <span className="text-xl font-bold text-navy dark:text-white font-heading">
                  ReConnect <span className="text-accent">&</span> Rise
                </span>
              </div>
              <p className="text-navy/60 dark:text-white/60 mb-8 leading-relaxed">
                A secure digital ecosystem designed to foster community growth, provide transparent financial support, and empower members through collective governance.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: <Globe size={18} />, label: 'Website' },
                  { icon: <Users size={18} />, label: 'Community' },
                  { icon: <ShieldCheck size={18} />, label: 'Security' }
                ].map((social, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-navy/5 dark:bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all" title={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-navy dark:text-white mb-6 uppercase tracking-wider text-xs">Core Modules</h5>
              <ul className="space-y-4">
                <li><Link to="/contributions" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">Monthly Contributions</Link></li>
                <li><Link to="/loans" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">Loan Applications</Link></li>
                <li><Link to="/welfare" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">Welfare Support</Link></li>
                <li><Link to="/votes" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">Governance Voting</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-navy dark:text-white mb-6 uppercase tracking-wider text-xs">Resources</h5>
              <ul className="space-y-4">
                <li><a href="#" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">Member Handbook</a></li>
                <li><Link to="/documentary" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">System Archives</Link></li>
                <li><Link to="/advice" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">Expert Advice Room</Link></li>
                <li><a href="#" className="text-navy/60 dark:text-white/60 hover:text-accent transition-colors">Security Protocols</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-navy dark:text-white mb-6 uppercase tracking-wider text-xs">Community Pulse</h5>
              <p className="text-navy/60 dark:text-white/60 mb-6 text-sm">Subscribe to receive monthly reports and governance updates.</p>
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-navy/5 dark:bg-white/5 border border-navy/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-sm"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-accent text-white px-4 rounded-lg hover:bg-accent/90 transition-colors">
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>

          <div className="pt-10 border-t border-navy/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-navy/40 dark:text-white/40 text-sm">
              &copy; {new Date().getFullYear()} ReConnect & Rise. Empowering Communities Worldwide.
            </p>
            <div className="flex gap-8 text-sm text-navy/40 dark:text-white/40">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms of Use</Link>
              <button className="hover:text-accent transition-colors">Cookie Settings</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
