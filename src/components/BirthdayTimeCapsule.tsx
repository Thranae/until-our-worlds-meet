import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Calendar, Moon, Heart } from 'lucide-react';

export const BirthdayTimeCapsule: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const playVaultOpenChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Radiant harp arpeggio (C5 - E5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 2.1);
      });
    } catch {
      // Safe fallback
    }
  }, []);

  const handleUnlock = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 60, 30, 80]);
      } catch {
        // Safe fallback
      }
    }
    playVaultOpenChime();
    setIsUnlocked(true);
  };

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
      {/* Astronomical Brass Combination Vault */}
      <div
        style={{
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(180deg, #181d33 0%, #0d1020 100%)',
          border: isUnlocked
            ? '2px solid rgba(251, 191, 36, 0.7)'
            : '1.5px solid rgba(216, 204, 255, 0.2)',
          boxShadow: isUnlocked
            ? '0 16px 45px rgba(245, 158, 11, 0.25), inset 0 0 30px rgba(245, 158, 11, 0.1)'
            : '0 12px 35px rgba(0, 0, 0, 0.6)',
          padding: 'clamp(1rem, 3.5vw, 1.5rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.2rem',
          transition: 'all 0.6s ease',
        }}
      >
        {/* Vault Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              fontSize: 'clamp(0.68rem, 2.3vw, 0.74rem)',
              letterSpacing: '0.08em',
              marginBottom: '0.3rem',
            }}
          >
            <Calendar size={13} />
            <span>CELESTIAL TIME CAPSULE // 08-NOV</span>
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.15rem, 3.8vw, 1.35rem)',
              color: 'var(--color-ivory)',
            }}
          >
            {isUnlocked ? '✦ The Vault of November 8th Unlocked ✦' : 'Align the Celestial Combination'}
          </h3>
        </div>

        {/* Tumbler Dials */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(0.4rem, 2vw, 0.9rem)',
            padding: '0.8rem clamp(0.7rem, 2.5vw, 1.4rem)',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(8, 11, 24, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            maxWidth: '100%',
          }}
        >
          {/* Day Tumbler */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>DAY</span>
            <div
              style={{
                width: 'clamp(52px, 15vw, 60px)',
                height: '52px',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #1f293d 0%, #111422 100%)',
                border: '1.5px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: 'clamp(1.2rem, 3.6vw, 1.4rem)',
                fontWeight: 700,
                color: '#FDE68A',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              08
            </div>
          </div>

          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.4rem' }}>•</span>

          {/* Month Tumbler */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>MONTH</span>
            <div
              style={{
                width: 'clamp(62px, 18vw, 74px)',
                height: '52px',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #1f293d 0%, #111422 100%)',
                border: '1.5px solid #A78BFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: 'clamp(1.05rem, 3.2vw, 1.2rem)',
                fontWeight: 700,
                color: '#D8CCFF',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              NOV
            </div>
          </div>

          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.4rem' }}>•</span>

          {/* Recipient Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>KEY</span>
            <div
              style={{
                width: 'clamp(52px, 15vw, 60px)',
                height: '52px',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #1f293d 0%, #111422 100%)',
                border: '1.5px solid #F472B6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: 'clamp(0.98rem, 3vw, 1.1rem)',
                fontWeight: 700,
                color: '#F472B6',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              BOT
            </div>
          </div>
        </div>

        {/* Unlock Action Button */}
        {!isUnlocked ? (
          <button
            type="button"
            onClick={handleUnlock}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem clamp(1rem, 3.5vw, 1.6rem)',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.18) 100%)',
              border: '1.5px solid rgba(251, 191, 36, 0.55)',
              color: '#FDE68A',
              fontSize: 'clamp(0.78rem, 2.6vw, 0.88rem)',
              fontWeight: 500,
              cursor: 'pointer',
              touchAction: 'manipulation',
              whiteSpace: 'nowrap',
            }}
          >
            <Lock size={15} />
            <span>Turn Combination & Unseal ✦</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: 'clamp(0.72rem, 2.4vw, 0.82rem)',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            <Unlock size={14} />
            <span>VAULT UNSEALED • DEDICATED TO BOT</span>
          </motion.div>
        )}
      </div>

      {/* Unlocked Astronomical Data Cards */}
      {isUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(14, 18, 36, 0.72)',
              border: '1px solid rgba(216, 204, 255, 0.12)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: 'var(--color-gold-soft)',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '0.35rem',
              }}
            >
              <Moon size={14} />
              <span>The Moon On Your Birthday</span>
            </div>
            <p style={{ color: 'var(--color-ivory-dim)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              On November 8th, the moon shines in a gentle crescent phase, illuminating the night sky with soft silver light. The stars that rose on the day you were born were placed there to make the world a warmer place.
            </p>
          </div>

          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(14, 18, 36, 0.72)',
              border: '1px solid rgba(216, 204, 255, 0.12)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#F472B6',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: '0.35rem',
              }}
            >
              <Heart size={14} fill="#F472B6" />
              <span>Why November 8th Matters</span>
            </div>
            <p style={{ color: 'var(--color-ivory-dim)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              Out of all 365 days in the calendar, November 8th is the one that gave me you. Every late-night match, every inside joke, every voice note that made a bad day bearable — all of it exists because of this day. Happy Birthday, Bot.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
