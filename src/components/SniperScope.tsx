import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye } from 'lucide-react';

interface TargetPoint {
  id: string;
  x: number;
  y: number;
  title: string;
  desc: string;
  tag: string;
  found: boolean;
}

export const SniperScope: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reticleOffset, setReticleOffset] = useState({ x: 0, y: 0 });
  const [lockedTarget, setLockedTarget] = useState<TargetPoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'8x' | '15x'>('8x');

  const targetsRef = useRef<TargetPoint[]>([
    {
      id: 'redbull_crate',
      x: -70,
      y: -40,
      title: 'Airdrop Supply Rations',
      desc: 'A crate marked with chilled Red Bull cans and .50 BMG AMR ammo for Bot.',
      tag: 'LOGISTICS ✦',
      found: false,
    },
    {
      id: 'birthday_beacon',
      x: 80,
      y: -60,
      title: 'Nov 8 Birthday Beacon',
      desc: 'Golden fireworks lighting up the ridge: "Happy Birthday to our squad MVP".',
      tag: 'CELEBRATION ✦',
      found: false,
    },
    {
      id: 'spotter_heart',
      x: 30,
      y: 65,
      title: 'Spotter Lock: My Favorite Teammate',
      desc: 'Range: 350m. Elevation: 0. Wind: Calm. Outcome: Forever my number one.',
      tag: 'TARGET SECURED ✦',
      found: false,
    },
  ]);

  // Optical scope acoustic lock chirp
  const playTargetLockChirp = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(1900, now + 0.06);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Safe fallback
    }
  }, []);

  // Dragging to steer the scope reticle
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !lastPointerRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    setReticleOffset((prev) => {
      const nextX = Math.max(-130, Math.min(130, prev.x + dx * 0.8));
      const nextY = Math.max(-100, Math.min(100, prev.y + dy * 0.8));

      // Check proximity to any target point
      let currentLock: TargetPoint | null = null;
      targetsRef.current.forEach((tgt) => {
        const dist = Math.hypot(tgt.x - nextX, tgt.y - nextY);
        if (dist < 28) {
          currentLock = tgt;
          if (!tgt.found) {
            tgt.found = true;
            playTargetLockChirp();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([20, 40]);
              } catch {
                // Safe fallback
              }
            }
          }
        }
      });

      setLockedTarget(currentLock);
      return { x: nextX, y: nextY };
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    lastPointerRef.current = null;
  };

  // Canvas Scope Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.02;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // 1. Distant battlefield terrain under night stars (shifted by scope offset)
      ctx.save();
      ctx.translate(reticleOffset.x * 0.5, reticleOffset.y * 0.5);

      // Night sky gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#080B18');
      bg.addColorStop(0.6, '#111827');
      bg.addColorStop(1, '#064E3B');
      ctx.fillStyle = bg;
      ctx.fillRect(-150, -150, w + 300, h + 300);

      // Distant rolling hills
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      ctx.moveTo(-150, cy + 30);
      ctx.bezierCurveTo(cx - 60, cy - 20, cx + 80, cy + 40, w + 150, cy + 10);
      ctx.lineTo(w + 150, h + 150);
      ctx.lineTo(-150, h + 150);
      ctx.closePath();
      ctx.fill();

      // Draw targets on terrain
      targetsRef.current.forEach((tgt) => {
        const tx = cx + tgt.x;
        const ty = cy + tgt.y;

        // Glowing ping beacon
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fillStyle = tgt.found ? '#F59E0B' : '#60A5FA';
        ctx.shadowColor = tgt.found ? '#F59E0B' : '#3B82F6';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Radiating ripple
        const rip = (time * 8) % 18;
        ctx.beginPath();
        ctx.arc(tx, ty, 8 + rip, 0, Math.PI * 2);
        ctx.strokeStyle = tgt.found
          ? `rgba(245, 158, 11, ${Math.max(0, 0.6 - rip / 18)})`
          : `rgba(96, 165, 250, ${Math.max(0, 0.6 - rip / 18)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.restore();

      // 2. Optical Scope Outer Vignette & Black Lens Bezel
      const radius = Math.min(w, h) * 0.44;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Brass/metallic scope bezel ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(216, 204, 255, 0.28)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Lens glare reflection
      const glare = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      glare.addColorStop(0, 'rgba(96, 165, 250, 0.08)');
      glare.addColorStop(0.5, 'transparent');
      glare.addColorStop(1, 'rgba(167, 139, 250, 0.05)');
      ctx.fillStyle = glare;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Tactical 8x AMR Reticle
      ctx.strokeStyle = lockedTarget ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.85)';
      ctx.lineWidth = 1.2;

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius + 15, cy);
      ctx.lineTo(cx - 15, cy);
      ctx.moveTo(cx + 15, cy);
      ctx.lineTo(cx + radius - 15, cy);

      ctx.moveTo(cx, cy - radius + 15);
      ctx.lineTo(cx, cy - 15);
      ctx.moveTo(cx, cy + 15);
      ctx.lineTo(cx, cy + radius - 15);
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = lockedTarget ? '#EF4444' : '#10B981';
      ctx.fill();

      // Mil-dots / Subtensions
      for (let i = 1; i <= 4; i++) {
        const step = i * 22;
        // Horizontal ticks
        ctx.beginPath();
        ctx.moveTo(cx - step, cy - 3);
        ctx.lineTo(cx - step, cy + 3);
        ctx.moveTo(cx + step, cy - 3);
        ctx.lineTo(cx + step, cy + 3);
        // Vertical ticks
        ctx.moveTo(cx - 3, cy - step);
        ctx.lineTo(cx + 3, cy - step);
        ctx.moveTo(cx - 3, cy + step);
        ctx.lineTo(cx + 3, cy + step);
        ctx.stroke();
      }

      // Rangefinder stadia bracket at bottom
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 90);
      ctx.lineTo(cx + 40, cy + 90);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = lockedTarget ? '#F87171' : '#34D399';
      ctx.textAlign = 'center';
      ctx.fillText('AMR .50 BMG • 8X OPTICAL', cx, cy - radius + 35);
      ctx.fillText('RANGE: 350M', cx, cy + 105);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reticleOffset, lockedTarget]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* Scope Touch Display */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000000',
          border: '1.5px solid rgba(216, 204, 255, 0.25)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Top-Left Drag Hint */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: '#34D399',
            background: 'rgba(0, 0, 0, 0.75)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            pointerEvents: 'none',
          }}
        >
          DRAG SCOPE TO SCAN RIDGE
        </div>

        {/* Top-Right Zoom Toggle */}
        <button
          type="button"
          onClick={() => setZoomLevel(zoomLevel === '8x' ? '15x' : '8x')}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: '#FDE68A',
            background: 'rgba(0, 0, 0, 0.75)',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(253, 230, 138, 0.35)',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          MAGNIFY: {zoomLevel}
        </button>
      </div>

      {/* Target Discovery Info Card */}
      <div
        style={{
          width: '100%',
          padding: '1.1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(14, 18, 36, 0.72)',
          border: '1px solid rgba(216, 204, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          minHeight: '100px',
        }}
      >
        <AnimatePresence mode="wait">
          {lockedTarget ? (
            <motion.div
              key={lockedTarget.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#EF4444',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                <Target size={15} />
                <span>{lockedTarget.tag} {lockedTarget.title}</span>
              </div>
              <p
                style={{
                  color: 'var(--color-ivory)',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                }}
              >
                {lockedTarget.desc}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: 'var(--color-lavender)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  marginBottom: '0.35rem',
                }}
              >
                <Eye size={14} />
                <span>The Spotter’s Eyes</span>
              </div>
              <p
                style={{
                  color: 'var(--color-ivory-dim)',
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                }}
              >
                You always took the high-damage shots with the AMR, while I kept binoculars on enemy rotations. Pan the crosshair across the horizon to find all three locked marks.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
