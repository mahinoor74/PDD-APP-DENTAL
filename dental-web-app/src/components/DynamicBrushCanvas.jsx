import React, { useEffect, useRef } from 'react';

export const DynamicBrushCanvas = ({
  currentZoneIdx = 0,
  motionType = 'vibrate_sweep',
  angleDegrees = 45,
  isRunning = false,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      step += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Clean Light Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw Arch Grid / Contours
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, width * 0.38, height * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Quadrant labels
      const zones = [
        { label: 'UR (Upper Right)', x: width * 0.72, y: height * 0.28, id: 0 },
        { label: 'UF (Upper Front)', x: width * 0.5, y: height * 0.18, id: 1 },
        { label: 'UL (Upper Left)', x: width * 0.28, y: height * 0.28, id: 2 },
        { label: 'LL (Lower Left)', x: width * 0.28, y: height * 0.72, id: 3 },
        { label: 'LF (Lower Front)', x: width * 0.5, y: height * 0.82, id: 4 },
        { label: 'OC (Chewing Tops)', x: width * 0.72, y: height * 0.72, id: 5 },
      ];

      zones.forEach((z) => {
        const isCurrent = z.id === currentZoneIdx;
        ctx.fillStyle = isCurrent ? '#0d9488' : '#64748b';
        ctx.font = isCurrent ? 'bold 12px Inter' : '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(z.label, z.x, z.y);

        // Draw zone node
        ctx.beginPath();
        ctx.arc(z.x, z.y + 12, isCurrent ? 8 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? '#0d9488' : '#cbd5e1';
        ctx.fill();
        if (isCurrent) {
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      });

      // Active zone animation
      const activeZone = zones[currentZoneIdx] || zones[0];
      let offsetX = 0;
      let offsetY = 0;

      if (isRunning) {
        if (motionType === 'wide_circles') {
          offsetX = Math.cos(step * 3) * 14;
          offsetY = Math.sin(step * 3) * 14;
        } else if (motionType === 'vibrate_sweep') {
          offsetX = Math.sin(step * 10) * 8;
          offsetY = Math.cos(step * 2) * 5;
        } else {
          offsetX = Math.sin(step * 4) * 10;
          offsetY = Math.sin(step * 4) * 6;
        }
      }

      const brushX = activeZone.x + offsetX;
      const brushY = activeZone.y + 12 + offsetY;

      // Draw Animated Toothbrush Icon & Direction Arrow
      ctx.save();
      ctx.translate(brushX, brushY);
      ctx.rotate((angleDegrees * Math.PI) / 180);

      // Handle
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(-6, 0, 12, 32);

      // Bristles
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-8, -12, 16, 12);

      ctx.restore();

      if (isRunning) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [currentZoneIdx, motionType, angleDegrees, isRunning]);

  return (
    <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-teal-100 bg-white shadow-sm">
      <canvas
        ref={canvasRef}
        width={400}
        height={220}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-3 text-[11px] font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-bold">
        ANG: {angleDegrees}° | MOTION: {motionType.toUpperCase()}
      </div>
    </div>
  );
};
