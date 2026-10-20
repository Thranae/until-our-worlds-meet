import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Zap, RotateCcw, Sparkles } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D Interactive Tilt on Mobile Touch / Mouse
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-15, 15]), springConfig);
  const glintX = useSpring(useTransform(mouseX, [-100, 100], [-30, 30]), springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Synthesize realistic aluminum can tab-pop and crisp carbonation fizz
  const playCanPopAudio = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Mechanical aluminum tab snap
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
      clickGain.gain.setValueAtTime(0.35, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(clickGain);
      clickGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);

      // 2. High-pressure carbonation fizz (white noise through bandpass filter)
      const bufferSize = Math.floor(ctx.sampleRate * 0.65);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4800, now);
      filter.Q.setValueAtTime(1.5, now);

      const fizzGain = ctx.createGain();
      fizzGain.gain.setValueAtTime(0.001, now);
      fizzGain.gain.linearRampToValueAtTime(0.26, now + 0.02);
      fizzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      whiteNoise.connect(filter);
      filter.connect(fizzGain);
      fizzGain.connect(ctx.destination);

      whiteNoise.start(now + 0.01);
      whiteNoise.stop(now + 0.65);

      // 3. Delicate starry chime note upon opening
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(880, now + 0.08); // A5
      chimeGain.gain.setValueAtTime(0.001, now + 0.08);
      chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.08);
      chimeOsc.stop(now + 1.3);
    } catch {
      // Audio context fallback if muted
    }
  };

  const handleOpenCan = () => {
    if (isOpen) return;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 45, 30]);
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
    const newBubbles: Bubble[] = Array.from({ length: 22 }, () => {
      bubbleCounterRef.current += 1;
      return {
        id: bubbleCounterRef.current,
        x: Math.random() * 48 - 24,
        size: Math.random() * 5 + 3,
        speed: Math.random() * 1.3 + 0.7,
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
          x: Math.random() * 40 - 20,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 1.4 + 0.9,
          delay: 0,
        };
        const updated = [...prev.slice(-18), fresh];
        return updated;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        width: '100%',
        maxWidth: '580px',
        margin: '2rem auto 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        perspective: '1000px',
      }}
    >
      {/* Eyebrow / Tag */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.9rem',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(37, 99, 235, 0.18) 100%)',
          border: '1px solid rgba(254, 240, 138, 0.4)',
          color: '#FEF3C7',
          fontSize: '0.74rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          boxShadow: '0 0 15px rgba(253, 230, 138, 0.15)',
        }}
      >
        <Zap size={13} color="#F87171" />
        <span>{siteContent.recipient.nickname.toUpperCase()}'S EMERGENCY CARE PACKAGE ✦ 250ML</span>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.5rem, 4vw, 1.85rem)',
          color: 'var(--color-ivory)',
          textAlign: 'center',
          marginBottom: '0.4rem',
        }}
      >
        The Infinite Starlight Can
      </h3>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-muted)',
          textAlign: 'center',
          maxWidth: '400px',
          marginBottom: '1.75rem',
          lineHeight: 1.55,
        }}
      >
        For the days you work so hard, the late-night study sessions, and every call across our timezones. Tap the cold can to pop the tab.
      </p>

      {/* 3D CAN & WINGS STAGE */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          height: '350px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* GLOWING CELESTIAL WINGS (Unfolds behind can when popped!) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '360px',
                height: '240px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <svg
                viewBox="0 0 360 240"
                style={{
                  width: '100%',
                  height: '100%',
                  filter: 'drop-shadow(0 0 25px rgba(253, 230, 138, 0.75))',
                }}
              >
                <defs>
                  <linearGradient id="wingGradLeftReal" x1="100%" y1="50%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="wingGradRightReal" x1="0%" y1="50%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Left Feather Wing */}
                <motion.path
                  d="M140,130 C105,70 60,35 5,60 C40,95 75,130 135,148 C90,148 45,135 15,118 C50,150 95,168 140,162 Z"
                  fill="url(#wingGradLeftReal)"
                  animate={{
                    rotate: [-3, 4, -3],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: '140px 140px' }}
                />

                {/* Right Feather Wing */}
                <motion.path
                  d="M220,130 C255,70 300,35 355,60 C320,95 285,130 225,148 C270,148 315,135 345,118 C310,150 265,168 220,162 Z"
                  fill="url(#wingGradRightReal)"
                  animate={{
                    rotate: [3, -4, 3],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: '220px 140px' }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIZZY BUBBLES STREAM (Rising from the top opening) */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '90px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {bubbles.map((b) => (
              <motion.div
                key={b.id}
                initial={{ y: 25, x: b.x, opacity: 0.95, scale: 0.4 }}
                animate={{ y: -80, opacity: 0, scale: 1.4 }}
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
                  background: 'radial-gradient(circle, #FFFFFF 0%, #FEF08A 50%, #93C5FD 100%)',
                  boxShadow: '0 0 8px #FDE68A, 0 0 15px rgba(147, 197, 253, 0.8)',
                }}
              />
            ))}
          </div>
        )}

        {/* REALISTIC 3D RED BULL CAN WITH TOUCH TILT */}
        <motion.div
          onClick={handleOpenCan}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          style={{
            width: '140px',
            height: '290px',
            position: 'relative',
            zIndex: 4,
            cursor: isOpen ? 'default' : 'pointer',
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            filter: isOpen
              ? 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 35px rgba(253, 230, 138, 0.6))'
              : 'drop-shadow(0 18px 30px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 20px rgba(37, 99, 235, 0.4))',
          }}
          aria-label={isOpen ? "Red Bull can opened" : "Tap to pop Bot's Red Bull can"}
        >
          {/* Photorealistic Rendered Can Image */}
          <img
            src="/images/redbull-bot-can.jpg"
            alt="Bot's Custom Red Bull Energy Drink Can"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '24px',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />

          {/* Dynamic Light Specular Sheen (glides across condensation droplets on tilt) */}
          <motion.div
            style={{
              position: 'absolute',
              top: '6%',
              bottom: '6%',
              left: '12%',
              right: '12%',
              borderRadius: '20px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.15) 55%, transparent 100%)',
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
              x: glintX,
            }}
          />

          {/* Frost / Cold Vapor Aura */}
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '30px',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(147, 197, 253, 0.15) 0%, transparent 70%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />

          {/* Interactive Tap Hint Badge when unopened */}
          {!isOpen && (
            <motion.div
              animate={{
                y: [0, -5, 0],
                opacity: [0.85, 1, 0.85],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 4px 15px rgba(217, 119, 6, 0.5)',
                color: '#FEF3C7',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.66rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                pointerEvents: 'none',
              }}
            >
              <Sparkles size={11} />
              <span>TAP TO POP</span>
            </motion.div>
          )}
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
            marginTop: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.7rem 1.6rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.28) 0%, rgba(59, 130, 246, 0.28) 100%)',
            border: '1px solid rgba(254, 240, 138, 0.55)',
            color: '#FEF3C7',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35), 0 0 15px rgba(253, 230, 138, 0.2)',
          }}
          aria-label="Tap to pop the tab"
        >
          <Sparkles size={16} color="#FDE68A" />
          <span>Tap to pop Bot's Red Bull tab ✦</span>
        </motion.button>
      ) : (
        /* REVEALED WARM EMOTIONAL NOTE & CARE DETAILS */
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel"
          style={{
            marginTop: '1.25rem',
            width: '100%',
            maxWidth: '480px',
            padding: '1.75rem 1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(254, 240, 138, 0.4)',
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.45), 0 0 30px rgba(253, 230, 138, 0.18)',
            position: 'relative',
          }}
        >
          {/* Nutrition / Energy Specs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.2rem',
              fontSize: '0.74rem',
            }}
          >
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.66rem' }}>ENERGY BOOST</span>
              <span style={{ fontWeight: 700, color: '#FDE68A' }}>+100% Starlight</span>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.66rem' }}>WINGS STATUS</span>
              <span style={{ fontWeight: 700, color: '#A78BFA' }}>Flying to You 🪽</span>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.66rem' }}>NET CONTENT</span>
              <span style={{ fontWeight: 700, color: '#93C5FD' }}>Infinite Love</span>
            </div>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.08rem',
              lineHeight: 1.75,
              color: 'var(--color-ivory)',
              marginBottom: '1.4rem',
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
                fontSize: '0.82rem',
                padding: '0.5rem 1.15rem',
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
