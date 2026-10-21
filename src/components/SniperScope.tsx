import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Eye, Crosshair, Sparkles, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface TargetPoint {
  id: string;
  x: number;
  y: number;
  buttonLabel: string;
  subLabel: string;
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
  const reticleOffsetRef = useRef({ x: 0, y: 0 });

  // Keep ref in sync for high-frequency render & touch loops
  useEffect(() => {
    reticleOffsetRef.current = reticleOffset;
  }, [reticleOffset]);

  const targetsRef = useRef<TargetPoint[]>([
    {
      id: 'redbull_crate',
      x: -65,
      y: -25,
      buttonLabel: 'Airdrop Crate',
      subLabel: '350m • Ammo',
      title: 'Airdrop Supply Crate',
      desc: 'Chilled Red Bull cans and .50 BMG AMR ammo stacked high for your next clutch match.',
      tag: 'LOGISTICS ✦',
      icon: '📦',
      found: false,
    },
    {
      id: 'birthday_beacon',
      x: 65,
      y: -35,
      buttonLabel: 'Nov 8 Beacon',
      subLabel: 'Ridge • MVP',
      title: 'Nov 8 Birthday Beacon',
      desc: 'Golden fireworks lighting up the ridge: "Happy Birthday to our squad MVP".',
      tag: 'CELEBRATION ✦',
      icon: '🎆',
      found: false,
    },
    {
      id: 'spotter_heart',
      x: 18,
      y: 42,
      buttonLabel: 'Spotter Lock',
      subLabel: '506 km • Kovai',
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
      osc.frequency.setValueAtTime(1920, now + 0.06);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // Safe fallback
    }
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[] = 20) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  }, []);

  // Aim towards a specific target with smooth snap
  const aimAtTarget = useCallback((tgt: TargetPoint) => {
    setReticleOffset({ x: tgt.x, y: tgt.y });
    setLockedTarget(tgt);
    if (!tgt.found) {
      tgt.found = true;
    }
    playTargetLockChirp();
    triggerHaptic([25, 45]);
  }, [playTargetLockChirp, triggerHaptic]);

  // Check lock at a given offset
  const checkLockAtOffset = useCallback((x: number, y: number) => {
    let lock: TargetPoint | null = null;
    targetsRef.current.forEach((tgt) => {
      const dist = Math.hypot(tgt.x - x, tgt.y - y);
      // Generous lock radius for mobile fingers
      if (dist < 40) {
        lock = tgt;
        if (!tgt.found) {
          tgt.found = true;
          playTargetLockChirp();
          triggerHaptic([20, 40]);
        }
      }
    });
    setLockedTarget(lock);
  }, [playTargetLockChirp, triggerHaptic]);

  // Nudge scope in a direction
  const nudgeAim = (dx: number, dy: number) => {
    const cur = reticleOffsetRef.current;
    const nextX = Math.max(-100, Math.min(100, cur.x + dx));
    const nextY = Math.max(-80, Math.min(80, cur.y + dy));
    setReticleOffset({ x: nextX, y: nextY });
    checkLockAtOffset(nextX, nextY);
    triggerHaptic(12);
  };

  // Direct Tap-To-Aim on Scope Canvas
  const handleScopeClickOrTap = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const curOffset = reticleOffsetRef.current;

    // Check if user tapped directly on or near any beacon on screen
    let tappedTarget: TargetPoint | null = null;
    let minDistance = Infinity;

    targetsRef.current.forEach((tgt) => {
      // Screen coordinate of target
      const screenX = cx + tgt.x - curOffset.x;
      const screenY = cy + tgt.y - curOffset.y;
      const dist = Math.hypot(clickX - screenX, clickY - screenY);
      if (dist < 50 && dist < minDistance) {
        minDistance = dist;
        tappedTarget = tgt;
      }
    });

    if (tappedTarget) {
      aimAtTarget(tappedTarget);
      return;
    }

    // Otherwise smoothly pan scope toward clicked point
    const dxOnScreen = clickX - cx;
    const dyOnScreen = clickY - cy;

    const nextX = Math.max(-100, Math.min(100, curOffset.x + dxOnScreen * 0.85));
    const nextY = Math.max(-80, Math.min(80, curOffset.y + dyOnScreen * 0.85));

    setReticleOffset({ x: nextX, y: nextY });
    checkLockAtOffset(nextX, nextY);
    triggerHaptic(15);
  };

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

    const cur = reticleOffsetRef.current;
    let nextX = Math.max(-100, Math.min(100, cur.x + dx));
    let nextY = Math.max(-80, Math.min(80, cur.y + dy));

    // Magnetic snap-assist if close to any target
    targetsRef.current.forEach((tgt) => {
      const dist = Math.hypot(tgt.x - nextX, tgt.y - nextY);
      if (dist < 28) {
        nextX = tgt.x;
        nextY = tgt.y;
      }
    });

    setReticleOffset({ x: nextX, y: nextY });
    checkLockAtOffset(nextX, nextY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current && lastPointerRef.current) {
      const dist = Math.hypot(e.clientX - lastPointerRef.current.x, e.clientY - lastPointerRef.current.y);
      if (dist < 6) {
        // Was a tap!
        handleScopeClickOrTap(e.clientX, e.clientY);
      }
    }
    isDraggingRef.current = false;
    lastPointerRef.current = null;
  };

  // Native touch handlers for 100% mobile WebKit compatibility
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !lastPointerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - lastPointerRef.current.x;
    const dy = touch.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: touch.clientX, y: touch.clientY };

    const cur = reticleOffsetRef.current;
    let nextX = Math.max(-100, Math.min(100, cur.x + dx));
    let nextY = Math.max(-80, Math.min(80, cur.y + dy));

    targetsRef.current.forEach((tgt) => {
      const dist = Math.hypot(tgt.x - nextX, tgt.y - nextY);
      if (dist < 28) {
        nextX = tgt.x;
        nextY = tgt.y;
      }
    });

    setReticleOffset({ x: nextX, y: nextY });
    checkLockAtOffset(nextX, nextY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDraggingRef.current && lastPointerRef.current && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const dist = Math.hypot(touch.clientX - lastPointerRef.current.x, touch.clientY - lastPointerRef.current.y);
      if (dist < 8) {
        handleScopeClickOrTap(touch.clientX, touch.clientY);
      }
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

      const curOffset = reticleOffsetRef.current;

      // 1. Distant battlefield terrain under night stars
      ctx.save();
      ctx.translate(-curOffset.x, -curOffset.y);

      // Night sky gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#080B18');
      bg.addColorStop(0.6, '#111827');
      bg.addColorStop(1, '#064E3B');
      ctx.fillStyle = bg;
      ctx.fillRect(-220, -220, w + 440, h + 440);

      // Distant rolling hills
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      ctx.moveTo(-220, cy + 25);
      ctx.bezierCurveTo(cx - 60, cy - 25, cx + 80, cy + 35, w + 220, cy + 8);
      ctx.lineTo(w + 220, h + 220);
      ctx.lineTo(-220, h + 220);
      ctx.closePath();
      ctx.fill();

      // Foreground ridge line
      ctx.fillStyle = '#042F2E';
      ctx.beginPath();
      ctx.moveTo(-220, cy + 55);
      ctx.bezierCurveTo(cx - 40, cy + 40, cx + 60, cy + 65, w + 220, cy + 45);
      ctx.lineTo(w + 220, h + 220);
      ctx.lineTo(-220, h + 220);
      ctx.closePath();
      ctx.fill();

      // Draw all target beacons on terrain
      targetsRef.current.forEach((tgt) => {
        const tx = cx + tgt.x;
        const ty = cy + tgt.y;

        const isCurrentlyLocked = lockedTarget?.id === tgt.id;

        // Glowing ping beacon
        ctx.beginPath();
        ctx.arc(tx, ty, 8, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentlyLocked ? '#EF4444' : tgt.found ? '#F59E0B' : '#60A5FA';
        ctx.shadowColor = isCurrentlyLocked ? '#EF4444' : tgt.found ? '#F59E0B' : '#3B82F6';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Radiating radar ripple
        const rip = (time * 8) % 20;
        ctx.beginPath();
        ctx.arc(tx, ty, 10 + rip, 0, Math.PI * 2);
        ctx.strokeStyle = isCurrentlyLocked
          ? `rgba(239, 68, 68, ${Math.max(0, 0.75 - rip / 20)})`
          : tgt.found
          ? `rgba(245, 158, 11, ${Math.max(0, 0.65 - rip / 20)})`
          : `rgba(96, 165, 250, ${Math.max(0, 0.65 - rip / 20)})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Target Label Banner
        ctx.font = '10px monospace';
        ctx.fillStyle = isCurrentlyLocked ? '#FCA5A5' : '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.fillText(tgt.icon + ' ' + tgt.buttonLabel, tx, ty - 14);

        // Tactical Locking Brackets when locked
        if (isCurrentlyLocked) {
          const bSize = 18;
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2.2;

          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(tx - bSize, ty - bSize + 7);
          ctx.lineTo(tx - bSize, ty - bSize);
          ctx.lineTo(tx - bSize + 7, ty - bSize);
          // Top-right corner
          ctx.moveTo(tx + bSize - 7, ty - bSize);
          ctx.lineTo(tx + bSize, ty - bSize);
          ctx.lineTo(tx + bSize, ty - bSize + 7);
          // Bottom-left corner
          ctx.moveTo(tx - bSize, ty + bSize - 7);
          ctx.lineTo(tx - bSize, ty + bSize);
          ctx.lineTo(tx - bSize + 7, ty + bSize);
          // Bottom-right corner
          ctx.moveTo(tx + bSize - 7, ty + bSize);
          ctx.lineTo(tx + bSize, ty + bSize);
          ctx.lineTo(tx + bSize, ty + bSize - 7);
          ctx.stroke();
        }
      });

      ctx.restore();

      // 2. Optical Scope Outer Vignette & Lens Bezel
      const radius = Math.min(w, h) * 0.45;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Metallic scope bezel ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = lockedTarget ? 'rgba(239, 68, 68, 0.7)' : 'rgba(216, 204, 255, 0.3)';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Lens glare reflection
      const glare = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      glare.addColorStop(0, 'rgba(96, 165, 250, 0.09)');
      glare.addColorStop(0.5, 'transparent');
      glare.addColorStop(1, 'rgba(167, 139, 250, 0.06)');
      ctx.fillStyle = glare;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Tactical 8x AMR Reticle
      ctx.strokeStyle = lockedTarget ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.85)';
      ctx.lineWidth = 1.3;

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius + 14, cy);
      ctx.lineTo(cx - 14, cy);
      ctx.moveTo(cx + 14, cy);
      ctx.lineTo(cx + radius - 14, cy);

      ctx.moveTo(cx, cy - radius + 14);
      ctx.lineTo(cx - 14, cy);
      ctx.moveTo(cx, cy + 14);
      ctx.lineTo(cx, cy + radius - 14);
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = lockedTarget ? '#EF4444' : '#10B981';
      ctx.fill();

      // Mil-dots / Subtensions
      for (let i = 1; i <= 4; i++) {
        const step = i * 20;
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
      ctx.moveTo(cx - 38, cy + 70);
      ctx.lineTo(cx + 38, cy + 70);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = lockedTarget ? '#F87171' : '#34D399';
      ctx.textAlign = 'center';
      ctx.fillText(lockedTarget ? '✦ TARGET LOCKED ✦' : 'AMR .50 BMG • 8X OPTICAL', cx, cy - radius + 32);
      ctx.fillText(
        lockedTarget
          ? (lockedTarget.id === 'spotter_heart' ? 'RANGE: 506 KM • KOVAI ⇄ CHENNAI' : 'ELEVATION: 0 • RANGE: 350M')
          : 'TAP TARGET OR DRAG TO AIM',
        cx,
        cy + 86
      );

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [lockedTarget]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
      }}
    >
      {/* Scope Touch Display */}
      <div
        style={{
          position: 'relative',
          width: 'min(90vw, 310px)',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000000',
          border: lockedTarget ? '1.5px solid rgba(239, 68, 68, 0.55)' : '1.5px solid rgba(216, 204, 255, 0.25)',
          boxShadow: lockedTarget ? '0 0 25px rgba(239, 68, 68, 0.35)' : '0 12px 35px rgba(0, 0, 0, 0.7)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          cursor: 'crosshair',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Top-Left Drag / Lock Hint */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '0.62rem',
            fontFamily: 'monospace',
            color: lockedTarget ? '#F87171' : '#34D399',
            background: 'rgba(0, 0, 0, 0.82)',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            border: lockedTarget ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
            pointerEvents: 'none',
          }}
        >
          {lockedTarget ? '🎯 LOCKED' : 'TAP OR DRAG'}
        </div>

        {/* Top-Right Zoom Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoomLevel(zoomLevel === '8x' ? '15x' : '8x');
            triggerHaptic(15);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '0.62rem',
            fontFamily: 'monospace',
            color: '#FDE68A',
            background: 'rgba(0, 0, 0, 0.82)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(253, 230, 138, 0.35)',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          ZOOM: {zoomLevel}
        </button>
      </div>

      {/* Directional Nudge Pad (Guarantees effortless mobile aiming) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}
      >
        <button
          type="button"
          onClick={() => nudgeAim(-16, 0)}
          aria-label="Aim Left"
          style={{
            width: '32px',
            height: '30px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--color-ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => nudgeAim(0, -16)}
          aria-label="Aim Up"
          style={{
            width: '32px',
            height: '30px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--color-ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronUp size={16} />
        </button>
        <button
          type="button"
          onClick={() => nudgeAim(0, 16)}
          aria-label="Aim Down"
          style={{
            width: '32px',
            height: '30px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--color-ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          onClick={() => nudgeAim(16, 0)}
          aria-label="Aim Right"
          style={{
            width: '32px',
            height: '30px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--color-ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Quick Tactical Lock Buttons */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <div
          style={{
            fontSize: '0.68rem',
            color: 'var(--color-muted)',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Crosshair size={12} color="var(--color-lavender)" />
          <span>TAP TARGET BUTTON TO LOCK IN:</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.35rem',
            width: '100%',
            maxWidth: '340px',
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
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.15rem',
                  padding: '0.45rem 0.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected
                    ? 'rgba(239, 68, 68, 0.25)'
                    : tgt.found
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected
                    ? '1.5px solid rgba(239, 68, 68, 0.8)'
                    : tgt.found
                    ? '1px solid rgba(245, 158, 11, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isSelected ? '#FCA5A5' : tgt.found ? '#FDE68A' : 'var(--color-ivory)',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 600 }}>
                  <span>{tgt.icon}</span>
                  <span>{tgt.buttonLabel}</span>
                </div>
                <span style={{ fontSize: '0.58rem', color: isSelected ? '#F87171' : 'var(--color-muted)', fontFamily: 'monospace' }}>
                  {tgt.subLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Discovery Info Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(14, 18, 36, 0.78)',
          border: lockedTarget ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(216, 204, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          minHeight: '80px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {lockedTarget ? (
            <motion.div
              key={lockedTarget.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.18 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#EF4444',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginBottom: '0.3rem',
                }}
              >
                <Target size={13} />
                <span>{lockedTarget.tag} {lockedTarget.title}</span>
              </div>

              {lockedTarget.id === 'spotter_heart' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #EF4444',
                      boxShadow: '0 0 14px rgba(239, 68, 68, 0.55)',
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
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {lockedTarget.desc}
                  </p>
                </div>
              ) : lockedTarget.id === 'redbull_crate' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '52px',
                      height: '52px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1.5px solid #38BDF8',
                      boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
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
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {lockedTarget.desc}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.25rem' }}>
                  <Sparkles size={15} color="#F59E0B" style={{ flexShrink: 0 }} />
                  <p
                    style={{
                      color: 'var(--color-ivory)',
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
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
                  gap: '0.4rem',
                  color: 'var(--color-lavender)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  marginBottom: '0.25rem',
                }}
              >
                <Eye size={13} />
                <span>The Spotter’s Eyes</span>
              </div>
              <p
                style={{
                  color: 'var(--color-ivory-dim)',
                  fontSize: '0.76rem',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Tap on any target on the lens, drag across the ridge, or tap a button above. The magnetic reticle locks on automatically.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
