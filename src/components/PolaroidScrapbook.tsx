import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, RotateCw } from 'lucide-react';
import { siteContent } from '../data/siteContent';

interface Sticker {
  id: number;
  icon: string;
  x: number; // percentage
  y: number; // percentage
}

const STICKER_PALETTE = ['🍗', '⚡', '🎯', '💛', '✦', '🎈', '✨'];

export const PolaroidScrapbook: React.FC = () => {
  const [isEjected, setIsEjected] = useState(false);
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [developPercent, setDevelopPercent] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeSticker, setActiveSticker] = useState<string>('✦');
  const [placedStickers, setPlacedStickers] = useState<Sticker[]>([
    { id: 1, icon: '🎯', x: 82, y: 15 },
    { id: 2, icon: '⚡', x: 18, y: 78 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isSwipingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Mechanical Camera Shutter & Film Ejection Audio
  const playCameraShutterSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. Shutter click (mechanical snap)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);

      // 2. Motor gear whirr / ejection slide (0.08s to 0.45s)
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now + 0.08);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.001, now + 0.08);
      nGain.gain.linearRampToValueAtTime(0.18, now + 0.12);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now + 0.08);
      noise.stop(now + 0.45);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([30, 50, 40]); } catch {}
      }
    } catch {}
  }, []);

  // Soft sparkle wipe sound
  const playWipeSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 + Math.random() * 600, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }, []);

  // Card Flip Swish sound
  const playFlipSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }, []);

  // Sticker stamp pop sound
  const playStampPopSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(15); } catch {}
      }
    } catch {}
  }, []);

  const handleEjectPhoto = () => {
    setIsEjected(true);
    playCameraShutterSound();
  };

  // Developing Canvas Fog Initialization
  useEffect(() => {
    if (!isEjected || isDeveloped) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill canvas with dark milky undeveloped chemical fog
    ctx.fillStyle = '#1A1829';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(216, 204, 255, 0.4)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦ WIPE WITH FINGER TO DEVELOP ✦', canvas.width / 2, canvas.height / 2);
  }, [isEjected, isDeveloped]);

  // Touch Swipe to Erase Fog
  const eraseFogAt = (x: number, y: number) => {
    if (isDeveloped || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();

    playWipeSound();

    setDevelopPercent((prev) => {
      const next = Math.min(100, prev + 3.5);
      if (next >= 98 && !isDeveloped) {
        setIsDeveloped(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('trigger-celestial-wish'));
        }
      }
      return next;
    });
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    eraseFogAt(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSwipingRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    eraseFogAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  // Stamp sticker onto photo
  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDeveloped || isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newSticker: Sticker = {
      id: Date.now(),
      icon: activeSticker,
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    };

    setPlacedStickers((prev) => [...prev.slice(-8), newSticker]);
    playStampPopSound();
  };

  const handleToggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
    playFlipSound();
  };

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
      {/* Vintage Instant Camera (Before Ejection) */}
      {!isEjected ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '260px',
            padding: '1.75rem 1.5rem',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%)',
            border: '1.5px solid rgba(251, 191, 36, 0.4)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
          }}
        >
          {/* Camera Lens */}
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #0F172A 0%, #020617 75%, #334155 100%)',
              border: '6px solid #475569',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #38BDF8 0%, #1E3A8A 80%)',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)',
              }}
            />
          </div>

          <span
            style={{
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              color: '#FDE68A',
            }}
          >
            CELESTIAL INSTANT CAM • BOT #1108
          </span>

          <button
            type="button"
            onClick={handleEjectPhoto}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.4rem',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              border: '1px solid #FCA5A5',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.45)',
              touchAction: 'manipulation',
            }}
          >
            <Camera size={15} />
            <span>Snap & Eject Photo 📸</span>
          </button>
        </motion.div>
      ) : (
        /* The Ejected Instant Polaroid Film Card */
        <motion.div
          initial={{ y: -40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            width: '270px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            perspective: '1000px',
          }}
        >
          {/* Flip Container */}
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            onClick={handlePhotoClick}
            style={{
              width: '100%',
              borderRadius: '16px',
              background: '#F8FAFC',
              padding: '14px 14px 22px 14px',
              boxShadow: '0 18px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(253, 230, 138, 0.2)',
              border: '1px solid #E2E8F0',
              transformStyle: 'preserve-3d',
              position: 'relative',
              cursor: isDeveloped ? 'pointer' : 'default',
            }}
          >
            {/* FRONT FACE: Photo Image */}
            <div style={{ backfaceVisibility: 'hidden', width: '100%' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: 'linear-gradient(160deg, #0B0E1E 0%, #1E1B4B 60%, #311042 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Illustrated Scene Under Stars */}
                <svg
                  viewBox="0 0 240 240"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <defs>
                    <radialGradient id="skyGlow" cx="50%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0B0E1E" stopOpacity="1" />
                    </radialGradient>
                  </defs>

                  <rect width="240" height="240" fill="url(#skyGlow)" />

                  {/* Distant Erangel Mountains & Horizon */}
                  <polygon points="0,200 45,155 90,185 155,140 210,185 240,165 240,240 0,240" fill="#090D1A" />

                  {/* Stars in sky */}
                  <circle cx="35" cy="45" r="1.5" fill="#FFFFFF" />
                  <circle cx="75" cy="30" r="1.2" fill="#FDE68A" />
                  <circle cx="120" cy="55" r="2" fill="#FFFFFF" />
                  <circle cx="185" cy="35" r="1.5" fill="#A78BFA" />
                  <circle cx="215" cy="65" r="1.2" fill="#FFFFFF" />

                  {/* Shooting Star */}
                  <line x1="160" y1="20" x2="210" y2="45" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Two Figures Sitting on Cliff edge under crescent moon */}
                  <path d="M190,85 A16,16 0 1 0 174,101 A13,13 0 1 1 190,85 Z" fill="#FEF08A" />

                  {/* Figure 1 (Bot) with Red Bull Can */}
                  <circle cx="105" cy="182" r="7" fill="#F87171" />
                  <rect x="98" y="189" width="14" height="22" rx="4" fill="#1E293B" />
                  {/* Tiny Red Bull Can */}
                  <rect x="114" y="196" width="4" height="9" rx="1" fill="#3B82F6" stroke="#EF4444" strokeWidth="0.5" />

                  {/* Figure 2 (User) propped next to AMR Sniper */}
                  <circle cx="128" cy="182" r="7.5" fill="#60A5FA" />
                  <rect x="121" y="189" width="15" height="22" rx="4" fill="#0F172A" />

                  {/* AMR Sniper Vector propped on ground */}
                  <line x1="140" y1="180" x2="158" y2="210" stroke="#F59E0B" strokeWidth="2.5" />
                  <circle cx="140" cy="180" r="2" fill="#EF4444" />
                </svg>

                {/* Placed Interactive Stickers */}
                {placedStickers.map((stk) => (
                  <motion.div
                    key={stk.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      left: `${stk.x}%`,
                      top: `${stk.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: '1.4rem',
                      pointerEvents: 'none',
                      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
                    }}
                  >
                    {stk.icon}
                  </motion.div>
                ))}

                {/* Scratchable Developing Chemical Fog Canvas */}
                {!isDeveloped && (
                  <canvas
                    ref={canvasRef}
                    onTouchMove={handleCanvasTouchMove}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseDown={() => { isSwipingRef.current = true; }}
                    onMouseUp={() => { isSwipingRef.current = false; }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      touchAction: 'none',
                      cursor: 'grab',
                    }}
                  />
                )}
              </div>

              {/* White Polaroid Bottom Border Caption */}
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 4px',
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      fontStyle: 'italic',
                      fontWeight: 600,
                    }}
                  >
                    "Our First Victory • Under One Sky"
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.62rem',
                      fontFamily: 'monospace',
                      color: '#64748B',
                      letterSpacing: '0.06em',
                    }}
                  >
                    NOV 8 • {siteContent.recipient.nickname.toUpperCase()} EDITION ✦
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleFlip}
                  title="Flip photo to read backside note"
                  style={{
                    padding: '0.3rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15, 23, 42, 0.08)',
                    border: '1px solid rgba(15, 23, 42, 0.15)',
                    color: '#334155',
                    fontSize: '0.66rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCw size={11} />
                  <span>Flip</span>
                </button>
              </div>
            </div>

            {/* BACK FACE: Handwritten Silver Note */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                position: 'absolute',
                inset: 0,
                borderRadius: '16px',
                background: '#0F172A',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                padding: '1.5rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: '#FEF3C7',
                textAlign: 'left',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'monospace',
                    fontSize: '0.68rem',
                    color: '#F59E0B',
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem',
                  }}
                >
                  FIELD MEMORY // 02:45 AM
                </span>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.94rem',
                    lineHeight: 1.6,
                    color: '#FFFFFF',
                    fontStyle: 'italic',
                    margin: 0,
                  }}
                >
                  "Dear {siteContent.recipient.nickname},
                  <br /><br />
                  Some teammates play for points. But the best moments were always just talking with you, celebrating small wins, and realizing how bright you make every single day.
                  <br /><br />
                  Happy Birthday, my favorite person."
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#94A3B8' }}>
                  ALWAYS YOUR SQUADMATE
                </span>
                <button
                  type="button"
                  onClick={handleToggleFlip}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.64rem',
                    cursor: 'pointer',
                  }}
                >
                  Flip Back
                </button>
              </div>
            </div>
          </motion.div>

          {/* Developing Status Bar & Sticker Palette */}
          {!isDeveloped ? (
            <div
              style={{
                marginTop: '1rem',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  color: '#FEF08A',
                  marginBottom: '0.35rem',
                }}
              >
                DEVELOPING EMULSION: {Math.round(developPercent)}%
              </span>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${developPercent}%`,
                    background: 'linear-gradient(90deg, #F59E0B 0%, #FEF08A 100%)',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            </div>
          ) : (
            /* Sticker Palette to Stamp onto Photo */
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                TAP STICKER, THEN TAP PHOTO TO STAMP:
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {STICKER_PALETTE.map((stk) => (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => setActiveSticker(stk)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: activeSticker === stk ? 'rgba(253, 230, 138, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                      border: activeSticker === stk ? '1.5px solid #FDE68A' : '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PolaroidScrapbook;
