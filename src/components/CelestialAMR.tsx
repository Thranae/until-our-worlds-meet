import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Sparkles, Award, Zap, RotateCcw, Eye } from 'lucide-react';
import { siteContent } from '../data/siteContent';

export const CelestialAMR: React.FC = () => {
  const [isCrateOpened, setIsCrateOpened] = useState(false);
  const [isScoped, setIsScoped] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [hasFired, setHasFired] = useState(false);
  const [scopeOffset, setScopeOffset] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Web Audio Synthesizer for Heavy .50 Cal AMR Shot & Bolt Action
  const playAMRFiringSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 1. Heavy Sub-Bass Explosion Kick (.50 Cal Powder Charge)
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, now);
      kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      kickGain.gain.setValueAtTime(0.7, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.6);

      // 2. High-Frequency Supersonic Bullet Crack
      const crackBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackData.length; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;

      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.setValueAtTime(3000, now);

      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.45, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ctx.destination);
      crackSource.start(now);

      // 3. Metallic Bolt Action Chamber Cycle (0.65s after shot)
      const boltTime = now + 0.55;
      const boltOsc = ctx.createOscillator();
      const boltGain = ctx.createGain();
      boltOsc.type = 'triangle';
      boltOsc.frequency.setValueAtTime(750, boltTime);
      boltOsc.frequency.exponentialRampToValueAtTime(280, boltTime + 0.08);

      boltGain.gain.setValueAtTime(0.001, boltTime);
      boltGain.gain.linearRampToValueAtTime(0.18, boltTime + 0.02);
      boltGain.gain.exponentialRampToValueAtTime(0.001, boltTime + 0.1);

      boltOsc.connect(boltGain);
      boltGain.connect(ctx.destination);
      boltOsc.start(boltTime);
      boltOsc.stop(boltTime + 0.12);

      // 4. Heavy Brass Shell Casing Clink (0.85s after shot)
      const shellTime = now + 0.85;
      const shellOsc = ctx.createOscillator();
      const shellGain = ctx.createGain();
      shellOsc.type = 'sine';
      shellOsc.frequency.setValueAtTime(2400, shellTime);
      shellOsc.frequency.exponentialRampToValueAtTime(2100, shellTime + 0.15);

      shellGain.gain.setValueAtTime(0.001, shellTime);
      shellGain.gain.linearRampToValueAtTime(0.12, shellTime + 0.01);
      shellGain.gain.exponentialRampToValueAtTime(0.0001, shellTime + 0.45);

      shellOsc.connect(shellGain);
      shellGain.connect(ctx.destination);
      shellOsc.start(shellTime);
      shellOsc.stop(shellTime + 0.5);

      // 5. Celebration Victory Chime (1.1s after shot)
      const chimeTime = now + 1.1;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(freq, chimeTime + idx * 0.08);

        cGain.gain.setValueAtTime(0.001, chimeTime + idx * 0.08);
        cGain.gain.linearRampToValueAtTime(0.15, chimeTime + idx * 0.08 + 0.02);
        cGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + idx * 0.08 + 1.2);

        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(chimeTime + idx * 0.08);
        cOsc.stop(chimeTime + idx * 0.08 + 1.3);
      });
    } catch {
      // safe fallback
    }
  }, []);

  // Crate Opening Audio
  const playCrateOpenSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Heavy metallic crate latch creak
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      // Airdrop whistle flare
      const whistle = ctx.createOscillator();
      const wGain = ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(600, now + 0.05);
      whistle.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

      wGain.gain.setValueAtTime(0.001, now + 0.05);
      wGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      wGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      whistle.connect(wGain);
      wGain.connect(ctx.destination);
      whistle.start(now + 0.05);
      whistle.stop(now + 0.65);
    } catch {
      // safe fallback
    }
  }, []);

  const handleOpenCrate = () => {
    setIsCrateOpened(true);
    playCrateOpenSound();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 80, 50]);
      } catch {
        // fallback
      }
    }
  };

  const handleFireAMR = () => {
    if (isFiring) return;
    setIsFiring(true);
    setHasFired(true);
    playAMRFiringSound();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 100, 40, 120]);
      } catch {
        // fallback
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
    }

    setTimeout(() => {
      setIsFiring(false);
    }, 1200);
  };

  // Touch handlers for scope drag
  const handleScopeTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX - scopeOffset.x,
      y: e.touches[0].clientY - scopeOffset.y,
    };
  };

  const handleScopeTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const nx = e.touches[0].clientX - touchStartRef.current.x;
    const ny = e.touches[0].clientY - touchStartRef.current.y;
    setScopeOffset({
      x: Math.max(-60, Math.min(60, nx)),
      y: Math.max(-40, Math.min(40, ny)),
    });
  };

  const handleScopeTouchEnd = () => {
    touchStartRef.current = null;
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
        gap: '1.5rem',
      }}
    >
      {/* ========================================================================= */}
      {/* STAGE 1: THE BGMI CELESTIAL AIRDROP CRATE                                 */}
      {/* ========================================================================= */}
      {!isCrateOpened ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            borderRadius: '24px',
            background: 'linear-gradient(160deg, #120914 0%, #1A0A17 50%, #0E0713 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.45)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.25)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Billowing Red Flare Smoke Embers */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '80px',
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 0%, rgba(220, 38, 38, 0.3) 50%, transparent 100%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
              animation: 'pulse 3s infinite',
            }}
          />

          {/* 3D Airdrop Crate Vector Illustration */}
          <div
            style={{
              width: '140px',
              height: '110px',
              margin: '0 auto 1.5rem auto',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Blue Heavy Tarp Roof */}
            <div
              style={{
                width: '100%',
                height: '38px',
                background: 'linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%)',
                borderRadius: '8px 8px 2px 2px',
                border: '1.5px solid #60A5FA',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Tarp Straps */}
              <div style={{ position: 'absolute', left: '22%', width: '4px', height: '100%', background: '#1E3A8A' }} />
              <div style={{ position: 'absolute', right: '22%', width: '4px', height: '100%', background: '#1E3A8A' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#DBEAFE', letterSpacing: '0.1em' }}>
                AIRDROP
              </span>
            </div>

            {/* Crimson Steel Container Base */}
            <div
              style={{
                width: '92%',
                height: '72px',
                background: 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)',
                borderRadius: '0 0 6px 6px',
                border: '1.5px solid #F87171',
                boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.6)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Vertical Corrugated Grooves */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.25) 12px, rgba(0,0,0,0.25) 16px)',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: '#FEF3C7',
                  letterSpacing: '0.12em',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}
              >
                BGMI #1108
              </span>
              <span
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '0.54rem',
                  fontWeight: 700,
                  color: '#FCA5A5',
                  letterSpacing: '0.08em',
                }}
              >
                FOR BOT ONLY
              </span>
            </div>
          </div>

          <span
            style={{
              display: 'inline-block',
              color: '#F87171',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            ✦ ZONE 1 • WHERE OUR WORLDS MET ✦
          </span>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              color: 'var(--color-ivory)',
              marginBottom: '0.8rem',
              fontWeight: 400,
            }}
          >
            A Crate from the Battleground
          </h3>

          <p
            style={{
              color: 'var(--color-starlight-muted)',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              maxWidth: '380px',
              margin: '0 auto 1.6rem auto',
            }}
          >
            Out of 100 players dropping into the battleground, you were the one who landed in my squad.
            Inside this airdrop is your absolute favorite weapon.
          </p>

          <motion.button
            type="button"
            onClick={handleOpenCrate}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.8rem 1.8rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
              border: '1.5px solid #FCA5A5',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 25px rgba(239, 68, 68, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
              touchAction: 'manipulation',
            }}
          >
            <Sparkles size={16} color="#FEF3C7" />
            <span>Open Bot's Airdrop Crate ✦</span>
          </motion.button>
        </motion.div>
      ) : (
        /* ========================================================================= */
        /* STAGE 2: THE LEGENDARY AMR .50 CAL SNIPER RIFLE SYSTEM                    */
        /* ========================================================================= */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '26px',
            background: 'linear-gradient(150deg, #110B18 0%, #170F22 50%, #0A0710 100%)',
            border: '1.5px solid rgba(251, 191, 36, 0.4)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(251, 191, 36, 0.15)',
            padding: '1.75rem 1.4rem',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Header Specs Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={15} color="#FDE68A" />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  color: '#FDE68A',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                AMR • Bot Edition
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.68rem',
                  color: '#EF4444',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}
              >
                .50 CALIBER
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.68rem',
                  color: '#FDE68A',
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}
              >
                AIRDROP EXCLUSIVE
              </span>
            </div>
          </div>

          {/* 3D AMR SNIPER RIFLE SILHOUETTE CANVAS / VECTOR */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '160px',
              background: 'radial-gradient(ellipse at 50% 50%, #1F1530 0%, #0C0814 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              overflow: 'hidden',
            }}
          >
            {/* Glowing Golden Aura / Starburst behind AMR */}
            <div
              style={{
                position: 'absolute',
                width: '180px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            {/* AMR Custom Vector Illustration */}
            <svg
              viewBox="0 0 420 120"
              style={{
                width: '94%',
                height: 'auto',
                filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8))',
              }}
            >
              <defs>
                <linearGradient id="amrMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="35%" stopColor="#1E293B" />
                  <stop offset="70%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                <linearGradient id="amrGoldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#FEF08A" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>

                <linearGradient id="amrScopeGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Muzzle Brake (.50 Cal Massive Dual-Baffle) */}
              <polygon points="12,50 32,46 32,68 12,64" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="18" y1="48" x2="18" y2="66" stroke="#94A3B8" strokeWidth="2" />
              <line x1="25" y1="47" x2="25" y2="67" stroke="#94A3B8" strokeWidth="2" />

              {/* Fluted Heavy Barrel */}
              <rect x="32" y="52" width="130" height="10" fill="url(#amrMetal)" stroke="#334155" strokeWidth="1" />
              <line x1="45" y1="57" x2="155" y2="57" stroke="#64748B" strokeWidth="1.5" strokeDasharray="6,4" />

              {/* Handguard & Carbon Shield */}
              <polygon points="160,48 235,48 230,72 165,72" fill="#1E293B" stroke="url(#amrGoldTrim)" strokeWidth="1.5" />
              {/* Ventilation heat slots */}
              <rect x="175" y="54" width="12" height="4" rx="1" fill="#0A0812" />
              <rect x="195" y="54" width="12" height="4" rx="1" fill="#0A0812" />
              <rect x="215" y="54" width="12" height="4" rx="1" fill="#0A0812" />

              {/* Folded Bipod beneath barrel */}
              <line x1="150" y1="62" x2="115" y2="76" stroke="#475569" strokeWidth="3" />
              <circle cx="150" cy="62" r="3" fill="#F59E0B" />

              {/* High-Powered 8x Sniper Scope */}
              <rect x="190" y="32" width="75" height="13" rx="2" fill="url(#amrMetal)" stroke="#F59E0B" strokeWidth="1" />
              {/* Scope Eyepiece & Bell Lens */}
              <polygon points="182,28 190,32 190,45 182,49" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
              <ellipse cx="183" cy="38.5" rx="2" ry="7" fill="url(#amrScopeGlass)" />
              <polygon points="265,32 275,29 275,48 265,45" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
              {/* Scope Mount Rings */}
              <rect x="205" y="44" width="6" height="5" fill="#475569" />
              <rect x="245" y="44" width="6" height="5" fill="#475569" />
              {/* Scope Adjustment Turrets */}
              <rect x="223" y="27" width="8" height="5" fill="#F59E0B" rx="1" />
              <rect x="224" y="35" width="6" height="3" fill="#D97706" />

              {/* Heavy Upper & Lower Receiver */}
              <polygon points="235,46 320,46 315,82 230,82" fill="url(#amrMetal)" stroke="#64748B" strokeWidth="1" />
              {/* Ejection Port & Bolt Handle */}
              <rect x="250" y="50" width="28" height="9" rx="1" fill="#050508" stroke="#F59E0B" strokeWidth="0.8" />
              <line x1="272" y1="52" x2="280" y2="44" stroke="#CBD5E1" strokeWidth="2.5" />
              <circle cx="280" cy="44" r="2.5" fill="#FEF08A" />

              {/* Bot Custom Inscription on Receiver */}
              <text x="245" y="72" fill="#FEF3C7" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">
                AMR • BOT #1108
              </text>

              {/* Heavy Bullpup Magazine (.50 BMG) */}
              <polygon points="290,75 318,75 312,106 286,104" fill="#0F172A" stroke="url(#amrGoldTrim)" strokeWidth="1.2" />
              {/* Magazine ribbing */}
              <line x1="289" y1="84" x2="315" y2="84" stroke="#334155" strokeWidth="1.5" />
              <line x1="288" y1="92" x2="314" y2="92" stroke="#334155" strokeWidth="1.5" />

              {/* Ergonomic Pistol Grip */}
              <polygon points="238,82 258,82 248,112 232,110" fill="#0F172A" stroke="#475569" strokeWidth="1" />
              {/* Trigger & Guard */}
              <path d="M 244 86 Q 248 94 242 96" stroke="#F59E0B" strokeWidth="2" fill="none" />
              <path d="M 238 84 Q 234 98 248 98" stroke="#475569" strokeWidth="1.5" fill="none" />

              {/* Bullpup Sniper Stock & Rubber Recoil Pad */}
              <polygon points="320,46 395,46 402,96 360,94 320,82" fill="url(#amrMetal)" stroke="#475569" strokeWidth="1" />
              <rect x="395" y="46" width="10" height="50" rx="3" fill="#0A0812" stroke="#F59E0B" strokeWidth="1" />
              {/* Adjustable Cheek Pad */}
              <rect x="335" y="38" width="45" height="8" rx="2" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
            </svg>
          </div>

          {/* Tactical Weapon Specs Display */}
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
              textAlign: 'center',
            }}
          >
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.64rem' }}>DAMAGE RATING</span>
              <span style={{ fontWeight: 800, color: '#EF4444' }}>ONE-SHOT (.50 Cal)</span>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.64rem' }}>FAVORITE TEAMMATE</span>
              <span style={{ fontWeight: 800, color: '#FDE68A' }}>Bot (MVP #1)</span>
            </div>
            <div>
              <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.64rem' }}>REVIVE STATUS</span>
              <span style={{ fontWeight: 800, color: '#60A5FA' }}>Always Watching</span>
            </div>
          </div>

          {/* Interactive Trigger Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsScoped(!isScoped)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                background: isScoped
                  ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                  : 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(96, 165, 250, 0.45)',
                color: '#DBEAFE',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              <Eye size={15} />
              <span>{isScoped ? 'Exit 8x Scope' : 'Scope In (8x) 🔭'}</span>
            </button>

            <motion.button
              type="button"
              onClick={handleFireAMR}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.35rem',
                borderRadius: 'var(--radius-full)',
                background: isFiring
                  ? '#FEF08A'
                  : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                border: '1px solid #FCA5A5',
                color: isFiring ? '#000000' : '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.45)',
                touchAction: 'manipulation',
              }}
            >
              <Crosshair size={15} />
              <span>{isFiring ? 'FIRING .50 CAL! 💥' : 'Fire AMR Flare ✦'}</span>
            </motion.button>
          </div>

          {/* ========================================================================= */}
          {/* OPTICAL 8X MIL-DOT SNIPER SCOPE OVERLAY                                   */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {isScoped && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                onTouchStart={handleScopeTouchStart}
                onTouchMove={handleScopeTouchMove}
                onTouchEnd={handleScopeTouchEnd}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  maxHeight: '340px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 50% 50%, rgba(8, 15, 30, 0.85) 0%, rgba(3, 7, 18, 0.98) 75%, #000000 100%)',
                  border: '6px solid #1E293B',
                  boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(96, 165, 250, 0.25)',
                  margin: '0 auto 1.25rem auto',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'crosshair',
                  touchAction: 'none',
                }}
              >
                {/* Simulated Night Sky View in Scope Reticle */}
                <div
                  style={{
                    position: 'absolute',
                    transform: `translate(${scopeOffset.x}px, ${scopeOffset.y}px)`,
                    textAlign: 'center',
                    padding: '1rem',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: '#60A5FA',
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.12em',
                      marginBottom: '0.35rem',
                    }}
                  >
                    TARGET LOCKED: {siteContent.recipient.nickname.toUpperCase()}
                  </span>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '0.98rem',
                      color: '#FEF3C7',
                      fontStyle: 'italic',
                      lineHeight: 1.45,
                      margin: 0,
                      textShadow: '0 0 10px rgba(254, 240, 138, 0.6)',
                    }}
                  >
                    "The best drop I ever made was landing in your squad."
                  </p>
                  <span
                    style={{
                      display: 'block',
                      color: 'rgba(253, 230, 138, 0.75)',
                      fontSize: '0.64rem',
                      fontFamily: 'monospace',
                      marginTop: '0.4rem',
                    }}
                  >
                    RANGE: 1,740 KM • KNOCKOUT IMMUNITY: 100%
                  </span>
                </div>

                {/* Scope Reticle Crosshairs (SVG) */}
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  {/* Outer Range Rings */}
                  <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="28%" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="14%" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />

                  {/* Crosshair Lines */}
                  <line x1="0%" y1="50%" x2="44%" y2="50%" stroke="#EF4444" strokeWidth="1.5" />
                  <line x1="56%" y1="50%" x2="100%" y2="50%" stroke="#EF4444" strokeWidth="1.5" />
                  <line x1="50%" y1="0%" x2="50%" y2="44%" stroke="#EF4444" strokeWidth="1.5" />
                  <line x1="50%" y1="56%" x2="50%" y2="100%" stroke="#EF4444" strokeWidth="1.5" />

                  {/* Center Aiming Dot */}
                  <circle cx="50%" cy="50%" r="2" fill="#EF4444" />

                  {/* Mil-dot Tick Marks */}
                  {[-30, -20, -10, 10, 20, 30].map((offset, i) => (
                    <circle key={`mx-${i}`} cx={`calc(50% + ${offset}px)`} cy="50%" r="1.2" fill="#EF4444" />
                  ))}
                  {[-30, -20, -10, 10, 20, 30].map((offset, i) => (
                    <circle key={`my-${i}`} cx="50%" cy={`calc(50% + ${offset}px)`} r="1.2" fill="#EF4444" />
                  ))}
                </svg>

                {/* Scope Hint */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    fontSize: '0.64rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'monospace',
                  }}
                >
                  DRAG RETICLE TO SCAN SKY
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* WINNER WINNER BIRTHDAY DINNER VICTORY CELEBRATION                         */}
          {/* ========================================================================= */}
          {hasFired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.5)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)',
                padding: '1.25rem 1rem',
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#FEF08A',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '0.35rem',
                }}
              >
                <Award size={16} color="#F59E0B" />
                <span>#1 / 100 • MATCH RESULT: VICTORY</span>
              </div>

              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  color: '#FFFFFF',
                  margin: '0 0 0.5rem 0',
                  textShadow: '0 0 15px rgba(254, 240, 138, 0.6)',
                }}
              >
                WINNER WINNER BIRTHDAY DINNER! ✦
              </h4>

              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.84rem',
                  color: 'var(--color-ivory)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                They say the AMR shoots through level 3 helmets and vehicles, but it never stood a chance against you.
                No matter how chaotic the zone gets, you're always my #1 teammate.
              </p>
            </motion.div>
          )}

          {/* Reset Crate Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsCrateOpened(false);
                setIsScoped(false);
                setHasFired(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'none',
                border: 'none',
                color: 'var(--color-starlight-muted)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <RotateCcw size={12} />
              <span>Call another airdrop</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
