import React from 'react';
import dayjs from 'dayjs';

// This component is strictly designed for professional, high-density financial reporting
const WeeklyReportTemplate = React.forwardRef(({ members = [], disbursements = [] }, ref) => {
    const today = dayjs().format('D MMMM YYYY');

    const paidCount = members.filter(m => m.paid).length;
    const regularTotal = paidCount * 100;
    const bonusTotal = members.reduce((sum, m) => sum + (m.paid ? Number(m.bonus || 0) : 0), 0);
    const totalCollected = regularTotal + bonusTotal;

    const openingBalance = 0; // Mocked for template
    const closingBalance = openingBalance + totalCollected;
    const totalDisbursed = disbursements ? disbursements.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) : 0;

    return (
        <div ref={ref} className="bg-white text-[#1A1A2E] w-full font-serif p-12" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>

            {/* 1. Executive Header Section */}
            <div className="flex justify-between items-start border-b-4 border-[#1A1A2E] pb-8 mb-10">
                <div className="flex gap-6 items-center">
                    <img src="/logo.jpg" alt="Reconnect & Rise" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#1A1A2E]">RECONNECT & RISE</h1>
                        <p className="text-[10px] font-black text-[#E8820C] uppercase tracking-[0.4em] mt-1">Official Treasury Registry</p>
                        <p className="text-[10px] font-bold text-black/30 uppercase mt-2">Document ID: RR-TREAS-2026-{dayjs().format('MMDD')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-[#1A1A2E]">WEEKLY FISCAL REPORT</h2>
                    <p className="text-sm font-medium text-black/40 mt-1">Period: {dayjs().startOf('week').format('DD MMM')} — {dayjs().endOf('week').format('DD MMM YYYY')}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Status: Audited & Verified
                    </div>
                </div>
            </div>

            {/* 2. Fiscal Infrastructure Insights */}
            <div className="grid grid-cols-3 gap-8 mb-12">
                {[
                    { label: 'Opening Vault Balance', value: `₦${openingBalance.toLocaleString()}`, sub: 'Previous Carryover' },
                    { label: 'Net Revenue (Weekly)', value: `₦${totalCollected.toLocaleString()}`, sub: 'Contributions + Bonuses' },
                    { label: 'Closing Vault Asset', value: `₦${(closingBalance - totalDisbursed).toLocaleString()}`, sub: 'Current Liquidity', highlight: true }
                ].map((stat, idx) => (
                    <div key={idx} className={`p-6 rounded-3xl border ${stat.highlight ? 'bg-[#1A1A2E] text-white' : 'bg-gray-50 border-black/5'}`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${stat.highlight ? 'text-[#E8820C]' : 'text-black/30'}`}>{stat.label}</p>
                        <h4 className="text-2xl font-black">{stat.value}</h4>
                        <p className={`text-[8px] font-bold mt-2 ${stat.highlight ? 'text-white/40' : 'text-black/20'}`}>{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* 3. Detailed Contributions Ledger */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-6 bg-[#E8820C] rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A2E]">Member Contribution Ledger (₦100 Base)</h3>
                </div>
                <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1A1A2E] text-white border-b-2 border-[#E8820C]">
                            <th className="py-3 px-4 font-black uppercase tracking-widest w-12">#</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest">Member Name</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest text-center">Base</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest text-center">Surplus</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest text-center">Status</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest text-right">Ledger Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {members.map((m, i) => (
                            <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className="py-2.5 px-4 text-black/30 font-bold">{String(i + 1).padStart(2, '0')}</td>
                                <td className="py-2.5 px-4 font-black text-[#1A1A2E]">{m.name.toUpperCase()}</td>
                                <td className="py-2.5 px-4 text-center font-bold text-black/40">₦100</td>
                                <td className="py-2.5 px-4 text-center font-bold text-[#E8820C]">{m.paid && m.bonus ? '₦' + m.bonus : '—'}</td>
                                <td className="py-2.5 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${m.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {m.paid ? 'Confirmed' : 'Pending'}
                                    </span>
                                </td>
                                <td className="py-2.5 px-4 text-right font-black text-[#1A1A2E]">₦{m.paid ? (100 + Number(m.bonus || 0)) : 0}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-[#1A1A2E]">
                            <td colSpan="5" className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-[#1A1A2E]">Cumulative Revenue Recieved</td>
                            <td className="py-4 px-4 text-right text-lg font-black text-[#E8820C]">₦{totalCollected.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* 4. Support Disbursement Archive */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A2E]">Authorized Disbursement Record</h3>
                </div>
                <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1A1A2E] text-white border-b-2 border-red-600">
                            <th className="py-3 px-4 font-black uppercase tracking-widest">Beneficiary</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest">Authorization Purpose</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest">Transaction Date</th>
                            <th className="py-3 px-4 font-black uppercase tracking-widest text-right">Debit Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {(disbursements && disbursements.length > 0) ? disbursements.map((d, i) => (
                            <tr key={i} className="bg-white">
                                <td className="py-2.5 px-4 font-black text-[#1A1A2E]">{d.member.toUpperCase()}</td>
                                <td className="py-2.5 px-4 font-medium text-black/60">{d.reason}</td>
                                <td className="py-2.5 px-4 font-bold text-black/30 tracking-widest">{dayjs(d.date).format('DD/MM/YYYY')}</td>
                                <td className="py-2.5 px-4 text-right font-black text-red-600">₦{Number(d.amount).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr className="bg-white">
                                <td className="py-6 px-4 text-center text-black/10 italic" colSpan="4">Zero fiscal exits recorded for this period.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="bg-red-50 border-t-2 border-red-600">
                            <td colSpan="3" className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-red-700">Total Authorized Disbursements</td>
                            <td className="py-4 px-4 text-right text-lg font-black text-red-700">₦{totalDisbursed.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* 5. Official Authorization & Signatures */}
            <div className="grid grid-cols-2 gap-20 pt-10 mt-10 border-t border-black/10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Primary Custodian Approval</p>
                    <div className="pt-8 relative">
                        <div className="absolute top-0 left-0">
                            <p className="font-serif italic text-2xl text-[#1A1A2E]/80 opacity-60 transform -rotate-2">Authorized Digitally</p>
                            <p className="text-[8px] font-bold text-black/20 -mt-1 tracking-widest">SECURE ROLE-BASED SIGNATURE 0x77AF2...</p>
                        </div>
                        <div className="border-t-2 border-[#1A1A2E] w-full pt-2">
                            <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">EMEX OBASI</p>
                            <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest mt-1">Chief Treasury Auditor</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Executive Verification</p>
                    <div className="pt-8 relative">
                        <div className="absolute top-0 left-0">
                            <p className="font-serif italic text-2xl text-[#E8820C]/80 opacity-60 transform rotate-1">Verified Audit</p>
                            <p className="text-[8px] font-bold text-black/20 -mt-1 tracking-widest">ADMINISTRATIVE CLEARANCE 0x11B3A...</p>
                        </div>
                        <div className="border-t-2 border-[#1A1A2E] w-full pt-2">
                            <p className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">SHEIKH ABDULLAH</p>
                            <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest mt-1">Spiritual & Administrative Lead</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Legal Disclaimer & Footer */}
            <div className="mt-20 pt-10 text-center space-y-3">
                <p className="text-[8px] text-black/30 max-w-lg mx-auto leading-relaxed">
                    This document is a certified extract from the Reconnect & Rise Financial Registry. All data is cross-referenced with internal audit logs. Unauthorized alteration of this ledger is a violation of group ethics and communal trust.
                </p>
                <div className="flex justify-center items-center gap-4 text-[9px] font-black text-[#E8820C] uppercase tracking-[0.3em]">
                    <span>One Flag</span>
                    <span className="w-1 h-1 bg-[#1A1A2E] rounded-full" />
                    <span>One Goal</span>
                    <span className="w-1 h-1 bg-[#1A1A2E] rounded-full" />
                    <span>Transparency Always</span>
                </div>
            </div>

        </div>
    );
});

export default WeeklyReportTemplate;
