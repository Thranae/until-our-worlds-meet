import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, RotateCcw, Sparkles } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface Bubble {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
}

export const CelestialRedBull: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleCounterRef = useRef(0);

  // Synthesize realistic aluminum can tab-pop and crisp carbonation fizz
  const playCanPopAudio = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Mechanical metal click/pop
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.05);
      clickGain.gain.setValueAtTime(0.3, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(clickGain);
      clickGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);

      // 2. High-pressure carbonation fizz (white noise burst through bandpass filter)
      const bufferSize = Math.floor(ctx.sampleRate * 0.55);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(5200, now);
      filter.Q.setValueAtTime(1.4, now);

      const fizzGain = ctx.createGain();
      fizzGain.gain.setValueAtTime(0.001, now);
      fizzGain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      fizzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      whiteNoise.connect(filter);
      filter.connect(fizzGain);
      fizzGain.connect(ctx.destination);

      whiteNoise.start(now + 0.01);
      whiteNoise.stop(now + 0.55);
    } catch {
      // Audio context fallback if muted
    }
  };

  const handleOpenCan = () => {
    if (isOpen) return;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 40, 25]);
      } catch {
        // fallback
      }
    }

    playCanPopAudio();
    setIsOpen(true);

    // Trigger celestial shooting star in background
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
    }

    // Spawn fizzy bubbles
    const newBubbles: Bubble[] = Array.from({ length: 18 }, () => {
      bubbleCounterRef.current += 1;
      return {
        id: bubbleCounterRef.current,
        x: Math.random() * 40 - 20,
        size: Math.random() * 5 + 3,
        speed: Math.random() * 1.2 + 0.8,
        delay: Math.random() * 0.4,
      };
    });
    setBubbles(newBubbles);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // fallback
      }
    }
    setIsOpen(false);
    setBubbles([]);
  };

  useEffect(() => {
    if (!isOpen) return;
    // Keep a gentle bubbling stream active while open
    const interval = setInterval(() => {
      setBubbles((prev) => {
        bubbleCounterRef.current += 1;
        const fresh: Bubble = {
          id: bubbleCounterRef.current,
          x: Math.random() * 36 - 18,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 1.5 + 1,
          delay: 0,
        };
        const updated = [...prev.slice(-15), fresh];
        return updated;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '2rem auto 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Eyebrow / Tag */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.3rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(239, 68, 68, 0.14)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#FCA5A5',
          fontSize: '0.74rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        <Zap size={13} color="#F87171" />
        <span>SPECIAL CARE PACKAGE • FOR {siteContent.recipient.nickname.toUpperCase()}</span>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.55rem',
          color: 'var(--color-ivory)',
          textAlign: 'center',
          marginBottom: '0.4rem',
        }}
      >
        Bot's Infinite Starlight Can
      </h3>

      <p
        style={{
          fontSize: '0.84rem',
          color: 'var(--color-muted)',
          textAlign: 'center',
          maxWidth: '380px',
          marginBottom: '1.75rem',
          lineHeight: 1.5,
        }}
      >
        Because you love Red Bull, and because you work so hard. Tap the tab to pop a fresh can whenever you need energy or a smile.
      </p>

      {/* CAN & WINGS STAGE */}
      <div
        style={{
          position: 'relative',
          width: '320px',
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* GLOWING CELESTIAL WINGS (Unfolds behind can when popped!) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '320px',
                height: '220px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <svg
                viewBox="0 0 320 220"
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 0 20px rgba(253, 230, 138, 0.6))',
                }}
              >
                <defs>
                  <linearGradient id="wingGradLeft" x1="100%" y1="50%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="wingGradRight" x1="0%" y1="50%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Left Wing */}
                <motion.path
                  d="M130,120 C100,70 60,40 10,65 C40,95 70,125 125,140 C80,140 40,130 15,115 C45,145 85,160 130,155 Z"
                  fill="url(#wingGradLeft)"
                  animate={{
                    rotate: [-2, 3, -2],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: '130px 130px' }}
                />

                {/* Right Wing */}
                <motion.path
                  d="M190,120 C220,70 260,40 310,65 C280,95 250,125 195,140 C240,140 280,130 305,115 C275,145 235,160 190,155 Z"
                  fill="url(#wingGradRight)"
                  animate={{
                    rotate: [2, -3, 2],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: '190px 130px' }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIZZY BUBBLES STREAM (Rising from the top of the can) */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '80px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {bubbles.map((b) => (
              <motion.div
                key={b.id}
                initial={{ y: 20, x: b.x, opacity: 0.9, scale: 0.5 }}
                animate={{ y: -70, opacity: 0, scale: 1.3 }}
                transition={{
                  duration: b.speed,
                  ease: 'easeOut',
                  delay: b.delay,
                }}
                style={{
                  position: 'absolute',
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FEF3C7 0%, #93C5FD 70%, transparent 100%)',
                  boxShadow: '0 0 6px #FDE68A',
                }}
              />
            ))}
          </div>
        )}

        {/* THE RED BULL CAN OBJECT */}
        <motion.div
          onClick={handleOpenCan}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.96 }}
          style={{
            width: '106px',
            height: '228px',
            borderRadius: '26px 26px 18px 18px',
            position: 'relative',
            zIndex: 4,
            cursor: isOpen ? 'default' : 'pointer',
            boxShadow: isOpen
              ? '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 35px rgba(253, 230, 138, 0.45), 0 0 20px rgba(147, 197, 253, 0.4)'
              : '0 14px 35px rgba(0, 0, 0, 0.55), 0 0 20px rgba(0, 30, 98, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            background: '#0B132B',
          }}
          aria-label={isOpen ? "Red Bull can opened" : "Tap to pop Bot's Red Bull can"}
        >
          {/* Top Aluminum Rim */}
          <div
            style={{
              width: '100%',
              height: '24px',
              background: 'linear-gradient(90deg, #94A3B8 0%, #F1F5F9 28%, #CBD5E1 55%, #64748B 80%, #E2E8F0 100%)',
              borderBottom: '2px solid rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Can Tab with Ring Hole */}
            <motion.div
              animate={{
                rotateX: isOpen ? -45 : 0,
                y: isOpen ? -2 : 0,
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: '32px',
                height: '14px',
                borderRadius: '6px',
                background: 'linear-gradient(180deg, #E2E8F0 0%, #94A3B8 100%)',
                border: '1px solid #475569',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformOrigin: 'top center',
              }}
            >
              <div
                style={{
                  width: '9px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: '#334155',
                }}
              />
            </motion.div>
          </div>

          {/* Can Graphic Body (Authentic Diagonal Silver & Royal Blue Quadrants) */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              width: '100%',
              background: 'linear-gradient(135deg, #001F54 0%, #001F54 50%, #94A3B8 50%, #E2E8F0 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
            }}
          >
            {/* Metallic Brushed Sheen Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.18) 0%, transparent 35%, rgba(255,255,255,0.3) 70%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Glowing Golden Sun & Red Silhouette */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FACC15 0%, #EAB308 65%, #CA8A04 100%)',
                boxShadow: '0 0 14px rgba(250, 204, 21, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: '4px',
              }}
            >
              {/* Twin Crimson Red Bull Silhouettes / Heart Emblem */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: '#DC2626',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    fontWeight: 900,
                  }}
                >
                  ◀
                </span>
                <Heart size={10} color="#DC2626" fill="#DC2626" />
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: '#DC2626',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    fontWeight: 900,
                  }}
                >
                  ▶
                </span>
              </div>
            </div>

            {/* Bold Brand Typography */}
            <span
              style={{
                fontSize: '0.92rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                lineHeight: 1,
              }}
            >
              Red Bull
            </span>

            {/* Custom Tag */}
            <span
              style={{
                fontSize: '0.52rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                color: '#FEF08A',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '3px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
              }}
            >
              BOT EDITION
            </span>

            <span
              style={{
                fontSize: '0.45rem',
                fontFamily: 'var(--font-sans)',
                color: 'rgba(255, 255, 255, 0.85)',
                marginTop: '8px',
                letterSpacing: '0.04em',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              GIVES YOU WINGS
              <br />
              ACROSS THE MILES
            </span>
          </div>

          {/* Bottom Aluminum Rim */}
          <div
            style={{
              width: '100%',
              height: '16px',
              background: 'linear-gradient(90deg, #64748B 0%, #CBD5E1 35%, #F1F5F9 55%, #94A3B8 80%, #475569 100%)',
              borderTop: '1px solid rgba(0,0,0,0.3)',
            }}
          />
        </motion.div>
      </div>

      {/* TAP INSTRUCTION / OPEN STATE CONTROLS */}
      {!isOpen ? (
        <motion.button
          type="button"
          onClick={handleOpenCan}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: '1.2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
            border: '1px solid rgba(254, 240, 138, 0.5)',
            color: '#FEF3C7',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          }}
          aria-label="Tap to pop the tab"
        >
          <Sparkles size={15} color="#FDE68A" />
          <span>Tap to pop Bot's Red Bull tab ✦</span>
        </motion.button>
      ) : (
        /* REVEALED WARM EMOTIONAL NOTE & CARE DETAILS */
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel"
          style={{
            marginTop: '1.2rem',
            width: '100%',
            maxWidth: '460px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(254, 240, 138, 0.35)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(253, 230, 138, 0.15)',
          }}
        >
          {/* Nutrition / Energy Specs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1rem',
              fontSize: '0.74rem',
            }}
          >
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)' }}>ENERGY BOOST</span>
              <span style={{ fontWeight: 700, color: '#FDE68A' }}>+100% Starlight</span>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)' }}>WINGS STATUS</span>
              <span style={{ fontWeight: 700, color: '#A78BFA' }}>Flying to You 🪽</span>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)' }}>NET WT</span>
              <span style={{ fontWeight: 700, color: '#93C5FD' }}>Infinite Love</span>
            </div>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'var(--color-ivory)',
              marginBottom: '1.2rem',
              fontStyle: 'italic',
            }}
          >
            "They always say Red Bull gives you wings — but if it really did, I would have flown across every mile to see you by now.
            <br /><br />
            For all the late nights you study, work, or stay up talking with me: here’s your unlimited celestial can. Whenever you crack open a cold one in real life, know that I’m cheering for you, proud of you, and always right here."
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 1rem',
              }}
              aria-label="Refill can"
            >
              <RotateCcw size={14} />
              <span>Refill & pop again</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
