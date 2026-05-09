import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Zap, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0B1221] transition-colors duration-500 selection:bg-accent selection:text-white">
      {/* Simple Header */}
      <nav className="sticky top-0 z-[1000] bg-white/80 dark:bg-[#0B1221]/80 backdrop-blur-xl py-4 border-b border-navy/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="text-accent w-6 h-6" fill="currentColor" />
            <span className="text-xl font-bold text-navy dark:text-white font-heading">ReConnect & Rise</span>
          </Link>
          <Link to="/" className="text-sm font-bold flex items-center gap-2 text-navy/60 dark:text-white/60 hover:text-accent transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <ShieldCheck size={16} />
            <span>Last Updated: May 2026</span>
          </div>
          <h1 className="text-5xl font-bold font-heading text-navy dark:text-white mb-6">Privacy Policy</h1>
          <p className="text-navy/60 dark:text-white/60 text-lg">
            Your privacy and security are the foundation of our community.
          </p>
        </div>

        <div className="space-y-12">
          <section className="glass-card p-8 rounded-[32px] border-navy/5 dark:border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">1. Data Collection</h2>
            </div>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed mb-4">
              We collect information that you provide directly to us when you register for an account, participate in community governance, or use our financial modules. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-navy/60 dark:text-white/60 ml-4">
              <li>Identity Information: Name, email address, and facial data for identity verification.</li>
              <li>Financial Information: Transaction history, wallet balances, and contribution records.</li>
              <li>Communication Data: Messages sent within our community chat and advice rooms.</li>
              <li>Technical Data: IP addresses, browser types, and usage patterns for security monitoring.</li>
            </ul>
          </section>

          <section className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Eye size={24} />
              </div>
              <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">2. How We Use Your Data</h2>
            </div>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed">
              ReConnect & Rise uses the collected data solely for the operation and security of the platform. We do not sell or share your data with third-party advertisers. Your information is used to:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-navy/5 dark:border-white/5">
                <h4 className="font-bold mb-2">Platform Security</h4>
                <p className="text-sm text-navy/50 dark:text-white/50">Facial verification and 2FA ensure that only you can access your digital vault.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-navy/5 dark:border-white/5">
                <h4 className="font-bold mb-2">Governance</h4>
                <p className="text-sm text-navy/50 dark:text-white/50">Verifying membership status for voting eligibility in community decisions.</p>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 rounded-[32px] border-navy/5 dark:border-white/5">
            <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-6">3. Data Security</h2>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed">
              We implement enterprise-grade security measures, including end-to-end encryption for all financial transactions and secure storage for identity data. Our systems are regularly audited to ensure compliance with the highest security standards.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-6">4. Your Rights</h2>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed mb-6">
              You have the right to access, correct, or request the deletion of your personal data at any time through your profile settings or by contacting the system administration.
            </p>
            <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 text-accent font-medium text-sm italic">
              "We believe privacy is a fundamental human right, especially within a growing community."
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-10 border-t border-navy/5 dark:border-white/5 text-center">
          <p className="text-navy/40 dark:text-white/40 text-sm">
            Questions about our privacy protocols? Contact our <Link to="/advice" className="text-accent hover:underline">Security Team</Link>.
          </p>
        </footer>
      </main>
    </div>
  );
}
