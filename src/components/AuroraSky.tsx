import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Wind, RotateCcw } from 'lucide-react';

interface AuroraPoint {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: number;
  width: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  color: string;
}

interface AmbientStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
}

export const AuroraSky: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [palette, setPalette] = useState<'emerald' | 'amethyst' | 'solar'>('emerald');
  const [paintCount, setPaintCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const pointsRef = useRef<AuroraPoint[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const ambientStarsRef = useRef<AmbientStar[]>([]);
  const lastAudioTimeRef = useRef<number>(0);

  // Audio synthesis: Celestial crystal glass harp chimes tied to touch coordinates
  const playHarpNote = useCallback((normalizedY: number) => {
    const now = performance.now();
    if (now - lastAudioTimeRef.current < 80) return; // throttle audio rate
    lastAudioTimeRef.current = now;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const ctxNow = ctx.currentTime;

      // Pentatonic celestial scale: higher touch = higher crystal pitch
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const index = Math.min(
        scale.length - 1,
        Math.max(0, Math.floor((1 - normalizedY) * scale.length))
      );
      const freq = scale[index];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctxNow);

      gain.gain.setValueAtTime(0.001, ctxNow);
      gain.gain.linearRampToValueAtTime(0.12, ctxNow + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctxNow + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctxNow);
      osc.stop(ctxNow + 1.25);
    } catch {
      // Safe fallback
    }
  }, []);

  const getPaletteColors = useCallback(() => {
    switch (palette) {
      case 'amethyst':
        return {
          baseHue: 280,
          color1: 'rgba(168, 85, 247, ',
          color2: 'rgba(236, 72, 153, ',
          starColor: '#F472B6',
        };
      case 'solar':
        return {
          baseHue: 42,
          color1: 'rgba(245, 158, 11, ',
          color2: 'rgba(253, 230, 138, ',
          starColor: '#FDE68A',
        };
      case 'emerald':
      default:
        return {
          baseHue: 160,
          color1: 'rgba(16, 185, 129, ',
          color2: 'rgba(6, 182, 212, ',
          starColor: '#6EE7B7',
        };
    }
  }, [palette]);

  // Spawn shooting star along swipe vector
  const spawnShootingStar = useCallback((x: number, y: number, vx: number, vy: number) => {
    const { starColor } = getPaletteColors();
    shootingStarsRef.current.push({
      x,
      y,
      vx: vx * 1.5,
      vy: vy * 1.5,
      length: Math.min(70, Math.hypot(vx, vy) * 3 + 20),
      alpha: 1,
      color: starColor,
    });
  }, [getPaletteColors]);

  // Touch & pointer handlers
  const addAuroraPoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      const normY = y / rect.height;
      playHarpNote(normY);

      const { baseHue } = getPaletteColors();
      pointsRef.current.push({
        x,
        y,
        life: 1,
        maxLife: 120 + Math.random() * 40,
        hue: baseHue + (Math.random() - 0.5) * 35,
        width: Math.random() * 50 + 60,
      });

      setPaintCount((prev) => prev + 1);
    },
    [getPaletteColors, playHarpNote]
  );

  const prevTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    prevTouchRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    addAuroraPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    addAuroraPoint(e.clientX, e.clientY);

    // Detect flick/swipe speed for shooting star
    if (prevTouchRef.current) {
      const dx = e.clientX - prevTouchRef.current.x;
      const dy = e.clientY - prevTouchRef.current.y;
      const dt = performance.now() - prevTouchRef.current.time;
      if (dt > 0) {
        const speed = Math.hypot(dx, dy) / dt;
        if (speed > 1.2 && Math.random() > 0.6) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            spawnShootingStar(
              e.clientX - rect.left,
              e.clientY - rect.top,
              (dx / dt) * 8,
              (dy / dt) * 8
            );
          }
        }
      }
    }
    prevTouchRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    prevTouchRef.current = null;
  };

  // Sparkle burst: waves of celestial light across the entire night sky
  const triggerBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 50, 30, 60]);
      } catch {
        // Safe fallback
      }
    }

    const { baseHue, starColor } = getPaletteColors();

    // Wave of aurora ripples
    for (let i = 0; i < 20; i++) {
      const px = (w / 20) * i + Math.random() * 20;
      const py = h * 0.35 + Math.sin(i * 0.6) * 45 + (Math.random() - 0.5) * 30;
      pointsRef.current.push({
        x: px,
        y: py,
        life: 1,
        maxLife: 150 + Math.random() * 50,
        hue: baseHue + (Math.random() - 0.5) * 40,
        width: Math.random() * 60 + 80,
      });
    }

    // Shower of shooting stars
    for (let i = 0; i < 4; i++) {
      shootingStarsRef.current.push({
        x: Math.random() * w * 0.7,
        y: Math.random() * (h * 0.4),
        vx: 7 + Math.random() * 5,
        vy: 4 + Math.random() * 4,
        length: 60 + Math.random() * 40,
        alpha: 1,
        color: starColor,
      });
    }

    playHarpNote(0.2);
    setTimeout(() => playHarpNote(0.5), 140);
    setTimeout(() => playHarpNote(0.8), 280);
    setPaintCount((prev) => prev + 15);
  };

  const handleClear = () => {
    pointsRef.current = [];
    shootingStarsRef.current = [];
    setPaintCount(0);
  };

  // Main Canvas Rendering Loop
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

      // Generate ambient background twinkling stars
      const stars: AmbientStar[] = [];
      for (let i = 0; i < 55; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
        });
      }
      ambientStarsRef.current = stars;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.02;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Deep dark celestial night background
      ctx.fillStyle = '#080B18';
      ctx.fillRect(0, 0, w, h);

      // 1. Ambient mountain horizon silhouette at bottom
      ctx.fillStyle = '#050711';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h - 35);
      ctx.bezierCurveTo(w * 0.25, h - 55, w * 0.45, h - 25, w * 0.65, h - 45);
      ctx.bezierCurveTo(w * 0.8, h - 60, w * 0.9, h - 30, w, h - 40);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // 2. Ambient Stars
      ambientStarsRef.current.forEach((st) => {
        const twinkle = Math.sin(time * 3 * st.twinkleSpeed) * 0.3;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 240, 232, ${Math.max(0.1, st.alpha + twinkle)})`;
        ctx.fill();
      });

      // 3. Render Aurora Light Ribbons
      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // luminous blending

      const points = pointsRef.current;
      for (let i = points.length - 1; i >= 0; i--) {
        const pt = points[i];
        pt.life -= 1 / pt.maxLife;

        if (pt.life <= 0) {
          points.splice(i, 1);
          continue;
        }

        // Undulating wave movement
        const waveY = Math.sin(time * 1.8 + pt.x * 0.015) * 22;
        const currentY = pt.y + waveY;
        const currentX = pt.x + Math.cos(time + pt.y * 0.02) * 8;

        const fade = Math.sin(pt.life * Math.PI); // smooth fade in & out
        const height = pt.width * 1.8;

        // Vertical luminous curtain gradient
        const grad = ctx.createLinearGradient(currentX, currentY - height, currentX, currentY + 20);
        grad.addColorStop(0, `hsla(${pt.hue}, 85%, 65%, 0)`);
        grad.addColorStop(0.3, `hsla(${pt.hue}, 90%, 60%, ${fade * 0.35})`);
        grad.addColorStop(0.7, `hsla(${pt.hue + 25}, 85%, 55%, ${fade * 0.25})`);
        grad.addColorStop(1, `hsla(${pt.hue + 45}, 80%, 50%, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(currentX, currentY - height * 0.4, pt.width * 0.7, height, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 4. Render Shooting Stars
      const stars = shootingStarsRef.current;
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.025;

        if (s.alpha <= 0 || s.x > w + 100 || s.y > h + 100) {
          stars.splice(i, 1);
          continue;
        }

        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.length;
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.length;

        const starGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        starGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        starGrad.addColorStop(1, s.color);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Star head sparkle
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* Interactive Aurora Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '310px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#080B18',
          border: '1px solid rgba(167, 139, 250, 0.28)',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.55), inset 0 0 40px rgba(16, 185, 129, 0.05)',
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

        {/* Ambient Overlay Hint when not yet painted */}
        {paintCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(8, 11, 24, 0.2) 0%, transparent 80%)',
            }}
          >
            <Wind size={26} color="var(--color-lavender)" style={{ marginBottom: '0.5rem', opacity: 0.85 }} />
            <span
              style={{
                fontSize: '0.86rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--color-ivory)',
                letterSpacing: '0.04em',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              Swipe across the sky to weave Northern Lights
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--color-muted)',
                marginTop: '0.2rem',
              }}
            >
              Fast swipes shoot starlight across the horizon
            </span>
          </motion.div>
        )}

        {/* Top-Right Palette Switcher */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '0.35rem',
            background: 'rgba(8, 11, 24, 0.75)',
            padding: '0.25rem 0.4rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(216, 204, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setPalette('emerald')}
            title="Polar Emerald"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              border: palette === 'emerald' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          />
          <button
            type="button"
            onClick={() => setPalette('amethyst')}
            title="Cosmic Amethyst"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
              border: palette === 'amethyst' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          />
          <button
            type="button"
            onClick={() => setPalette('solar')}
            title="Solar Gold"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #FDE68A 100%)',
              border: palette === 'solar' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          />
        </div>

        {/* Top-Left Live Note Count */}
        {paintCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '12px',
              fontSize: '0.68rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              background: 'rgba(8, 11, 24, 0.75)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(253, 230, 138, 0.25)',
              pointerEvents: 'none',
            }}
          >
            ✦ AURORA DANCING
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={triggerBurst}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.45)',
            color: 'var(--color-ivory)',
            fontSize: '0.84rem',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <Sparkles size={14} color="#A78BFA" />
          <span>Release Celestial Wave</span>
        </button>

        {paintCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear the sky"
            style={{
              padding: '0.65rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(14, 18, 36, 0.65)',
              border: '1px solid rgba(216, 204, 255, 0.15)',
              color: 'var(--color-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              touchAction: 'manipulation',
            }}
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Connected Horizon Note */}
      <div
        style={{
          width: '100%',
          padding: '1.1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(14, 18, 36, 0.72)',
          border: '1px solid rgba(216, 204, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-lavender)',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}
        >
          <Palette size={14} />
          <span>Under the Same Aurora</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          Even though our cities are separated by hundreds of miles, the sky above us has no borders. Whenever you look up at night and see the clouds moving past the moon, remember that every light we cast here travels across the same horizon to reach you.
        </p>
      </div>
    </div>
  );
};
