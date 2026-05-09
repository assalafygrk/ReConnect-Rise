import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileText, CheckCircle2, Zap, ArrowLeft } from 'lucide-react';

export default function TermsOfUsePage() {
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
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Scale size={16} />
            <span>Membership Agreement</span>
          </div>
          <h1 className="text-5xl font-bold font-heading text-navy dark:text-white mb-6">Terms of Use</h1>
          <p className="text-navy/60 dark:text-white/60 text-lg">
            Guidelines for a prosperous and respectful community.
          </p>
        </div>

        <div className="space-y-12">
          <section className="glass-card p-8 rounded-[32px] border-navy/5 dark:border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-bold font-heading text-navy dark:text-white">1. Membership Eligibility</h2>
            </div>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed mb-4">
              By registering an account with ReConnect & Rise, you agree that:
            </p>
            <ul className="space-y-4">
              {[
                "You are at least 18 years of age.",
                "You have provided accurate and truthful identity information, including facial verification.",
                "You intend to participate in the community with respect and integrity.",
                "You will maintain only one active account on the platform."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-navy/60 dark:text-white/60">
                  <CheckCircle2 size={18} className="text-accent flex-shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-6">2. Financial Responsibilities</h2>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed mb-6">
              Membership in ReConnect & Rise involves collective financial growth. Members agree to adhere to the contribution schedules as defined by the community governance. Failure to meet contribution requirements may affect your eligibility for loans and welfare disbursements.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-navy/5 dark:border-white/5">
                <h4 className="font-bold mb-2">Contributions</h4>
                <p className="text-sm text-navy/50 dark:text-white/50">Must be made on time through the secure portal wallet.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-navy/5 dark:border-white/5">
                <h4 className="font-bold mb-2">Disbursements</h4>
                <p className="text-sm text-navy/50 dark:text-white/50">Distributed according to community-approved logic and welfare rules.</p>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 rounded-[32px] border-navy/5 dark:border-white/5">
            <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-6">3. Community Conduct</h2>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed">
              We maintain a zero-tolerance policy for harassment, fraudulent activity, or any behavior that undermines the trust of the community. Engagement in the Chat and Advice rooms must remain professional and constructive.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-6">4. Governance & Voting</h2>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed mb-6">
              Every member has the right to vote on community initiatives. By using the platform, you agree to accept the results of democratic votes conducted through our secure Voting Nexus.
            </p>
          </section>

          <section className="glass-card p-8 rounded-[32px] border-navy/5 dark:border-white/5">
            <h2 className="text-2xl font-bold font-heading text-navy dark:text-white mb-6">5. Limitation of Liability</h2>
            <p className="text-navy/60 dark:text-white/60 leading-relaxed">
              ReConnect & Rise is a community-driven platform. While we provide secure technology, the organization and its administrators are not liable for individual financial decisions or community-voted outcomes.
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-10 border-t border-navy/5 dark:border-white/5 text-center text-navy/40 dark:text-white/40 text-sm">
          &copy; {new Date().getFullYear()} ReConnect & Rise. By using this portal, you agree to these terms.
        </footer>
      </main>
    </div>
  );
}
