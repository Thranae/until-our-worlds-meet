import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, Sparkles } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface Bubble {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
}

type RedBullEdition = 'classic' | 'airdrop' | 'zaalima' | 'frost';

const REDBULL_EDITIONS: Record<
  RedBullEdition,
  {
    id: RedBullEdition;
    name: string;
    label: string;
    icon: string;
    badge: string;
    topFormula: string;
    brandText: string;
    subText: string;
    canBackground: string;
    sunGradient: string;
    bullColor: string;
    boostTitle: string;
    boostValue: string;
    wingsTitle: string;
    wingsValue: string;
    netContent: string;
    description: string;
  }
> = {
  classic: {
    id: 'classic',
    name: 'Classic Azure & Silver',
    label: 'Classic ✦',
    icon: '⚡',
    badge: 'BOT EDITION #1108',
    topFormula: 'ORIGINAL FORMULA',
    brandText: 'Red Bull',
    subText: 'ENERGY DRINK',
    canBackground: 'linear-gradient(135deg, #001B54 0%, #001B54 48%, #CBD5E1 48%, #E2E8F0 100%)',
    sunGradient: 'radial-gradient(circle, #FDE047 0%, #EAB308 60%, #CA8A04 100%)',
    bullColor: '#DC2626',
    boostTitle: 'ENERGY BOOST',
    boostValue: '+100% Starlight',
    wingsTitle: 'WINGS STATUS',
    wingsValue: 'Flying to You 🪽',
    netContent: 'Infinite Love',
    description:
      "They always say Red Bull gives you wings — but if it really did, I would have flown straight from Coimbatore to Chennai to celebrate with you by now.\n\nFor all those demanding study nights you conquered to graduate, and every bright dream ahead of you: here’s your unlimited celestial can. Whenever you crack open a cold one in real life, know that I’m endlessly proud of you, cheering for you, and always right here.",
  },
  airdrop: {
    id: 'airdrop',
    name: 'Erangel Airdrop Flare',
    label: 'BGMI Airdrop 📦',
    icon: '🎯',
    badge: 'AIRDROP SPECIAL #1',
    topFormula: 'MIL-SPEC FORMULA',
    brandText: 'Red Bull',
    subText: 'AIRDROP FUEL',
    canBackground: 'linear-gradient(135deg, #0F172A 0%, #0F172A 48%, #DC2626 48%, #991B1B 100%)',
    sunGradient: 'radial-gradient(circle, #EF4444 0%, #B91C1C 60%, #7F1D1D 100%)',
    bullColor: '#FEF08A',
    boostTitle: 'SNIPER ACCURACY',
    boostValue: '+500% AMR Damage',
    wingsTitle: 'SQUAD STATUS',
    wingsValue: 'Winner Winner #1 🍗',
    netContent: 'Squad Revive',
    description:
      "Forged in the crimson flare smoke of an Erangel crate drop. This can gives instant reaction time for .50 caliber AMR precision and zero recoil on late-night gaming sessions. You'll always have my cover from the high ground.",
  },
  zaalima: {
    id: 'zaalima',
    name: 'Zaalima Acoustic Night',
    label: 'Zaalima 🎶',
    icon: '✨',
    badge: 'ZAALIMA MELODY',
    topFormula: 'ACOUSTIC ESSENCE',
    brandText: 'Red Bull',
    subText: 'MIDNIGHT MELODY',
    canBackground: 'linear-gradient(135deg, #3B0764 0%, #3B0764 48%, #D97706 48%, #B45309 100%)',
    sunGradient: 'radial-gradient(circle, #F43F5E 0%, #BE123C 60%, #881337 100%)',
    bullColor: '#FEF08A',
    boostTitle: 'HEARTBEAT FREQ',
    boostValue: 'Slow & Peaceful 🎶',
    wingsTitle: 'MELODY VIBE',
    wingsValue: 'Zaalima 5% BGM',
    netContent: 'Warmth Across Miles',
    description:
      "Infused with the gentle notes of Zaalima playing softly at 5% volume in the background. A calming, sweet midnight brew for when you wrap yourself in a blanket and just want to listen to gentle music and talk about everything.",
  },
  frost: {
    id: 'frost',
    name: 'Starlight Frost Zero',
    label: 'Frost Zero ❄️',
    icon: '❄️',
    badge: 'ZERO SUGAR • 100% BOT',
    topFormula: 'CRYSTAL FROST',
    brandText: 'Red Bull',
    subText: 'SUGAR FREE',
    canBackground: 'linear-gradient(135deg, #0891B2 0%, #0891B2 48%, #F1F5F9 48%, #CBD5E1 100%)',
    sunGradient: 'radial-gradient(circle, #38BDF8 0%, #0284C7 60%, #0369A1 100%)',
    bullColor: '#0284C7',
    boostTitle: 'SUGAR CONTENT',
    boostValue: '0g • 100% Care',
    wingsTitle: 'REFRESH LEVEL',
    wingsValue: 'Glacial Chill ❄️',
    netContent: 'Endless Smile',
    description:
      "Zero artificial sweetness — only genuine pride and care for everything you do. Extra crisp, ice cold, with sparkling starlight condensation. Drink up and take on the world, birthday girl.",
  },
};

export const CelestialRedBull: React.FC = () => {
  const [selectedEdition, setSelectedEdition] = useState<RedBullEdition>('classic');
  const [isOpen, setIsOpen] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleCounterRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Synthesize realistic aluminum can tab-pop and crisp carbonation fizz
  const playCanPopAudio = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Mechanical aluminum stay-on tab snap
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(540, now);
      snapOsc.frequency.exponentialRampToValueAtTime(75, now + 0.05);
      snapGain.gain.setValueAtTime(0.4, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.07);

      // 2. High-pressure carbonation fizz (filtered white noise burst)
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
      filter.frequency.setValueAtTime(5000, now);
      filter.Q.setValueAtTime(1.6, now);

      const fizzGain = ctx.createGain();
      fizzGain.gain.setValueAtTime(0.001, now);
      fizzGain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      fizzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      whiteNoise.connect(filter);
      filter.connect(fizzGain);
      fizzGain.connect(ctx.destination);

      whiteNoise.start(now + 0.01);
      whiteNoise.stop(now + 0.65);

      // 3. Delicate crystal bell chime upon opening
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(880, now + 0.06);
      bellGain.gain.setValueAtTime(0.001, now + 0.06);
      bellGain.gain.linearRampToValueAtTime(0.14, now + 0.09);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      bellOsc.start(now + 0.06);
      bellOsc.stop(now + 1.5);
    } catch {
      // Audio context fallback if muted
    }
  };

  const playIceClinkAudio = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  };

  const edition = REDBULL_EDITIONS[selectedEdition];

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
    const newBubbles: Bubble[] = Array.from({ length: 24 }, () => {
      bubbleCounterRef.current += 1;
      return {
        id: bubbleCounterRef.current,
        x: Math.random() * 46 - 23,
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
    const interval = setInterval(() => {
      setBubbles((prev) => {
        bubbleCounterRef.current += 1;
        const fresh: Bubble = {
          id: bubbleCounterRef.current,
          x: Math.random() * 38 - 19,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 1.3 + 0.9,
          delay: 0,
        };
        const updated = [...prev.slice(-18), fresh];
        return updated;
      });
    }, 380);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Condensation water droplet positions (x%, y%, size)
  const droplets = [
    { x: 22, y: 35, s: 3.5 },
    { x: 30, y: 48, s: 4.5 },
    { x: 26, y: 72, s: 3 },
    { x: 74, y: 40, s: 4 },
    { x: 80, y: 65, s: 3.5 },
    { x: 68, y: 82, s: 5 },
    { x: 45, y: 28, s: 3 },
    { x: 55, y: 78, s: 4 },
    { x: 18, y: 60, s: 3.5 },
    { x: 85, y: 25, s: 3 },
  ];

  return (
    <div
      ref={containerRef}
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
          marginBottom: '1rem',
          lineHeight: 1.55,
        }}
      >
        Celebrating your milestone of graduating, and powering every bright dream ahead. Select an edition and tap the cold can to pop the tab.
      </p>

      {/* Interactive Edition / Mixology Selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.45rem',
          justifyContent: 'center',
          maxWidth: '460px',
          marginBottom: '1.5rem',
          zIndex: 5,
        }}
      >
        {(Object.keys(REDBULL_EDITIONS) as RedBullEdition[]).map((key) => {
          const item = REDBULL_EDITIONS[key];
          const isSelected = selectedEdition === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try {
                    navigator.vibrate(12);
                  } catch {}
                }
                setSelectedEdition(key);
                playIceClinkAudio();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: isSelected ? 700 : 500,
                background: isSelected ? 'rgba(253, 230, 138, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                border: isSelected ? '1px solid rgba(253, 230, 138, 0.65)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isSelected ? '#FEF3C7' : 'var(--color-muted)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.25s ease',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3D CAN & WINGS STAGE */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          height: '370px',
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
                width: '380px',
                height: '240px',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <svg
                viewBox="0 0 380 240"
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
                  d="M240,130 C275,70 320,35 375,60 C340,95 305,130 245,148 C290,148 335,135 365,118 C330,150 285,168 240,162 Z"
                  fill="url(#wingGradRightReal)"
                  animate={{
                    rotate: [3, -4, 3],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ transformOrigin: '240px 140px' }}
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
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '90px',
              pointerEvents: 'none',
              zIndex: 12,
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

        {/* ========================================================================= */}
        {/* STANDALONE REALISTIC 3D BEVERAGE CAN OBJECT (Physically Shaped Cylinder)   */}
        {/* ========================================================================= */}
        <motion.div
          onClick={handleOpenCan}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '126px',
            height: '290px',
            position: 'relative',
            zIndex: 4,
            cursor: isOpen ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            filter: isOpen
              ? 'drop-shadow(0 22px 35px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 35px rgba(253, 230, 138, 0.6))'
              : 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 25px rgba(37, 99, 235, 0.45))',
          }}
          aria-label={isOpen ? "Red Bull can opened" : "Tap to pop Bot's Red Bull can"}
        >
          {/* 1. TOP RIM & CHINE (Curved Inward Beveled Aluminum Top) */}
          <div
            style={{
              width: '104px',
              height: '26px',
              borderRadius: '50% 50% 0 0 / 14px 14px 0 0',
              background: 'linear-gradient(90deg, #64748B 0%, #CBD5E1 20%, #F8FAFC 45%, #94A3B8 75%, #475569 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.6)',
              borderBottom: 'none',
              boxShadow: 'inset 0 3px 6px rgba(255, 255, 255, 0.8), inset 0 -3px 6px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Recessed Lid Basin */}
            <div
              style={{
                width: '88px',
                height: '18px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse at 50% 40%, #E2E8F0 0%, #94A3B8 70%, #475569 100%)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Cold condensation vapor mist plume when popped */}
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.5, 0.2, 0],
                    y: [-4, -30],
                    scale: [0.8, 1.5],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    width: '32px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(200,230,255,0.3) 60%, transparent 100%)',
                    filter: 'blur(3px)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              )}

              {/* Stay-on Pull Tab with Teardrop Ring */}
              <motion.div
                animate={{
                  rotateX: isOpen ? -55 : 0,
                  y: isOpen ? -3 : 0,
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  width: '32px',
                  height: '15px',
                  borderRadius: '6px 6px 4px 4px',
                  background: 'linear-gradient(180deg, #F8FAFC 0%, #CBD5E1 50%, #64748B 100%)',
                  border: '1px solid #475569',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 4px',
                  transformOrigin: 'bottom center',
                  zIndex: 2,
                }}
              >
                {/* Teardrop finger pull hole */}
                <div
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: '#1E293B',
                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.9)',
                  }}
                />
                {/* Stay-on center rivet */}
                <div
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#E2E8F0',
                    border: '1px solid #475569',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* 2. TAPERED SLOPED NECK (Transitions from narrow rim to main body) */}
          <div
            style={{
              width: '100%',
              height: '14px',
              background: 'linear-gradient(90deg, #475569 0%, #94A3B8 22%, #F8FAFC 45%, #64748B 75%, #334155 100%)',
              clipPath: 'polygon(9% 0%, 91% 0%, 100% 100%, 0% 100%)',
              boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.5)',
            }}
          />

          {/* 3. MAIN CYLINDRICAL CAN BODY (Brushed Aluminum Cylinder with Vector Graphics) */}
          <div
            style={{
              width: '126px',
              height: '232px',
              position: 'relative',
              overflow: 'hidden',
              background: edition.canBackground,
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              borderRight: '1px solid rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.4rem',
            }}
          >
            {/* Top Can Text */}
            <div style={{ textAlign: 'center', width: '100%', zIndex: 2 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.48rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 800,
                  color: '#CBD5E1',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {edition.topFormula}
              </span>
            </div>

            {/* Radiant Golden Sun Disk with Twin Charging Red Bulls */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                margin: 'auto 0',
              }}
            >
              {/* Sun Disk */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: edition.sunGradient,
                  boxShadow: '0 0 16px rgba(234, 179, 8, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Twin Charging Red Bulls Silhouette with horns locking */}
                <svg viewBox="0 0 60 30" style={{ width: '50px', height: '26px' }}>
                  {/* Left Bull */}
                  <path
                    d="M26,16 C23,12 18,10 13,11 C11,9 7,8 3,11 C2,13 4,14 6,14 C8,14 9,16 11,18 C14,21 18,22 22,20 C24,19 25,17 26,16 Z"
                    fill={edition.bullColor}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />
                  {/* Right Bull */}
                  <path
                    d="M34,16 C37,12 42,10 47,11 C49,9 53,8 57,11 C58,13 56,14 54,14 C52,14 51,16 49,18 C46,21 42,22 38,20 C36,19 35,17 34,16 Z"
                    fill={edition.bullColor}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />
                  {/* Locked Horns Sparkle */}
                  <circle cx="30" cy="14" r="1.8" fill="#FFFFFF" />
                </svg>
              </div>

              {/* Bold Brand Typography */}
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: edition.bullColor,
                    letterSpacing: '-0.02em',
                    lineHeight: 0.95,
                    textShadow: '0 1px 0 #FFFFFF, 0 2px 4px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  {edition.brandText}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.52rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 900,
                    letterSpacing: '0.14em',
                    color: '#001B54',
                    textTransform: 'uppercase',
                    marginTop: '3px',
                    textShadow: '0 0.5px 0 #FFFFFF',
                  }}
                >
                  {edition.subText}
                </span>

                {/* Custom BOT EDITION Badge */}
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    background: edition.bullColor,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.52rem',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 900,
                      color: edition.bullColor === '#FEF08A' ? '#000000' : '#FFFFFF',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {edition.badge}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div style={{ textAlign: 'center', width: '100%', zIndex: 2 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.46rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  letterSpacing: '0.04em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                Vitalizes body and mind
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.5rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 800,
                  color: '#FEF08A',
                  letterSpacing: '0.06em',
                  marginTop: '1px',
                }}
              >
                250 ml ✦ Infinite Love
              </span>
            </div>

            {/* ======================================================= */}
            {/* CYLINDRICAL SPECULAR METALLIC SHADING OVERLAYS         */}
            {/* ======================================================= */}
            {/* Left Edge Curve Shadow */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '18px',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />

            {/* Ambient Shimmering Specular Highlight */}
            <motion.div
              animate={{ x: [0, 8, 0], opacity: [0.65, 0.95, 0.65] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '20px',
                width: '32px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.2) 70%, transparent 100%)',
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />

            {/* Right Rim Rim-Light Reflection */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '16px',
                background: 'linear-gradient(270deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.55) 100%)',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />

            {/* Fine Brushed Metal Lines */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />

            {/* Realistic Condensation Water Droplets */}
            {droplets.map((d, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: `${d.y}%`,
                  left: `${d.x}%`,
                  width: `${d.s}px`,
                  height: `${d.s * 1.3}px`,
                  borderRadius: '50% 50% 45% 45%',
                  background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(200,225,255,0.6) 50%, rgba(0,0,0,0.35) 100%)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  zIndex: 4,
                }}
              />
            ))}
          </div>

          {/* 4. TAPERED BOTTOM BASE (Curved inward aluminum bottom chime) */}
          <div
            style={{
              width: '100%',
              height: '18px',
              background: 'linear-gradient(90deg, #334155 0%, #64748B 20%, #E2E8F0 50%, #64748B 80%, #1E293B 100%)',
              clipPath: 'polygon(0% 0%, 100% 0%, 88% 100%, 12% 100%)',
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.7)',
            }}
          />

          {/* Bottom Rim */}
          <div
            style={{
              width: '94px',
              height: '6px',
              borderRadius: '0 0 50% 50% / 0 0 6px 6px',
              background: 'linear-gradient(90deg, #475569 0%, #CBD5E1 50%, #334155 100%)',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.6)',
            }}
          />

          {/* Tap hint badge on can when unopened */}
          {!isOpen && (
            <motion.div
              animate={{
                y: [0, -5, 0],
                opacity: [0.9, 1, 0.9],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 4px 15px rgba(217, 119, 6, 0.55)',
                color: '#FEF3C7',
                padding: '0.22rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                pointerEvents: 'none',
                zIndex: 10,
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
            padding: '1.25rem 1rem',
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
              gap: '0.35rem',
              padding: '0.65rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.1rem',
              fontSize: 'clamp(0.65rem, 2.4vw, 0.74rem)',
            }}
          >
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.62rem', whiteSpace: 'nowrap' }}>{edition.boostTitle}</span>
              <span style={{ fontWeight: 700, color: '#FDE68A', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)' }}>{edition.boostValue}</span>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.62rem', whiteSpace: 'nowrap' }}>{edition.wingsTitle}</span>
              <span style={{ fontWeight: 700, color: '#A78BFA', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)' }}>{edition.wingsValue}</span>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.62rem', whiteSpace: 'nowrap' }}>NET CONTENT</span>
              <span style={{ fontWeight: 700, color: '#93C5FD', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)' }}>{edition.netContent}</span>
            </div>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.04rem',
              lineHeight: 1.7,
              color: 'var(--color-ivory)',
              marginBottom: '1.4rem',
              fontStyle: 'italic',
              whiteSpace: 'pre-line',
            }}
          >
            {edition.description}
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
