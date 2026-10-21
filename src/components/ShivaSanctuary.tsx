import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, Flame, Droplets, Leaf, Bell, Heart } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface FloatingLeaf {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

type DarshanPlace = 'adiyogi' | 'kapaleeshwarar' | 'ujjain' | 'chandra';

export const ShivaSanctuary: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isOmPlaying, setIsOmPlaying] = useState(false);
  const [activeDarshan, setActiveDarshan] = useState<DarshanPlace>('adiyogi');
  const [deepamLit, setDeepamLit] = useState(false);
  const [offeringCount, setOfferingCount] = useState(0);
  const [leaves, setLeaves] = useState<FloatingLeaf[]>([]);
  const [waterActive, setWaterActive] = useState(false);
  const [damruRhythmActive, setDamruRhythmActive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const omNodesRef = useRef<{
    oscillators: OscillatorNode[];
    masterGain: GainNode;
  } | null>(null);

  // Synthesize resonant 136.1Hz "OM" cosmic frequency + singing bowl harmonic drone
  const startOmAudio = useCallback(() => {
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
      masterGain.gain.linearRampToValueAtTime(0.12, now + 1.2);
      masterGain.connect(ctx.destination);

      // Sacred OM planetary frequencies (136.1Hz base C#3, 272.2Hz, 408.3Hz, 544.4Hz)
      const freqs = [136.1, 272.2, 408.3, 544.4];
      const oscillators: OscillatorNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Low-pass warmth filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650 - idx * 80, now);

        // Very slow subtle vibrato/modulation (0.15Hz)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.18, now);
        lfoGain.gain.setValueAtTime(1.5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);

        oscGain.gain.setValueAtTime(0.35 / (idx + 1), now);
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        oscillators.push(osc);
      });

      omNodesRef.current = { oscillators, masterGain };
      setIsOmPlaying(true);
    } catch {
      // Safe fallback
    }
  }, []);

  const stopOmAudio = useCallback(() => {
    if (!omNodesRef.current) return;
    try {
      const { oscillators, masterGain } = omNodesRef.current;
      if (audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          oscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
          masterGain.disconnect();
        }, 850);
      }
    } catch {}
    omNodesRef.current = null;
    setIsOmPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      stopOmAudio();
    };
  }, [stopOmAudio]);

  const toggleOmAudio = () => {
    if (isOmPlaying) {
      stopOmAudio();
    } else {
      startOmAudio();
    }
  };

  // Temple bell chime sound synthesis
  const playTempleBell = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      // Multi-tonal brass bell: 784Hz (G5), 1175Hz (D6), 1568Hz (G6)
      const harmonics = [784.0, 1174.6, 1568.0, 2349.3];
      harmonics.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.12 / (i + 1), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + i * 0.4);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.2 + i * 0.4);
      });
    } catch {}
  }, []);

  // Damru acoustic double-beat rhythm synthesis
  const playDamru = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // Tap 1 (sharp dhum)
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(70, now + 0.08);
      g1.gain.setValueAtTime(0.28, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc1.connect(g1);
      g1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.11);

      // Tap 2 (twin dhum at +120ms)
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(210, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(75, now + 0.2);
      g2.gain.setValueAtTime(0.24, now + 0.12);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.23);

      setDamruRhythmActive(true);
      setTimeout(() => setDamruRhythmActive(false), 350);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([20, 60, 25]);
        } catch {}
      }
    } catch {}
  }, []);

  // Bilva Patra offering action
  const offerBilvaPatra = () => {
    playTempleBell();
    setOfferingCount((c) => c + 1);

    const newLeaves: FloatingLeaf[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30,
      y: 10 + Math.random() * 15,
      rotation: Math.random() * 60 - 30,
      scale: 0.8 + Math.random() * 0.4,
    }));

    setLeaves((prev) => [...prev.slice(-12), ...newLeaves]);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
  };

  // Sacred Water (Abhishekam) action
  const offerGangaJal = () => {
    playTempleBell();
    setOfferingCount((c) => c + 1);
    setWaterActive(true);
    setTimeout(() => setWaterActive(false), 2400);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30, 15]);
      } catch {}
    }
  };

  // Light Deepam action
  const handleToggleDeepam = () => {
    playTempleBell();
    setDeepamLit((prev) => !prev);
    setOfferingCount((c) => c + 1);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 50]);
      } catch {}
    }
  };

  // Canvas Sacred Kailash & Stars Background
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
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.02;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // 1. Cosmic Night Gradient (Midnight Indigo to Sacred Teal)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#040612');
      skyGrad.addColorStop(0.5, '#0A1128');
      skyGrad.addColorStop(1, '#064E3B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Distant Starlight & Kailash Snow Peaks
      ctx.save();
      ctx.fillStyle = '#0F2A38';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.lineTo(w * 0.25, h * 0.38);
      ctx.lineTo(w * 0.5, h * 0.52);
      ctx.lineTo(w * 0.78, h * 0.35);
      ctx.lineTo(w, h * 0.62);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Snow glow on peaks
      ctx.fillStyle = 'rgba(224, 242, 254, 0.15)';
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.38);
      ctx.lineTo(w * 0.28, h * 0.45);
      ctx.lineTo(w * 0.22, h * 0.45);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w * 0.78, h * 0.35);
      ctx.lineTo(w * 0.82, h * 0.44);
      ctx.lineTo(w * 0.74, h * 0.44);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Sacred Crescent Moon (Chandra) above Kailash
      ctx.save();
      const moonX = w * 0.82;
      const moonY = h * 0.22;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 14, -Math.PI * 0.35, Math.PI * 0.65);
      ctx.bezierCurveTo(moonX - 5, moonY + 4, moonX - 5, moonY - 4, moonX + 6, moonY - 10);
      ctx.fillStyle = '#FEF08A';
      ctx.shadowColor = '#FDE68A';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 4. Divine Aura Radiation from Center
      ctx.save();
      const auraPulse = Math.sin(time * 1.5) * 8;
      const auraGrad = ctx.createRadialGradient(cx, cy + 10, 10, cx, cy + 10, 110 + auraPulse);
      auraGrad.addColorStop(0, deepamLit ? 'rgba(253, 230, 138, 0.42)' : 'rgba(216, 204, 255, 0.22)');
      auraGrad.addColorStop(0.6, deepamLit ? 'rgba(245, 158, 11, 0.18)' : 'rgba(167, 139, 250, 0.08)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy + 10, 120 + auraPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Water Abhishekam Streams (if active)
      if (waterActive) {
        ctx.save();
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 8;
        for (let s = -12; s <= 12; s += 8) {
          const flowOffset = (time * 120 + Math.abs(s) * 15) % 60;
          ctx.beginPath();
          ctx.moveTo(cx + s, cy - 35 + flowOffset);
          ctx.lineTo(cx + s * 1.2, cy - 15 + flowOffset);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [deepamLit, waterActive]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      {/* Visual Altar Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          height: '330px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1.5px solid rgba(253, 230, 138, 0.35)',
          boxShadow: deepamLit
            ? '0 16px 45px rgba(245, 158, 11, 0.28), 0 0 35px rgba(253, 230, 138, 0.3)'
            : '0 16px 40px rgba(0, 0, 0, 0.7)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          transition: 'box-shadow 0.4s ease',
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

        {/* Top Controls: OM Chant Audio & Damru Tap */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 15,
          }}
        >
          {/* Audio Chants Toggle */}
          <button
            type="button"
            onClick={toggleOmAudio}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: isOmPlaying
                ? 'rgba(245, 158, 11, 0.32)'
                : 'rgba(8, 11, 24, 0.8)',
              border: isOmPlaying
                ? '1px solid rgba(253, 230, 138, 0.8)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              color: isOmPlaying ? '#FEF3C7' : '#E2E8F0',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: isOmPlaying ? '0 0 16px rgba(245, 158, 11, 0.4)' : 'none',
              touchAction: 'manipulation',
              transition: 'all 0.25s ease',
            }}
            aria-label="Toggle sacred OM cosmic resonance"
          >
            {isOmPlaying ? <Volume2 size={13} color="#FDE68A" /> : <VolumeX size={13} />}
            <span>{isOmPlaying ? 'OM Resonance • 136.1Hz' : 'Play OM Resonance'}</span>
          </button>

          {/* Damru Tap Button */}
          <motion.button
            type="button"
            onClick={playDamru}
            whileTap={{ scale: 0.92 }}
            animate={damruRhythmActive ? { rotate: [0, -15, 15, 0] } : {}}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(8, 11, 24, 0.8)',
              border: '1px solid rgba(253, 230, 138, 0.45)',
              color: '#FDE68A',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              touchAction: 'manipulation',
            }}
            aria-label="Tap sacred damru"
          >
            <span style={{ fontSize: '0.9rem' }}>🥁</span>
            <span>Damru Rhythm</span>
          </motion.button>
        </div>

        {/* Central Luminous Shivalinga Entity */}
        <div
          style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {/* Trishula (Trident) rising behind Shivalinga */}
          <div
            style={{
              position: 'absolute',
              top: '-55px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.85,
            }}
          >
            <svg viewBox="0 0 40 80" width="36" height="72">
              {/* Shaft */}
              <line x1="20" y1="20" x2="20" y2="75" stroke="#FDE68A" strokeWidth="2" />
              {/* Center Spear */}
              <path d="M20,5 L23,20 L17,20 Z" fill="#FDE68A" />
              {/* Left Prong */}
              <path d="M12,12 C12,22 18,25 20,25" fill="none" stroke="#FDE68A" strokeWidth="2" />
              <path d="M12,8 L15,16 L9,16 Z" fill="#FDE68A" />
              {/* Right Prong */}
              <path d="M28,12 C28,22 22,25 20,25" fill="none" stroke="#FDE68A" strokeWidth="2" />
              <path d="M28,8 L31,16 L25,16 Z" fill="#FDE68A" />
              {/* Damru tied to center */}
              <polygon points="15,30 25,30 18,36 22,36 15,42 25,42 20,36" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            </svg>
          </div>

          {/* Shivalinga Dome & Body */}
          <div
            style={{
              width: '56px',
              height: '75px',
              borderRadius: '28px 28px 8px 8px',
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 60%, #020617 100%)',
              boxShadow: deepamLit
                ? '0 0 28px rgba(253, 230, 138, 0.7), inset 0 2px 8px rgba(254, 240, 138, 0.5)'
                : '0 0 20px rgba(167, 139, 250, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.3)',
              border: '1.5px solid rgba(254, 240, 138, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            {/* Sacred Tripundra (Three White Ash Lines & Red Bindu) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                marginTop: '-10px',
              }}
            >
              <div style={{ width: '26px', height: '1.5px', background: '#F8FAFC', borderRadius: '1px' }} />
              <div
                style={{
                  width: '28px',
                  height: '1.5px',
                  background: '#F8FAFC',
                  borderRadius: '1px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Red Kumkum Bindu in center */}
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#EF4444',
                    boxShadow: '0 0 5px #EF4444',
                  }}
                />
              </div>
              <div style={{ width: '26px', height: '1.5px', background: '#F8FAFC', borderRadius: '1px' }} />
            </div>

            {/* Glowing Third Eye Sparkle */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                marginTop: '6px',
                color: '#FDE68A',
                fontSize: '0.65rem',
              }}
            >
              ✦
            </motion.div>
          </div>

          {/* Yoni Peedam (Sacred Base Pedestal) */}
          <div
            style={{
              width: '98px',
              height: '16px',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              border: '1.5px solid rgba(254, 240, 138, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
              marginTop: '-3px',
              position: 'relative',
            }}
          >
            {/* Spout on left */}
            <div
              style={{
                position: 'absolute',
                left: '-10px',
                top: '2px',
                width: '12px',
                height: '10px',
                borderRadius: '4px 0 0 4px',
                background: '#1E293B',
                border: '1.5px solid rgba(254, 240, 138, 0.4)',
                borderRight: 'none',
              }}
            />
          </div>
        </div>

        {/* Floating Bilva Patra Leaves Animation */}
        <AnimatePresence>
          {leaves.map((leaf) => (
            <motion.div
              key={leaf.id}
              initial={{ opacity: 1, y: 0, scale: leaf.scale, rotate: leaf.rotation }}
              animate={{ opacity: [1, 0.9, 0], y: 150, rotate: leaf.rotation + 45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: `${leaf.x}%`,
                top: `${leaf.y}%`,
                pointerEvents: 'none',
                zIndex: 12,
                display: 'flex',
                alignItems: 'center',
                gap: '1px',
              }}
            >
              <span style={{ fontSize: '1.25rem', filter: 'drop-shadow(0 0 6px #86EFAC)' }}>🍃</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Akhand Deepam (Sacred Oil Lamp) in Foreground Corner */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 15,
          }}
        >
          {/* Flame */}
          {deepamLit ? (
            <motion.div
              animate={{
                scale: [1, 1.18, 0.95, 1.1, 1],
                y: [0, -1, 1, 0],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '12px',
                height: '18px',
                borderRadius: '50% 50% 35% 35%',
                background: 'radial-gradient(ellipse at 50% 70%, #FFFBEB 0%, #F59E0B 65%, #DC2626 100%)',
                boxShadow: '0 0 14px #F59E0B, 0 0 25px rgba(253, 230, 138, 0.8)',
              }}
            />
          ) : (
            <div
              style={{
                width: '3px',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '1px',
              }}
            />
          )}

          {/* Brass Lamp Base */}
          <div
            style={{
              width: '28px',
              height: '10px',
              borderRadius: '0 0 14px 14px',
              background: 'linear-gradient(180deg, #F59E0B 0%, #B45309 100%)',
              border: '1px solid #FDE68A',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
              marginTop: '1px',
            }}
          />
        </div>

        {/* Offering Blessing Counter Banner */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            color: '#FEF3C7',
            background: 'rgba(8, 11, 24, 0.82)',
            padding: '0.22rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(253, 230, 138, 0.35)',
            pointerEvents: 'none',
          }}
        >
          ✦ BLESSINGS OFFERED: {offeringCount}
        </div>
      </div>

      {/* Interactive Sacred Ritual Action Buttons (Pooja / Archana) */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          ✦ TAP TO PERFORM SACRED OFFERINGS (POOJA):
        </span>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.45rem',
            width: '100%',
          }}
        >
          {/* Offer Bilva Patra */}
          <button
            type="button"
            onClick={offerBilvaPatra}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.55rem 0.35rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.45)',
              color: '#A7F3D0',
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
            }}
          >
            <Leaf size={16} color="#34D399" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Bilva Leaves</span>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Offer Leaves</span>
          </button>

          {/* Ganga Jal Abhishekam */}
          <button
            type="button"
            onClick={offerGangaJal}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.55rem 0.35rem',
              borderRadius: 'var(--radius-md)',
              background: waterActive ? 'rgba(56, 189, 248, 0.28)' : 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              color: '#BAE6FD',
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
            }}
          >
            <Droplets size={16} color="#38BDF8" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Ganga Jal</span>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>Abhishekam</span>
          </button>

          {/* Light Deepam */}
          <button
            type="button"
            onClick={handleToggleDeepam}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.55rem 0.35rem',
              borderRadius: 'var(--radius-md)',
              background: deepamLit ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(253, 230, 138, 0.45)',
              color: '#FEF3C7',
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
            }}
          >
            <Flame size={16} color="#F59E0B" fill={deepamLit ? '#F59E0B' : 'none'} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Akhand Deepam</span>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              {deepamLit ? 'Flame Lit 🪔' : 'Light Lamp'}
            </span>
          </button>
        </div>
      </div>

      {/* Sacred Darshan Tabs Connecting Coimbatore, Chennai & Ujjain */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.35rem',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveDarshan('adiyogi')}
            style={{
              padding: '0.45rem 0.3rem',
              borderRadius: 'var(--radius-md)',
              background: activeDarshan === 'adiyogi' ? 'rgba(253, 230, 138, 0.22)' : 'rgba(255, 255, 255, 0.05)',
              border: activeDarshan === 'adiyogi' ? '1px solid rgba(253, 230, 138, 0.65)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeDarshan === 'adiyogi' ? '#FEF3C7' : 'var(--color-muted)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            Adiyogi • Kovai
          </button>

          <button
            type="button"
            onClick={() => setActiveDarshan('kapaleeshwarar')}
            style={{
              padding: '0.45rem 0.3rem',
              borderRadius: 'var(--radius-md)',
              background: activeDarshan === 'kapaleeshwarar' ? 'rgba(253, 230, 138, 0.22)' : 'rgba(255, 255, 255, 0.05)',
              border: activeDarshan === 'kapaleeshwarar' ? '1px solid rgba(253, 230, 138, 0.65)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeDarshan === 'kapaleeshwarar' ? '#FEF3C7' : 'var(--color-muted)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            Kapaleeshwarar • Chennai
          </button>

          <button
            type="button"
            onClick={() => setActiveDarshan('ujjain')}
            style={{
              padding: '0.45rem 0.3rem',
              borderRadius: 'var(--radius-md)',
              background: activeDarshan === 'ujjain' ? 'rgba(251, 191, 36, 0.28)' : 'rgba(255, 255, 255, 0.05)',
              border: activeDarshan === 'ujjain' ? '1px solid rgba(251, 191, 36, 0.75)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeDarshan === 'ujjain' ? '#FDE68A' : 'var(--color-muted)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            Mahakaleshwar • Ujjain ✦
          </button>

          <button
            type="button"
            onClick={() => setActiveDarshan('chandra')}
            style={{
              padding: '0.45rem 0.3rem',
              borderRadius: 'var(--radius-md)',
              background: activeDarshan === 'chandra' ? 'rgba(253, 230, 138, 0.22)' : 'rgba(255, 255, 255, 0.05)',
              border: activeDarshan === 'chandra' ? '1px solid rgba(253, 230, 138, 0.65)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeDarshan === 'chandra' ? '#FEF3C7' : 'var(--color-muted)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
              textAlign: 'center',
            }}
          >
            Chandra • Divine Grace
          </button>
        </div>

        {/* Darshan Detail Card */}
        <div
          style={{
            width: '100%',
            padding: '1.15rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(14, 18, 36, 0.8)',
            border: '1px solid rgba(253, 230, 138, 0.35)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            minHeight: '115px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          }}
        >
          <AnimatePresence mode="wait">
            {activeDarshan === 'adiyogi' && (
              <motion.div
                key="adiyogi"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#FDE68A',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  <Sparkles size={13} />
                  <span>ADIYOGI ✦ VELLIANGIRI FOOTHILLS • COIMBATORE</span>
                </div>
                <p
                  style={{
                    color: 'var(--color-ivory)',
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  "Here in Coimbatore, where Adiyogi sits serene beneath the Western Ghats. In Kovai, we call these mountains the Kailash of the South. Whenever I look up at the mountain breeze, I ask Mahadeva to surround you with quiet strength, deep happiness, and eternal peace."
                </p>
              </motion.div>
            )}

            {activeDarshan === 'kapaleeshwarar' && (
              <motion.div
                key="kapaleeshwarar"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#93C5FD',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  <Bell size={13} />
                  <span>KAPALEESHWARAR ✦ MYLAPORE • CHENNAI</span>
                </div>
                <p
                  style={{
                    color: 'var(--color-ivory)',
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  "In the timeless streets of Mylapore, Chennai, where temple bells ring through the coastal breeze. His presence watches over your city every single day, keeping you safe and guiding every step of your new journey after graduating."
                </p>
              </motion.div>
            )}

            {activeDarshan === 'ujjain' && (
              <motion.div
                key="ujjain"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#FBBF24',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  <Sparkles size={13} />
                  <span>SRI MAHAKALESHWAR ✦ UJJAIN • OUR DREAM PILGRIMAGE</span>
                </div>
                <p
                  style={{
                    color: 'var(--color-ivory)',
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  "Located on the sacred banks of the Shipra river in Ujjain — the revered place you told me you want to travel to together with me. One day, we will make this dream pilgrimage to Ujjain side-by-side: attend the sacred dawn Bhasma Aarti together, hear the holy conch echo, and bow our heads to Mahadeva side-by-side with full devotion. A promise written in our stars."
                </p>
                <div
                  style={{
                    marginTop: '0.45rem',
                    fontSize: '0.75rem',
                    color: '#FEF3C7',
                    fontFamily: 'var(--font-serif)',
                    letterSpacing: '0.02em',
                  }}
                >
                  A Sacred Pilgrimage Awaiting Us in Ujjain ✦
                </div>
              </motion.div>
            )}

            {activeDarshan === 'chandra' && (
              <motion.div
                key="chandra"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: '#F472B6',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  <Heart size={13} />
                  <span>CHANDRASHEKHARA ✦ THE CRESCENT MOON & DIVINE GRACE</span>
                </div>
                <p
                  style={{
                    color: 'var(--color-ivory)',
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  "The crescent moon resting in His matted hair is the exact same moon looking down on Chennai and Coimbatore tonight. May Lord Shiva's divine grace protect you, bless your mind with unshakeable calm, and illuminate every path ahead."
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Birthday Devotional Blessing Inscription */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '0.9rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(253, 230, 138, 0.08)',
          border: '1px solid rgba(253, 230, 138, 0.25)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1rem',
            color: '#FEF3C7',
            letterSpacing: '0.04em',
            fontWeight: 600,
            display: 'block',
            marginBottom: '0.25rem',
          }}
        >
          ஓம் நமச்சிவாய ✦ Om Namah Shivaya
        </span>
        <span
          style={{
            fontSize: '0.74rem',
            color: 'var(--color-muted)',
            fontStyle: 'italic',
          }}
        >
          Dedicated to {siteContent.recipient.nickname} on November 8th • Blessed from Coimbatore to Chennai & to Ujjain
        </span>
      </div>
    </div>
  );
};
