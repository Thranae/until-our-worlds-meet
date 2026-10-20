import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { siteContent, ConstellationStar } from '../data/siteContent';

interface CustomStar {
  id: number;
  x: number;
  y: number;
  freq: number;
}

const HARP_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]; // C D E G A C D E pentatonic

export const Constellation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hopes' | 'weaver'>('hopes');
  const [discoveredStars, setDiscoveredStars] = useState<number[]>([]);
  const [activeStarId, setActiveStarId] = useState<number | null>(null);
  const [pluckedLine, setPluckedLine] = useState<number | null>(null);

  // Custom Star Weaver state
  const [customStars, setCustomStars] = useState<CustomStar[]>([]);
  const [constellationName, setConstellationName] = useState("Bot's Zenith ✦");
  const [isSaved, setIsSaved] = useState(false);
  const skyBoxRef = useRef<HTMLDivElement | null>(null);

  const stars = siteContent.constellation.stars;

  // Synthesize crystal harp pluck sound
  const playHarpPluck = (freq: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.65);

      // Ethereal octave overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.07, now + 0.003);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.7);
    } catch {
      // safe fallback
    }
  };

  const handleStarClick = (star: ConstellationStar, idx: number) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {}
    }
    setActiveStarId(star.id);
    playHarpPluck(HARP_NOTES[idx % HARP_NOTES.length]);

    if (!discoveredStars.includes(star.id)) {
      const nextDiscovered = [...discoveredStars, star.id];
      setDiscoveredStars(nextDiscovered);

      if (nextDiscovered.length === stars.length) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
        }
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioCtx();
          const now = ctx.currentTime;
          const notes = [440.0, 554.37, 659.25, 880.0];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            gain.gain.setValueAtTime(0.001, now + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 1.9);
          });
        } catch {}
      }
    }
  };

  const handlePluckLine = (lineIdx: number) => {
    setPluckedLine(lineIdx);
    playHarpPluck(HARP_NOTES[(lineIdx + 2) % HARP_NOTES.length]);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch {}
    }
    setTimeout(() => setPluckedLine(null), 400);
  };

  // Custom Star Weaver Tap Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTab !== 'weaver' || !skyBoxRef.current || customStars.length >= 10) return;
    const rect = skyBoxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newStar: CustomStar = {
      id: Date.now(),
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      freq: HARP_NOTES[customStars.length % HARP_NOTES.length],
    };

    setCustomStars([...customStars, newStar]);
    playHarpPluck(newStar.freq);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(14); } catch {}
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
      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          marginBottom: '1rem',
          background: 'rgba(15, 23, 42, 0.65)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('hopes')}
          style={{
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'hopes' ? 600 : 400,
            background: activeTab === 'hopes' ? 'rgba(253, 230, 138, 0.2)' : 'transparent',
            border: activeTab === 'hopes' ? '1px solid rgba(253, 230, 138, 0.45)' : 'none',
            color: activeTab === 'hopes' ? '#FEF08A' : 'var(--color-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          ✦ Constellation of Hopes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weaver')}
          style={{
            padding: '0.35rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'weaver' ? 600 : 400,
            background: activeTab === 'weaver' ? 'rgba(167, 139, 250, 0.25)' : 'transparent',
            border: activeTab === 'weaver' ? '1px solid rgba(167, 139, 250, 0.45)' : 'none',
            color: activeTab === 'weaver' ? '#DDD6FE' : 'var(--color-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          ✨ Star Weaver (Draw Yours)
        </button>
      </div>

      {/* Main Interactive Constellation Sky Box */}
      <div
        ref={skyBoxRef}
        onClick={handleCanvasClick}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '290px',
          position: 'relative',
          overflow: 'hidden',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: activeTab === 'weaver' ? 'crosshair' : 'default',
        }}
      >
        {/* SVG Connection Lines */}
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
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.85" />
            </linearGradient>

            <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* TAB 1: Draw connecting lines for Hopes */}
          {activeTab === 'hopes' &&
            stars.map((star, idx) => {
              if (idx === 0) return null;
              const prev = stars[idx - 1];
              const isConnected = discoveredStars.includes(prev.id) && discoveredStars.includes(star.id);
              const isPlucked = pluckedLine === idx;

              return (
                <motion.line
                  key={`line-${prev.id}-${star.id}`}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${star.x}%`}
                  y2={`${star.y}%`}
                  stroke={isConnected ? 'url(#constGrad)' : 'rgba(216, 204, 255, 0.12)'}
                  strokeWidth={isConnected ? (isPlucked ? 3.5 : 2) : 1}
                  strokeDasharray={isConnected ? 'none' : '4 4'}
                  filter={isConnected ? 'url(#starGlow)' : 'none'}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isConnected ? 0.9 : 0.35,
                    strokeDashoffset: isPlucked ? [0, 8, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}

          {/* TAB 2: Draw connecting lines for Custom Star Weaver */}
          {activeTab === 'weaver' &&
            customStars.map((cStar, idx) => {
              if (idx === 0) return null;
              const prev = customStars[idx - 1];
              return (
                <motion.line
                  key={`custom-line-${idx}`}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${cStar.x}%`}
                  y2={`${cStar.y}%`}
                  stroke="url(#constGrad)"
                  strokeWidth={2}
                  filter="url(#starGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.95 }}
                  transition={{ duration: 0.4 }}
                />
              );
            })}
        </svg>

        {/* TAB 1: Interactive Hope Stars */}
        {activeTab === 'hopes' &&
          stars.map((star, idx) => {
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
                  onClick={() => handleStarClick(star, idx)}
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
                    cursor: 'pointer',
                  }}
                >
                  <Star
                    size={18}
                    fill={isDiscovered ? '#FDE68A' : 'none'}
                    color={isDiscovered ? '#FDE68A' : '#D8CCFF'}
                  />

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

        {/* TAB 2: Custom Weaved Stars */}
        {activeTab === 'weaver' &&
          customStars.map((cStar, idx) => (
            <motion.div
              key={cStar.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: 'absolute',
                left: `${cStar.x}%`,
                top: `${cStar.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle, #FDE68A 0%, rgba(167, 139, 250, 0.4) 70%, transparent 100%)',
                  boxShadow: '0 0 15px rgba(253, 230, 138, 0.8)',
                }}
              >
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#0F172A' }}>
                  {idx + 1}
                </span>
              </div>
            </motion.div>
          ))}

        {/* Central Ambient Hint */}
        {activeTab === 'hopes' && !activeStar && (
          <div style={{ textAlign: 'center', pointerEvents: 'none', zIndex: 5, padding: '0 1rem' }}>
            <Sparkles size={22} color="#D8CCFF" style={{ margin: '0 auto 0.5rem', opacity: 0.7 }} />
            <p
              style={{
                fontSize: '0.86rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--color-ivory-dim)',
              }}
            >
              ✦ Tap any glowing star to pluck its chime and reveal a shared hope
            </p>
          </div>
        )}

        {/* Star Weaver Hint */}
        {activeTab === 'weaver' && customStars.length === 0 && (
          <div style={{ textAlign: 'center', pointerEvents: 'none', zIndex: 5, padding: '0 1rem' }}>
            <Plus size={24} color="#DDD6FE" style={{ margin: '0 auto 0.4rem', opacity: 0.8 }} />
            <p
              style={{
                fontSize: '0.86rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: '#FEF08A',
              }}
            >
              ✦ Tap anywhere on this canvas to place up to 10 stars and draw your own constellation
            </p>
          </div>
        )}
      </div>

      {/* Interactive Pluck Buttons for Connected Strings */}
      {activeTab === 'hopes' && (
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            marginTop: '0.75rem',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
            PLUCK HARP CHORDS:
          </span>
          {[0, 1, 2].map((idx) => (
            <button
              key={`pluck-${idx}`}
              type="button"
              onClick={() => handlePluckLine(idx)}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FDE68A',
                fontSize: '0.68rem',
                cursor: 'pointer',
              }}
            >
              Chord #{idx + 1} 🎶
            </button>
          ))}
        </div>
      )}

      {/* Star Weaver Controls */}
      {activeTab === 'weaver' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            width: '100%',
            maxWidth: '560px',
            marginTop: '0.75rem',
          }}
        >
          <input
            type="text"
            value={constellationName}
            onChange={(e) => setConstellationName(e.target.value)}
            placeholder="Name your constellation..."
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(167, 139, 250, 0.4)',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              minWidth: '200px',
            }}
          />

          <button
            type="button"
            onClick={() => {
              setIsSaved(true);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
              }
              playHarpPluck(523.25);
              setTimeout(() => setIsSaved(false), 2500);
            }}
            disabled={customStars.length < 2}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: customStars.length >= 2 ? 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(167, 139, 250, 0.5)',
              color: '#FFFFFF',
              fontSize: '0.76rem',
              cursor: customStars.length >= 2 ? 'pointer' : 'not-allowed',
              opacity: customStars.length >= 2 ? 1 : 0.4,
            }}
          >
            {isSaved ? <Check size={13} color="#4ADE80" /> : <Sparkles size={13} />}
            <span>{isSaved ? 'Constellation Saved!' : 'Save to Sky'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCustomStars([])}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#FCA5A5',
              fontSize: '0.74rem',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Discovered Counter Indicator for Tab 1 */}
      {activeTab === 'hopes' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            margin: '0.75rem 0 0.4rem',
            fontSize: '0.78rem',
            color: 'var(--color-muted)',
          }}
        >
          <span>Discovered:</span>
          <span style={{ color: 'var(--color-gold-soft)', fontWeight: 600 }}>
            {discoveredStars.length} of {stars.length} hopes
          </span>
        </div>
      )}

      {/* Thought Reveal Card */}
      <AnimatePresence mode="wait">
        {activeTab === 'hopes' && activeStar && (
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
                fontSize: '1.4rem',
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
      {activeTab === 'hopes' && allDiscovered && (
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

export default Constellation;
