import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
import { siteContent } from '../data/siteContent';

export const MidnightCall: React.FC = () => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callSeconds, setCallSeconds] = useState(13632); // 03:47:12
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  // Audio synthesis: Phone ring chime or soft call connect beep
  const playRingTone = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Soft marimba ring tone (E5 - G#5)
      const freqs = [659.25, 830.61];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.001, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.15 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.65);
      });
    } catch {
      // Safe fallback
    }
  };

  const playConnectBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Safe fallback
    }
  };

  const handleAnswer = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 50, 25]);
      } catch {
        // Safe fallback
      }
    }
    playConnectBeep();
    setCallState('connected');
  };

  const handleEndCall = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch {
        // Safe fallback
      }
    }
    setCallState('ended');
  };

  // Timer increment while connected
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

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
      {/* Smartphone Call Screen Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          height: '420px',
          borderRadius: '32px',
          background: 'linear-gradient(180deg, #111427 0%, #080B18 100%)',
          border: '2px solid rgba(216, 204, 255, 0.22)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.7), inset 0 0 25px rgba(167, 139, 250, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem 1.5rem',
          overflow: 'hidden',
        }}
      >
        {/* Top Speaker Slot */}
        <div
          style={{
            width: '45px',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.15)',
          }}
        />

        {/* Profile Avatar / Caller Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.65rem',
            marginTop: '1rem',
          }}
        >
          {/* Avatar Orb with Breathing Ripple */}
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={{
                scale: callState === 'connected' ? [1, 1.08, 1] : [1, 1.15, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F59E0B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.45)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-serif)',
                fontSize: '1.8rem',
                fontWeight: 600,
              }}
            >
              {siteContent.recipient.nickname.charAt(0)}
            </motion.div>

            {/* Ripple when incoming */}
            {callState === 'incoming' && (
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid rgba(168, 85, 247, 0.6)',
                }}
              />
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                color: 'var(--color-ivory)',
                letterSpacing: '0.02em',
                marginBottom: '0.2rem',
              }}
            >
              {siteContent.recipient.nickname} ✦
            </h3>
            <div
              style={{
                fontSize: '0.74rem',
                color: callState === 'connected' ? '#34D399' : 'var(--color-lavender)',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}
            >
              {callState === 'incoming'
                ? 'INCOMING CALL • 03:47 AM'
                : callState === 'connected'
                ? formatTimer(callSeconds)
                : 'CALL COMPLETED'}
            </div>
          </div>
        </div>

        {/* Live Audio Spectrogram (while Connected) */}
        {callState === 'connected' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '36px',
            }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [8, Math.random() * 26 + 10, 8],
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '3.5px',
                  borderRadius: '2px',
                  background: 'linear-gradient(180deg, #A78BFA 0%, #FDE68A 100%)',
                }}
              />
            ))}
          </div>
        )}

        {/* Call Controls Bar */}
        <div style={{ width: '100%', marginBottom: '0.5rem' }}>
          {callState === 'incoming' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
              }}
            >
              <button
                type="button"
                onClick={handleEndCall}
                title="Decline"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                }}
              >
                <PhoneOff size={22} />
              </button>

              <button
                type="button"
                onClick={handleAnswer}
                title="Answer Call"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.6)',
                }}
              >
                <Phone size={22} />
              </button>
            </div>
          ) : callState === 'connected' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                width: '100%',
              }}
            >
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                }}
              >
                <PhoneOff size={22} />
              </button>

              <button
                type="button"
                onClick={() => setSpeakerOn(!speakerOn)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: speakerOn ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Volume2 size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCallState('incoming');
                playRingTone();
              }}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(216, 204, 255, 0.2)',
                color: 'var(--color-ivory)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Call Again ✦
            </button>
          )}
        </div>
      </div>

      {/* Atmospheric Narrative Card */}
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
            color: 'var(--color-lavender)',
            fontSize: '0.82rem',
            fontWeight: 500,
            marginBottom: '0.4rem',
          }}
        >
          <MessageCircle size={14} />
          <span>The Whispers at 03:00 AM</span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}
        >
          Those hours when neither of us wanted to hang up. Falling asleep with the phone right next to our pillows, listening to each other breathe through the static. No distance in the world could ever make that feeling less real.
        </p>
      </div>
    </div>
  );
};
