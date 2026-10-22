import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music2, Sparkles, SkipForward } from 'lucide-react';
import { audioBus } from '../utils/audioBus';

interface VinylNote {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  symbol: string;
  size: number;
}

const TRACKS = [
  {
    title: 'Zaalima ✦ Late Night Acoustic',
    subtitle: 'Our Midnight Background Melody',
    duration: '04:22',
    color: '#FDE68A',
  },
  {
    title: 'Pochinki Rooftops & Rain',
    subtitle: 'Two Voices Over Headsets • 02:45 AM',
    duration: '03:51',
    color: '#93C5FD',
  },
  {
    title: 'Until Our Worlds Meet',
    subtitle: 'Dedicated to Bot on November 8th',
    duration: '∞',
    color: '#F472B6',
  },
];

export const VinylRecordPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [speed, setSpeed] = useState<'33' | '45'>('33');
  const [rotation, setRotation] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const notesRef = useRef<VinylNote[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Synthesize authentic vinyl needle drop & warm surface crackle
  const startVinylCrackle = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      // Needle drop thump
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
      thumpGain.gain.setValueAtTime(0.2, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);

      // Warm vinyl white/pink noise crackle buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Sparse gentle vinyl pops
        const pop = Math.random() < 0.0015 ? (Math.random() - 0.5) * 0.4 : 0;
        output[i] = (Math.random() * 2 - 1) * 0.015 + pop;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, now);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);
      noiseNodeRef.current = noiseGain;
    } catch {
      // Safe fallback
    }
  }, []);

  const stopVinylCrackle = useCallback(() => {
    try {
      if (noiseNodeRef.current && audioCtxRef.current) {
        // Disconnect or mute
        (noiseNodeRef.current as GainNode).gain.exponentialRampToValueAtTime(
          0.0001,
          audioCtxRef.current.currentTime + 0.2
        );
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Melodic vinyl chime when advancing tracks
  const playChimeNote = useCallback((freq: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.85);
    } catch {
      // Safe fallback
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioBus.reportAudioStart('vinyl-player');
    } else {
      audioBus.reportAudioStop('vinyl-player');
    }
    return () => {
      audioBus.reportAudioStop('vinyl-player');
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {
        // Safe fallback
      }
    }

    if (!isPlaying) {
      startVinylCrackle();
      playChimeNote(523.25); // C5
      setIsPlaying(true);
    } else {
      stopVinylCrackle();
      setIsPlaying(false);
    }
  };

  const handleNextTrack = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe fallback
      }
    }
    const nextIdx = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    playChimeNote([523.25, 659.25, 783.99][nextIdx]);
  };

  // Canvas floating music notes animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const symbols = ['♩', '♪', '♫', '♬', '✦', '✧'];

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      if (isPlaying) {
        // Spawn notes near tone-arm tip (right side of vinyl)
        if (Math.random() < 0.08) {
          notesRef.current.push({
            x: w * 0.62 + (Math.random() - 0.5) * 40,
            y: h * 0.42 + (Math.random() - 0.5) * 30,
            vy: -(Math.random() * 0.9 + 0.6),
            alpha: 1,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            size: Math.random() * 8 + 14,
          });
        }
      }

      // Update & render notes
      const notes = notesRef.current;
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.y += n.vy;
        n.x += Math.sin(n.y * 0.05) * 0.5;
        n.alpha -= 0.012;

        if (n.alpha <= 0) {
          notes.splice(i, 1);
          continue;
        }

        ctx.font = `${n.size}px serif`;
        ctx.fillStyle = `rgba(253, 230, 138, ${n.alpha})`;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fillText(n.symbol, n.x, n.y);
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying]);

  // Vinyl rotation animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    const speedMultiplier = speed === '45' ? 2.5 : 1.8;

    const rotate = () => {
      setRotation((prev) => (prev + speedMultiplier) % 360);
      animId = requestAnimationFrame(rotate);
    };

    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  const currentTrack = TRACKS[currentTrackIndex];

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
      {/* Vintage Wooden & Brass Turntable Platter */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(145deg, #161a2e 0%, #0e1224 50%, #080b18 100%)',
          border: '1.5px solid rgba(216, 204, 255, 0.18)',
          boxShadow: isPlaying
            ? '0 16px 45px rgba(0, 0, 0, 0.65), 0 0 35px rgba(253, 230, 138, 0.12)'
            : '0 12px 35px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'box-shadow 0.6s ease',
        }}
      >
        {/* Floating notes canvas layer */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Vintage Turntable Brushed Brass Rim */}
        <div
          style={{
            position: 'relative',
            width: '82%',
            height: '82%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #252a42 0%, #151829 70%, #0d0f1c 100%)',
            border: '3px solid rgba(253, 230, 138, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 4px 15px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Spinning Vinyl Record Disc */}
          <div
            style={{
              position: 'relative',
              width: '92%',
              height: '92%',
              borderRadius: '50%',
              background: `repeating-radial-gradient(
                circle at 50% 50%,
                #10121a,
                #10121a 2px,
                #1b1e2e 3px,
                #10121a 4px
              )`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.9)',
              transform: `rotate(${rotation}deg)`,
              transition: isPlaying ? 'none' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
            }}
          >
            {/* Glossy Sheen Reflection Angle */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 40%, rgba(255, 255, 255, 0.08) 60%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Center Record Paper Label */}
            <div
              style={{
                width: '38%',
                height: '38%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F59E0B 100%)',
                border: '2px solid rgba(253, 230, 138, 0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              <span
                style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Side A ✦ 33 RPM
              </span>
              <span
                style={{
                  fontSize: '0.52rem',
                  color: '#FDE68A',
                  fontFamily: 'monospace',
                  marginTop: '1px',
                }}
              >
                ZAALIMA
              </span>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#080B18',
                  border: '1.5px solid #FDE68A',
                  marginTop: '3px',
                }}
              />
            </div>
          </div>

          {/* Realistic Turntable Tonearm Assembly */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              width: '60px',
              height: '140px',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            {/* Pivot Base */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FDE68A 0%, #D97706 70%, #78350F 100%)',
                border: '1.5px solid #FDE68A',
                boxShadow: '0 3px 8px rgba(0,0,0,0.7)',
              }}
            />

            {/* Tonearm Wand */}
            <motion.div
              animate={{
                rotate: isPlaying ? 24 : 0,
              }}
              transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '3.5px',
                height: '130px',
                background: 'linear-gradient(180deg, #FDE68A 0%, #B45309 100%)',
                transformOrigin: 'top center',
                borderRadius: '2px',
                boxShadow: '2px 4px 6px rgba(0,0,0,0.5)',
              }}
            >
              {/* Cartridge Head */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: '-7px',
                  width: '18px',
                  height: '12px',
                  borderRadius: '2px',
                  background: '#1F2937',
                  border: '1px solid #FDE68A',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Track Info Card */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(14, 18, 36, 0.65)',
          border: '1px solid rgba(216, 204, 255, 0.12)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isPlaying ? 'rgba(253, 230, 138, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentTrack.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Music2 size={15} color={currentTrack.color} />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.86rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                color: 'var(--color-ivory)',
                letterSpacing: '0.02em',
              }}
            >
              {currentTrack.title}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
              {currentTrack.subtitle}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--color-gold-soft)', fontFamily: 'monospace' }}>
          {isPlaying ? 'PLAYING ✦' : 'READY'}
        </div>
      </div>

      {/* Primary Turntable Touch Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(0.45rem, 2vw, 0.75rem)',
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => setSpeed(speed === '33' ? '45' : '33')}
          style={{
            padding: '0.55rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(14, 18, 36, 0.6)',
            border: '1px solid rgba(216, 204, 255, 0.15)',
            color: 'var(--color-muted)',
            fontSize: 'clamp(0.68rem, 2.2vw, 0.72rem)',
            fontFamily: 'monospace',
            cursor: 'pointer',
            touchAction: 'manipulation',
            whiteSpace: 'nowrap',
          }}
        >
          {speed} RPM
        </button>

        <button
          type="button"
          onClick={togglePlayback}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.7rem clamp(0.95rem, 3vw, 1.5rem)',
            borderRadius: 'var(--radius-full)',
            background: isPlaying
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.18) 100%)'
              : 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.18) 100%)',
            border: `1.5px solid ${isPlaying ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.55)'}`,
            color: isPlaying ? '#FCA5A5' : '#FDE68A',
            fontSize: 'clamp(0.78rem, 2.5vw, 0.86rem)',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
            touchAction: 'manipulation',
            whiteSpace: 'nowrap',
          }}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          <span>{isPlaying ? 'Lift Tonearm' : 'Drop Needle ✦'}</span>
        </button>

        <button
          type="button"
          onClick={handleNextTrack}
          title="Next track"
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(14, 18, 36, 0.6)',
            border: '1px solid rgba(216, 204, 255, 0.15)',
            color: 'var(--color-ivory)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
          }}
        >
          <SkipForward size={14} />
        </button>
      </div>

      {/* Atmospheric Late-Night Narrative Card */}
      <div
        style={{
          width: '100%',
          padding: '1.1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(14, 18, 36, 0.72)',
          border: '1px solid rgba(216, 204, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-gold-soft)',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}
        >
          <Sparkles size={14} />
          <span>The Songs That Built Us</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          Late at night when everything is quiet, certain songs carry memory better than any photograph. Whenever "Zaalima" plays softly in the background, all the hundreds of miles dissolve. It feels like you’re sitting right in the passenger seat beside me, singing the lyrics under your breath.
        </p>
      </div>
    </div>
  );
};
