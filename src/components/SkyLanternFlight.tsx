import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface Cloud {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
}

interface DistantLantern {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
  flickerSpeed: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

interface SkyLanternFlightProps {
  onProceedToLetter: () => void;
}

export const SkyLanternFlight: React.FC<SkyLanternFlightProps> = ({ onProceedToLetter }) => {
  const [flightState, setFlightState] = useState<'ground' | 'ascending' | 'clouds' | 'stars'>('ground');
  const [lanternX, setLanternX] = useState(0); // offset from center
  const [wishText, setWishText] = useState("Until the day our worlds meet and we celebrate together ✦");
  const [customInput, setCustomInput] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Audio synthesizer for celestial singing bells during ascent
  const playAscentSoundscape = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Soft warm chord arpeggio (C - G - C - E - G)
      const freqs = [261.63, 392.0, 523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.25);
        gain.gain.setValueAtTime(0.001, now + idx * 0.25);
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.25 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.25 + 3.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.25);
        osc.stop(now + idx * 0.25 + 3.2);
      });
    } catch {
      // safe fallback
    }
  };

  const handleLaunch = () => {
    if (customInput.trim()) {
      setWishText(customInput.trim());
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 60, 40]);
      } catch {
        // fallback
      }
    }

    playAscentSoundscape();
    setFlightState('ascending');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
    }

    // Progression of flight through clouds into stars
    setTimeout(() => {
      setFlightState('clouds');
    }, 2800);

    setTimeout(() => {
      setFlightState('stars');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
      }
    }, 6500);
  };

  const handleReset = () => {
    setFlightState('ground');
    setLanternX(0);
    setCustomInput("");
  };

  // Touch drag steering for the lantern
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = (e.touches[0].clientX - touchStartX.current) * 0.6;
    setLanternX((prev) => Math.max(-120, Math.min(120, prev + diff * 0.1)));
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  // Dynamic Canvas for Volumetric Clouds, Distant Floating Lanterns, and Golden Embers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let clouds: Cloud[] = [];
    let distantLanterns: DistantLantern[] = [];
    let embers: Ember[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      // Generate cloud puff clusters
      clouds = [];
      for (let i = 0; i < 24; i++) {
        clouds.push({
          x: Math.random() * w,
          y: Math.random() * (h * 0.7) + h * 0.15,
          radius: Math.random() * 80 + 70,
          speed: Math.random() * 0.35 + 0.15,
          opacity: Math.random() * 0.25 + 0.12,
        });
      }

      // Generate distant floating lantern flotilla
      distantLanterns = [];
      for (let i = 0; i < 35; i++) {
        distantLanterns.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speed: Math.random() * 0.45 + 0.2,
          scale: Math.random() * 0.5 + 0.25,
          opacity: Math.random() * 0.6 + 0.3,
          flickerSpeed: Math.random() * 0.05 + 0.02,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const render = () => {
      frame++;
      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      ctx.clearRect(0, 0, w, h);

      // 1. Draw distant floating lanterns in the atmospheric depth
      for (let i = 0; i < distantLanterns.length; i++) {
        const dl = distantLanterns[i];
        dl.y -= dl.speed;
        if (dl.y < -30) {
          dl.y = h + 20;
          dl.x = Math.random() * w;
        }

        const flicker = Math.sin(frame * dl.flickerSpeed) * 0.15;
        const curAlpha = Math.max(0.1, dl.opacity + flicker);

        ctx.save();
        ctx.translate(dl.x, dl.y);
        ctx.scale(dl.scale, dl.scale);

        // Lantern glow
        const radGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
        radGrad.addColorStop(0, 'rgba(253, 230, 138, 0.8)');
        radGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Tiny paper lantern rectangle
        ctx.fillStyle = `rgba(245, 158, 11, ${curAlpha})`;
        ctx.beginPath();
        ctx.roundRect(-6, -9, 12, 18, 4);
        ctx.fill();

        // Inner candle speck
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 2. Volumetric drifting clouds (drifting horizontally with soft moonlight shading)
      // Occasional soft ambient lightning pulse inside cloud deck
      const isLightning = flightState === 'clouds' && (frame % 160 > 148);
      const lightningAlpha = isLightning ? (Math.sin(frame * 0.8) * 0.18 + 0.15) : 0;

      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        c.x -= c.speed;
        if (c.x < -c.radius * 2) {
          c.x = w + c.radius * 2;
          c.y = Math.random() * (h * 0.7) + h * 0.15;
        }

        const cloudGrad = ctx.createRadialGradient(c.x, c.y, c.radius * 0.2, c.x, c.y, c.radius);
        // If lantern is ascending through clouds, illuminate the clouds with warm candle rim-light!
        const isWarmCloud = flightState === 'clouds' || flightState === 'ascending';
        if (isWarmCloud) {
          const warmAlpha = Math.min(1, c.opacity * 0.65 + lightningAlpha);
          cloudGrad.addColorStop(0, `rgba(254, 240, 138, ${warmAlpha})`);
          cloudGrad.addColorStop(0.5, `rgba(167, 139, 250, ${c.opacity * 0.45 + lightningAlpha * 0.5})`);
          cloudGrad.addColorStop(1, 'transparent');
        } else {
          cloudGrad.addColorStop(0, `rgba(216, 204, 255, ${c.opacity * 0.5})`);
          cloudGrad.addColorStop(0.6, `rgba(15, 23, 42, ${c.opacity * 0.3})`);
          cloudGrad.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Golden floating embers trailing from active lantern
      if (flightState === 'ascending' || flightState === 'clouds') {
        const lanternScreenX = w / 2 + lanternX;
        const lanternScreenY = flightState === 'ascending' ? h * 0.55 : h * 0.35;

        if (Math.random() > 0.3) {
          embers.push({
            x: lanternScreenX + (Math.random() - 0.5) * 24,
            y: lanternScreenY + 40,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2.2 + 1,
            alpha: 0.95,
            size: Math.random() * 3.5 + 1.5,
          });
        }
      }

      // Draw and update embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const em = embers[i];
        em.x += em.vx;
        em.y += em.vy;
        em.alpha -= 0.02;

        if (em.alpha <= 0) {
          embers.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 230, 138, ${em.alpha})`;
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [flightState, lanternX]);

  return (
    <section
      id="chapter-sky-lanterns"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100%',
        minHeight: '100svh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '1.25rem',
        paddingTop: 'max(4.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(6.5rem, calc(env(safe-area-inset-bottom) + 5rem))',
        paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* Dynamic Background Canvas (Clouds, distant lanterns, starlight) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Atmospheric Cloud Fog Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            flightState === 'stars'
              ? 'radial-gradient(ellipse at 50% 20%, rgba(167, 139, 250, 0.18) 0%, rgba(8, 11, 24, 0.85) 100%)'
              : flightState === 'clouds'
              ? 'radial-gradient(ellipse at 50% 50%, rgba(254, 240, 138, 0.12) 0%, rgba(30, 27, 75, 0.7) 100%)'
              : 'radial-gradient(ellipse at 50% 80%, rgba(245, 158, 11, 0.12) 0%, rgba(8, 11, 24, 0.8) 100%)',
          transition: 'background 2s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* HEADER EYEBROW & TITLE */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '560px',
          zIndex: 10,
          position: 'relative',
        }}
      >
        <div
          className="eyebrow"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-gold-soft)',
            marginBottom: '0.4rem',
          }}
        >
          <Flame size={13} color="#F59E0B" fill="#F59E0B" />
          <span>CHAPTER 14 • THE ASCENT THROUGH THE CLOUDS</span>
        </div>

        <h2
          className="heading-chapter"
          style={{
            color: 'var(--color-ivory)',
            marginBottom: '0.5rem',
            fontSize: 'clamp(1.75rem, 5vw, 2.4rem)',
          }}
        >
          {flightState === 'stars'
            ? 'Above the clouds, with the stars'
            : flightState === 'clouds'
            ? 'Drifting through the moonlit clouds'
            : 'A lantern into the night sky'}
        </h2>

        <p
          className="body-text"
          style={{
            color: 'var(--color-muted)',
            fontSize: '0.88rem',
            maxWidth: '460px',
            margin: '0 auto',
          }}
        >
          {flightState === 'stars'
            ? `Your wish for ${siteContent.recipient.nickname} has entered the starlight expanse, sailing peacefully above every city.`
            : flightState === 'clouds'
            ? 'Ascending through the cloud layers, lighting up the sky across all the miles between us.'
            : 'In our little universe, wishes don’t stay trapped on the ground. Tap to light our lantern and watch it lift all the way into the clouds.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* HERO FLIGHT STAGE: THE PHYSICAL 3D FLOATING LANTERN                       */}
      {/* ========================================================================= */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          height: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        {/* Active Floating Lantern Entity */}
        <motion.div
          animate={
            flightState === 'ground'
              ? {
                  y: [-6, 6, -6],
                  rotate: [-1.5, 1.5, -1.5],
                  scale: 1,
                }
              : flightState === 'ascending'
              ? {
                  y: [-20, -120],
                  scale: [1, 0.95],
                  rotate: [-2, 3, -1],
                }
              : flightState === 'clouds'
              ? {
                  y: [-120, -180],
                  scale: [0.95, 0.8],
                  rotate: [1, -2, 1],
                }
              : {
                  y: [-180, -220, -200],
                  scale: [0.8, 0.65],
                  rotate: [-1, 1, -1],
                }
          }
          transition={
            flightState === 'ground'
              ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 3.5, ease: 'easeInOut' }
          }
          style={{
            position: 'relative',
            x: lanternX,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          {/* Luminous Lantern Body */}
          <div
            style={{
              position: 'relative',
              width: '124px',
              height: '160px',
              borderRadius: '24px 24px 34px 34px',
              background: 'radial-gradient(ellipse at 50% 65%, #FEF08A 0%, #F59E0B 35%, #D97706 70%, #78350F 100%)',
              boxShadow: '0 0 45px rgba(245, 158, 11, 0.8), 0 0 90px rgba(251, 191, 36, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.8)',
              border: '1.5px solid rgba(254, 240, 138, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 0.5rem',
            }}
          >
            {/* Bamboo Hoops / Translucent Paper Texture */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                width: '100%',
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '55%',
                width: '100%',
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '78%',
                width: '100%',
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
              }}
            />

            {/* Flickering Candle Flame Core */}
            <motion.div
              animate={{
                scale: [0.92, 1.12, 0.96, 1.08, 0.92],
                opacity: [0.9, 1, 0.92, 1, 0.9],
              }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '32px',
                height: '46px',
                borderRadius: '50% 50% 35% 35%',
                background: 'radial-gradient(circle at 50% 70%, #FFFFFF 0%, #FEF08A 40%, #F59E0B 80%, transparent 100%)',
                boxShadow: '0 0 20px #FFFFFF, 0 0 40px #FEF08A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
              }}
            >
              <Flame size={16} color="#B45309" fill="#B45309" />
            </motion.div>

            {/* Emblem on Lantern Paper */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#FEF3C7',
                letterSpacing: '0.12em',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
              }}
            >
              ✦ BOT ✦
            </span>
            <span
              style={{
                fontSize: '0.54rem',
                fontWeight: 700,
                color: '#FEF3C7',
                letterSpacing: '0.08em',
                opacity: 0.85,
              }}
            >
              11.08
            </span>
          </div>

          {/* Steer hint when in flight */}
          {flightState !== 'ground' && (
            <motion.span
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                marginTop: '1rem',
                fontSize: '0.72rem',
                color: 'var(--color-gold-soft)',
                fontStyle: 'italic',
                whiteSpace: 'nowrap',
              }}
            >
              ✦ Slide finger to guide lantern across the clouds
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CONTROLS / WISH DISPLAY                                       */}
      {/* ========================================================================= */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          zIndex: 10,
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          {flightState === 'ground' ? (
            <motion.div
              key="controls-ground"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(254, 240, 138, 0.35)',
                boxShadow: '0 12px 35px rgba(0,0,0,0.4), 0 0 25px rgba(253, 230, 138, 0.15)',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    color: 'var(--color-gold-soft)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem',
                  }}
                >
                  INSCRIPTION ON THE LANTERN
                </span>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={wishText}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(8, 11, 24, 0.75)',
                    border: '1px solid rgba(216, 204, 255, 0.25)',
                    color: 'var(--color-ivory)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    textAlign: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                  }}
                />
              </div>

              <motion.button
                type="button"
                onClick={handleLaunch}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 6px 25px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  borderColor: 'rgba(254, 240, 138, 0.7)',
                  fontSize: '0.92rem',
                  padding: '0.8rem',
                }}
              >
                <Flame size={17} />
                <span>Light & Release into the Clouds ✦</span>
              </motion.button>
            </motion.div>
          ) : flightState === 'stars' ? (
            <motion.div
              key="controls-stars"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{
                padding: '1.75rem 1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(254, 240, 138, 0.45)',
                boxShadow: '0 16px 45px rgba(0, 0, 0, 0.5), 0 0 35px rgba(253, 230, 138, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: 'var(--color-gold-soft)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem',
                }}
              >
                <Sparkles size={14} />
                <span>WISH ASCENDED BEYOND THE CLOUDS</span>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  color: 'var(--color-ivory)',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  marginBottom: '1.4rem',
                }}
              >
                “{wishText}”
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={onProceedToLetter}
                  className="btn-primary"
                  style={{
                    fontSize: '0.88rem',
                    padding: '0.65rem 1.4rem',
                  }}
                >
                  <span>Open Birthday Letter</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.65rem 1.1rem',
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Release Another</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="controls-ascending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', color: '#FEF3C7', padding: '1rem 0' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  textShadow: '0 0 15px rgba(253, 230, 138, 0.8)',
                }}
              >
                Sailing through the clouds with your wish... ✦
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
