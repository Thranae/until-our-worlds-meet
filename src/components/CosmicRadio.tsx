import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Volume2, Sparkles, CloudRain, Music, Heart } from 'lucide-react';

interface Station {
  freq: number;
  name: string;
  genre: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const STATIONS: Station[] = [
  {
    freq: 92.4,
    name: "Midnight Rain & Thunder",
    genre: "Ambient Rain",
    icon: <CloudRain size={16} color="#93C5FD" />,
    description: "The sound of rain falling over our cities while we stay warm on call.",
    color: "#93C5FD",
  },
  {
    freq: 98.8,
    name: "Lo-Fi Star Reverie",
    genre: "Warm Rhodes Chords",
    icon: <Music size={16} color="#A78BFA" />,
    description: "Quiet mellow chords for late night studying, relaxing, or thinking of you.",
    color: "#A78BFA",
  },
  {
    freq: 104.6,
    name: "Celestial Music Box",
    genre: "Starlight Lullaby",
    icon: <Sparkles size={16} color="#FDE68A" />,
    description: "Delicate metallic music box melody composed especially for our universe.",
    color: "#FDE68A",
  },
  {
    freq: 110.8,
    name: "Bot's Birthday Frequency (11.08)",
    genre: "Celestial Resonance",
    icon: <Heart size={16} color="#F472B6" />,
    description: "The special birthday channel dedicated entirely to you on November 8.",
    color: "#F472B6",
  },
];

export const CosmicRadio: React.FC = () => {
  const [currentFreq, setCurrentFreq] = useState(110.8);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const timerRef = useRef<number | null>(null);

  // Find nearest active station within 0.8 MHz
  const activeStation = STATIONS.find((s) => Math.abs(s.freq - currentFreq) <= 0.6) || null;
  const isTunedIn = activeStation !== null;

  const getAudioContext = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch {}
      noiseSourceRef.current = null;
    }

    activeOscsRef.current.forEach(({ osc, gain }) => {
      try {
        gain.gain.setValueAtTime(gain.gain.value, audioCtxRef.current?.currentTime || 0);
        gain.gain.exponentialRampToValueAtTime(0.0001, (audioCtxRef.current?.currentTime || 0) + 0.3);
        setTimeout(() => {
          try { osc.stop(); osc.disconnect(); } catch {}
        }, 320);
      } catch {}
    });
    activeOscsRef.current = [];
  };

  const startRadioStation = (station: Station) => {
    stopAudio();
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.2, now);
    master.connect(ctx.destination);

    if (station.freq === 92.4) {
      // 1. Midnight Rain Synthesis (Pink noise + lowpass filter)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.12;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(1400, now);

      noise.connect(rainFilter);
      rainFilter.connect(master);
      noise.start();
      noiseSourceRef.current = noise;
    } else if (station.freq === 98.8) {
      // 2. Lo-Fi Chords
      const chords = [
        [220.0, 261.63, 329.63], // Am
        [174.61, 220.0, 261.63], // F
        [261.63, 329.63, 392.0], // C
        [196.0, 246.94, 293.66], // G
      ];
      let chordIdx = 0;
      const playChord = (chord: number[]) => {
        chord.forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          g.gain.setValueAtTime(0.001, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);
          osc.connect(g);
          g.connect(master);
          osc.start();
          osc.stop(ctx.currentTime + 3.0);
        });
      };
      playChord(chords[0]);
      timerRef.current = window.setInterval(() => {
        chordIdx = (chordIdx + 1) % chords.length;
        playChord(chords[chordIdx]);
      }, 3000);
    } else if (station.freq === 104.6) {
      // 3. Music Box Notes
      const notes = [523.25, 659.25, 783.99, 880.0, 659.25, 523.25, 440.0, 523.25];
      let idx = 0;
      const playTine = (f: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
        osc.connect(g);
        g.connect(master);
        osc.start();
        osc.stop(ctx.currentTime + 1.9);
      };
      playTine(notes[0]);
      timerRef.current = window.setInterval(() => {
        idx = (idx + 1) % notes.length;
        playTine(notes[idx]);
      }, 750);
    } else {
      // 4. Bot's Birthday 110.8 Special Resonance (Harp arpeggios + warm chime)
      const notes = [440.0, 554.37, 659.25, 880.0, 1108.73, 880.0, 659.25, 554.37];
      let idx = 0;
      const playSpecial = (f: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
        osc.connect(g);
        g.connect(master);
        osc.start();
        osc.stop(ctx.currentTime + 2.3);
      };
      playSpecial(notes[0]);
      timerRef.current = window.setInterval(() => {
        idx = (idx + 1) % notes.length;
        playSpecial(notes[idx]);
      }, 620);
    }
  };

  const handleTuneChange = (freq: number) => {
    setCurrentFreq(freq);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(8); } catch {}
    }

    const matched = STATIONS.find((s) => Math.abs(s.freq - freq) <= 0.6);
    if (matched && isPlaying) {
      startRadioStation(matched);
    } else if (!matched && isPlaying) {
      // Play faint static
      stopAudio();
    }
  };

  const togglePower = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(20); } catch {}
    }

    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (activeStation) {
        startRadioStation(activeStation);
      } else {
        // Snap to birthday station 110.8
        setCurrentFreq(110.8);
        startRadioStation(STATIONS[3]);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '1.5rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* VINTAGE CELESTIAL RADIO CASING */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          padding: '2rem 1.6rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(253, 230, 138, 0.35)',
          boxShadow: isPlaying
            ? '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(253, 230, 138, 0.25)'
            : '0 16px 40px rgba(0, 0, 0, 0.6)',
          transition: 'box-shadow 0.5s ease',
        }}
      >
        {/* Top Control Header & Vacuum Tubes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          {/* Radio Brand Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.2) 0%, rgba(167, 139, 250, 0.2) 100%)',
                border: '1px solid rgba(253, 230, 138, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Radio size={18} color="#FDE68A" />
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-ivory)',
                  letterSpacing: '0.04em',
                }}
              >
                THE MIDNIGHT FREQUENCIES
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                Celestial FM Receiver • Across the Miles
              </span>
            </div>
          </div>

          {/* Glowing Retro Vacuum Tube */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <motion.div
              animate={
                isPlaying && isTunedIn
                  ? {
                      opacity: [0.7, 1, 0.75, 1, 0.7],
                      scale: [0.95, 1.05, 0.98, 1.04, 0.95],
                    }
                  : { opacity: 0.3 }
              }
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '12px',
                height: '24px',
                borderRadius: '6px 6px 3px 3px',
                background: isPlaying && isTunedIn
                  ? 'radial-gradient(ellipse at 50% 60%, #FFFFFF 0%, #F59E0B 40%, #B45309 100%)'
                  : '#475569',
                boxShadow: isPlaying && isTunedIn ? '0 0 14px #F59E0B' : 'none',
              }}
            />
            <span style={{ fontSize: '0.66rem', color: isPlaying ? '#FDE68A' : 'var(--color-muted)', fontWeight: 600 }}>
              {isPlaying ? (isTunedIn ? 'LOCKED' : 'SEEKING') : 'OFF'}
            </span>
          </div>
        </div>

        {/* FREQUENCY TUNING SCALE DIAL */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(8, 11, 24, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1.5px solid rgba(253, 230, 138, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1rem 1rem',
            marginBottom: '1.5rem',
            boxShadow: 'inset 0 4px 15px rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* Backlit Frequency Numbers */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.8rem',
              padding: '0 0.5rem',
            }}
          >
            {[88, 92, 96, 100, 104, 108, 112].map((f) => (
              <span
                key={f}
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  color: Math.abs(currentFreq - f) < 3 ? '#FDE68A' : 'rgba(255, 255, 255, 0.35)',
                  fontWeight: Math.abs(currentFreq - f) < 3 ? 700 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Interactive Range Slider Tuning Needle */}
          <div style={{ position: 'relative', height: '36px', display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min={88.0}
              max={112.0}
              step={0.2}
              value={currentFreq}
              onChange={(e) => handleTuneChange(parseFloat(e.target.value))}
              aria-label="Radio frequency tuner"
              style={{
                width: '100%',
                accentColor: '#F59E0B',
                cursor: 'pointer',
                height: '6px',
                zIndex: 2,
              }}
            />

            {/* Glowing Tuning Needle Indicator */}
            <div
              style={{
                position: 'absolute',
                left: `${((currentFreq - 88) / (112 - 88)) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                background: '#EF4444',
                boxShadow: '0 0 8px #EF4444, 0 0 15px #F59E0B',
                pointerEvents: 'none',
                transform: 'translateX(-50%)',
                zIndex: 3,
              }}
            />
          </div>

          {/* Station Markers Dots */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '14px',
              marginTop: '4px',
            }}
          >
            {STATIONS.map((st) => {
              const pct = ((st.freq - 88) / (112 - 88)) * 100;
              const isClose = Math.abs(currentFreq - st.freq) <= 0.6;
              return (
                <div
                  key={st.freq}
                  onClick={() => handleTuneChange(st.freq)}
                  title={`Jump to ${st.name}`}
                  style={{
                    position: 'absolute',
                    left: `${pct}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isClose ? '10px' : '6px',
                    height: isClose ? '10px' : '6px',
                    borderRadius: '50%',
                    backgroundColor: isClose ? '#FEF08A' : 'rgba(255, 255, 255, 0.35)',
                    boxShadow: isClose ? '0 0 10px #FEF08A' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* ACTIVE STATION METADATA CARD */}
        <AnimatePresence mode="wait">
          {activeStation ? (
            <motion.div
              key={activeStation.freq}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${activeStation.color}40`,
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: activeStation.color,
                  marginBottom: '0.35rem',
                }}
              >
                {activeStation.icon}
                <span>{activeStation.freq} FM • {activeStation.genre.toUpperCase()}</span>
              </div>

              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  color: 'var(--color-ivory)',
                  marginBottom: '0.3rem',
                }}
              >
                {activeStation.name}
              </h4>

              <p style={{ fontSize: '0.82rem', color: 'var(--color-ivory-dim)', fontStyle: 'italic', margin: 0 }}>
                "{activeStation.description}"
              </p>
            </motion.div>
          ) : (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                marginBottom: '1.25rem',
                textAlign: 'center',
                fontSize: '0.82rem',
                color: 'var(--color-muted)',
              }}
            >
              <span>Searching cosmic frequencies ({currentFreq.toFixed(1)} FM)... Slide toward yellow dots to tune in.</span>
            </div>
          )}
        </AnimatePresence>

        {/* RADIO BUTTONS & PRESETS */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          {/* Main Power Button */}
          <motion.button
            type="button"
            onClick={togglePower}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: '1 1 140px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: isPlaying
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'rgba(255, 255, 255, 0.06)',
              border: isPlaying ? '1px solid rgba(254, 240, 138, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isPlaying ? '#FEF3C7' : 'var(--color-ivory)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: isPlaying ? '0 0 20px rgba(245, 158, 11, 0.4)' : 'none',
              transition: 'all 0.25s',
            }}
          >
            <Volume2 size={16} />
            <span>{isPlaying ? 'Radio Active ✦' : 'Turn On Radio'}</span>
          </motion.button>

          {/* Quick Preset: Jump to 110.8 Birthday Station */}
          <button
            type="button"
            onClick={() => handleTuneChange(110.8)}
            className="btn-secondary"
            style={{
              fontSize: '0.78rem',
              padding: '0.55rem 0.95rem',
              borderColor: 'rgba(244, 114, 182, 0.4)',
              color: '#F472B6',
            }}
            aria-label="Tune to Bot's birthday frequency 110.8"
          >
            <Heart size={13} fill="#F472B6" />
            <span>110.8 FM • Bot's Day</span>
          </button>
        </div>
      </div>
    </div>
  );
};
