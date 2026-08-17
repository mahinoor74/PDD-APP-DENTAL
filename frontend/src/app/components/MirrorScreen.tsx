import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Camera, Volume2, VolumeX, Sparkles, ArrowLeft, Play, Pause, 
  RotateCcw, ChevronRight, ChevronLeft, Award, Flame, Zap, Music, 
  Globe, Download, Image as ImageIcon, CheckCircle, Shield, Clock
} from "lucide-react";

interface StepItem {
  step: number;
  title: string;
  text: string;
  quadrantId: string;
  quadrantName: string;
  icon: string;
}

export default function MirrorScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stateData = location.state as any;

  // All 7 Clinical Brushing Techniques
  const TECHNIQUES_LIST = [
    "Modified Bass Technique",
    "Modified Stillman Technique",
    "Charters Method (Braces)",
    "Magic Circular Fones Method",
    "Smith-Bell Sulcular Implant Care",
    "Roll & Sweep Technique",
    "Electric Automated Technique"
  ];

  const [activeTechnique, setActiveTechnique] = useState<string>(() => {
    return stateData?.technique || localStorage.getItem("recommendedTechnique") || "Modified Bass Technique";
  });

  // Duration Preset Modes (1-Min, 2-Min, 3-Min)
  const [selectedDuration, setSelectedDuration] = useState<number>(120); // default 120s
  const [timeLeft, setTimeLeft] = useState<number>(120);

  // Language Voiceover Selection
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const LANGUAGES_LIST = [
    { code: "en-US", name: "English" },
    { code: "hi-IN", name: "Hindi (हिंदी)" },
    { code: "te-IN", name: "Telugu (తెలుగు)" },
    { code: "es-ES", name: "Spanish (Español)" },
    { code: "fr-FR", name: "French (Français)" }
  ];

  // Camera State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Audio Chime & Voice State
  const [isBrushing, setIsBrushing] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [rhythmChimeEnabled, setRhythmChimeEnabled] = useState<boolean>(false);
  
  // Smile Diary Snapshot State
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [showSnapshotModal, setShowSnapshotModal] = useState<boolean>(false);

  // Celebration & Streak
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(() => {
    return parseInt(localStorage.getItem("brushStreak") || "5", 10);
  });

  // Steps Sequence for All 7 Techniques
  const techniqueStepsMap: Record<string, StepItem[]> = {
    "Modified Bass Technique": [
      { step: 1, title: "Upper Right Molars", text: "Place bristles at 45° angle to gum line. Gently vibrate back & forth, then sweep downward over teeth crowns.", quadrantId: "UR", quadrantName: "Upper Right", icon: "🦷" },
      { step: 2, title: "Upper Left Molars", text: "Angle bristles at 45° to upper left gum line. Execute micro-vibrations and sweep bristles downward.", quadrantId: "UL", quadrantName: "Upper Left", icon: "✨" },
      { step: 3, title: "Upper Front Teeth", text: "Angle bristles 45° at upper front gums. Clean outer surfaces and use vertical flicking strokes on inner surfaces.", quadrantId: "FL", quadrantName: "Front Teeth", icon: "😬" },
      { step: 4, title: "Lower Left Molars", text: "Position bristles at 45° pointing upward at lower left gums. Vibrate gently and sweep bristles upward.", quadrantId: "LL", quadrantName: "Lower Left", icon: "🦷" },
      { step: 5, title: "Lower Right Molars", text: "Clean lower right gums with 45° upward sulcular vibrations, sweeping upward towards chewing edges.", quadrantId: "LR", quadrantName: "Lower Right", icon: "✨" },
      { step: 6, title: "Chewing Surfaces & Tongue", text: "Scrub top chewing grooves with short flat strokes. Finish by gently brushing tongue from back to front.", quadrantId: "CH", quadrantName: "Chewing & Tongue", icon: "👅" }
    ],
    "Modified Stillman Technique": [
      { step: 1, title: "Upper Right Arch", text: "Place bristles half on attached gum and half on tooth root. Compress gently until tissue lightens, then roll down.", quadrantId: "UR", quadrantName: "Upper Right", icon: "🦷" },
      { step: 2, title: "Upper Left Arch", text: "Perform 10 short pulsing vibratory strokes on upper left gums, then roll brush smoothly down over crowns.", quadrantId: "UL", quadrantName: "Upper Left", icon: "✨" },
      { step: 3, title: "Front Upper & Lower", text: "Hold brush vertically for inner front teeth and sweep gently away from gums toward chewing edge.", quadrantId: "FL", quadrantName: "Front Teeth", icon: "😬" },
      { step: 4, title: "Lower Left Arch", text: "Position bristles on lower left gums, compress gently and roll bristles upward across enamel.", quadrantId: "LL", quadrantName: "Lower Left", icon: "🦷" },
      { step: 5, title: "Lower Right Arch", text: "Roll bristles upward across lower right outer enamel without aggressive horizontal scrubbing.", quadrantId: "LR", quadrantName: "Lower Right", icon: "✨" },
      { step: 6, title: "Chewing Surfaces & Rinse", text: "Scrub biting grooves with flat horizontal strokes and rinse dislodged plaque thoroughly.", quadrantId: "CH", quadrantName: "Chewing & Tongue", icon: "💧" }
    ],
    "Charters Method (Braces)": [
      { step: 1, title: "Upper Right Brackets", text: "Angle bristles 45° downward over top of orthodontic brackets. Vibrate gently around wire.", quadrantId: "UR", quadrantName: "Upper Right", icon: "📐" },
      { step: 2, title: "Upper Left Brackets", text: "Angle bristles 45° upward under bottom of bracket wires and execute gentle circular vibrations.", quadrantId: "UL", quadrantName: "Upper Left", icon: "🌀" },
      { step: 3, title: "Front Brackets", text: "Clean around front bracket wings and archwire with light circular vibratory movements.", quadrantId: "FL", quadrantName: "Front Teeth", icon: "😬" },
      { step: 4, title: "Lower Left Brackets", text: "Clean under lower left archwire and bracket margins with angled soft bristles.", quadrantId: "LL", quadrantName: "Lower Left", icon: "🪥" },
      { step: 5, title: "Lower Right Brackets", text: "Sweep bristles under lower right bracket wings to remove soft food debris.", quadrantId: "LR", quadrantName: "Lower Right", icon: "✨" },
      { step: 6, title: "Chewing & Interdental", text: "Scrub top chewing surfaces and sweep interdental proxy brush under wires.", quadrantId: "CH", quadrantName: "Chewing & Tongue", icon: "👅" }
    ],
    "Magic Circular Fones Method": [
      { step: 1, title: "Upper Right Outer", text: "Close upper and lower teeth lightly. Make wide, sweeping circular motions over outer teeth and gums.", quadrantId: "UR", quadrantName: "Upper Right", icon: "⭕" },
      { step: 2, title: "Upper Left Outer", text: "Continue broad circular strokes across left outer teeth covering both upper and lower arches.", quadrantId: "UL", quadrantName: "Upper Left", icon: "🌀" },
      { step: 3, title: "Front Teeth Outer", text: "Sweep broad circles over front closed teeth, massaging gums gently.", quadrantId: "FL", quadrantName: "Front Teeth", icon: "😬" },
      { step: 4, title: "Lower Left Inner", text: "Open mouth wide and brush inside surfaces of lower left teeth back-and-forth.", quadrantId: "LL", quadrantName: "Lower Left", icon: "👄" },
      { step: 5, title: "Lower Right Inner", text: "Clean inside surfaces of lower right teeth with soft back-and-forth strokes.", quadrantId: "LR", quadrantName: "Lower Right", icon: "✨" },
      { step: 6, title: "Chewing Surfaces & Tongue", text: "Scrub biting surfaces flatly and brush tongue gently from back to front.", quadrantId: "CH", quadrantName: "Chewing & Tongue", icon: "👅" }
    ],
    "Smith-Bell Sulcular Implant Care": [
      { step: 1, title: "Upper Right Implants", text: "Direct ultra-soft bristles into gum pocket around implants at 45°. Apply light vibratory strokes.", quadrantId: "UR", quadrantName: "Upper Right", icon: "📐" },
      { step: 2, title: "Upper Left Implants", text: "Vibrate bristles gently around upper left implant crowns without scratching abutments.", quadrantId: "UL", quadrantName: "Upper Left", icon: "✨" },
      { step: 3, title: "Front Implant Margins", text: "Sweep lingual implant margins with soft vertical movements to flush plaque.", quadrantId: "FL", quadrantName: "Front Teeth", icon: "🛡️" },
      { step: 4, title: "Lower Left Implants", text: "Clean lower left implant margins with gentle circular vibration along gum line.", quadrantId: "LL", quadrantName: "Lower Left", icon: "🦷" },
      { step: 5, title: "Lower Right Implants", text: "Massage surrounding gum tissue around lower right implant posts gently.", quadrantId: "LR", quadrantName: "Lower Right", icon: "✨" },
      { step: 6, title: "Chewing & Soft Tissue", text: "Clean top chewing surfaces and rinse thoroughly with antibacterial mouthwash.", quadrantId: "CH", quadrantName: "Chewing & Tongue", icon: "💧" }
    ],
    "Roll & Sweep Technique": [
      { step: 1, title: "Upper Right Arch", text: "Place brush parallel to tooth axis on gums and roll bristles downward toward chewing edge.", quadrantId: "UR", quadrantName: "Upper Right", icon: "⬇️" },
      { step: 2, title: "Upper Left Arch", text: "Roll bristles downward across upper left outer enamel 5 to 6 times per section.", quadrantId: "UL", quadrantName: "Upper Left", icon: "✨" },
      { step: 3, title: "Front Teeth", text: "Roll bristles down front teeth and sweep inner lingual surfaces vertically.", quadrantId: "FL", quadrantName: "Front Teeth", icon: "😬" },
      { step: 4, title: "Lower Left Arch", text: "Place brush bristles pointing down at lower left gums and roll bristles smoothly upward.", quadrantId: "LL", quadrantName: "Lower Left", icon: "⬆️" },
      { step: 5, title: "Lower Right Arch", text: "Roll bristles upward across lower right outer enamel toward chewing edge.", quadrantId: "LR", quadrantName: "Lower Right", icon: "✨" },
      { step: 6, title: "Chewing Surfaces & Tongue", text: "Scrub top chewing surfaces with short flat strokes and brush tongue gently.", quadrantId: "CH", quadrantName: "Chewing & Tongue", icon: "👅" }
    ],
    "Electric Automated Technique": [
      { step: 1, title: "Upper Right Molars", text: "Hold electric brush head at 45° on each tooth for 3 seconds. Allow brush motor to work without scrubbing.", quadrantId: "UR", quadrantName: "Upper Right", icon: "⚡" },
      { step: 2, title: "Upper Left Molars", text: "Guide brush head slowly along upper left gum line, pausing 3 seconds per tooth surface.", quadrantId: "UL", quadrantName: "Upper Left", icon: "✨" },
      { step: 3, title: "Front Teeth", text: "Move oscillating brush head smoothly along outer and inner surfaces of front teeth.", quadrantId: "FL", quadrantName: "Front Teeth", icon: "😬" },
      { step: 4, title: "Lower Left Molars", text: "Guide electric brush head slowly along lower left gum margins.", quadrantId: "LL", quadrantName: "Lower Left", icon: "⚡" },
      { step: 5, title: "Lower Right Molars", text: "Pause 3 seconds on each lower right tooth surface, angled towards gum sulcus.", quadrantId: "LR", quadrantName: "Lower Right", icon: "✨" },
      { step: 6, title: "Chewing Surfaces & Tongue", text: "Place flat brush head on biting grooves, then brush tongue gently on low setting.", quadrantId: "CH", quadrantName: "Chewing & Tongue", icon: "👅" }
    ]
  };

  const currentSteps = techniqueStepsMap[activeTechnique] || techniqueStepsMap["Modified Bass Technique"];
  const activeStep = currentSteps[currentStepIdx] || currentSteps[0];

  // Multi-Language Speech Synthesis
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  }, [voiceEnabled, selectedLanguage]);

  // Web Audio 120-BPM Rhythm Chime Generator
  const playRhythmBeep = useCallback(() => {
    if (!rhythmChimeEnabled || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note chime
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }, [rhythmChimeEnabled]);

  // Request Camera Permission & Start Webcam
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
      } catch (err1) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera permission blocked. Please check phone Settings -> Apps -> ToothMate -> Permissions -> Camera -> Allow.");
      setCameraActive(false);
    }
  }, []);

  // Stop Webcam Stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopCamera]);

  // Timer Tick, Rhythm Chime & Step Synchronization
  useEffect(() => {
    let timerId: any = null;
    if (isBrushing && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(prev => {
          const nextTime = prev - 1;
          const totalSecs = selectedDuration;
          const elapsed = totalSecs - nextTime;
          const stepInterval = Math.max(1, Math.floor(totalSecs / 6));
          const newStepIdx = Math.min(5, Math.floor(elapsed / stepInterval));
          
          if (newStepIdx !== currentStepIdx) {
            setCurrentStepIdx(newStepIdx);
            const nextStepObj = currentSteps[newStepIdx];
            if (nextStepObj) {
              speakText(`${nextStepObj.title}. ${nextStepObj.text}`);
            }
          }

          // Trigger 120-BPM tempo pulse every second
          playRhythmBeep();

          return nextTime;
        });
      }, 1000);
    } else if (isBrushing && timeLeft === 0) {
      setIsBrushing(false);
      setSessionCompleted(true);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem("brushStreak", String(newStreak));
      speakText("Congratulations! You completed your brushing session!");
    }
    return () => clearInterval(timerId);
  }, [isBrushing, timeLeft, currentStepIdx, currentSteps, speakText, streakCount, selectedDuration, playRhythmBeep]);

  // Capture Smile Snapshot
  const captureSmileSnapshot = () => {
    if (!videoRef.current || !cameraActive) {
      startCamera();
      setTimeout(takeFrame, 600);
    } else {
      takeFrame();
    }

    function takeFrame() {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setSnapshotDataUrl(dataUrl);
        setShowSnapshotModal(true);

        // Save to LocalStorage Smile Gallery
        try {
          const existing = JSON.parse(localStorage.getItem("smileGallerySnapshots") || "[]");
          existing.unshift({ id: Date.now(), date: new Date().toLocaleDateString(), image: dataUrl });
          localStorage.setItem("smileGallerySnapshots", JSON.stringify(existing.slice(0, 10)));
        } catch (e) {}
      }
    }
  };

  // Handle Duration Preset Selection
  const handleSelectDurationMode = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setCurrentStepIdx(0);
    setIsBrushing(false);
  };

  // Handle Manual Step Navigation
  const handleNextStep = () => {
    if (currentStepIdx < currentSteps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const stepObj = currentSteps[nextIdx];
      if (stepObj) speakText(`${stepObj.title}. ${stepObj.text}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      const stepObj = currentSteps[prevIdx];
      if (stepObj) speakText(`${stepObj.title}. ${stepObj.text}`);
    }
  };

  const handleStartBrushing = () => {
    if (!cameraActive) {
      startCamera();
    }
    setIsBrushing(true);
    setSessionCompleted(false);
    speakText(`Starting session. Step 1: ${activeStep.title}. ${activeStep.text}`);
  };

  const handlePauseBrushing = () => {
    setIsBrushing(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleResetSession = () => {
    setIsBrushing(false);
    setTimeLeft(selectedDuration);
    setCurrentStepIdx(0);
    setSessionCompleted(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 font-sans text-slate-100">
      
      {/* Hidden Offscreen Canvas for Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* HEADER NAVIGATION & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 md:p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-700"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl md:text-2xl text-white tracking-tight">Smart Vision Mirror</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">
                CLINICAL GUIDE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Follow step-by-step clinical guidance for your smile</p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Language Voice Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-cyan-300 text-xs font-bold"
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Technique Selector */}
          <select 
            value={activeTechnique}
            onChange={(e) => {
              const tech = e.target.value;
              setActiveTechnique(tech);
              localStorage.setItem("recommendedTechnique", tech);
              setCurrentStepIdx(0);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 outline-none cursor-pointer hover:border-cyan-500/50 transition-all max-w-[180px] truncate"
          >
            {TECHNIQUES_LIST.map((tech) => (
              <option key={tech} value={tech} className="bg-slate-900 text-white">
                {tech}
              </option>
            ))}
          </select>

          {/* Rhythm Chime Toggle */}
          <button 
            onClick={() => setRhythmChimeEnabled(!rhythmChimeEnabled)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              rhythmChimeEnabled ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle 120-BPM Hygiene Tempo Chime"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Voiceover Toggle */}
          <button 
            onClick={() => {
              const nextVoice = !voiceEnabled;
              setVoiceEnabled(nextVoice);
              if (!nextVoice && typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              voiceEnabled ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle Voice Assistance"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

        </div>
      </div>

      {/* CAMERA MIRROR CONTAINER */}
      <div className="w-full relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl min-h-[320px] md:min-h-[420px] flex items-center justify-center">
        
        {/* Video Element */}
        <video 
          ref={videoRef}
          playsInline 
          muted 
          className={`w-full h-full object-cover min-h-[320px] md:min-h-[420px] transition-opacity duration-500 ${
            cameraActive ? "opacity-100" : "opacity-0 absolute pointer-events-none"
          }`}
        />

        {/* Camera Permission Placeholder (When Off) */}
        {!cameraActive && (
          <div className="p-8 text-center space-y-4 max-w-md z-10 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Camera className="w-10 h-10" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-white">Camera Mirror Mode</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Turn on your camera to view your smile in real-time while performing your recommended <span className="text-cyan-300 font-bold">{activeTechnique}</span>.
              </p>
            </div>

            <button
              onClick={startCamera}
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-cyan-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 mx-auto"
            >
              <Camera className="w-5 h-5" />
              <span>Allow Camera Access</span>
            </button>

            {cameraError && (
              <p className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* Overlay Controls & Badges (When Camera Active) */}
        {cameraActive && (
          <>
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-white flex items-center gap-2 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE MIRROR</span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-black text-cyan-300 shadow-lg">
                📍 Focus: {activeStep.quadrantName}
              </span>
            </div>

            {/* Snap Smile Shutter Button */}
            <div className="absolute bottom-4 right-4 z-20">
              <button
                onClick={captureSmileSnapshot}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                title="Capture Smile Snapshot"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Smile Photo</span>
              </button>
            </div>
          </>
        )}

      </div>

      {/* DURATION PRESET TABS & SESSION CONTROL BAR */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5 backdrop-blur-md">
        
        {/* Duration Mode Preset Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-4">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" /> DURATION PRESET
          </span>
          <div className="flex gap-2">
            {[
              { label: "⚡ 1-Min Refresh", secs: 60 },
              { label: "🌟 2-Min Standard", secs: 120 },
              { label: "🛡️ 3-Min Ortho Care", secs: 180 }
            ].map(preset => (
              <button
                key={preset.secs}
                onClick={() => handleSelectDurationMode(preset.secs)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedDuration === preset.secs
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          
          {/* Timer Display */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <span className="font-mono text-xl font-black text-cyan-300">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{selectedDuration / 60}-Minute Hygiene Timer</h3>
              <p className="text-xs text-slate-400 font-medium">
                {isBrushing ? "Session running... Step auto-advances smoothly." : "Press Start when you are ready to begin brushing."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isBrushing ? (
              <button
                onClick={handleStartBrushing}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Session</span>
              </button>
            ) : (
              <button
                onClick={handlePauseBrushing}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleResetSession}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 6 QUADRANTS VISUAL ANATOMICAL MOUTH MAP */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>INTERACTIVE QUADRANT MOUTH MAP</span>
            <span className="text-cyan-400 font-mono">Active Zone {currentStepIdx + 1} of 6</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
            {currentSteps.map((stepItem, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;
              return (
                <div 
                  key={stepItem.step}
                  onClick={() => {
                    setCurrentStepIdx(idx);
                    speakText(`${stepItem.title}. ${stepItem.text}`);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                    isActive 
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 font-black scale-105 shadow-lg shadow-cyan-500/20" 
                      : isPast 
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold" 
                        : "bg-slate-800/60 border-slate-700/60 text-slate-400 font-semibold hover:border-slate-600"
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stepItem.quadrantId}</div>
                  <div className="text-xs font-extrabold mt-0.5 truncate">{stepItem.quadrantName}</div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute top-2 right-2"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* STEP-BY-STEP TECHNIQUE PROCEDURE CARD */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6 backdrop-blur-md relative overflow-hidden">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-lg font-bold">
              {activeStep.icon}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                {activeTechnique} • Step {currentStepIdx + 1} of 6
              </span>
              <h2 className="text-lg md:text-xl font-extrabold text-white">{activeStep.title}</h2>
            </div>
          </div>

          {/* Manual Step Nav Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIdx === 0}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                currentStepIdx === 0 ? "opacity-30 cursor-not-allowed bg-slate-800 border-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
              }`}
              title="Previous Step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-400 px-1">
              {currentStepIdx + 1}/6
            </span>

            <button
              onClick={handleNextStep}
              disabled={currentStepIdx === currentSteps.length - 1}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                currentStepIdx === currentSteps.length - 1 ? "opacity-30 cursor-not-allowed bg-slate-800 border-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
              }`}
              title="Next Step"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Description Text Box */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
            "{activeStep.text}"
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-300 font-semibold">
              Focus Area: {activeStep.quadrantName} ({activeStep.quadrantId})
            </span>
          </div>
        </div>

      </div>

      {/* 📸 SMILE DIARY SNAPSHOT PREVIEW MODAL */}
      {showSnapshotModal && snapshotDataUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-white">Smile Photo Captured! 📸</h3>
              <p className="text-xs text-slate-400 mt-1">Saved to your personal Smile Progress Diary.</p>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-md max-h-56">
              <img src={snapshotDataUrl} alt="Smile Snapshot" className="w-full h-full object-cover" />
            </div>

            <button
              onClick={() => setShowSnapshotModal(false)}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Done & Resume Session
            </button>
          </div>
        </div>
      )}

      {/* 🎉 SESSION COMPLETION CELEBRATION MODAL */}
      {sessionCompleted && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
            
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-extrabold text-2xl text-white">Brushing Session Complete! 🎉</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Awesome work! You completed your session using the <span className="text-cyan-300 font-bold">{activeTechnique}</span>.
              </p>
            </div>

            {/* Rewards Badge */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex justify-around items-center">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Hygiene Score</span>
                <span className="text-lg font-black text-emerald-400">+50 Points</span>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Daily Streak</span>
                <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>{streakCount} Days</span>
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleResetSession}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-all cursor-pointer"
              >
                Brush Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
