import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { siteContent, ConstellationStar } from '../data/siteContent';

export const Constellation: React.FC = () => {
  const [discoveredStars, setDiscoveredStars] = useState<number[]>([]);
  const [activeStarId, setActiveStarId] = useState<number | null>(null);

  const stars = siteContent.constellation.stars;

  const handleStarClick = (star: ConstellationStar) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe fallback
      }
    }
    setActiveStarId(star.id);
    if (!discoveredStars.includes(star.id)) {
      setDiscoveredStars((prev) => [...prev, star.id]);
    }
  };

  const activeStar = stars.find((s) => s.id === activeStarId);
  const allDiscovered = discoveredStars.length === stars.length;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '1rem 0',
      }}
    >
      {/* Interactive Constellation Sky Box */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '280px',
          position: 'relative',
          overflow: 'hidden',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* SVG Connection Lines between discovered stars */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="constGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.8" />
            </linearGradient>

            <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Draw connecting lines between consecutive discovered stars */}
          {stars.map((star, idx) => {
            if (idx === 0) return null;
            const prev = stars[idx - 1];
            const isConnected = discoveredStars.includes(prev.id) && discoveredStars.includes(star.id);

            return (
              <motion.line
                key={`line-${prev.id}-${star.id}`}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${star.x}%`}
                y2={`${star.y}%`}
                stroke={isConnected ? 'url(#constGrad)' : 'rgba(216, 204, 255, 0.12)'}
                strokeWidth={isConnected ? 2 : 1}
                strokeDasharray={isConnected ? 'none' : '4 4'}
                filter={isConnected ? 'url(#starGlow)' : 'none'}
                initial={{ opacity: 0 }}
                animate={{ opacity: isConnected ? 0.85 : 0.35 }}
                transition={{ duration: 0.6 }}
              />
            );
          })}
        </svg>

        {/* 4 Interactive Stars */}
        {stars.map((star) => {
          const isDiscovered = discoveredStars.includes(star.id);
          const isSelected = activeStarId === star.id;

          return (
            <div
              key={star.id}
              style={{
                position: 'absolute',
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            >
              <motion.button
                type="button"
                onClick={() => handleStarClick(star)}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Star ${star.id}: ${star.thought}`}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDiscovered
                    ? 'radial-gradient(circle, rgba(253, 230, 138, 0.35) 0%, rgba(167, 139, 250, 0.15) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected
                    ? '2px solid #FDE68A'
                    : isDiscovered
                    ? '1.5px solid rgba(216, 204, 255, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isDiscovered
                    ? '0 0 18px rgba(253, 230, 138, 0.45)'
                    : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
              >
                <Star
                  size={18}
                  fill={isDiscovered ? '#FDE68A' : 'none'}
                  color={isDiscovered ? '#FDE68A' : '#D8CCFF'}
                />

                {/* Pulse ring for undiscovered stars to encourage tapping */}
                {!isDiscovered && (
                  <motion.span
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: '50%',
                      border: '1px solid rgba(167, 139, 250, 0.4)',
                    }}
                  />
                )}
              </motion.button>
            </div>
          );
        })}

        {/* Central Ambient Hint if none selected */}
        {!activeStar && (
          <div
            style={{
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 5,
              padding: '0 1rem',
            }}
          >
            <Sparkles size={22} color="#D8CCFF" style={{ margin: '0 auto 0.5rem', opacity: 0.7 }} />
            <p
              style={{
                fontSize: '0.86rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--color-ivory-dim)',
              }}
            >
              ✦ Tap any of the four glowing stars above to reveal a hope for our future
            </p>
          </div>
        )}
      </div>

      {/* Discovered Counter Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          margin: '1rem 0 0.5rem',
          fontSize: '0.78rem',
          color: 'var(--color-muted)',
        }}
      >
        <span>Discovered:</span>
        <span style={{ color: 'var(--color-gold-soft)', fontWeight: 600 }}>
          {discoveredStars.length} of {stars.length} hopes
        </span>
      </div>

      {/* Thought Reveal Card */}
      <AnimatePresence mode="wait">
        {activeStar && (
          <motion.div
            key={activeStar.id}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '1.5rem',
              marginTop: '0.75rem',
              border: '1px solid rgba(253, 230, 138, 0.35)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(253, 230, 138, 0.12)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                color: 'var(--color-gold-soft)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.45rem',
              }}
            >
              HOPE #{activeStar.id}
            </span>

            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                color: 'var(--color-ivory)',
                lineHeight: 1.45,
                margin: '0.2rem 0',
              }}
            >
              “{activeStar.thought}”
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celestial completion note when all 4 are uncovered */}
      {allDiscovered && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass-panel"
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem 1.75rem',
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(253, 230, 138, 0.1) 100%)',
            border: '1px solid rgba(253, 230, 138, 0.35)',
            boxShadow: '0 0 25px rgba(167, 139, 250, 0.2)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--color-gold-soft)',
              fontSize: '0.74rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.45rem',
            }}
          >
            <Sparkles size={13} />
            <span>ALL FOUR HOPES DISCOVERED • CELESTIAL ALIGNMENT</span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.15rem',
              color: 'var(--color-ivory)',
              lineHeight: 1.5,
              margin: '0.2rem 0',
            }}
          >
            ✦ The stars above our cities are aligned tonight.
          </p>
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-muted)',
              marginTop: '0.35rem',
              fontStyle: 'italic',
            }}
          >
            There's no rush to fix a date or promise a moment — knowing these possibilities exist is what makes waiting for you so special.
          </p>
        </motion.div>
      )}
    </div>
  );
};
