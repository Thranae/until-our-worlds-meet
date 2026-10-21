import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stamp, ChevronLeft, ChevronRight, Bell, Snowflake } from 'lucide-react';

interface Destination {
  title: string;
  location: string;
  tagline: string;
  desc: string;
  accent: string;
  emoji: string;
  stamped: boolean;
}

interface SnowflakeParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  alpha: number;
}

export const TravelJournal: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const snowCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [destinations, setDestinations] = useState<Destination[]>([
    {
      title: 'Ujjain Shivan Temple • Himalayan Snow Sanctuary',
      location: 'Himalayan Ridge • 4,800m • Pure White Snow',
      tagline: 'High Atop the Snow-Covered Mountains with Mahadeva',
      desc: 'Standing side by side at the summit of the snow-clad Himalayas, wrapped in warm woollen shawls while gentle snowflakes settle on our hair. The ancient stone temple of Lord Shiva stands perched among the clouds, its golden spire shining against the blue glaciers, as holy bells echo across the freezing mountain air.',
      accent: '#93C5FD',
      emoji: '🏔️',
      stamped: true,
    },
    {
      title: 'The Snowfall Mountain Pass at Dawn',
      location: 'Himalayan High Pass • Silent Winter Wonderland',
      tagline: 'Hot Coffee & Fresh Snowflakes',
      desc: 'Winding through towering snow-walled mountain roads together in the early dawn, holding warm cups of coffee while heavy snowflakes drift softly around us. Breath turning into white mist, smiling and watching the morning sun illuminate the snow-covered peaks like liquid gold.',
      accent: '#FDE68A',
      emoji: '❄️',
      stamped: false,
    },
    {
      title: 'The Sanctum Lamp & Sacred Aarti in the Snow',
      location: 'Temple Sanctum • Holy Chants & Warm Camphor',
      tagline: 'Warm Flame Against the Freezing Blizzard',
      desc: 'Stepping into the warmth of the sanctum while blizzards whisper softly outside. Hearing the holy conch shells resonate through the snow-capped valley, feeling the golden warmth of the oil lamps, and bowing our heads together in eternal gratitude and peace.',
      accent: '#F472B6',
      emoji: '🪔',
      stamped: false,
    },
  ]);

  // Rubber stamp thud sound synthesis
  const playStampSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Heavy passport stamp thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  };

  // Temple bell chime sound synthesis
  const playTempleBellSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const freqs = [784.0, 1174.6, 1568.0];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.12 / (i + 1), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + i * 0.3);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.0 + i * 0.3);
      });
    } catch {}
  };

  const handleToggleStamp = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 45]);
      } catch {}
    }
    playStampSound();
    setDestinations((prev) =>
      prev.map((d, i) => (i === currentIndex ? { ...d, stamped: !d.stamped } : d))
    );
  };

  // Falling Snow Simulation on the Photo Stage Canvas
  useEffect(() => {
    const canvas = snowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const flakes: SnowflakeParticle[] = [];
    for (let i = 0; i < 45; i++) {
      flakes.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        radius: Math.random() * 2.2 + 0.8,
        speed: Math.random() * 0.9 + 0.4,
        wind: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, rect.width, rect.height);

      flakes.forEach((f) => {
        f.y += f.speed;
        f.x += Math.sin(time + f.y * 0.02) * 0.5 + f.wind;

        if (f.y > rect.height) {
          f.y = -5;
          f.x = Math.random() * rect.width;
        }
        if (f.x < -10) f.x = rect.width + 10;
        if (f.x > rect.width + 10) f.x = -10;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 250, 252, ${f.alpha})`;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentIndex]);

  const currentDest = destinations[currentIndex];

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
      {/* Travel Scrapbook Polaroid Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(145deg, #181d33 0%, #0e1224 100%)',
          border: '1.5px solid rgba(216, 204, 255, 0.22)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.65)',
          padding: '1.4rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Decorative Washi Tape Strip at Top */}
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            width: '95px',
            height: '22px',
            background: 'rgba(251, 191, 36, 0.45)',
            border: '1px dashed rgba(253, 230, 138, 0.7)',
            borderRadius: '2px',
            transform: 'rotate(-2deg)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 15,
          }}
        />

        {/* High-Mountain Snowy Temple Photo Stage Area */}
        <div
          onClick={() => {
            playTempleBellSound();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate(20);
              } catch {}
            }
          }}
          title="Tap to ring the holy temple bell in the snow"
          style={{
            position: 'relative',
            width: '100%',
            height: '225px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(180deg, #0A1128 0%, #152238 60%, #1E3A5F 100%)',
            border: '1px solid rgba(147, 197, 253, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          {/* Snowy Himalayan Summit & Shivan Temple Illustration */}
          <svg
            viewBox="0 0 380 225"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <defs>
              {/* Distant Mountain Peak Gradient */}
              <linearGradient id="backHimalaya" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              {/* Foreground Snowy Summit Gradient */}
              <linearGradient id="snowPeakGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="35%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>

              {/* Warm Temple Sanctum Light */}
              <radialGradient id="templeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.65" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Distant Majestic Mountain Peaks */}
            <polygon points="40,140 120,65 200,140" fill="url(#backHimalaya)" opacity="0.75" />
            <polygon points="180,140 270,55 350,140" fill="url(#backHimalaya)" opacity="0.75" />

            {/* Snow Caps on Distant Mountains */}
            <polygon points="120,65 105,95 120,90 135,95" fill="#E2E8F0" opacity="0.85" />
            <polygon points="270,55 255,85 270,80 285,85" fill="#E2E8F0" opacity="0.85" />

            {/* Main Foreground Snow-Covered Himalayan Ridge */}
            <path
              d="M0,225 L0,155 Q85,105 190,110 Q295,115 380,165 L380,225 Z"
              fill="url(#snowPeakGrad)"
            />

            {/* Pure White Snow Drifts on Summit Ridge */}
            <path
              d="M0,155 Q85,105 190,110 Q295,115 380,165 L380,185 Q295,135 190,130 Q85,125 0,175 Z"
              fill="#FFFFFF"
              opacity="0.92"
            />

            {/* Shivan Temple Perched High on the Snowy Summit */}
            <g transform="translate(190, 118)">
              {/* Warm Sanctum Light Reflection on Snow */}
              <ellipse cx="0" cy="8" rx="42" ry="16" fill="url(#templeGlow)" />

              {/* Stone Temple Base Structure */}
              <rect x="-26" y="-35" width="52" height="42" rx="2" fill="#334155" stroke="#64748B" strokeWidth="1.2" />

              {/* Stone Pillars / Portico */}
              <line x1="-20" y1="-35" x2="-20" y2="6" stroke="#475569" strokeWidth="2.5" />
              <line x1="20" y1="-35" x2="20" y2="6" stroke="#475569" strokeWidth="2.5" />
              <line x1="-8" y1="-35" x2="-8" y2="6" stroke="#475569" strokeWidth="2" />
              <line x1="8" y1="-35" x2="8" y2="6" stroke="#475569" strokeWidth="2" />

              {/* Sanctum Door with Glowing Warm Deepam Light */}
              <rect x="-7" y="-22" width="14" height="28" rx="7" fill="#F59E0B" />
              <ellipse cx="0" cy="-6" rx="4.5" ry="8" fill="#FFFBEB" filter="drop-shadow(0 0 8px #F59E0B)" />

              {/* Temple Shikhara (Curved Stone Spire Covered in Snow) */}
              <path
                d="M-28,-35 Q-15,-68 0,-78 Q15,-68 28,-35 Z"
                fill="#1E293B"
                stroke="#64748B"
                strokeWidth="1.2"
              />
              {/* Fresh Snow Blanket on Spire Roof */}
              <path
                d="M-28,-35 Q-15,-68 0,-78 Q15,-68 28,-35 Q15,-48 0,-56 Q-15,-48 -28,-35 Z"
                fill="#FFFFFF"
                opacity="0.95"
              />

              {/* Golden Kalasha Spire Peak */}
              <polygon points="0,-86 4,-78 -4,-78" fill="#FDE68A" />
              <circle cx="0" cy="-86" r="2.5" fill="#F59E0B" />

              {/* Golden Trishula (Trident) on the Temple Roof */}
              <line x1="14" y1="-50" x2="14" y2="-72" stroke="#FDE68A" strokeWidth="1.5" />
              <path d="M14,-78 L16,-72 L12,-72 Z" fill="#FDE68A" />
              <path d="M9,-74 C9,-70 12,-69 14,-69" fill="none" stroke="#FDE68A" strokeWidth="1.2" />
              <path d="M19,-74 C19,-70 16,-69 14,-69" fill="none" stroke="#FDE68A" strokeWidth="1.2" />

              {/* Temple Prayer Flags Fluttering in the Mountain Wind */}
              <line x1="-28" y1="-35" x2="-65" y2="-22" stroke="#CBD5E1" strokeWidth="0.8" />
              <polygon points="-36,-32 -44,-30 -40,-25" fill="#EF4444" />
              <polygon points="-46,-29 -54,-27 -50,-22" fill="#F59E0B" />
              <polygon points="-56,-26 -64,-24 -60,-19" fill="#3B82F6" />
            </g>

            {/* Two Travelers Standing Hand in Hand in the Snow (Us) */}
            <g transform="translate(142, 130)">
              {/* Boy Traveler (Thick winter coat & scarf) */}
              <rect x="-8" y="-18" width="8" height="18" rx="3" fill="#1E3A8A" />
              <circle cx="-4" cy="-22" r="3.5" fill="#F8FAFC" />
              <rect x="-7" y="-26" width="6" height="3" rx="1.5" fill="#3B82F6" />

              {/* Girl Traveler (Warm winter jacket & beanie) */}
              <rect x="2" y="-17" width="8" height="17" rx="3" fill="#BE185D" />
              <circle cx="6" cy="-21" r="3.5" fill="#F8FAFC" />
              <circle cx="6" cy="-25" r="2" fill="#FDE68A" />

              {/* Holding Hands in the Snow */}
              <line x1="0" y1="-8" x2="2" y2="-8" stroke="#FDE68A" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </svg>

          {/* Real Falling Snow Canvas Overlay */}
          <canvas
            ref={snowCanvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Top-Right Temple Bell Ring Hint */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(8, 14, 30, 0.78)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(147, 197, 253, 0.4)',
              color: '#FEF3C7',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-sans)',
              zIndex: 15,
            }}
          >
            <Bell size={12} color="#FDE68A" />
            <span>Tap temple to chime bell</span>
          </div>

          {/* Red Passport Rubber Stamp (if stamped) */}
          <AnimatePresence>
            {currentDest.stamped && (
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 0.92, rotate: -14 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '16px',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '2.5px solid #EF4444',
                  color: '#EF4444',
                  fontFamily: 'monospace',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  transform: 'rotate(-14deg)',
                  boxShadow: '0 0 14px rgba(239, 68, 68, 0.45)',
                  userSelect: 'none',
                  zIndex: 20,
                  background: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                APPROVED ✦ NOV 8
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Location Label */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              background: 'rgba(10, 17, 40, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(147, 197, 253, 0.35)',
              color: '#E0F2FE',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Snowflake size={11} color="#93C5FD" />
            <span>{currentDest.location}</span>
          </div>
        </div>

        {/* Destination Information */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              color: 'var(--color-ivory)',
              marginBottom: '0.25rem',
              lineHeight: 1.3,
            }}
          >
            {currentDest.title}
          </h3>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-gold-soft)',
              fontFamily: 'monospace',
              marginBottom: '0.65rem',
            }}
          >
            {currentDest.tagline}
          </div>
          <p
            style={{
              color: 'var(--color-ivory-dim)',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '0.8rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              margin: 0,
            }}
          >
            {currentDest.desc}
          </p>
        </div>

        {/* Carousel & Stamp Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '0.2rem',
          }}
        >
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : destinations.length - 1))}
            style={{
              padding: '0.55rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--color-ivory)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleToggleStamp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-full)',
              background: currentDest.stamped
                ? 'rgba(239, 68, 68, 0.22)'
                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.18) 100%)',
              border: `1.5px solid ${currentDest.stamped ? '#EF4444' : 'rgba(251, 191, 36, 0.55)'}`,
              color: currentDest.stamped ? '#FCA5A5' : '#FDE68A',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <Stamp size={14} />
            <span>{currentDest.stamped ? 'Stamped: Approved ✦' : 'Stamp Bucket List'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % destinations.length)}
            style={{
              padding: '0.55rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--color-ivory)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
