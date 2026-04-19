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
                    <div className="flex items-center gap-2 pt-4 px-5 z-10 w-full relative">
                        <div className="w-10 h-10 overflow-hidden rounded-sm flex items-center justify-center bg-[#1A1A2E] shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                            <img src={brand.logoUrl} alt={brand.orgName} className="w-full h-full object-contain" />
                        </div>
                        <div className="mt-1">
                            <h2 className="font-bold text-sm text-gray-900 leading-tight tracking-tight uppercase">{brand.orgName}</h2>
                            <p className="text-[8px] text-gray-500 uppercase tracking-wider">{brand.orgSlogan}</p>
                        </div>
                    </div>

                    <div className="flex px-5 pt-3 h-full z-10 w-full relative">
                        {/* Left: Photo */}
                        <div className="w-[35%] flex flex-col justify-start relative">
                            <div className="w-24 h-24 rounded-full border-[5px] border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center mt-2 z-20">
                                {member?.photo ? (
                                    <img src={member.photo} alt="Member Face" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-gray-400 font-medium">No Image</span>
                                )}
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col justify-start flex-1 pt-1 ml-2">
                            <h3 className="font-bold text-gray-900 text-lg leading-[1.1] uppercase tracking-wide truncate max-w-full overflow-hidden">{memberName}</h3>
                            <p className="text-[10px] text-gray-600 uppercase mb-3 font-medium">{memberRole}</p>

                            <table className="text-[8.5px] text-gray-600 font-medium w-full relative z-20">
                                <tbody>
                                    <tr className="align-top"><td className="w-10 py-[1px]">Dept</td><td className="text-gray-900"><span className="mr-1">:</span>{cardConfig.departmentLabel || 'Member'}</td></tr>
                                    <tr className="align-top"><td className="py-[1px]">Email</td><td className="text-gray-900"><span className="mr-1">:</span>{memberEmail}</td></tr>
                                    <tr className="align-top"><td className="py-[1px]">Phone</td><td className="text-gray-900"><span className="mr-1">:</span>{memberPhone}</td></tr>
                                    <tr className="align-top"><td className="py-[1px]">ID no</td><td className="text-gray-900"><span className="mr-1">:</span>{memberId}</td></tr>
                                </tbody>
                            </table>

                            {cardConfig.showQrCode !== false && (
                                <div className="absolute right-4 bottom-5 bg-white border-2 border-gray-100 p-1 rounded-sm shadow-sm z-10">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="QR Code" width="40" height="40" className="object-contain" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-200 animate-pulse"></div>
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
                    <div className="flex justify-between pt-8 px-6 z-10 w-full h-full relative">
                        {/* Back card: Company name from brand */}
                        <div className="w-[45%] flex flex-col items-center pt-2">
                            <h2 className="font-bold text-[13px] text-gray-900 leading-tight whitespace-nowrap mb-1">{brand.orgName.toUpperCase()}</h2>
                            <p className="text-[7px] text-gray-500 uppercase tracking-widest mb-6 font-medium">{brand.orgSlogan}</p>

                            <div className="w-10 h-10 overflow-hidden rounded-sm flex items-center justify-center bg-[#1A1A2E] shrink-0" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                                <img src={brand.logoUrl} alt={brand.orgName} className="w-full h-full object-contain" />
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="w-[55%] pl-4 flex flex-col">
                            <h3 className="font-bold text-[11px] text-gray-900 uppercase mb-3 text-center">Term &amp; Condition</h3>
                            <ul className="text-[8px] text-gray-500 space-y-[6px] list-disc pl-3">
                                <li>{cardConfig.termsLine1}</li>
                                <li>{cardConfig.termsLine2}</li>
                                <li>{cardConfig.termsLine3}</li>
                                <li>{cardConfig.termsLine4}</li>
                            </ul>

                            <div className="mt-auto absolute bottom-5 right-6 text-right">
                                <p className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">VALID THRU : {expireMonthYearStr}</p>
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
