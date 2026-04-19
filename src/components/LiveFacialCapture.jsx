import { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function LiveFacialCapture({ onCapture, onCancel }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photoDataUrl, setPhotoDataUrl] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Could not access camera. Please check permissions.');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setPhotoDataUrl(dataUrl);
        }
    };

    const retakePhoto = () => {
        setPhotoDataUrl(null);
    };

    const confirmPhoto = () => {
        stopCamera();
        if (onCapture) {
            onCapture(photoDataUrl);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm mb-4">
                    {error}
                </div>
            )}

            {!photoDataUrl ? (
                <>
                    <div className="relative w-full max-w-[300px] aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                        {!stream && !error && (
                            <div className="animate-pulse flex flex-col items-center text-white/50">
                                <Camera size={32} className="mb-2 opacity-50" />
                                <span className="text-xs uppercase tracking-widest font-bold">Initializing</span>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover mirror"
                            style={{ transform: 'scaleX(-1)' }}
                        ></video>

                        {/* Scanner overlay line */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#E8820C]/80 shadow-[0_0_8px_#F5A623] animate-scan z-10 pointer-events-none"></div>

                        {/* Framing guide */}
                        <div className="absolute inset-x-8 inset-y-12 border-2 border-white/20 rounded-full pointer-events-none border-dashed opacity-50"></div>
                    </div>

                    <div className="flex items-center gap-4 mt-6 w-full max-w-[300px]">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white/70 hover:text-white bg-white/5 border border-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={capturePhoto}
                            disabled={!stream}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-[#E8820C] to-[#F5A623] shadow-lg disabled:opacity-50"
                        >
                            <Camera size={18} /> Capture
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="relative w-full max-w-[300px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/20">
                        <img src={photoDataUrl} alt="Captured face" className="w-full h-full object-cover transform scale-x-[-1]" />
                    </div>

                    <div className="flex items-center gap-4 mt-6 w-full max-w-[300px]">
                        <button
                            type="button"
                            onClick={retakePhoto}
                            className="flex items-center justify-center gap-2 py-3 px-4 flex-1 rounded-xl font-bold text-white/70 hover:text-white bg-white/5 border border-white/10 transition-colors"
                        >
                            <RefreshCw size={18} /> Retake
                        </button>
                        <button
                            type="button"
                            onClick={confirmPhoto}
                            className="flex items-center justify-center gap-2 py-3 px-4 flex-1 rounded-xl font-bold text-[#E8820C] hover:text-[#F5A623] bg-[#E8820C]/10 border border-[#E8820C]/30 transition-colors"
                        >
                            <CheckCircle2 size={18} /> Keep
                        </button>
                    </div>
                </>
            )}

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden"></canvas>

            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </div>
    );
}

