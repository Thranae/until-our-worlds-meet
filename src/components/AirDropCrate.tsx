import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Crosshair, Award } from 'lucide-react';

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export const AirDropCrate: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SmokeParticle[]>([]);

  // Sound synthesis: Heavy crate mechanical unlatch + pneumatic blue smoke hiss
  const playCrateOpenSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Heavy clank
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);

      // Blue smoke hiss
      const bufferSize = ctx.sampleRate * 0.8;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now + 0.05);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now + 0.05);
    } catch {
      // Safe fallback
    }
  };

  const handleOpenCrate = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 80, 45, 90]);
      } catch {
        // Safe fallback
      }
    }
    playCrateOpenSound();
    setIsOpen(true);
  };

  // Smoke Canvas Simulation
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

      ctx.clearRect(0, 0, w, h);

      // Continuous red & blue flare smoke particles
      if (Math.random() < 0.4) {
        particlesRef.current.push({
          x: w * 0.5 + (Math.random() - 0.5) * 40,
          y: h * 0.65,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -(Math.random() * 2.2 + 1.2),
          radius: Math.random() * 14 + 10,
          alpha: 0.65,
        });
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.radius += 0.4;
        p.alpha -= 0.008;

        if (p.alpha <= 0 || p.y < -30) {
          particles.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(59, 130, 246, ${p.alpha * 0.8})`);
        grad.addColorStop(0.5, `rgba(239, 68, 68, ${p.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(30, 58, 138, 0)');

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

  const LOOT_ITEMS = [
    {
      name: 'Chilled Red Bull Reserves',
      category: 'ENERGY RATIONS ✦',
      desc: 'Cans of ice-cold Red Bull to fuel late-night clutches and keep my favorite human energized.',
      icon: <Zap size={18} color="#F59E0B" />,
      color: '#FDE68A',
    },
    {
      name: 'AMR .50 BMG Custom Ammo',
      category: 'SPECIALTY FIREPOWER ✦',
      desc: 'Armor-piercing cartridges stamped with your name. The lethal weapon of an unbeatable player.',
      icon: <Crosshair size={18} color="#60A5FA" />,
      color: '#93C5FD',
    },
    {
      name: 'Level 3 Starlight Helmet',
      category: 'UNBREAKABLE ARMOR ✦',
      desc: 'Forged to protect that brilliant mind of yours from every stressful day and harsh storm.',
      icon: <Shield size={18} color="#A855F7" />,
      color: '#D8B4FE',
    },
    {
      name: 'Golden Chicken Dinner',
      category: 'FOREVER SQUAD VICTORY ✦',
      desc: 'Because no matter how chaotic the match was, having you in my squad made us champions.',
      icon: <Award size={18} color="#F472B6" />,
      color: '#F472B6',
    },
  ];

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
      {/* 2D Animated Military Air Drop Crate Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '270px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% 80%, #1e1b4b 0%, #080b18 100%)',
          border: '1.5px solid rgba(216, 204, 255, 0.2)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Smoke Canvas */}
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

        {/* Crate Visual Entity */}
        <motion.div
          animate={
            isOpen
              ? { scale: [1, 1.04, 1] }
              : { y: [-3, 3, -3] }
          }
          transition={{ duration: 2.2, repeat: isOpen ? 0 : Infinity, ease: 'easeInOut' }}
          style={{
            position: 'relative',
            width: '170px',
            height: '145px',
            zIndex: 10,
            cursor: isOpen ? 'default' : 'pointer',
          }}
          onClick={!isOpen ? handleOpenCrate : undefined}
        >
          {/* Top Tarp Lid (Red with Blue Border) */}
          <motion.div
            animate={isOpen ? { y: -26, rotate: -8 } : { y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '35px',
              borderRadius: '6px 6px 2px 2px',
              background: 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)',
              border: '2px solid #2563EB',
              boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* White Military Stencil */}
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.62rem',
                color: '#FFFFFF',
                letterSpacing: '0.12em',
                fontWeight: 700,
              }}
            >
              SUPPLY // 08-NOV
            </span>
          </motion.div>

          {/* Lower Crate Body (Deep Blue Steel with Fasteners) */}
          <div
            style={{
              position: 'absolute',
              top: '32px',
              left: '4px',
              right: '4px',
              bottom: 0,
              borderRadius: '2px 2px 8px 8px',
              background: 'linear-gradient(180deg, #1D4ED8 0%, #1E3A8A 100%)',
              border: '2px solid #3B82F6',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.7), 0 8px 25px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Yellow Warning Striping */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background:
                  'repeating-linear-gradient(45deg, #F59E0B, #F59E0B 8px, #1E3A8A 8px, #1E3A8A 16px)',
                opacity: 0.85,
              }}
            />

            {/* Glowing Latch */}
            <div
              style={{
                width: '32px',
                height: '24px',
                borderRadius: '4px',
                background: isOpen ? '#10B981' : '#F59E0B',
                boxShadow: isOpen
                  ? '0 0 15px rgba(16, 185, 129, 0.8)'
                  : '0 0 15px rgba(245, 158, 11, 0.8)',
                marginTop: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#080B18',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {isOpen ? '✓' : '✦'}
            </div>
          </div>
        </motion.div>

        {/* Ambient Overlay Prompt */}
        {!isOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              fontSize: '0.74rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              background: 'rgba(8, 11, 24, 0.75)',
              padding: '0.25rem 0.7rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(253, 230, 138, 0.3)',
              pointerEvents: 'none',
            }}
          >
            TAP CRATE TO POP SMOKE & UNLATCH
          </div>
        )}
      </div>

      {/* Loot Items Grid when Opened */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.55rem',
            width: '100%',
          }}
        >
          {LOOT_ITEMS.map((item, idx) => {
            const isSelected = selectedItem === idx;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedItem(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(59, 130, 246, 0.22)' : 'rgba(14, 18, 36, 0.6)',
                  border: `1.5px solid ${isSelected ? item.color : 'rgba(216, 204, 255, 0.12)'}`,
                  color: isSelected ? item.color : 'var(--color-ivory)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                {item.icon}
                <div style={{ fontSize: '0.74rem', fontWeight: 500, lineHeight: 1.3 }}>
                  {item.name}
                </div>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Selected Loot Detailed Intel Card */}
      {isOpen && selectedItem !== null && (
        <motion.div
          key={selectedItem}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(14, 18, 36, 0.72)',
            border: '1px solid rgba(216, 204, 255, 0.12)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              marginBottom: '0.3rem',
            }}
          >
            {LOOT_ITEMS[selectedItem].category}
          </div>
          <div
            style={{
              fontSize: '0.92rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              color: 'var(--color-ivory)',
              marginBottom: '0.35rem',
            }}
          >
            {LOOT_ITEMS[selectedItem].name}
          </div>
          <p
            style={{
              color: 'var(--color-ivory-dim)',
              fontSize: '0.84rem',
              lineHeight: 1.6,
            }}
          >
            {LOOT_ITEMS[selectedItem].desc}
          </p>
        </motion.div>
      )}
    </div>
  );
};
