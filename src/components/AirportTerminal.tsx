import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Clock, Ticket, Heart } from 'lucide-react';
import { siteContent } from '../data/siteContent';

export const AirportTerminal: React.FC = () => {
  const [hasLanded, setHasLanded] = useState(false);

  // Sound synthesis: Airport mechanical flip-disc board clicks + melodic ding-dong chime
  const playAirportChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Two-tone airport chime (A4 -> F4 -> D4)
      const freqs = [440, 349.23, 293.66];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.28);
        gain.gain.setValueAtTime(0.001, now + idx * 0.28);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.28 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.28 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.28);
        osc.stop(now + idx * 0.28 + 1.3);
      });
    } catch {
      // Safe fallback
    }
  };

  const playFlipClick = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, now + i * 0.05);
        gain.gain.setValueAtTime(0.05, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.04);
      }
    } catch {
      // Safe fallback
    }
  };

  const handleSimulateArrival = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 60, 40, 80]);
      } catch {
        // Safe fallback
      }
    }
    playFlipClick();
    setTimeout(() => {
      playAirportChime();
      setHasLanded(true);
    }, 700);
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
      {/* Mechanical Split-Flap Terminal Board */}
      <div
        style={{
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(180deg, #0d111f 0%, #080b18 100%)',
          border: '2px solid rgba(216, 204, 255, 0.22)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.7)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Plane size={15} color="var(--color-gold-soft)" />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.76rem',
                color: 'var(--color-gold-soft)',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              ARRIVALS // TERMINAL ✦
            </span>
          </div>

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: '#34D399',
            }}
          >
            ● LIVE STATUS
          </div>
        </div>

        {/* Split-Flap Flight Row 1: Route */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontFamily: 'monospace',
          }}
        >
          <span style={{ color: 'var(--color-muted)', fontSize: '0.74rem' }}>FLIGHT</span>
          <span style={{ color: '#FDE68A', fontSize: '0.84rem', fontWeight: 600 }}>
            PW-1108 • NON-STOP
          </span>
        </div>

        {/* Split-Flap Flight Row 2: Route */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontFamily: 'monospace',
          }}
        >
          <span style={{ color: 'var(--color-muted)', fontSize: '0.74rem' }}>ROUTE</span>
          <span style={{ color: 'var(--color-ivory)', fontSize: '0.82rem' }}>
            MY WORLD ➔ {siteContent.recipient.nickname.toUpperCase()}&apos;S WORLD
          </span>
        </div>

        {/* Split-Flap Flight Row 3: Status (Dynamic Flip) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: hasLanded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.5)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${hasLanded ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
            fontFamily: 'monospace',
            transition: 'all 0.5s ease',
          }}
        >
          <span style={{ color: 'var(--color-muted)', fontSize: '0.74rem' }}>STATUS</span>
          <motion.span
            key={hasLanded ? 'landed' : 'scheduled'}
            initial={{ rotateX: -90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              color: hasLanded ? '#34D399' : '#FDE68A',
              fontSize: '0.84rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            {hasLanded ? '✦ TOUCHDOWN • FIRST HUG' : 'INBOUND • ON SCHEDULE'}
          </motion.span>
        </div>

        {/* Action Button: Simulate Arrival */}
        {!hasLanded ? (
          <button
            type="button"
            onClick={handleSimulateArrival}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.18) 100%)',
              border: '1.5px solid rgba(251, 191, 36, 0.5)',
              color: '#FDE68A',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '0.4rem',
              touchAction: 'manipulation',
            }}
          >
            <Clock size={15} />
            <span>Simulate Arrival Gate ✦</span>
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
              padding: '0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              marginTop: '0.4rem',
            }}
          >
            <Heart size={14} fill="currentColor" />
            <span>GATE OPEN • NO MORE SCREENS</span>
          </motion.div>
        )}
      </div>

      {/* Golden Boarding Pass Stub */}
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
          <Ticket size={14} />
          <span>The Day We Never Have to Say Goodbye</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          I replay this scene in my head all the time: standing behind the metal barriers at the arrival terminal, watching passenger after passenger walk out with their suitcases, and then finally spotting you. Walking up, putting everything down, and not letting go for a long, long time.
        </p>
      </div>
    </div>
  );
};
