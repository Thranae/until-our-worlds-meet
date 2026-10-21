import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Power, Moon, Compass, RefreshCw } from 'lucide-react';

interface StarPoint {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
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

type NebulaTheme = 'velvet' | 'rose' | 'emerald' | 'amber';

export const GalaxyProjector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<StarPoint[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const [isOn, setIsOn] = useState(true);
  const [theme, setTheme] = useState<NebulaTheme>('velvet');
  const [showConstellations, setShowConstellations] = useState(true);
  const [driftSpeed, setDriftSpeed] = useState<number>(0.003);
  const [starsCaught, setStarsCaught] = useState(0);

  // Synthesize soft celestial harmonic hum on power/interaction
  const playCosmicChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Gentle warm harmonic chord (A4 432Hz & E5 648Hz)
      const freqs = [432, 648, 864];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + idx * 0.08 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.8);
      });
    } catch {
      // Safe fallback
    }
  }, []);

  const triggerShootingStar = useCallback((customX?: number, customY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = customX !== undefined ? customX : Math.random() * rect.width * 0.8;
    const startY = customY !== undefined ? customY : Math.random() * rect.height * 0.4;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    const speed = Math.random() * 6 + 9;

    shootingStarsRef.current.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: Math.random() * 50 + 40,
      alpha: 1,
      color: theme === 'amber' ? '#FDE68A' : theme === 'rose' ? '#F472B6' : theme === 'emerald' ? '#6EE7B7' : '#C4B5FD',
    });
    setStarsCaught((prev) => prev + 1);
  }, [theme]);

  // Initialize starfield
  useEffect(() => {
    const stars: StarPoint[] = [];
    const colors = ['#FFFFFF', '#E0E7FF', '#DDD6FE', '#FEF3C7', '#BAE6FD'];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.2 + 0.6,
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    starsRef.current = stars;
  }, []);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

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
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      if (isOn) {
        angle += driftSpeed;

        // Dynamic Nebula Clouds
        const nebulaGrad1 = ctx.createRadialGradient(
          cx + Math.sin(angle * 1.5) * (w * 0.2),
          cy + Math.cos(angle * 1.2) * (h * 0.15),
          10,
          cx,
          cy,
          w * 0.6
        );

        const nebulaGrad2 = ctx.createRadialGradient(
          cx - Math.cos(angle) * (w * 0.22),
          cy - Math.sin(angle * 0.8) * (h * 0.18),
          15,
          cx,
          cy,
          w * 0.65
        );

        if (theme === 'velvet') {
          nebulaGrad1.addColorStop(0, 'rgba(139, 92, 246, 0.42)'); // Violet
          nebulaGrad1.addColorStop(0.5, 'rgba(59, 130, 246, 0.22)'); // Blue
          nebulaGrad1.addColorStop(1, 'transparent');

          nebulaGrad2.addColorStop(0, 'rgba(236, 72, 153, 0.28)'); // Rose
          nebulaGrad2.addColorStop(0.6, 'rgba(99, 102, 241, 0.14)');
          nebulaGrad2.addColorStop(1, 'transparent');
        } else if (theme === 'rose') {
          nebulaGrad1.addColorStop(0, 'rgba(244, 63, 94, 0.45)'); // Rose
          nebulaGrad1.addColorStop(0.5, 'rgba(217, 70, 239, 0.24)');
          nebulaGrad1.addColorStop(1, 'transparent');

          nebulaGrad2.addColorStop(0, 'rgba(251, 146, 60, 0.26)'); // Peach
          nebulaGrad2.addColorStop(0.6, 'rgba(244, 114, 182, 0.15)');
          nebulaGrad2.addColorStop(1, 'transparent');
        } else if (theme === 'emerald') {
          nebulaGrad1.addColorStop(0, 'rgba(16, 185, 129, 0.42)'); // Emerald
          nebulaGrad1.addColorStop(0.5, 'rgba(6, 182, 212, 0.22)');
          nebulaGrad1.addColorStop(1, 'transparent');

          nebulaGrad2.addColorStop(0, 'rgba(52, 211, 153, 0.28)');
          nebulaGrad2.addColorStop(0.6, 'rgba(14, 165, 233, 0.15)');
          nebulaGrad2.addColorStop(1, 'transparent');
        } else {
          // Amber
          nebulaGrad1.addColorStop(0, 'rgba(245, 158, 11, 0.42)'); // Amber
          nebulaGrad1.addColorStop(0.5, 'rgba(234, 88, 12, 0.22)');
          nebulaGrad1.addColorStop(1, 'transparent');

          nebulaGrad2.addColorStop(0, 'rgba(253, 230, 138, 0.28)');
          nebulaGrad2.addColorStop(0.6, 'rgba(217, 119, 6, 0.15)');
          nebulaGrad2.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = nebulaGrad1;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = nebulaGrad2;
        ctx.fillRect(0, 0, w, h);

        // Optional Constellation Lines between neighboring stars
        if (showConstellations) {
          ctx.strokeStyle = 'rgba(216, 204, 255, 0.14)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          const stars = starsRef.current;
          for (let i = 0; i < 28; i++) {
            const s1 = stars[i];
            const s2 = stars[(i + 1) % 28];
            ctx.moveTo(s1.x * w, s1.y * h);
            ctx.lineTo(s2.x * w, s2.y * h);
          }
          ctx.stroke();
        }

        // Render Twinkling Stars
        starsRef.current.forEach((star) => {
          star.phase += star.twinkleSpeed;
          const currentAlpha = star.baseAlpha + Math.sin(star.phase) * 0.25;
          const sx = star.x * w;
          const sy = star.y * h;

          ctx.fillStyle = star.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle cross sparkle on brighter stars
          if (star.size > 2.0 && currentAlpha > 0.6) {
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(sx - star.size * 2, sy);
            ctx.lineTo(sx + star.size * 2, sy);
            ctx.moveTo(sx, sy - star.size * 2);
            ctx.lineTo(sx, sy + star.size * 2);
            ctx.stroke();
          }
        });

        // Shooting Stars
        const shooting = shootingStarsRef.current;
        for (let i = shooting.length - 1; i >= 0; i--) {
          const s = shooting[i];
          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= 0.02;

          if (s.alpha <= 0 || s.x > w || s.y > h) {
            shooting.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1.6;
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 3.5, s.y - s.vy * 3.5);
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
      } else {
        // Projector Off: Quiet dark bedroom ceiling with soft moonlight vignette
        const darkGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.55);
        darkGrad.addColorStop(0, 'rgba(18, 22, 45, 0.4)');
        darkGrad.addColorStop(1, 'rgba(4, 6, 14, 0.9)');
        ctx.fillStyle = darkGrad;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isOn, theme, showConstellations, driftSpeed]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isOn) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    triggerShootingStar(clickX, clickY);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        paddingBottom: '4.5rem',
      }}
    >
      {/* Interactive Starlit Bedroom Ceiling Stage */}
      <div
        onClick={handleCanvasClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '330px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#04060E',
          border: '1.5px solid rgba(167, 139, 250, 0.3)',
          boxShadow: isOn
            ? '0 16px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.25)'
            : '0 12px 35px rgba(0, 0, 0, 0.6)',
          cursor: isOn ? 'crosshair' : 'default',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />

        {/* Ceiling Corner Vignette & Realistic Room Angle */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 40%, rgba(4, 6, 14, 0.75) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top HUD: Time & Projector Status */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                color: isOn ? '#34D399' : 'var(--color-muted)',
                background: 'rgba(8, 11, 24, 0.8)',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isOn ? '#34D399' : '#6B7280',
                  boxShadow: isOn ? '0 0 6px #34D399' : 'none',
                }}
              />
              {isOn ? 'GALAXY PROJECTOR ACTIVE' : 'ROOM LIGHTS OFF'}
            </span>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: 'var(--color-gold-soft)',
              background: 'rgba(8, 11, 24, 0.8)',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              border: '1px solid rgba(253, 230, 138, 0.25)',
            }}
          >
            02:30 AM • WHISPERING ON CALL
          </span>
        </div>

        {/* Center Prompt when lights are on */}
        {isOn && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.7rem',
              color: 'var(--color-ivory)',
              fontFamily: 'monospace',
              background: 'rgba(10, 14, 30, 0.8)',
              padding: '0.22rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(216, 204, 255, 0.25)',
              pointerEvents: 'none',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            TAP CEILING TO CAST SHOOTING STARS ✦ ({starsCaught} WISHES)
          </div>
        )}

        {/* Projector Unit in Corner */}
        <div
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(14, 18, 38, 0.88)',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isOn ? 'radial-gradient(circle, #A78BFA 0%, #6366F1 100%)' : '#374151',
              boxShadow: isOn ? '0 0 10px #A78BFA' : 'none',
            }}
          />
          <span style={{ fontSize: '0.66rem', fontFamily: 'monospace', color: 'var(--color-ivory)' }}>
            NIGHTSTAND BEAM
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar: Themes, Power, Motion */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsOn(!isOn);
            playCosmicChime();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            background: isOn ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.08)',
            border: isOn ? '1px solid rgba(167, 139, 250, 0.55)' : '1px solid rgba(255, 255, 255, 0.18)',
            color: isOn ? '#E0E7FF' : 'var(--color-muted)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Power size={13} />
          <span>{isOn ? 'Projector ON' : 'Turn On Projector'}</span>
        </button>

        {/* Color Palette Selector */}
        {(
          [
            { id: 'velvet', label: 'Velvet Sky', color: '#A78BFA' },
            { id: 'rose', label: 'Cosmic Rose', color: '#F472B6' },
            { id: 'emerald', label: 'Aurora Wave', color: '#34D399' },
            { id: 'amber', label: 'Golden Honey', color: '#FBBF24' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTheme(t.id);
              if (!isOn) setIsOn(true);
              playCosmicChime();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: theme === t.id && isOn ? `${t.color}25` : 'rgba(255, 255, 255, 0.06)',
              border: theme === t.id && isOn ? `1px solid ${t.color}` : '1px solid rgba(255, 255, 255, 0.12)',
              color: theme === t.id && isOn ? '#FFFFFF' : 'var(--color-muted)',
              fontSize: '0.76rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: t.color,
                boxShadow: theme === t.id && isOn ? `0 0 6px ${t.color}` : 'none',
              }}
            />
            <span>{t.label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowConstellations(!showConstellations)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: showConstellations ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            border: showConstellations ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: showConstellations ? '#BAE6FD' : 'var(--color-muted)',
            fontSize: '0.76rem',
            cursor: 'pointer',
          }}
        >
          <Compass size={13} />
          <span>Constellations: {showConstellations ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => triggerShootingStar()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#FEF3C7',
            fontSize: '0.76rem',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={13} />
          <span>Wish 🌠</span>
        </button>

        <button
          type="button"
          onClick={() => setDriftSpeed((prev) => (prev === 0.003 ? 0.006 : prev === 0.006 ? 0.001 : 0.003))}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--color-muted)',
            fontSize: '0.76rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} />
          <span>Drift: {driftSpeed === 0.001 ? 'Gentle' : driftSpeed === 0.006 ? 'Dynamic' : 'Normal'}</span>
        </button>
      </div>

      {/* Atmospheric Cozy Story Card */}
      <div
        style={{
          width: '100%',
          padding: '1.25rem 1.4rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(15, 18, 38, 0.8)',
          border: '1.5px solid rgba(216, 204, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--color-gold-soft)',
            fontSize: '0.86rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          <Moon size={15} />
          <span>Our Private Galaxy on the Ceiling</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.88rem',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          Those quiet late nights when we turn off our bedroom lights, set our phones right next to our pillows, and let the projector paint the ceiling in starlight. We whisper about the future, about how one day we won't need to project galaxies onto ceilings to feel close — we'll be lying under real stars together, with nowhere else in the world we'd rather be.
        </p>
      </div>
    </div>
  );
};
