import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Camera, Volume2, VolumeX, Sparkles, ArrowLeft, Play, Pause, 
  RotateCcw, ChevronRight, ChevronLeft, Award, Flame, Music, 
  Globe, Clock, CheckCircle2, Shield, AlertCircle
} from "lucide-react";
import { 
  BRUSHING_TECHNIQUES, 
  getTechniqueById, 
  BrushingTechnique, 
  ZoneScript 
} from "../../data/brushingTechniques";
import { speechCoach } from "../../utils/speechCoach";
import DynamicBrushAnimation from "./DynamicBrushAnimation";
import PreSessionPrepModal from "./PreSessionPrepModal";
import { logBrushingSession } from "./apiService";

export default function MirrorScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Teen Mode Standard Technique State
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string>("modified_bass");
  const activeTechnique: BrushingTechnique = getTechniqueById(selectedTechniqueId);

  // Pre-session Prep Modal State
  const [showPrepModal, setShowPrepModal] = useState<boolean>(false);

  // Timer & Duration State (Standard 120s Hygiene Timer)
  const [selectedDuration, setSelectedDuration] = useState<number>(120);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [currentZoneIdx, setCurrentZoneIdx] = useState<number>(0);

  // Speech & Sound State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const [rhythmChimeEnabled, setRhythmChimeEnabled] = useState<boolean>(false);

  // Camera Mirror State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Snapshot State
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [showSnapshotModal, setShowSnapshotModal] = useState<boolean>(false);

  // Completion & Streak Stats
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(() => {
    return parseInt(localStorage.getItem("brushStreak") || "5", 10);
  });
  const [cleanSessionsCount, setCleanSessionsCount] = useState<number>(() => {
    return parseInt(localStorage.getItem("cleanSessions") || "12", 10);
  });

  const [isBrushing, setIsBrushing] = useState<boolean>(false);

  const activeZoneScript: ZoneScript =
    activeTechnique.zoneScripts[currentZoneIdx] || activeTechnique.zoneScripts[0];

  // Speech Mute Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    speechCoach.setMuted(nextMute);
  };

  // Language Selector
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    speechCoach.setLanguage(langCode);
  };

  // 120-BPM Rhythm Chime
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
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }, [rhythmChimeEnabled]);

  // Webcam Start via WebRTC MediaDevices
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (err1) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access unavailable. You can still follow the live SVG guide below.");
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Auto-start camera on mount and cleanup on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      speechCoach.stop();
    };
  }, [startCamera, stopCamera]);

  // Timer Tick & Zone Milestone Voice Trigger
  useEffect(() => {
    let timerId: any = null;

    if (isBrushing && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          const nextTime = prev - 1;
          const totalSecs = selectedDuration;
          const elapsed = totalSecs - nextTime;

          const zoneInterval = Math.max(1, Math.floor(totalSecs / 6));
          const newZoneIdx = Math.min(5, Math.floor(elapsed / zoneInterval));

          if (newZoneIdx !== currentZoneIdx) {
            setCurrentZoneIdx(newZoneIdx);
            const targetZone = activeTechnique.zoneScripts[newZoneIdx];
            if (targetZone) {
              speechCoach.speak(targetZone.script);
            }
          }

          playRhythmBeep();
          return nextTime;
        });
      }, 1000);
    } else if (isBrushing && timeLeft === 0) {
      setIsBrushing(false);
      setSessionCompleted(true);

      const newStreak = streakCount + 1;
      const newCleanSessions = cleanSessionsCount + 1;
      setStreakCount(newStreak);
      setCleanSessionsCount(newCleanSessions);
      localStorage.setItem("brushStreak", String(newStreak));
      localStorage.setItem("cleanSessions", String(newCleanSessions));

      speechCoach.speak(activeTechnique.finishScript);

      const rawUser = localStorage.getItem("userProfile");
      let userId = 1;
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          if (parsed.id) userId = parsed.id;
        } catch (e) {}
      }

      logBrushingSession({
        userId: userId,
        technique: activeTechnique.name,
        duration: selectedDuration,
        timestamp: new Date().toISOString()
      }).then((res) => {
        if (res && res.data) {
          if (res.data.unbroken_streak) {
            setStreakCount(res.data.unbroken_streak);
            localStorage.setItem("brushStreak", String(res.data.unbroken_streak));
          }
          if (res.data.clean_sessions) {
            setCleanSessionsCount(res.data.clean_sessions);
            localStorage.setItem("cleanSessions", String(res.data.clean_sessions));
          }
        }
      }).catch((err) => {
        console.warn("Backend session record fallback notice:", err);
      });
    }

    return () => clearInterval(timerId);
  }, [isBrushing, timeLeft, currentZoneIdx, activeTechnique, selectedDuration, playRhythmBeep, streakCount, cleanSessionsCount]);

  // Handlers
  const handleOpenPrepModal = () => {
    setShowPrepModal(true);
  };

  const handleStartBrushingFromPrep = () => {
    setShowPrepModal(false);
    if (!cameraActive) {
      startCamera();
    }
    setIsBrushing(true);
    setSessionCompleted(false);
    if (activeTechnique.zoneScripts[0]) {
      speechCoach.speak(activeTechnique.zoneScripts[0].script);
    }
  };

  const handleStartBrushingDirect = () => {
    if (!cameraActive) {
      startCamera();
    }
    setIsBrushing(true);
    setSessionCompleted(false);
    if (timeLeft === selectedDuration && activeTechnique.zoneScripts[0]) {
      speechCoach.speak(activeTechnique.zoneScripts[0].script);
    }
  };

  const handlePauseBrushing = () => {
    setIsBrushing(false);
    speechCoach.stop();
  };

  const handleResetSession = () => {
    setIsBrushing(false);
    setTimeLeft(selectedDuration);
    setCurrentZoneIdx(0);
    setSessionCompleted(false);
    speechCoach.stop();
  };

  const handleTechniqueChange = (techId: string) => {
    setSelectedTechniqueId(techId);
    speechCoach.stop();
    handleResetSession();
  };

  const handleSelectZone = (zoneIdx: number) => {
    setCurrentZoneIdx(zoneIdx);
    // Jump timer to exact milestone start (0s = 120s, 20s = 100s, 40s = 80s, 60s = 60s, 80s = 40s, 100s = 20s)
    const milestoneTime = selectedDuration - (zoneIdx * 20);
    setTimeLeft(milestoneTime);

    const targetZone = activeTechnique.zoneScripts[zoneIdx];
    if (targetZone) {
      speechCoach.speak(targetZone.script);
    }
  };

  const handleNextZone = () => {
    if (currentZoneIdx < activeTechnique.zoneScripts.length - 1) {
      handleSelectZone(currentZoneIdx + 1);
    }
  };

  const handlePrevZone = () => {
    if (currentZoneIdx > 0) {
      handleSelectZone(currentZoneIdx - 1);
    }
  };

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

        try {
          const existing = JSON.parse(localStorage.getItem("smileGallerySnapshots") || "[]");
          existing.unshift({ id: Date.now(), date: new Date().toLocaleDateString(), image: dataUrl });
          localStorage.setItem("smileGallerySnapshots", JSON.stringify(existing.slice(0, 10)));
        } catch (e) {}
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans text-slate-100 px-3 sm:px-4 pt-2">
      {/* Offscreen Canvas for Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* PRE-SESSION PREPARATION MODAL */}
      {showPrepModal && (
        <PreSessionPrepModal
          technique={activeTechnique}
          onStartBrushing={handleStartBrushingFromPrep}
          onClose={() => {
            speechCoach.stop();
            setShowPrepModal(false);
          }}
        />
      )}

      {/* 1. TOP HEADER & PROMINENT TECHNIQUE SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 md:p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              speechCoach.stop();
              navigate("/dashboard");
            }}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-700"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-xl md:text-2xl text-white tracking-tight">
                Brushing Coach & Smart Mirror
              </h1>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider">
                Teen Mode • {activeTechnique.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Clinically accurate step-by-step guidance with real-time speech synthesis & SVG motions
            </p>
          </div>
        </div>

        {/* Top Controls Toolbar & Prominent Technique Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Technique Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800 border-2 border-cyan-500/50 rounded-2xl px-3 py-2 shadow-lg shadow-cyan-500/10">
            <span className="text-xl">{activeTechnique.icon}</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Technique</span>
              <select
                value={selectedTechniqueId}
                onChange={(e) => handleTechniqueChange(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-cyan-300 text-xs font-black max-w-[210px] truncate"
              >
                {BRUSHING_TECHNIQUES.map((tech) => (
                  <option key={tech.id} value={tech.id} className="bg-slate-900 text-white font-bold">
                    {tech.name} ({tech.angleDegrees}°)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-2xl px-2.5 py-2 text-xs font-bold text-slate-300">
            <Globe className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-cyan-300 text-xs font-bold"
            >
              <option value="en-US" className="bg-slate-900 text-white">English (US)</option>
              <option value="hi-IN" className="bg-slate-900 text-white">Hindi (हिंदी)</option>
              <option value="es-ES" className="bg-slate-900 text-white">Spanish (Español)</option>
              <option value="fr-FR" className="bg-slate-900 text-white">French (Français)</option>
            </select>
          </div>

          {/* Rhythm Chime Toggle */}
          <button
            onClick={() => setRhythmChimeEnabled(!rhythmChimeEnabled)}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              rhythmChimeEnabled
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle 120-BPM Rhythm Chime"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Speech Voice Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
              !isMuted
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title={!isMuted ? "Voice Coach Active" : "Voice Coach Muted"}
          >
            {!isMuted ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 2. MAIN DYNAMIC CONTENT GRID: CAMERA MIRROR VIEWPORT & DYNAMIC SVG OVERLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CAMERA MIRROR VIEWPORT CARD */}
        <div className="w-full relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl min-h-[320px] lg:min-h-[360px] flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover rounded-2xl min-h-[320px] lg:min-h-[360px] transition-opacity duration-500 ${
              cameraActive ? "opacity-100" : "opacity-0 absolute pointer-events-none"
            }`}
          />

          {!cameraActive && (
            <div className="p-8 text-center space-y-4 max-w-md z-10">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">Camera Mirror Mode</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Allow camera access to align your mouth posture with live SVG motion instructions.
                </p>
              </div>

              <button
                onClick={startCamera}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <Camera className="w-4 h-4" />
                <span>Tap to Enable Camera</span>
              </button>

              {cameraError && (
                <p className="text-[11px] text-amber-400 font-medium bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                  {cameraError}
                </p>
              )}
            </div>
          )}

          {cameraActive && (
            <>
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-white flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE MIRROR</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-black text-cyan-300 shadow-lg">
                  Zone {currentZoneIdx + 1}: {activeZoneScript.title}
                </span>
              </div>

              {/* Snap Smile Shutter Button */}
              <div className="absolute bottom-4 right-4 z-20">
                <button
                  onClick={captureSmileSnapshot}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* DYNAMIC SVG BRUSH MOTION OVERLAY */}
        <DynamicBrushAnimation
          motionType={activeTechnique.motionType}
          angleDegrees={activeTechnique.angleDegrees}
          activeZoneIndex={currentZoneIdx}
          isBrushing={isBrushing}
          quadrantId={activeZoneScript.quadrantId}
          quadrantName={activeZoneScript.quadrantName}
        />
      </div>

      {/* 3. TIMER & CONTROLS CARD WITH PROMINENT ACTION BUTTONS */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          
          {/* Digital Timer with SVG Circular Progress Ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400 transition-all duration-1000 ease-linear"
                  strokeDasharray={`${progressPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-base font-black text-cyan-300">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-white">
                2-Minute Standard Hygiene Timer
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {isBrushing
                  ? `Active Zone ${currentZoneIdx + 1}: ${activeZoneScript.title} running...`
                  : "Click Play button or Pre-Session Preparation to start timer."}
              </p>
            </div>
          </div>

          {/* Prominent Action Buttons: Large Green Start / Amber Pause / Slate Reset */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenPrepModal}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all cursor-pointer"
              title="Pre-Session Checklist"
            >
              Prep Guide
            </button>

            <button
              onClick={isBrushing ? handlePauseBrushing : handleStartBrushingDirect}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 cursor-pointer shrink-0 ${
                isBrushing
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30"
              }`}
              title={isBrushing ? "Pause Session" : "Start Hygiene Timer"}
            >
              {isBrushing ? (
                <Pause className="w-6 h-6 fill-slate-950" />
              ) : (
                <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleResetSession}
              className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4. 6-ZONE QUADRANT PROGRESS MAP WITH INSTANT MILESTONE JUMP */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span className="uppercase tracking-wider">6-Zone Sextant Progression</span>
            <span className="text-cyan-400 font-mono font-bold">
              Zone {currentZoneIdx + 1} of {activeTechnique.zoneScripts.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {activeTechnique.zoneScripts.map((z, idx) => {
              const isActive = idx === currentZoneIdx;
              const isPast = idx < currentZoneIdx;
              return (
                <button
                  key={z.zoneIndex}
                  onClick={() => handleSelectZone(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/40 font-black scale-105 shadow-lg shadow-cyan-500/20"
                      : isPast
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 font-semibold hover:border-slate-600"
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400">
                    {z.startTimeSeconds}s Milestone
                  </div>
                  <div className="text-xs font-extrabold mt-0.5 truncate">{z.title}</div>
                  {isActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SPOKEN ZONE SCRIPT & CLINICAL TIP CARD */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-5 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-black text-sm">
              Z{currentZoneIdx + 1}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                Spoken Guidance • {activeZoneScript.startTimeSeconds}s Milestone
              </span>
              <h2 className="text-lg md:text-xl font-extrabold text-white">
                {activeZoneScript.title}
              </h2>
            </div>
          </div>

          {/* Manual Prev/Next Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevZone}
              disabled={currentZoneIdx === 0}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                currentZoneIdx === 0
                  ? "opacity-30 cursor-not-allowed bg-slate-800 border-slate-700"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
              }`}
              title="Previous Zone"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-400 px-1">
              {currentZoneIdx + 1}/{activeTechnique.zoneScripts.length}
            </span>

            <button
              onClick={handleNextZone}
              disabled={currentZoneIdx === activeTechnique.zoneScripts.length - 1}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                currentZoneIdx === activeTechnique.zoneScripts.length - 1
                  ? "opacity-30 cursor-not-allowed bg-slate-800 border-slate-700"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
              }`}
              title="Next Zone"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
            "{activeZoneScript.script}"
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-cyan-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold">Clinical Instruction: {activeZoneScript.clinicalTip}</span>
          </div>
        </div>
      </div>

      {/* SMILE SNAPSHOT MODAL */}
      {showSnapshotModal && snapshotDataUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-white">Smile Photo Captured! 📸</h3>
              <p className="text-xs text-slate-400 mt-1">Saved to your Smile Gallery.</p>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-md max-h-56">
              <img src={snapshotDataUrl} alt="Smile Snapshot" className="w-full h-full object-cover" />
            </div>

            <button
              onClick={() => setShowSnapshotModal(false)}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Done & Resume Session
            </button>
          </div>
        </div>
      )}

      {/* SESSION COMPLETION MODAL */}
      {sessionCompleted && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="font-extrabold text-2xl text-white">Brushing Session Complete! 🎉</h2>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Awesome work! You completed your session using the <span className="text-cyan-300 font-bold">{activeTechnique.name}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 text-left text-xs text-slate-300 space-y-1">
              <span className="font-bold text-cyan-400 block uppercase">Post-Brushing Instructions:</span>
              <p>{activeTechnique.finishScript}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex justify-around items-center">
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Clean Sessions</span>
                <span className="text-lg font-black text-emerald-400">{cleanSessionsCount}</span>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Unbroken Streak</span>
                <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>{streakCount} Days</span>
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResetSession}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-all cursor-pointer"
              >
                Brush Again
              </button>
              <button
                onClick={() => {
                  speechCoach.stop();
                  navigate("/dashboard");
                }}
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