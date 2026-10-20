import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

type AudioMode = 'off' | 'musicbox' | 'ambient';

export const AmbientSoundscape: React.FC = () => {
  const [mode, setMode] = useState<AudioMode>('off');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeOscsRef = useRef<OscillatorNode[]>([]);

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

  // Stop all current audio
  const stopAll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (masterGainRef.current && audioCtxRef.current) {
      try {
        const ctx = audioCtxRef.current;
        masterGainRef.current.gain.setValueAtTime(
          masterGainRef.current.gain.value,
          ctx.currentTime
        );
        masterGainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      activeOscsRef.current.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // ignore
        }
      });
      activeOscsRef.current = [];
    }, 850);
  };

  // 1. CELESTIAL MUSIC BOX SYNTHESIZER
  // Simulates metallic music box tines using FM synthesis & physical metal resonance
  const startMusicBox = () => {
    stopAll();
    const ctx = getAudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Melody notes (F major / D minor pentatonic starry lullaby)
    // F4, A4, C5, E5, D5, C5, A4, G4, A4, C5, D5, F5, E5, C5, D5
    const melody = [
      349.23, // F4
      440.0,  // A4
      523.25, // C5
      659.25, // E5
      587.33, // D5
      523.25, // C5
      440.0,  // A4
      392.0,  // G4
      440.0,  // A4
      523.25, // C5
      587.33, // D5
      698.46, // F5
      659.25, // E5
      523.25, // C5
      440.0,  // A4
      349.23, // F4
    ];

    let noteIdx = 0;

    const playNote = (freq: number) => {
      if (!ctx || ctx.state === 'closed') return;
      const now = ctx.currentTime;

      // Primary tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Metallic tine overtone (bell harmonic at 2.756x fundamental)
      const harmonicOsc = ctx.createOscillator();
      harmonicOsc.type = 'sine';
      harmonicOsc.frequency.setValueAtTime(freq * 2.756, now);

      // Note envelope: instant pluck attack, slow exponential music box ring decay
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.35, now + 0.008); // pluck
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2); // metallic ring

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.0001, now);
      harmonicGain.gain.linearRampToValueAtTime(0.12, now + 0.005);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(masterGain);

      osc.start(now);
      harmonicOsc.start(now);

      osc.stop(now + 2.3);
      harmonicOsc.stop(now + 0.9);
    };

    // Play initial note immediately
    playNote(melody[0]);
    noteIdx = 1;

    // Cycle notes every 0.65s
    timerRef.current = window.setInterval(() => {
      playNote(melody[noteIdx]);
      noteIdx = (noteIdx + 1) % melody.length;
    }, 650);
  };

  // 2. WARM CELESTIAL AMBIENT CHORD DRONE
  const startAmbient = () => {
    stopAll();
    const ctx = getAudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 2.5);
    masterGainRef.current = masterGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    const freqs = [87.31, 130.81, 174.61, 261.63, 392.0];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.25 / freqs.length, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscs.push(osc);
    });

    activeOscsRef.current = oscs;
  };

  const handleToggle = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(10); } catch {}
    }

    if (mode === 'off') {
      setMode('musicbox');
      startMusicBox();
    } else if (mode === 'musicbox') {
      setMode('ambient');
      startAmbient();
    } else {
      setMode('off');
      stopAll();
    }
  };

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={handleToggle}
        title={
          mode === 'off'
            ? 'Play Celestial Music Box'
            : mode === 'musicbox'
            ? 'Switch to Ambient Drone'
            : 'Mute Audio'
        }
        aria-label="Toggle Celestial Soundscape mode"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background:
            mode === 'musicbox'
              ? 'linear-gradient(135deg, rgba(253, 230, 138, 0.22) 0%, rgba(167, 139, 250, 0.18) 100%)'
              : mode === 'ambient'
              ? 'rgba(167, 139, 250, 0.22)'
              : 'rgba(255, 255, 255, 0.05)',
          border:
            mode === 'musicbox'
              ? '1px solid rgba(253, 230, 138, 0.45)'
              : mode === 'ambient'
              ? '1px solid rgba(167, 139, 250, 0.45)'
              : '1px solid rgba(255, 255, 255, 0.1)',
          color:
            mode === 'musicbox'
              ? 'var(--color-gold-soft)'
              : mode === 'ambient'
              ? 'var(--color-ivory)'
              : 'var(--color-muted)',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-sans)',
          transition: 'all 0.3s ease',
          boxShadow:
            mode === 'musicbox'
              ? '0 0 16px rgba(253, 230, 138, 0.3)'
              : mode === 'ambient'
              ? '0 0 16px rgba(167, 139, 250, 0.25)'
              : 'none',
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        {mode === 'musicbox' ? (
          <>
            <Music size={13} color="#FDE68A" />
            <span>Music Box</span>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#FDE68A',
                boxShadow: '0 0 6px #FDE68A',
              }}
            />
          </>
        ) : mode === 'ambient' ? (
          <>
            <Volume2 size={13} color="#A78BFA" />
            <span>Ambient Drone</span>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#A78BFA',
                boxShadow: '0 0 6px #A78BFA',
              }}
            />
          </>
        ) : (
          <>
            <VolumeX size={13} />
            <span>Soundscape</span>
          </>
        )}
      </button>
    </div>
  );
};
