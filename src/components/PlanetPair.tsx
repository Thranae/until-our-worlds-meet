import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Compass, Heart } from 'lucide-react';
import { siteContent } from '../data/siteContent';

export const PlanetPair: React.FC = () => {
  const [activePlanet, setActivePlanet] = useState<'her' | 'my' | null>(null);
  const [isBridging, setIsBridging] = useState(false);
  const hapticIntervalRef = useRef<number | null>(null);

  const startBridge = () => {
    setIsBridging(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 50, 30]);
        hapticIntervalRef.current = window.setInterval(() => {
          try {
            navigator.vibrate([15, 60, 15]);
          } catch {
            // fallback
          }
        }, 650);
      } catch {
        // Safe fallback
      }
    }
  };

  const stopBridge = () => {
    setIsBridging(false);
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
      }
    };
  }, []);

  const handleOpenPlanet = (planet: 'her' | 'my') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe fallback
      }
    }
    setActivePlanet(planet);
  };

  const herWorld = siteContent.planets.herWorld;
  const myWorld = siteContent.planets.myWorld;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '1.25rem 0',
      }}
    >
      {/* Interactive Canvas / Visual Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '220px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
        }}
      >
        {/* Animated Connecting Line of Light */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <defs>
            <linearGradient id="orbitLineGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity={isBridging ? '1' : '0.8'} />
              <stop offset="50%" stopColor={isBridging ? '#FDE68A' : '#D8CCFF'} stopOpacity={isBridging ? '1' : '0.3'} />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity={isBridging ? '1' : '0.8'} />
            </linearGradient>

            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={isBridging ? '5' : '3'} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Soft background line */}
          <line
            x1="22%"
            y1="50%"
            x2="78%"
            y2="50%"
            stroke="url(#orbitLineGrad)"
            strokeWidth={isBridging ? '3.5' : '1.5'}
            strokeDasharray={isBridging ? undefined : '4 6'}
            opacity={isBridging ? 0.95 : 0.5}
            filter={isBridging ? 'url(#lineGlow)' : undefined}
          />

          {/* Animated pulse packet traveling between worlds */}
          <motion.circle
            r={isBridging ? 5 : 3}
            fill={isBridging ? '#FDE68A' : '#D8CCFF'}
            filter="url(#lineGlow)"
            animate={{
              cx: ['22%', '78%', '22%'],
              opacity: isBridging ? [0.8, 1, 0.8] : [0.3, 1, 0.3],
            }}
            transition={{
              duration: isBridging ? 2 : 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>

        {/* HER WORLD (Lavender Planet) */}
        <motion.div
          style={{ position: 'relative', zIndex: 2 }}
          animate={{
            x: isBridging ? 46 : 0,
            scale: isBridging ? 1.08 : 1,
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <motion.button
            type="button"
            onClick={() => handleOpenPlanet('her')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Open details for ${herWorld.label}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 35% 35%, #C084FC 0%, #7E22CE 60%, #3B0764 100%)',
                boxShadow: isBridging
                  ? '0 0 45px rgba(192, 132, 252, 0.9), 0 0 20px #FDE68A'
                  : `0 0 35px ${herWorld.glowColor}, inset -6px -6px 12px rgba(0,0,0,0.6)`,
                border: isBridging
                  ? '1.5px solid rgba(253, 230, 138, 0.8)'
                  : '1px solid rgba(216, 204, 255, 0.3)',
                transition: 'box-shadow 0.3s ease, border 0.3s ease',
              }}
            >
              {/* Planetary Rings */}
              <div
                style={{
                  position: 'absolute',
                  width: '126px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(216, 204, 255, 0.45)',
                  transform: 'rotate(-25deg)',
                  pointerEvents: 'none',
                }}
              />

              <Sparkles size={20} color="#F5F0E8" style={{ opacity: 0.8 }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  color: 'var(--color-lilac)',
                  letterSpacing: '0.02em',
                }}
              >
                {herWorld.label}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                Tap to explore
              </span>
            </div>
          </motion.button>
        </motion.div>

        {/* CENTER CONVERGENCE BADGE (Appears when worlds are held together) */}
        <AnimatePresence>
          {isBridging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '46%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none',
                textAlign: 'center',
                width: '190px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FDE68A 0%, #A78BFA 65%, rgba(59, 7, 100, 0.8) 100%)',
                  boxShadow: '0 0 28px #FDE68A, 0 0 50px rgba(167, 139, 250, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}
              >
                <Heart size={20} color="#3B0764" fill="#3B0764" />
              </div>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#FEF3C7',
                  textShadow: '0 0 10px rgba(253, 230, 138, 0.9)',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.04em',
                }}
              >
                Distance Bridged ✦
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(245, 240, 232, 0.9)',
                  fontStyle: 'italic',
                  marginTop: '2px',
                  lineHeight: 1.3,
                }}
              >
                One shared sky across every mile
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MY WORLD (Soft Blue Planet) */}
        <motion.div
          style={{ position: 'relative', zIndex: 2 }}
          animate={{
            x: isBridging ? -46 : 0,
            scale: isBridging ? 1.08 : 1,
          }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <motion.button
            type="button"
            onClick={() => handleOpenPlanet('my')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Open details for ${myWorld.label}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 35% 35%, #93C5FD 0%, #2563EB 60%, #1E3A8A 100%)',
                boxShadow: isBridging
                  ? '0 0 45px rgba(147, 197, 253, 0.9), 0 0 20px #FDE68A'
                  : `0 0 35px ${myWorld.glowColor}, inset -5px -5px 12px rgba(0,0,0,0.6)`,
                border: isBridging
                  ? '1.5px solid rgba(253, 230, 138, 0.8)'
                  : '1px solid rgba(147, 197, 253, 0.3)',
                transition: 'box-shadow 0.3s ease, border 0.3s ease',
              }}
            >
              {/* Subtle Atmospheric Crescent */}
              <div
                style={{
                  position: 'absolute',
                  inset: 2,
                  borderRadius: '50%',
                  borderTop: '2px solid rgba(255, 255, 255, 0.4)',
                  transform: 'rotate(45deg)',
                }}
              />

              <Compass size={18} color="#F5F0E8" style={{ opacity: 0.8 }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  color: 'var(--color-blue-soft)',
                  letterSpacing: '0.02em',
                }}
              >
                {myWorld.label}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                Tap to explore
              </span>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* INTERACTIVE HOLD TO BRIDGE THE DISTANCE BUTTON */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem',
          marginTop: '1.25rem',
        }}
      >
        <motion.button
          type="button"
          onPointerDown={startBridge}
          onPointerUp={stopBridge}
          onPointerLeave={stopBridge}
          onPointerCancel={stopBridge}
          onTouchStart={startBridge}
          onTouchEnd={stopBridge}
          onContextMenu={(e) => e.preventDefault()}
          whileTap={{ scale: 0.94 }}
          animate={
            isBridging
              ? {
                  boxShadow: '0 0 25px rgba(253, 230, 138, 0.6), 0 0 50px rgba(167, 139, 250, 0.4)',
                  borderColor: 'rgba(253, 230, 138, 0.9)',
                  background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.25) 0%, rgba(167, 139, 250, 0.35) 100%)',
                }
              : {}
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.65rem 1.45rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(216, 204, 255, 0.28)',
            color: isBridging ? '#FEF3C7' : 'var(--color-ivory)',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none',
            transition: 'all 0.25s ease',
          }}
          aria-label="Press and hold to bridge the distance between both worlds"
        >
          <Heart
            size={15}
            color={isBridging ? '#FDE68A' : 'var(--color-lavender)'}
            fill={isBridging ? '#FDE68A' : 'none'}
          />
          <span>
            {isBridging ? 'Holding Both Worlds Close ✦' : 'Press & Hold to Bridge Distance ✦'}
          </span>
        </motion.button>

        <span
          style={{
            fontSize: '0.74rem',
            color: 'var(--color-subtle)',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          ✦ Tap either planet to read notes • Hold button to draw worlds together
        </span>
      </div>

      {/* REFINED DETAIL MODAL / DRAWER */}
      <AnimatePresence>
        {activePlanet && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
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
              onClick={() => setActivePlanet(null)}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(8, 11, 24, 0.78)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel mobile-sheet-content"
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: '1.75rem 1.5rem',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Mobile grab handle */}
              <div
                style={{
                  width: '38px',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.22)',
                  margin: '0 auto 1.25rem',
                }}
              />
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActivePlanet(null)}
                aria-label="Close details"
                style={{
                  position: 'absolute',
                  top: '1.2rem',
                  right: '1.2rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--color-muted)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <X size={18} />
              </button>

              {/* Planet Icon & Header */}
              {activePlanet === 'her' ? (
                <>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(167, 139, 250, 0.15)',
                      color: 'var(--color-lavender)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginBottom: '0.85rem',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>{herWorld.label.toUpperCase()}</span>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.75rem',
                      color: 'var(--color-ivory)',
                      marginBottom: '1rem',
                    }}
                  >
                    {herWorld.title}
                  </h3>

                  {/* Image or Illustration Placeholder */}
                  {herWorld.imagePath ? (
                    <img
                      src={herWorld.imagePath}
                      alt={herWorld.title}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.2rem',
                        border: '1px solid var(--color-border)',
                      }}
                      onError={(e) => {
                        // If file missing, hide image cleanly
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '120px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.12) 0%, rgba(59, 7, 100, 0.3) 100%)',
                        border: '1px solid rgba(167, 139, 250, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.2rem',
                      }}
                    >
                      <Sparkles size={24} color="#C084FC" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        Celestial Sanctuary • {siteContent.recipient.nickname}'s Orbit
                      </span>
                    </div>
                  )}

                  <p className="body-text" style={{ color: 'var(--color-ivory-dim)', marginBottom: '1.5rem' }}>
                    {herWorld.personalNote}
                  </p>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(147, 197, 253, 0.15)',
                      color: 'var(--color-blue-soft)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginBottom: '0.85rem',
                    }}
                  >
                    <Compass size={13} />
                    <span>{myWorld.label.toUpperCase()}</span>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.75rem',
                      color: 'var(--color-ivory)',
                      marginBottom: '1rem',
                    }}
                  >
                    {myWorld.title}
                  </h3>

                  {myWorld.imagePath ? (
                    <img
                      src={myWorld.imagePath}
                      alt={myWorld.title}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.2rem',
                        border: '1px solid var(--color-border)',
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '120px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.12) 0%, rgba(30, 58, 138, 0.3) 100%)',
                        border: '1px solid rgba(147, 197, 253, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1.2rem',
                      }}
                    >
                      <Compass size={24} color="#93C5FD" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        Connected Across the Distance
                      </span>
                    </div>
                  )}

                  <p className="body-text" style={{ color: 'var(--color-ivory-dim)', marginBottom: '1.5rem' }}>
                    {myWorld.personalNote}
                  </p>
                </>
              )}

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActivePlanet(null)}
                style={{ width: '100%' }}
              >
                Close note
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
