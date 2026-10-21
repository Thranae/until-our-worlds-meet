import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloudRain, Sparkles, Wind, Compass } from 'lucide-react';
import { siteContent } from '../data/siteContent';

type WeatherMode = 'rain' | 'starlight' | 'breeze';

interface WeatherParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  alpha: number;
  length?: number;
}

export const SharedWeather: React.FC = () => {
  const [mode, setMode] = useState<WeatherMode>('rain');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<WeatherParticle[]>([]);

  // Sound synthesis: Gentle rain pitter-patter or starry wind chime
  const playWeatherSound = useCallback((selectedMode: WeatherMode) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (selectedMode === 'rain') {
        // Soft rain droplets
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400 + Math.random() * 600, now + i * 0.08);
          gain.gain.setValueAtTime(0.04, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.07);
        }
      } else {
        // Starlight wind chime
        const notes = [659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.12 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.7);
        });
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const handleModeChange = (newMode: WeatherMode) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Safe fallback
      }
    }
    setMode(newMode);
    playWeatherSound(newMode);
  };

  // Canvas particle weather simulation
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

      // Re-init particles based on mode
      const list: WeatherParticle[] = [];
      const count = mode === 'rain' ? 80 : mode === 'starlight' ? 45 : 30;
      for (let i = 0; i < count; i++) {
        list.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: mode === 'breeze' ? Math.random() * 1.5 + 0.8 : (Math.random() - 0.5) * 0.3,
          vy: mode === 'rain' ? Math.random() * 6 + 7 : (Math.random() - 0.5) * 0.5,
          size: mode === 'rain' ? 1.5 : Math.random() * 2 + 1,
          alpha: Math.random() * 0.7 + 0.3,
          length: mode === 'rain' ? Math.random() * 16 + 12 : undefined,
        });
      }
      particlesRef.current = list;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (mode === 'rain') {
          if (p.y > h) {
            p.y = -20;
            p.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + (p.length || 14));
          ctx.strokeStyle = `rgba(147, 197, 253, ${p.alpha * 0.75})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (mode === 'starlight') {
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(253, 230, 138, ${p.alpha})`;
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Breeze: golden autumn petals & leaves
          if (p.x > w + 20) {
            p.x = -20;
            p.y = Math.random() * h;
          }
          if (p.y > h) p.y = 0;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.x * 0.02);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 8, 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * 0.7})`;
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [mode]);

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
      {/* Interactive Weather Sphere / Sky Window */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '270px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background:
            mode === 'rain'
              ? 'radial-gradient(ellipse at 50% 20%, #172554 0%, #080b18 100%)'
              : mode === 'starlight'
              ? 'radial-gradient(ellipse at 50% 20%, #2e1065 0%, #080b18 100%)'
              : 'radial-gradient(ellipse at 50% 20%, #451a03 0%, #080b18 100%)',
          border: '1px solid rgba(216, 204, 255, 0.2)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.55)',
          transition: 'background 0.8s ease',
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

        {/* Dual City Weather Bar */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(8, 11, 24, 0.75)',
            border: '1px solid rgba(216, 204, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            fontSize: '0.74rem',
            color: 'var(--color-ivory)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--color-lavender)' }}>●</span>
            <span>{siteContent.recipient.nickname}&apos;s City</span>
            <span style={{ color: 'var(--color-gold-soft)', fontWeight: 600 }}>21°C</span>
          </div>

          <div style={{ color: 'var(--color-muted)', fontSize: '0.68rem', fontFamily: 'monospace' }}>
            SHARED HORIZON
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>My City</span>
            <span style={{ color: 'var(--color-gold-soft)', fontWeight: 600 }}>22°C</span>
            <span style={{ color: '#F472B6' }}>●</span>
          </div>
        </div>

        {/* Center Live Atmosphere Title */}
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '0.86rem',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--color-ivory)',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {mode === 'rain'
              ? 'Listening to the late night rain together'
              : mode === 'starlight'
              ? 'Looking at the exact same starlight'
              : 'The warm breeze traveling between our cities'}
          </div>
        </div>
      </div>

      {/* Weather Selector Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => handleModeChange('rain')}
          style={{
            flex: 1,
            padding: '0.65rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            background: mode === 'rain' ? 'rgba(59, 130, 246, 0.22)' : 'rgba(14, 18, 36, 0.5)',
            border: `1px solid ${mode === 'rain' ? 'rgba(96, 165, 250, 0.6)' : 'rgba(216, 204, 255, 0.1)'}`,
            color: mode === 'rain' ? '#93C5FD' : 'var(--color-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            touchAction: 'manipulation',
          }}
        >
          <CloudRain size={14} />
          <span>Midnight Rain</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('starlight')}
          style={{
            flex: 1,
            padding: '0.65rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            background: mode === 'starlight' ? 'rgba(168, 85, 247, 0.22)' : 'rgba(14, 18, 36, 0.5)',
            border: `1px solid ${mode === 'starlight' ? 'rgba(192, 132, 252, 0.6)' : 'rgba(216, 204, 255, 0.1)'}`,
            color: mode === 'starlight' ? '#D8B4FE' : 'var(--color-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            touchAction: 'manipulation',
          }}
        >
          <Sparkles size={14} />
          <span>Clear Stars</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('breeze')}
          style={{
            flex: 1,
            padding: '0.65rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            background: mode === 'breeze' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(14, 18, 36, 0.5)',
            border: `1px solid ${mode === 'breeze' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(216, 204, 255, 0.1)'}`,
            color: mode === 'breeze' ? '#FDE68A' : 'var(--color-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            touchAction: 'manipulation',
          }}
        >
          <Wind size={14} />
          <span>Warm Breeze</span>
        </button>
      </div>

      {/* Atmospheric Connection Note */}
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
            color: 'var(--color-blue-soft)',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}
        >
          <Compass size={14} />
          <span>Under the Same Ceiling of Sky</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          Whenever it pours outside your window, look up. The clouds drifting across your sky will carry that rain across the country to mine. We might have different weather forecasts on our phones, but the sky between us is one unbroken roof.
        </p>
      </div>
    </div>
  );
};
