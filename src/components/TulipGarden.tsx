import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, Heart, Plane, Check, Volume2, VolumeX, Compass } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface FlowerPromise {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  glowHex: string;
  icon: string;
  promise: string;
  tag: string;
  picked: boolean;
}

interface PetalParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  size: number;
  color: string;
  alpha: number;
}

export const TulipGarden: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePromise, setActivePromise] = useState<FlowerPromise | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [breezeStrength, setBreezeStrength] = useState(1);
  const [pickedCount, setPickedCount] = useState(0);
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const petalsRef = useRef<PetalParticle[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{
    guitarSource?: OscillatorNode;
    gainNode?: GainNode;
    birdInterval?: number;
  } | null>(null);

  const [promises, setPromises] = useState<FlowerPromise[]>([
    {
      id: 'tulip_red',
      name: 'Crimson Velvet Tulip',
      colorName: 'Ruby Red',
      colorHex: '#EF4444',
      glowHex: 'rgba(239, 68, 68, 0.45)',
      icon: '🌷',
      tag: 'HAND IN HAND ✦',
      promise:
        'Walking down the winding paths of Keukenhof, your hand in mine, with no rush, no distance, and no screens between us.',
      picked: false,
    },
    {
      id: 'tulip_pink',
      name: 'Pastel Sunrise Tulip',
      colorName: 'Soft Blossom',
      colorHex: '#F472B6',
      glowHex: 'rgba(244, 114, 182, 0.45)',
      icon: '🌸',
      tag: 'DUTCH BICYCLES ✦',
      promise:
        'Renting two bicycles in Lisse, ringing the vintage bell past miles of blooming flower strips, and stopping whenever you want to take a photo.',
      picked: false,
    },
    {
      id: 'tulip_gold',
      name: 'Golden Sun Tulip',
      colorName: 'Dutch Gold',
      colorHex: '#FBBF24',
      glowHex: 'rgba(251, 191, 36, 0.45)',
      icon: '💛',
      tag: 'CANAL BRIDGES ✦',
      promise:
        'Sitting on an Amsterdam canal bridge on a sunny spring afternoon, eating warm caramel stroopwafels and watching the boats glide by.',
      picked: false,
    },
    {
      id: 'tulip_violet',
      name: 'Royal Purple Tulip',
      colorName: 'Deep Lilac',
      colorHex: '#A855F7',
      glowHex: 'rgba(168, 85, 247, 0.45)',
      icon: '💜',
      tag: 'OUR PROMISE KEPT ✦',
      promise:
        'Proof that the dream we whispered about late at night in our rooms became our living, breathing reality.',
      picked: false,
    },
    {
      id: 'tulip_white',
      name: 'Starlight Pearl Tulip',
      colorName: 'Pure Pearl',
      colorHex: '#F8FAFC',
      glowHex: 'rgba(255, 255, 255, 0.55)',
      icon: '🤍',
      tag: 'FAVOURITE PERSON ✦',
      promise:
        'Out of all 8 billion people on this earth, there is no one else in this universe I would rather explore the Netherlands with than you.',
      picked: false,
    },
  ]);

  // Haptic feedback helper
  const triggerHaptic = useCallback((pattern: number | number[] = 15) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  }, []);

  // Vintage Dutch Bicycle Bell Ding sound
  const playBicycleBell = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      // High-pitched brass chime double ring (ding... ding!)
      [0, 0.14].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2093.0, now + delay); // C7 high bell
        osc.frequency.setValueAtTime(2150.0, now + delay + 0.03);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.5);
      });
    } catch {
      // Safe fallback
    }
  }, []);

  // Acoustic Dutch Spring Soundscape (Gentle birdsong, wind chimes, soft acoustic guitar arpeggio)
  const startSpringAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.14, now + 1.2);
      masterGain.connect(ctx.destination);

      // Acoustic chord arpeggio loop: Dmaj9 -> Gmaj7 -> Bm7 -> A7
      const chords = [
        [293.66, 369.99, 440.0, 554.37], // Dmaj9
        [196.0, 246.94, 293.66, 392.0],  // Gmaj7
        [246.94, 293.66, 369.99, 440.0], // Bm7
        [220.0, 277.18, 329.63, 440.0],  // A
      ];

      let chordIdx = 0;
      const playArpeggio = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const cNow = ctx.currentTime;
        const currentChord = chords[chordIdx % chords.length];
        chordIdx++;

        currentChord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, cNow + i * 0.28);

          g.gain.setValueAtTime(0.001, cNow + i * 0.28);
          g.gain.linearRampToValueAtTime(0.08, cNow + i * 0.28 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, cNow + i * 0.28 + 1.6);

          osc.connect(g);
          g.connect(masterGain);
          osc.start(cNow + i * 0.28);
          osc.stop(cNow + i * 0.28 + 1.7);
        });

        // Occasional soft spring warbler birdsong
        if (Math.random() > 0.4) {
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          bOsc.type = 'sine';
          const bStart = cNow + 0.6;
          bOsc.frequency.setValueAtTime(2600 + Math.random() * 400, bStart);
          bOsc.frequency.exponentialRampToValueAtTime(3400 + Math.random() * 400, bStart + 0.08);
          bOsc.frequency.exponentialRampToValueAtTime(2800, bStart + 0.16);

          bGain.gain.setValueAtTime(0.001, bStart);
          bGain.gain.linearRampToValueAtTime(0.04, bStart + 0.02);
          bGain.gain.exponentialRampToValueAtTime(0.0001, bStart + 0.25);

          bOsc.connect(bGain);
          bGain.connect(masterGain);
          bOsc.start(bStart);
          bOsc.stop(bStart + 0.28);
        }
      };

      playArpeggio();
      const intervalId = window.setInterval(playArpeggio, 2400);
      audioNodesRef.current = { gainNode: masterGain, birdInterval: intervalId };
      setIsAudioPlaying(true);
    } catch {
      // Safe fallback
    }
  }, []);

  const stopSpringAudio = useCallback(() => {
    if (audioNodesRef.current) {
      if (audioNodesRef.current.birdInterval) {
        clearInterval(audioNodesRef.current.birdInterval);
      }
      if (audioNodesRef.current.gainNode && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        audioNodesRef.current.gainNode.gain.setValueAtTime(audioNodesRef.current.gainNode.gain.value, now);
        audioNodesRef.current.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      }
      audioNodesRef.current = null;
    }
    setIsAudioPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      stopSpringAudio();
    };
  }, [stopSpringAudio]);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      stopSpringAudio();
    } else {
      startSpringAudio();
    }
    triggerHaptic(12);
  };

  // Pick a tulip promise
  const handlePickTulip = (flower: FlowerPromise) => {
    setActivePromise(flower);
    playBicycleBell();
    triggerHaptic([20, 50, 30]);

    if (!flower.picked) {
      setPromises((prev) =>
        prev.map((f) => (f.id === flower.id ? { ...f, picked: true } : f))
      );
      setPickedCount((prev) => prev + 1);
    }

    // Spawn a burst of colorful fluttering petals
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height * 0.7;

      for (let i = 0; i < 24; i++) {
        petalsRef.current.push({
          x: cx + (Math.random() - 0.5) * 120,
          y: cy + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 4 + 2,
          vy: -Math.random() * 3 - 1.5,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08,
          size: Math.random() * 8 + 6,
          color: flower.colorHex,
          alpha: 1,
        });
      }
    }
  };

  // Touch/Drag to create wind gust
  const handleWindGust = () => {
    setBreezeStrength((prev) => Math.min(2.5, prev + 0.6));
    triggerHaptic(15);
    setTimeout(() => {
      setBreezeStrength(1);
    }, 1800);

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      for (let i = 0; i < 16; i++) {
        petalsRef.current.push({
          x: -20,
          y: Math.random() * rect.height * 0.8,
          vx: Math.random() * 5 + 4,
          vy: Math.sin(Math.random() * Math.PI) * 1.5 + 0.5,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.06,
          size: Math.random() * 9 + 5,
          color: ['#EF4444', '#F472B6', '#FBBF24', '#A855F7', '#FFFDF9'][Math.floor(Math.random() * 5)],
          alpha: 1,
        });
      }
    }
  };

  // Canvas Keukenhof Tulip Field & Dutch Windmill Animation Loop
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

      // Seed initial floating petals
      if (petalsRef.current.length === 0) {
        const list: PetalParticle[] = [];
        for (let i = 0; i < 30; i++) {
          list.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: Math.random() * 1.5 + 0.8,
            vy: Math.random() * 0.6 + 0.3,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.04,
            size: Math.random() * 7 + 4,
            color: ['#EF4444', '#F472B6', '#FBBF24', '#A855F7', '#FFFDF9'][i % 5],
            alpha: Math.random() * 0.7 + 0.3,
          });
        }
        petalsRef.current = list;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.02 * breezeStrength;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Dutch Golden Hour Sky Gradient (Pastel Peach to Twilight Cobalt)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, '#0F172A');
      skyGrad.addColorStop(0.35, '#312E81');
      skyGrad.addColorStop(0.65, '#BE185D');
      skyGrad.addColorStop(0.88, '#F59E0B');
      skyGrad.addColorStop(1, '#FEF3C7');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Soft sun glow on horizon
      const sunGrad = ctx.createRadialGradient(w * 0.68, h * 0.52, 5, w * 0.68, h * 0.52, 120);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      sunGrad.addColorStop(0.4, 'rgba(251, 146, 60, 0.45)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w * 0.68, h * 0.52, 120, 0, Math.PI * 2);
      ctx.fill();

      // Distant rolling Dutch polder horizon line
      ctx.fillStyle = '#064E3B';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.52);
      ctx.bezierCurveTo(w * 0.35, h * 0.51, w * 0.65, h * 0.53, w, h * 0.52);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // 2. Iconic Dutch Windmill Silhouette in Background
      const wmx = w * 0.22;
      const wmy = h * 0.48;
      ctx.save();
      // Windmill body
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(wmx - 14, wmy + 36);
      ctx.lineTo(wmx - 9, wmy);
      ctx.lineTo(wmx + 9, wmy);
      ctx.lineTo(wmx + 14, wmy + 36);
      ctx.closePath();
      ctx.fill();

      // Cap
      ctx.beginPath();
      ctx.arc(wmx, wmy, 9, Math.PI, 0);
      ctx.fill();

      // Rotating Blades
      const bladeAngle = time * 0.8;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5;

      for (let b = 0; b < 4; b++) {
        const ang = bladeAngle + (b * Math.PI) / 2;
        const bx = wmx + Math.cos(ang) * 34;
        const by = wmy + Math.sin(ang) * 34;

        ctx.beginPath();
        ctx.moveTo(wmx, wmy);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Lattice sail
        ctx.save();
        ctx.translate(wmx, wmy);
        ctx.rotate(ang);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(8, -4, 24, 8);
        ctx.restore();
      }
      ctx.restore();

      // 3. Multi-Row Perspective Tulip Beds (Keukenhof Rainbow Strip Fields)
      // Perspective convergence point on horizon: (w * 0.5, h * 0.52)
      const vpX = w * 0.5;
      const vpY = h * 0.52;

      const flowerColors = [
        { main: '#DC2626', dark: '#991B1B' }, // Ruby Red
        { main: '#F472B6', dark: '#DB2777' }, // Pastel Pink
        { main: '#F59E0B', dark: '#B45309' }, // Golden Yellow
        { main: '#9333EA', dark: '#6B21A8' }, // Purple
        { main: '#FFFDF9', dark: '#E2E8F0' }, // White
      ];

      const rowCount = 7;
      for (let r = 0; r < rowCount; r++) {
        const rowNorm = r / (rowCount - 1);
        const startX = -w * 0.3 + (w * 1.6 * rowNorm);
        const endX = -w * 0.1 + (w * 1.2 * rowNorm);

        // Ground stripe between rows
        const colorPair = flowerColors[r % flowerColors.length];

        ctx.fillStyle = '#022C22';
        ctx.beginPath();
        ctx.moveTo(vpX + (endX - vpX) * 0.1, vpY);
        ctx.lineTo(startX, h);
        ctx.lineTo(startX + (w / rowCount) * 0.95, h);
        ctx.lineTo(vpX + (endX + (w / rowCount) * 0.2 - vpX) * 0.1, vpY);
        ctx.closePath();
        ctx.fill();

        // Draw individual swaying blooming tulips along this perspective stripe
        const countInRow = 14;
        for (let i = 0; i < countInRow; i++) {
          const tPos = Math.pow(i / (countInRow - 1), 1.8); // Perspective exponential spacing
          const flowerY = vpY + (h - vpY) * tPos;
          const flowerX = vpX + (startX - vpX) * tPos + (w / rowCount) * 0.4 * tPos;

          const scale = 0.3 + tPos * 0.85;
          const sway = Math.sin(time * 2 + i * 0.5 + r) * (4 * scale * breezeStrength);

          // Green stem
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = Math.max(1, 2.2 * scale);
          ctx.beginPath();
          ctx.moveTo(flowerX, flowerY);
          ctx.quadraticCurveTo(flowerX + sway * 0.5, flowerY - 14 * scale, flowerX + sway, flowerY - 22 * scale);
          ctx.stroke();

          // Green leaf
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.ellipse(flowerX - 4 * scale, flowerY - 8 * scale, 6 * scale, 2.5 * scale, -0.4, 0, Math.PI * 2);
          ctx.fill();

          // Tulip Blossom (Graceful cup shape with 3 rounded petals)
          const blossomX = flowerX + sway;
          const blossomY = flowerY - 22 * scale;
          const bW = 8 * scale;
          const bH = 12 * scale;

          // Outer petals
          ctx.fillStyle = colorPair.dark;
          ctx.beginPath();
          ctx.ellipse(blossomX - bW * 0.35, blossomY - bH * 0.2, bW * 0.45, bH * 0.55, -0.15, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(blossomX + bW * 0.35, blossomY - bH * 0.2, bW * 0.45, bH * 0.55, 0.15, 0, Math.PI * 2);
          ctx.fill();

          // Center prominent cup petal
          ctx.fillStyle = colorPair.main;
          ctx.beginPath();
          ctx.ellipse(blossomX, blossomY, bW * 0.55, bH * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();

          // Highlight shimmer on front petal
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.ellipse(blossomX - bW * 0.15, blossomY - bH * 0.2, bW * 0.2, bH * 0.35, -0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Floating & Swirling Petal Particle System
      const petals = petalsRef.current;
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x += p.vx * breezeStrength;
        p.y += p.vy + Math.sin(time + i) * 0.4;
        p.rotation += p.vRot;

        if (p.x > w + 40 || p.y > h + 40) {
          p.x = -20;
          p.y = Math.random() * h * 0.8;
          p.alpha = Math.random() * 0.7 + 0.3;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;

        // Realistic curved petal silhouette
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.4, p.size * 0.6, p.size * 0.8, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.8, -p.size * 0.8, -p.size * 0.4, 0, -p.size);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [breezeStrength]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      {/* Interactive Dutch Tulip Field Canvas Display */}
      <div
        onClick={handleWindGust}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          maxHeight: '340px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1.5px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.2)',
          cursor: 'pointer',
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Top-Left Location Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(15, 23, 42, 0.82)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            fontSize: '0.72rem',
            fontFamily: 'monospace',
            color: '#FDE68A',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <Compass size={12} color="#F59E0B" />
          <span>KEUKENHOF • LISSE, NETHERLANDS</span>
        </div>

        {/* Top-Right Soundscape Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: isAudioPlaying ? 'rgba(245, 158, 11, 0.35)' : 'rgba(15, 23, 42, 0.82)',
            border: `1px solid ${isAudioPlaying ? '#F59E0B' : 'rgba(255, 255, 255, 0.15)'}`,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            color: isAudioPlaying ? '#FEF3C7' : 'var(--color-muted)',
            cursor: 'pointer',
            touchAction: 'manipulation',
            backdropFilter: 'blur(10px)',
          }}
        >
          {isAudioPlaying ? <Volume2 size={12} color="#FDE68A" /> : <VolumeX size={12} />}
          <span>{isAudioPlaying ? 'DUTCH BREEZE' : 'AUDIO OFF'}</span>
        </button>

        {/* Bottom Interactive Wind Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(8, 11, 24, 0.85)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: '#FEF3C7',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Wind size={12} color="#FDE68A" />
          <span>TAP GARDEN TO SEND A GUST OF WIND ✦</span>
        </div>
      </div>

      {/* Flower Picking Action Prompt */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '520px',
            padding: '0 0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
            <Sparkles size={13} color="#FDE68A" />
            <span>PICK A TULIP FOR HER BOUQUET:</span>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#FDE68A', fontFamily: 'monospace', fontWeight: 600 }}>
            {pickedCount}/5 BOUQUET
          </span>
        </div>

        {/* 5 Interactive Colorful Tulips to Pick */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.35rem',
            width: '100%',
            maxWidth: '520px',
          }}
        >
          {promises.map((flower) => {
            const isSelected = activePromise?.id === flower.id;
            return (
              <button
                key={flower.id}
                type="button"
                onClick={() => handlePickTulip(flower)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.15rem',
                  padding: '0.45rem 0.15rem',
                  minHeight: '66px',
                  minWidth: 0,
                  borderRadius: 'var(--radius-md)',
                  background: isSelected
                    ? 'rgba(251, 191, 36, 0.22)'
                    : flower.picked
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected
                    ? '1.5px solid #FDE68A'
                    : flower.picked
                    ? `1.5px solid ${flower.colorHex}`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: flower.picked ? '#FFFFFF' : 'var(--color-ivory-dim)',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected ? `0 0 16px ${flower.glowHex}` : 'none',
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{flower.icon}</span>
                <span
                  style={{
                    fontSize: 'clamp(0.56rem, 2.1vw, 0.62rem)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    textAlign: 'center',
                    lineHeight: 1.15,
                    minHeight: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 2px',
                    wordBreak: 'break-word',
                  }}
                >
                  {flower.colorName}
                </span>

                {flower.picked && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={8} color="#FFFFFF" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flower Promise / Story Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '1.1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(145deg, rgba(17, 21, 44, 0.85) 0%, rgba(26, 18, 38, 0.9) 100%)',
          border: activePromise ? `1.5px solid ${activePromise.colorHex}` : '1px solid rgba(251, 191, 36, 0.25)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: activePromise ? `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${activePromise.glowHex}` : '0 10px 30px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s ease',
          minHeight: '100px',
        }}
      >
        <AnimatePresence mode="wait">
          {activePromise ? (
            <motion.div
              key={activePromise.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.45rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{activePromise.icon}</span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: activePromise.colorHex,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {activePromise.tag}
                  </span>
                </div>

                <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-soft)', fontFamily: 'monospace' }}>
                  KEUKENHOF ✦ 2026
                </span>
              </div>

              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.18rem',
                  color: '#FFFFFF',
                  margin: '0 0 0.4rem 0',
                }}
              >
                {activePromise.name}
              </h4>

              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.86rem',
                  lineHeight: 1.62,
                  color: 'var(--color-ivory)',
                  margin: 0,
                }}
              >
                "{activePromise.promise}"
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FDE68A', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <Heart size={14} color="#EF4444" fill="#EF4444" />
                <span>Our Keukenhof Dream Together</span>
              </div>
              <p style={{ color: 'var(--color-ivory-dim)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                You've always dreamed of walking through the endless tulip fields in the Netherlands with me. Tap any of the five tulips above to gather a personalized bouquet and unlock our promises for Holland.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keepsake: Our Amsterdam & Keukenhof Boarding Passes Toggle */}
      <button
        type="button"
        onClick={() => {
          setShowBoardingPass(!showBoardingPass);
          triggerHaptic(18);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.65rem 1.35rem',
          borderRadius: 'var(--radius-full)',
          background: showBoardingPass
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(239, 68, 68, 0.25) 100%)'
            : 'rgba(255, 255, 255, 0.05)',
          border: '1.5px solid rgba(251, 191, 36, 0.45)',
          color: '#FEF3C7',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          touchAction: 'manipulation',
          transition: 'all 0.2s ease',
        }}
      >
        <Plane size={15} color="#FDE68A" />
        <span>{showBoardingPass ? 'Fold Boarding Passes' : 'Inspect Our Boarding Passes to Amsterdam ✈'}</span>
      </button>

      {/* Interactive Boarding Pass Card */}
      <AnimatePresence>
        {showBoardingPass && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.96 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            style={{
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #181E38 0%, #0E1224 100%)',
                border: '1.5px dashed rgba(251, 191, 36, 0.55)',
                padding: '1.25rem 1.4rem',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7)',
                position: 'relative',
              }}
            >
              {/* Airline Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#FDE68A', letterSpacing: '0.12em' }}>
                    CELESTIAL AIRWAYS ✦ OFFICIAL TICKET
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-serif)', color: '#FFFFFF', fontSize: '1.15rem', margin: '0.1rem 0 0 0' }}>
                    Direct to the Dutch Tulip Gardens
                  </h4>
                </div>

                <div
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid #10B981',
                    color: '#34D399',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  CONFIRMED ✦
                </div>
              </div>

              {/* Route Display */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>DEPARTURE</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.05em' }}>MAA / CJB</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ivory-dim)' }}>Tamil Nadu, India</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                  <Plane size={18} color="#FDE68A" />
                  <span style={{ fontSize: '0.58rem', color: 'var(--color-lavender)', fontFamily: 'monospace' }}>NON-STOP</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>DESTINATION</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FDE68A', letterSpacing: '0.05em' }}>AMS</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-ivory-dim)' }}>Amsterdam Schiphol</span>
                </div>
              </div>

              {/* Passenger & Seat Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.72rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.58rem', display: 'block', fontFamily: 'monospace' }}>PASSENGERS</span>
                  <strong style={{ color: '#FFFFFF' }}>{siteContent.recipient.nickname} & Spotter</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.58rem', display: 'block', fontFamily: 'monospace' }}>SEATS</span>
                  <strong style={{ color: '#FDE68A' }}>1A & 1B (Side by Side)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.58rem', display: 'block', fontFamily: 'monospace' }}>SPRING DATE</span>
                  <strong style={{ color: '#FFFFFF' }}>April • Keukenhof Peak</strong>
                </div>
              </div>

              {/* Note */}
              <div style={{ marginTop: '0.85rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-lilac)', fontStyle: 'italic' }}>
                "One day soon, this won't be on a screen. We will stand in these very fields together."
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
