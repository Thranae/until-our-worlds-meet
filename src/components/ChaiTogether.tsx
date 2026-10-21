import React, { useRef, useEffect, useCallback } from 'react';
import { Coffee } from 'lucide-react';

interface SteamParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  radius: number;
  alpha: number;
}

export const ChaiTogether: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SteamParticle[]>([]);

  // Ceramic cup clink sound synthesis
  const playCupClink = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // High resonant ceramic chime (B5 - 987Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch {
      // Safe fallback
    }
  }, []);

  const handleStirCup = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(14);
      } catch {
        // Safe fallback
      }
    }
    playCupClink();

    // Burst of rising steam particles
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: rect.height * 0.65,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 1.5 + 1.2),
        radius: Math.random() * 10 + 6,
        alpha: 0.6,
      });
    }
  };

  // Steam particle canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

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

      ctx.clearRect(0, 0, w, h);

      // Continuous gentle steam wisps from both cups
      if (Math.random() < 0.25) {
        // Left cup (Bot's)
        particlesRef.current.push({
          x: cx - 45 + (Math.random() - 0.5) * 25,
          y: h * 0.62,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 1.0 + 0.8),
          radius: Math.random() * 8 + 6,
          alpha: 0.35,
        });
        // Right cup (Yours)
        particlesRef.current.push({
          x: cx + 45 + (Math.random() - 0.5) * 25,
          y: h * 0.62,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 1.0 + 0.8),
          radius: Math.random() * 8 + 6,
          alpha: 0.35,
        });
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.y * 0.04) * 0.4;
        p.y += p.vy;
        p.radius += 0.25;
        p.alpha -= 0.005;

        if (p.alpha <= 0 || p.y < 10) {
          particles.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(253, 230, 138, ${p.alpha * 0.5})`);
        grad.addColorStop(0.6, `rgba(216, 204, 255, ${p.alpha * 0.25})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
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
        gap: '1.25rem',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* 2D Cozy Cafe Table Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #111422 0%, #1c1410 70%, #29180c 100%)',
          border: '1.5px solid rgba(251, 191, 36, 0.25)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '2.5rem',
          cursor: 'pointer',
        }}
        onClick={handleStirCup}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Ambient Warm Golden Cafe Glow */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Two Ceramic Cups Visuals */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            zIndex: 10,
          }}
        >
          {/* Left Cup: Bot's Cup (Terracotta / Warm Honey) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '52px',
                borderRadius: '4px 4px 22px 22px',
                background: 'linear-gradient(180deg, #D97706 0%, #92400E 100%)',
                border: '2px solid #FDE68A',
                boxShadow: '0 6px 15px rgba(0,0,0,0.6)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Steamy Chai Surface */}
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  width: '54px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#B45309',
                  border: '1px solid rgba(253, 230, 138, 0.6)',
                }}
              />
              <span style={{ fontSize: '0.62rem', color: '#FDE68A', fontFamily: 'monospace', zIndex: 5 }}>
                BOT ✦
              </span>
            </div>
            {/* Saucer */}
            <div
              style={{
                width: '80px',
                height: '8px',
                borderRadius: '50%',
                background: '#78350F',
                border: '1px solid #FDE68A',
                marginTop: '-2px',
              }}
            />
          </div>

          {/* Right Cup: Yours (Ceramic Deep Blue) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '52px',
                borderRadius: '4px 4px 22px 22px',
                background: 'linear-gradient(180deg, #2563EB 0%, #1E3A8A 100%)',
                border: '2px solid #93C5FD',
                boxShadow: '0 6px 15px rgba(0,0,0,0.6)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Steamy Surface */}
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  width: '54px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#B45309',
                  border: '1px solid rgba(147, 197, 253, 0.6)',
                }}
              />
              <span style={{ fontSize: '0.62rem', color: '#93C5FD', fontFamily: 'monospace', zIndex: 5 }}>
                YOU ✦
              </span>
            </div>
            {/* Saucer */}
            <div
              style={{
                width: '80px',
                height: '8px',
                borderRadius: '50%',
                background: '#1E293B',
                border: '1px solid #93C5FD',
                marginTop: '-2px',
              }}
            />
          </div>
        </div>

        {/* Ambient Tap Prompt */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            fontSize: '0.7rem',
            color: 'var(--color-gold-soft)',
            fontFamily: 'monospace',
            background: 'rgba(8, 11, 24, 0.75)',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(253, 230, 138, 0.25)',
            pointerEvents: 'none',
          }}
        >
          TAP CUPS TO CHEERS & STIR WARMTH
        </div>
      </div>

      {/* Atmospheric Cozy Story Card */}
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
            color: 'var(--color-gold-soft)',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}
        >
          <Coffee size={14} />
          <span>The Simplest, Most Beautiful Promise</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          Grand adventures are wonderful, but what I look forward to most are the quiet moments. Sitting across a small wooden table, watching you blow gently on your cup before taking a sip, listening to your laugh without any microphone lag. Just two cups, warm hands, and all the time in the world.
        </p>
      </div>
    </div>
  );
};
