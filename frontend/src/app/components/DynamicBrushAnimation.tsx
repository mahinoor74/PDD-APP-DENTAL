import React from "react";
import { MotionType } from "../../data/brushingTechniques";

interface DynamicBrushAnimationProps {
  motionType: MotionType;
  angleDegrees: number;
  activeZoneIndex: number;
  isBrushing: boolean;
  quadrantId: string;
  quadrantName: string;
}

export default function DynamicBrushAnimation({
  motionType,
  angleDegrees,
  activeZoneIndex,
  isBrushing,
  quadrantId,
  quadrantName,
}: DynamicBrushAnimationProps) {
  // Determine coordinate offsets for active zone (Zones 0-5)
  // 0: Upper Right Outer, 1: Upper Front Outer, 2: Upper Left Outer, 3: Lower Left Outer, 4: Lower Front Inner/Outer, 5: Occlusal/Biting Tops
  const zoneCoordinates: Record<number, { x: number; y: number; label: string; angleMod: number }> = {
    0: { x: 75, y: 70, label: "Upper Right Outer", angleMod: angleDegrees },
    1: { x: 150, y: 50, label: "Upper Front Outer", angleMod: angleDegrees * 0.5 },
    2: { x: 225, y: 70, label: "Upper Left Outer", angleMod: -angleDegrees },
    3: { x: 225, y: 170, label: "Lower Left Outer", angleMod: -angleDegrees },
    4: { x: 150, y: 190, label: "Lower Front Inner/Outer", angleMod: angleDegrees * 0.5 },
    5: { x: 150, y: 120, label: "Occlusal / Biting Tops", angleMod: 0 },
  };

  const currentCoords = zoneCoordinates[activeZoneIndex] || zoneCoordinates[0];
  const effectiveAngle = currentCoords.angleMod;

  // Animation class based on motionType
  const getMotionAnimationClass = () => {
    if (!isBrushing) return "";
    switch (motionType) {
      case "vibrate_sweep":
        return "animate-vibrate-sweep";
      case "blanch_roll":
        return "animate-blanch-roll";
      case "reverse_angle_vibrate":
        return "animate-reverse-vibrate";
      case "wide_circles":
        return "animate-wide-circles";
      case "margin_sweep":
        return "animate-margin-sweep";
      case "gum_to_crown_roll":
        return "animate-gum-roll";
      case "tongue_scrape":
        return "animate-tongue-scrape";
      case "c_shape_floss":
        return "animate-c-floss";
      default:
        return "animate-vibrate-sweep";
    }
  };

  const isTongueMode = motionType === "tongue_scrape";
  const isFlossMode = motionType === "c_shape_floss";

  return (
    <div className="relative w-full max-w-lg mx-auto bg-slate-950/80 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col items-center justify-center">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-emerald-500/10 pointer-events-none" />

      {/* Top Status Header */}
      <div className="w-full flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
            Zone {activeZoneIndex + 1}: {quadrantName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300">
            Angle: {angleDegrees}°
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-black text-cyan-300 uppercase">
            {motionType.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div className="relative w-full h-64 flex items-center justify-center z-10">
        <svg
          viewBox="0 0 300 240"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.25)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="gumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>

            <linearGradient id="toothGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient id="brushHandle" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* DENTAL ARCH VIEW (Default Mode) */}
          {!isTongueMode && !isFlossMode && (
            <g id="dental-arch">
              {/* Upper Gum Arch */}
              <path
                d="M 50,90 Q 150,20 250,90 Q 150,45 50,90 Z"
                fill="url(#gumGradient)"
                opacity="0.85"
              />

              {/* Lower Gum Arch */}
              <path
                d="M 50,150 Q 150,220 250,150 Q 150,195 50,150 Z"
                fill="url(#gumGradient)"
                opacity="0.85"
              />

              {/* Active Zone Gum Blanching Pulse Overlay (for Stillman) */}
              {motionType === "blanch_roll" && isBrushing && (
                <ellipse
                  cx={currentCoords.x}
                  cy={currentCoords.y < 120 ? currentCoords.y - 12 : currentCoords.y + 12}
                  rx="22"
                  ry="8"
                  fill="#fecdd3"
                  className="animate-pulse"
                  opacity="0.75"
                />
              )}

              {/* Teeth Rows Upper */}
              {[
                { x: 65, y: 78 },
                { x: 90, y: 64 },
                { x: 118, y: 54 },
                { x: 150, y: 48 },
                { x: 182, y: 54 },
                { x: 210, y: 64 },
                { x: 235, y: 78 },
              ].map((t, idx) => (
                <rect
                  key={`u-tooth-${idx}`}
                  x={t.x - 8}
                  y={t.y - 8}
                  width="16"
                  height="16"
                  rx="5"
                  fill="url(#toothGradient)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              ))}

              {/* Teeth Rows Lower */}
              {[
                { x: 65, y: 162 },
                { x: 90, y: 176 },
                { x: 118, y: 186 },
                { x: 150, y: 192 },
                { x: 182, y: 186 },
                { x: 210, y: 176 },
                { x: 235, y: 162 },
              ].map((t, idx) => (
                <rect
                  key={`l-tooth-${idx}`}
                  x={t.x - 8}
                  y={t.y - 8}
                  width="16"
                  height="16"
                  rx="5"
                  fill="url(#toothGradient)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              ))}

              {/* Orthodontic Brackets & Wires overlay for Charters */}
              {motionType === "reverse_angle_vibrate" && (
                <g id="braces-layer">
                  {/* Upper Wire */}
                  <path
                    d="M 65,78 Q 150,48 235,78"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                  {/* Lower Wire */}
                  <path
                    d="M 65,162 Q 150,192 235,162"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                  {/* Brackets */}
                  {[65, 90, 118, 150, 182, 210, 235].map((bx, bidx) => (
                    <g key={`bracket-group-${bidx}`}>
                      <rect
                        x={bx - 4}
                        y={bidx < 4 ? 74 : 74}
                        width="8"
                        height="8"
                        fill="#e2e8f0"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      <rect
                        x={bx - 4}
                        y={bidx < 4 ? 158 : 158}
                        width="8"
                        height="8"
                        fill="#e2e8f0"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                </g>
              )}

              {/* Active Zone Highlight Box */}
              <circle
                cx={currentCoords.x}
                cy={currentCoords.y}
                r="24"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                filter="url(#glow)"
                className="animate-spin-slow"
              />
            </g>
          )}

          {/* TONGUE CLEANING MODEL MODE */}
          {isTongueMode && (
            <g id="tongue-model">
              {/* Tongue Body */}
              <path
                d="M 90,40 Q 150,20 210,40 Q 220,180 150,220 Q 80,180 90,40 Z"
                fill="url(#tongueGrad)"
                stroke="#be123c"
                strokeWidth="3"
              />
              {/* Tongue Papillae details */}
              <circle cx="150" cy="70" r="3" fill="#fda4af" opacity="0.6" />
              <circle cx="130" cy="100" r="3" fill="#fda4af" opacity="0.6" />
              <circle cx="170" cy="100" r="3" fill="#fda4af" opacity="0.6" />
              <circle cx="150" cy="130" r="3" fill="#fda4af" opacity="0.6" />
              <circle cx="140" cy="160" r="3" fill="#fda4af" opacity="0.6" />
              <circle cx="160" cy="160" r="3" fill="#fda4af" opacity="0.6" />

              {/* Active Zone Highlight line */}
              <line
                x1="100"
                y1={60 + activeZoneIndex * 24}
                x2="200"
                y2={60 + activeZoneIndex * 24}
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="6 4"
                filter="url(#glow)"
              />
            </g>
          )}

          {/* FLOSSING MODEL MODE */}
          {isFlossMode && (
            <g id="floss-model">
              {/* Two Adjacent Teeth */}
              <rect
                x="80"
                y="60"
                width="65"
                height="120"
                rx="15"
                fill="url(#toothGradient)"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              <rect
                x="155"
                y="60"
                width="65"
                height="120"
                rx="15"
                fill="url(#toothGradient)"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              {/* Gum margin between */}
              <path
                d="M 60,60 Q 150,110 240,60 L 240,40 L 60,40 Z"
                fill="url(#gumGradient)"
              />
              {/* Floss C-Shape Curve Animation */}
              <path
                d="M 120,45 C 140,80 142,130 148,150 C 158,130 160,80 180,45"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glow)"
                className={isBrushing ? "animate-pulse" : ""}
              />
            </g>
          )}

          {/* DYNAMIC BRUSH / SCRAPER TOOL HEAD */}
          <g
            transform={`translate(${currentCoords.x}, ${currentCoords.y}) rotate(${effectiveAngle})`}
            className={`transition-transform duration-700 ease-out ${getMotionAnimationClass()}`}
          >
            {!isTongueMode && !isFlossMode && (
              // Standard Toothbrush Head & Bristles
              <g id="toothbrush-head">
                {/* Brush Handle */}
                <rect
                  x="-8"
                  y="12"
                  width="16"
                  height="60"
                  rx="6"
                  fill="url(#brushHandle)"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />
                {/* Brush Head */}
                <rect
                  x="-12"
                  y="-18"
                  width="24"
                  height="32"
                  rx="8"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
                {/* Bristles */}
                <g fill="#06b6d4">
                  <rect x="-8" y="-14" width="4" height="10" rx="1" />
                  <rect x="-2" y="-14" width="4" height="10" rx="1" />
                  <rect x="4" y="-14" width="4" height="10" rx="1" />
                  <rect x="-8" y="-2" width="4" height="10" rx="1" />
                  <rect x="-2" y="-2" width="4" height="10" rx="1" />
                  <rect x="4" y="-2" width="4" height="10" rx="1" />
                </g>
                {/* Motion Vector Arrows */}
                <path
                  d="M 0,-24 L 0,-34 M -5,-30 L 0,-35 L 5,-30"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {isTongueMode && (
              // Tongue Scraper Tool Head
              <g id="scraper-head">
                <rect
                  x="-6"
                  y="10"
                  width="12"
                  height="60"
                  rx="4"
                  fill="url(#brushHandle)"
                />
                <path
                  d="M -30,-10 C -30,-30 30,-30 30,-10"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
            )}

            {isFlossMode && (
              // Interdental Floss Wand Head
              <g id="floss-wand">
                <path
                  d="M -15,10 L -15,-15 C -15,-30 15,-30 15,-15 L 15,10"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                />
                <line
                  x1="-15"
                  y1="-10"
                  x2="15"
                  y2="-10"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Bottom Clinical Angle & Technique Description Footer */}
      <div className="w-full mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400 font-bold">Clinical Angle:</span>
          <span>{angleDegrees}° Sulcular/Prosthetic Alignment</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-emerald-300 font-bold">150g Optimal Pressure</span>
        </div>
      </div>

      {/* Embedded Dynamic Animation CSS Keyframes */}
      <style>{`
        @keyframes vibrateSweep {
          0%, 100% { transform: translate(0px, 0px) rotate(${effectiveAngle}deg); }
          25% { transform: translate(-3px, 1px) rotate(${effectiveAngle - 2}deg); }
          50% { transform: translate(3px, -1px) rotate(${effectiveAngle + 2}deg); }
          75% { transform: translate(0px, -12px) rotate(${effectiveAngle}deg); }
        }
        @keyframes blanchRoll {
          0%, 100% { transform: translate(0px, 0px) rotate(${effectiveAngle}deg); }
          30% { transform: translate(0px, 4px) scale(0.95) rotate(${effectiveAngle}deg); }
          70% { transform: translate(0px, -16px) rotate(${effectiveAngle + 15}deg); }
        }
        @keyframes reverseVibrate {
          0%, 100% { transform: translate(0px, 0px) rotate(${effectiveAngle}deg); }
          20% { transform: translate(-4px, -2px) rotate(${effectiveAngle}deg); }
          40% { transform: translate(4px, 2px) rotate(${effectiveAngle}deg); }
          60% { transform: translate(-2px, 4px) rotate(${effectiveAngle}deg); }
          80% { transform: translate(2px, -4px) rotate(${effectiveAngle}deg); }
        }
        @keyframes wideCircles {
          0% { transform: translate(0px, 0px) rotate(${effectiveAngle}deg); }
          25% { transform: translate(12px, -12px) rotate(${effectiveAngle}deg); }
          50% { transform: translate(0px, -24px) rotate(${effectiveAngle}deg); }
          75% { transform: translate(-12px, -12px) rotate(${effectiveAngle}deg); }
          100% { transform: translate(0px, 0px) rotate(${effectiveAngle}deg); }
        }
        @keyframes marginSweep {
          0%, 100% { transform: translate(-10px, 0px) rotate(${effectiveAngle}deg); }
          50% { transform: translate(10px, 0px) rotate(${effectiveAngle}deg); }
        }
        @keyframes gumRoll {
          0% { transform: translate(0px, 10px) rotate(${effectiveAngle - 10}deg); }
          100% { transform: translate(0px, -15px) rotate(${effectiveAngle + 20}deg); }
        }
        @keyframes tongueScrape {
          0% { transform: translate(0px, -40px) rotate(0deg); }
          100% { transform: translate(0px, 40px) rotate(0deg); }
        }
        @keyframes cFloss {
          0%, 100% { transform: translate(-5px, -20px) rotate(0deg); }
          50% { transform: translate(5px, 20px) rotate(0deg); }
        }

        .animate-vibrate-sweep { animation: vibrateSweep 1.8s infinite linear; }
        .animate-blanch-roll { animation: blanchRoll 2.2s infinite ease-in-out; }
        .animate-reverse-vibrate { animation: reverseVibrate 1.2s infinite ease-in-out; }
        .animate-wide-circles { animation: wideCircles 2.5s infinite linear; }
        .animate-margin-sweep { animation: marginSweep 1.5s infinite ease-in-out; }
        .animate-gum-roll { animation: gumRoll 2s infinite ease-in-out; }
        .animate-tongue-scrape { animation: tongueScrape 2.5s infinite ease-in-out; }
        .animate-c-floss { animation: cFloss 2s infinite ease-in-out; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
}
