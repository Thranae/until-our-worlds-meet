import React, { useState, useEffect } from 'react';
import { Moon, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const CelestialSkyClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [pulseSent, setPulseSent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simple astronomical lunar phase calculation
  const getMoonPhase = () => {
    const now = new Date();
    // Known reference new moon: Jan 11, 2024
    const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
    const cycle = 29.53058770576 * 86400 * 1000;
    const diff = (now.getTime() - refNewMoon) % cycle;
    const phaseFraction = diff / cycle;

    if (phaseFraction < 0.03 || phaseFraction > 0.97) return { name: 'New Moon', illumination: '1%' };
    if (phaseFraction < 0.22) return { name: 'Waxing Crescent', illumination: `${Math.round(phaseFraction * 200)}%` };
    if (phaseFraction < 0.28) return { name: 'First Quarter', illumination: '50%' };
    if (phaseFraction < 0.47) return { name: 'Waxing Gibbous', illumination: `${Math.round(phaseFraction * 100 + 40)}%` };
    if (phaseFraction < 0.53) return { name: 'Full Moon', illumination: '100%' };
    if (phaseFraction < 0.72) return { name: 'Waning Gibbous', illumination: `${Math.round((1 - phaseFraction) * 100 + 40)}%` };
    if (phaseFraction < 0.78) return { name: 'Last Quarter', illumination: '50%' };
    return { name: 'Waning Crescent', illumination: `${Math.round((1 - phaseFraction) * 200)}%` };
  };

  const moon = getMoonPhase();

  const formatHoursMins = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const sendHeartbeatPulse = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Heartbeat thump 1
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.08);
      g1.gain.setValueAtTime(0.35, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc1.connect(g1);
      g1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.11);

      // Heartbeat thump 2
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.frequency.setValueAtTime(75, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(35, now + 0.22);
      g2.gain.setValueAtTime(0.28, now + 0.14);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.25);
    } catch {
      // safe fallback
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 60, 25]);
      } catch {
        // safe fallback
      }
    }

    setPulseSent(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
    }
    setTimeout(() => setPulseSent(false), 3500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="glass-panel-subtle"
      style={{
        width: '100%',
        maxWidth: '540px',
        padding: '1rem 0.95rem',
        marginTop: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
      }}
    >
      {/* Left: Moon Phase */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #F5F0E8 0%, #D8CCFF 50%, #11152C 100%)',
            boxShadow: '0 0 16px rgba(216, 204, 255, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Moon size={17} color="#080B18" />
        </div>

        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-lavender)',
              fontWeight: 600,
            }}
          >
            SHARED LUNAR SKY
          </span>
          <span
            style={{
              fontSize: '0.84rem',
              color: 'var(--color-ivory)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 500,
            }}
          >
            {moon.name} • {moon.illumination} lit
          </span>
        </div>
      </div>

      {/* Right: Live Universe Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <Clock size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'block',
              fontSize: '0.72rem',
              color: 'var(--color-muted)',
              letterSpacing: '0.05em',
            }}
          >
            LOOKING UP TOGETHER
          </span>
          <span
            style={{
              fontSize: '0.84rem',
              fontFamily: 'monospace',
              color: 'var(--color-ivory-dim)',
              letterSpacing: '0.08em',
            }}
          >
            {formatHoursMins(time)}
          </span>
        </div>
      </div>

      {/* Interactive Heartbeat Pulse Button */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0',
        }}
      >
        <motion.button
          type="button"
          onClick={sendHeartbeatPulse}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: pulseSent ? 'rgba(239, 68, 68, 0.22)' : 'rgba(255, 255, 255, 0.06)',
            border: pulseSent ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(216, 204, 255, 0.22)',
            color: pulseSent ? '#FCA5A5' : 'var(--color-ivory)',
            fontSize: 'clamp(0.74rem, 2.5vw, 0.8rem)',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: pulseSent ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap',
          }}
          aria-label="Send a heartbeat pulse signal across the distance"
        >
          <Heart size={13} color={pulseSent ? "#F87171" : "#A78BFA"} fill={pulseSent ? "#F87171" : "none"} style={{ flexShrink: 0 }} />
          <span>{pulseSent ? 'Heartbeat Signal Sent ✦' : 'Send a Heartbeat Signal ✦'}</span>
        </motion.button>
        {pulseSent && (
          <motion.span
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '0.72rem', color: '#FDE68A', fontStyle: 'italic', textAlign: 'center' }}
          >
            Signal arrived at her world • 0ms latency • Orbiting as one
          </motion.span>
        )}
      </div>

      {/* Poetic Subtitle */}
      <div
        style={{
          width: '100%',
          paddingTop: '0.65rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '0.78rem',
            fontStyle: 'italic',
            color: 'var(--color-muted)',
            margin: 0,
          }}
        >
          ✦ Both under the same sky tonight — no distance changes the stars above us.
        </p>
      </div>
    </motion.div>
  );
};

