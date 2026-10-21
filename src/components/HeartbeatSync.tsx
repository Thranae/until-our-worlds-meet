import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, Radio, Sparkles } from 'lucide-react';
import { siteContent } from '../data/siteContent';

export const HeartbeatSync: React.FC = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0); // 0 to 100%
  const [isFullySynced, setIsFullySynced] = useState(false);
  const [bpm, setBpm] = useState(72);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const ecgOffsetRef = useRef(0);

  // Synthesize realistic acoustic heartbeat thumps (lub-dub)
  const playHeartbeatSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. First chamber thump (Lub - softer, slightly lower frequency)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(30, now + 0.12);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // 2. Second chamber thump (Dub - sharper, slightly higher pressure ~130ms later)
      const dubTime = now + 0.13;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(80, dubTime);
      osc2.frequency.exponentialRampToValueAtTime(32, dubTime + 0.16);

      gain2.gain.setValueAtTime(0.001, dubTime);
      gain2.gain.linearRampToValueAtTime(0.42, dubTime + 0.018);
      gain2.gain.exponentialRampToValueAtTime(0.0001, dubTime + 0.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(dubTime);
      osc2.stop(dubTime + 0.22);

      // Mobile haptic double-beat
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 80, 55]);
        } catch {}
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Play alignment chime when sync reaches 100%
  const playSyncCompleteChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.001, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 1.5);
      });
    } catch {}
  }, []);

  // Handle Touch / Pointer Down on Sensor Pad
  const handlePointerDown = () => {
    setIsHolding(true);
    playHeartbeatSound();

    // Loop heartbeat rhythm every 820ms (~73 BPM)
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = window.setInterval(() => {
      playHeartbeatSound();
      setBpm(Math.floor(70 + Math.random() * 5));
    }, 820);

    // Increment progress while holding
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = window.setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          if (!isFullySynced) {
            setIsFullySynced(true);
            playSyncCompleteChime();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
            }
          }
          return 100;
        }
        return prev + 4;
      });
    }, 100);
  };

  const handlePointerUp = () => {
    setIsHolding(false);
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // Canvas ECG Oscilloscope Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const getEcgSample = (t: number) => {
      // Normalized ECG wave formula: cycle every 1.0 unit
      const phase = (t % 1.0 + 1.0) % 1.0;
      if (phase < 0.15) {
        // Flat baseline
        return 0;
      } else if (phase < 0.25) {
        // P-wave (atrial depolarization)
        const p = (phase - 0.15) / 0.1;
        return Math.sin(p * Math.PI) * 0.15;
      } else if (phase < 0.35) {
        // PR segment
        return 0;
      } else if (phase < 0.38) {
        // Q dip
        return -0.15;
      } else if (phase < 0.44) {
        // R-peak (sharp ventricles contraction spike)
        const r = (phase - 0.38) / 0.06;
        return Math.sin(r * Math.PI) * 1.0;
      } else if (phase < 0.48) {
        // S dip
        return -0.28;
      } else if (phase < 0.58) {
        // ST segment
        return 0;
      } else if (phase < 0.72) {
        // T-wave (ventricular repolarization)
        const tw = (phase - 0.58) / 0.14;
        return Math.sin(tw * Math.PI) * 0.32;
      } else {
        // Baseline return
        return 0;
      }
    };

    const render = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Oscilloscope Grid Lines (Soft Cyan)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;

      const gridSize = 24;
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center baseline
      const centerY = h * 0.52;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();

      // 2. Draw Active ECG Waveform
      const speed = isHolding ? 0.014 : 0.007;
      ecgOffsetRef.current += speed;

      ctx.beginPath();
      const points = 160;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * w;
        const timeVal = ecgOffsetRef.current + (i / points) * 2.2;
        const sample = getEcgSample(timeVal);

        // Amplitude scales with holding/synced state
        const amp = (isHolding || isFullySynced ? 44 : 26);
        const y = centerY - sample * amp;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Glow Stroke
      ctx.strokeStyle = isFullySynced ? '#FDE68A' : isHolding ? '#34D399' : 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = isHolding ? 2.5 : 1.8;
      ctx.shadowColor = isFullySynced ? '#F59E0B' : '#10B981';
      ctx.shadowBlur = isHolding ? 10 : 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isHolding, isFullySynced]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Oscilloscope Monitor Screen */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          borderRadius: '20px',
          padding: '1.25rem 1rem',
          background: 'linear-gradient(180deg, rgba(8, 15, 30, 0.85) 0%, rgba(4, 9, 20, 0.95) 100%)',
          border: isFullySynced
            ? '1.5px solid rgba(251, 191, 36, 0.65)'
            : isHolding
            ? '1.5px solid rgba(52, 211, 153, 0.65)'
            : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: isFullySynced
            ? '0 12px 35px rgba(245, 158, 11, 0.25), inset 0 0 20px rgba(245, 158, 11, 0.1)'
            : '0 12px 35px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Monitor Header Readout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0 0.4rem',
            fontSize: '0.74rem',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={14} color={isHolding ? '#34D399' : 'rgba(52, 211, 153, 0.6)'} />
            <span style={{ color: '#E2E8F0' }}>FREQ: {bpm} BPM</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Radio size={14} color={isFullySynced ? '#FDE68A' : '#38BDF8'} />
            <span style={{ color: isFullySynced ? '#FEF08A' : '#94A3B8' }}>
              {isFullySynced ? 'SYNC 100% • LOCKED' : `SYNC: ${syncProgress}%`}
            </span>
          </div>
        </div>

        {/* ECG Waveform Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '140px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(2, 6, 23, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.18)',
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

          {/* City Connection Badges */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '12px',
              fontSize: '0.62rem',
              fontFamily: 'monospace',
              color: 'rgba(255, 255, 255, 0.55)',
              display: 'flex',
              gap: '0.4rem',
            }}
          >
            <span>MY CITY [ORIGIN]</span>
            <span>⇄</span>
            <span>BOT'S SKY [1,740 KM]</span>
          </div>
        </div>

        {/* Sync Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: isFullySynced
                ? 'linear-gradient(90deg, #F59E0B 0%, #FDE68A 100%)'
                : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
              width: `${syncProgress}%`,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* Biometric Touch Sensor Pad */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <motion.button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchEnd={handlePointerUp}
          whileTap={{ scale: 0.94 }}
          style={{
            position: 'relative',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: isHolding
              ? 'radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, rgba(16, 185, 129, 0.15) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 70%, transparent 100%)',
            border: isHolding ? '2px solid #34D399' : '1.5px solid rgba(255, 255, 255, 0.25)',
            boxShadow: isHolding
              ? '0 0 30px rgba(52, 211, 153, 0.6), inset 0 0 15px rgba(52, 211, 153, 0.4)'
              : '0 4px 15px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          aria-label="Hold thumb here to feel my heartbeat"
        >
          {/* Animated concentric pulse ripple rings when holding */}
          {isHolding && (
            <>
              <motion.span
                animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '50%',
                  border: '1.5px solid #34D399',
                  pointerEvents: 'none',
                }}
              />
              <motion.span
                animate={{ scale: [1, 2.3], opacity: [0.5, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: 0.25, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: -10,
                  borderRadius: '50%',
                  border: '1px solid #10B981',
                  pointerEvents: 'none',
                }}
              />
            </>
          )}

          <Heart
            size={32}
            color={isFullySynced ? '#FDE68A' : isHolding ? '#34D399' : '#CBD5E1'}
            fill={isHolding || isFullySynced ? (isFullySynced ? '#FDE68A' : '#34D399') : 'none'}
            style={{
              transition: 'all 0.2s ease',
              filter: isHolding ? 'drop-shadow(0 0 8px #34D399)' : 'none',
            }}
          />
        </motion.button>

        <span
          style={{
            fontSize: '0.78rem',
            color: isHolding ? '#34D399' : 'var(--color-muted)',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          {isHolding
            ? 'HOLDING... TRANSMITTING PULSE ACROSS MILES'
            : isFullySynced
            ? '✦ HEARTS SYNCHRONIZED • TAP AGAIN TO FEEL'
            : 'HOLD THUMB HERE TO SYNCHRONIZE ✦'}
        </span>
      </div>

      {/* Unlocked Intimate Message Card */}
      <AnimatePresence>
        {isFullySynced && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="glass-panel"
            style={{
              width: '100%',
              padding: '1.4rem',
              borderRadius: '16px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(52, 211, 153, 0.12) 100%)',
              border: '1px solid rgba(253, 230, 138, 0.45)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#FEF08A',
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                letterSpacing: '0.12em',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={13} color="#F59E0B" />
              <span>FREQUENCY LOCKED • TO {siteContent.recipient.nickname.toUpperCase()}</span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.02rem',
                lineHeight: 1.65,
                color: 'var(--color-ivory)',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              "Across every single kilometer and every quiet hour of the night, this rhythm beats for you. Whenever life gets loud or the distance feels heavy, just remember: you are always connected to someone who is endlessly proud of you."
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeartbeatSync;
