import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Compass, Heart } from 'lucide-react';
import { siteContent } from '../data/siteContent';

export const PlanetPair: React.FC = () => {
  const [activePlanet, setActivePlanet] = useState<'her' | 'my' | null>(null);
  const [isBridging, setIsBridging] = useState(false);
  const hapticIntervalRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{
    oscillators: OscillatorNode[];
    masterGain: GainNode;
    heartbeatInterval?: number;
  } | null>(null);

  // Synthesize warm celestial harmony & rhythmic heartbeat pulse while holding
  const startBridgeAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      masterGain.connect(ctx.destination);

      // Warm harmonic celestial chord: F3 (174.6Hz), C4 (261.6Hz), A4 (440Hz), C5 (523.2Hz)
      const frequencies = [174.61, 261.63, 440.0, 523.25];
      const oscillators: OscillatorNode[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Low-pass filter for warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + idx * 200, now);

        oscGain.gain.setValueAtTime(0.35 / (idx + 1), now);
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        oscillators.push(osc);
      });

      // Rhythmic heartbeat thud every 950ms
      const playThump = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        try {
          const tNow = ctx.currentTime;
          // Lub (low 65Hz)
          const osc1 = ctx.createOscillator();
          const g1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(75, tNow);
          osc1.frequency.exponentialRampToValueAtTime(45, tNow + 0.12);
          g1.gain.setValueAtTime(0.18, tNow);
          g1.gain.exponentialRampToValueAtTime(0.001, tNow + 0.15);
          osc1.connect(g1);
          g1.connect(ctx.destination);
          osc1.start(tNow);
          osc1.stop(tNow + 0.16);

          // Dub (slightly higher 85Hz at +180ms)
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(90, tNow + 0.18);
          osc2.frequency.exponentialRampToValueAtTime(50, tNow + 0.32);
          g2.gain.setValueAtTime(0.14, tNow + 0.18);
          g2.gain.exponentialRampToValueAtTime(0.001, tNow + 0.35);
          osc2.connect(g2);
          g2.connect(ctx.destination);
          osc2.start(tNow + 0.18);
          osc2.stop(tNow + 0.36);
        } catch {
          // Safe fallback
        }
      };

      playThump();
      const heartbeatInterval = window.setInterval(playThump, 950);

      audioNodesRef.current = {
        oscillators,
        masterGain,
        heartbeatInterval,
      };
    } catch {
      // Safe fallback
    }
  }, []);

  const stopBridgeAudio = useCallback(() => {
    if (!audioNodesRef.current) return;
    try {
      const { oscillators, masterGain, heartbeatInterval } = audioNodesRef.current;
      if (heartbeatInterval) clearInterval(heartbeatInterval);

      if (audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        setTimeout(() => {
          oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // Safe fallback
            }
          });
          masterGain.disconnect();
        }, 360);
      }
    } catch {
      // Safe fallback
    }
    audioNodesRef.current = null;
  }, []);

  const startBridge = () => {
    setIsBridging(true);
    startBridgeAudio();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 50, 35]);
        hapticIntervalRef.current = window.setInterval(() => {
          try {
            navigator.vibrate([18, 65, 18]);
          } catch {
            // fallback
          }
        }, 700);
      } catch {
        // Safe fallback
      }
    }
  };

  const stopBridge = () => {
    setIsBridging(false);
    stopBridgeAudio();

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
      stopBridgeAudio();
    };
  }, [stopBridgeAudio]);

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '1rem 0',
      }}
    >
      {/* Interactive Visual Orbit Stage */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 0.5rem',
        }}
      >
        {/* Orbital Plane Area (Both Spheres, Heart, and Laser Beam share exact horizontal axis) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* SVG LASER LIGHT CONDUIT BEAM */}
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
              <linearGradient id="orbitBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#C084FC" stopOpacity={isBridging ? '1' : '0.6'} />
                <stop offset="35%" stopColor={isBridging ? '#FDE68A' : '#DDD6FE'} stopOpacity={isBridging ? '1' : '0.5'} />
                <stop offset="50%" stopColor={isBridging ? '#FFFBEB' : '#FEF3C7'} stopOpacity={isBridging ? '1' : '0.4'} />
                <stop offset="65%" stopColor={isBridging ? '#FDE68A' : '#DDD6FE'} stopOpacity={isBridging ? '1' : '0.5'} />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity={isBridging ? '1' : '0.6'} />
              </linearGradient>

              <filter id="beamGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={isBridging ? '5' : '2.5'} result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Base Line along exact 50% horizontal center */}
            <line
              x1="22%"
              y1="50%"
              x2="78%"
              y2="50%"
              stroke="url(#orbitBeamGrad)"
              strokeWidth={isBridging ? '3.5' : '1.5'}
              strokeDasharray={isBridging ? undefined : '4 6'}
              opacity={isBridging ? 1 : 0.45}
              filter={isBridging ? 'url(#beamGlow)' : undefined}
            />

            {/* High-velocity energy stream while bridging */}
            {isBridging && (
              <>
                <motion.line
                  x1="28%"
                  y1="50%"
                  x2="72%"
                  y2="50%"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="url(#beamGlow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Flowing photon pulses toward center */}
                <motion.circle
                  r={3.5}
                  fill="#FFFBEB"
                  filter="url(#beamGlow)"
                  animate={{
                    cx: ['30%', '50%'],
                    opacity: [0.2, 1],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    ease: 'easeIn',
                  }}
                  cy="50%"
                />
                <motion.circle
                  r={3.5}
                  fill="#FFFBEB"
                  filter="url(#beamGlow)"
                  animate={{
                    cx: ['70%', '50%'],
                    opacity: [0.2, 1],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    ease: 'easeIn',
                  }}
                  cy="50%"
                />
              </>
            )}

            {/* Ambient slow traveling photon in idle state */}
            {!isBridging && (
              <motion.circle
                r={2.5}
                cy="50%"
                fill="#FDE68A"
                animate={{
                  cx: ['28%', '72%', '28%'],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </svg>

          {/* HER WORLD PLANETARY SPHERE (Chennai, Left side) */}
          <motion.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: 3,
            }}
            initial={false}
            animate={{
              x: isBridging ? -36 : -78,
              y: '-50%',
              scale: isBridging ? 1.05 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 24,
              mass: 0.8,
            }}
          >
            <motion.button
              type="button"
              onClick={() => handleOpenPlanet('her')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              aria-label={`Open details for ${herWorld.label}`}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle at 35% 35%, #C084FC 0%, #7E22CE 60%, #3B0764 100%)',
                  boxShadow: isBridging
                    ? '0 0 35px rgba(192, 132, 252, 0.9), 0 0 18px #FDE68A'
                    : `0 0 25px ${herWorld.glowColor}, inset -4px -4px 10px rgba(0,0,0,0.6)`,
                  border: isBridging
                    ? '2px solid rgba(253, 230, 138, 0.9)'
                    : '1.5px solid rgba(216, 204, 255, 0.35)',
                  transition: 'box-shadow 0.3s ease, border 0.3s ease',
                }}
              >
                {/* Her Portrait blended into planetary sphere */}
                {herWorld.imagePath && (
                  <img
                    src={herWorld.imagePath}
                    alt={herWorld.label}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      opacity: isBridging ? 0.75 : 0.6,
                      mixBlendMode: 'luminosity',
                      pointerEvents: 'none',
                      transition: 'opacity 0.3s ease',
                    }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}

                {/* Planetary Orbit Ring */}
                <div
                  style={{
                    position: 'absolute',
                    width: '96px',
                    height: '26px',
                    borderRadius: '50%',
                    border: isBridging
                      ? '1.5px solid rgba(253, 230, 138, 0.65)'
                      : '1.5px solid rgba(216, 204, 255, 0.4)',
                    transform: 'rotate(-25deg)',
                    pointerEvents: 'none',
                    zIndex: 2,
                    boxShadow: isBridging ? '0 0 10px rgba(253, 230, 138, 0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />

                <Sparkles size={16} color="#F5F0E8" style={{ opacity: 0.85, zIndex: 3 }} />
              </div>
            </motion.button>
          </motion.div>

          {/* CENTER CONVERGENCE HEART (Appears precisely between meeting spheres) */}
          <AnimatePresence>
            {isBridging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 20,
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                {/* Soft Radiant Pulse Wave */}
                <motion.div
                  animate={{ scale: [0.85, 2.0], opacity: [0.75, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(253, 230, 138, 0.8)',
                    boxShadow: '0 0 14px rgba(253, 230, 138, 0.6)',
                  }}
                />

                {/* Central Luminous Heart Jewel Medallion */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #FFFBEB 0%, #FDE68A 35%, #EC4899 75%, #6B21A8 100%)',
                    boxShadow: '0 0 24px #FDE68A, 0 0 45px rgba(236, 72, 153, 0.65)',
                    border: '1.5px solid #FFFBEB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1.05, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.95,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Heart
                      size={17}
                      color="#FFFBEB"
                      fill="#FFFBEB"
                      style={{ filter: 'drop-shadow(0 1px 3px rgba(76, 29, 149, 0.6))' }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MY WORLD PLANETARY SPHERE (Coimbatore, Right side) */}
          <motion.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: 3,
            }}
            initial={false}
            animate={{
              x: isBridging ? 36 : 78,
              y: '-50%',
              scale: isBridging ? 1.05 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 24,
              mass: 0.8,
            }}
          >
            <motion.button
              type="button"
              onClick={() => handleOpenPlanet('my')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              aria-label={`Open details for ${myWorld.label}`}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle at 35% 35%, #93C5FD 0%, #2563EB 60%, #1E3A8A 100%)',
                  boxShadow: isBridging
                    ? '0 0 35px rgba(147, 197, 253, 0.9), 0 0 18px #FDE68A'
                    : `0 0 25px ${myWorld.glowColor}, inset -4px -4px 10px rgba(0,0,0,0.6)`,
                  border: isBridging
                    ? '2px solid rgba(253, 230, 138, 0.9)'
                    : '1.5px solid rgba(147, 197, 253, 0.35)',
                  transition: 'box-shadow 0.3s ease, border 0.3s ease',
                }}
              >
                {/* Atmospheric Crescent Accent */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 2.5,
                    borderRadius: '50%',
                    borderTop: '2px solid rgba(255, 255, 255, 0.55)',
                    transform: 'rotate(45deg)',
                  }}
                />

                <Compass size={16} color="#F5F0E8" style={{ opacity: 0.85 }} />
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* DEDICATED LABELS & STATUS ROW (Zero text overlap: seamlessly swaps between city labels and single bridged pill) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '0.4rem',
          }}
        >
          <AnimatePresence mode="wait">
            {!isBridging ? (
              <motion.div
                key="unbridged-labels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Left City: Chennai */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(calc(-50% - 78px))',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 600,
                      color: 'var(--color-lilac)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Chennai
                  </span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--color-muted)' }}>
                    Her World ✦
                  </span>
                </div>

                {/* Right City: Coimbatore */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(calc(-50% + 78px))',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 600,
                      color: 'var(--color-blue-soft)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Coimbatore
                  </span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--color-muted)' }}>
                    My World ✦
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="bridged-pill"
                initial={{ opacity: 0, scale: 0.92, y: 3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 3 }}
                transition={{ duration: 0.22 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(253, 230, 138, 0.14)',
                  border: '1px solid rgba(253, 230, 138, 0.45)',
                  boxShadow: '0 0 16px rgba(253, 230, 138, 0.22)',
                  backdropFilter: 'blur(8px)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Heart size={13} color="#FDE68A" fill="#FDE68A" />
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#FEF3C7',
                    letterSpacing: '0.02em',
                  }}
                >
                  0 km ✦ One Heart Across Tamil Nadu
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* INTERACTIVE HOLD TO BRIDGE DISTANCE BUTTON */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          width: '100%',
          maxWidth: '360px',
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
          whileTap={{ scale: 0.95 }}
          animate={
            isBridging
              ? {
                  boxShadow: '0 0 24px rgba(253, 230, 138, 0.65), 0 0 45px rgba(167, 139, 250, 0.4)',
                  borderColor: 'rgba(253, 230, 138, 0.9)',
                  background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.24) 0%, rgba(167, 139, 250, 0.32) 100%)',
                }
              : {}
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            padding: '0.75rem 1.4rem',
            minHeight: '48px',
            width: '100%',
            maxWidth: '320px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1.5px solid rgba(216, 204, 255, 0.32)',
            color: isBridging ? '#FEF3C7' : 'var(--color-ivory)',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none',
            transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          aria-label="Press and hold to bridge the distance between both worlds"
        >
          <motion.div
            animate={
              isBridging
                ? {
                    scale: [1, 1.3, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Heart
              size={15}
              color={isBridging ? '#FDE68A' : 'var(--color-lavender)'}
              fill={isBridging ? '#FDE68A' : 'none'}
            />
          </motion.div>
          <span>
            {isBridging ? 'Distance Bridged • Holding Close ✦' : 'Press & Hold to Bridge Distance ✦'}
          </span>
        </motion.button>

        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--color-subtle)',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: 1.3,
            padding: '0 0.5rem',
          }}
        >
          {isBridging
            ? '✦ Feeling synchronized heartbeat • Release to let go'
            : '✦ Tap either planet to read notes • Hold to bring worlds together'}
        </span>
      </div>

      {/* DETAIL MODAL / DRAWER */}
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
