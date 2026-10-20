import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCw, Sparkles, Volume2 } from 'lucide-react';

interface NoteItem {
  id: number;
  symbol: string;
  x: number;
  y: number;
}

// Birthday melody frequencies for music box (Crystal-clear high chime octave)
const MELODY_NOTES = [
  { note: 'C5', freq: 523.25, duration: 0.35, delay: 0.0 },
  { note: 'C5', freq: 523.25, duration: 0.25, delay: 0.35 },
  { note: 'D5', freq: 587.33, duration: 0.55, delay: 0.65 },
  { note: 'C5', freq: 523.25, duration: 0.55, delay: 1.25 },
  { note: 'F5', freq: 698.46, duration: 0.55, delay: 1.85 },
  { note: 'E5', freq: 659.25, duration: 0.95, delay: 2.45 },

  { note: 'C5', freq: 523.25, duration: 0.35, delay: 3.55 },
  { note: 'C5', freq: 523.25, duration: 0.25, delay: 3.90 },
  { note: 'D5', freq: 587.33, duration: 0.55, delay: 4.20 },
  { note: 'C5', freq: 523.25, duration: 0.55, delay: 4.80 },
  { note: 'G5', freq: 783.99, duration: 0.55, delay: 5.40 },
  { note: 'F5', freq: 698.46, duration: 0.95, delay: 6.00 },

  { note: 'C5', freq: 523.25, duration: 0.35, delay: 7.10 },
  { note: 'C5', freq: 523.25, duration: 0.25, delay: 7.45 },
  { note: 'C6', freq: 1046.5, duration: 0.55, delay: 7.75 },
  { note: 'A5', freq: 880.00, duration: 0.55, delay: 8.35 },
  { note: 'F5', freq: 698.46, duration: 0.55, delay: 8.95 },
  { note: 'E5', freq: 659.25, duration: 0.55, delay: 9.55 },
  { note: 'D5', freq: 587.33, duration: 0.85, delay: 10.15 },

  { note: 'Bb5', freq: 932.33, duration: 0.35, delay: 11.20 },
  { note: 'Bb5', freq: 932.33, duration: 0.25, delay: 11.55 },
  { note: 'A5', freq: 880.00, duration: 0.55, delay: 11.85 },
  { note: 'F5', freq: 698.46, duration: 0.55, delay: 12.45 },
  { note: 'G5', freq: 783.99, duration: 0.55, delay: 13.05 },
  { note: 'F5', freq: 698.46, duration: 1.25, delay: 13.65 },
];

export const CelestialMusicBox: React.FC = () => {
  const [springTension, setSpringTension] = useState(65); // 0 to 100%
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTine, setActiveTine] = useState<number | null>(null);
  const [floatingNotes, setFloatingNotes] = useState<NoteItem[]>([]);
  const [keyRotation, setKeyRotation] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Synthesize realistic bell-tone music box chime
  const playChimeNote = useCallback((freq: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Fundamental chime tone (sine wave)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.22, now + 0.004); // Instant crystalline attack
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8); // Natural metal tinkle decay

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.85);

      // 2. High metallic bell overtone (tuned steel comb resonance)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.76, now); // Anharmonic steel bell overtone

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.002);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.6);

      // 3. Ultra-subtle wooden soundboard body resonance
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(freq * 0.5, now);

      gain3.gain.setValueAtTime(0.0001, now);
      gain3.gain.linearRampToValueAtTime(0.04, now + 0.006);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now);
      osc3.stop(now + 0.45);
    } catch {
      // safe fallback
    }
  }, []);

  // Mechanical ratchet pawl click sound for key winding
  const playRatchetClick = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.025);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // fallback
    }
  }, []);

  // Winding the key
  const handleWindKey = () => {
    setKeyRotation((prev) => prev + 90);
    setSpringTension((prev) => Math.min(100, prev + 20));
    playRatchetClick();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {
        // fallback
      }
    }
  };

  // Schedule playback sequence
  const startPlayback = useCallback(() => {
    // Clear any prior schedule
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    const symbols = ['♪', '♫', '✦', '✧', '⋆'];

    MELODY_NOTES.forEach((item, index) => {
      const t = window.setTimeout(() => {
        playChimeNote(item.freq);
        setActiveTine(index % 16);

        // Haptic tap
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(6);
          } catch {
            // fallback
          }
        }

        // Spawn a floating music symbol
        const newNote: NoteItem = {
          id: Date.now() + Math.random(),
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          x: (index % 16) * 16 - 120 + Math.random() * 20,
          y: -20,
        };
        setFloatingNotes((prev) => [...prev.slice(-8), newNote]);

        // Tension unwinds
        setSpringTension((prev) => Math.max(0, prev - 2.8));

        // Turn key slightly counter-clockwise as spring uncoils
        setKeyRotation((prev) => prev - 12);
      }, item.delay * 1000);

      timeoutsRef.current.push(t);
    });

    // End of loop
    const totalDuration = (MELODY_NOTES[MELODY_NOTES.length - 1].delay + 1.8) * 1000;
    const endTimeout = window.setTimeout(() => {
      setIsPlaying(false);
      setActiveTine(null);
    }, totalDuration);
    timeoutsRef.current.push(endTimeout);
  }, [playChimeNote]);

  const stopPlayback = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    setIsPlaying(false);
    setActiveTine(null);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (springTension <= 5) {
        handleWindKey();
      }
      setIsPlaying(true);
      startPlayback();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('celestial-foreground-audio-start'));
      }
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('celestial-foreground-audio-stop'));
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('celestial-foreground-audio-stop'));
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.4rem',
      }}
    >
      {/* 3D Music Box Vessel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '26px',
          background: 'linear-gradient(145deg, #181124 0%, #0D0A14 60%, #171120 100%)',
          border: '1.5px solid rgba(251, 191, 36, 0.35)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          padding: '1.75rem 1.4rem',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Floating Musical Notes Particles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence>
            {floatingNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 1, y: 140, x: note.x, scale: 0.6 }}
                animate={{ opacity: 0, y: -40, x: note.x + (Math.random() * 40 - 20), scale: 1.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '20%',
                  color: '#FDE68A',
                  fontSize: '1.25rem',
                  textShadow: '0 0 12px rgba(253, 230, 138, 0.8)',
                  pointerEvents: 'none',
                }}
              >
                {note.symbol}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Polished Brass Corner Ornaments */}
        {[
          { top: 8, left: 8, r: 0 },
          { top: 8, right: 8, r: 90 },
          { bottom: 8, right: 8, r: 180 },
          { bottom: 8, left: 8, r: 270 },
        ].map((pos, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              ...pos,
              width: '16px',
              height: '16px',
              borderTop: '2px solid rgba(251, 191, 36, 0.6)',
              borderLeft: '2px solid rgba(251, 191, 36, 0.6)',
              transform: `rotate(${pos.r}deg)`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Engraved Polished Brass Header Plaque */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
            paddingBottom: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} color="#FDE68A" />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.98rem',
                color: '#FDE68A',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Bot Celestial Orgel
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              color: 'rgba(253, 230, 138, 0.65)',
              letterSpacing: '0.12em',
              background: 'rgba(251, 191, 36, 0.1)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
            }}
          >
            NO. 1108 • 432 Hz
          </span>
        </div>

        {/* The Sound Chamber: Rotating Brass Cylinder & Tuned Comb */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '130px',
            background: 'linear-gradient(180deg, #0A0812 0%, #151020 50%, #0A0812 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            boxShadow: 'inset 0 4px 16px rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '1.25rem',
          }}
        >
          {/* Rotating Brass Pin Cylinder */}
          <motion.div
            animate={{
              backgroundPosition: isPlaying ? ['0px 0px', '240px 0px'] : '0px 0px',
            }}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              width: '88%',
              height: '42px',
              borderRadius: '21px',
              background: `
                repeating-linear-gradient(90deg, 
                  rgba(251, 191, 36, 0.8) 0px, 
                  rgba(217, 119, 6, 0.9) 8px, 
                  rgba(254, 240, 138, 1) 16px, 
                  rgba(180, 83, 9, 0.8) 24px
                )
              `,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 6px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 10px',
            }}
          >
            {/* Golden raised music pins that catch specular light */}
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '3.5px',
                  height: '7px',
                  borderRadius: '2px',
                  background: '#FFFFFF',
                  boxShadow: '0 0 6px #FDE68A',
                }}
              />
            ))}
          </motion.div>

          {/* Tuned Steel Comb Tines (16 tines that resonate when struck) */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              width: '82%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              pointerEvents: 'none',
            }}
          >
            {Array.from({ length: 16 }).map((_, index) => {
              const isResonating = activeTine === index;
              const tineHeight = 24 + (index % 5) * 4;
              return (
                <div
                  key={index}
                  style={{
                    width: '6px',
                    height: `${tineHeight}px`,
                    background: isResonating
                      ? 'linear-gradient(180deg, #FFFFFF 0%, #FDE68A 50%, #B45309 100%)'
                      : 'linear-gradient(180deg, #94A3B8 0%, #64748B 50%, #334155 100%)',
                    borderRadius: '2px 2px 0 0',
                    boxShadow: isResonating ? '0 0 10px #FDE68A' : 'none',
                    transform: isResonating ? 'scaleY(1.15) translateY(-2px)' : 'scaleY(1)',
                    transition: 'transform 0.08s ease-out, background 0.12s',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Mechanism Status: Spring Tension Gauge & Control Lever */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Tension Bar Meter */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: 'var(--color-starlight-muted)',
                fontFamily: 'var(--font-sans)',
                marginBottom: '0.35rem',
              }}
            >
              <span>Mainspring Tension</span>
              <span style={{ color: springTension > 20 ? '#FDE68A' : '#EF4444' }}>
                {Math.round(springTension)}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${springTension}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #D97706 0%, #FDE68A 100%)',
                  boxShadow: '0 0 8px rgba(253, 230, 138, 0.5)',
                  transition: 'width 0.25s ease-out',
                }}
              />
            </div>
          </div>

          {/* Interactive Brass Winding Key */}
          <button
            type="button"
            onClick={handleWindKey}
            title="Wind the music box spring"
            aria-label="Wind the music box key"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              background: 'rgba(251, 191, 36, 0.12)',
              border: '1.5px solid rgba(251, 191, 36, 0.45)',
              borderRadius: '14px',
              padding: '0.45rem 0.75rem',
              color: '#FDE68A',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <motion.div
              animate={{ rotate: keyRotation }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            >
              <RotateCw size={18} color="#FDE68A" />
            </motion.div>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-sans)' }}>Wind Key</span>
          </button>

          {/* Toggle Play/Pause Lever */}
          <button
            type="button"
            onClick={togglePlay}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              background: isPlaying
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.5)',
              color: '#FFFDF2',
              fontSize: '0.84rem',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              cursor: 'pointer',
              touchAction: 'manipulation',
              boxShadow: isPlaying ? '0 0 16px rgba(245, 158, 11, 0.5)' : 'none',
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? 'Pause' : 'Play Theme'}</span>
          </button>
        </div>
      </div>

      {/* Melodic Note Info & Lullaby Inscription */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: 'var(--color-starlight-muted)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Volume2 size={14} color="#A78BFA" />
        <span>"Happy Birthday Bot" • Transposed for celestial steel chime</span>
      </div>
    </div>
  );
};
