import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, RotateCcw } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: number;
  phase: number;
}

interface MemoryOrb {
  id: number;
  title: string;
  text: string;
  tag: string;
  color: string;
}

const MEMORIES: MemoryOrb[] = [
  {
    id: 1,
    title: 'The Final Circle Clutch',
    tag: 'BGMI MEMORY',
    text: 'That match where the blue zone was biting, we had 10 HP left, and somehow we clutched the #1 victory dinner while laughing so hard our stomachs hurt.',
    color: '#EF4444',
  },
  {
    id: 2,
    title: '3:00 AM Mic Talks',
    tag: 'LATE NIGHT FREQUENCY',
    text: 'Talking about everything and nothing when the rest of the world was asleep, when neither of us actually wanted to hang up the call.',
    color: '#A78BFA',
  },
  {
    id: 3,
    title: 'Red Bull Study Sessions',
    tag: 'ENERGY & DEDICATION',
    text: 'Watching how fiercely you study and work. Every time you crack open a cold Red Bull, remember I am in your corner cheering the loudest.',
    color: '#38BDF8',
  },
  {
    id: 4,
    title: 'Voice Notes Across Miles',
    tag: 'PURE WARMTH',
    text: 'Listening to your voice notes on rough days. Just hearing you smile through the speaker makes 1,740 km feel like absolutely zero distance.',
    color: '#FDE047',
  },
  {
    id: 5,
    title: 'The Birthday Starlight',
    tag: 'WITH ALL MY HEART',
    text: 'November 8th: the day my favourite person came into this world. You deserve all the peace, laughter, and starlight in the universe.',
    color: '#F59E0B',
  },
];

export const StarlightJar: React.FC = () => {
  const [isUncorked, setIsUncorked] = useState(false);
  const [isSwarmReleased, setIsSwarmReleased] = useState(false);
  const [activeMemory, setActiveMemory] = useState<MemoryOrb | null>(null);
  const [discoveredMemories, setDiscoveredMemories] = useState<number[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const firefliesRef = useRef<Firefly[]>([]);
  const touchPosRef = useRef<{ x: number; y: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize crystal glass tap sound
  const playGlassTapSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3200 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(12); } catch {}
      }
    } catch {}
  }, []);

  // Synthesize bottle cork pop sound
  const playCorkPopSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Low suction thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.09);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      // Delicate starry chime following pop
      const notes = [659.25, 880.0, 1046.5];
      notes.forEach((freq, idx) => {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.07);
        cGain.gain.setValueAtTime(0.001, now + 0.08 + idx * 0.07);
        cGain.gain.linearRampToValueAtTime(0.15, now + 0.1 + idx * 0.07);
        cGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9 + idx * 0.07);
        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(now + 0.08 + idx * 0.07);
        cOsc.stop(now + 0.95 + idx * 0.07);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([30, 60, 40]); } catch {}
      }
    } catch {}
  }, []);

  // Fireflies Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize 36 fireflies inside the jar
    const colors = ['#FEF08A', '#FDE047', '#A78BFA', '#38BDF8', '#F472B6'];
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const fireflies: Firefly[] = Array.from({ length: 36 }, () => ({
      x: w * 0.2 + Math.random() * w * 0.6,
      y: h * 0.25 + Math.random() * h * 0.6,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2.8 + 1.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      glow: Math.random() * 0.8 + 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
    firefliesRef.current = fireflies;

    const render = () => {
      const cw = canvas.width / window.devicePixelRatio;
      const ch = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, cw, ch);

      const jarLeft = cw * 0.16;
      const jarRight = cw * 0.84;
      const jarTop = ch * 0.18;
      const jarBottom = ch * 0.92;

      // Update and draw fireflies
      firefliesRef.current.forEach((ff) => {
        ff.phase += 0.04;
        const currentGlow = 0.5 + Math.sin(ff.phase) * 0.45;

        if (isSwarmReleased) {
          // Spiraling ascent upward out of the jar neck into the night
          ff.vy -= 0.12;
          ff.vx += Math.sin(ff.phase * 2) * 0.6;
          ff.x += ff.vx;
          ff.y += ff.vy;
        } else {
          // Touch attraction if finger is touching
          if (touchPosRef.current) {
            const dx = touchPosRef.current.x - ff.x;
            const dy = touchPosRef.current.y - ff.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 5) {
              ff.vx += (dx / dist) * 0.14;
              ff.vy += (dy / dist) * 0.14;
            }
          }

          // Gentle wandering Brownian drift
          ff.vx += (Math.random() - 0.5) * 0.1;
          ff.vy += (Math.random() - 0.5) * 0.1;

          // Velocity dampening
          ff.vx *= 0.96;
          ff.vy *= 0.96;

          ff.x += ff.vx;
          ff.y += ff.vy;

          // Bounce smoothly off jar glass walls
          if (ff.x < jarLeft + 10) {
            ff.x = jarLeft + 10;
            ff.vx = Math.abs(ff.vx) * 0.8;
          }
          if (ff.x > jarRight - 10) {
            ff.x = jarRight - 10;
            ff.vx = -Math.abs(ff.vx) * 0.8;
          }
          if (ff.y < jarTop + 10) {
            ff.y = jarTop + 10;
            ff.vy = Math.abs(ff.vy) * 0.8;
          }
          if (ff.y > jarBottom - 10) {
            ff.y = jarBottom - 10;
            ff.vy = -Math.abs(ff.vy) * 0.8;
          }
        }

        // Render soft halo glow
        const glowGrad = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.radius * 4.5);
        glowGrad.addColorStop(0, ff.color);
        glowGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.radius * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Render bright core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.radius * currentGlow, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isSwarmReleased]);

  const handleJarTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    touchPosRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    playGlassTapSound();
  };

  const handleTouchEnd = () => {
    touchPosRef.current = null;
  };

  const handleUncork = () => {
    setIsUncorked(true);
    playCorkPopSound();
  };

  const handleReleaseSwarm = () => {
    setIsSwarmReleased(true);
    playCorkPopSound();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
    }
  };

  const handleResetJar = () => {
    setIsUncorked(false);
    setIsSwarmReleased(false);
    setActiveMemory(null);
  };

  const handleSelectMemory = (mem: MemoryOrb) => {
    setActiveMemory(mem);
    if (!discoveredMemories.includes(mem.id)) {
      setDiscoveredMemories([...discoveredMemories, mem.id]);
    }
    playGlassTapSound();
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Visual Starlight Glass Jar Stage */}
      <div
        style={{
          position: 'relative',
          width: '260px',
          height: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Wooden Cork Lid */}
        <motion.div
          animate={{
            y: isUncorked || isSwarmReleased ? -45 : 0,
            opacity: isSwarmReleased ? 0 : 1,
            rotate: isUncorked ? -12 : 0,
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '6px',
            width: '84px',
            height: '24px',
            borderRadius: '4px 4px 6px 6px',
            background: 'linear-gradient(180deg, #B45309 0%, #78350F 100%)',
            border: '1.5px solid #F59E0B',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(254, 240, 138, 0.4)',
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isUncorked ? 'default' : 'pointer',
          }}
          onClick={!isUncorked ? handleUncork : undefined}
        >
          <span
            style={{
              fontSize: '0.58rem',
              fontFamily: 'monospace',
              color: '#FEF3C7',
              letterSpacing: '0.1em',
              fontWeight: 'bold',
            }}
          >
            {isUncorked ? 'OPEN' : 'CORK'}
          </span>
        </motion.div>

        {/* Jar Glass Silhouette Container */}
        <div
          onTouchStart={handleJarTouch}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleJarTouch}
          onMouseUp={handleTouchEnd}
          style={{
            position: 'relative',
            width: '240px',
            height: '310px',
            marginTop: '25px',
            borderRadius: '24px 24px 40px 40px',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.6), inset 0 0 35px rgba(253, 230, 138, 0.12)',
            overflow: 'hidden',
            cursor: 'pointer',
            touchAction: 'none',
          }}
        >
          {/* Glass Specular Glare Lines */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '14px',
              width: '8px',
              height: '240px',
              borderRadius: '4px',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.05) 100%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Living Fireflies Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />

          {/* Golden Starlight Base Glow */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60px',
              background: 'radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.25) 0%, transparent 80%)',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          />
        </div>
      </div>

      {/* Tap Instruction / Interactive Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {!isUncorked ? (
          <button
            type="button"
            onClick={handleUncork}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.25) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.55)',
              color: '#FEF3C7',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <Sparkles size={14} color="#FDE68A" />
            <span>Uncork Starlight Bottle ✦</span>
          </button>
        ) : !isSwarmReleased ? (
          <button
            type="button"
            onClick={handleReleaseSwarm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.35rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              border: '1px solid rgba(167, 139, 250, 0.65)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(124, 58, 237, 0.45)',
              touchAction: 'manipulation',
            }}
          >
            <Sparkles size={14} />
            <span>Release Fireflies to the Sky ✨</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResetJar}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--color-ivory)',
              fontSize: '0.76rem',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>Recatch Starlight</span>
          </button>
        )}
      </div>

      <span
        style={{
          fontSize: '0.74rem',
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-sans)',
          textAlign: 'center',
        }}
      >
        ✦ Tap the glass to scatter the fireflies, or pick a memory whisper below:
      </span>

      {/* Memory Whisper Pill Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          justifyContent: 'center',
          maxWidth: '520px',
        }}
      >
        {MEMORIES.map((mem) => {
          const isSelected = activeMemory?.id === mem.id;
          const isDiscovered = discoveredMemories.includes(mem.id);

          return (
            <button
              key={mem.id}
              type="button"
              onClick={() => handleSelectMemory(mem)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: isSelected ? 700 : 500,
                background: isSelected
                  ? 'rgba(253, 230, 138, 0.25)'
                  : isDiscovered
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isSelected
                  ? '1px solid #FDE68A'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                color: isSelected ? '#FEF3C7' : isDiscovered ? 'var(--color-ivory)' : 'var(--color-muted)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.2s ease',
              }}
            >
              <MessageCircle size={12} color={mem.color} />
              <span>{mem.title}</span>
            </button>
          );
        })}
      </div>

      {/* Revealed Memory Whisper Parchment Card */}
      <AnimatePresence mode="wait">
        {activeMemory && (
          <motion.div
            key={activeMemory.id}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.4rem',
              borderRadius: '16px',
              textAlign: 'center',
              border: `1px solid ${activeMemory.color}55`,
              boxShadow: `0 12px 35px rgba(0, 0, 0, 0.45), 0 0 25px ${activeMemory.color}22`,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                letterSpacing: '0.12em',
                color: activeMemory.color,
                fontWeight: 'bold',
                marginBottom: '0.4rem',
              }}
            >
              {activeMemory.tag} • FOR {siteContent.recipient.nickname.toUpperCase()}
            </span>

            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                color: 'var(--color-ivory)',
                margin: '0 0 0.5rem 0',
              }}
            >
              {activeMemory.title}
            </h4>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                lineHeight: 1.65,
                color: 'var(--color-ivory-dim)',
                margin: 0,
              }}
            >
              "{activeMemory.text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarlightJar;
