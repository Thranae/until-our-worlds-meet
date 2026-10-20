import React, { useState, useEffect } from 'react';
import { Moon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const CelestialSkyClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="glass-panel-subtle"
      style={{
        width: '100%',
        maxWidth: '540px',
        padding: '1.25rem 1.5rem',
        marginTop: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* Left: Moon Phase */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #F5F0E8 0%, #D8CCFF 50%, #11152C 100%)',
            boxShadow: '0 0 16px rgba(216, 204, 255, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Moon size={18} color="#080B18" />
        </div>

        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.74rem',
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
              fontSize: '0.88rem',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Clock size={15} color="#94A3B8" />
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'block',
              fontSize: '0.74rem',
              color: 'var(--color-muted)',
              letterSpacing: '0.05em',
            }}
          >
            LOOKING UP TOGETHER
          </span>
          <span
            style={{
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              color: 'var(--color-ivory-dim)',
              letterSpacing: '0.08em',
            }}
          >
            {formatHoursMins(time)}
          </span>
        </div>
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
