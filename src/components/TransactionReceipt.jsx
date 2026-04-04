import { forwardRef } from 'react';
import dayjs from 'dayjs';

const TransactionReceipt = forwardRef(({ data, type }, ref) => {
    if (!data) return null;

    const isLoan = type === 'loan';
    const amount = Number(data.amount || 0);

    return (
        <div ref={ref} className="p-10 bg-white text-black font-serif max-w-[800px] mx-auto min-h-[500px] flex flex-col border-[12px] border-[#1A1A2E]">
            {/* Header */}
            <div className="text-center border-b-2 border-[#E8820C] pb-6 mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-black/5">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#1A1A2E]">Reconnect & Rise</h1>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#E8820C] uppercase italic">Official Financial Document</p>
                    </div>
                </div>
                <p className="text-xs text-black/50 mt-1 uppercase tracking-widest">Brotherhood Unity • Growth • Support</p>
            </div>

            {/* Receipt Title */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-4xl font-black text-[#1A1A2E] leading-none mb-1">
                        {isLoan ? 'LOAN RECEIPT' : 'DISBURSEMENT'}
                    </h2>
                    <p className="text-sm font-bold text-[#E8820C]">REF #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Date Issued</p>
                    <p className="text-lg font-bold">{dayjs().format('DD MMMM YYYY')}</p>
                </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 space-y-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    <div className="border-b border-black/10 pb-2">
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] mb-1">Beneficiary Name</p>
                        <p className="text-xl font-bold">{data.member || data.name || 'Brother Member'}</p>
                    </div>
                    <div className="border-b border-black/10 pb-2 text-right">
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] mb-1">Amount (NGN)</p>
                        <p className="text-2xl font-black text-[#1A1A2E]">₦{amount.toLocaleString()}</p>
                    </div>
                    <div className="border-b border-black/10 pb-2">
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] mb-1">Transaction Type</p>
                        <p className="text-lg font-bold uppercase">{isLoan ? 'Interest-Free Loan' : 'Welfare Support'}</p>
                    </div>
                    <div className="border-b border-black/10 pb-2 text-right">
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] mb-1">Date of Transaction</p>
                        <p className="text-lg font-bold">{dayjs(data.disbursedDate || data.date).format('DD MMM YYYY')}</p>
                    </div>
                </div>

                <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-black/5">
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.15em] mb-2">Description / Notes</p>
                    <p className="text-sm italic leading-relaxed text-black/70">
                        {isLoan
                            ? `This interest-free loan of ${amount.toLocaleString()} Naira is granted to the above-named member under the brotherhood terms of Reconnect & Rise. Repayment is expected as per the group's agreed schedule.`
                            : (data.reason || `Brotherhood support disbursed for approved welfare needs.`)}
                    </p>
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-16 grid grid-cols-2 gap-20">
                <div className="text-center">
                    <div className="h-px bg-black/20 mb-2"></div>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Treasurer Signature</p>
                </div>
                <div className="text-center">
                    <div className="h-px bg-black/20 mb-2"></div>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Beneficiary Signature</p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-black/5 text-center">
                <p className="text-[10px] text-black/30 uppercase tracking-[0.2em] font-medium">
                    Reconnect & Rise © {new Date().getFullYear()} — Strengthening the Brotherhood
                </p>
            </div>
        </div>
    );
});

TransactionReceipt.displayName = 'TransactionReceipt';
export default TransactionReceipt;
