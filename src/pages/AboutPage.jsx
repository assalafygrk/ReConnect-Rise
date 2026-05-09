import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Target, 
  Eye, 
  ShieldCheck, 
  Users, 
  Zap, 
  ArrowRight,
  ChevronRight,
  Globe,
  Award,
  BarChart3
} from 'lucide-react';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0B1221] transition-colors duration-500 overflow-x-hidden selection:bg-accent selection:text-white">
      {/* Navigation - Simple version for subpages */}
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 dark:bg-[#0B1221]/80 backdrop-blur-xl py-4 border-b border-navy/5 dark:border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-gold flex items-center justify-center">
              <Zap className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-navy dark:text-white font-heading">
              ReConnect <span className="text-accent">&</span> Rise
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-navy/70 dark:text-white/70 hover:text-accent transition-colors font-medium text-sm">Home</Link>
            <Link to="/login" className="bg-navy dark:bg-white text-white dark:text-navy px-5 py-2 rounded-full font-semibold text-sm hover:bg-accent transition-all">Portal Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-accent/10 dark:bg-accent/5 rounded-full blur-[120px] animate-blob"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 dark:bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Heart size={16} />
                <span>Our Story & Legacy</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold font-heading text-navy dark:text-white leading-[1.1] mb-8">
                Empowering Communities to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-gold">Rise Together.</span>
              </h1>
              <p className="text-xl text-navy/60 dark:text-white/60 mb-10 leading-relaxed">
                ReConnect & Rise was founded on the belief that community strength is the ultimate driver of personal and financial success. We provide the digital infrastructure to turn collective potential into real-world impact.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-navy-light shadow-md border border-navy/5 dark:border-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-navy/40 dark:text-white/40">Founded</p>
                    <p className="font-bold">2022</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-navy-light shadow-md border border-navy/5 dark:border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-navy/40 dark:text-white/40">Active in</p>
                    <p className="font-bold">12+ Countries</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-gold/20 rounded-3xl blur-3xl"></div>
              <img 
                src="/about-hero.png" 
                alt="Community Unity" 
                className="relative z-10 w-full rounded-3xl shadow-2xl border border-white/20 dark:border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-navy dark:bg-navy-dark text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24">
            {/* Mission */}
            <div className="space-y-8 group">
              <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
                <img src="/mission.png" alt="Mission" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target size={64} className="text-accent opacity-50" />
                </div>
              </div>
              <h2 className="text-4xl font-bold font-heading">Our Mission</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                To cultivate an inclusive ecosystem where individuals can reconnect with their professional purpose and rise through collective financial empowerment, transparent governance, and mutual support.
              </p>
              <ul className="space-y-4">
                {[
                  "Fostering transparent financial contributions.",
                  "Enabling democratic community decision making.",
                  "Providing rapid support through welfare modules.",
                  "Empowering members through expert-led advice."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                      <ChevronRight size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vision */}
            <div className="space-y-8 group">
              <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
                <img src="/vision.png" alt="Vision" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye size={64} className="text-gold opacity-50" />
                </div>
              </div>
              <h2 className="text-4xl font-bold font-heading">Our Vision</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                To become the global standard for decentralized community management, where technology serves as a bridge for human connection and economic resilience.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <BarChart3 className="text-accent mb-4" />
                  <h4 className="font-bold mb-2">Scalability</h4>
                  <p className="text-sm text-white/50">Growing from local hubs to a global network.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <ShieldCheck className="text-gold mb-4" />
                  <h4 className="font-bold mb-2">Trust</h4>
                  <p className="text-sm text-white/50">Immutable records and secure transactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-accent font-bold tracking-widest uppercase text-sm mb-4">Foundation</h2>
            <h3 className="text-4xl lg:text-5xl font-bold font-heading text-navy dark:text-white">Our Core Values</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Transparency",
                desc: "Every contribution and disbursement is recorded and visible to the community."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Inclusivity",
                desc: "A diverse community where every voice is heard through democratic voting."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Efficiency",
                desc: "Automated systems that remove bureaucracy and speed up support."
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Compassion",
                desc: "Welfare and support modules designed for the well-being of every member."
              }
            ].map((value, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl text-center group hover:border-accent transition-all">
                <div className="w-16 h-16 rounded-2xl bg-navy/5 dark:bg-white/5 text-navy dark:text-white flex items-center justify-center mx-auto mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold text-navy dark:text-white mb-4">{value.title}</h4>
                <p className="text-navy/60 dark:text-white/60 text-sm leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-24 bg-navy-light/5 dark:bg-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-accent/10 to-gold/10 rounded-[40px] p-12 lg:p-20 relative border border-white/20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold font-heading text-navy dark:text-white mb-6">Join the Movement</h2>
                <p className="text-lg text-navy/60 dark:text-white/60 mb-8">
                  ReConnect & Rise is more than a platform—it's a community of dreamers and achievers. Be part of the first generation that rises together.
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 bg-navy dark:bg-white text-white dark:text-navy px-8 py-4 rounded-2xl font-bold hover:bg-accent hover:text-white transition-all shadow-xl group">
                  Become a Member Today
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full bg-bg dark:bg-[#0B1221] flex items-center justify-center overflow-hidden">
                     <Users size={80} className="text-accent/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-navy/5 dark:border-white/5 text-center">
        <p className="text-navy/40 dark:text-white/40 text-sm">
          &copy; {new Date().getFullYear()} ReConnect & Rise. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
