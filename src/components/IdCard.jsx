import React, { useRef, useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useBrand } from '../context/BrandContext';
import { usePageConfig } from '../context/PageConfigContext';

export default function IdCard({ member, className = "" }) {
    const cardRef = useRef(null);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const { brand } = useBrand();
    const { config: cardConfig } = usePageConfig('id_card');

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `${(member?.name || 'Member').replace(/\s+/g, '_')}_ID_Card.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to download image', error);
            alert('Failed to generate image download. Ensure html-to-image is installed via: npm install html-to-image');
        }
    };

    // Calculate expiry 1 year from now safely
    const getExpireString = () => {
        try {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            const rawMonth = (d.getMonth() + 1).toString();
            const monthStr = rawMonth.length === 1 ? '0' + rawMonth : rawMonth;
            const yearStr = d.getFullYear().toString().slice(2);
            return `${monthStr}/${yearStr}`;
        } catch (e) {
            return '12/26';
        }
    };
    const expireMonthYearStr = getExpireString();

    const memberName = member?.name || "YOUR NAME";
    const memberRole = member?.occupation || member?.role || "Job Position";
    const memberEmail = member?.email || "your@mail.com";
    const memberPhone = member?.phone || "000 000 000";
    const memberId = member?.idNo || "0023415";

    useEffect(() => {
        // Safe external API method for QR code rendering to avoid library crashing
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(memberId ? 'ID:' + memberId : 'ReConnect&Rise')}`);
    }, [memberId]);

    return (
        <div className={`flex flex-col items-center gap-6 w-full mx-auto ${className}`}>
            <div ref={cardRef} className="flex flex-col md:flex-row gap-6 p-4 bg-white/50 rounded-xl">

                {/* FRONT COMPONENT */}
                <div className="w-[3.375in] h-[2.125in] bg-white rounded-lg shadow-xl relative overflow-hidden flex flex-col shrink-0 border border-gray-200" style={{ width: '380px', height: '240px' }}>
                    {/* Top Right Orange Shape */}
                    <div className="absolute top-0 right-0 w-32 h-16 bg-[#E8820C] rounded-bl-[40px] z-0"></div>

                    {/* Bottom Left Navy Shape */}
                    <div className="absolute bottom-0 left-0 w-48 h-16 bg-[#1A1A2E] rounded-tr-[40px] z-0"></div>

                    {/* Header: Logo and Company */}
                    <div className="flex items-center gap-2 pt-3 px-5 z-10 w-full relative">
                        <div className="w-9 h-9 overflow-hidden rounded-full flex items-center justify-center bg-white shadow-sm shrink-0 border border-black/5">
                            <img src={brand.logoUrl} alt={brand.orgName} className="w-[85%] h-[85%] object-contain" />
                        </div>
                        <div className="mt-1">
                            <h2 className="font-bold text-[12px] text-gray-900 leading-tight tracking-tight uppercase">{brand.orgName}</h2>
                            <p className="text-[7px] text-gray-500 uppercase tracking-wider font-medium">{brand.orgSlogan}</p>
                        </div>
                    </div>

                    <div className="flex px-5 pt-2 h-full z-10 w-full relative">
                        {/* Left: Photo */}
                        <div className="w-[30%] flex flex-col justify-start relative">
                            <div className="w-20 h-20 rounded-full border-[4px] border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center mt-1 z-20">
                                {member?.photo ? (
                                    <img src={member.photo} alt="Member Face" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[8px] text-gray-400 font-medium">No Image</span>
                                )}
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col justify-start flex-1 pt-1 ml-4 overflow-hidden">
                            <h3 className="font-bold text-gray-900 text-[15px] leading-[1.1] uppercase tracking-wide truncate">{memberName}</h3>
                            <p className="text-[9px] text-indigo-600 uppercase mb-2 font-bold tracking-wider">{memberRole}</p>

                            <table className="text-[8px] text-gray-600 font-medium w-full relative z-20">
                                <tbody>
                                    <tr className="align-top"><td className="w-10 py-[0.5px]">Dept</td><td className="text-gray-900 font-bold truncate max-w-[180px]"><span className="mr-1 text-gray-400">:</span>{cardConfig.departmentLabel || 'Official Member'}</td></tr>
                                    <tr className="align-top"><td className="py-[0.5px]">Email</td><td className="text-gray-900 font-bold truncate max-w-[180px]"><span className="mr-1 text-gray-400">:</span>{memberEmail}</td></tr>
                                    <tr className="align-top"><td className="py-[0.5px]">Phone</td><td className="text-gray-900 font-bold"><span className="mr-1 text-gray-400">:</span>{memberPhone}</td></tr>
                                    <tr className="align-top"><td className="py-[0.5px]">ID no</td><td className="text-gray-900 font-bold"><span className="mr-1 text-gray-400">:</span>{memberId}</td></tr>
                                </tbody>
                            </table>

                            {cardConfig.showQrCode !== false && (
                                <div className="absolute right-4 bottom-5 bg-white border border-gray-100 p-1 rounded-sm shadow-sm z-10">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="QR Code" width="36" height="36" className="object-contain" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-9 h-9 bg-gray-200 animate-pulse"></div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BACK COMPONENT */}
                <div className="w-[3.375in] h-[2.125in] bg-white rounded-lg shadow-xl relative overflow-hidden flex flex-col shrink-0 border border-gray-200" style={{ width: '380px', height: '240px' }}>
                    {/* Top Right Navy Shape */}
                    <div className="absolute top-0 right-0 w-40 h-20 bg-[#1A1A2E] rounded-bl-[50px] z-0"></div>

                    {/* Bottom Left Orange Shape */}
                    <div className="absolute bottom-0 left-0 w-32 h-16 bg-[#E8820C] rounded-tr-[40px] z-0"></div>

                    {/* Content */}
                    <div className="flex justify-between pt-6 px-6 z-10 w-full h-full relative">
                        {/* Back card: Company name from brand */}
                        <div className="w-[45%] flex flex-col items-center pt-2 overflow-hidden">
                            <h2 className="font-bold text-[11px] text-gray-900 leading-tight mb-1 text-center truncate w-full">{brand.orgName.toUpperCase()}</h2>
                            <p className="text-[6px] text-gray-500 uppercase tracking-[0.2em] mb-6 font-medium text-center line-clamp-2">{brand.orgSlogan}</p>

                            <div className="w-12 h-12 overflow-hidden rounded-full flex items-center justify-center bg-white shadow-md border border-gray-100 shrink-0">
                                <img src={brand.logoUrl} alt={brand.orgName} className="w-[80%] h-[80%] object-contain" />
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="w-[55%] pl-4 flex flex-col">
                            <h3 className="font-bold text-[10px] text-gray-900 uppercase mb-3 text-center border-b border-gray-100 pb-1">Rules & Guidelines</h3>
                            <ul className="text-[7.5px] text-gray-500 space-y-[4px] list-disc pl-3">
                                <li className="line-clamp-1">{cardConfig.termsLine1}</li>
                                <li className="line-clamp-1">{cardConfig.termsLine2}</li>
                                <li className="line-clamp-1">{cardConfig.termsLine3}</li>
                                <li className="line-clamp-1">{cardConfig.termsLine4}</li>
                            </ul>

                            <div className="mt-auto absolute bottom-5 right-6 text-right">
                                <p className="text-[9px] font-bold text-gray-800 tracking-wide uppercase">VALID THRU : {expireMonthYearStr}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <button
                onClick={handleDownload}
                className="flex items-center gap-2 py-2 px-6 rounded-full font-bold text-white transition-all bg-[#1A1A2E] hover:bg-[#E8820C] border border-[#E8820C]/30 shadow-lg"
            >
                <Download size={16} /> Download ID Card
            </button>
        </div>
    );
}
