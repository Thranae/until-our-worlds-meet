import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Mic, AlertCircle, Sparkles } from 'lucide-react';
import { siteContent } from '../data/siteContent';
import { audioBus } from '../utils/audioBus';

export const VoicePlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(24);
  const [hasEnded, setHasEnded] = useState(false);
  const [audioExists, setAudioExists] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioSrc = siteContent.audio.src;

  const synthTimerRef = useRef<number | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Test if audio file exists on mount
  useEffect(() => {
    const audio = new Audio();
    audio.src = audioSrc;

    const handleCanPlay = () => {
      setAudioExists(true);
      setDuration(audio.duration || siteContent.audio.durationEstimateSec || 72);
    };

    const handleError = () => {
      setAudioExists(false);
      setDuration(24);
    };

    audio.addEventListener('loadedmetadata', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [audioSrc]);

  // Clean up synthetic audio on unmount & notify BGM
  useEffect(() => {
    if (isPlaying) {
      audioBus.reportAudioStart('voice-player');
    } else {
      audioBus.reportAudioStop('voice-player');
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      stopSyntheticMelody();
      audioBus.reportAudioStop('voice-player');
    };
  }, []);

  const stopSyntheticMelody = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (synthCtxRef.current) {
      try {
        synthCtxRef.current.close();
      } catch {
        // ignore
      }
      synthCtxRef.current = null;
    }
  };

  // Synthesize acoustic harp/guitar melody when audio file is not yet dropped
  const startSyntheticMelody = () => {
    stopSyntheticMelody();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      synthCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Romantic starry pentatonic notes (F - A - C - E - D - C - A - G)
      const melody = [
        349.23, 440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 392.0,
        440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0, 349.23,
      ];

      let noteIdx = 0;
      const playNote = (freq: number) => {
        if (!ctx || ctx.state === 'closed') return;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const overtone = ctx.createOscillator();
        const overtoneGain = ctx.createGain();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.3, now + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        overtoneGain.gain.setValueAtTime(0.001, now);
        overtoneGain.gain.linearRampToValueAtTime(0.08, now + 0.01);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(masterGain);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + 1.9);
        overtone.stop(now + 1.0);
      };

      playNote(melody[0]);
      noteIdx = 1;

      synthTimerRef.current = window.setInterval(() => {
        playNote(melody[noteIdx]);
        noteIdx = (noteIdx + 1) % melody.length;
        setCurrentTime((prev) => {
          if (prev >= 24) {
            stopSyntheticMelody();
            setIsPlaying(false);
            setHasEnded(true);
            return 24;
          }
          return prev + 0.7;
        });
      }, 700);

      setIsPlaying(true);
      setDuration(24);
      setErrorMessage(null);
    } catch {
      // fallback
    }
  };

  const togglePlay = () => {
    // If real audio file is missing, play synthetic starlight resonance melody
    if (audioExists === false) {
      if (isPlaying) {
        stopSyntheticMelody();
        setIsPlaying(false);
      } else {
        startSyntheticMelody();
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setErrorMessage(null);
        })
        .catch((err) => {
          console.warn('Audio playback error:', err);
          // Fallback to synthetic melody if playback blocked
          startSyntheticMelody();
        });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || audioExists === false) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasEnded(true);
    setCurrentTime(duration);
  };

  const handleReplay = () => {
    if (audioExists === false) {
      stopSyntheticMelody();
      setCurrentTime(0);
      setHasEnded(false);
      startSyntheticMelody();
      return;
    }

    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
    setHasEnded(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current && audioExists !== false) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // 24 waveform bars for visualization
  const waveHeights = [
    22, 45, 68, 35, 78, 92, 54, 70, 85, 40, 65, 88, 95, 76, 52, 84, 60, 48, 72, 58, 38, 50, 30, 20
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
      }}
    >
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setAudioExists(false)}
      />

      {/* Main Glass Player Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2.2rem 1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Pulse Background when playing */}
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
            opacity: isPlaying ? 1 : 0.25,
            transition: 'opacity 0.6s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(167, 139, 250, 0.18)',
                border: '1px solid rgba(167, 139, 250, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mic size={18} color="#C084FC" />
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  color: 'var(--color-ivory)',
                }}
              >
                {siteContent.audio.title}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>
                {siteContent.audio.subtitle}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.7rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.72rem',
              color: 'var(--color-lilac)',
            }}
          >
            {isPlaying ? <Sparkles size={12} color="#FDE68A" /> : <Volume2 size={13} />}
            <span>{isPlaying ? 'Resonating' : 'Voice Note'}</span>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px',
            gap: '3px',
            margin: '1.4rem 0',
            padding: '0 0.5rem',
          }}
        >
          {waveHeights.map((h, i) => {
            const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
            const barPct = (i / waveHeights.length) * 100;
            const isPassed = barPct <= progressPct;

            return (
              <motion.div
                key={i}
                animate={{
                  height: isPlaying
                    ? `${Math.max(14, Math.min(68, h * (0.6 + Math.random() * 0.7)))}px`
                    : `${Math.max(14, h * 0.65)}px`,
                  opacity: isPassed ? 1 : 0.35,
                }}
                transition={{
                  duration: isPlaying ? 0.18 : 0.4,
                  ease: 'easeInOut',
                }}
                style={{
                  flex: 1,
                  borderRadius: '3px',
                  backgroundColor: isPassed ? '#A78BFA' : '#64748B',
                  boxShadow: isPassed && isPlaying ? '0 0 8px rgba(167, 139, 250, 0.6)' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Scrubber Progress Bar */}
        <div style={{ marginBottom: '1.2rem' }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Audio scrubber"
            style={{
              width: '100%',
              accentColor: 'var(--color-lavender)',
              cursor: 'pointer',
              height: '4px',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-muted)',
              marginTop: '0.45rem',
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            marginTop: '0.5rem',
          }}
        >
          {/* Replay Button */}
          <button
            type="button"
            onClick={handleReplay}
            title="Replay from start"
            aria-label="Replay audio from beginning"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-ivory-dim)',
              transition: 'all 0.2s ease',
            }}
          >
            <RotateCcw size={16} />
          </button>

          {/* Main Play/Pause Button */}
          <motion.button
            type="button"
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
              boxShadow: '0 6px 24px rgba(167, 139, 250, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: '3px' }} />}
          </motion.button>

          <div style={{ width: '42px' }} />
        </div>

        {/* Discreet Custom File Hint */}
        {audioExists === false && (
          <p
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-muted)',
              textAlign: 'center',
              marginTop: '1.25rem',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            ✦ Playing Starlight Voice Melody • Place your voice note at{' '}
            <code style={{ color: 'var(--color-lilac)' }}>public/audio/birthday-voice.mp3</code> to hear your real voice anytime.
          </p>
        )}

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              fontSize: '0.8rem',
              color: '#F87171',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Post-Playback Revealed Sentiment */}
      <AnimatePresence>
        {(hasEnded || isPlaying) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              marginTop: '1.75rem',
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(167, 139, 250, 0.08)',
              border: '1px solid rgba(167, 139, 250, 0.22)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                fontStyle: 'italic',
                lineHeight: 1.5,
                color: 'var(--color-ivory)',
              }}
            >
              “And someday, I hope I get to say so much of this while sitting right beside you.”
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
