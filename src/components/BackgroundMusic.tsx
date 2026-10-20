import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VolumeX, Music } from 'lucide-react';

interface BackgroundMusicProps {
  src?: string;
  targetVolume?: number; // default 0.05 (5%)
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src = '/sounds/zaalima.mp3',
  targetVolume = 0.05,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDucked, setIsDucked] = useState(false);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const activeForegroundCountRef = useRef(0);

  // Smoothly ramp audio volume to target
  const fadeVolumeTo = useCallback(
    (targetVol: number, durationMs = 800, onComplete?: () => void) => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      const audio = audioRef.current;
      if (!audio) return;

      const startVol = audio.volume;
      const startTime = performance.now();

      fadeIntervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / durationMs);

        // Smooth cubic ease-in-out curve
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentVol = startVol + (targetVol - startVol) * ease;
        audio.volume = Math.max(0, Math.min(1, currentVol));

        if (progress >= 1) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          audio.volume = targetVol;
          if (onComplete) onComplete();
        }
      }, 30);
    },
    []
  );

  // Start background playback with smooth fade-in
  const startBGM = useCallback(() => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    if (isMuted) return;

    audio.volume = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasStartedOnce(true);
          // Fade in to target volume (5%) over 1400ms
          fadeVolumeTo(targetVolume, 1400);
        })
        .catch(() => {
          // Browser autoplay policy might require explicit user gesture
          setIsPlaying(false);
        });
    }
  }, [src, targetVolume, isMuted, fadeVolumeTo]);

  // Pause BGM with smooth fade-out
  const stopBGM = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    fadeVolumeTo(0, 600, () => {
      audio.pause();
      setIsPlaying(false);
    });
  }, [fadeVolumeTo]);

  // Duck audio when another sound begins
  const handleForegroundStart = useCallback(() => {
    activeForegroundCountRef.current += 1;
    setIsDucked(true);

    const audio = audioRef.current;
    if (!audio || audio.paused || isMuted) return;

    // Smoothly fade out to 0 over 700ms and pause
    fadeVolumeTo(0, 700, () => {
      if (activeForegroundCountRef.current > 0) {
        audio.pause();
      }
    });
  }, [isMuted, fadeVolumeTo]);

  // Unduck audio when other sound finishes
  const handleForegroundStop = useCallback(() => {
    activeForegroundCountRef.current = Math.max(0, activeForegroundCountRef.current - 1);

    if (activeForegroundCountRef.current === 0) {
      setIsDucked(false);
      const audio = audioRef.current;
      if (!audio || isMuted || !hasStartedOnce) return;

      // Resume playing and fade in to 5% over 1200ms
      audio.volume = 0;
      audio.play().then(() => {
        setIsPlaying(true);
        fadeVolumeTo(targetVolume, 1200);
      }).catch(() => {});
    }
  }, [isMuted, hasStartedOnce, targetVolume, fadeVolumeTo]);

  // Initialize and attach global interaction listener for autoplay
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audioRef.current = audio;

    // 1. Attempt immediate autoplay on mount
    startBGM();

    // 2. Listen for earliest user interaction to guarantee playback if initial autoplay was blocked
    const handleFirstInteraction = () => {
      startBGM();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('pointerup', handleFirstInteraction);
      window.removeEventListener('pointermove', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('touchend', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('wheel', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('pointerup', handleFirstInteraction, { passive: true });
    window.addEventListener('pointermove', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('touchend', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('scroll', handleFirstInteraction, { passive: true });
    window.addEventListener('wheel', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    // Custom events from foreground components (Voice note, Radio, Music box)
    window.addEventListener('celestial-foreground-audio-start', handleForegroundStart);
    window.addEventListener('celestial-foreground-audio-stop', handleForegroundStop);
    window.addEventListener('start-bgm', startBGM);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('pointerup', handleFirstInteraction);
      window.removeEventListener('pointermove', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('touchend', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('wheel', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('celestial-foreground-audio-start', handleForegroundStart);
      window.removeEventListener('celestial-foreground-audio-stop', handleForegroundStop);
      window.removeEventListener('start-bgm', startBGM);

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, startBGM, handleForegroundStart, handleForegroundStop]);

  // Toggle user mute
  const toggleMute = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch {}
    }

    if (isMuted) {
      setIsMuted(false);
      const audio = audioRef.current;
      if (audio) {
        audio.volume = 0;
        audio.play().then(() => {
          setIsPlaying(true);
          setHasStartedOnce(true);
          fadeVolumeTo(targetVolume, 1000);
        }).catch(() => {});
      }
    } else {
      setIsMuted(true);
      stopBGM();
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={toggleMute}
        title={isMuted ? 'Unmute Zaalima BGM' : 'Mute Zaalima BGM (5% volume)'}
        aria-label="Toggle background music"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.38rem',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          background: isMuted
            ? 'rgba(255, 255, 255, 0.06)'
            : isDucked
            ? 'rgba(253, 230, 138, 0.08)'
            : 'rgba(253, 230, 138, 0.16)',
          border: isMuted
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : isDucked
            ? '1px solid rgba(253, 230, 138, 0.25)'
            : '1px solid rgba(253, 230, 138, 0.5)',
          color: isMuted
            ? 'rgba(255, 255, 255, 0.6)'
            : isDucked
            ? '#FDE68A'
            : '#FFFDF2',
          fontSize: '0.74rem',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          touchAction: 'manipulation',
          transition: 'all 0.25s ease',
          boxShadow: isPlaying && !isDucked ? '0 0 14px rgba(253, 230, 138, 0.25)' : 'none',
        }}
      >
        {isMuted ? (
          <>
            <VolumeX size={13} color="rgba(255,255,255,0.6)" />
            <span>BGM Off</span>
          </>
        ) : (
          <>
            <Music size={12} color="#FDE68A" />
            <span>{isDucked ? 'Zaalima •' : 'Zaalima 5%'}</span>

            {/* Micro Equalizer Bar Animation when playing */}
            {isPlaying && !isDucked && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'flex-end',
                  gap: '1.5px',
                  height: '10px',
                  marginLeft: '1px',
                }}
              >
                <span
                  style={{
                    width: '2px',
                    height: '6px',
                    background: '#FDE68A',
                    borderRadius: '1px',
                    animation: 'pulse 0.9s infinite ease-in-out',
                  }}
                />
                <span
                  style={{
                    width: '2px',
                    height: '10px',
                    background: '#FDE68A',
                    borderRadius: '1px',
                    animation: 'pulse 0.7s infinite ease-in-out 0.2s',
                  }}
                />
                <span
                  style={{
                    width: '2px',
                    height: '4px',
                    background: '#FDE68A',
                    borderRadius: '1px',
                    animation: 'pulse 1.1s infinite ease-in-out 0.4s',
                  }}
                />
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};
