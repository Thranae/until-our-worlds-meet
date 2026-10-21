import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Heart, RotateCcw, Palette, Wind } from 'lucide-react';

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

  // Core Interactive States
  const [candleLit, setCandleLit] = useState<boolean>(false);
  const [isHoldingHands, setIsHoldingHands] = useState<boolean>(false);
  const [palette, setPalette] = useState<'emerald' | 'amethyst' | 'solar'>('emerald');
  const [characterInteraction, setCharacterInteraction] = useState<string | null>(null);
  const [paintCount, setPaintCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  // Aurora intensity tracking for smooth fade in/out
  const intensityRef = useRef<number>(0);
  const pointsRef = useRef<AuroraPoint[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const ambientStarsRef = useRef<AmbientStar[]>([]);
  const lastAudioTimeRef = useRef<number>(0);

  // Web Audio Context Helper
  const getAudioContext = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      return new AudioCtx();
    } catch {
      return null;
    }
  }, []);

  // Audio: Realistic Match Strike & Flame Ignition Sound
  const playMatchStrikeSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Friction strike (filtered white noise scratch)
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Flame 'whoosh' ignition puff
    const flameOsc = ctx.createOscillator();
    const flameFilter = ctx.createBiquadFilter();
    const flameGain = ctx.createGain();

    flameOsc.type = 'triangle';
    flameOsc.frequency.setValueAtTime(160, now + 0.04);
    flameOsc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    flameFilter.type = 'lowpass';
    flameFilter.frequency.setValueAtTime(450, now + 0.04);

    flameGain.gain.setValueAtTime(0.001, now);
    flameGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    flameGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    flameOsc.connect(flameFilter);
    flameFilter.connect(flameGain);
    flameGain.connect(ctx.destination);
    flameOsc.start(now + 0.04);
    flameOsc.stop(now + 0.5);
  }, [getAudioContext]);

  // Audio: Candle Extinguish Breath Sound
  const playCandleExtinguishSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }, [getAudioContext]);

  // Audio: Majestic Aurora Surge Harmonizer (F-Major celestial chord + glass harp chime)
  const playAuroraSurgeSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Rich harmonic chord: F3 (174.6Hz), C4 (261.6Hz), F4 (349.2Hz), A4 (440.0Hz), C5 (523.2Hz)
    const chord = [174.61, 261.63, 349.23, 440.0, 523.25];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx < 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09 / (idx + 1), now + 0.4 + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5 + idx * 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.0 + idx * 0.2);
    });
  }, [getAudioContext]);

  // Audio: Gentle Descending Wind Chime when hands part
  const playHandsPartSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 440.0, 349.23]; // C5 -> A4 -> F4
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.85);
    });
  }, [getAudioContext]);

  // Audio: Crystal Glass Harp Note on Sky Touch
  const playHarpNote = useCallback(
    (normalizedY: number) => {
      const now = performance.now();
      if (now - lastAudioTimeRef.current < 85) return;
      lastAudioTimeRef.current = now;

      const ctx = getAudioContext();
      if (!ctx) return;
      const ctxNow = ctx.currentTime;

      // Arctic Pentatonic Scale: F, G, Ab, C, Db, F
      const scale = [349.23, 392.0, 415.3, 523.25, 554.37, 698.46, 783.99, 1046.5];
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
      gain.gain.linearRampToValueAtTime(0.1, ctxNow + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctxNow + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctxNow);
      osc.stop(ctxNow + 1.15);
    },
    [getAudioContext]
  );

  // Audio: Romantic Bell for character touch
  const playLoveSparkleSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.95);
    });
  }, [getAudioContext]);

  // Palette color definitions
  const getPaletteColors = useCallback(() => {
    switch (palette) {
      case 'amethyst':
        return {
          baseHue: 285,
          color1: '#A855F7',
          color2: '#EC4899',
          starColor: '#F472B6',
          auroraGlow: 'rgba(168, 85, 247, 0.45)',
          name: 'Tromsø Amethyst',
        };
      case 'solar':
        return {
          baseHue: 42,
          color1: '#F59E0B',
          color2: '#FDE68A',
          starColor: '#FEF3C7',
          auroraGlow: 'rgba(245, 158, 11, 0.45)',
          name: 'Arctic Solar Flare',
        };
      case 'emerald':
      default:
        return {
          baseHue: 156,
          color1: '#10B981',
          color2: '#06B6D4',
          starColor: '#6EE7B7',
          auroraGlow: 'rgba(16, 185, 129, 0.45)',
          name: 'Lapland Emerald',
        };
    }
  }, [palette]);

  // Toggle Candle
  const toggleCandle = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }

    if (!candleLit) {
      playMatchStrikeSound();
      setCandleLit(true);
      if (isHoldingHands) {
        setTimeout(() => playAuroraSurgeSound(), 200);
      }
    } else {
      playCandleExtinguishSound();
      setCandleLit(false);
      if (isHoldingHands) {
        playHandsPartSound();
      }
    }
  };

  // Toggle Holding Hands
  const toggleHoldingHands = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }

    if (!isHoldingHands) {
      setIsHoldingHands(true);
      if (candleLit) {
        playAuroraSurgeSound();
        setCharacterInteraction('Our hands joined — the Northern Lights answer our call ✦');
      } else {
        playLoveSparkleSound();
        setCharacterInteraction('Our hands meet in the quiet dark. Light the candle to ignite the sky 🕯️');
      }
    } else {
      setIsHoldingHands(false);
      playHandsPartSound();
      setCharacterInteraction('Our hands parted... the aurora softly sleeps in the stars.');
    }

    setTimeout(() => {
      setCharacterInteraction(null);
    }, 3800);
  };

  // Interaction when clicking the Boy
  const handleTouchBoy = (e: React.MouseEvent) => {
    e.stopPropagation();
    playLoveSparkleSound();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    setCharacterInteraction('He looks into her eyes under the Arctic sky, smiling softly ✦');
    setTimeout(() => setCharacterInteraction(null), 3200);
  };

  // Interaction when clicking the Girl
  const handleTouchGirl = (e: React.MouseEvent) => {
    e.stopPropagation();
    playLoveSparkleSound();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    setCharacterInteraction('She leans gently against his shoulder, holding the moment close ✦');
    setTimeout(() => setCharacterInteraction(null), 3200);
  };

  // Spawn Shooting Star
  const spawnShootingStar = useCallback(
    (x: number, y: number, vx: number, vy: number) => {
      const { starColor } = getPaletteColors();
      shootingStarsRef.current.push({
        x,
        y,
        vx: vx * 1.4,
        vy: vy * 1.4,
        length: Math.min(80, Math.hypot(vx, vy) * 3 + 25),
        alpha: 1,
        color: starColor,
      });
    },
    [getPaletteColors]
  );

  // Trigger Wish Shooting Star
  const triggerWish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 40, 20]);
      } catch {}
    }

    spawnShootingStar(
      rect.width * 0.2 + Math.random() * rect.width * 0.5,
      rect.height * 0.15,
      6 + Math.random() * 4,
      3.5 + Math.random() * 3
    );

    playHarpNote(0.2);
    setCharacterInteraction('A shooting star streaks through the aurora — make a quiet wish ✦');
    setTimeout(() => setCharacterInteraction(null), 3200);
  };

  // Touch handlers for painting auroras when active
  const addAuroraPoint = useCallback(
    (clientX: number, clientY: number) => {
      // Only allow painting ripples when the aurora is awake!
      if (!candleLit || !isHoldingHands) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height * 0.72) return;

      const normY = y / rect.height;
      playHarpNote(normY);

      const { baseHue } = getPaletteColors();
      pointsRef.current.push({
        x,
        y,
        life: 1,
        maxLife: 110 + Math.random() * 40,
        hue: baseHue + (Math.random() - 0.5) * 35,
        width: Math.random() * 45 + 55,
      });

      setPaintCount((prev) => prev + 1);
    },
    [candleLit, isHoldingHands, getPaletteColors, playHarpNote]
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

    if (prevTouchRef.current) {
      const dx = e.clientX - prevTouchRef.current.x;
      const dy = e.clientY - prevTouchRef.current.y;
      const dt = performance.now() - prevTouchRef.current.time;
      if (dt > 0) {
        const speed = Math.hypot(dx, dy) / dt;
        if (speed > 1.3 && Math.random() > 0.65 && candleLit && isHoldingHands) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            spawnShootingStar(
              e.clientX - rect.left,
              e.clientY - rect.top,
              (dx / dt) * 7,
              (dy / dt) * 7
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

  const handleClear = () => {
    pointsRef.current = [];
    shootingStarsRef.current = [];
    setPaintCount(0);
  };

  // Main Canvas Animation Loop
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
      for (let i = 0; i < 70; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height * 0.75,
          radius: Math.random() * 1.4 + 0.4,
          alpha: Math.random() * 0.65 + 0.35,
          twinkleSpeed: Math.random() * 0.025 + 0.01,
        });
      }
      ambientStarsRef.current = stars;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.018;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // 1. Target Intensity: 1.0 ONLY when BOTH candle is lit AND holding hands!
      const targetIntensity = candleLit && isHoldingHands ? 1.0 : 0.0;
      intensityRef.current += (targetIntensity - intensityRef.current) * 0.045;
      const intensity = intensityRef.current;

      // 2. Clear Sky with Arctic Midnight Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#030511');
      skyGrad.addColorStop(0.55, '#070D22');
      skyGrad.addColorStop(1, '#05091A');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 3. Ambient Twinkling Stars
      ambientStarsRef.current.forEach((st) => {
        const twinkle = Math.sin(time * 3 * st.twinkleSpeed) * 0.35;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 250, 252, ${Math.max(0.12, st.alpha + twinkle)})`;
        ctx.fill();
      });

      // 4. Distant Snow-capped Mountain Ridges
      ctx.save();
      const mountainGrad = ctx.createLinearGradient(0, h * 0.48, 0, h * 0.78);
      mountainGrad.addColorStop(0, '#0F172A');
      mountainGrad.addColorStop(1, '#070C1B');
      ctx.fillStyle = mountainGrad;

      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.lineTo(w * 0.12, h * 0.58);
      ctx.lineTo(w * 0.22, h * 0.63);
      ctx.lineTo(w * 0.35, h * 0.54);
      ctx.lineTo(w * 0.48, h * 0.64);
      ctx.lineTo(w * 0.62, h * 0.52);
      ctx.lineTo(w * 0.76, h * 0.61);
      ctx.lineTo(w * 0.88, h * 0.56);
      ctx.lineTo(w, h * 0.68);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Soft snow highlights on peaks
      ctx.fillStyle = 'rgba(226, 232, 240, 0.18)';
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.58);
      ctx.lineTo(w * 0.14, h * 0.61);
      ctx.lineTo(w * 0.1, h * 0.61);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.54);
      ctx.lineTo(w * 0.38, h * 0.58);
      ctx.lineTo(w * 0.32, h * 0.58);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.62, h * 0.52);
      ctx.lineTo(w * 0.65, h * 0.56);
      ctx.lineTo(w * 0.59, h * 0.56);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 5. Realistic Aurora Borealis Curtains (Active only when intensity > 0.005)
      if (intensity > 0.005) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const { baseHue } = getPaletteColors();

        // 3 Layered Curtains with Geomagnetic Ray Slices
        const layers = [
          { baseY: h * 0.22, speed: 0.9, amp: 26, hueOffset: 25, rayCount: 38 },
          { baseY: h * 0.28, speed: 1.3, amp: 38, hueOffset: 0, rayCount: 46 },
          { baseY: h * 0.36, speed: 1.7, amp: 30, hueOffset: -20, rayCount: 36 },
        ];

        layers.forEach((layer, layerIdx) => {
          const step = w / layer.rayCount;
          for (let i = 0; i <= layer.rayCount; i++) {
            const rx = i * step;
            // Compound wave for organic drape
            const waveY =
              Math.sin(rx * 0.012 + time * layer.speed) * layer.amp +
              Math.cos(rx * 0.024 - time * 0.7) * (layer.amp * 0.45);
            const ry = layer.baseY + waveY;

            // Fold intensity multiplier: where gradient of curve steepens, aurora rays bunch up
            const fold = Math.abs(Math.cos(rx * 0.015 + time * layer.speed));
            const foldAlpha = (0.28 + fold * 0.55) * intensity;

            const rayHeight = 85 + Math.sin(rx * 0.03 + time * 1.5) * 35 + fold * 45;

            // Vertical atmospheric ionization gradient: Green 557nm at base -> Cyan -> Magenta at high altitude
            const curHue = baseHue + layer.hueOffset + fold * 15;
            const rayGrad = ctx.createLinearGradient(rx, ry - rayHeight, rx, ry + 15);
            rayGrad.addColorStop(0, `hsla(${curHue + 35}, 90%, 65%, 0)`);
            rayGrad.addColorStop(0.3, `hsla(${curHue + 15}, 85%, 60%, ${foldAlpha * 0.4})`);
            rayGrad.addColorStop(0.7, `hsla(${curHue}, 95%, 55%, ${foldAlpha * 0.75})`);
            rayGrad.addColorStop(1, `hsla(${curHue - 15}, 100%, 50%, 0)`);

            ctx.fillStyle = rayGrad;
            ctx.fillRect(rx - step * 0.6, ry - rayHeight, step * 1.2, rayHeight + 15);
          }

          // Overhead diffuse atmospheric corona bloom
          if (layerIdx === 1) {
            const coronaGrad = ctx.createRadialGradient(
              w * 0.5 + Math.sin(time) * 40,
              h * 0.24,
              10,
              w * 0.5,
              h * 0.24,
              w * 0.48
            );
            coronaGrad.addColorStop(0, `hsla(${baseHue}, 90%, 60%, ${intensity * 0.22})`);
            coronaGrad.addColorStop(0.6, `hsla(${baseHue + 20}, 85%, 50%, ${intensity * 0.09})`);
            coronaGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = coronaGrad;
            ctx.fillRect(0, 0, w, h * 0.65);
          }
        });

        // Interactive Drawn Ripple Points
        const points = pointsRef.current;
        for (let i = points.length - 1; i >= 0; i--) {
          const pt = points[i];
          pt.life -= 1 / pt.maxLife;

          if (pt.life <= 0) {
            points.splice(i, 1);
            continue;
          }

          const waveY = Math.sin(time * 2 + pt.x * 0.015) * 20;
          const currentY = pt.y + waveY;
          const currentX = pt.x + Math.cos(time + pt.y * 0.02) * 6;
          const fade = Math.sin(pt.life * Math.PI) * intensity;
          const rayH = pt.width * 2.2;

          const ptGrad = ctx.createLinearGradient(currentX, currentY - rayH, currentX, currentY + 15);
          ptGrad.addColorStop(0, `hsla(${pt.hue}, 90%, 65%, 0)`);
          ptGrad.addColorStop(0.3, `hsla(${pt.hue}, 95%, 60%, ${fade * 0.45})`);
          ptGrad.addColorStop(0.7, `hsla(${pt.hue + 25}, 90%, 55%, ${fade * 0.32})`);
          ptGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = ptGrad;
          ctx.beginPath();
          ctx.ellipse(currentX, currentY - rayH * 0.4, pt.width * 0.65, rayH, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. Shooting Stars
      const stars = shootingStarsRef.current;
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.022;

        if (s.alpha <= 0 || s.x > w + 80 || s.y > h + 80) {
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
  }, [candleLit, isHoldingHands, getPaletteColors]);

  const { color1, color2, auroraGlow } = getPaletteColors();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
      }}
    >
      {/* Dynamic Status Guidance Banner */}
      <motion.div
        layout
        style={{
          width: '100%',
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-md)',
          background:
            candleLit && isHoldingHands
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.16) 100%)'
              : candleLit
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.12) 100%)'
              : 'rgba(15, 23, 42, 0.75)',
          border:
            candleLit && isHoldingHands
              ? '1px solid rgba(16, 185, 129, 0.45)'
              : candleLit
              ? '1px solid rgba(245, 158, 11, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow:
            candleLit && isHoldingHands
              ? '0 0 20px rgba(16, 185, 129, 0.2)'
              : '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {candleLit && isHoldingHands ? (
            <Sparkles size={16} color="#34D399" />
          ) : candleLit ? (
            <Heart size={16} color="#FB7185" />
          ) : (
            <Flame size={16} color="#F59E0B" />
          )}
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color:
                candleLit && isHoldingHands
                  ? '#D1FAE5'
                  : candleLit
                  ? '#FEF3C7'
                  : 'var(--color-ivory)',
              lineHeight: 1.4,
            }}
          >
            {candleLit && isHoldingHands
              ? '✨ Northern Lights are dancing! Keep holding hands...'
              : candleLit
              ? '🤝 Step 2: Now hold hands to summon the Northern Lights'
              : '🕯️ Step 1: Light the candle on the cliff edge to warm the night'}
          </span>
        </div>

        {/* Small Active Indicator Pill */}
        <div
          style={{
            fontSize: '0.65rem',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            background:
              candleLit && isHoldingHands
                ? 'rgba(16, 185, 129, 0.35)'
                : 'rgba(255, 255, 255, 0.08)',
            color: candleLit && isHoldingHands ? '#A7F3D0' : 'var(--color-muted)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {candleLit && isHoldingHands ? 'AURORA AWAKE' : 'AURORA SLEEPING'}
        </div>
      </motion.div>

      {/* Main Canvas + Realistic Characters Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#040714',
          border: '1.5px solid rgba(167, 139, 250, 0.35)',
          boxShadow: `0 16px 45px rgba(0, 0, 0, 0.75), inset 0 0 60px ${
            candleLit && isHoldingHands ? auroraGlow : 'transparent'
          }`,
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

        {/* Swipe Hint overlay when aurora is awake */}
        {candleLit && isHoldingHands && paintCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              position: 'absolute',
              top: '20px',
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
              padding: '0 1rem',
              zIndex: 10,
            }}
          >
            <Wind size={18} color="#6EE7B7" style={{ marginBottom: '0.25rem', opacity: 0.85 }} />
            <span
              style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: '#E0F2FE',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              }}
            >
              Swipe the sky to weave emerald ripples & shooting stars
            </span>
          </motion.div>
        )}

        {/* Character Interaction Notification Toast */}
        <AnimatePresence>
          {characterInteraction && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '55px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 15, 30, 0.92)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(253, 230, 138, 0.55)',
                color: '#FEF3C7',
                fontSize: '0.74rem',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                zIndex: 25,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                maxWidth: '90%',
              }}
            >
              <Sparkles size={13} color="#FDE68A" />
              <span>{characterInteraction}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Palette Switcher Top-Right */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '0.35rem',
            background: 'rgba(6, 10, 24, 0.85)',
            padding: '0.25rem 0.45rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(216, 204, 255, 0.22)',
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
            title="Lapland Emerald (Abisko)"
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
            title="Tromsø Amethyst"
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
            title="Arctic Solar Flare"
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

        {/* -------------------------------------------------------------
            Realistic Arctic Cliff, Lovers & Candle SVG Stage
           ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '190px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            pointerEvents: 'auto',
            zIndex: 18,
          }}
        >
          <svg
            viewBox="0 0 460 190"
            width="100%"
            height="190"
            preserveAspectRatio="xMidYMax meet"
            style={{
              maxWidth: '520px',
              overflow: 'visible',
            }}
          >
            <defs>
              {/* Realistic Craggy Cliff Gradients */}
              <linearGradient id="cliffRockGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="25%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Snow Ledge Top Highlight */}
              <linearGradient id="snowShelfGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="#E2E8F0" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#E2E8F0" stopOpacity="0.85" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* Warm Candlelight Cast on Lovers & Stone */}
              <radialGradient id="lanternRadialLight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
                <stop offset="28%" stopColor="#F59E0B" stopOpacity="0.55" />
                <stop offset="65%" stopColor="#B45309" stopOpacity="0.18" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Boy's Parka Gradient */}
              <linearGradient id="boyParkaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="60%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Girl's Parka Gradient */}
              <linearGradient id="girlParkaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#881337" />
                <stop offset="60%" stopColor="#4C0519" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </linearGradient>

              {/* Aurora Rim Light Filter for characters */}
              <linearGradient id="auroraRimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color1} stopOpacity="0.7" />
                <stop offset="40%" stopColor={color2} stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Fjord Water Edge with Subtle Ripple Reflection */}
            <path
              d="M0,150 Q120,146 230,148 Q340,150 460,146 L460,190 L0,190 Z"
              fill="#060A18"
              opacity="0.8"
            />
            {candleLit && isHoldingHands && (
              <ellipse
                cx="230"
                cy="165"
                rx="140"
                ry="12"
                fill={color1}
                opacity="0.12"
                filter="blur(6px)"
              />
            )}

            {/* Arctic Granite Cliff Ledge */}
            <path
              d="M30,190 Q90,95 230,92 Q370,95 430,190 Z"
              fill="url(#cliffRockGrad)"
            />
            {/* Rock strata & fissures */}
            <path
              d="M80,145 Q150,118 230,116 Q310,118 380,145"
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              opacity="0.4"
            />
            {/* Snow blanket on rock ledge */}
            <path
              d="M70,126 C130,95 230,93 330,102 C370,108 395,124 400,135 C350,110 250,106 150,110 C100,112 80,122 70,126 Z"
              fill="url(#snowShelfGrad)"
            />

            {/* Candlelight Cast Glow on Rock Surface */}
            {candleLit && (
              <ellipse cx="230" cy="118" rx="85" ry="38" fill="url(#lanternRadialLight)" />
            )}

            {/* -------------------------------------------------------------
                REALISTIC BOY SILHOUETTE (Left)
               ------------------------------------------------------------- */}
            <g
              onClick={handleTouchBoy}
              style={{
                cursor: 'pointer',
                transform: isHoldingHands ? 'translate(0px, 0px)' : 'translate(-5px, 2px)',
                transition: 'transform 0.4s ease',
              }}
            >
              {/* Parka Silhouette: Shoulders, Torso, Folded Knees */}
              <path
                d="M125,142 C120,125 132,95 158,82 C168,78 178,79 186,84 C198,90 205,108 208,124 C209,134 206,146 195,148 C175,152 140,150 125,142 Z"
                fill="url(#boyParkaGrad)"
                stroke={candleLit ? '#F59E0B' : '#475569'}
                strokeWidth={candleLit ? '0.8' : '0.5'}
              />

              {/* Parka Arm extending toward center */}
              <path
                d="M188,102 C196,114 205,128 218,136 C224,140 228,142 232,143"
                fill="none"
                stroke="#1E293B"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M188,102 C196,114 205,128 218,136 C224,140 228,142 232,143"
                fill="none"
                stroke={candleLit ? '#FDE68A' : '#64748B'}
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Fur Hood Trim around Neck / Back */}
              <path
                d="M152,78 C158,74 176,74 184,80 C187,83 186,88 181,90 C173,92 155,90 150,84 Z"
                fill="#334155"
              />

              {/* Realistic Head & Beanie */}
              <ellipse cx="170" cy="65" rx="11" ry="13" fill="#0F172A" />
              {/* Beanie rim & fold */}
              <path
                d="M160,63 C160,53 172,50 178,54 C182,57 182,66 181,70 C175,71 163,70 160,63 Z"
                fill="#1E293B"
              />
              {/* Profile cheek highlight in candlelight */}
              {candleLit && (
                <path
                  d="M174,62 C178,65 178,71 176,74"
                  stroke="#FEF3C7"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}

              {/* Aurora rim highlight on head when aurora is active */}
              {candleLit && isHoldingHands && (
                <path
                  d="M161,54 C167,49 177,50 181,56"
                  stroke={color1}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </g>

            {/* -------------------------------------------------------------
                REALISTIC GIRL SILHOUETTE (Right)
               ------------------------------------------------------------- */}
            <g
              onClick={handleTouchGirl}
              style={{
                cursor: 'pointer',
                transform: isHoldingHands ? 'translate(0px, 0px)' : 'translate(5px, 2px)',
                transition: 'transform 0.4s ease',
              }}
            >
              {/* Parka Silhouette: Leaning gently toward him */}
              <path
                d="M335,142 C340,125 328,95 302,82 C292,78 282,79 274,84 C262,90 255,108 252,124 C251,134 254,146 265,148 C285,152 320,150 335,142 Z"
                fill="url(#girlParkaGrad)"
                stroke={candleLit ? '#F59E0B' : '#475569'}
                strokeWidth={candleLit ? '0.8' : '0.5'}
              />

              {/* Parka Arm extending toward center */}
              <path
                d="M272,102 C264,114 255,128 242,136 C236,140 232,142 228,143"
                fill="none"
                stroke="#4C0519"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M272,102 C264,114 255,128 242,136 C236,140 232,142 228,143"
                fill="none"
                stroke={candleLit ? '#FDE68A' : '#9D174D'}
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Long Cozy Woolen Scarf with Fringes swaying */}
              <path
                d="M288,78 C278,74 266,78 262,86 C259,92 264,102 268,110 C270,115 268,124 266,132"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              {/* Scarf fringes */}
              <line x1="266" y1="132" x2="265" y2="138" stroke="#CBD5E1" strokeWidth="1.2" />
              <line x1="268" y1="132" x2="268" y2="139" stroke="#CBD5E1" strokeWidth="1.2" />
              <line x1="270" y1="132" x2="271" y2="138" stroke="#CBD5E1" strokeWidth="1.2" />

              {/* Realistic Head & Knit Beret with Hair Strands */}
              <ellipse cx="288" cy="65" rx="10.5" ry="12.5" fill="#1E1B4B" />
              {/* Beret / Pom-pom Beanie */}
              <path
                d="M298,63 C298,53 286,50 280,54 C276,57 276,66 277,70 C283,71 295,70 298,63 Z"
                fill="#831843"
              />
              {/* Delicate hair strand catching the wind */}
              <path
                d="M296,68 Q302,76 304,85"
                fill="none"
                stroke="#475569"
                strokeWidth="1"
                strokeLinecap="round"
              />

              {/* Profile cheek highlight in candlelight */}
              {candleLit && (
                <path
                  d="M284,62 C280,65 280,71 282,74"
                  stroke="#FEF3C7"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}

              {/* Aurora rim highlight on head when aurora is active */}
              {candleLit && isHoldingHands && (
                <path
                  d="M297,54 C291,49 281,50 277,56"
                  stroke={color1}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </g>

            {/* -------------------------------------------------------------
                INTERLOCKING HANDS ZONE (Center between lovers)
               ------------------------------------------------------------- */}
            <g
              onClick={toggleHoldingHands}
              style={{ cursor: 'pointer' }}
            >
              <title>Touch to hold hands together</title>
              {isHoldingHands ? (
                /* Hands Intertwined together */
                <g transform="translate(230, 142)">
                  {/* Warm palm connection glow */}
                  <circle cx="0" cy="0" r="14" fill="#FDE68A" opacity="0.35" filter="blur(4px)" />
                  <circle cx="0" cy="0" r="7" fill="#FEF3C7" opacity="0.75" />

                  {/* Interwoven fingers */}
                  <ellipse cx="-4" cy="0" rx="6" ry="4" fill="#E2E8F0" />
                  <ellipse cx="4" cy="0" rx="6" ry="4" fill="#CBD5E1" />
                  <path
                    d="M-5,-2 C-1,-3 2,-1 5,-2 M-5,1 C-1,0 2,2 5,1"
                    stroke="#475569"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />

                  {/* Rising Heart Sparkles from Clasp */}
                  {candleLit && (
                    <g>
                      <motion.circle
                        cx="0"
                        cy="-6"
                        r="2.2"
                        fill="#FB7185"
                        animate={{
                          y: [-2, -26, -42],
                          opacity: [0.9, 1, 0],
                          scale: [0.8, 1.2, 0.5],
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <motion.circle
                        cx="-4"
                        cy="-4"
                        r="1.8"
                        fill="#FDE68A"
                        animate={{
                          y: [0, -20, -35],
                          x: [-4, -8, -12],
                          opacity: [0.8, 1, 0],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.7, ease: 'easeOut' }}
                      />
                      <motion.circle
                        cx="4"
                        cy="-4"
                        r="1.8"
                        fill="#6EE7B7"
                        animate={{
                          y: [0, -22, -38],
                          x: [4, 9, 14],
                          opacity: [0.8, 1, 0],
                        }}
                        transition={{ duration: 2.4, repeat: Infinity, delay: 1.2, ease: 'easeOut' }}
                      />
                    </g>
                  )}
                </g>
              ) : (
                /* Hands Resting Apart on the Stone */
                <g transform="translate(230, 142)">
                  {/* Left hand (Boy) */}
                  <ellipse cx="-16" cy="1" rx="6" ry="3.8" fill="#94A3B8" />
                  {/* Right hand (Girl) */}
                  <ellipse cx="16" cy="1" rx="6" ry="3.8" fill="#CBD5E1" />

                  {/* Reaching dotted energy prompt */}
                  <line
                    x1="-10"
                    y1="1"
                    x2="10"
                    y2="1"
                    stroke="#FDE68A"
                    strokeWidth="1.5"
                    strokeDasharray="2,3"
                    opacity="0.8"
                  />
                  <circle cx="0" cy="1" r="3" fill="#F59E0B" opacity="0.7">
                    <animate attributeName="r" values="2;4;2" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}
            </g>

            {/* -------------------------------------------------------------
                REALISTIC NORDIC CANDLE LANTERN (Sitting on stone)
               ------------------------------------------------------------- */}
            <g
              onClick={toggleCandle}
              style={{ cursor: 'pointer' }}
            >
              <title>{candleLit ? 'Tap to blow out the candle' : 'Tap to light the candle 🕯️'}</title>
              {/* Lantern Base at (230, 115) */}
              <g transform="translate(230, 115)">
                {/* Lantern Metal Frame (Wrought iron) */}
                <rect x="-9" y="-2" width="18" height="4" rx="1" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
                <rect x="-8" y="-22" width="16" height="20" rx="1" fill="rgba(255, 255, 255, 0.08)" stroke="#334155" strokeWidth="0.8" />
                {/* Lantern Top Cap & Ring */}
                <path d="M-9,-22 L0,-29 L9,-22 Z" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
                <circle cx="0" cy="-31" r="3" fill="none" stroke="#64748B" strokeWidth="1" />

                {/* Red Pillar Candle inside */}
                <rect x="-4" y="-12" width="8" height="10" rx="1" fill="#DC2626" stroke="#991B1B" strokeWidth="0.6" />
                <line x1="0" y1="-12" x2="0" y2="-14" stroke="#475569" strokeWidth="0.8" />

                {/* Flame with Realistic Multi-layer Flicker */}
                {candleLit ? (
                  <g>
                    {/* Outer Amber Flare */}
                    <motion.ellipse
                      cx="0"
                      cy="-18"
                      rx="4"
                      ry="7"
                      fill="#F59E0B"
                      filter="drop-shadow(0 0 6px #F59E0B)"
                      animate={{
                        scaleY: [1, 1.25, 0.9, 1.15, 1],
                        scaleX: [1, 0.9, 1.1, 0.95, 1],
                      }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Inner White-Blue Core */}
                    <ellipse cx="0" cy="-16" rx="1.6" ry="3" fill="#FFFFFF" />
                    <circle cx="0" cy="-14" r="1.2" fill="#38BDF8" opacity="0.8" />
                  </g>
                ) : (
                  /* Cold unlit wick with wispy smoke */
                  <g opacity="0.5">
                    <line x1="0" y1="-12" x2="0" y2="-15" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
                    <motion.path
                      d="M0,-15 Q2,-20 -1,-24 Q-3,-28 1,-32"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                      animate={{
                        opacity: [0.6, 0.2, 0],
                        y: [0, -4, -8],
                      }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                    />
                  </g>
                )}
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.65rem',
          width: '100%',
        }}
      >
        {/* Light Candle Button */}
        <button
          type="button"
          onClick={toggleCandle}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.75rem 0.6rem',
            borderRadius: 'var(--radius-md)',
            background: candleLit
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.18) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            border: candleLit
              ? '1.5px solid rgba(253, 230, 138, 0.7)'
              : '1px solid rgba(255, 255, 255, 0.14)',
            color: candleLit ? '#FEF3C7' : 'var(--color-muted)',
            cursor: 'pointer',
            touchAction: 'manipulation',
            boxShadow: candleLit ? '0 0 16px rgba(245, 158, 11, 0.25)' : 'none',
            transition: 'all 0.25s ease',
          }}
        >
          <Flame size={17} color={candleLit ? '#F59E0B' : 'var(--color-muted)'} fill={candleLit ? '#F59E0B' : 'none'} />
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {candleLit ? 'Candle Lit ✦' : 'Light Candle'}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>
              {candleLit ? 'Tap to blow out' : 'Tap to strike match'}
            </div>
          </div>
        </button>

        {/* Hold Hands Button */}
        <button
          type="button"
          onClick={toggleHoldingHands}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.75rem 0.6rem',
            borderRadius: 'var(--radius-md)',
            background: isHoldingHands
              ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.28) 0%, rgba(225, 29, 72, 0.18) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            border: isHoldingHands
              ? '1.5px solid rgba(251, 113, 133, 0.7)'
              : '1px solid rgba(255, 255, 255, 0.14)',
            color: isHoldingHands ? '#FECDD3' : 'var(--color-muted)',
            cursor: 'pointer',
            touchAction: 'manipulation',
            boxShadow: isHoldingHands ? '0 0 16px rgba(244, 63, 94, 0.25)' : 'none',
            transition: 'all 0.25s ease',
          }}
        >
          <Heart
            size={17}
            color={isHoldingHands ? '#FB7185' : 'var(--color-muted)'}
            fill={isHoldingHands ? '#FB7185' : 'none'}
          />
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {isHoldingHands ? 'Holding Hands 🤝' : 'Hold Hands'}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>
              {isHoldingHands ? 'Tap to release' : 'Connect our warmth'}
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Row: Make a Wish & Clear */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={triggerWish}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.65rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.18) 0%, rgba(16, 185, 129, 0.14) 100%)',
            border: '1px solid rgba(167, 139, 250, 0.45)',
            color: 'var(--color-ivory)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          <Sparkles size={14} color="#A78BFA" />
          <span>Make a Wish • Shooting Star 💫</span>
        </button>

        {paintCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear the sky ripples"
            style={{
              padding: '0.65rem 0.85rem',
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

      {/* Romantic Arctic Narrative Card */}
      <div
        style={{
          width: '100%',
          padding: '1.15rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(14, 18, 36, 0.82)',
          border: '1px solid rgba(216, 204, 255, 0.16)',
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
          <span>The Arctic Promise: Light & Held Hands</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            margin: '0 0 0.5rem 0',
          }}
        >
          Across the Scandinavian fjords, legend says the Northern Lights only reveal their sacred ribbons when two souls light a single flame against the cold and hold their hands tight together. The moment hands part, the aurora gently dissolves into the midnight stars — waiting patiently for warmth to return.
        </p>
        <div
          style={{
            fontSize: '0.78rem',
            color: '#FDE68A',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
          }}
        >
          "Hold my hand tight... and the entire sky will dance for us forever ✦"
        </div>
      </div>
    </div>
  );
};
