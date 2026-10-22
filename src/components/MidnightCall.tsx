import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, MessageCircle, Video, VideoOff, RefreshCw } from 'lucide-react';
import { siteContent } from '../data/siteContent';

export const MidnightCall: React.FC = () => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callSeconds, setCallSeconds] = useState(13632); // 03:47:12
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);

  const videoClips = [
    {
      title: 'Roadtrip Drive',
      path: '/memories/VID_20260901_105722_311.mp4',
      badge: 'AUDIO STREAM ♫',
      hasAudio: true,
    },
    {
      title: '01:34 AM Glow',
      path: '/memories/VID_20260703_013414_130.mp4',
      badge: 'NIGHT FEED',
      hasAudio: false,
    },
    {
      title: 'Evening Candid',
      path: '/memories/VID_20260901_160804_563.mp4',
      badge: 'CANDID MOMENT',
      hasAudio: false,
    },
    {
      title: 'Traditional Red',
      path: '/memories/VID_20260306_103009_216.mp4',
      badge: 'PORTRAIT MOMENT',
      hasAudio: false,
    },
  ];

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
    setIsVideoMode(false);
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
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentVideo = videoClips[videoIndex];

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
          maxWidth: '320px',
          height: '390px',
          borderRadius: '34px',
          background: 'linear-gradient(180deg, #111427 0%, #080B18 100%)',
          border: '2px solid rgba(216, 204, 255, 0.22)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 0 25px rgba(167, 139, 250, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1rem',
          overflow: 'hidden',
        }}
      >
        {/* Top Speaker Slot & Camera */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isVideoMode ? '#34D399' : 'rgba(255, 255, 255, 0.2)',
              boxShadow: isVideoMode ? '0 0 8px #34D399' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          <div
            style={{
              width: '45px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.18)',
            }}
          />
        </div>

        {/* FULLSCREEN FACETIME VIDEO FEED IF VIDEO MODE ACTIVE */}
        {callState === 'connected' && isVideoMode ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: '#04060E',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <video
              key={currentVideo.path}
              src={currentVideo.path}
              autoPlay
              loop
              playsInline
              muted={!currentVideo.hasAudio || isMuted}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Video Overlay Tint & Info */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.75) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Video HUD Header */}
            <div
              style={{
                position: 'absolute',
                top: '2.5rem',
                left: '1.25rem',
                right: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 5,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'monospace',
                    color: '#34D399',
                    background: 'rgba(0, 0, 0, 0.65)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    letterSpacing: '0.08em',
                  }}
                >
                  LIVE • {currentVideo.badge}
                </span>
                <h4
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: '#FFFFFF',
                    fontSize: '1.15rem',
                    margin: '0.25rem 0 0 0',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  }}
                >
                  {siteContent.recipient.nickname} ✦
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setVideoIndex((prev) => (prev + 1) % videoClips.length)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                }}
                title="Switch Camera Feed"
              >
                <RefreshCw size={12} />
                <span>Next Moment</span>
              </button>
            </div>
          </div>
        ) : (
          /* Profile Avatar / Caller Info (Voice Call Screen) */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.75rem',
              zIndex: 3,
            }}
          >
            {/* Avatar Orb with Real Image & Breathing Ripple */}
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{
                  scale: callState === 'connected' ? [1, 1.05, 1] : [1, 1.12, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2.5px solid rgba(168, 85, 247, 0.65)',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.55), inset 0 0 15px rgba(0,0,0,0.5)',
                  background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F59E0B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/memories/1792580021104.jpg"
                  alt={siteContent.recipient.nickname}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    // Fallback to initial monogram
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </motion.div>

              {/* Ripple when incoming */}
              {callState === 'incoming' && (
                <motion.div
                  animate={{ scale: [1, 1.6], opacity: [0.65, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: '2px solid rgba(168, 85, 247, 0.75)',
                  }}
                />
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.45rem',
                  color: 'var(--color-ivory)',
                  letterSpacing: '0.02em',
                  marginBottom: '0.2rem',
                }}
              >
                {siteContent.recipient.nickname} ✦
              </h3>
              <div
                style={{
                  fontSize: '0.76rem',
                  color: callState === 'connected' ? '#34D399' : 'var(--color-lavender)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.06em',
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
        )}

        {/* Live Audio Spectrogram (while Connected & Audio Mode) */}
        {callState === 'connected' && !isVideoMode && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '36px',
              zIndex: 3,
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
        <div style={{ width: '100%', marginBottom: '0.25rem', position: 'relative', zIndex: 10 }}>
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
                background: isVideoMode ? 'rgba(7, 9, 20, 0.75)' : 'transparent',
                backdropFilter: isVideoMode ? 'blur(12px)' : 'none',
                padding: isVideoMode ? '0.65rem 0.5rem' : '0',
                borderRadius: isVideoMode ? '24px' : '0',
                border: isVideoMode ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}
            >
              {/* Mute Mic Button */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isMuted ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.12)',
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

              {/* Video Mode Toggle (FaceTime Live Video) */}
              <button
                type="button"
                onClick={() => {
                  setIsVideoMode(!isVideoMode);
                  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    try {
                      navigator.vibrate(20);
                    } catch {
                      // fallback
                    }
                  }
                }}
                title={isVideoMode ? 'Switch to Voice Call' : 'Switch to FaceTime Video'}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: isVideoMode ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                  border: isVideoMode ? '1.5px solid #34D399' : '1px solid rgba(255, 255, 255, 0.2)',
                  color: isVideoMode ? '#34D399' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isVideoMode ? '0 0 15px rgba(52, 211, 153, 0.4)' : 'none',
                }}
              >
                {isVideoMode ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                title="Hang Up"
                style={{
                  width: '52px',
                  height: '52px',
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

              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={() => setSpeakerOn(!speakerOn)}
                title="Toggle Speaker"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: speakerOn ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.12)',
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
            justifyContent: 'space-between',
            marginBottom: '0.4rem',
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
            }}
          >
            <MessageCircle size={14} />
            <span>The Whispers at 03:00 AM</span>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
            }}
          >
            TAP VIDEO ICON FOR FACETIME ✦
          </span>
        </div>
        <p
          style={{
            color: 'var(--color-ivory-dim)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Those hours when neither of us wanted to hang up. Falling asleep with the phone right next to our pillows, listening to each other breathe through the static. Tap the video camera icon when connected to switch to a live video stream of her.
        </p>
      </div>
    </div>
  );
};
