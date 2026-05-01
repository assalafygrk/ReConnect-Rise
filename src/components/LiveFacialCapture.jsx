import { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, ScanFace, Loader2, ShieldAlert } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function LiveFacialCapture({ onCapture, onCancel }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photoDataUrl, setPhotoDataUrl] = useState(null);
    const [error, setError] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    
    // Liveness states: 0: Not Started, 1: Center, 2: Left, 3: Right, 4: Capturing, 5: Done
    const [livenessStep, setLivenessStep] = useState(0);
    const [instruction, setInstruction] = useState('Initialize Scanner');
    const [progress, setProgress] = useState(0);

    // AI/Tracking refs
    const landmarkerRef = useRef(null);
    const requestRef = useRef(null);
    const lastVideoTimeRef = useRef(-1);
    
    // We need to use refs for state accessed inside requestAnimationFrame
    const stepRef = useRef(0);
    const holdTimeRef = useRef(0);

    // AI Voice Helper
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const updateStep = (newStep, text, prog) => {
        setLivenessStep(newStep);
        stepRef.current = newStep;
        setInstruction(text);
        setProgress(prog);
        if (text) speak(text);
    };

    useEffect(() => {
        async function loadModels() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: false,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                setModelsLoaded(true);
            } catch (err) {
                console.error("Failed to load FaceLandmarker:", err);
                setError('Biometric engine failed to initialize. Please check network connection.');
            }
        }
        
        loadModels();
        startCamera();
        
        return () => {
            stopCamera();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (landmarkerRef.current) landmarkerRef.current.close();
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    const startCamera = async () => {
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // Wait for video to be ready before allowing tracking
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                };
            }
        } catch (err) {
            setError('Camera access denied. Secure connection (HTTPS) required.');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const detectLiveness = () => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !landmarker || video.readyState < 2) {
            requestRef.current = requestAnimationFrame(detectLiveness);
            return;
        }

        const nowInMs = performance.now();
        if (lastVideoTimeRef.current !== video.currentTime) {
            lastVideoTimeRef.current = video.currentTime;
            
            const results = landmarker.detectForVideo(video, nowInMs);
            
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];
                // Point 1: Nose tip, Point 234: Left cheek, Point 454: Right cheek
                const nose = landmarks[1];
                const leftCheek = landmarks[234];
                const rightCheek = landmarks[454];

                // Calculate distance from nose to cheeks
                const leftDist = Math.abs(nose.x - leftCheek.x);
                const rightDist = Math.abs(rightCheek.x - nose.x);
                const ratio = leftDist / rightDist;

                const currentStep = stepRef.current;
                
                // Real-time verification logic - INSTANT ADVANCE (No hold times)
                if (currentStep === 1) {
                    // Looking Center (Wide tolerance)
                    if (ratio > 0.65 && ratio < 1.45) {
                        updateStep(2, 'Good. Slowly turn your head to the left.', 35);
                    }
                } 
                else if (currentStep === 2) {
                    // Looking Left (Very forgiving)
                    if (ratio < 0.75) {
                        updateStep(3, 'Excellent. Now turn your head to the right.', 65);
                    }
                }
                else if (currentStep === 3) {
                    // Looking Right (Very forgiving)
                    if (ratio > 1.35) {
                        updateStep(4, 'Perfect. Look straight to finalize biometric signature.', 90);
                    }
                }
                else if (currentStep === 4) {
                    // Back to center to capture
                    if (ratio > 0.65 && ratio < 1.45) {
                        captureFinalImage();
                        return; // Stop loop
                    }
                }
            } else {
                // No face detected
                if (stepRef.current > 0 && stepRef.current < 5) {
                    setInstruction('Face lost. Please stay in frame.');
                }
            }
        }
        requestRef.current = requestAnimationFrame(detectLiveness);
    };

    const captureFinalImage = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // We capture the video exactly as it is (it's horizontally flipped in CSS, 
        // we'll apply the flip on the canvas to save it mirrored as they see it)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        setPhotoDataUrl(dataUrl);
        updateStep(5, 'Verification Successful', 100);
        stopCamera();
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    const runLivenessFlow = () => {
        if (!videoRef.current || !modelsLoaded) return;
        holdTimeRef.current = 0;
        updateStep(1, 'Please look straight into the camera.', 10);
        requestRef.current = requestAnimationFrame(detectLiveness);
    };

    const retakePhoto = () => {
        setPhotoDataUrl(null);
        updateStep(0, 'Initialize Scanner', 0);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        startCamera();
    };

    const confirmPhoto = () => {
        stopCamera();
        if (onCapture) {
            onCapture(photoDataUrl);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-6 rounded-3xl bg-[#0B1221] border border-white/5 relative overflow-hidden shadow-2xl">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold mb-4 w-full flex items-start gap-3">
                    <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Instruction Banner overlay */}
            <div className="w-full max-w-[280px] mb-4 relative h-10 flex flex-col justify-end">
                 <p className="text-[#3B82F6] text-[11px] font-black uppercase tracking-[0.1em] text-center w-full transition-all duration-300">
                    {instruction}
                </p>
                {(livenessStep > 0 && livenessStep < 5) && (
                    <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-[#3B82F6] to-[#F5A623] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {!photoDataUrl ? (
                <>
                    <div className="relative w-full max-w-[280px] aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-[#3B82F6]/20">
                        {(!stream || !modelsLoaded) && !error && (
                            <div className="animate-pulse flex flex-col items-center text-[#3B82F6]">
                                <ScanFace size={40} className="mb-3 opacity-50" />
                                <span className="text-[10px] uppercase tracking-widest font-black">
                                    {!modelsLoaded ? 'Loading Neural Engine...' : 'Initializing Sensor'}
                                </span>
                            </div>
                        )}
                        
                        {error ? (
                            <div className="flex flex-col items-center justify-center text-white/40 p-6 text-center h-full w-full bg-[#1A2235]">
                                <ScanFace size={48} className="mb-4 opacity-30 text-white" />
                                <p className="text-sm font-bold text-white/70 mb-2">Scanner Offline</p>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transition-all duration-500 ${(livenessStep === 5) ? 'opacity-50 blur-sm scale-110' : 'opacity-100'}`}
                                    style={{ transform: 'scaleX(-1)' }}
                                ></video>

                                {/* High-tech overlay guides */}
                                {stream && modelsLoaded && livenessStep < 5 && (
                                    <>
                                        {/* Face Oval Cutout Effect */}
                                        <div className="absolute inset-0 pointer-events-none transition-all duration-700" style={{
                                            boxShadow: 'inset 0 0 0 9999px rgba(11, 18, 33, 0.7)',
                                            WebkitMaskImage: 'radial-gradient(ellipse 55% 65% at 50% 50%, transparent 60%, black 61%)',
                                            maskImage: 'radial-gradient(ellipse 55% 65% at 50% 50%, transparent 60%, black 61%)'
                                        }}></div>

                                        {/* Dynamic Border based on liveness step */}
                                        <div className={`absolute top-[17.5%] bottom-[17.5%] left-[22.5%] right-[22.5%] border-[3px] border-dashed rounded-[50%] pointer-events-none transition-all duration-700 ${livenessStep === 0 ? 'border-white/30' : livenessStep === 2 ? 'border-[#3B82F6] -translate-x-4 scale-95' : livenessStep === 3 ? 'border-[#3B82F6] translate-x-4 scale-95' : 'border-[#FCD34D] scale-100'}`}></div>

                                        {/* Scanner line (only active during active liveness flow) */}
                                        {livenessStep > 0 && livenessStep < 5 && (
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-white shadow-[0_0_20px_#3B82F6,0_0_10px_#fff] animate-scan z-10 pointer-events-none"></div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-[280px]">
                        {!error && (
                            <button
                                type="button"
                                onClick={runLivenessFlow}
                                disabled={!stream || !modelsLoaded || livenessStep > 0}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all bg-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none hover:bg-[#2563EB] active:scale-95"
                            >
                                {livenessStep > 0 ? (
                                    <><Loader2 size={18} className="animate-spin" /> Tracking Face...</>
                                ) : (
                                    <><ScanFace size={18} /> Begin Security Scan</>
                                )}
                            </button>
                        )}
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={livenessStep > 0}
                                className="w-full py-3 rounded-2xl font-bold text-white/40 hover:text-white transition-colors text-sm disabled:opacity-20"
                            >
                                Cancel Registration
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.2)] border-4 border-[#3B82F6]">
                        <img src={photoDataUrl} alt="Captured face" className="w-full h-full object-cover" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <div className="flex items-center gap-2 text-[#34D399]">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Liveness Confirmed</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6 w-full max-w-[280px]">
                        <button
                            type="button"
                            onClick={retakePhoto}
                            className="flex items-center justify-center gap-2 py-3.5 px-4 flex-1 rounded-2xl font-bold text-white/50 hover:text-white bg-white/5 border border-white/10 transition-colors text-sm active:scale-95"
                        >
                            <RefreshCw size={16} /> Retake
                        </button>
                        <button
                            type="button"
                            onClick={confirmPhoto}
                            className="flex items-center justify-center gap-2 py-3.5 px-4 flex-1 rounded-2xl font-bold text-white bg-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-[#2563EB] transition-colors text-sm active:scale-95"
                        >
                            <CheckCircle2 size={16} /> Use Verified Scan
                        </button>
                    </div>
                </>
            )}

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden"></canvas>

            <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
