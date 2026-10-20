import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const AmbientSoundscape: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const startSoundscape = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      // Gentle fade in to comfortable intimate volume
      masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3);
      gainNodeRef.current = masterGain;

      // Filter for warm, deep midnight ambiance
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);

      // Ethereal chord frequencies (Fmaj9 / Am chord notes: 87.31Hz, 130.81Hz, 174.61Hz, 261.63Hz)
      const freqs = [87.31, 130.81, 174.61, 261.63, 392.0];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Add subtle vibrato / slow detune shimmer
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

      oscillatorsRef.current = oscs;
      setIsPlaying(true);
    } catch (err) {
      console.warn('Web Audio Ambient error:', err);
    }
  };

  const stopSoundscape = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      setTimeout(() => {
        oscillatorsRef.current.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // Ignore if already stopped
          }
        });
        oscillatorsRef.current = [];
        if (ctx.state !== 'closed') {
          ctx.close();
        }
        audioCtxRef.current = null;
        setIsPlaying(false);
      }, 1200);
    } else {
      setIsPlaying(false);
    }
  };

  const toggleSoundscape = () => {
    if (isPlaying) {
      stopSoundscape();
    } else {
      startSoundscape();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSoundscape();
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={toggleSoundscape}
        title={isPlaying ? 'Mute ambient universe audio' : 'Play ambient universe audio'}
        aria-label={isPlaying ? 'Mute ambient universe audio' : 'Play ambient universe audio'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background: isPlaying
            ? 'rgba(167, 139, 250, 0.22)'
            : 'rgba(255, 255, 255, 0.05)',
          border: isPlaying
            ? '1px solid rgba(167, 139, 250, 0.45)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          color: isPlaying ? 'var(--color-ivory)' : 'var(--color-muted)',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-sans)',
          transition: 'all 0.3s ease',
          boxShadow: isPlaying ? '0 0 16px rgba(167, 139, 250, 0.25)' : 'none',
        }}
      >
        {isPlaying ? (
          <>
            <Volume2 size={13} color="#A78BFA" />
            <span>Soundscape On</span>
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
            <span>Ambient Audio</span>
          </>
        )}
      </button>
    </div>
  );
};
