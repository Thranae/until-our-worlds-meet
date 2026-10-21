import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Palette, Wind, RotateCcw, Flame, Heart } from 'lucide-react';

interface AuroraPoint {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: number;
  width: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  color: string;
}

interface AmbientStar {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
}

export const AuroraSky: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [palette, setPalette] = useState<'emerald' | 'amethyst' | 'solar'>('emerald');
  const [paintCount, setPaintCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isHoldingHands, setIsHoldingHands] = useState(true);
  const [candleLit, setCandleLit] = useState(true);
  const [callMessage, setCallMessage] = useState<string | null>(null);

  const pointsRef = useRef<AuroraPoint[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const ambientStarsRef = useRef<AmbientStar[]>([]);
  const lastAudioTimeRef = useRef<number>(0);

  // Audio synthesis: Celestial crystal glass harp chimes tied to touch coordinates
  const playHarpNote = useCallback((normalizedY: number) => {
    const now = performance.now();
    if (now - lastAudioTimeRef.current < 75) return;
    lastAudioTimeRef.current = now;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const ctxNow = ctx.currentTime;

      // Pentatonic celestial scale: higher touch = higher crystal pitch
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const index = Math.min(
        scale.length - 1,
        Math.max(0, Math.floor((1 - normalizedY) * scale.length))
      );
      const freq = scale[index];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctxNow);

      gain.gain.setValueAtTime(0.001, ctxNow);
      gain.gain.linearRampToValueAtTime(0.12, ctxNow + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctxNow + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctxNow);
      osc.stop(ctxNow + 1.25);
    } catch {
      // Safe fallback
    }
  }, []);

  // Sky: Children of the Light signature deep chime call sound synthesis
  const playSkyCallSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const ctxNow = ctx.currentTime;

      // Resonant angelic fourth/fifth chord (Eb5=622Hz, Bb5=932Hz, Eb6=1244Hz, G6=1568Hz)
      const chord = [622.25, 932.33, 1244.5, 1567.98];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctxNow);

        gain.gain.setValueAtTime(0.001, ctxNow);
        gain.gain.linearRampToValueAtTime(0.13 / (idx + 1), ctxNow + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctxNow + 1.6 + idx * 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctxNow);
        osc.stop(ctxNow + 2.0 + idx * 0.3);
      });
    } catch {
      // Safe fallback
    }
  }, []);

  const getPaletteColors = useCallback(() => {
    switch (palette) {
      case 'amethyst':
        return {
          baseHue: 280,
          color1: 'rgba(168, 85, 247, ',
          color2: 'rgba(236, 72, 153, ',
          starColor: '#F472B6',
          capeBoy: '#1E1B4B',
          capeGirl: '#831843',
          glowColor: '#EC4899',
        };
      case 'solar':
        return {
          baseHue: 42,
          color1: 'rgba(245, 158, 11, ',
          color2: 'rgba(253, 230, 138, ',
          starColor: '#FDE68A',
          capeBoy: '#1E293B',
          capeGirl: '#B45309',
          glowColor: '#F59E0B',
        };
      case 'emerald':
      default:
        return {
          baseHue: 160,
          color1: 'rgba(16, 185, 129, ',
          color2: 'rgba(6, 182, 212, ',
          starColor: '#6EE7B7',
          capeBoy: '#0F2C59',
          capeGirl: '#9D174D',
          glowColor: '#10B981',
        };
    }
  }, [palette]);

  // Spawn shooting star along swipe vector
  const spawnShootingStar = useCallback((x: number, y: number, vx: number, vy: number) => {
    const { starColor } = getPaletteColors();
    shootingStarsRef.current.push({
      x,
      y,
      vx: vx * 1.5,
      vy: vy * 1.5,
      length: Math.min(70, Math.hypot(vx, vy) * 3 + 20),
      alpha: 1,
      color: starColor,
    });
  }, [getPaletteColors]);

  // Touch & pointer handlers for painting auroras
  const addAuroraPoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Keep aurora touch area in the upper 80% so cliff remains easily tappable
      if (x < 0 || x > rect.width || y < 0 || y > rect.height * 0.85) return;

      const normY = y / rect.height;
      playHarpNote(normY);

      const { baseHue } = getPaletteColors();
      pointsRef.current.push({
        x,
        y,
        life: 1,
        maxLife: 125 + Math.random() * 45,
        hue: baseHue + (Math.random() - 0.5) * 35,
        width: Math.random() * 55 + 65,
      });

      setPaintCount((prev) => prev + 1);
    },
    [getPaletteColors, playHarpNote]
  );

  const prevTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    prevTouchRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    addAuroraPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    addAuroraPoint(e.clientX, e.clientY);

    // Detect flick/swipe speed for shooting star
    if (prevTouchRef.current) {
      const dx = e.clientX - prevTouchRef.current.x;
      const dy = e.clientY - prevTouchRef.current.y;
      const dt = performance.now() - prevTouchRef.current.time;
      if (dt > 0) {
        const speed = Math.hypot(dx, dy) / dt;
        if (speed > 1.2 && Math.random() > 0.6) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            spawnShootingStar(
              e.clientX - rect.left,
              e.clientY - rect.top,
              (dx / dt) * 8,
              (dy / dt) * 8
            );
          }
        }
      }
    }
    prevTouchRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    prevTouchRef.current = null;
  };

  // Trigger Sky: Children of the Light call ring & chime
  const triggerSkyCall = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 50, 30]);
      } catch {}
    }

    playSkyCallSound();
    setIsCalling(true);
    setCallMessage('Two Children of Light calling out across the clouds ✦');

    setTimeout(() => {
      setIsCalling(false);
    }, 1400);

    setTimeout(() => {
      setCallMessage(null);
    }, 3200);

    // Also inject ambient aurora sparkles
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const { baseHue } = getPaletteColors();
      for (let i = 0; i < 6; i++) {
        pointsRef.current.push({
          x: rect.width * 0.3 + (i * rect.width * 0.4) / 6,
          y: rect.height * 0.4 + (Math.random() - 0.5) * 35,
          life: 1,
          maxLife: 120,
          hue: baseHue + (Math.random() - 0.5) * 30,
          width: 70,
        });
      }
    }
  };

  // Sparkle burst: waves of celestial light across the entire night sky
  const triggerBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 50, 30, 60]);
      } catch {}
    }

    const { baseHue, starColor } = getPaletteColors();

    // Wave of aurora ripples
    for (let i = 0; i < 22; i++) {
      const px = (w / 22) * i + Math.random() * 20;
      const py = h * 0.32 + Math.sin(i * 0.55) * 45 + (Math.random() - 0.5) * 30;
      pointsRef.current.push({
        x: px,
        y: py,
        life: 1,
        maxLife: 155 + Math.random() * 50,
        hue: baseHue + (Math.random() - 0.5) * 40,
        width: Math.random() * 65 + 85,
      });
    }

    // Shower of shooting stars
    for (let i = 0; i < 4; i++) {
      shootingStarsRef.current.push({
        x: Math.random() * w * 0.7,
        y: Math.random() * (h * 0.38),
        vx: 7 + Math.random() * 5,
        vy: 4 + Math.random() * 4,
        length: 60 + Math.random() * 40,
        alpha: 1,
        color: starColor,
      });
    }

    playHarpNote(0.2);
    setTimeout(() => playHarpNote(0.5), 140);
    setTimeout(() => playHarpNote(0.8), 280);
    setPaintCount((prev) => prev + 15);
  };

  const handleClear = () => {
    pointsRef.current = [];
    shootingStarsRef.current = [];
    setPaintCount(0);
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Generate ambient background twinkling stars
      const stars: AmbientStar[] = [];
      for (let i = 0; i < 65; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height * 0.78,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
        });
      }
      ambientStarsRef.current = stars;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.02;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Deep dark celestial night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#060814');
      skyGrad.addColorStop(0.5, '#0A0F26');
      skyGrad.addColorStop(1, '#080C1F');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 1. Ambient Stars
      ambientStarsRef.current.forEach((st) => {
        const twinkle = Math.sin(time * 3 * st.twinkleSpeed) * 0.3;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 240, 232, ${Math.max(0.1, st.alpha + twinkle)})`;
        ctx.fill();
      });

      // 2. Render Aurora Light Ribbons (Volumetric lighter blend)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const points = pointsRef.current;
      for (let i = points.length - 1; i >= 0; i--) {
        const pt = points[i];
        pt.life -= 1 / pt.maxLife;

        if (pt.life <= 0) {
          points.splice(i, 1);
          continue;
        }

        // Undulating wave movement
        const waveY = Math.sin(time * 1.8 + pt.x * 0.015) * 24;
        const currentY = pt.y + waveY;
        const currentX = pt.x + Math.cos(time + pt.y * 0.02) * 8;

        const fade = Math.sin(pt.life * Math.PI);
        const height = pt.width * 2.0;

        // Vertical luminous curtain gradient
        const grad = ctx.createLinearGradient(currentX, currentY - height, currentX, currentY + 25);
        grad.addColorStop(0, `hsla(${pt.hue}, 90%, 65%, 0)`);
        grad.addColorStop(0.25, `hsla(${pt.hue}, 95%, 60%, ${fade * 0.4})`);
        grad.addColorStop(0.65, `hsla(${pt.hue + 25}, 90%, 55%, ${fade * 0.28})`);
        grad.addColorStop(1, `hsla(${pt.hue + 45}, 85%, 50%, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(currentX, currentY - height * 0.4, pt.width * 0.75, height, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 3. Render Shooting Stars
      const stars = shootingStarsRef.current;
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.025;

        if (s.alpha <= 0 || s.x > w + 100 || s.y > h + 100) {
          stars.splice(i, 1);
          continue;
        }

        const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.length;
        const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.length;

        const starGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        starGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        starGrad.addColorStop(1, s.color);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const { capeBoy, capeGirl, glowColor } = getPaletteColors();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.1rem',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* Interactive Aurora & Sky Children Canvas Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#060814',
          border: '1px solid rgba(167, 139, 250, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65), inset 0 0 50px rgba(16, 185, 129, 0.08)',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Ambient Overlay Hint when not yet painted */}
        {paintCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              position: 'absolute',
              top: '25px',
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
              padding: '0 1rem',
            }}
          >
            <Wind size={22} color="var(--color-lavender)" style={{ marginBottom: '0.35rem', opacity: 0.85 }} />
            <span
              style={{
                fontSize: '0.84rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--color-ivory)',
                letterSpacing: '0.04em',
                textShadow: '0 2px 10px rgba(0,0,0,0.85)',
              }}
            >
              Swipe across the sky to weave Northern Lights
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--color-muted)',
                marginTop: '0.2rem',
              }}
            >
              Tap the Children of Light on the cliff to call out ✦
            </span>
          </motion.div>
        )}

        {/* Call Banner Bubble Notification */}
        <AnimatePresence>
          {callMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '65px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(253, 230, 138, 0.5)',
                color: '#FEF3C7',
                fontSize: '0.74rem',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                zIndex: 25,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              <Sparkles size={12} color="#FDE68A" />
              <span>{callMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-Right Realm Palette Switcher */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '0.35rem',
            background: 'rgba(8, 11, 24, 0.82)',
            padding: '0.25rem 0.4rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(216, 204, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 15,
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPalette('emerald');
            }}
            title="Valley of Triumph (Emerald)"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              border: palette === 'emerald' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPalette('amethyst');
            }}
            title="Vault of Knowledge (Amethyst)"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
              border: palette === 'amethyst' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPalette('solar');
            }}
            title="Golden Wasteland (Solar Gold)"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #FDE68A 100%)',
              border: palette === 'solar' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          />
        </div>

        {/* Top-Left Live Note Count */}
        {paintCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontSize: '0.68rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              background: 'rgba(8, 11, 24, 0.8)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(253, 230, 138, 0.25)',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            ✦ AURORA DANCING
          </div>
        )}

        {/* -------------------------------------------------------------
            Sky: Children of the Light Characters Sitting on Cliff Stage
           ------------------------------------------------------------- */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            triggerSkyCall();
          }}
          title="Tap to emit a Sky Call of Light across the clouds"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '145px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            pointerEvents: 'auto',
            cursor: 'pointer',
            zIndex: 18,
          }}
        >
          <svg
            viewBox="0 0 380 145"
            width="100%"
            height="145"
            preserveAspectRatio="xMidYMax meet"
            style={{
              maxWidth: '440px',
              overflow: 'visible',
            }}
          >
            <defs>
              {/* Cliff Gradient */}
              <linearGradient id="skyCliffGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#12182D" />
                <stop offset="60%" stopColor="#0B0F1E" />
                <stop offset="100%" stopColor="#050711" />
              </linearGradient>

              {/* Moss highlight on cliff edge */}
              <linearGradient id="mossEdgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="25%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* Candle Warmth Radial Light */}
              <radialGradient id="candleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
                <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#B45309" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Boy Cape Gradient */}
              <linearGradient id="boyCapeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="65%" stopColor={capeBoy} />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Girl Cape Gradient */}
              <linearGradient id="girlCapeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="65%" stopColor={capeGirl} />
                <stop offset="100%" stopColor="#4C0519" />
              </linearGradient>
            </defs>

            {/* Clouds drifting beneath the cliff */}
            <g opacity="0.45">
              <ellipse cx="70" cy="138" rx="85" ry="24" fill="rgba(148, 163, 184, 0.18)" />
              <ellipse cx="200" cy="142" rx="110" ry="26" fill="rgba(216, 204, 255, 0.22)" />
              <ellipse cx="310" cy="138" rx="80" ry="22" fill="rgba(148, 163, 184, 0.18)" />
            </g>

            {/* Stylized Floating Island Cliff */}
            <path
              d="M30,145 Q80,72 190,70 Q300,72 350,145 Z"
              fill="url(#skyCliffGrad)"
            />
            {/* Glowing Moss Shelf */}
            <path
              d="M75,98 C120,70 190,69 260,76 C295,80 315,95 320,105 C275,85 205,82 135,84 C95,85 80,95 75,98 Z"
              fill="url(#mossEdgeGrad)"
            />

            {/* Expanding Sky Call Rings when Calling */}
            {isCalling && (
              <g transform="translate(190, 68)">
                <circle cx="0" cy="0" r="28" fill="none" stroke="#FDE68A" strokeWidth="2.5" opacity="0.9">
                  <animate attributeName="r" from="15" to="115" dur="1.2s" fill="freeze" />
                  <animate attributeName="opacity" from="1" to="0" dur="1.2s" fill="freeze" />
                </circle>
                <circle cx="0" cy="0" r="20" fill="none" stroke={glowColor} strokeWidth="1.5" opacity="0.7">
                  <animate attributeName="r" from="10" to="90" dur="1.2s" begin="0.12s" fill="freeze" />
                  <animate attributeName="opacity" from="0.9" to="0" dur="1.2s" begin="0.12s" fill="freeze" />
                </circle>
              </g>
            )}

            {/* Candle Warmth Radial Light cast on rock */}
            {candleLit && (
              <ellipse cx="190" cy="80" rx="65" ry="32" fill="url(#candleGlow)" />
            )}

            {/* ----------------------------------------
                BOY CHILD OF LIGHT (Left Character)
               ---------------------------------------- */}
            <g
              transform={isHoldingHands ? 'translate(142, 38)' : 'translate(136, 40)'}
              style={{ transition: 'transform 0.4s ease' }}
            >
              {/* Billowing Cape Tail */}
              <motion.path
                d="M-8,28 Q-32,38 -24,56 Q-8,48 2,36 Z"
                fill="url(#boyCapeGrad)"
                stroke="#FDE68A"
                strokeWidth="0.8"
                animate={{
                  d: [
                    'M-8,28 Q-32,38 -24,56 Q-8,48 2,36 Z',
                    'M-8,28 Q-36,44 -20,58 Q-6,46 2,36 Z',
                    'M-8,28 Q-32,38 -24,56 Q-8,48 2,36 Z',
                  ],
                }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Main Cape Body */}
              <path
                d="M0,16 Q-22,28 -15,50 Q4,52 14,48 Q18,30 10,16 Z"
                fill="url(#boyCapeGrad)"
                stroke="#FDE68A"
                strokeWidth="1.2"
                filter={isCalling ? 'drop-shadow(0 0 10px #FDE68A)' : 'none'}
              />

              {/* Glowing Cape Wing-Light Stars (4 Diamond Stars) */}
              <g transform="translate(-4, 30)">
                <polygon points="0,-4 3,0 0,4 -3,0" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
                <polygon points="-7,5 -4,8 -7,11 -10,8" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
                <polygon points="7,5 10,8 7,11 4,8" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
                <polygon points="0,14 3,18 0,22 -3,18" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
              </g>

              {/* Slender Arm resting on cliff */}
              <path d="M10,28 Q18,36 24,42" fill="none" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" />

              {/* Sky Mask Face (Smooth porcelain) */}
              <circle cx="5" cy="8" r="8.5" fill="#F8FAFC" />
              {/* Soft Golden Forehead Gem */}
              <polygon points="5,2 6.5,4 5,6 3.5,4" fill="#FDE68A" />
              {/* Gentle eye markings */}
              <line x1="2" y1="8" x2="4" y2="8" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
              <line x1="7" y1="8" x2="9" y2="8" stroke="#334155" strokeWidth="1" strokeLinecap="round" />

              {/* Windswept Spiky White Hair */}
              <path
                d="M-2,6 Q-8,-4 0,-4 Q-4,-9 6,-6 Q12,-8 11,-1 Q15,4 12,8 Z"
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth="0.6"
              />
            </g>

            {/* ----------------------------------------
                GIRL CHILD OF LIGHT (Right Character)
               ---------------------------------------- */}
            <g
              transform={isHoldingHands ? 'translate(236, 38)' : 'translate(242, 40)'}
              style={{ transition: 'transform 0.4s ease' }}
            >
              {/* Billowing Cape Tail */}
              <motion.path
                d="M8,28 Q32,38 24,56 Q8,48 -2,36 Z"
                fill="url(#girlCapeGrad)"
                stroke="#FDE68A"
                strokeWidth="0.8"
                animate={{
                  d: [
                    'M8,28 Q32,38 24,56 Q8,48 -2,36 Z',
                    'M8,28 Q36,44 20,58 Q6,46 -2,36 Z',
                    'M8,28 Q32,38 24,56 Q8,48 -2,36 Z',
                  ],
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              />

              {/* Main Cape Body */}
              <path
                d="M0,16 Q22,28 15,50 Q-4,52 -14,48 Q-18,30 -10,16 Z"
                fill="url(#girlCapeGrad)"
                stroke="#FDE68A"
                strokeWidth="1.2"
                filter={isCalling ? 'drop-shadow(0 0 10px #FDE68A)' : 'none'}
              />

              {/* Glowing Cape Wing-Light Stars (4 Diamond Stars) */}
              <g transform="translate(4, 30)">
                <polygon points="0,-4 3,0 0,4 -3,0" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
                <polygon points="-7,5 -4,8 -7,11 -10,8" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
                <polygon points="7,5 10,8 7,11 4,8" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
                <polygon points="0,14 3,18 0,22 -3,18" fill="#FFFBEB" filter="drop-shadow(0 0 4px #FDE68A)" />
              </g>

              {/* Slender Arm reaching to hold hands */}
              <path d="M-10,28 Q-18,36 -24,42" fill="none" stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" />

              {/* Sky Mask Face (Smooth porcelain) */}
              <circle cx="-5" cy="8" r="8.5" fill="#F8FAFC" />
              {/* Soft Golden Forehead Gem */}
              <polygon points="-5,2 -3.5,4 -5,6 -6.5,4" fill="#FDE68A" />
              {/* Gentle eye markings */}
              <line x1="-8" y1="8" x2="-6" y2="8" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
              <line x1="-3" y1="8" x2="-1" y2="8" stroke="#334155" strokeWidth="1" strokeLinecap="round" />

              {/* Soft Twin Bun / Side Ponytail Hair */}
              <path
                d="M-12,4 Q-14,-5 -4,-6 Q3,-7 8,-2 Q14,-4 14,3 Q10,7 6,9 Z"
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeWidth="0.6"
              />
              <circle cx="11" cy="0" r="4.5" fill="#F8FAFC" />
            </g>

            {/* ----------------------------------------
                RED FRIENDSHIP CANDLE & INTERLINKED HANDS
               ---------------------------------------- */}
            <g transform="translate(190, 72)">
              {/* Interlinked Hands Connection Beam */}
              {isHoldingHands && (
                <g>
                  <line x1="-24" y1="10" x2="24" y2="10" stroke="#FDE68A" strokeWidth="2.8" strokeLinecap="round" />
                  <circle cx="0" cy="10" r="3.5" fill="#FEF3C7" filter="drop-shadow(0 0 5px #F59E0B)" />
                </g>
              )}

              {/* Red Candle Body */}
              <rect x="-3" y="-2" width="6" height="15" rx="1.5" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
              {/* Wax Drop Accent */}
              <circle cx="3" cy="4" r="1.2" fill="#EF4444" />

              {/* Candle Flame with Animated Flicker */}
              {candleLit ? (
                <g>
                  <motion.path
                    d="M0,-3 Q3,-8 0,-14 Q-3,-8 0,-3 Z"
                    fill="#FDE68A"
                    filter="drop-shadow(0 0 6px #F59E0B)"
                    animate={{
                      scaleY: [1, 1.25, 0.9, 1.15, 1],
                      scaleX: [1, 0.9, 1.1, 0.95, 1],
                    }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <circle cx="0" cy="-6" r="1.8" fill="#FFFFFF" />
                </g>
              ) : (
                <line x1="0" y1="-2" x2="0" y2="-5" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
              )}
            </g>

            {/* Floating Golden Light Spirit Butterflies / Motes */}
            <g opacity="0.85">
              <circle cx="120" cy="50" r="1.8" fill="#FDE68A" filter="drop-shadow(0 0 4px #FDE68A)">
                <animate attributeName="cy" values="50;42;50" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="260" cy="46" r="1.8" fill="#FDE68A" filter="drop-shadow(0 0 4px #FDE68A)">
                <animate attributeName="cy" values="46;38;46" dur="2.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2.7s" repeatCount="indefinite" />
              </circle>
              <circle cx="190" cy="30" r="2.2" fill="#FEF3C7" filter="drop-shadow(0 0 5px #FDE68A)">
                <animate attributeName="cy" values="30;20;30" dur="3.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.4s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
        </div>
      </div>

      {/* Action Controls for Sky: Children of the Light Experience */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.45rem',
          width: '100%',
        }}
      >
        {/* Sky Call Button */}
        <button
          type="button"
          onClick={triggerSkyCall}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.55rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: isCalling
              ? 'rgba(253, 230, 138, 0.3)'
              : 'linear-gradient(135deg, rgba(167, 139, 250, 0.22) 0%, rgba(16, 185, 129, 0.15) 100%)',
            border: '1px solid rgba(253, 230, 138, 0.55)',
            color: '#FEF3C7',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={15} color="#FDE68A" />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>Sky Call</span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Call of Light</span>
        </button>

        {/* Hold Hands / Sit Closer Emote */}
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(15);
              } catch {}
            }
            setIsHoldingHands((prev) => !prev);
          }}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.55rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: isHoldingHands ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.06)',
            border: isHoldingHands ? '1px solid rgba(251, 113, 133, 0.6)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: isHoldingHands ? '#FECDD3' : 'var(--color-muted)',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}
        >
          <Heart size={15} color="#FB7185" fill={isHoldingHands ? '#FB7185' : 'none'} />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>
            {isHoldingHands ? 'Holding Hands' : 'Sit Together'}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Hold Hands</span>
        </button>

        {/* Friendship Candle Toggle */}
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(15);
              } catch {}
            }
            setCandleLit((prev) => !prev);
          }}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.55rem 0.35rem',
            borderRadius: 'var(--radius-md)',
            background: candleLit ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.06)',
            border: candleLit ? '1px solid rgba(253, 230, 138, 0.6)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: candleLit ? '#FEF3C7' : 'var(--color-muted)',
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}
        >
          <Flame size={15} color="#F59E0B" fill={candleLit ? '#F59E0B' : 'none'} />
          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>
            {candleLit ? 'Candle Lit' : 'Relight'}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Friendship Candle</span>
        </button>
      </div>

      {/* Secondary Controls: Burst Wave & Clear */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={triggerBurst}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.6rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.18) 0%, rgba(16, 185, 129, 0.14) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.45)',
            color: 'var(--color-ivory)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <Sparkles size={13} color="#A78BFA" />
          <span>Release Celestial Aurora Wave ✦</span>
        </button>

        {paintCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear the sky"
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(14, 18, 36, 0.65)',
              border: '1px solid rgba(216, 204, 255, 0.15)',
              color: 'var(--color-muted)',
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              touchAction: 'manipulation',
            }}
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Connected Horizon Note in Sky: Children of the Light Spirit */}
      <div
        style={{
          width: '100%',
          padding: '1.15rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(14, 18, 36, 0.8)',
          border: '1px solid rgba(216, 204, 255, 0.14)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-lavender)',
            fontSize: '0.84rem',
            fontWeight: 600,
            marginBottom: '0.4rem',
          }}
        >
          <Palette size={14} />
          <span>Two Children of Light Beneath the Aurora</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            margin: '0 0 0.5rem 0',
          }}
        >
          Just like in <em>Sky: Children of the Light</em>, where two friends wrap themselves in warm cloaks, light a red candle between them on a floating cliff, and watch the endless aurora dance across the sky. Even when separated across Tamil Nadu, every call of light we send travels across the clouds straight to you.
        </p>
        <div
          style={{
            fontSize: '0.76rem',
            color: '#FDE68A',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
          }}
        >
          "Even across the clouds... our light will always meet as one ✦"
        </div>
      </div>
    </div>
  );
};
