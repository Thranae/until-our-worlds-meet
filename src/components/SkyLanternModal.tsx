import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Flame } from 'lucide-react';

interface SkyLanternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanternReleased?: (wishText: string) => void;
}

const PRESET_WISHES = [
  "Until the day our worlds meet and I get to hug you tightly ✦",
  "More late-night laughter, video calls, and cold Red Bulls together 🪽",
  "Wishing you endless happiness, bright days, and boundless love, Bot ✦",
  "No matter how many miles between our cities, you are always close to me ✦",
];

export const SkyLanternModal: React.FC<SkyLanternModalProps> = ({
  isOpen,
  onClose,
  onLanternReleased,
}) => {
  const [selectedWish, setSelectedWish] = useState<string>(PRESET_WISHES[0]);
  const [customWish, setCustomWish] = useState<string>('');
  const [isReleasing, setIsReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  const playLanternChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      // Dreamy singing bowl / celestial harp chime arpeggio
      const freqs = [392.0, 523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.14);
        gain.gain.setValueAtTime(0.001, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.14 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 2.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 2.4);
      });
    } catch {
      // fallback
    }
  };

  const handleRelease = () => {
    const finalWish = customWish.trim() || selectedWish;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 60, 40]);
      } catch {
        // fallback
      }
    }

    playLanternChime();
    setIsReleasing(true);

    // Trigger canvas shooting star
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
    }

    setTimeout(() => {
      setReleased(true);
      if (onLanternReleased) {
        onLanternReleased(finalWish);
      }
    }, 1800);

    setTimeout(() => {
      setIsReleasing(false);
      setReleased(false);
      onClose();
    }, 4200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(6, 9, 22, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2rem 1.75rem',
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              border: '1px solid rgba(254, 240, 138, 0.35)',
              boxShadow: '0 25px 65px rgba(0,0,0,0.6), 0 0 35px rgba(253, 230, 138, 0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Close Button */}
            {!isReleasing && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            )}

            {/* Glowing Paper Lantern Graphic with Flickering Candlelight */}
            <div
              style={{
                position: 'relative',
                width: '120px',
                height: '140px',
                margin: '0 auto 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={
                  isReleasing
                    ? {
                        y: -350,
                        scale: 0.3,
                        opacity: [1, 0.8, 0],
                      }
                    : {
                        y: [-4, 4, -4],
                        rotate: [-1.5, 1.5, -1.5],
                      }
                }
                transition={
                  isReleasing
                    ? { duration: 2.2, ease: 'easeIn' }
                    : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                }
                style={{
                  position: 'relative',
                  width: '90px',
                  height: '115px',
                  borderRadius: '18px 18px 24px 24px',
                  background: 'radial-gradient(ellipse at 50% 65%, #F59E0B 0%, #D97706 40%, rgba(180, 83, 9, 0.85) 100%)',
                  boxShadow: '0 0 35px rgba(245, 158, 11, 0.65), 0 0 70px rgba(251, 191, 36, 0.3)',
                  border: '1.5px solid rgba(254, 240, 138, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Bamboo Ribs */}
                <div
                  style={{
                    position: 'absolute',
                    top: '28%',
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '62%',
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                />

                {/* Candle Flame Core */}
                <motion.div
                  animate={{
                    scale: [0.9, 1.15, 0.95, 1.1, 0.9],
                    opacity: [0.85, 1, 0.9, 1, 0.85],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '26px',
                    height: '38px',
                    borderRadius: '50% 50% 35% 35%',
                    background: 'radial-gradient(circle at 50% 70%, #FFFFFF 0%, #FEF08A 45%, #F59E0B 100%)',
                    boxShadow: '0 0 15px #FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Flame size={14} color="#B45309" fill="#B45309" />
                </motion.div>

                {/* Star Symbol on Lantern */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    fontSize: '0.62rem',
                    color: '#FEF3C7',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  ✦ BOT
                </span>
              </motion.div>
            </div>

            {!isReleasing && !released ? (
              <>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    color: 'var(--color-ivory)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Release a Midnight Sky Lantern
                </h3>

                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-muted)',
                    marginBottom: '1.25rem',
                    lineHeight: 1.5,
                  }}
                >
                  Write or choose a wish for Bot's birthday. Watch it lift into the night sky across our worlds.
                </p>

                {/* Preset Wish Chips */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginBottom: '1.2rem',
                    textAlign: 'left',
                  }}
                >
                  {PRESET_WISHES.map((wish, idx) => {
                    const isSelected = selectedWish === wish && !customWish;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedWish(wish);
                          setCustomWish('');
                        }}
                        style={{
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected
                            ? '1px solid rgba(254, 240, 138, 0.6)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#FEF3C7' : 'var(--color-ivory-dim)',
                          fontSize: '0.78rem',
                          lineHeight: 1.4,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left',
                        }}
                      >
                        {wish}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Wish Input */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <input
                    type="text"
                    placeholder="Or type your own secret wish..."
                    value={customWish}
                    onChange={(e) => setCustomWish(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(8, 11, 24, 0.7)',
                      border: '1px solid rgba(216, 204, 255, 0.2)',
                      color: 'var(--color-ivory)',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRelease}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    fontSize: '0.9rem',
                    padding: '0.75rem',
                  }}
                >
                  <Send size={15} />
                  <span>Release Lantern into the Universe ✦</span>
                </button>
              </>
            ) : (
              /* RELEASING / RELEASED CONFIRMATION */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '1rem 0' }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--color-gold-soft)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                >
                  <Sparkles size={16} />
                  <span>Ascending Into The Stars</span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.25rem',
                    color: 'var(--color-ivory)',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  "{customWish.trim() || selectedWish}"
                </p>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-muted)',
                    marginTop: '0.8rem',
                  }}
                >
                  Carried by starlight across every mile between us ✦
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
