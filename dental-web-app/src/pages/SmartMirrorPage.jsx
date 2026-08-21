import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CameraOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  CheckCircle2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { CLINICAL_TECHNIQUES, getTechniqueById } from '../data/clinicalTechniques';
import { speechCoach } from '../utils/speechCoach';
import { soundManager } from '../utils/audioUtils';
import { DynamicBrushCanvas } from '../components/DynamicBrushCanvas';
import { apiService } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Toast } from '../components/Toast';

export const SmartMirrorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const [selectedTechniqueId, setSelectedTechniqueId] = useState('modified_bass');
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const activeTechnique = getTechniqueById(selectedTechniqueId);

  // Zone Index Calculation: 6 zones x 20 seconds = 120s
  const elapsed = 120 - secondsRemaining;
  const currentZoneIdx = Math.min(5, Math.floor(elapsed / 20));
  const activeZoneScript = activeTechnique.zoneScripts[currentZoneIdx] || activeTechnique.zoneScripts[0];

  // Webcam Start/Stop
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setCameraActive(true);
    } catch (err) {
      console.warn("Webcam access error:", err);
      setToastMessage({ message: 'Webcam not available or permission denied.', type: 'info' });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      speechCoach.stop();
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      soundManager.playCompletionFanfare();
      speechCoach.speak(activeTechnique.finishScript);
      setShowCompletionModal(true);

      if (user?.id) {
        apiService.recordSession({
          userId: user.id,
          technique: activeTechnique.name,
          duration: 120,
        }).catch((e) => console.warn("Session save error:", e));
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  // TTS & Chime Triggers on Zone Transition
  useEffect(() => {
    if (isRunning && elapsed > 0 && elapsed % 20 === 0 && secondsRemaining > 0) {
      soundManager.playZoneChime();
      if (!isMuted) {
        speechCoach.speak(activeZoneScript.script);
      }
    }
  }, [elapsed, isRunning]);

  const handleStartPause = () => {
    if (!isRunning && secondsRemaining === 120) {
      if (!isMuted) {
        speechCoach.speak(activeTechnique.prepScript);
      }
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(120);
    speechCoach.stop();
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    speechCoach.setMuted(nextMute);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.min(100, Math.max(0, ((120 - secondsRemaining) / 120) * 100));

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Top Floating Header Bar */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{t('mirror_title')}</span>
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-400/40 shadow-sm">
                {t('mirror_tag')}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {t('mirror_desc')}
            </p>
          </div>
        </div>

        {/* Technique Dropdown Selector */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full sm:w-72 px-4.5 py-3 rounded-2xl bg-slate-800/90 border border-indigo-500/40 text-indigo-300 font-black text-xs flex items-center justify-between shadow-lg hover:border-indigo-400 cursor-pointer"
          >
            <span className="truncate">{activeTechnique.name}</span>
            <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-full sm:w-80 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl z-50 overflow-hidden py-1.5 backdrop-blur-2xl">
              {CLINICAL_TECHNIQUES.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => {
                    setSelectedTechniqueId(tech.id);
                    setShowDropdown(false);
                    handleReset();
                  }}
                  className={`w-full text-left px-4 py-3 text-xs transition cursor-pointer flex items-center justify-between ${
                    tech.id === selectedTechniqueId
                      ? 'bg-indigo-500/20 text-indigo-300 font-black'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold">{tech.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{tech.category}</div>
                  </div>
                  {tech.id === selectedTechniqueId && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Webcam Stream & Zone Motion Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Camera Container */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-white relative w-full aspect-video overflow-hidden group">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100 rounded-2xl"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950 text-white rounded-2xl">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                  <CameraOff className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">
                  {t('mirror_camera_paused')}
                </p>
                <button
                  onClick={startCamera}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all cursor-pointer text-xs"
                >
                  {t('mirror_btn_camera')}
                </button>
              </div>
            )}

            {/* Overlays on Webcam Stream */}
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-slate-950/85 border border-indigo-500/50 backdrop-blur-md text-xs font-mono font-black text-indigo-300 flex items-center gap-2 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              <button
                onClick={toggleMute}
                className="pointer-events-auto p-3 rounded-full bg-slate-950/85 border border-indigo-500/50 text-white hover:text-indigo-300 transition cursor-pointer shadow-lg"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

            {/* Progress Bar along bottom of camera container */}
            <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-slate-950">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Timer Controls Bar */}
          <div className="flex items-center justify-center gap-4 bg-slate-900/90 p-4 rounded-3xl border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
            <button
              onClick={handleStartPause}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 transition transform hover:scale-105 cursor-pointer ${
                isRunning
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white shadow-indigo-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-white" />}
              <span>{isRunning ? t('mirror_btn_pause') : t('mirror_btn_start')}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Quadrant Map & Zone Script Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upper Quadrant Map Card */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <DynamicBrushCanvas
              currentZoneIdx={currentZoneIdx}
              motionType={activeTechnique.motionType}
              angleDegrees={activeTechnique.angleDegrees}
              isRunning={isRunning}
            />
          </div>

          {/* Zone Script Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/90 to-purple-950/90 border border-indigo-400/40 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-3 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black text-indigo-300 bg-indigo-950/90 px-3 py-1 rounded-full border border-indigo-400/40 uppercase">
                {t('mirror_zone_label')} {currentZoneIdx + 1} {t('mirror_of')} 6 • {activeZoneScript.quadrantName}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {activeZoneScript.startTimeSeconds}s - {activeZoneScript.startTimeSeconds + 20}s
              </span>
            </div>

            <h3 className="text-base font-black text-white">
              {activeZoneScript.title}
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed font-semibold bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 shadow-inner">
              "{activeZoneScript.script}"
            </p>

            <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/60 p-3.5 rounded-2xl border border-indigo-400/30 font-medium">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{t('mirror_tip_label')}: {activeZoneScript.clinicalTip}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-teal-100 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                {t('mirror_modal_title')}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {t('mirror_modal_desc')} {activeTechnique.name}.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Technique:</span>
                <span className="font-extrabold text-teal-700">{activeTechnique.name}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Duration:</span>
                <span className="font-extrabold text-slate-900">120 seconds (100%)</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Compliance:</span>
                <span className="font-extrabold text-emerald-600">Perfect Score ✓</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCompletionModal(false);
                navigate('/dashboard');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-sm shadow-md"
            >
              {t('btn_return_dashboard')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
