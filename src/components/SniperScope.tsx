import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye, Crosshair, Sparkles } from 'lucide-react';

interface TargetPoint {
  id: string;
  x: number;
  y: number;
  title: string;
  desc: string;
  tag: string;
  icon: string;
  found: boolean;
}

export const SniperScope: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reticleOffset, setReticleOffset] = useState({ x: 0, y: 0 });
  const [lockedTarget, setLockedTarget] = useState<TargetPoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'8x' | '15x'>('8x');
  const animFrameRef = useRef<number | null>(null);

  const targetsRef = useRef<TargetPoint[]>([
    {
      id: 'redbull_crate',
      x: -75,
      y: -35,
      title: 'Airdrop Supply Crate',
      desc: 'Chilled Red Bull cans and .50 BMG AMR ammo stacked high for your next clutch match.',
      tag: 'LOGISTICS ✦',
      icon: '📦',
      found: false,
    },
    {
      id: 'birthday_beacon',
      x: 75,
      y: -45,
      title: 'Nov 8 Birthday Beacon',
      desc: 'Golden fireworks lighting up the ridge: "Happy Birthday to our squad MVP".',
      tag: 'CELEBRATION ✦',
      icon: '🎆',
      found: false,
    },
    {
      id: 'spotter_heart',
      x: 20,
      y: 50,
      title: 'Spotter Lock: My Favorite Teammate',
      desc: 'Range: 506 km (Coimbatore to Chennai). Elevation: 0. Wind: Calm. Outcome: Forever my number one teammate across Tamil Nadu.',
      tag: 'TARGET SECURED ✦',
      icon: '💖',
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

  // Aim towards a specific target with smooth snap
  const aimAtTarget = useCallback((tgt: TargetPoint) => {
    setReticleOffset({ x: tgt.x, y: tgt.y });
    setLockedTarget(tgt);
    if (!tgt.found) {
      tgt.found = true;
      playTargetLockChirp();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([25, 45]);
        } catch {
          // fallback
        }
      }
    }
  }, [playTargetLockChirp]);

  // Dragging to steer the scope reticle
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    isDraggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const checkLockAtOffset = useCallback((x: number, y: number) => {
    let lock: TargetPoint | null = null;
    targetsRef.current.forEach((tgt) => {
      const dist = Math.hypot(tgt.x - x, tgt.y - y);
      // Generous lock radius for mobile fingers
      if (dist < 38) {
        lock = tgt;
        if (!tgt.found) {
          tgt.found = true;
          playTargetLockChirp();
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate([20, 40]);
            } catch {
              // fallback
            }
          }
        }
      }
    });
    setLockedTarget(lock);
  }, [playTargetLockChirp]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !lastPointerRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    setReticleOffset((prev) => {
      let nextX = Math.max(-120, Math.min(120, prev.x + dx));
      let nextY = Math.max(-90, Math.min(90, prev.y + dy));

      // Magnetic snap-assist: if close to any target, gently pull into bullseye
      targetsRef.current.forEach((tgt) => {
        const dist = Math.hypot(tgt.x - nextX, tgt.y - nextY);
        if (dist < 26) {
          // Magnetic pull
          nextX = tgt.x;
          nextY = tgt.y;
        }
      });

      checkLockAtOffset(nextX, nextY);
      return { x: nextX, y: nextY };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    isDraggingRef.current = false;
    lastPointerRef.current = null;
  };

  // Canvas Scope Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      // 1. Distant battlefield terrain under night stars
      // When reticle offset increases, terrain shifts opposite so center moves towards target
      ctx.save();
      ctx.translate(-reticleOffset.x, -reticleOffset.y);

      // Night sky gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#080B18');
      bg.addColorStop(0.6, '#111827');
      bg.addColorStop(1, '#064E3B');
      ctx.fillStyle = bg;
      ctx.fillRect(-200, -200, w + 400, h + 400);

      // Distant rolling hills
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      ctx.moveTo(-200, cy + 30);
      ctx.bezierCurveTo(cx - 60, cy - 20, cx + 80, cy + 40, w + 200, cy + 10);
      ctx.lineTo(w + 200, h + 200);
      ctx.lineTo(-200, h + 200);
      ctx.closePath();
      ctx.fill();

      // Foreground ridge line
      ctx.fillStyle = '#042F2E';
      ctx.beginPath();
      ctx.moveTo(-200, cy + 60);
      ctx.bezierCurveTo(cx - 40, cy + 45, cx + 60, cy + 70, w + 200, cy + 50);
      ctx.lineTo(w + 200, h + 200);
      ctx.lineTo(-200, h + 200);
      ctx.closePath();
      ctx.fill();

      // Draw all target beacons on terrain
      targetsRef.current.forEach((tgt) => {
        const tx = cx + tgt.x;
        const ty = cy + tgt.y;

        const isCurrentlyLocked = lockedTarget?.id === tgt.id;

        // Glowing ping beacon
        ctx.beginPath();
        ctx.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentlyLocked ? '#EF4444' : tgt.found ? '#F59E0B' : '#60A5FA';
        ctx.shadowColor = isCurrentlyLocked ? '#EF4444' : tgt.found ? '#F59E0B' : '#3B82F6';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Radiating radar ripple
        const rip = (time * 8) % 20;
        ctx.beginPath();
        ctx.arc(tx, ty, 9 + rip, 0, Math.PI * 2);
        ctx.strokeStyle = isCurrentlyLocked
          ? `rgba(239, 68, 68, ${Math.max(0, 0.7 - rip / 20)})`
          : tgt.found
          ? `rgba(245, 158, 11, ${Math.max(0, 0.6 - rip / 20)})`
          : `rgba(96, 165, 250, ${Math.max(0, 0.6 - rip / 20)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Target Label Banner
        ctx.font = '10px monospace';
        ctx.fillStyle = isCurrentlyLocked ? '#FCA5A5' : '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.fillText(tgt.icon + ' ' + tgt.title.split(':')[0], tx, ty - 14);

        // Tactical Locking Brackets when locked
        if (isCurrentlyLocked) {
          const bSize = 16;
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;

          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(tx - bSize, ty - bSize + 6);
          ctx.lineTo(tx - bSize, ty - bSize);
          ctx.lineTo(tx - bSize + 6, ty - bSize);
          // Top-right corner
          ctx.moveTo(tx + bSize - 6, ty - bSize);
          ctx.lineTo(tx + bSize, ty - bSize);
          ctx.lineTo(tx + bSize, ty - bSize + 6);
          // Bottom-left corner
          ctx.moveTo(tx - bSize, ty + bSize - 6);
          ctx.lineTo(tx - bSize, ty + bSize);
          ctx.lineTo(tx - bSize + 6, ty + bSize);
          // Bottom-right corner
          ctx.moveTo(tx + bSize - 6, ty + bSize);
          ctx.lineTo(tx + bSize, ty + bSize);
          ctx.lineTo(tx + bSize, ty + bSize - 6);
          ctx.stroke();
        }
      });

      ctx.restore();

      // 2. Optical Scope Outer Vignette & Lens Bezel
      const radius = Math.min(w, h) * 0.44;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Metallic scope bezel ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = lockedTarget ? 'rgba(239, 68, 68, 0.6)' : 'rgba(216, 204, 255, 0.28)';
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
      ctx.lineWidth = 1.3;

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
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = lockedTarget ? '#EF4444' : '#10B981';
      ctx.fill();

      // Mil-dots / Subtensions
      for (let i = 1; i <= 4; i++) {
        const step = i * 22;
        ctx.beginPath();
        ctx.moveTo(cx - step, cy - 3);
        ctx.lineTo(cx - step, cy + 3);
        ctx.moveTo(cx + step, cy - 3);
        ctx.lineTo(cx + step, cy + 3);
        ctx.moveTo(cx - 3, cy - step);
        ctx.lineTo(cx + 3, cy - step);
        ctx.moveTo(cx - 3, cy + step);
        ctx.lineTo(cx + 3, cy + step);
        ctx.stroke();
      }

      // Rangefinder stadia bracket at bottom
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 85);
      ctx.lineTo(cx + 40, cy + 85);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = lockedTarget ? '#F87171' : '#34D399';
      ctx.textAlign = 'center';
      ctx.fillText(lockedTarget ? '✦ TARGET LOCKED ✦' : 'AMR .50 BMG • 8X OPTICAL', cx, cy - radius + 35);
      ctx.fillText(
        lockedTarget
          ? (lockedTarget.id === 'spotter_heart' ? 'RANGE: 506 KM • KOVAI ⇄ CHENNAI' : 'ELEVATION: 0 • RANGE: 506 KM')
          : 'SCANNING RIDGE...',
        cx,
        cy + 100
      );

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [reticleOffset, lockedTarget]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.9rem',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
      }}
    >
      {/* Scope Touch Display */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000000',
          border: lockedTarget ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1.5px solid rgba(216, 204, 255, 0.25)',
          boxShadow: lockedTarget ? '0 0 25px rgba(239, 68, 68, 0.35)' : '0 12px 35px rgba(0, 0, 0, 0.7)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
            top: '10px',
            left: '10px',
            fontSize: '0.66rem',
            fontFamily: 'monospace',
            color: lockedTarget ? '#F87171' : '#34D399',
            background: 'rgba(0, 0, 0, 0.78)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            border: lockedTarget ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
            pointerEvents: 'none',
          }}
        >
          {lockedTarget ? '🎯 LOCKED' : 'DRAG TO SCAN'}
        </div>

        {/* Top-Right Zoom Toggle */}
        <button
          type="button"
          onClick={() => setZoomLevel(zoomLevel === '8x' ? '15x' : '8x')}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '0.66rem',
            fontFamily: 'monospace',
            color: '#FDE68A',
            background: 'rgba(0, 0, 0, 0.78)',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(253, 230, 138, 0.35)',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          ZOOM: {zoomLevel}
        </button>
      </div>

      {/* Quick Tactical Lock Buttons (Guarantees effortless mobile aiming) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem',
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--color-muted)',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Crosshair size={12} color="var(--color-lavender)" />
          <span>DRAG SCOPE OR TAP TARGET TO LOCK:</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.4rem',
            width: '100%',
            maxWidth: '360px',
          }}
        >
          {targetsRef.current.map((tgt) => {
            const isSelected = lockedTarget?.id === tgt.id;
            return (
              <button
                key={tgt.id}
                type="button"
                onClick={() => aimAtTarget(tgt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.3rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected
                    ? 'rgba(239, 68, 68, 0.25)'
                    : tgt.found
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: isSelected
                    ? '1px solid rgba(239, 68, 68, 0.7)'
                    : tgt.found
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#FCA5A5' : tgt.found ? '#FDE68A' : 'var(--color-ivory)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tgt.icon}</span>
                <span>{tgt.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Discovery Info Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          padding: '1rem 1.15rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(14, 18, 36, 0.75)',
          border: lockedTarget ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(216, 204, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          minHeight: '90px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {lockedTarget ? (
            <motion.div
              key={lockedTarget.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#EF4444',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                <Target size={14} />
                <span>{lockedTarget.tag} {lockedTarget.title}</span>
              </div>

              {lockedTarget.id === 'spotter_heart' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.4rem' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '62px',
                      height: '62px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #EF4444',
                      boxShadow: '0 0 16px rgba(239, 68, 68, 0.55)',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/memories/1792580021104.jpg"
                      alt="Spotter Lock: Bot"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <p
                    style={{
                      color: 'var(--color-ivory)',
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {lockedTarget.desc}
                  </p>
                </div>
              ) : lockedTarget.id === 'redbull_crate' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.4rem' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '58px',
                      height: '58px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1.5px solid #38BDF8',
                      boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/images/redbull-bot-can.jpg"
                      alt="Airdrop Supply"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <p
                    style={{
                      color: 'var(--color-ivory)',
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {lockedTarget.desc}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <Sparkles size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
                  <p
                    style={{
                      color: 'var(--color-ivory)',
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {lockedTarget.desc}
                  </p>
                </div>
              )}
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
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  marginBottom: '0.3rem',
                }}
              >
                <Eye size={14} />
                <span>The Spotter’s Eyes</span>
              </div>
              <p
                style={{
                  color: 'var(--color-ivory-dim)',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                Drag the crosshair across the ridge or tap a target button above. When you get close, the magnetic reticle locks on automatically.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
