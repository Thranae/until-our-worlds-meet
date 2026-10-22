import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Heart, Sparkles, Droplets } from 'lucide-react';

interface Droplet {
  x: number;
  y: number;
  vy: number;
  radius: number;
  length: number;
}

export const MistyWindow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isWiping, setIsWiping] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [wipedPercentage, setWipedPercentage] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [windowPhoto, setWindowPhoto] = useState<string>('/memories/IMG_20260701_200747_397.jpg');
  const dropletsRef = useRef<Droplet[]>([]);
  const isPointerDownRef = useRef(false);
  const hasSwipedRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Web Audio synthesizer for glass squeak and breath mist
  const playGlassSqueak = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 400, ctx.currentTime);
      filter.Q.setValueAtTime(4.0, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // safe fallback
    }
  }, []);

  const playBreathSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Filtered breath noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.3;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.5);
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 1.2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 1.2);
    } catch {
      // fallback
    }
  }, []);

  // Initialize and redraw frosted condensation layer on canvas
  const applyFrostedMist = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, alpha: number = 0.985) => {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // Dense cold midnight condensation base gradient that fully conceals what's behind
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, `rgba(22, 28, 50, ${alpha})`);
    grad.addColorStop(0.3, `rgba(35, 46, 78, ${alpha})`);
    grad.addColorStop(0.7, `rgba(42, 54, 88, ${alpha})`);
    grad.addColorStop(1, `rgba(18, 24, 44, ${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Frosted water vapor sheen
    const sheen = ctx.createRadialGradient(width * 0.5, height * 0.45, 10, width * 0.5, height * 0.45, width * 0.7);
    sheen.addColorStop(0, `rgba(165, 185, 220, ${alpha * 0.45})`);
    sheen.addColorStop(0.6, `rgba(125, 150, 190, ${alpha * 0.32})`);
    sheen.addColorStop(1, `rgba(80, 105, 150, ${alpha * 0.18})`);
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    // Fine condensation stippling grain (thousands of microscopic dew particles)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    for (let i = 0; i < 1100; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rr = Math.random() * 2.2 + 0.6;
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dew droplets on glass
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rr = Math.random() * 2.8 + 1.2;
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  // Set up canvas and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    applyFrostedMist(ctx, w, h);

    // Seed trickling water droplets on side margins (never across center text)
    dropletsRef.current = [
      { x: w * 0.08, y: 15, vy: 0.9, radius: 1.8, length: 0 },
      { x: w * 0.92, y: 35, vy: 1.0, radius: 1.8, length: 0 },
    ];

    let animId: number;
    let count = 0;

    const dropletLoop = () => {
      count++;
      // Only advance trickling droplets after user has interacted
      if (hasSwipedRef.current && count % 3 === 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        for (let i = 0; i < dropletsRef.current.length; i++) {
          const d = dropletsRef.current[i];
          d.y += d.vy;
          d.length += d.vy;

          // Droplet clears a thin trail in the mist
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.arc(d.x + Math.sin(d.y * 0.05) * 1.5, d.y, d.radius, 0, Math.PI * 2);
          ctx.fill();

          // Reset droplet when it runs off bottom
          if (d.y > h + 10) {
            d.y = -10;
            d.x = Math.random() < 0.5 ? w * (0.05 + Math.random() * 0.1) : w * (0.85 + Math.random() * 0.1);
            d.vy = Math.random() * 0.6 + 0.8;
          }
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(dropletLoop);
    };

    animId = requestAnimationFrame(dropletLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [applyFrostedMist]);

  // Wipe action using soft radial gradient eraser
  const wipeAt = useCallback((x: number, y: number, radius = 32) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!hasSwipedRef.current) {
      hasSwipedRef.current = true;
      setHasSwiped(true);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    // Soft feathered circular brush matching fingertip
    const brush = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
    brush.addColorStop(0, 'rgba(0, 0, 0, 1)');
    brush.addColorStop(0.7, 'rgba(0, 0, 0, 0.88)');
    brush.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = brush;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // If there is a previous point, interpolate to avoid broken lines
    if (lastPointRef.current) {
      const lx = lastPointRef.current.x;
      const ly = lastPointRef.current.y;
      const dist = Math.hypot(x - lx, y - ly);
      const steps = Math.max(1, Math.floor(dist / 6));

      for (let i = 1; i < steps; i++) {
        const ix = lx + (x - lx) * (i / steps);
        const iy = ly + (y - ly) * (i / steps);
        const midBrush = ctx.createRadialGradient(ix, iy, radius * 0.25, ix, iy, radius);
        midBrush.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        midBrush.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
        midBrush.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = midBrush;
        ctx.beginPath();
        ctx.arc(ix, iy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
    lastPointRef.current = { x, y };

    // Update wiped percentage estimate
    setWipedPercentage((prev) => Math.min(100, prev + 0.9));
  }, []);

  // Touch and pointer handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isPointerDownRef.current = true;
    setIsWiping(true);
    hasSwipedRef.current = true;
    setHasSwiped(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPointRef.current = { x, y };
    wipeAt(x, y);
    playGlassSqueak();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(14);
      } catch {
        // safe fallback
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasSwipedRef.current) {
      hasSwipedRef.current = true;
      setHasSwiped(true);
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    wipeAt(x, y);

    // Audio squeak feedback throttle
    if (Math.random() < 0.14) {
      playGlassSqueak();
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    lastPointRef.current = null;
    setIsWiping(false);
  };

  // Breathe on Glass feature: re-applies condensation mist with breath sound
  const handleBreathe = () => {
    setIsBreathing(true);
    playBreathSound();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 80, 30]);
      } catch {
        // fallback
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        // Re-fog window and hide text again
        setTimeout(() => {
          applyFrostedMist(ctx, rect.width, rect.height, 0.985);
          setWipedPercentage(0);
          setHasSwiped(false);
          hasSwipedRef.current = false;
        }, 300);
      }
    }

    setTimeout(() => {
      setIsBreathing(false);
    }, 1200);
  };

  // Draw Heart shape into mist automatically
  const handleDrawHeart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2 - 10;
    const scale = Math.min(rect.width, rect.height) * 0.009;

    hasSwipedRef.current = true;
    setHasSwiped(true);

    playGlassSqueak();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30, 20]);
      } catch {
        // fallback
      }
    }

    let t = 0;
    const step = 0.08;
    const drawInterval = setInterval(() => {
      if (t >= Math.PI * 2) {
        clearInterval(drawInterval);
        return;
      }
      // Parametric heart formula
      const x = cx + 16 * Math.pow(Math.sin(t), 3) * scale;
      const y = cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
      wipeAt(x, y, 18);
      t += step;
    }, 16);
  };

  // Clear all mist
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    hasSwipedRef.current = true;
    setHasSwiped(true);

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.restore();
    setWipedPercentage(100);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // fallback
      }
    }
  };

  // Text is revealed ONLY while swiping or after swiping
  const isRevealed = hasSwiped || isWiping || wipedPercentage > 4;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Interactive Window Frame Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 4.6',
          maxHeight: '520px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.15)',
          background: '#070913',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* UNDERLYING VIEW: Nocturnal Sky & Distant Horizon */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(ellipse at 50% 15%, rgba(124, 58, 237, 0.35) 0%, transparent 60%),
              radial-gradient(circle at 80% 25%, rgba(253, 230, 138, 0.3) 0%, transparent 40%),
              linear-gradient(180deg, #090B1A 0%, #11142A 45%, #1D1836 75%, #2A1F3D 100%)
            `,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem 1.5rem',
            boxSizing: 'border-box',
          }}
        >
          {/* REVEALED PHOTO LAYER (Gently appears as you wipe the condensation away) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              overflow: 'hidden',
            }}
          >
            <img
              src={windowPhoto}
              alt="Her smile revealed through the misty window"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.88) contrast(1.08)',
                transform: 'scale(1.03)',
                transition: 'opacity 0.6s ease',
              }}
            />
            {/* Atmospheric Nocturnal Glass Lighting Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(8, 11, 26, 0.35) 0%, rgba(14, 17, 38, 0.45) 55%, rgba(5, 7, 18, 0.92) 100%)',
              }}
            />
          </div>

          {/* Glowing Full Moon with Luminous Halo */}
          <div
            style={{
              position: 'absolute',
              top: '12%',
              right: '12%',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #FFFDF2 0%, #FDE68A 60%, #F59E0B 100%)',
              boxShadow: '0 0 35px rgba(253, 230, 138, 0.7), 0 0 70px rgba(245, 158, 11, 0.35)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Falling Rain Bokeh Streaks */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.4) 50%, transparent 100%), radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '80px 120px',
              opacity: 0.5,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Golden Secret Message: REVEALED ONLY WHILE SWIPING OR AFTER SWIPING */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              marginTop: 'auto',
              marginBottom: 'auto',
              padding: '1.25rem 1rem',
              opacity: isRevealed ? (isWiping ? Math.max(0.75, Math.min(1, wipedPercentage / 10)) : 1) : 0,
              transform: isRevealed ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.94)',
              filter: isRevealed ? 'blur(0px)' : 'blur(8px)',
              transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease-out',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              animate={isRevealed ? { opacity: [0.94, 1, 0.94] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  color: 'var(--color-gold-soft)',
                  fontSize: '0.82rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  marginBottom: '0.6rem',
                  fontFamily: 'var(--font-sans)',
                  textShadow: '0 0 12px rgba(253, 230, 138, 0.5)',
                }}
              >
                ✦ 02:00 AM • Our Shared Sky ✦
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.25rem, 4vw, 1.65rem)',
                  lineHeight: 1.45,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: '#FFFFFF',
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.9), 0 0 25px rgba(253, 230, 138, 0.45)',
                  margin: '0 0 0.8rem 0',
                }}
              >
                "No matter how many miles lie between our windows, we look at the very same moon."
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  color: 'var(--color-lavender)',
                  letterSpacing: '0.04em',
                  margin: 0,
                  textShadow: '0 1px 10px rgba(0,0,0,0.8)',
                }}
              >
                Happy Birthday, Bot. I’m thinking of you.
              </p>
              {wipedPercentage > 25 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '0.8rem',
                    fontSize: '0.74rem',
                    color: 'var(--color-gold-soft)',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    opacity: 0.88,
                    textShadow: '0 0 8px rgba(253, 230, 138, 0.4)',
                  }}
                >
                  ✦ 2 cities • 1 moon • Infinite memories ✦
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Distant City Skyline Silhouettes with Warm Amber Twinkles */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
              opacity: 0.65,
              pointerEvents: 'none',
            }}
          >
            {[45, 60, 35, 75, 50, 65, 80, 40, 55, 70, 48, 62, 78, 52].map((height, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${height}%`,
                  background: 'linear-gradient(180deg, #1A182F 0%, #0A0A14 100%)',
                  borderRadius: '2px 2px 0 0',
                  position: 'relative',
                }}
              >
                {/* Tiny warm yellow window dots */}
                {i % 2 === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '25%',
                      left: '30%',
                      width: '3px',
                      height: '3px',
                      background: '#FDE68A',
                      borderRadius: '1px',
                      boxShadow: '0 0 4px #F59E0B',
                      opacity: 0.8,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FRONT LAYER: HTML5 Canvas with Frosted Condensation */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            touchAction: 'none',
            zIndex: 4,
          }}
        />

        {/* Subtle center gesture prompt shown only before first swipe */}
        {!isRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Sparkles size={20} color="#FDE68A" />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.92)',
                letterSpacing: '0.04em',
                background: 'rgba(10, 14, 28, 0.75)',
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                whiteSpace: 'nowrap',
              }}
            >
              Swipe with finger to reveal words
            </span>
          </motion.div>
        )}

        {/* Breath Condensation Fog Overlay Animation */}
        <AnimatePresence>
          {isBreathing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 0.92, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(200, 215, 235, 0.85) 60%, transparent 100%)',
                backdropFilter: 'blur(10px)',
                pointerEvents: 'none',
                zIndex: 8,
              }}
            />
          )}
        </AnimatePresence>

        {/* Subtle Window Glass Glare & Pane Border Bevel */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '24px',
            border: '2px solid rgba(255, 255, 255, 0.18)',
            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 9,
          }}
        />

        {/* Interactive Prompt Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '0.85rem',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'calc(100% - 1.5rem)',
            width: 'max-content',
            padding: '0.36rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(11, 15, 30, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: 'var(--color-ivory)',
            fontSize: 'clamp(0.68rem, 2.3vw, 0.74rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            zIndex: 10,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Sparkles size={12} color="#FDE68A" />
          <span>
            {isWiping
              ? 'Wiping the mist... secret words appearing ✦'
              : hasSwiped || wipedPercentage > 5
              ? 'Message revealed through the clear glass ✦'
              : 'Swipe with your finger to wipe the mist'}
          </span>
        </div>
      </div>

      {/* Interactive Toolbar for Window Interactions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={handleBreathe}
          disabled={isBreathing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'var(--color-ivory)',
            fontSize: 'clamp(0.72rem, 2.4vw, 0.8rem)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'transform 0.15s ease-out, background 0.2s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Wind size={13} color="#A78BFA" />
          <span>Breathe on Glass</span>
        </button>

        <button
          type="button"
          onClick={handleDrawHeart}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#FCA5A5',
            fontSize: 'clamp(0.72rem, 2.4vw, 0.8rem)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'transform 0.15s ease-out, background 0.2s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart size={13} color="#EF4444" fill="#EF4444" />
          <span>Wipe a Heart</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(253, 230, 138, 0.1)',
            border: '1px solid rgba(253, 230, 138, 0.3)',
            color: 'var(--color-gold-soft)',
            fontSize: 'clamp(0.72rem, 2.4vw, 0.8rem)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'transform 0.15s ease-out, background 0.2s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Droplets size={13} color="#FDE68A" />
          <span>Clear Mist</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setWindowPhoto((prev) =>
              prev.includes('IMG')
                ? '/memories/1792580021104.jpg'
                : '/memories/IMG_20260701_200747_397.jpg'
            );
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(15);
              } catch {
                // fallback
              }
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(167, 139, 250, 0.12)',
            border: '1px solid rgba(167, 139, 250, 0.35)',
            color: '#DDD6FE',
            fontSize: 'clamp(0.72rem, 2.4vw, 0.8rem)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'transform 0.15s ease-out, background 0.2s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Sparkles size={13} color="#C084FC" />
          <span>{windowPhoto.includes('IMG') ? 'Starlight Photo' : 'Sunlit Photo'}</span>
        </button>
      </div>
    </div>
  );
};
