import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, RefreshCw, Volume2, VolumeX, Sparkles, ArrowLeft } from "lucide-react";

export default function MirrorScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const stateData = location.state as any;
  const [userMode] = useState(stateData?.mode || localStorage.getItem("userAgeGroup") || "adult");
  const [userTechnique] = useState(stateData?.technique || localStorage.getItem("recommendedTechnique") || "Modified Bass Technique");

  const [cameraActive, setCameraActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraToggle, setCameraToggle] = useState(0); 
  
  const [isBrushing, setIsBrushing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); 
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const coachingMatrix: any = {
    child: {
      "Magic Circular Fones Method": [
        { text: "Step 1: Apply a pea-sized amount of fluoride toothpaste.", image: "/images/fones/step1.png" },
        { text: "Step 2: Close your teeth together naturally.", image: "/images/fones/step2.png" },
        { text: "Step 3: Move your brush in wide circles to cover both rows.", image: "/images/fones/step3.png" },
        { text: "Step 4: Open your mouth and brush the chewing surfaces.", image: "/images/fones/step4.png" },
        { text: "Step 5: Use a gentle flicking motion to clean inside.", image: "/images/fones/step5.png" },
        { text: "Step 6: Swish water briefly and spit it out.", image: "/images/fones/step6.png" }
      ]
    },
    orthodontic: {
      "Orthodontic Appliance Care": [
        { text: "Step 1: Clean between each bracket with an interdental brush.", image: "/images/ortho/step1.png" },
        { text: "Step 2: Hold your brush at a 45-degree angle to the wire.", image: "/images/ortho/step2.png" },
        { text: "Step 3: Brush gently above the metal bracket.", image: "/images/ortho/step2.png" },
        { text: "Step 4: Brush gently below the metal bracket.", image: "/images/ortho/step4.png" },
        { text: "Step 5: Sweep the brush from the gum toward the bracket.", image: "/images/ortho/step5.png" },
        { text: "Step 6: Rinse well to flush out all dislodged debris.", image: "/images/ortho/step6.png" }
      ]
    },
    senior: {
      "Smith-Bell Sulcular Implant Care": [
        { text: "Step 1: Use a soft-bristled brush with sensitive toothpaste.", image: "/images/smith/step1.png" },
        { text: "Step 2: Place bristles at the gum line at a 45-degree angle.", image: "/images/smith/step2.png" },
        { text: "Step 3: Use very gentle, short strokes without pressure.", image: "/images/smith/step3.png" },
        { text: "Step 4: Clean the areas around your implants carefully.", image: "/images/smith/step4.png" },
        { text: "Step 5: Brush chewing surfaces with light horizontal strokes.", image: "/images/smith/step5.png" },
        { text: "Step 6: Rinse with water and inspect your work.", image: "/images/smith/step6.png" }
      ]
    },
    adult: {
      "Modified Bass Technique": [
        { text: "Step 1: Hold the brush at a 45-degree angle toward the gum line.", image: "/images/bass/step1.png" },
        { text: "Step 2: Use short, vibratory strokes at the gum line.", image: "/images/bass/step2.png" },
        { text: "Step 3: Sweep the brush away from the gums.", image: "/images/bass/step3.png" },
        { text: "Step 4: Repeat for every outer tooth surface.", image: "/images/bass/step4.png" },
        { text: "Step 5: Clean inner surfaces using a flicking motion.", image: "/images/bass/step5.png" },
        { text: "Step 6: Rinse thoroughly to finish.", image: "/images/bass/step6.png" }
      ],
      "The Stillman Technique": [
        { text: "Step 1: Place bristles partially on the gum and tooth.", image: "/images/stillman/step1.png" },
        { text: "Step 2: Apply pressure to slightly blanch gum tissue.", image: "/images/stillman/step2.png" },
        { text: "Step 3: Perform short, rapid, pulsing vibratory strokes.", image: "/images/stillman/step3.png" },
        { text: "Step 4: Lift the brush and move to the next section.", image: "/images/stillman/step4.png" },
        { text: "Step 5: Repeat across all outer and inner surfaces.", image: "/images/stillman/step5.png" },
        { text: "Step 6: Rinse your mouth well with water.", image: "/images/stillman/step6.png" }
      ]
    }
  };

  const steps = coachingMatrix[userMode.toLowerCase()]?.[userTechnique] || [
    { text: "Step 1: Apply a small amount of toothpaste." },
    { text: "Step 2: Position your brush correctly for your technique." },
    { text: `Step 3: Follow the ${userTechnique} motion slowly.` },
    { text: "Step 4: Ensure all outer and inner surfaces are reached." },
    { text: "Step 5: Brush your tongue to remove remaining bacteria." },
    { text: "Step 6: Rinse with fresh water." }
  ];

  const currentTechnique = { title: userTechnique, steps };

  const handleSpeakGuideline = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) { setIsSpeaking(false); return; }
      const textToSpeak = currentTechnique.steps[currentStepIdx]?.text || "Next step.";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.90;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // 🛠️ REMAPPED WEB MEDIA HANDSHAKE PIPELINE
  useEffect(() => {
    let isMounted = true;
    let streamRef: MediaStream | null = null;

    async function startCamera() {
      try {
        // Use basic flexible constraints to bypass device resolution sync stalls
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        
        if (isMounted && videoRef.current) {
          streamRef = stream;
          videoRef.current.srcObject = stream;
          
          // Force base DOM properties cleanly
          videoRef.current.setAttribute("muted", "true");
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.muted = true;
          
          // Clear race conditions with a minor delay so layout can mount first
          setTimeout(() => {
            if (videoRef.current && isMounted) {
              videoRef.current.play()
                .then(() => setCameraActive(true))
                .catch(e => console.log("Stream play delayed:", e));
            }
          }, 150);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        if (isMounted) setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraToggle]);

  useEffect(() => {
    let interval: any = null;
    if (isBrushing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsBrushing(false);
            return 0;
          }
          const elapsed = 120 - (prev - 1);
          const step = Math.floor(elapsed / 20);
          if (step !== currentStepIdx && step < currentTechnique.steps.length) {
            setCurrentStepIdx(step);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBrushing, currentStepIdx, currentTechnique.steps.length]);

  useEffect(() => { if (isBrushing) handleSpeakGuideline(); }, [currentStepIdx]);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col p-6 font-sans select-none box-border pb-24">
      
      {/* HEADER ROW */}
      <div className="flex items-center justify-between mb-5 relative w-full">
        <button 
          onClick={() => { window.speechSynthesis.cancel(); navigate("/dashboard"); }} 
          className="p-2 rounded-xl bg-slate-50 border text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center flex-1 pr-8">
          <h1 className="text-xl font-black text-[#1E293B]">Live AI Mirror Coach</h1>
          <p className="text-[11px] text-[#64748B] font-bold mt-0.5">{currentTechnique.title}</p>
        </div>
      </div>

      {/* MIRROR CAMERA CONSOLE (Always block mounts elements to avoid layout frame freeze) */}
      <div className="relative w-full aspect-[3/4] bg-slate-950 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-slate-100">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover scale-x-[-1] bg-slate-900" 
        />
        
        {!cameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#102A43] to-[#244A6F] flex flex-col items-center justify-center p-6 text-center text-white z-10">
            <Sparkles className="w-10 h-10 mb-3 text-[#2D9CDB] animate-pulse" />
            <p className="text-xs font-black tracking-wide uppercase text-blue-200">Syncing Mirror Capture</p>
            <p className="text-[11px] text-white/70 mt-1 max-w-[200px]">Camera active. Preparing presentation viewing frame grid...</p>
          </div>
        )}

        {/* FLOATING STEP GUIDANCE BADGE */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 border border-slate-100/60 z-20">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-[#2D9CDB] uppercase tracking-wider">Step {currentStepIdx + 1} of 6</p>
            <p className="text-xs font-bold text-[#1E293B] mt-0.5 leading-relaxed">{currentTechnique.steps[currentStepIdx]?.text || "Ready to start?"}</p>
          </div>
          <button 
            onClick={handleSpeakGuideline} 
            className={`p-2.5 rounded-xl shrink-0 cursor-pointer transition-all ${isSpeaking ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* FLOATING COUNTDOWN TIMER */}
        <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-black text-xs tracking-widest border border-white/10 shadow-md z-20">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-5 flex gap-3 w-full shrink-0">
        {!isBrushing ? (
          <button 
            onClick={() => setIsBrushing(true)} 
            className="flex-1 py-4 bg-[#0F4C81] text-white font-black text-xs rounded-2xl uppercase tracking-wider shadow-md active:scale-[0.99] transition-all cursor-pointer"
          >
            Start Brushing Session
          </button>
        ) : (
          <button 
            onClick={() => setIsBrushing(false)} 
            className="flex-1 py-4 bg-rose-600 text-white font-black text-xs rounded-2xl uppercase tracking-wider shadow-md active:scale-[0.99] transition-all cursor-pointer"
          >
            Pause
          </button>
        )}
        <button 
          onClick={() => { setIsBrushing(false); window.speechSynthesis.cancel(); setTimeLeft(120); setCurrentStepIdx(0); setCameraToggle(c => c + 1); }} 
          className="px-5 bg-slate-50 border text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}