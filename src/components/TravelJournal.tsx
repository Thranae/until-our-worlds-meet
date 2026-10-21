import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stamp, ChevronLeft, ChevronRight } from 'lucide-react';

interface Destination {
  title: string;
  location: string;
  tagline: string;
  desc: string;
  accent: string;
  emoji: string;
  stamped: boolean;
}

export const TravelJournal: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      title: 'Ladakh High-Altitude Stargazing',
      location: 'Himalayan Ridge • 4,500m',
      tagline: 'Under Billions of Unfiltered Stars',
      desc: 'Riding down the mountain pass with two cans of Red Bull in the backpack, wrapping up in warm blankets, and looking at the Milky Way without a single city light in sight.',
      accent: '#93C5FD',
      emoji: '🏔️',
      stamped: true,
    },
    {
      title: 'Midnight Coastal Drive & Sunset Beach',
      location: 'Goa Coastal Cliffs',
      tagline: 'Barefoot on Wet Sand at Dusk',
      desc: 'Watching the orange sun sink straight into the Arabian Sea, holding hands while the waves roll over our feet, and staying until the night breeze sets in.',
      accent: '#FDE68A',
      emoji: '🌊',
      stamped: false,
    },
    {
      title: 'Late Night Street Food Crawl',
      location: 'Old Quarter Night Market',
      tagline: 'Steaming Momos & Rain on the Awning',
      desc: 'Wandering under hanging string lights at midnight, sharing spicy momos and hot tea, laughing at silly inside jokes, and not checking the clock even once.',
      accent: '#F472B6',
      emoji: '🍜',
      stamped: false,
    },
  ]);

  // Rubber stamp thud sound synthesis
  const playStampSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Heavy stamp thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Safe fallback
    }
  };

  const handleToggleStamp = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 45]);
      } catch {
        // Safe fallback
      }
    }
    playStampSound();
    setDestinations((prev) =>
      prev.map((d, i) => (i === currentIndex ? { ...d, stamped: !d.stamped } : d))
    );
  };

  const currentDest = destinations[currentIndex];

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
      {/* Travel Scrapbook Polaroid Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(145deg, #181d33 0%, #0e1224 100%)',
          border: '1.5px solid rgba(216, 204, 255, 0.2)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.65)',
          padding: '1.4rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Decorative Washi Tape Strip at Top */}
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            width: '90px',
            height: '22px',
            background: 'rgba(251, 191, 36, 0.45)',
            border: '1px dashed rgba(253, 230, 138, 0.7)',
            borderRadius: '2px',
            transform: 'rotate(-2deg)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />

        {/* Photo Stage Area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '210px',
            borderRadius: 'var(--radius-md)',
            background: 'radial-gradient(ellipse at 50% 50%, #1c2340 0%, #0d1020 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: '3.8rem', marginBottom: '0.4rem', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))' }}>
            {currentDest.emoji}
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.74rem',
              color: currentDest.accent,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {currentDest.location}
          </span>

          {/* Red Passport Rubber Stamp (if stamped) */}
          <AnimatePresence>
            {currentDest.stamped && (
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 0.9, rotate: -14 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                style={{
                  position: 'absolute',
                  top: '25px',
                  right: '20px',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '2.5px solid #EF4444',
                  color: '#EF4444',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  transform: 'rotate(-14deg)',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                  userSelect: 'none',
                }}
              >
                APPROVED ✦ NOV 8
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Destination Information */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              color: 'var(--color-ivory)',
              marginBottom: '0.2rem',
            }}
          >
            {currentDest.title}
          </h3>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              marginBottom: '0.65rem',
            }}
          >
            {currentDest.tagline}
          </div>
          <p
            style={{
              color: 'var(--color-ivory-dim)',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {currentDest.desc}
          </p>
        </div>

        {/* Carousel & Stamp Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '0.2rem',
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : destinations.length - 1))}
            style={{
              padding: '0.55rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--color-ivory)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleToggleStamp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              background: currentDest.stamped
                ? 'rgba(239, 68, 68, 0.2)'
                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.18) 100%)',
              border: `1.5px solid ${currentDest.stamped ? '#EF4444' : 'rgba(251, 191, 36, 0.55)'}`,
              color: currentDest.stamped ? '#FCA5A5' : '#FDE68A',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <Stamp size={14} />
            <span>{currentDest.stamped ? 'Stamped: Approved ✦' : 'Stamp Bucket List'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % destinations.length)}
            style={{
              padding: '0.55rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--color-ivory)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
